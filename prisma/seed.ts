// Wholesaler CRM — Demo Seed Data
// Populates a realistic wholesaling scenario with sellers, buyers, properties, deals, pipeline, and campaigns.
//
// Usage: npm run db:seed
// Requires: DATABASE_URL set in .env, tables created via `npx prisma db push`

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

async function main() {
  console.log("🌱 Seeding Wholesaler CRM...\n");

  const orgId = "org_demo";

  // ─── Organization ───────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { id: orgId },
    update: {},
    create: {
      id: orgId,
      name: "Sunbelt Wholesale Properties",
      slug: "sunbelt",
    },
  });
  console.log(`  ✓ Organization: ${org.name}`);

  // ─── Pipeline ───────────────────────────────────────────────────
  const pipeline = await prisma.pipeline.upsert({
    where: { id: "pipeline_main" },
    update: {},
    create: {
      id: "pipeline_main",
      organizationId: orgId,
      name: "Standard Wholesale Pipeline",
      isDefault: true,
      stages: {
        create: [
          { name: "lead", order: 0, color: "#6b7280" },
          { name: "contacted", order: 1, color: "#3b82f6" },
          { name: "appointment", order: 2, color: "#8b5cf6" },
          { name: "offer", order: 3, color: "#eab308" },
          { name: "contract", order: 4, color: "#f97316" },
          { name: "closing", order: 5, color: "#22c55e" },
          { name: "closed", order: 6, color: "#22c55e" },
        ],
      },
    },
  });
  console.log(`  ✓ Pipeline: ${pipeline.name} (7 stages)`);

  // ─── Contacts: Sellers ──────────────────────────────────────────
  const sellers = await Promise.all(
    [
      { firstName: "Robert", lastName: "Martinez", phone: "512-555-0101", email: "rmartinez@email.com", city: "Austin", state: "TX", source: "DIRECT_MAIL" as const },
      { firstName: "Sharon", lastName: "Williams", phone: "281-555-0102", email: "swilliams@email.com", city: "Houston", state: "TX", source: "COLD_CALL" as const },
      { firstName: "Michael", lastName: "Johnson", phone: "214-555-0103", email: "mjohnson@email.com", city: "Dallas", state: "TX", source: "COUNTY_RECORDS" as const },
      { firstName: "Linda", lastName: "Davis", phone: "210-555-0104", email: "ldavis@email.com", city: "San Antonio", state: "TX", source: "DRIVING_FOR_DOLLARS" as const },
      { firstName: "James", lastName: "Brown", phone: "713-555-0105", email: "jbrown@email.com", city: "Houston", state: "TX", source: "PROPSTREAM" as const },
      { firstName: "Patricia", lastName: "Garcia", phone: "817-555-0106", email: "pgarcia@email.com", city: "Fort Worth", state: "TX", source: "REFERRAL" as const },
      { firstName: "David", lastName: "Miller", phone: "972-555-0107", email: "dmiller@email.com", city: "Plano", state: "TX", source: "DIRECT_MAIL" as const },
      { firstName: "Jennifer", lastName: "Wilson", phone: "832-555-0108", email: "jwilson@email.com", city: "Katy", state: "TX", source: "SMS" as const },
    ].map((s) =>
      prisma.contact.create({
        data: {
          organizationId: orgId,
          type: "SELLER",
          status: "ACTIVE",
          tags: ["motivated", s.source === "COUNTY_RECORDS" ? "pre-foreclosure" : "warm"],
          ...s,
        },
      })
    )
  );
  console.log(`  ✓ Sellers: ${sellers.length} contacts`);

  // ─── Contacts: Cash Buyers ──────────────────────────────────────
  const buyers = await Promise.all(
    [
      { firstName: "Marcus", lastName: "Chen", phone: "512-555-0201", email: "mchen@email.com", city: "Austin", state: "TX" },
      { firstName: "Angela", lastName: "Thompson", phone: "713-555-0202", email: "athompson@email.com", city: "Houston", state: "TX" },
      { firstName: "Kevin", lastName: "Rodriguez", phone: "214-555-0203", email: "krodriguez@email.com", city: "Dallas", state: "TX" },
      { firstName: "Tanya", lastName: "Patel", phone: "281-555-0204", email: "tpatel@email.com", city: "Sugar Land", state: "TX" },
      { firstName: "Derrick", lastName: "Washington", phone: "210-555-0205", email: "dwashington@email.com", city: "San Antonio", state: "TX" },
    ].map((b) =>
      prisma.contact.create({
        data: {
          organizationId: orgId,
          type: "BUYER",
          status: "ACTIVE",
          tags: ["cash-buyer", "repeat"],
          ...b,
        },
      })
    )
  );
  console.log(`  ✓ Cash Buyers: ${buyers.length} contacts`);

  // Buyer preferences
  await prisma.buyerPreference.createMany({
    data: [
      { contactId: buyers[0].id, states: ["TX"], cities: ["Austin"], minBeds: 3, maxBeds: 4, maxPrice: 350000, dealTypes: ["WHOLESALE"], propertyTypes: ["SINGLE_FAMILY"] },
      { contactId: buyers[1].id, states: ["TX"], cities: ["Houston", "Katy"], minBeds: 2, maxPrice: 250000, maxArv: 300000, maxRepairCost: 50000 },
      { contactId: buyers[2].id, states: ["TX"], cities: ["Dallas", "Plano", "Fort Worth"], minBeds: 3, maxPrice: 400000, acceptsMultiFamily: true },
      { contactId: buyers[3].id, states: ["TX"], cities: ["Houston", "Sugar Land"], maxPrice: 300000, maxArv: 350000 },
      { contactId: buyers[4].id, states: ["TX"], cities: ["San Antonio"], minBeds: 2, maxBeds: 5, maxPrice: 275000, maxRepairCost: 60000 },
    ],
  });
  console.log(`  ✓ Buyer Preferences: ${5} configured`);

  // ─── Contacts: Title Companies & Others ────────────────────────
  await prisma.contact.create({
    data: {
      organizationId: orgId,
      firstName: "Lone Star",
      lastName: "Title Co",
      type: "TITLE_COMPANY",
      status: "ACTIVE",
      phone: "512-555-0300",
      email: "closings@lonestartitle.com",
      city: "Austin",
      state: "TX",
    },
  });
  console.log(`  ✓ Title Company: 1 contact`);

  // ─── Properties ─────────────────────────────────────────────────
  const properties = await Promise.all(
    [
      { street: "1423 Oak Hollow Dr", city: "Austin", state: "TX", zip: "78745", beds: 3, baths: 2, sqft: 1650, arv: 385000, repairCost: 42000, foreclosureStatus: "NONE" as const, status: "NEW_LEAD" as const, contactId: sellers[0].id },
      { street: "2810 Maple Ridge Ln", city: "Houston", state: "TX", zip: "77084", beds: 4, baths: 2.5, sqft: 2100, arv: 310000, repairCost: 35000, foreclosureStatus: "PRE_FORECLOSURE" as const, status: "CONTACTED" as const, contactId: sellers[1].id },
      { street: "4509 Elmwood Ave", city: "Dallas", state: "TX", zip: "75216", beds: 3, baths: 1, sqft: 1200, arv: 225000, repairCost: 28000, foreclosureStatus: "NONE" as const, status: "OFFER_MADE" as const, contactId: sellers[2].id },
      { street: "723 Pinehurst Ct", city: "San Antonio", state: "TX", zip: "78249", beds: 4, baths: 3, sqft: 2400, arv: 420000, repairCost: 55000, foreclosureStatus: "AUCTION_SCHEDULED" as const, status: "APPOINTMENT_DONE" as const, contactId: sellers[3].id },
      { street: "1502 Bayou Bend", city: "Houston", state: "TX", zip: "77008", beds: 2, baths: 1, sqft: 950, arv: 195000, repairCost: 22000, foreclosureStatus: "NONE" as const, status: "NEW_LEAD" as const, contactId: sellers[4].id },
      { street: "9832 Stone Creek Rd", city: "Fort Worth", state: "TX", zip: "76116", beds: 3, baths: 2, sqft: 1750, arv: 290000, repairCost: 38000, foreclosureStatus: "SHORT_SALE" as const, status: "CONTACTED" as const, contactId: sellers[5].id },
      { street: "2201 Lakeside Dr", city: "Plano", state: "TX", zip: "75074", beds: 5, baths: 3.5, sqft: 3200, arv: 550000, repairCost: 75000, foreclosureStatus: "NONE" as const, status: "APPOINTMENT_SCHEDULED" as const, contactId: sellers[6].id },
      { street: "408 Willow Way", city: "Katy", state: "TX", zip: "77494", beds: 3, baths: 2, sqft: 1550, arv: 275000, repairCost: 24000, foreclosureStatus: "BANK_OWNED" as const, status: "OFFER_MADE" as const, contactId: sellers[7].id },
    ].map((p) => {
      const mao = p.arv * 0.7 - p.repairCost;
      return prisma.property.create({
        data: {
          organizationId: orgId,
          propertyType: "SINGLE_FAMILY",
          ...p,
          mao,
          estimatedValue: p.arv,
        },
      });
    })
  );
  console.log(`  ✓ Properties: ${properties.length} (MAO auto-computed)`);

  // ─── Deals ──────────────────────────────────────────────────────
  const dealsData = [
    { propertyId: properties[0].id, sellerId: sellers[0].id, title: "Oak Hollow Flip", currentStage: "lead", dealType: "WHOLESALE" as const, offerPrice: 227500, priority: "MEDIUM" as const },
    { propertyId: properties[1].id, sellerId: sellers[1].id, title: "Maple Ridge Pre-FC", currentStage: "contacted", dealType: "WHOLESALE" as const, offerPrice: 182000, priority: "HIGH" as const },
    { propertyId: properties[2].id, sellerId: sellers[2].id, title: "Elmwood Starter", currentStage: "offer", dealType: "WHOLE_TAIL" as const, offerPrice: 129500, contractPrice: 135000, assignmentFee: 15000, priority: "HIGH" as const },
    { propertyId: properties[3].id, sellerId: sellers[3].id, title: "Pinehurst Estate", currentStage: "appointment", dealType: "WHOLESALE" as const, offerPrice: 239000, priority: "URGENT" as const },
    { propertyId: properties[4].id, sellerId: sellers[4].id, title: "Bayou Cottage", currentStage: "lead", dealType: "FIX_AND_FLIP" as const, offerPrice: 114500, priority: "LOW" as const },
    { propertyId: properties[5].id, sellerId: sellers[5].id, title: "Stone Creek Short Sale", currentStage: "contract", dealType: "WHOLESALE" as const, offerPrice: 165000, contractPrice: 172000, assignmentFee: 20000, priority: "URGENT" as const },
    { propertyId: properties[6].id, sellerId: sellers[6].id, title: "Lakeside Luxury", currentStage: "appointment", dealType: "WHOLE_TAIL" as const, offerPrice: 310000, priority: "MEDIUM" as const },
    { propertyId: properties[7].id, sellerId: sellers[7].id, title: "Willow Way REO", currentStage: "closing", dealType: "WHOLESALE" as const, offerPrice: 168500, contractPrice: 175000, assignmentFee: 18000, closingDate: new Date("2026-07-15"), priority: "HIGH" as const, buyerId: buyers[1].id },
  ];

  const deals = await Promise.all(
    dealsData.map((d) =>
      prisma.deal.create({
        data: {
          organizationId: orgId,
          pipelineId: pipeline.id,
          ...d,
        },
      })
    )
  );
  console.log(`  ✓ Deals: ${deals.length} across pipeline stages`);

  // ─── Tasks ──────────────────────────────────────────────────────
  await prisma.task.createMany({
    data: [
      { dealId: deals[0].id, title: "Call seller — follow up on mailer", category: "CALL", priority: "HIGH", status: "TODO", dueDate: new Date("2026-07-01") },
      { dealId: deals[1].id, title: "Schedule property walkthrough", category: "FOLLOW_UP", priority: "HIGH", status: "TODO", dueDate: new Date("2026-07-02") },
      { dealId: deals[2].id, title: "Send offer letter", category: "SEND_CONTRACT", priority: "URGENT", status: "IN_PROGRESS" },
      { dealId: deals[3].id, title: "Pull updated comps for ARV", category: "ADMIN", priority: "MEDIUM", status: "TODO" },
      { dealId: deals[5].id, title: "Schedule inspection", category: "INSPECTION", priority: "URGENT", status: "TODO", dueDate: new Date("2026-07-03") },
      { dealId: deals[7].id, title: "Coordinate closing with title company", category: "CLOSING", priority: "HIGH", status: "IN_PROGRESS", dueDate: new Date("2026-07-10") },
      { dealId: deals[7].id, title: "Send assignment contract to buyer", category: "SEND_CONTRACT", priority: "URGENT", status: "DONE", completedAt: new Date() },
    ],
  });
  console.log(`  ✓ Tasks: 7 tasks created`);

  // ─── Campaign ───────────────────────────────────────────────────
  await prisma.campaign.create({
    data: {
      organizationId: orgId,
      name: "July Pre-Foreclosure Mailer",
      type: "DIRECT_MAIL",
      status: "DRAFT",
      targetFilters: { states: ["TX"], foreclosureStatus: "PRE_FORECLOSURE" },
      subjectLine: "We want to buy your house — cash offer inside",
      bodyTemplate: "Dear {{sellerName}},\n\nWe're interested in buying your property at {{propertyAddress}}. We pay cash and close in 7 days.\n\nCall us today!",
      scheduledAt: new Date("2026-07-05"),
    },
  });
  console.log(`  ✓ Campaign: 1 draft created`);

  // ─── Document Templates ─────────────────────────────────────────
  await prisma.documentTemplate.createMany({
    data: [
      {
        organizationId: orgId,
        name: "Assignment of Contract",
        type: "ASSIGNMENT_CONTRACT",
        content: `<h1>Assignment of Real Estate Purchase Contract</h1>
<p><strong>Assignor:</strong> {{sellerName}}</p>
<p><strong>Assignee:</strong> {{buyerName}}</p>
<p><strong>Property:</strong> {{propertyAddress}}, {{propertyCity}}, {{propertyState}} {{propertyZip}}</p>
<p><strong>Original Contract Price:</strong> {{contractPrice}}</p>
<p><strong>Assignment Fee:</strong> {{assignmentFee}}</p>
<p><strong>Closing Date:</strong> {{closingDate}}</p>`,
      },
      {
        organizationId: orgId,
        name: "Proof of Funds Letter",
        type: "PROOF_OF_FUNDS",
        content: `<h1>Proof of Funds Letter</h1>
<p>To Whom It May Concern:</p>
<p>This letter confirms that {{buyerName}} has sufficient funds available to purchase the property at {{propertyAddress}} for {{offerPrice}}.</p>`,
      },
    ],
  });
  console.log(`  ✓ Document Templates: 2 created`);

  console.log(`\n✅ Seed complete! ${org.name} is ready.`);
  console.log(`   Run: npm run dev → http://localhost:3000`);
  console.log(`   (Update API calls from 'orgId=default' to 'orgId=${orgId}' or set DEFAULT_ORG in lib/constants.ts)\n`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("Seed failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
