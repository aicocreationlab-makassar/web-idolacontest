/**
 * PostgREST embeds a relation as an object when the foreign key is unique
 * (results, claim_invoices, shipments) and as an array otherwise. Callers
 * that always want a list use this helper so both shapes work.
 */
export function asList<T>(value: T | T[] | null | undefined): T[] {
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

/** First embedded row, whichever shape PostgREST used. */
export function firstOf<T>(value: T | T[] | null | undefined): T | undefined {
  return asList(value)[0];
}
