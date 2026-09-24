import argon2 from "argon2";

import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validation/user";

export const runtime = "nodejs";

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const validation = signUpSchema.safeParse(body);

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

        const {
            name,
            email,
            password,
        } = validation.data;

        const existingUser =
            await prisma.user.findUnique({
                where: {
                    email,
                },
            });

        if (existingUser) {
            return Response.json(
                {
                    error: "An account with this email already exists.",
                },
                { status: 409 }
            );
        }

        const passwordHash =
            await argon2.hash(password, {
                type: argon2.argon2id,
            });

        const user = await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                role: "USER",
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
            },
        });

        return Response.json(
            {
                user,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("Signup error:", error);

        return Response.json(
            {
                error: "Unable to create account.",
            },
            { status: 500 }
        );
    }
}