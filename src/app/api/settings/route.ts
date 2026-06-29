import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { DEFAULT_ORG } from "@/lib/constants";

// GET /api/settings — get org settings + pipeline stages
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId") || DEFAULT_ORG;

  try {
    const org = await prisma.organization.findUnique({ where: { id: orgId } });
    const pipeline = await prisma.pipeline.findFirst({
      where: { organizationId: orgId, isDefault: true },
      include: { stages: { orderBy: { order: "asc" } } },
    });

    return NextResponse.json({
      organization: org,
      pipeline: pipeline ? { id: pipeline.id, name: pipeline.name, stages: pipeline.stages } : null,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch settings", detail: String(error) }, { status: 500 });
  }
}

// PATCH /api/settings — update org name or pipeline stages
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const orgId = body.orgId || DEFAULT_ORG;

    // Update org name if provided
    if (body.organizationName) {
      await prisma.organization.update({
        where: { id: orgId },
        data: { name: body.organizationName },
      });
    }

    // Update pipeline stages if provided
    if (body.pipelineId && body.stages && Array.isArray(body.stages)) {
      // Delete all existing stages and recreate
      await prisma.stage.deleteMany({ where: { pipelineId: body.pipelineId } });
      await prisma.stage.createMany({
        data: body.stages.map((s: { name: string; order: number; color: string }, i: number) => ({
          pipelineId: body.pipelineId,
          name: s.name,
          order: s.order ?? i,
          color: s.color || "#6b7280",
        })),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update settings", detail: String(error) }, { status: 500 });
  }
}
