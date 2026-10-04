import type { H3Event } from "h3";
import type { z } from "zod";

export async function validateBody<T extends z.ZodType>(
  event: H3Event,
  schema: T,
): Promise<z.infer<T>> {
  const body = await readBody(event);

  const validationResult = schema.safeParse(body);

  if (!validationResult.success) {
    throw createError({
      statusCode: 400,
      statusMessage: validationResult.error.issues
        .map((issue) => issue.message)
        .join(". "),
      data: {
        issues: validationResult.error.issues,
      },
    });
  }

  return validationResult.data;
}
