import { NextResponse } from "next/server";

const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

async function getAccessToken(clientId: string, clientSecret: string): Promise<string> {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const { plan, credits, price, isSubscription } = await request.json();

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "PayPal not configured" }, { status: 500 });
    }

    const accessToken = await getAccessToken(clientId, clientSecret);

    const orderPayload = {
      intent: isSubscription ? "SUBSCRIPTION" : "CAPTURE",
      purchase_units: [
        {
          description: `${plan} - ${credits} credits`,
          amount: {
            currency_code: "USD",
            value: price.toFixed(2),
          },
        },
      ],
    };

    if (isSubscription) {
      // Subscription flow
      const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan_id: plan, // In production, use actual PayPal plan ID
          subscriber: { name: { given_name: "Customer" } },
          custom_id: `${plan}_${Date.now()}`,
        }),
      });
      const data = await response.json();
      return NextResponse.json({ subscriptionId: data.id });
    } else {
      // One-time payment flow
      const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderPayload),
      });
      const data = await response.json();
      return NextResponse.json({ orderId: data.id });
    }
  } catch (error) {
    console.error("PayPal API error:", error);
    return NextResponse.json({ error: "PayPal request failed" }, { status: 500 });
  }
}
