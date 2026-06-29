import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/buyers — list buyers (contacts with type=BUYER) and their preferences
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const orgId = searchParams.get("orgId") || "default";

  try {
    const buyers = await prisma.contact.findMany({
      where: { organizationId: orgId, type: "BUYER", status: "ACTIVE" },
      include: { buyerPreferences: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ buyers });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch buyers", detail: String(error) }, { status: 500 });
  }
}
