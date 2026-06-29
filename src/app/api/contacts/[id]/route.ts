import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

// GET /api/contacts/[id] — get single contact
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const contact = await prisma.contact.findUnique({ where: { id } });
    if (!contact) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(contact);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch contact", detail: String(error) }, { status: 500 });
  }
}

// PATCH /api/contacts/[id] — update contact
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const contact = await prisma.contact.update({
      where: { id },
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone,
        phone2: body.phone2,
        type: body.type,
        status: body.status,
        source: body.source,
        tags: body.tags,
        notes: body.notes,
        street: body.street,
        city: body.city,
        state: body.state,
        zip: body.zip,
      },
    });
    return NextResponse.json(contact);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update contact", detail: String(error) }, { status: 500 });
  }
}

// DELETE /api/contacts/[id] — delete contact
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.contact.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete contact", detail: String(error) }, { status: 500 });
  }
}
