import { z } from "zod";

export const MAX_IMAGE_SIZE =
    10 * 1024 * 1024; // 10 MB

export const productImageFileSchema = z
    .instanceof(File, {
        message: "A valid file is required.",
    })
    .refine(
        (file) => file.size > 0,
        {
            message: "Image cannot be empty.",
        }
    )
    .refine(
        (file) => file.size <= MAX_IMAGE_SIZE,
        {
            message:
                "Image cannot be larger than 10 MB.",
        }
    )
    .refine(
        (file) => file.type === "image/webp",
        {
            message:
                "Image must be in WebP format.",
        }
    );