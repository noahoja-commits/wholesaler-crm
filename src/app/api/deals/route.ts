import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { parsePagination } from "@/lib/utils";
import { validateBody } from "@/lib/validate";
import { createDealSchema } from "@/lib/schemas";

// GET /api/deals — list deals
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId") || "default";
  const pipelineId = searchParams.get("pipelineId");
  const status = searchParams.get("status");
  const { limit, offset } = parsePagination(
    searchParams.get("limit"),
    searchParams.get("offset")
  );

  const where: Record<string, unknown> = { organizationId: orgId };
  if (pipelineId) where.pipelineId = pipelineId;
  if (status) where.status = status;

  try {
    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where: where as any,
        skip: offset,
        take: limit,
        orderBy: { updatedAt: "desc" },
        include: {
          property: true,
          seller: true,
          buyer: true,
          pipeline: { include: { stages: { orderBy: { order: "asc" } } } },
        },
      }),
      prisma.deal.count({ where: where as any }),
    ]);
    return NextResponse.json({ deals, total, limit, offset });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch deals", detail: String(error) }, { status: 500 });
  }
}

// POST /api/deals — create a deal
export async function POST(request: NextRequest) {
  try {
    const body = await validateBody(request, createDealSchema);
    if (body instanceof NextResponse) return body;

    const deal = await prisma.deal.create({
      data: {
        organizationId: body.organizationId,
        pipelineId: body.pipelineId,
        propertyId: body.propertyId,
        sellerId: body.sellerId,
        buyerId: body.buyerId ?? null,
        title: body.title,
        currentStage: body.currentStage,
        dealType: body.dealType,
        priority: body.priority,
        offerPrice: body.offerPrice ?? null,
        contractPrice: body.contractPrice ?? null,
        assignmentFee: body.assignmentFee ?? null,
        emd: body.emd ?? null,
        closingDate: body.closingDate ? new Date(body.closingDate) : null,
        notes: body.notes ?? null,
      },
      include: {
        property: true,
        seller: true,
        buyer: true,
        pipeline: { include: { stages: { orderBy: { order: "asc" } } } },
      },
    });
    return NextResponse.json(deal, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create deal", detail: String(error) }, { status: 500 });
  }
}
