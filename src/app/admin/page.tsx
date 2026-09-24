import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { LogoutButton } from "@/components/auth/logout-button";

export default async function AdminPage() {
    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session) {
        redirect("/login");
    }

    if (session.user.role !== "ADMIN") {
        redirect("/dashboard");
    }

    return (
        <main className="flex min-h-screen items-center justify-center p-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold">
                    Admin
                </h1>

                <p className="mt-4">
                    You are logged in as an administrator.
                </p>

                <p className="mt-2">
                    User: {session.user.email}
                </p>

                <div className="mt-6">
                    <LogoutButton />
                </div>
            </div>
        </main>
    );
}