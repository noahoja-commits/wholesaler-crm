// ─── Contact Types ────────────────────────────────────────────────────
export type ContactType = "SELLER" | "BUYER" | "AGENT" | "TITLE_COMPANY" | "HARD_MONEY" | "OTHER";
export type ContactStatus = "ACTIVE" | "INACTIVE" | "DO_NOT_CONTACT" | "CLOSED";
export type LeadSource =
  | "DIRECT_MAIL" | "COLD_CALL" | "SMS" | "ONLINE_AD" | "REFERRAL"
  | "DRIVING_FOR_DOLLARS" | "MLS" | "PROPSTREAM" | "BATCH_LEADS"
  | "COUNTY_RECORDS" | "OTHER";

export interface Contact {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  phone2: string | null;
  type: ContactType;
  status: ContactStatus;
  tags: string[];
  notes: string | null;
  source: LeadSource | null;
  street: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  skipTraced: boolean;
  createdAt: string;
  updatedAt: string;
}

// ─── Property Types ──────────────────────────────────────────────────
export type PropertyType = "SINGLE_FAMILY" | "MULTI_FAMILY" | "CONDO" | "TOWNHOUSE" | "LAND" | "COMMERCIAL" | "MOBILE_HOME";
export type PropertyStatus =
  | "NEW_LEAD" | "CONTACTED" | "APPOINTMENT_SCHEDULED" | "APPOINTMENT_DONE"
  | "OFFER_MADE" | "UNDER_CONTRACT" | "CLOSED" | "DEAD_LEAD" | "NURTURE";
export type ForeclosureStatus = "PRE_FORECLOSURE" | "AUCTION_SCHEDULED" | "AUCTION_POSTPONED" | "BANK_OWNED" | "SHORT_SALE" | "NONE";

export interface Property {
  id: string;
  organizationId: string;
  contactId: string | null;
  street: string;
  city: string;
  state: string;
  zip: string;
  county: string | null;
  propertyType: PropertyType;
  beds: number | null;
  baths: number | null;
  sqft: number | null;
  lotSqft: number | null;
  yearBuilt: number | null;
  estimatedValue: number | null;
  arv: number | null;
  repairCost: number | null;
  mao: number | null;
  status: PropertyStatus;
  lastSaleDate: string | null;
  lastSalePrice: number | null;
  taxAssessedValue: number | null;
  annualTaxes: number | null;
  lienAmount: number | null;
  foreclosureStatus: ForeclosureStatus | null;
  notes: string | null;
  photos: string[];
  latitude: number | null;
  longitude: number | null;
  contact?: Contact | null;
  createdAt: string;
  updatedAt: string;
}

// ─── Deal & Pipeline Types ───────────────────────────────────────────
export type DealType = "WHOLESALE" | "WHOLE_TAIL" | "FIX_AND_FLIP" | "BUY_AND_HOLD" | "NOVATION";
export type DealStatus = "ACTIVE" | "WON" | "LOST" | "ON_HOLD";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Pipeline {
  id: string;
  organizationId: string;
  name: string;
  description: string | null;
  stages: Stage[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Stage {
  id: string;
  pipelineId: string;
  name: string;
  order: number;
  color: string;
  description: string | null;
}

export interface Deal {
  id: string;
  organizationId: string;
  pipelineId: string;
  propertyId: string;
  sellerId: string;
  buyerId: string | null;
  title: string;
  currentStage: string;
  offerPrice: number | null;
  contractPrice: number | null;
  assignmentFee: number | null;
  emd: number | null;
  closingDate: string | null;
  dealType: DealType;
  status: DealStatus;
  priority: Priority;
  notes: string | null;
  property?: Property;
  seller?: Contact;
  buyer?: Contact | null;
  pipeline?: Pipeline;
  createdAt: string;
  updatedAt: string;
}

// ─── Task Types ──────────────────────────────────────────────────────
export type TaskStatus = "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED";
export type TaskCategory = "FOLLOW_UP" | "CALL" | "SEND_CONTRACT" | "INSPECTION" | "CLOSING" | "MARKETING" | "ADMIN" | "OTHER";

export interface Task {
  id: string;
  dealId: string | null;
  contactId: string | null;
  propertyId: string | null;
  assignedTo: string | null;
  title: string;
  description: string | null;
  dueDate: string | null;
  priority: Priority;
  status: TaskStatus;
  category: TaskCategory;
  createdAt: string;
  updatedAt: string;
  completedAt: string | null;
}

// ─── Campaign Types ──────────────────────────────────────────────────
export type CampaignType = "DIRECT_MAIL" | "EMAIL" | "SMS" | "RINGLESS_VOICEMAIL" | "MULTI_CHANNEL";
export type CampaignStatus = "DRAFT" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "PAUSED" | "CANCELLED";

export interface Campaign {
  id: string;
  organizationId: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  targetFilters: Record<string, unknown> | null;
  subjectLine: string | null;
  bodyTemplate: string | null;
  scheduledAt: string | null;
  totalSent: number;
  totalOpened: number;
  totalReplied: number;
  createdAt: string;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────
export interface DashboardStats {
  totalLeads: number;
  activeDeals: number;
  pipelineValue: number;
  closedThisMonth: number;
  conversionRate: number;
  avgDealSize: number;
  leadGrowth: number;
  pipelineStats: PipelineStats[];
}

export interface PipelineStats {
  stageName: string;
  count: number;
  value: number;
  color: string;
}

// ─── Form Types ──────────────────────────────────────────────────────
export interface PropertyFormData {
  street: string;
  city: string;
  state: string;
  zip: string;
  county?: string;
  propertyType: PropertyType;
  beds?: number;
  baths?: number;
  sqft?: number;
  estimatedValue?: number;
  arv?: number;
  repairCost?: number;
  foreclosureStatus?: ForeclosureStatus;
  notes?: string;
  contactId?: string;
  contactFirstName?: string;
  contactLastName?: string;
  contactPhone?: string;
  contactEmail?: string;
}

export interface DealFormData {
  title: string;
  pipelineId: string;
  propertyId: string;
  sellerId: string;
  dealType: DealType;
  offerPrice?: number;
  contractPrice?: number;
  assignmentFee?: number;
  emd?: number;
  priority: Priority;
  notes?: string;
}

// ─── Activity Types ──────────────────────────────────────────────────
export type ActivityType = "NOTE" | "CALL" | "EMAIL" | "SMS" | "MEETING" | "STATUS_CHANGE" | "DOCUMENT";

export interface Activity {
  id: string;
  dealId: string;
  type: ActivityType;
  subject: string;
  body: string | null;
  contactId: string | null;
  createdAt: string;
}
