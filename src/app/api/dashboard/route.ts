import { DEFAULT_ORG } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/dashboard — aggregate stats for the org
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId") || DEFAULT_ORG;

  try {
    const now = new Date();
    const firstOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
      totalLeads,
      activeDeals,
      pipelineValue,
      closedThisMonth,
      lastMonthLeads,
      wonDeals,
    ] = await Promise.all([
      // Total leads (properties)
      prisma.property.count({ where: { organizationId: orgId } }),

      // Active deals
      prisma.deal.count({ where: { organizationId: orgId, status: "ACTIVE" } }),

      // Pipeline value (sum of contractPrice for active deals)
      prisma.deal.aggregate({
        where: { organizationId: orgId, status: "ACTIVE", contractPrice: { not: null } },
        _sum: { contractPrice: true },
      }),

      // Closed this month
      prisma.deal.count({
        where: {
          organizationId: orgId,
          status: "WON",
          updatedAt: { gte: firstOfMonth },
        },
      }),

      // Last month leads
      prisma.property.count({
        where: {
          organizationId: orgId,
          createdAt: { gte: firstOfLastMonth, lt: firstOfMonth },
        },
      }),

      // Total won deals (for conversion rate)
      prisma.deal.count({ where: { organizationId: orgId, status: "WON" } }),
    ]);

    const thisMonthLeads = await prisma.property.count({
      where: { organizationId: orgId, createdAt: { gte: firstOfMonth } },
    });

    const leadGrowth = lastMonthLeads > 0
      ? ((thisMonthLeads - lastMonthLeads) / lastMonthLeads)
      : thisMonthLeads > 0 ? 1 : 0;

    const conversionRate = totalLeads > 0 ? wonDeals / totalLeads : 0;

    // Pipeline stage breakdown.
    // Fetch the active deals (only the columns we need) and the org's pipeline
    // stages once, in parallel. This avoids re-joining the full pipeline + all
    // stages onto every deal row and over-fetching every deal column.
    const [deals, pipelines] = await Promise.all([
      prisma.deal.findMany({
        where: { organizationId: orgId, status: "ACTIVE" },
        select: { currentStage: true, contractPrice: true, offerPrice: true, pipelineId: true },
      }),
      prisma.pipeline.findMany({
        where: { organizationId: orgId },
        select: { id: true, stages: { select: { name: true, color: true } } },
      }),
    ]);

    // Map "<pipelineId>::<stageName>" -> color, so each deal resolves its colour
    // against its own pipeline exactly as before.
    const colorByPipelineStage = new Map<string, string>();
    for (const p of pipelines) {
      for (const s of p.stages) {
        colorByPipelineStage.set(`${p.id}::${s.name}`, s.color);
      }
    }

    const stageMap = new Map<string, { count: number; value: number; color: string }>();
    for (const deal of deals) {
      const color = colorByPipelineStage.get(`${deal.pipelineId}::${deal.currentStage}`) || "#6b7280";
      const entry = stageMap.get(deal.currentStage) || {
        count: 0, value: 0, color,
      };
      entry.count++;
      entry.value += Number(deal.contractPrice || deal.offerPrice || 0);
      stageMap.set(deal.currentStage, entry);
    }

    const pipelineStats = Array.from(stageMap.entries()).map(([stageName, data]) => ({
      stageName,
      ...data,
    }));

    const totalValue = pipelineValue._sum.contractPrice
      ? Number(pipelineValue._sum.contractPrice)
      : 0;

    const avgDealSize = activeDeals > 0 ? totalValue / activeDeals : 0;

    return NextResponse.json({
      totalLeads,
      activeDeals,
      pipelineValue: totalValue,
      closedThisMonth,
      conversionRate,
      avgDealSize,
      leadGrowth,
      pipelineStats,
    }, {
      headers: {
        "Cache-Control": "private, max-age=30, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch dashboard data", detail: String(error) }, { status: 500 });
  }
}
