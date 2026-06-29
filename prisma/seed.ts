// Wholesaler CRM — Demo Seed Data
// Populates a realistic wholesaling scenario with sellers, buyers, properties, deals, pipeline, and campaigns.
//
// Usage: npm run db:seed
// Requires: DATABASE_URL set in .env, tables created via `npx prisma db push`

import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const url = new URL(process.env.DATABASE_URL!);
url.searchParams.set("uselibpqcompat", "true");
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: url.toString() }),
});

async function main() {
  console.log("🌱 Seeding Wholesaler CRM...\n");

  const orgId = "org_demo";

  // ─── Organization ───────────────────────────────────────────────
  const org = await prisma.organization.upsert({
    where: { id: orgId },
    update: { name: "Lone Star Property Solutions LLC" },
    create: {
      id: orgId,
      name: "Lone Star Property Solutions LLC",
      slug: "lonestar",
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
      { firstName: "Gregory", lastName: "Thornton", phone: "512-432-7891", email: "gthornton@gmail.com", city: "Austin", state: "TX", source: "DIRECT_MAIL" as const, notes: "Inherited property, needs to sell quickly. Out of state owner." },
      { firstName: "Melissa", lastName: "Crosswell", phone: "281-658-2341", email: "mcrosswell@yahoo.com", city: "Houston", state: "TX", source: "COUNTY_RECORDS" as const, notes: "Pre-foreclosure notice filed Jan 2026. Behind 6 months on mortgage." },
      { firstName: "Ronald", lastName: "Bishop", phone: "214-398-4567", email: "rbishop@outlook.com", city: "Dallas", state: "TX", source: "COLD_CALL" as const, notes: "Vacant rental property, tired landlord. Owns 3 other properties." },
      { firstName: "Cynthia", lastName: "Velasquez", phone: "210-845-9023", email: "cvelasquez@hotmail.com", city: "San Antonio", state: "TX", source: "DRIVING_FOR_DOLLARS" as const, notes: "Overgrown yard, boarded windows. Neighbor says owner moved to nursing home." },
      { firstName: "Darryl", lastName: "Hughes", phone: "713-267-3489", email: "dhughes.construction@email.com", city: "Houston", state: "TX", source: "PROPSTREAM" as const, notes: "Contractor who over-leveraged. Has 2 properties he needs to unload." },
      { firstName: "Anita", lastName: "Ramirez", phone: "817-543-6712", email: "aramirez@icloud.com", city: "Fort Worth", state: "TX", source: "REFERRAL" as const, notes: "Referred by title company. Going through divorce, needs fast close." },
      { firstName: "Lawrence", lastName: "Foster", phone: "972-319-8845", email: "lfoster@sbcglobal.net", city: "Plano", state: "TX", source: "DIRECT_MAIL" as const, notes: "Responded to yellow letter campaign. Underwater on mortgage since 2024." },
      { firstName: "Elaine", lastName: "Whitfield", phone: "832-776-1590", email: "ewhitfield@protonmail.com", city: "Katy", state: "TX", source: "SMS" as const, notes: "Responded to SMS blast. Relocating for work, needs to sell within 30 days." },
    ].map((s) =>
      prisma.contact.create({
        data: {
          organizationId: orgId,
          type: "SELLER",
          status: "ACTIVE",
          tags: ["motivated", s.source === "COUNTY_RECORDS" ? "pre-foreclosure" : s.source === "PROPSTREAM" ? "distressed" : "warm"],
          ...s,
        },
      })
    )
  );
  console.log(`  ✓ Sellers: ${sellers.length} contacts`);

  // ─── Contacts: Cash Buyers ──────────────────────────────────────
  const buyers = await Promise.all(
    [
      { firstName: "Harrison", lastName: "Kemp", phone: "512-998-4500", email: "hkemp@kempcapital.com", city: "Austin", state: "TX", notes: "Runs Kemp Capital LLC. Buys 10-15 properties/year in Travis & Williamson counties." },
      { firstName: "Valerie", lastName: "Okonkwo", phone: "713-521-8876", email: "vokonkwo@vnproperties.com", city: "Houston", state: "TX", notes: "Nigerian-American investor. Prefers NW Houston and Katy. Closes in 7 days cash." },
      { firstName: "Brett", lastName: "Callahan", phone: "214-665-3378", email: "brett@callahanholdings.com", city: "Dallas", state: "TX", notes: "Institutional buyer for Callahan Holdings. Buys portfolios of 3+ properties. All cash." },
      { firstName: "Priya", lastName: "Mehta", phone: "281-445-9912", email: "priya@mehtainvestments.com", city: "Sugar Land", state: "TX", notes: "Physician building rental portfolio. 1031 exchange buyer. Prefers turnkey or light rehab." },
      { firstName: "Marcus", lastName: "DeSantis", phone: "210-763-2201", email: "marcus@alamocityre.com", city: "San Antonio", state: "TX", notes: "Owns Alamo City RE LLC. Specializes in BRRRR method. Needs 70% ARV or better." },
    ].map((b) =>
      prisma.contact.create({
        data: {
          organizationId: orgId,
          type: "BUYER",
          status: "ACTIVE",
          tags: ["cash-buyer", "verified-funds"],
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
      firstName: "Texas National",
      lastName: "Title Group",
      type: "TITLE_COMPANY",
      status: "ACTIVE",
      phone: "512-454-8900",
      email: "closings@texasnationaltitle.com",
      city: "Austin",
      state: "TX",
      notes: "Preferred closing agent. $750 flat fee for wholesale double-closes.",
    },
  });
  console.log(`  ✓ Title Company: 1 contact`);

  // ─── Properties ─────────────────────────────────────────────────
  const properties = await Promise.all(
    [
      { street: "1423 Oak Hollow Dr", city: "Austin", state: "TX", zip: "78745", beds: 3, baths: 2, sqft: 1650, arv: 385000, repairCost: 42000, foreclosureStatus: "NONE" as const, status: "NEW_LEAD" as const, contactId: sellers[0].id, notes: "Out-of-state owner. Tenant-occupied, month-to-month. Showing requires 24hr notice." },
      { street: "2810 Maple Ridge Ln", city: "Houston", state: "TX", zip: "77084", beds: 4, baths: 2, sqft: 2150, arv: 310000, repairCost: 47000, foreclosureStatus: "PRE_FORECLOSURE" as const, status: "CONTACTED" as const, contactId: sellers[1].id, notes: "Auction date set for Aug 15. Seller owes $178K. Payoff quote obtained." },
      { street: "4509 Elmwood Ave", city: "Dallas", state: "TX", zip: "75216", beds: 3, baths: 1, sqft: 1250, arv: 225000, repairCost: 32000, foreclosureStatus: "NONE" as const, status: "OFFER_MADE" as const, contactId: sellers[2].id, notes: "Vacant 14 months. Foundation issues noted. Offer of $127K submitted, awaiting response." },
      { street: "723 Pinehurst Ct", city: "San Antonio", state: "TX", zip: "78249", beds: 4, baths: 3, sqft: 2450, arv: 420000, repairCost: 68000, foreclosureStatus: "AUCTION_SCHEDULED" as const, status: "APPOINTMENT_DONE" as const, contactId: sellers[3].id, notes: "Estate sale. Trustee wants all-cash close. Walkthrough completed Jun 22. Roof needs replacement." },
      { street: "1502 Bayou Bend Dr", city: "Houston", state: "TX", zip: "77008", beds: 2, baths: 1, sqft: 980, arv: 210000, repairCost: 25000, foreclosureStatus: "NONE" as const, status: "NEW_LEAD" as const, contactId: sellers[4].id, notes: "Investor-owned. Seller has 2 properties to package. Will discount if both bought together." },
      { street: "9832 Stone Creek Rd", city: "Fort Worth", state: "TX", zip: "76116", beds: 3, baths: 2, sqft: 1780, arv: 290000, repairCost: 38000, foreclosureStatus: "SHORT_SALE" as const, status: "CONTACTED" as const, contactId: sellers[5].id, notes: "BofA short sale. Attorney involved. Expect 90-120 day timeline. Comps support ARV." },
      { street: "2201 Lakeside Dr", city: "Plano", state: "TX", zip: "75074", beds: 5, baths: 3, sqft: 3350, arv: 575000, repairCost: 82000, foreclosureStatus: "NONE" as const, status: "APPOINTMENT_SCHEDULED" as const, contactId: sellers[6].id, notes: "High-end property. Seller underwater since 2024. Walkthrough scheduled Jul 8." },
      { street: "408 Willow Way", city: "Katy", state: "TX", zip: "77494", beds: 3, baths: 2, sqft: 1625, arv: 285000, repairCost: 29000, foreclosureStatus: "BANK_OWNED" as const, status: "OFFER_MADE" as const, contactId: sellers[7].id, notes: "Wells Fargo REO. Listed 45 days. First offer rejected. Revised offer pending." },
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
    { propertyId: properties[0].id, sellerId: sellers[0].id, title: "Oak Hollow — Out of State Seller", currentStage: "lead", dealType: "WHOLESALE" as const, offerPrice: 227500, priority: "MEDIUM" as const, notes: "Mailer response. Seller inherited property, lives in California." },
    { propertyId: properties[1].id, sellerId: sellers[1].id, title: "Maple Ridge Pre-FC — Aug Auction", currentStage: "contacted", dealType: "WHOLESALE" as const, offerPrice: 170000, priority: "HIGH" as const, notes: "Time-sensitive. Auction Aug 15. Need to move fast on this one." },
    { propertyId: properties[2].id, sellerId: sellers[2].id, title: "Elmwood — Tired Landlord Portfolio", currentStage: "offer", dealType: "WHOLE_TAIL" as const, offerPrice: 129500, contractPrice: 135000, assignmentFee: 15500, priority: "HIGH" as const, notes: "Offer submitted. Seller countering. He wants to sell all 3 properties as a package." },
    { propertyId: properties[3].id, sellerId: sellers[3].id, title: "Pinehurst Estate Sale", currentStage: "appointment", dealType: "WHOLESALE" as const, offerPrice: 226000, priority: "URGENT" as const, notes: "Trustee motivated. Walkthrough done. Comps pulled. Needs $68K rehab — roof, HVAC, floors." },
    { propertyId: properties[4].id, sellerId: sellers[4].id, title: "Bayou Bend — Contractor 2-Property Package", currentStage: "lead", dealType: "FIX_AND_FLIP" as const, offerPrice: 122000, priority: "LOW" as const, notes: "Low priority unless he packages both. Second property at 3510 Westview needs eval." },
    { propertyId: properties[5].id, sellerId: sellers[5].id, title: "Stone Creek Short Sale — BofA", currentStage: "contract", dealType: "WHOLESALE" as const, offerPrice: 165000, contractPrice: 172000, assignmentFee: 20000, priority: "URGENT" as const, notes: "Contract signed. Waiting on BofA approval. Buyer lined up — Callahan Holdings." },
    { propertyId: properties[6].id, sellerId: sellers[6].id, title: "Lakeside Dr — Underwater Luxury", currentStage: "appointment", dealType: "WHOLE_TAIL" as const, offerPrice: 320500, priority: "MEDIUM" as const, notes: "High-end property. Walkthrough Jul 8. Comps $550-600K. Seller owes $410K." },
    { propertyId: properties[7].id, sellerId: sellers[7].id, title: "Willow Way — Wells Fargo REO", currentStage: "closing", dealType: "WHOLESALE" as const, offerPrice: 170500, contractPrice: 176000, assignmentFee: 18500, closingDate: new Date("2026-07-28"), priority: "HIGH" as const, buyerId: buyers[1].id, notes: "Closing scheduled Jul 28. Title work cleared. Valerie Okonkwo is end buyer." },
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
