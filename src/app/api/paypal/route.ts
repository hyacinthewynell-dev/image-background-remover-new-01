import { NextResponse } from "next/server";

const PAYPAL_API_BASE = process.env.NODE_ENV === "production" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

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
  
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to get access token: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const { plan, credits, price, isSubscription } = await request.json();

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error("PayPal credentials not configured");
      return NextResponse.json({ error: "PayPal not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to environment variables." }, { status: 500 });
    }

    const accessToken = await getAccessToken(clientId, clientSecret);

    if (isSubscription) {
      // For subscriptions, we need a billing plan first
      return NextResponse.json({ error: "Subscription not fully implemented yet. Please use one-time purchase." }, { status: 400 });
    }

    // One-time payment
    const orderPayload = {
      intent: "CAPTURE",
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

    console.log("Creating PayPal order:", JSON.stringify(orderPayload));

    const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(orderPayload),
    });

    const data = await response.json();
    
    console.log("PayPal response:", JSON.stringify(data));

    if (!response.ok) {
      throw new Error(data.message || data.error || "PayPal request failed");
    }

    return NextResponse.json({ orderId: data.id });
  } catch (error: any) {
    console.error("PayPal API error:", error);
    return NextResponse.json({ error: error.message || "PayPal request failed" }, { status: 500 });
  }
}
