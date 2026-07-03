import { z } from "zod";

/**
 * Enhanced boolean preprocessing function to handle various boolean representations
 * This addresses the Admin API Boolean Parameter Validation & Fault Tolerance Specification
 */
export function preprocessBoolean() {
  return z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    if (typeof val === "string") {
      if (val.toLowerCase() === "true" || val === "1") return true;
      if (val.toLowerCase() === "false" || val === "0") return false;
    }
    if (typeof val === "boolean") return val;
    if (typeof val === "number") return val !== 0;
    return undefined;
  }, z.boolean().optional());
}

/**
 * Enhanced number preprocessing function to handle various number representations
 */
export function preprocessNumber() {
  return z.preprocess((val) => {
    if (val === null || val === undefined || val === "") return undefined;
    if (typeof val === "string") {
      const num = Number(val);
      return isNaN(num) ? undefined : num;
    }
    if (typeof val === "number") return val;
    return undefined;
  }, z.number().optional());
}

/**
 * Common validation schemas for admin APIs
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

export const SortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const SearchSchema = z.object({
  searchTerm: z.string().optional(),
});

/**
 * Generic filter schema that can be extended
 */
export const FilterSchema = z.object({
  status: z.string().optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
});

/**
 * Combined pagination, sorting, and filtering schema
 */
export const AdminQuerySchema = PaginationSchema.merge(SortSchema).merge(SearchSchema).merge(FilterSchema);

/**
 * Enhanced boolean schema specifically for isActive fields
 */
export const IsActiveSchema = z.object({
  isActive: preprocessBoolean(),
});