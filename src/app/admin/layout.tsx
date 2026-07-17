import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/auth/sign-in");

  const user = await currentUser();
  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.clerkId, userId))
    .limit(1);

  // Only admin role can access dashboard
  if (!dbUser || dbUser.role !== "admin") {
    redirect("/");
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)]">
      <AdminSidebar
        userName={user?.firstName || dbUser.name || dbUser.email}
        userEmail={dbUser.email}
      />
      <div className="flex-1 overflow-auto bg-lt-cream/50">
        <div className="mx-auto max-w-6xl px-6 py-8">
          {children}
        </div>
      </div>
    </div>
  );
}
