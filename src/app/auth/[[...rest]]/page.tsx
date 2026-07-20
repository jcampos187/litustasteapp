import { SignIn } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AuthPage() {
  const { userId } = await auth();

  // If already signed in, redirect to home
  if (userId) {
    redirect("/");
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg items-center justify-center px-6 py-16">
      <div className="w-full">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-lt-warm-brown">Iniciar Sesión</h1>
          <p className="mt-1 text-sm text-lt-charcoal/60">
            Inicia sesión para ver tu menú y pedidos
          </p>
          <p className="mt-2 text-sm text-lt-charcoal/40">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/sign-up" className="font-medium text-lt-terracotta hover:underline">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <SignIn
          path="/auth/sign-in"
          routing="path"
          signUpUrl="/auth/sign-up"
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "shadow-none border border-lt-cream-dark rounded-2xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              formButtonPrimary: "bg-lt-terracotta hover:bg-lt-terracotta-dark",
              formFieldInput: "border-lt-cream-dark focus:border-lt-terracotta",
              footerActionLink: "text-lt-terracotta hover:text-lt-terracotta-dark",
            },
          }}
        />
      </div>
    </div>
  );
}
