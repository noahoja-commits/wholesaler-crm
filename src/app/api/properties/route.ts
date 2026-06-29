import { DEFAULT_ORG } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { parsePagination } from "@/lib/utils";
import { validateBody } from "@/lib/validate";
import { createPropertySchema } from "@/lib/schemas";

// GET /api/properties — list all properties for org
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId") || DEFAULT_ORG;
  const status = searchParams.get("status");
  const search = searchParams.get("search");
  const { limit, offset } = parsePagination(
    searchParams.get("limit"),
    searchParams.get("offset")
  );

  const where: Record<string, unknown> = { organizationId: orgId };
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { street: { contains: search, mode: "insensitive" } },
      { city: { contains: search, mode: "insensitive" } },
      { zip: { contains: search } },
    ];
  }

  try {
    const [properties, total] = await Promise.all([
      prisma.property.findMany({
        where: where as any,
        skip: offset,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { contact: true },
      }),
      prisma.property.count({ where: where as any }),
    ]);
    return NextResponse.json({ properties, total, limit, offset });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch properties", detail: String(error) }, { status: 500 });
  }
}

// POST /api/properties — create a new property (lead)
export async function POST(request: NextRequest) {
  try {
    const body = await validateBody(request, createPropertySchema);
    if (body instanceof NextResponse) return body;

    const property = await prisma.property.create({
      data: {
        organizationId: body.organizationId,
        contactId: body.contactId ?? null,
        street: body.street,
        city: body.city,
        state: body.state,
        zip: body.zip,
        county: body.county ?? null,
        propertyType: body.propertyType,
        beds: body.beds ?? null,
        baths: body.baths ?? null,
        sqft: body.sqft ?? null,
        lotSqft: body.lotSqft ?? null,
        yearBuilt: body.yearBuilt ?? null,
        estimatedValue: body.estimatedValue ?? null,
        arv: body.arv ?? null,
        repairCost: body.repairCost ?? null,
        mao: body.mao ?? null,
        foreclosureStatus: body.foreclosureStatus ?? null,
        notes: body.notes ?? null,
        status: body.status,
      },
      include: { contact: true },
    });
    return NextResponse.json(property, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create property", detail: String(error) }, { status: 500 });
  }
}
