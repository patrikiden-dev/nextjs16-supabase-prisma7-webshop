"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signUpSchema } from "@/lib/validation/user";

export default function SignupPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(
        event: React.FormEvent<HTMLFormElement>
    ) {
        event.preventDefault();

        setError("");

        const validation = signUpSchema.safeParse({
            name,
            email,
            password,
        });

        if (!validation.success) {
            setError(
                validation.error.issues[0]?.message ??
                "Invalid form data."
            );
            return;
        }

        setLoading(true);

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(validation.data),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.error ?? "Unable to create account."
                );
            }

            router.push("/login");
        } catch (error) {
            setError(
                error instanceof Error
                    ? error.message
                    : "Something went wrong."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="flex min-h-screen items-center justify-center">
            <form
                onSubmit={handleSubmit}
                className="flex w-full max-w-md flex-col gap-4 border p-6"
            >
                <h1 className="text-2xl font-bold">
                    Create account
                </h1>

                <input
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(event) =>
                        setName(event.target.value)
                    }
                    className="border px-3 py-2"
                />

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(event) =>
                        setEmail(event.target.value)
                    }
                    className="border px-3 py-2"
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(event) =>
                        setPassword(event.target.value)
                    }
                    className="border px-3 py-2"
                />

                {error && (
                    <p className="text-sm text-red-600">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                    {loading ? "Creating account..." : "Sign up"}
                </button>
            </form>
        </main>
    );
}