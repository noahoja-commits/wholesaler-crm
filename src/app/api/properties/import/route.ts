import { DEFAULT_ORG } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST /api/properties/import — bulk import properties from CSV or JSON
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orgId = DEFAULT_ORG, dataSourceId, properties } = body;

    if (!Array.isArray(properties) || properties.length === 0) {
      return NextResponse.json({ error: "No properties to import" }, { status: 400 });
    }

    const results = {
      imported: 0,
      duplicates: 0,
      errors: 0,
      details: [] as Array<{ street: string; status: string; error?: string }>,
    };

    for (const prop of properties) {
      try {
        // Check for duplicate by address
        const existing = await prisma.property.findFirst({
          where: {
            organizationId: orgId,
            street: prop.street,
            zip: prop.zip,
          },
        });

        if (existing) {
          results.duplicates++;
          results.details.push({ street: prop.street, status: "DUPLICATE" });
          continue;
        }

        // Auto-compute MAO: 70% of ARV minus repair cost
        const arv = prop.arv ? parseFloat(prop.arv) : null;
        const repairCost = prop.repairCost ? parseFloat(prop.repairCost) : null;
        const mao = (arv != null && repairCost != null)
          ? arv * 0.7 - repairCost
          : null;

        const created = await prisma.property.create({
          data: {
            organizationId: orgId,
            street: prop.street,
            city: prop.city || "",
            state: prop.state || "",
            zip: prop.zip || "",
            county: prop.county || null,
            propertyType: prop.propertyType || "SINGLE_FAMILY",
            beds: prop.beds != null ? parseInt(prop.beds) : null,
            baths: prop.baths != null ? parseFloat(prop.baths) : null,
            sqft: prop.sqft != null ? parseInt(prop.sqft) : null,
            lotSqft: prop.lotSqft != null ? parseInt(prop.lotSqft) : null,
            yearBuilt: prop.yearBuilt != null ? parseInt(prop.yearBuilt) : null,
            estimatedValue: prop.estimatedValue != null ? parseFloat(prop.estimatedValue) : null,
            arv,
            repairCost,
            mao,
            taxAssessedValue: prop.taxAssessedValue != null ? parseFloat(prop.taxAssessedValue) : null,
            annualTaxes: prop.annualTaxes != null ? parseFloat(prop.annualTaxes) : null,
            lienAmount: prop.lienAmount != null ? parseFloat(prop.lienAmount) : null,
            foreclosureStatus: prop.foreclosureStatus || null,
            lastSaleDate: prop.lastSaleDate ? new Date(prop.lastSaleDate) : null,
            lastSalePrice: prop.lastSalePrice != null ? parseFloat(prop.lastSalePrice) : null,
            notes: prop.notes ?? null,
            status: "NEW_LEAD",
          },
        });

        // Log the import
        if (dataSourceId) {
          await prisma.propertyImportLog.create({
            data: {
              dataSourceId,
              propertyId: created.id,
              status: "SUCCESS",
              rawData: prop,
            },
          });
        }

        results.imported++;
        results.details.push({ street: prop.street, status: "SUCCESS" });
      } catch (error) {
        results.errors++;
        results.details.push({
          street: prop.street || "unknown",
          status: "ERROR",
          error: String(error),
        });
      }
    }

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Import failed", detail: String(error) }, { status: 500 });
  }
}
