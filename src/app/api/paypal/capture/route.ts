import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function getAccessToken(clientId: string, clientSecret: string) {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: "grant_type=client_credentials",
  });
  const data = await response.json();
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const { orderId, planId, credits, isSubscription, userId } = await request.json();

    // Verify PayPal payment
    const clientId = process.env.PAYPAL_CLIENT_ID!;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
    const accessToken = await getAccessToken(clientId, clientSecret);

    // Capture the order
    const captureResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${orderId}/capture`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!captureResponse.ok) {
      return NextResponse.json({ error: "Payment capture failed" }, { status: 400 });
    }

    // Find user by email
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("*")
      .eq("email", userId)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Add credits
    const newCredits = user.credits + credits;
    const { error: updateError } = await supabase
      .from("users")
      .update({ credits: newCredits })
      .eq("id", user.id);

    if (updateError) {
      return NextResponse.json({ error: "Failed to add credits" }, { status: 500 });
    }

    // Record transaction
    await supabase.from("transactions").insert({
      user_id: user.id,
      type: isSubscription ? "subscription" : "purchase",
      credits_delta: credits,
      credits_remaining: newCredits,
      description: `${planId} - ${credits} credits`,
    });

    return NextResponse.json({ success: true, newCredits });
  } catch (error) {
    console.error("Capture error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
