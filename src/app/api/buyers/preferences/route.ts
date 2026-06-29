import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST /api/buyers/preferences — create/update buyer preferences
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const preference = await prisma.buyerPreference.upsert({
      where: { contactId: body.contactId },
      create: {
        contactId: body.contactId,
        states: body.states || [],
        counties: body.counties || [],
        cities: body.cities || [],
        zipCodes: body.zipCodes || [],
        minBeds: body.minBeds ?? null,
        maxBeds: body.maxBeds ?? null,
        minBaths: body.minBaths ?? null,
        maxBaths: body.maxBaths ?? null,
        minSqft: body.minSqft ?? null,
        maxSqft: body.maxSqft ?? null,
        propertyTypes: body.propertyTypes || [],
        minPrice: body.minPrice ?? null,
        maxPrice: body.maxPrice ?? null,
        maxArv: body.maxArv ?? null,
        minEquityPercent: body.minEquityPercent ?? null,
        dealTypes: body.dealTypes || ["WHOLESALE"],
        acceptsMultiFamily: body.acceptsMultiFamily ?? false,
        maxRepairCost: body.maxRepairCost ?? null,
        notes: body.notes ?? null,
      },
      update: {
        states: body.states || [],
        counties: body.counties || [],
        cities: body.cities || [],
        zipCodes: body.zipCodes || [],
        minBeds: body.minBeds ?? null,
        maxBeds: body.maxBeds ?? null,
        minBaths: body.minBaths ?? null,
        maxBaths: body.maxBaths ?? null,
        minSqft: body.minSqft ?? null,
        maxSqft: body.maxSqft ?? null,
        propertyTypes: body.propertyTypes || [],
        minPrice: body.minPrice ?? null,
        maxPrice: body.maxPrice ?? null,
        maxArv: body.maxArv ?? null,
        minEquityPercent: body.minEquityPercent ?? null,
        dealTypes: body.dealTypes || ["WHOLESALE"],
        acceptsMultiFamily: body.acceptsMultiFamily ?? false,
        maxRepairCost: body.maxRepairCost ?? null,
        notes: body.notes ?? null,
      },
    });

    return NextResponse.json(preference);
  } catch (error) {
    return NextResponse.json({ error: "Failed to save preferences", detail: String(error) }, { status: 500 });
  }
}
