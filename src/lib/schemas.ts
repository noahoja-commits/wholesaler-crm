import { z } from "zod";

// ─── Contact ─────────────────────────────────────────────────────
export const createContactSchema = z.object({
  organizationId: z.string().optional().default("default"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  phone2: z.string().optional().nullable(),
  type: z.enum(["SELLER", "BUYER", "AGENT", "TITLE_COMPANY", "HARD_MONEY", "OTHER"]).optional().default("SELLER"),
  status: z.enum(["ACTIVE", "INACTIVE", "DO_NOT_CONTACT", "CLOSED"]).optional().default("ACTIVE"),
  source: z.enum(["DIRECT_MAIL", "COLD_CALL", "SMS", "ONLINE_AD", "REFERRAL", "DRIVING_FOR_DOLLARS", "MLS", "PROPSTREAM", "BATCH_LEADS", "COUNTY_RECORDS", "OTHER"]).optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  notes: z.string().optional().nullable(),
  street: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zip: z.string().optional().nullable(),
});

export type CreateContactInput = z.infer<typeof createContactSchema>;

// ─── Property ────────────────────────────────────────────────────
export const createPropertySchema = z.object({
  organizationId: z.string().optional().default("default"),
  contactId: z.string().optional().nullable(),
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip: z.string().min(1, "ZIP code is required"),
  county: z.string().optional().nullable(),
  propertyType: z.enum(["SINGLE_FAMILY", "MULTI_FAMILY", "CONDO", "TOWNHOUSE", "LAND", "COMMERCIAL", "MOBILE_HOME"]).optional().default("SINGLE_FAMILY"),
  beds: z.number().int().min(0).optional().nullable(),
  baths: z.number().min(0).optional().nullable(),
  sqft: z.number().int().min(0).optional().nullable(),
  lotSqft: z.number().int().min(0).optional().nullable(),
  yearBuilt: z.number().int().min(1800).max(2030).optional().nullable(),
  estimatedValue: z.number().min(0).optional().nullable(),
  arv: z.number().min(0).optional().nullable(),
  repairCost: z.number().min(0).optional().nullable(),
  mao: z.number().optional().nullable(),
  foreclosureStatus: z.enum(["PRE_FORECLOSURE", "AUCTION_SCHEDULED", "AUCTION_POSTPONED", "BANK_OWNED", "SHORT_SALE", "NONE"]).optional().nullable(),
  status: z.enum(["NEW_LEAD", "CONTACTED", "APPOINTMENT_SCHEDULED", "APPOINTMENT_DONE", "OFFER_MADE", "UNDER_CONTRACT", "CLOSED", "DEAD_LEAD", "NURTURE"]).optional().default("NEW_LEAD"),
  notes: z.string().optional().nullable(),
});

export type CreatePropertyInput = z.infer<typeof createPropertySchema>;

// ─── Deal ────────────────────────────────────────────────────────
export const createDealSchema = z.object({
  organizationId: z.string().optional().default("default"),
  pipelineId: z.string().min(1, "Pipeline is required"),
  propertyId: z.string().min(1, "Property is required"),
  sellerId: z.string().min(1, "Seller is required"),
  buyerId: z.string().optional().nullable(),
  title: z.string().min(1, "Deal title is required"),
  currentStage: z.string().optional().default("lead"),
  dealType: z.enum(["WHOLESALE", "WHOLE_TAIL", "FIX_AND_FLIP", "BUY_AND_HOLD", "NOVATION"]).optional().default("WHOLESALE"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional().default("MEDIUM"),
  offerPrice: z.number().min(0).optional().nullable(),
  contractPrice: z.number().min(0).optional().nullable(),
  assignmentFee: z.number().min(0).optional().nullable(),
  emd: z.number().min(0).optional().nullable(),
  closingDate: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type CreateDealInput = z.infer<typeof createDealSchema>;
