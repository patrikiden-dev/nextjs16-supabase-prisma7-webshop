import argon2 from "argon2";

import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validation/user";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validation = loginSchema.safeParse(body);

        if (!validation.success) {
            return Response.json(
                {
                    error:
                        validation.error.issues[0]?.message ??
                        "Invalid input.",
                },
                { status: 400 }
            );
        }

        const { email, password } =
            validation.data;

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return Response.json(
                {
                    error: "Invalid email or password.",
                },
                { status: 401 }
            );
        }

        const passwordValid =
            await argon2.verify(
                user.passwordHash,
                password
            );

        if (!passwordValid) {
            return Response.json(
                {
                    error: "Invalid email or password.",
                },
                { status: 401 }
            );
        }

        return Response.json({
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error("Login error:", error);

        return Response.json(
            {
                error: "Unable to login.",
            },
            { status: 500 }
        );
    }
}