import { DEFAULT_ORG } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import type { Prisma } from "@prisma/client";

// POST /api/campaigns/:id/execute — add recipients to campaign based on filters
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const orgId = body.organizationId || DEFAULT_ORG;

    const campaign = await prisma.campaign.findFirst({
      where: { id, organizationId: orgId },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Build contact query from target filters
    const filters = (campaign.targetFilters || {}) as Record<string, unknown>;
    const where: Prisma.ContactWhereInput = {
      organizationId: orgId,
      type: "SELLER",
      status: "ACTIVE",
    };

    if (filters.states && Array.isArray(filters.states) && filters.states.length > 0) {
      where.state = { in: filters.states };
    }
    if (filters.foreclosureStatus) {
      // Find contacts that have properties with this foreclosure status
      const matchingProps = await prisma.property.findMany({
        where: {
          organizationId: orgId,
          foreclosureStatus: filters.foreclosureStatus as "PRE_FORECLOSURE" | "AUCTION_SCHEDULED" | "AUCTION_POSTPONED" | "BANK_OWNED" | "SHORT_SALE" | "NONE",
        },
        select: { contactId: true },
      });
      const contactIds = matchingProps
        .map((p) => p.contactId)
        .filter((id): id is string => id !== null);
      if (contactIds.length > 0) {
        where.id = { in: contactIds };
      }
    }

    // Find matching contacts
    const contacts = await prisma.contact.findMany({
      where,
      take: 500,
    });

    // Create recipients in batch with skipDuplicates
    const recipients = contacts.map((contact) => ({
      campaignId: id,
      contactId: contact.id,
    }));

    const result = await prisma.campaignRecipient.createMany({
      data: recipients,
      skipDuplicates: true,
    });

    const added = result.count;

    // Update campaign stats — use increment for cumulative totals
    await prisma.campaign.update({
      where: { id },
      data: {
        status: campaign.status === "DRAFT" ? "IN_PROGRESS" : campaign.status,
        startedAt: campaign.startedAt || new Date(),
      },
    });

    // Atomic increment of totalSent
    await prisma.campaign.update({
      where: { id },
      data: { totalSent: { increment: added } },
    });

    return NextResponse.json({ added, totalContacts: contacts.length });
  } catch (error) {
    return NextResponse.json({ error: "Failed to execute campaign", detail: String(error) }, { status: 500 });
  }
}
