import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";
import { rateLimit } from "@/lib/rate-limit";
import { sanitizePagination } from "@/lib/sanitize";

// GET /api/activities — list recent activities for a deal
export async function GET(request: NextRequest) {
  const rl = rateLimit(request);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "X-RateLimit-Remaining": "0" } });
  }

  const { searchParams } = new URL(request.url);
  const { limit } = sanitizePagination(searchParams.get("limit"), searchParams.get("offset"));
  const dealId = searchParams.get("dealId");

  try {
    const activities = await prisma.activity.findMany({
      where: dealId ? { dealId } : undefined,
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        contact: {
          select: { firstName: true, lastName: true },
        },
      },
    });

    return NextResponse.json({ activities }, {
      headers: { "Cache-Control": "private, max-age=30" },
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

// POST /api/activities — log a new activity (NOTE, CALL, or EMAIL)
export async function POST(request: NextRequest) {
  const rl = rateLimit(request);
  if (!rl.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429, headers: { "X-RateLimit-Remaining": "0" } });
  }

  try {
    const body = await request.json();

    const { dealId, contactId, type, subject, body: activityBody } = body;

    if (!type || !subject) {
      return NextResponse.json(
        { error: "Missing required fields: type, subject" },
        { status: 400 }
      );
    }

    if (!["NOTE", "CALL", "EMAIL"].includes(type)) {
      return NextResponse.json(
        { error: "Invalid activity type. Must be NOTE, CALL, or EMAIL" },
        { status: 400 }
      );
    }

    if (!dealId && !contactId) {
      return NextResponse.json(
        { error: "Must provide either dealId or contactId" },
        { status: 400 }
      );
    }

    const activity = await prisma.activity.create({
      data: {
        type,
        subject,
        dealId: dealId || "",
        body: activityBody || null,
        contactId: contactId || null,
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create activity" }, { status: 500 });
  }
}
