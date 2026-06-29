import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// PATCH /api/properties/[id] — update property
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const property = await prisma.property.update({
      where: { id },
      data: {
        street: body.street, city: body.city, state: body.state, zip: body.zip,
        county: body.county ?? null,
        beds: body.beds ?? null, baths: body.baths ?? null, sqft: body.sqft ?? null,
        lotSqft: body.lotSqft ?? null, yearBuilt: body.yearBuilt ?? null,
        arv: body.arv ?? null, repairCost: body.repairCost ?? null,
        estimatedValue: body.estimatedValue ?? null, mao: body.mao ?? null,
        taxAssessedValue: body.taxAssessedValue ?? null,
        annualTaxes: body.annualTaxes ?? null, lienAmount: body.lienAmount ?? null,
        lastSaleDate: body.lastSaleDate ? new Date(body.lastSaleDate) : null,
        lastSalePrice: body.lastSalePrice ?? null,
        status: body.status, propertyType: body.propertyType,
        foreclosureStatus: body.foreclosureStatus ?? null, notes: body.notes ?? null,
        latitude: body.latitude ?? null, longitude: body.longitude ?? null,
      },
    });
    return NextResponse.json(property);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update property", detail: String(error) }, { status: 500 });
  }
}

// DELETE /api/properties/[id] — delete property
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.property.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete property", detail: String(error) }, { status: 500 });
  }
}
