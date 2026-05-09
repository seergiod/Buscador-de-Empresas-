import { createFileRoute } from "@tanstack/react-router";
import { AuthForm } from "@/components/auth-form";

export const Route = createFileRoute("/registro")({
  component: () => <AuthForm mode="signup" />,
  head: () => ({ meta: [{ title: "Crear cuenta · LeadMapper" }] }),
});