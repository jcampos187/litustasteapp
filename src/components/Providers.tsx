"use client";

import { ClerkProvider } from "@clerk/nextjs";
import type { ReactNode } from "react";
import { CartProvider } from "./CartProvider";
import SessionManager from "./SessionManager";

interface ProvidersProps {
  children: ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ClerkProvider signInUrl="/auth/sign-in" signUpUrl="/auth/sign-up">
      <SessionManager />
      <CartProvider>
        {children}
      </CartProvider>
    </ClerkProvider>
  );
}
