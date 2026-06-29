import { DEFAULT_ORG } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeOrgId, sanitizePagination, sanitizeString } from "@/lib/sanitize";

// GET /api/contacts — list all contacts for org
export async function GET(request: NextRequest) {
  // Rate limiting
  const rl = rateLimit(request);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": String(Math.ceil(rl.resetAt / 1000)) } });
  }

  const { searchParams } = new URL(request.url);
  const orgId = sanitizeOrgId(searchParams.get("orgId")) || DEFAULT_ORG;
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const search = sanitizeString(searchParams.get("search"));
  const { limit, offset } = sanitizePagination(searchParams.get("limit"), searchParams.get("offset"));

  const where: Prisma.ContactWhereInput = { organizationId: orgId };
  if (type) where.type = type as Prisma.ContactWhereInput["type"];
  if (status) where.status = status as Prisma.ContactWhereInput["status"];
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
    // Support selective field loading for performance
    const fields = searchParams.get("fields");
    const select = fields
      ? Object.fromEntries(
          fields.split(",").map((f) => [f.trim(), true])
        )
      : undefined;

    const [contacts, total] = await Promise.all([
      prisma.contact.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        select,
      }),
      prisma.contact.count({ where }),
    ]);
    return NextResponse.json({ contacts, total, limit, offset }, {
      headers: { "X-RateLimit-Remaining": String(rl.remaining), "Cache-Control": "private, max-age=10" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

// POST /api/contacts — create a new contact
export async function POST(request: NextRequest) {
  // Rate limiting
  const rl = rateLimit(request);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "X-RateLimit-Remaining": "0" } });
  }

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.firstName || !body.lastName || !body.type) {
      return NextResponse.json({ error: "Missing required fields: firstName, lastName, type" }, { status: 400 });
    }

    const contact = await prisma.contact.create({
      data: {
        organizationId: sanitizeOrgId(body.orgId) || DEFAULT_ORG,
        type: body.type,
        status: body.status || "ACTIVE",
        firstName: sanitizeString(body.firstName) || body.firstName,
        lastName: sanitizeString(body.lastName) || body.lastName,
        email: sanitizeString(body.email) || null,
        phone: sanitizeString(body.phone) || null,
        phone2: sanitizeString(body.phone2) || null,
        city: sanitizeString(body.city) || null,
        state: sanitizeString(body.state) || null,
        street: sanitizeString(body.street) || null,
        notes: sanitizeString(body.notes) || null,
        source: body.source || null,
        tags: body.tags || [],
        zip: sanitizeString(body.zip) || null,
      },
    });
    return NextResponse.json(contact, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
