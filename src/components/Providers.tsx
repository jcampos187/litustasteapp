"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { CartProvider } from "./CartProvider";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider signInUrl="/auth/sign-in" signUpUrl="/auth/sign-up">
      <CartProvider>
        {children}
      </CartProvider>
    </ClerkProvider>
  );
}
