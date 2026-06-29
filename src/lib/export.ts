/**
 * CSV Export utility for data export functionality
 */

type CellValue = string | number | boolean | null | undefined | Date;

/**
 * Escape a value for CSV format
 */
function escapeCell(value: CellValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toLocaleDateString();
  const str = String(value);
  // Escape quotes and wrap in quotes if contains comma, quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Convert an array of objects to CSV string
 */
export function toCSV<T extends Record<string, CellValue>>(
  data: T[],
  columns: { key: keyof T; header: string }[]
): string {
  const headers = columns.map((col) => escapeCell(col.header));
  const rows = data.map((row) =>
    columns.map((col) => escapeCell(row[col.key])).join(",")
  );
  return [headers.join(","), ...rows].join("\n");
}

/**
 * Download data as a CSV file
 */
export function downloadCSV(
  csv: string,
  filename: string
): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export contacts to CSV
 */
export function exportContactsToCSV(
  contacts: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    state?: string | null;
    type: string;
    status: string;
    createdAt: string | Date;
  }>
): void {
  const csv = toCSV(contacts, [
    { key: "firstName", header: "First Name" },
    { key: "lastName", header: "Last Name" },
    { key: "email", header: "Email" },
    { key: "phone", header: "Phone" },
    { key: "city", header: "City" },
    { key: "state", header: "State" },
    { key: "type", header: "Type" },
    { key: "status", header: "Status" },
    { key: "createdAt", header: "Created Date" },
  ]);

  const date = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `contacts-${date}.csv`);
}

/**
 * Export deals to CSV
 */
export function exportDealsToCSV(
  deals: Array<{
    id: string;
    title: string;
    currentStage: string;
    dealType: string;
    offerPrice?: number | null;
    contractPrice?: number | null;
    sellerName?: string;
    propertyAddress?: string;
    createdAt: string | Date;
  }>
): void {
  const csv = toCSV(deals, [
    { key: "title", header: "Title" },
    { key: "currentStage", header: "Stage" },
    { key: "dealType", header: "Type" },
    { key: "offerPrice", header: "Offer Price" },
    { key: "contractPrice", header: "Contract Price" },
    { key: "sellerName", header: "Seller" },
    { key: "propertyAddress", header: "Property" },
    { key: "createdAt", header: "Created Date" },
  ]);

  const date = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `deals-${date}.csv`);
}

/**
 * Export properties to CSV
 */
export function exportPropertiesToCSV(
  properties: Array<{
    id: string;
    street: string;
    city: string;
    state: string;
    zip?: string | null;
    status: string;
    askingPrice?: number | null;
    estimatedValue?: number | null;
    bedrooms?: number | null;
    bathrooms?: number | null;
    yearBuilt?: number | null;
    createdAt: string | Date;
  }>
): void {
  const csv = toCSV(properties, [
    { key: "street", header: "Address" },
    { key: "city", header: "City" },
    { key: "state", header: "State" },
    { key: "zip", header: "ZIP" },
    { key: "status", header: "Status" },
    { key: "askingPrice", header: "Asking Price" },
    { key: "estimatedValue", header: "Estimated Value" },
    { key: "bedrooms", header: "Beds" },
    { key: "bathrooms", header: "Baths" },
    { key: "yearBuilt", header: "Year Built" },
    { key: "createdAt", header: "Created Date" },
  ]);

  const date = new Date().toISOString().split("T")[0];
  downloadCSV(csv, `properties-${date}.csv`);
}
