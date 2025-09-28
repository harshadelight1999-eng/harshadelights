import { CreditCard } from "@medusajs/icons"
import React from "react"

export const isManual = (providerId?: string) => {
  return providerId === "manual"
}

export const isStripe = (providerId?: string) => {
  return providerId === "stripe" || providerId === "stripe_test"
}

export const paymentInfoMap: Record<string, { title: string; icon: React.JSX.Element }> = {
  stripe: {
    title: "Credit card",
    icon: React.createElement(CreditCard),
  },
  manual: {
    title: "Test payment",
    icon: React.createElement(CreditCard),
  },
}

export const MEDUSA_BACKEND_URL = process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || "http://localhost:9000"
export const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"