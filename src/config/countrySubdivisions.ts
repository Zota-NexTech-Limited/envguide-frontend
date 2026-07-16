/**
 * Country → subdivision (state / province) lookup for the supplier
 * questionnaire's manufacturing-site table (Q4). Backs the dynamic,
 * country-dependent Subdivision dropdown: the field suggests the states of the
 * selected country and still lets the supplier type any value manually (so
 * countries without ISO subdivision data, or unusual entries, are always
 * supported).
 *
 * Data source: countrySubdivisions.data.ts (auto-generated from
 * country-state-city; keyed by the exact country names in
 * questionnaireSchemaV3.ts COUNTRIES).
 */
import { COUNTRY_SUBDIVISIONS } from "./countrySubdivisions.data";

/** States / provinces for a country name, or [] when unknown (manual entry). */
export function getSubdivisionsForCountry(country?: string | null): string[] {
  if (!country) return [];
  return COUNTRY_SUBDIVISIONS[country] ?? [];
}
