import type { Metadata } from "next";
import { Suspense } from "react";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Login",
  description: "Sign in to your ALLTHINGS publisher or advertiser account",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--color-bg)" }} />}>
      <LoginForm />
    </Suspense>
  );
}
