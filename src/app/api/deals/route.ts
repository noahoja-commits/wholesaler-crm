import { DEFAULT_ORG } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { createDealSchema } from "@/lib/schemas";
import { validateBody } from "@/lib/validate";
import type { Prisma } from "@prisma/client";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizeOrgId, sanitizePagination } from "@/lib/sanitize";

// GET /api/deals — list deals
export async function GET(request: NextRequest) {
  // Rate limiting
  const rl = rateLimit(request);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "X-RateLimit-Remaining": "0" } });
  }

  const { searchParams } = new URL(request.url);
  const orgId = sanitizeOrgId(searchParams.get("orgId")) || DEFAULT_ORG;
  const pipelineId = searchParams.get("pipelineId");
  const status = searchParams.get("status");
  const { limit, offset } = sanitizePagination(searchParams.get("limit"), searchParams.get("offset"));

  const where: Prisma.DealWhereInput = { organizationId: orgId };
  if (pipelineId) where.pipelineId = pipelineId;
  if (status) where.status = status as Prisma.DealWhereInput["status"];

  try {
    const [deals, total] = await Promise.all([
      prisma.deal.findMany({
        where,
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
      prisma.deal.count({ where }),
    ]);
    return NextResponse.json({ deals, total, limit, offset }, {
      headers: { "X-RateLimit-Remaining": String(rl.remaining), "Cache-Control": "private, max-age=10" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch deals" }, { status: 500 });
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
  } catch {
    return NextResponse.json({ error: "Failed to create deal" }, { status: 500 });
  }
}
