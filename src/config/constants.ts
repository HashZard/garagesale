export const AUSTRALIAN_STATES = [
  "WA",
  "NSW",
  "VIC",
  "QLD",
  "SA",
  "TAS",
  "ACT",
  "NT",
] as const;

export const SALE_CATEGORIES = [
  { value: "furniture", label: "Furniture" },
  { value: "tools", label: "Tools" },
  { value: "clothing", label: "Clothing" },
  { value: "kids-baby", label: "Kids & baby" },
  { value: "books-media", label: "Books & media" },
  { value: "electronics", label: "Electronics" },
  { value: "garden", label: "Garden" },
  { value: "collectables", label: "Collectables" },
  { value: "household", label: "Household" },
  { value: "other", label: "Other" },
] as const;

export const SALE_SOURCES = [
  "self",
  "gumtree",
  "facebook",
  "manual",
  "other",
] as const;

export const SALE_STATUSES = [
  "pending_verification",
  "published",
  "cancelled",
  "removed",
] as const;

export const RADIUS_OPTIONS_KM = [5, 10, 25, 50] as const;
export const DEFAULT_RADIUS_KM = 25;
export const DEFAULT_SEARCH_DAYS = 14;
export const NEARBY_SUBURB_RADIUS_KM = 10;
export const MAX_PHOTO_COUNT = 6;
export const MAX_PHOTO_EDGE_PX = 1600;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
export const MAX_TITLE_LENGTH = 80;
export const MAX_DESCRIPTION_LENGTH = 2000;
export const PUBLISH_RATE_LIMIT_PER_HOUR = 3;
export const RECOVER_RATE_LIMIT_PER_HOUR = 3;
export const MANAGE_RATE_LIMIT_PER_HOUR = 30;
export const ADMIN_LOGIN_RATE_LIMIT_PER_HOUR = 10;
export const UPLOAD_RATE_LIMIT_PER_HOUR = 20;

// Mapbox paint expressions cannot consume CSS custom properties directly.
export const MAP_MARKER_COLOR = "#167c73";
export const MAP_MARKER_FOREGROUND = "#ffffff";

export const DATE_FILTERS = [
  { value: "this-weekend", label: "This weekend" },
  { value: "next-weekend", label: "Next weekend" },
  { value: "all", label: "All upcoming" },
] as const;
