import { DEFAULT_ORG } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/campaigns — list campaigns
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId") || DEFAULT_ORG;

  try {
    const campaigns = await prisma.campaign.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ campaigns });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch campaigns", detail: String(error) }, { status: 500 });
  }
}

// POST /api/campaigns — create a campaign
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const campaign = await prisma.campaign.create({
      data: {
        organizationId: body.organizationId || DEFAULT_ORG,
        name: body.name,
        type: body.type || "DIRECT_MAIL",
        status: body.status || "DRAFT",
        targetFilters: body.targetFilters || null,
        subjectLine: body.subjectLine || null,
        bodyTemplate: body.bodyTemplate || null,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create campaign", detail: String(error) }, { status: 500 });
  }
}
