import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { parsePagination } from "@/lib/utils";
import { validateBody } from "@/lib/validate";
import { createContactSchema } from "@/lib/schemas";

// GET /api/contacts — list all contacts for org
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId") || "default";
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const { limit, offset } = parsePagination(
    searchParams.get("limit"),
    searchParams.get("offset")
  );

  const where: Record<string, unknown> = { organizationId: orgId };
  if (type) where.type = type;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: "insensitive" } },
      { lastName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
      { phone: { contains: search } },
      { street: { contains: search, mode: "insensitive" } },
    ];
  }

  try {
    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({ where: where as any, skip: offset, take: limit, orderBy: { createdAt: "desc" } }),
      prisma.contact.count({ where: where as any }),
    ]);
    return NextResponse.json({ contacts, total, limit, offset });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contacts", detail: String(error) }, { status: 500 });
  }
}

// POST /api/contacts — create a new contact
export async function POST(request: NextRequest) {
  try {
    const body = await validateBody(request, createContactSchema);
    if (body instanceof NextResponse) return body;

    const contact = await prisma.contact.create({
      data: {
        organizationId: body.organizationId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email ?? null,
        phone: body.phone ?? null,
        phone2: body.phone2 ?? null,
        type: body.type,
        status: body.status,
        source: body.source ?? null,
        tags: body.tags,
        notes: body.notes ?? null,
        street: body.street ?? null,
        city: body.city ?? null,
        state: body.state ?? null,
        zip: body.zip ?? null,
      },
    });
    return NextResponse.json(contact, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create contact", detail: String(error) }, { status: 500 });
  }
}
