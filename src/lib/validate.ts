import { NextResponse } from "next/server";
import { ZodSchema, ZodError } from "zod";

/**
 * Parse and validate a JSON request body using a Zod schema.
 * Returns the parsed data or a 400 error response.
 */
export async function validateBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T | ReturnType<typeof NextResponse.json>> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Validation failed",
          issues: error.issues.map((i) => ({
            path: i.path.join("."),
            message: i.message,
          })),
        },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }
}
