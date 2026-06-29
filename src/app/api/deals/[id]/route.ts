import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// PATCH /api/deals/[id] — update deal
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const deal = await prisma.deal.update({
      where: { id },
      data: {
        title: body.title, currentStage: body.currentStage,
        dealType: body.dealType, priority: body.priority,
        offerPrice: body.offerPrice ?? null, contractPrice: body.contractPrice ?? null,
        assignmentFee: body.assignmentFee ?? null, emd: body.emd ?? null,
        notes: body.notes, buyerId: body.buyerId,
        status: body.status,
        closingDate: body.closingDate ? new Date(body.closingDate) : null,
      },
    });
    return NextResponse.json(deal);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update deal", detail: String(error) }, { status: 500 });
  }
}

// DELETE /api/deals/[id] — delete deal
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.deal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete deal", detail: String(error) }, { status: 500 });
  }
}
