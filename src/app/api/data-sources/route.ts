import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/data-sources — list data sources
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId") || "default";

  try {
    const sources = await prisma.dataSource.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ sources });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch data sources", detail: String(error) }, { status: 500 });
  }
}

// POST /api/data-sources — create a data source
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const source = await prisma.dataSource.create({
      data: {
        organizationId: body.organizationId || "default",
        name: body.name,
        type: body.type || "CSV_IMPORT",
        config: body.config || {},
        enabled: body.enabled ?? true,
      },
    });
    return NextResponse.json(source, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create data source", detail: String(error) }, { status: 500 });
  }
}
