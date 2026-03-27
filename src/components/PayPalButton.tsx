"use client";

import { useState } from "react";
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  plan: {
    name: string;
    credits: number;
    price: number;
    isSubscription: boolean;
  };
  onSuccess: (orderId: string) => void;
  onError: (error: string) => void;
  getText: (zh: string, en: string) => string;
  lang: string;
}

export default function PayPalButton({ plan, onSuccess, onError, getText, lang }: PayPalButtonProps) {
  const [error, setError] = useState<string>("");

  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "YOUR_PAYPAL_CLIENT_ID";

  const createOrder = async () => {
    try {
      const response = await fetch("/api/paypal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: plan.name,
          credits: plan.credits,
          price: plan.price,
          isSubscription: plan.isSubscription,
        }),
      });
      const data = await response.json();
      if (data.orderId) {
        return data.orderId;
      } else if (data.subscriptionId) {
        return data.subscriptionId;
      } else {
        throw new Error(data.error || "Failed to create order");
      }
    } catch (err: any) {
      setError(err.message);
      onError(err.message);
      throw err;
    }
  };

  const onApprove = async (data: any) => {
    // For one-time payment
    if (data.orderID) {
      onSuccess(data.orderID);
    }
    // For subscription
    if (data.subscriptionID) {
      onSuccess(data.subscriptionID);
    }
  };

  return (
    <PayPalScriptProvider options={{ 
      clientId: clientId,
      currency: "USD",
    }}>
      <div className="mt-4">
        <PayPalButtons
          style={{
            layout: "vertical",
            color: "blue",
            shape: "rect",
            label: plan.isSubscription ? "subscribe" : "pay",
          }}
          createOrder={createOrder}
          onApprove={onApprove}
          onError={(err) => {
            setError("Payment failed. Please try again.");
            onError(err.toString());
          }}
        />
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>
    </PayPalScriptProvider>
  );
}
