import { redirect } from "next/navigation";
import { auth } from "@/auth";

// Guard server-side (defesa em profundidade, além do middleware).
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login?next=/dashboard");
  return <>{children}</>;
}
