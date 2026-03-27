"use client";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Get or create user with credits
export async function getUser(userId: string, email: string, name?: string | null, avatarUrl?: string | null) {
  // Try to get existing user
  const { data: existingUser } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (existingUser) {
    return existingUser;
  }

  // Create new user with 3 signup credits
  const { data: newUser, error } = await supabase
    .from("users")
    .insert({
      id: userId,
      email,
      name: name || null,
      avatar_url: avatarUrl || null,
      credits: 3,
    })
    .select()
    .single();

  if (error && error.code !== "23505") { // Ignore duplicate key error
    console.error("Error creating user:", error);
    return null;
  }

  // Record signup gift transaction
  if (newUser) {
    await supabase.from("transactions").insert({
      user_id: userId,
      type: "signup_gift",
      credits_delta: 3,
      credits_remaining: 3,
      description: "Sign up bonus - 3 free credits",
    });
  }

  return newUser || { id: userId, email, credits: 3 };
}

// Deduct credit for usage
export async function deductCredit(userId: string) {
  const { data: user } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (!user || user.credits <= 0) {
    return { success: false, message: "No credits remaining" };
  }

  const newCredits = user.credits - 1;

  const { error } = await supabase
    .from("users")
    .update({ credits: newCredits, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) {
    return { success: false, message: error.message };
  }

  // Record usage transaction
  await supabase.from("transactions").insert({
    user_id: userId,
    type: "usage",
    credits_delta: -1,
    credits_remaining: newCredits,
    description: "Image processing",
  });

  return { success: true, credits_remaining: newCredits };
}

// Get user credits
export async function getUserCredits(userId: string) {
  const { data: user } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  return user?.credits || 0;
}

// Get transaction history
export async function getTransactions(userId: string) {
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return data || [];
}

// Get plans
export async function getPlans() {
  const { data } = await supabase
    .from("plans")
    .select("*")
    .order("price_usd", { ascending: true });

  return data || [];
}

// Add credits after purchase
export async function addCredits(userId: string, credits: number, planName: string) {
  const { data: user } = await supabase
    .from("users")
    .select("credits")
    .eq("id", userId)
    .single();

  if (!user) return null;

  const newCredits = user.credits + credits;

  await supabase
    .from("users")
    .update({ credits: newCredits, updated_at: new Date().toISOString() })
    .eq("id", userId);

  await supabase.from("transactions").insert({
    user_id: userId,
    type: "purchase",
    credits_delta: credits,
    credits_remaining: newCredits,
    description: `Purchased ${planName} - ${credits} credits`,
  });

  return newCredits;
}
