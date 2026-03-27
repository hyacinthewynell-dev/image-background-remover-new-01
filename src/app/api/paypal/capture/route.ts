import { NextResponse } from "next/server";

const PAYPAL_API_BASE = "https://api-m.sandbox.paypal.com";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function POST(request: Request) {
  try {
    const { orderId, planId, credits, isSubscription, userId } = await request.json();

    console.log("Capture request:", { orderId, planId, credits, userId });

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    const clientId = process.env.PAYPAL_CLIENT_ID;
    const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      return NextResponse.json({ error: "PayPal not configured" }, { status: 500 });
    }

    // Get access token
    const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    const tokenResponse = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: { "Authorization": `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: "grant_type=client_credentials",
    });
    const tokenData = await tokenResponse.json();
    
    if (!tokenResponse.ok) {
      return NextResponse.json({ error: "Failed to get PayPal token" }, { status: 500 });
    }

    const accessToken = tokenData.access_token;

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

    // Add credits to user
    if (supabaseUrl && supabaseKey) {
      const { createClient } = await import("@supabase/supabase-js");
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("email", userId)
        .single();

      if (userError || !user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
      }

      const newCredits = (user.credits || 0) + credits;
      await supabase
        .from("users")
        .update({ credits: newCredits })
        .eq("id", user.id);

      await supabase.from("transactions").insert({
        user_id: user.id,
        type: isSubscription ? "subscription" : "purchase",
        credits_delta: credits,
        credits_remaining: newCredits,
        description: `${planId} - ${credits} credits`,
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Capture error:", error);
    return NextResponse.json({ error: error.message || "Internal error" }, { status: 500 });
  }
}
