import type { Metadata } from "next";
import { Suspense } from "react";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create Account",
  description: "Join ALLTHINGS as a publisher to earn with ads, or as an advertiser to launch campaigns.",
};

export default function RegisterPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "var(--color-bg)" }} />}>
      <RegisterForm />
    </Suspense>
  );
}
