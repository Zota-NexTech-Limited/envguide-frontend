/**
 * Regenerates src/config/countrySubdivisions.data.ts from country-state-city.
 * Run from the project root:  npm run generate:subdivisions
 * Update SCHEMA_COUNTRIES below if the questionnaire's COUNTRIES list changes.
 */
import { Country, State } from "country-state-city";
import { writeFileSync } from "node:fs";

// The exact country list the questionnaire schema uses (questionnaireSchemaV3.ts COUNTRIES).
const SCHEMA_COUNTRIES = [
  "Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria",
  "Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belarus","Belgium","Belize","Benin","Bhutan",
  "Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cabo Verde","Cambodia",
  "Cameroon","Canada","Central African Republic","Chad","Chile","China","Colombia","Comoros","Congo","Costa Rica",
  "Croatia","Cuba","Cyprus","Czech Republic","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt",
  "El Salvador","Equatorial Guinea","Eritrea","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon",
  "Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guinea-Bissau","Guyana",
  "Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kiribati","Kuwait","Kyrgyzstan","Laos",
  "Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi",
  "Malaysia","Maldives","Mali","Malta","Marshall Islands","Mauritania","Mauritius","Mexico","Micronesia","Moldova",
  "Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nauru","Nepal","Netherlands",
  "New Zealand","Nicaragua","Niger","Nigeria","North Korea","North Macedonia","Norway","Oman","Pakistan","Palau",
  "Palestine","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania",
  "Russia","Rwanda","Saint Kitts and Nevis","Saint Lucia","Saint Vincent and the Grenadines","Samoa","San Marino","Sao Tome and Principe","Saudi Arabia","Senegal",
  "Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Solomon Islands","Somalia","South Africa","South Korea",
  "South Sudan","Spain","Sri Lanka","Sudan","Suriname","Sweden","Switzerland","Syria","Taiwan","Tajikistan",
  "Tanzania","Thailand","Timor-Leste","Togo","Tonga","Trinidad and Tobago","Tunisia","Turkey","Turkmenistan","Tuvalu",
  "Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Vanuatu","Vatican City","Venezuela",
  "Vietnam","Yemen","Zambia","Zimbabwe",
];

// Explicit schema-name -> country-state-city ISO2 for names that won't match by string.
const ISO_ALIAS = {
  "Bolivia": "BO", "Brunei": "BN", "Cabo Verde": "CV", "Congo": "CG",
  "Czech Republic": "CZ", "Iran": "IR", "Laos": "LA", "Micronesia": "FM",
  "Moldova": "MD", "North Korea": "KP", "Palestine": "PS", "Russia": "RU",
  "Sao Tome and Principe": "ST", "South Korea": "KR", "Syria": "SY",
  "Taiwan": "TW", "Tanzania": "TZ", "United Kingdom": "GB", "United States": "US",
  "Vatican City": "VA", "Venezuela": "VE", "Vietnam": "VN", "Eswatini": "SZ",
  "Turkey": "TR", "Timor-Leste": "TL", "Gambia": "GM", "Bahamas": "BS",
  "Fiji": "FJ", "North Macedonia": "MK",
};

const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[^a-z]/g, "");
const cscCountries = Country.getAllCountries();
const byNorm = new Map(cscCountries.map((c) => [norm(c.name), c.isoCode]));

const data = {};
const unmatched = [];
for (const name of SCHEMA_COUNTRIES) {
  let iso = ISO_ALIAS[name] || byNorm.get(norm(name));
  if (!iso) { unmatched.push(name); data[name] = []; continue; }
  const states = State.getStatesOfCountry(iso).map((s) => s.name);
  // De-dupe + sort for stable, clean output.
  data[name] = [...new Set(states)].sort((a, b) => a.localeCompare(b));
}

const withStates = Object.values(data).filter((a) => a.length > 0).length;
const totalStates = Object.values(data).reduce((n, a) => n + a.length, 0);

const header = `/**
 * Country → first-level subdivisions (states / provinces / regions).
 * AUTO-GENERATED from country-state-city@3.2.1. Do not edit by hand.
 * Keyed by the exact country names used in questionnaireSchemaV3.ts COUNTRIES.
 * Countries with no ISO subdivision data map to an empty array (manual entry only).
 * Coverage: ${withStates}/${SCHEMA_COUNTRIES.length} countries, ${totalStates} subdivisions.
 */
export const COUNTRY_SUBDIVISIONS: Record<string, string[]> = ${JSON.stringify(data, null, 2)};
`;

writeFileSync("src/config/countrySubdivisions.data.ts", header, "utf8");
console.log(`WROTE src/config/countrySubdivisions.data.ts`);
console.log(`coverage: ${withStates}/${SCHEMA_COUNTRIES.length} countries with states, ${totalStates} total subdivisions`);
console.log(`UNMATCHED (empty, manual-entry only): ${unmatched.length ? unmatched.join(", ") : "none"}`);
