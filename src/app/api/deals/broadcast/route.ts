import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// POST /api/deals/broadcast — match a deal to eligible buyers
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { dealId, orgId = "default" } = body;

    // Get the deal with property
    const deal = await prisma.deal.findFirst({
      where: { id: dealId, organizationId: orgId },
      include: { property: true },
    });

    if (!deal || !deal.property) {
      return NextResponse.json({ error: "Deal or property not found" }, { status: 404 });
    }

    const property = deal.property;

    // Find all active buyers with preferences
    const buyers = await prisma.contact.findMany({
      where: { organizationId: orgId, type: "BUYER", status: "ACTIVE" },
      include: { buyerPreferences: true },
    });

    // Match each buyer against the property
    const matches = buyers.map((buyer) => {
      const pref = buyer.buyerPreferences?.[0];
      if (!pref) return { buyer, score: 0, reasons: ["No preferences set"] };

      let score = 0;
      const reasons: string[] = [];

      // State match
      if (pref.states.length > 0) {
        if (pref.states.includes(property.state)) {
          score += 15;
          reasons.push(`State: ${property.state} ✓`);
        } else {
          return { buyer, score: 0, reasons: [`State ${property.state} not in buyer's list`] };
        }
      }

      // City match
      if (pref.cities.length > 0 && pref.cities.some((c: string) => property.city.toLowerCase().includes(c.toLowerCase()))) {
        score += 10;
        reasons.push(`City: ${property.city} ✓`);
      }

      // Zip match
      if (pref.zipCodes.length > 0 && pref.zipCodes.includes(property.zip)) {
        score += 10;
        reasons.push(`ZIP: ${property.zip} ✓`);
      }

      // Beds
      if (property.beds) {
        if (pref.minBeds && property.beds < pref.minBeds) {
          return { buyer, score: 0, reasons: [`Beds ${property.beds} < min ${pref.minBeds}`] };
        }
        if (pref.maxBeds && property.beds > pref.maxBeds) {
          return { buyer, score: 0, reasons: [`Beds ${property.beds} > max ${pref.maxBeds}`] };
        }
        score += 10;
        reasons.push(`Beds: ${property.beds} ✓`);
      }

      // Baths
      if (property.baths) {
        if (pref.minBaths && property.baths < pref.minBaths) {
          return { buyer, score: 0, reasons: [`Baths ${property.baths} < min ${pref.minBaths}`] };
        }
        if (pref.maxBaths && property.baths > pref.maxBaths) {
          return { buyer, score: 0, reasons: [`Baths ${property.baths} > max ${pref.maxBaths}`] };
        }
        score += 5;
        reasons.push(`Baths: ${property.baths} ✓`);
      }

      // Sqft
      if (property.sqft) {
        if (pref.minSqft && property.sqft < pref.minSqft) {
          return { buyer, score: 0, reasons: [`Sqft ${property.sqft} < min ${pref.minSqft}`] };
        }
        if (pref.maxSqft && property.sqft > pref.maxSqft) {
          return { buyer, score: 0, reasons: [`Sqft ${property.sqft} > max ${pref.maxSqft}`] };
        }
        score += 5;
        reasons.push(`Sqft: ${property.sqft} ✓`);
      }

      // Property type
      if (pref.propertyTypes.length > 0) {
        if (pref.propertyTypes.includes(property.propertyType)) {
          score += 10;
          reasons.push(`Type: ${property.propertyType} ✓`);
        }
      }

      // ARV range
      if (property.arv) {
        if (pref.maxArv && property.arv > pref.maxArv) {
          return { buyer, score: 0, reasons: [`ARV ${property.arv} > max ${pref.maxArv}`] };
        }
        score += 5;
        reasons.push(`ARV: $${property.arv.toLocaleString()} ✓`);
      }

      // Price range (use MAO or offer price)
      const dealPrice = Number(property.mao ?? deal.offerPrice ?? deal.contractPrice ?? 0);
      if (dealPrice > 0) {
        if (pref.minPrice && dealPrice < Number(pref.minPrice)) {
          return { buyer, score: 0, reasons: [`Price ${dealPrice} < min ${pref.minPrice}`] };
        }
        if (pref.maxPrice && dealPrice > Number(pref.maxPrice)) {
          return { buyer, score: 0, reasons: [`Price ${dealPrice} > max ${pref.maxPrice}`] };
        }
        score += 10;
        reasons.push(`Price: $${dealPrice.toLocaleString()} ✓`);
      }

      // Repair cost — only enforce when buyer has an explicit max
      if (
        pref.maxRepairCost != null &&
        property.repairCost != null &&
        Number(property.repairCost) > Number(pref.maxRepairCost)
      ) {
        return { buyer, score: 0, reasons: [`Repair cost ${property.repairCost} > max ${pref.maxRepairCost}`] };
      }

      return { buyer, score, reasons };
    });

    // Sort by score descending, filter out 0-score
    const eligible = matches
      .filter((m) => m.score > 0)
      .sort((a, b) => b.score - a.score);

    return NextResponse.json({
      deal: { id: deal.id, title: deal.title, property },
      totalBuyers: buyers.length,
      eligibleBuyers: eligible.length,
      matches: eligible,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to broadcast deal", detail: String(error) }, { status: 500 });
  }
}
