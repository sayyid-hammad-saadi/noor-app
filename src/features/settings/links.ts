/**
 * External links shown under Settings › About. A row appears only once its value is
 * set, so nothing points at a page that doesn't exist yet.
 */
export const LINKS: {
  privacy: string | null;
  terms: string | null;
  /** Support email; also used by "Report a content error". */
  contactEmail: string | null;
  /** App Store / Play Store listing. */
  rate: string | null;
} = {
  privacy: null,
  terms: null,
  contactEmail: null,
  rate: null,
};
