import type { Metadata } from "next";
import { Suspense } from "react";
import Image from "next/image";
import Card from "@/components/ui/Card";
import AuthForm from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "VictoryHub | Cadastrar",
};

export default function Cadastro() {
  return (
    <section className="flex min-h-[70vh] items-center justify-center bg-dark px-5 py-16">
      <Card className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <Image src="/logo.png" alt="VictoryHub" width={48} height={48} className="mb-3" />
          <h1 className="font-display text-3xl tracking-wide">CRIE SUA CONTA</h1>
          <p className="mt-1 text-sm text-muted">
            Cadastre-se grátis, vincule sua Steam e comece a competir.
          </p>
        </div>
        <Suspense>
          <AuthForm mode="signup" />
        </Suspense>
      </Card>
    </section>
  );
}
