/**
 * Supplier Questionnaire — Version 3.0
 * Aligned to CX-PCF Rulebook v4 | ISO 14067 | SAMM 9.0.0
 *
 * This is the active, supplier-facing questionnaire. It replaces the legacy
 * 84-question schema (kept in questionnaireSchema.ts as QUESTIONNAIRE_SCHEMA_LEGACY
 * for reference). The "General Information" section is preserved unchanged from
 * the legacy schema (same field `name` keys), per requirement.
 *
 * SCOPE NOTE (form-first rebuild): this file only defines what the supplier sees
 * and fills in. Submitting still runs through the legacy frontend mapper
 * (supplierQuestionnaireService.mapToApiPayload), which is keyed to the old
 * structure, so the new V3 answers are NOT yet persisted end-to-end. Wiring
 * submission/persistence (and any backend work) is a separate follow-up task.
 *
 * Field types and rendering are driven by DynamicQuestionnaireForm.tsx. Dropdowns
 * here use static `options` (no backend dropdown APIs) so the form is
 * self-contained. In-table Yes/No columns use a `select` (renders cleaner inside
 * a table than a radio group).
 */

import type { QuestionnaireSection } from "./questionnaireSchema";

// ---------------------------------------------------------------------------
// Static option lists
// ---------------------------------------------------------------------------

const YES_NO = ["Yes", "No"];

const COUNTRIES = [
  "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria",
  "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bhutan",
  "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burundi", "Cabo Verde", "Cambodia",
  "Cameroon", "Canada", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo", "Costa Rica",
  "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt",
  "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Eswatini", "Ethiopia", "Fiji", "Finland", "France", "Gabon",
  "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana",
  "Haiti", "Honduras", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel",
  "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Kuwait", "Kyrgyzstan", "Laos",
  "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Madagascar", "Malawi",
  "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova",
  "Monaco", "Mongolia", "Montenegro", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands",
  "New Zealand", "Nicaragua", "Niger", "Nigeria", "North Korea", "North Macedonia", "Norway", "Oman", "Pakistan", "Palau",
  "Palestine", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania",
  "Russia", "Rwanda", "Saint Kitts and Nevis", "Saint Lucia", "Saint Vincent and the Grenadines", "Samoa", "San Marino", "Sao Tome and Principe", "Saudi Arabia", "Senegal",
  "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Korea",
  "South Sudan", "Spain", "Sri Lanka", "Sudan", "Suriname", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan",
  "Tanzania", "Thailand", "Timor-Leste", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Tuvalu",
  "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Vatican City", "Venezuela",
  "Vietnam", "Yemen", "Zambia", "Zimbabwe",
];

const REGIONS = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Oceania / Australia",
  "Middle East",
  "Global / Rest of World",
];

const DECLARED_UNITS = [
  "piece",
  "kg",
  "g",
  "tonne",
  "litre",
  "millilitre",
  "metre",
  "square metre (m²)",
  "cubic metre (m³)",
  "kWh",
  "MJ",
  "pair",
  "set",
];

const PRODUCTION_PERIODS = ["Monthly", "Annually"];

const MASS_UNITS = ["kg", "g", "tonne", "lb"];
const QUANTITY_UNITS = ["kg", "g", "tonne", "lb", "litre", "m³", "piece"];
const ENERGY_UNITS = ["kWh", "MWh", "MJ", "GJ"];
const FUEL_UNITS = ["litre", "m³", "kg", "tonne", "kWh", "MJ", "GJ"];
const GAS_UNITS = ["kg", "g", "tonne"];

const MATERIALS = [
  "Steel", "Stainless steel", "Aluminium", "Copper", "Brass", "Zinc", "Cast iron",
  "Nickel", "Tin", "Lead", "Gold", "Silver",
  "ABS", "Polypropylene (PP)", "Polyethylene (PE)", "PET", "PVC", "Polycarbonate (PC)",
  "Nylon / Polyamide (PA)", "POM", "Rubber / Elastomer",
  "Glass", "Ceramic", "Silicon", "Paper / Cardboard", "Wood",
  "Adhesive", "Paint / Coating", "Composite (CFRP / GFRP)", "Electronic component (PCB)",
  "Other",
];

const PROCESSES = [
  "Casting", "Die casting", "Forging", "Machining (CNC)", "Turning", "Milling",
  "Stamping / Pressing", "Injection moulding", "Extrusion", "Blow moulding",
  "Welding", "Soldering", "Assembly", "Surface treatment / Plating", "Anodising",
  "Painting / Coating", "Heat treatment", "Sintering", "3D printing", "Printing",
  "Cutting", "Other",
];

const ELECTRICITY_TYPES = [
  "Grid electricity",
  "On-site generated",
  "Renewable PPA",
  "Green tariff / green power product",
  "Diesel generator",
  "Combined heat & power (CHP)",
  "Other",
];

const RENEWABLE_SOURCING = [
  "On-site generation (EACs generated)",
  "On-site generation (no EACs)",
  "PPA / sleeved PPA",
  "Virtual PPA",
  "Green tariff / green power product",
  "Utility-supplied renewable (bundled / unbundled EACs)",
  "Unbundled EACs",
  "Unbundled RECs / I-RECs",
  "Not applicable",
];

const FUEL_CARRIERS = [
  "Natural gas", "Diesel", "Petrol / Gasoline", "LPG", "CNG", "LNG",
  "Heating oil", "Coal", "Coke", "Biomass", "Biogas", "Hydrogen",
  "District heating", "Steam", "Other",
];

const PROCESS_GASES = ["CO₂", "CH₄", "N₂O", "HFCs", "PFCs", "SF₆", "NF₃", "Other"];

const FOSSIL_BIOGENIC = ["Fossil", "Biogenic"];

const WASTE_TYPES = [
  "Scrap metal", "Plastic scrap", "PCB / electronic waste", "Solvents",
  "Paper / cardboard", "Sludge", "Hazardous waste", "Packaging waste",
  "General / mixed waste", "Other",
];

const TREATMENT_TYPES = [
  "Recycling", "Reuse", "Landfill",
  "Incineration (with energy recovery)", "Incineration (without energy recovery)",
  "Composting", "Hazardous waste treatment", "Other",
];

const PACKAGING_TYPES = [
  "Cardboard box", "Corrugated board", "Paper", "Wooden pallet", "Wooden crate",
  "Plastic film (LDPE)", "Stretch / shrink wrap", "Rigid plastic (HDPE / PP)",
  "EPS / foam", "Bubble wrap", "Metal strapping", "Glass", "Composite / multilayer",
  "Other",
];

const TRANSPORT_MODES = [
  "Road: Truck (heavy)", "Road: Van (light)", "Rail",
  "Sea: Container ship", "Sea: Bulk / RoRo", "Inland waterway",
  "Air freight", "Other",
];

const BIOMASS_FEEDSTOCKS = [
  "Wood / forestry", "Maize / Corn", "Sugarcane", "Sugar beet", "Wheat",
  "Soy", "Palm", "Rapeseed", "Cotton", "Bamboo", "Natural rubber",
  "Other agricultural", "Other forestry",
];

const DQR_SCALE = ["1", "2", "3", "4", "5"];

const PCF_TYPES = [
  "1: Retrospective PCF (historical / measured data)",
  "2: Prospective PCF without forerunner",
  "3: Prospective PCF of a further-developed product with forerunner",
  "4: Prospective PCF for a current product, future production date",
  "5: Progressive PCF (optimistic reduction scenario; for information only)",
];

const SYSTEM_BOUNDARIES = [
  "Cradle-to-Gate (default, per Catena-X)",
  "Cradle-to-Grave",
];

const PACKAGING_INCLUDE = [
  "Yes, include packaging",
  "No, exclude packaging",
];

const OUTBOUND_TRANSPORT = [
  "Yes, distribution is within my boundary",
  "No, the customer arranges it",
];

const BIOBASED_PRESENT = [
  "Yes, contains bio-based feedstock",
  "No",
];

const VOLUME_TYPES = [
  "Certified volume",
  "Total production volume",
  "1st-party verified volume",
  "2nd-party verified volume",
  "3rd-party verified volume",
  "Total product volume",
];

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

export const QUESTIONNAIRE_SCHEMA_V3: QuestionnaireSection[] = [
  // =========================================================================
  // General Information — preserved unchanged from the legacy schema.
  // (Same field `name` keys so existing acknowledgement mapping still works.)
  // =========================================================================
  {
    id: "general_information",
    title: "General Information",
    fields: [
      {
        name: "gdpr_notice",
        type: "info",
        content:
          "All information provided is confidential and used only for Corporate and product level sustainability assessment.",
        label: "Display Message as per GDPR",
        className: "bg-blue-50 border-l-4 border-blue-400 p-4 text-blue-700",
      },
      {
        name: "re_technologies_info",
        type: "info",
        label:
          "Please read following eligible technologies to be considered as renewable electricity (RE) and acknowledge them.",
        content:
          "1. Wind\n2. Hydro\n3. Solar power\n4. Geothermal\n5. Solid, liquid, and gaseous forms of Biomass from the fuels (woody waste, land fill gas, wastewater methane, animal & other organic waste, energy crops)\n6. Ocean-based energy resources captured through tidal and wave technologies.\n\nExcluded technologies:\n1. Electricity from nuclear power is not regarded as renewable electricity.\n2. Electricity from waste combustion is not regarded as renewable electricity.",
        className: "bg-white p-6 rounded-lg border border-gray-200 mb-4",
      },
      {
        name: "general_information.re_technologies_acknowledgement",
        label:
          "I acknowledge that I have read and understood the Eligible technologies consider as renewable electricity (RE) mentioned above.",
        type: "checkbox",
        required: true,
      },
      {
        name: "re_procurement_info",
        type: "info",
        label:
          "Please read following Procurement mechanisms and acknowledge them.",
        content:
          "Electricity will be regarded as renewable electricity if provided using one of the mechanisms stated below and respecting the requirements regarding double counting. Please select which ones apply to your processes. If none apply in the country carbon emissions occur, at the end an alternative locally accepted at the time of production type of proof:\n\nAcronyms used:\nPPA: Power Purchase Agreements\nEAC: Energy Attribute Certificates\niREC or I-REC: International Green Energy Certificates\nGOO: Guarantee of Origin\n\n1. Onsite generation: EACs generated\n2. Onsite generation: No EACs generated\n3. Off-Site generation: PPA / sleeved PPA (Proof of delivery necessary)\n4. Off-Site generation: Virtual PPA (Proof via EAC necessary)\n5. Off-Site generation: Green Power Tariff / Green Power Product\n6. Power supplied by an electricity provider where the provider takes over the responsibility to provide the electricity either directly from renewable sources (e.g. through PPAs) or procures and deletes unbundled EACs for the supplied electricity.\n7. Unbundled EACs\n8. Unbundled REC's / I-REC's",
        className: "bg-white p-6 rounded-lg border border-gray-200 mb-4",
      },
      {
        name: "general_information.re_procurement_acknowledgement",
        label:
          "I acknowledge that I have read and understood the procurement mechanisms mentioned above.",
        type: "checkbox",
        required: true,
      },
      {
        name: "double_counting_info",
        type: "info",
        label: "DOUBLE COUNTING",
        content:
          'Please acknowledge that the mechanism you use does not fall under Double Counting. Examples of prohibited double uses include, but are not limited to:\n1. When the same EAC is sold by one party to more than one party, or any case where another party has a conflicting contract for the EACs or the renewable electricity;\n2. When the same EAC is claimed by more than one party, including any expressed or implied environmental claims made pursuant to electricity coming from a renewable energy resource, environmental labelling or disclosure requirements. This includes representing the energy from which EACs are derived as renewable in calculating another entity\'s product or portfolio resource mix for the purposes of marketing or disclosure;\n3. When the same EAC is used by an electricity provider or utility to meet an environmental mandate, such as an RPS, and is also used to satisfy customer sales or\n4. Use of one or more attributes of the renewable energy or EAC by another party. This includes when an EAC is simultaneously sold to represent "renewable electricity" to one party, and one or more Attributes associated with the same MWh of generation (such as CO2 reduction) are also sold, to another party.',
        className: "bg-white p-6 rounded-lg border border-gray-200 mb-4",
      },
      {
        name: "general_information.double_counting_acknowledgement",
        label: "I acknowledge my mechanisms do not fall under double counting",
        type: "checkbox",
        required: true,
      },
      // Submission metadata (contact + completion). Lives in General
      // Information per requirement. "Supplier / Company" and "Product this PCF
      // refers to" from the doc header are omitted — they duplicate Q1 / Q2.
      {
        name: "contact.person",
        label: "Contact person",
        type: "text",
        required: true,
        placeholder: "Name of the person completing this form",
      },
      {
        name: "contact.email",
        label: "Contact e-mail",
        type: "text",
        required: true,
        placeholder: "name@example.com",
      },
    ],
  },

  // =========================================================================
  // Section A — About Company and the product (Q1–Q4)
  // =========================================================================
  {
    id: "section_a_company_product",
    title: "Section A: Company & Product",
    fields: [
      {
        name: "company.legal_name",
        label:
          "1. What is your company's full legal name and registration identifier? (Company legal name)",
        type: "text",
        required: true,
        placeholder: "Enter the registered company name",
      },
      {
        // Generic company identifier — the supplier's own / internal company
        // ID. Optional; BPNL below is the mandatory Catena-X identifier, and
        // "Other" captures a jurisdiction-specific code (DUNS / VAT / CIN).
        name: "company.company_id",
        label: "Company ID (optional)",
        type: "text",
        required: false,
        placeholder: "Your company / internal ID",
      },
      {
        // Catena-X Business Partner Number (BPN) on every supplier record.
        name: "company.bpn",
        label: "Business Partner Number (BPN)",
        type: "text",
        required: true,
        placeholder: "BPN000000000000",
        maxLength: 16,
      },
      {
        // Q1 "Other — specify": jurisdiction-specific registration identifier
        // (DUNS / VAT / CIN, etc.). Optional.
        name: "company.other_identifier",
        label: "Other — specify (DUNS / VAT / CIN) (optional)",
        type: "text",
        required: false,
        placeholder: "e.g. DUNS / VAT / CIN",
      },
      {
        name: "product.name",
        label: "2. Which product does this carbon footprint apply to? (Product name)",
        type: "text",
        required: true,
        placeholder: "Enter the product name",
        // Auto-filled from the client-uploaded BOM (component name). Read-only.
        autoPopulateFromBomField: "component_name",
      },
      {
        name: "product.product_id",
        label: "Product ID / MPN / article number",
        type: "text",
        required: true,
        placeholder: "Enter the MPN or article number",
        // Auto-filled from the BOM (material number / MPN). Read-only.
        autoPopulateFromBomField: "material_number",
      },
      {
        name: "product.description",
        label: "Product description (optional)",
        type: "textarea",
        required: false,
        placeholder: "Short description of the product",
        // Auto-filled from the BOM (detail description). Read-only.
        autoPopulateFromBomField: "detail_description",
      },
      {
        name: "product.classification",
        label: "Product classification (GTIN / UNSPSC / CAS / HS) (optional)",
        type: "text",
        required: false,
        placeholder: "e.g. GTIN / UNSPSC / CAS / HS code",
      },
      {
        name: "product.declared_unit",
        label: "3. In which unit is the carbon footprint declared? (Declared unit)",
        type: "select",
        options: DECLARED_UNITS,
        required: true,
        placeholder: "Select the declared unit",
      },
      {
        name: "product.declared_unit_quantity",
        label: "Declared quantity / amount (e.g. 1)",
        type: "number",
        required: true,
        min: 0,
        placeholder: "e.g. 1",
        // Auto-filled from the BOM (quantity). Read-only.
        autoPopulateFromBomField: "quantity",
      },
      {
        // Absolute product mass per declared unit (kg). Feeds the carbon
        // content + intensity calcs in the formula engine.
        name: "product.declared_mass",
        label: "Total product mass per declared unit (kg)",
        type: "number",
        required: true,
        min: 0,
        placeholder: "e.g. 2.5",
        // Auto-filled from the BOM weight (grams → kg). Read-only.
        autoPopulateFromBomField: "weight_kg",
      },
      {
        // Q3 — product price per declared unit. Used by the co-product
        // economic allocation basis.
        name: "product.price",
        label: "Product Price",
        type: "number",
        required: true,
        min: 0,
        placeholder: "e.g. 12.50 (per declared unit)",
        // Auto-filled from the BOM (price). Read-only.
        autoPopulateFromBomField: "price",
      },
      {
        // Q3 (3e) — the production period the declared basis refers to.
        name: "product.production_period",
        label: "Production Period",
        type: "select",
        options: PRODUCTION_PERIODS,
        required: true,
        placeholder: "Select production period",
      },
      {
        name: "product.manufacturing_sites",
        label: "4. At which site(s) is the product manufactured?",
        type: "table",
        addButtonLabel: "Add Site",
        required: true,
        placeholder: "One row per manufacturing site.",
        columns: [
          { name: "site_name", label: "Site Name", type: "text", placeholder: "Site name" },
          { name: "site_address", label: "Site Address", type: "text", placeholder: "Address" },
          // Subdivision suggestions are driven by the selected Country
          // (subdivisionOf) and always allow a manually typed value.
          { name: "subdivision", label: "Subdivision", type: "text", required: true, subdivisionOf: "country", placeholder: "Select or type state / province" },
          { name: "region", label: "Region", type: "select", options: REGIONS, required: true, placeholder: "Select region" },
          { name: "country", label: "Country", type: "select", options: COUNTRIES, required: true, placeholder: "Select country" },
          { name: "notes", label: "Notes", type: "text", placeholder: "Optional notes" },
        ],
      },
    ],
  },

  // =========================================================================
  // Section B — Scope and reporting period (Q5–Q7)
  // =========================================================================
  {
    id: "section_b_scope_period",
    title: "Section B: Scope & Reporting Period",
    fields: [
      {
        name: "scope_period.reference_start",
        label: "5. Reference period start date",
        type: "date",
        required: true,
        placeholder: "Default: first day of the prior calendar year",
      },
      {
        name: "scope_period.reference_end",
        label: "Reference period end date",
        type: "date",
        required: true,
        placeholder: "Default: last day of the prior calendar year",
      },
      {
        name: "scope_period.validity_start",
        label: "Validity start date (optional)",
        type: "date",
        required: false,
        placeholder: "Default: same as reference end date",
      },
      {
        name: "scope_period.validity_end",
        label: "Validity end date",
        type: "date",
        required: true,
        placeholder: "Default: reference end date + 2 years",
      },
      {
        // Per Catena-X policy: every supplier submission must be a Retrospective
        // PCF. Default is pre-selected on form load and the field is disabled so
        // the supplier cannot change it.
        name: "scope_period.pcf_type",
        label: "6. Is this a retrospective or a prospective PCF?",
        type: "radio",
        options: PCF_TYPES,
        required: true,
        disabled: true,
      },
      {
        // Per Catena-X policy: system boundary is always Cradle-to-Gate. Default
        // pre-selected and disabled so the supplier cannot change it.
        name: "scope_period.system_boundary",
        label: "7. Which system boundary does this footprint cover?",
        type: "radio",
        options: SYSTEM_BOUNDARIES,
        required: true,
        disabled: true,
      },
    ],
  },

  // =========================================================================
  // Section C — What the product is made of (Bill of Materials) (Q8–Q9)
  // =========================================================================
  {
    id: "section_c_bom",
    title: "Section C: Bill of Materials",
    fields: [
      {
        // Q8 — Bill of Materials. Rows pre-fill from the assigned BOM when one
        // is present (autoPopulateFromBom seeds only when the table is empty);
        // the supplier can also add / remove their own rows. Material is
        // classified by a 4-level taxonomy (Category / Sub category / Group /
        // Specific Type), free-text for now until the material/EF taxonomy
        // dataset is wired.
        name: "bom.bill_of_materials",
        label:
          "8. List every material and component in one unit of the product, with its biogenic and recycled characteristics.",
        type: "table",
        addButtonLabel: "Add Material / Component",
        required: true,
        autoPopulateFromBom: true,
        placeholder:
          "One row per material / component. Pre-filled from your assigned BOM when available; add more rows as needed.",
        columns: [
          // MPN is a locked dropdown sourced from the supplier's assigned BOM
          // (getBomComponentsForSupplier) — not free text. Selecting an MPN
          // auto-fills component_name / bom_id for that row.
          { name: "product_id", label: "Product ID / MPN", type: "select", apiDropdown: "bomMaterials", placeholder: "Select MPN" },
          // The 4-level EF classification is mandatory (shows a red * per column).
          { name: "material", label: "Category (Material)", type: "select", efTaxonomyLevel: "category", required: true, placeholder: "Search category…" },
          { name: "sub_category", label: "Sub category", type: "select", efTaxonomyLevel: "sub_category", required: true, placeholder: "Search sub-category…" },
          { name: "group", label: "Group", type: "select", efTaxonomyLevel: "group", required: true, placeholder: "Search group…" },
          { name: "specific_type", label: "Specific Type", type: "select", efTaxonomyLevel: "specific_type", required: true, placeholder: "Search specific type…" },
          { name: "mass_percent", label: "Mass of component (%)", type: "number", required: true, min: 0, max: 100, placeholder: "0-100" },
          { name: "carbon_percent", label: "Carbon (%)", type: "number", min: 0, max: 100, placeholder: "0-100" },
          { name: "biogenic", label: "Biogenic? (Y/N)", type: "select", options: YES_NO, placeholder: "Y/N" },
          // Biogenic carbon + bio-based mass only apply when Biogenic = Yes.
          { name: "biogenic_carbon_percent", label: "Biogenic carbon (%)", type: "number", min: 0, max: 100, placeholder: "0-100", dependency: { field: "biogenic", value: "Yes" } },
          { name: "biobased_mass_percent", label: "Bio-based mass (%)", type: "number", min: 0, max: 100, placeholder: "0-100", dependency: { field: "biogenic", value: "Yes" } },
          { name: "recycled", label: "Recycled? (Y/N)", type: "select", options: YES_NO, placeholder: "Y/N" },
          // Recycled carbon only applies when Recycled = Yes.
          { name: "recycled_carbon_percent", label: "Recycled C (%)", type: "number", min: 0, max: 100, placeholder: "0-100", dependency: { field: "recycled", value: "Yes" } },
        ],
      },
      {
        // Q8a — does the supplier have a component- or material-specific
        // emission factor to share? Optional ("if available"). Shown after Q8.
        name: "bom.component_specific_ef_available",
        label:
          "8a. Can you provide a component-specific or material-specific emission factor? (if available)",
        type: "radio",
        options: YES_NO,
        required: false,
      },
      {
        // Q8a details — shown only when Q8a = Yes. One row per component /
        // material with the supplier's own emission factor.
        name: "bom.component_ef_details",
        label: "8a.1 Component / material emission factors",
        type: "table",
        addButtonLabel: "Add Emission Factor",
        required: false,
        dependency: {
          field: "bom.component_specific_ef_available",
          value: "Yes",
        },
        columns: [
          { name: "component_material_name", label: "Component / Material Name", type: "text", placeholder: "Component or material name" },
          { name: "supplier_ef", label: "Supplier EF", type: "text", placeholder: "e.g. 2.5 kgCO₂e/kg" },
        ],
      },
      {
        // Q8b — process consumable materials used during production but NOT part
        // of the Bill of Materials. Optional. MPN is free text (these consumables
        // are not BOM components); classification uses the same 4-level EF
        // taxonomy cascade as the BOM.
        name: "bom.process_consumables",
        label:
          "8b. Which process consumable materials are used during manufacturing that are not included in the Bill of Materials? (optional)",
        type: "table",
        addButtonLabel: "Add Consumable",
        required: false,
        placeholder:
          "One row per process consumable consumed during production but not part of the BOM.",
        columns: [
          { name: "mpn", label: "MPN", type: "text", placeholder: "MPN (if any)" },
          { name: "consumable_material", label: "Process Consumable Materials", type: "text", placeholder: "Consumable name" },
          { name: "category", label: "Category", type: "select", efTaxonomyLevel: "category", placeholder: "Search category…" },
          { name: "sub_category", label: "Sub-Category", type: "select", efTaxonomyLevel: "sub_category", placeholder: "Search sub-category…" },
          { name: "group", label: "Group", type: "select", efTaxonomyLevel: "group", placeholder: "Search group…" },
          { name: "specific_type", label: "Specific type", type: "select", efTaxonomyLevel: "specific_type", placeholder: "Search specific type…" },
          { name: "total_quantity", label: "Total Quantity", type: "number", min: 0, placeholder: "0.00" },
          { name: "unit", label: "Unit", type: "select", options: QUANTITY_UNITS, placeholder: "Select unit" },
        ],
      },
      {
        name: "bom.co_products_produced",
        label: "9. Does the same manufacturing process also yield other saleable co-products?",
        type: "radio",
        options: YES_NO,
        required: true,
      },
      {
        name: "bom.co_products",
        label: "9.1 List each co-product and its unit price",
        type: "table",
        addButtonLabel: "Add Co-product",
        required: true,
        placeholder:
          "One row per co-product. The allocation basis is computed using the Catena-X co-product formula.",
        dependency: {
          field: "bom.co_products_produced",
          value: "Yes",
        },
        columns: [
          // Component name is intentionally omitted — it is inferable from the
          // selected MPN, so only the MPN is captured here.
          { name: "mpn", label: "MPN", type: "select", apiDropdown: "bomMaterials", placeholder: "Pick a component" },
          { name: "co_product_name", label: "Co-Product Name", type: "text", placeholder: "Co-product name" },
          { name: "co_product_price", label: "Co-Product Price (currency/unit)", type: "number", min: 0, placeholder: "0.00" },
          { name: "is_primary", label: "Is this the primary product? (Y/N)", type: "select", options: YES_NO, placeholder: "Y/N" },
        ],
      },
    ],
  },

  // =========================================================================
  // Section D — Energy, process, quality control and waste (Q10–Q14)
  // =========================================================================
  {
    id: "section_d_energy_process",
    title: "Section D: Energy, Process & Waste",
    fields: [
      {
        name: "energy.electricity",
        label:
          "10. How much electricity was consumed to manufacture the product, and what share was renewable?",
        type: "table",
        addButtonLabel: "Add Row",
        required: true,
        placeholder:
          "Use meter readings or electricity invoices for the reporting period. Default unit is kWh.",
        columns: [
          { name: "electricity_type", label: "Electricity Type", type: "select", options: ELECTRICITY_TYPES, required: true, placeholder: "Select type" },
          { name: "category", label: "Category (Electricity)", type: "select", efTaxonomyLevel: "category", required: true, placeholder: "Search category…" },
          { name: "sub_category", label: "Sub category", type: "select", efTaxonomyLevel: "sub_category", required: true, placeholder: "Search sub-category…" },
          { name: "group", label: "Group", type: "select", efTaxonomyLevel: "group", required: true, placeholder: "Search group…" },
          { name: "specific_type", label: "Specific Type", type: "select", efTaxonomyLevel: "specific_type", required: true, placeholder: "Search specific type…" },
          { name: "quantity", label: "Quantity", type: "number", required: true, min: 0, placeholder: "0.00" },
          { name: "unit", label: "Unit", type: "select", options: ENERGY_UNITS, required: true, placeholder: "Select unit" },
          { name: "renewable_percent", label: "Renewable (%)", type: "number", min: 0, max: 100, placeholder: "0-100" },
          { name: "renewable_sourcing", label: "Renewable (%) Sourcing", type: "select", options: RENEWABLE_SOURCING, placeholder: "Select mechanism" },
          { name: "infrastructure_included", label: "Infrastructure Emissions Included? (Y/N)", type: "select", options: YES_NO, placeholder: "Y/N" },
          { name: "infrastructure_ef", label: "Infrastructure Emission Factor (kgCO₂e/kWh)", type: "number", min: 0, placeholder: "0.00" },
        ],
      },
      {
        // Q10a — total weight of each product manufactured at the factory level
        // during the reporting period (one row per MPN).
        name: "energy.factory_product_weights",
        label:
          "10a. What is the total weight of each product manufactured at the factory level during the reporting period?",
        type: "table",
        addButtonLabel: "Add Product",
        required: true,
        placeholder:
          "One row per product. Total weight (kg) produced at factory level for the reporting period.",
        columns: [
          { name: "mpn", label: "MPN", type: "select", apiDropdown: "bomMaterials", placeholder: "Select MPN" },
          { name: "total_weight_kg", label: "Total weight produced at factory level (kg)", type: "number", required: true, min: 0, placeholder: "e.g. 25000" },
        ],
      },
      {
        // Q10b — number of units of each product manufactured during the
        // reporting period (one row per MPN).
        name: "energy.factory_product_units",
        label:
          "10b. How many units of each product were manufactured during the reporting period?",
        type: "table",
        addButtonLabel: "Add Product",
        required: true,
        placeholder:
          "One row per product. Number of products / components produced during the reporting period.",
        columns: [
          { name: "mpn", label: "MPN", type: "select", apiDropdown: "bomMaterials", placeholder: "Select MPN" },
          { name: "units_produced", label: "No. of products / components produced", type: "number", required: true, min: 0, placeholder: "e.g. 10000" },
        ],
      },
      {
        name: "energy.other_fuels",
        label:
          "11. Which fuels, energy carriers, or utilities were used On-Site during the manufacturing of the declared product? (optional)",
        type: "table",
        addButtonLabel: "Add Row",
        required: false,
        columns: [
          { name: "mpn", label: "MPN", type: "select", apiDropdown: "bomMaterials", placeholder: "Select MPN" },
          { name: "fuel_carrier", label: "Fuel / energy carrier", type: "select", options: FUEL_CARRIERS, placeholder: "Select fuel" },
          { name: "category", label: "Category", type: "select", efTaxonomyLevel: "category", placeholder: "Search category…" },
          { name: "sub_category", label: "Sub-Category", type: "select", efTaxonomyLevel: "sub_category", placeholder: "Search sub-category…" },
          { name: "group", label: "Group", type: "select", efTaxonomyLevel: "group", placeholder: "Search group…" },
          { name: "specific_type", label: "Specific type", type: "select", efTaxonomyLevel: "specific_type", placeholder: "Search specific type…" },
          { name: "quantity", label: "Total Quantity", type: "number", min: 0, placeholder: "0.00" },
          { name: "unit", label: "Unit", type: "select", options: FUEL_UNITS, placeholder: "Select unit" },
          { name: "biogenic", label: "Biogenic? (Y/N)", type: "select", options: YES_NO, placeholder: "Y/N (optional)" },
        ],
      },
      {
        name: "energy.direct_process_gases",
        label:
          "12. Does the manufacturing process release greenhouse gases directly (not from burning fuel)?",
        type: "table",
        addButtonLabel: "Add Row",
        required: true,
        columns: [
          { name: "mpn", label: "MPN", type: "select", apiDropdown: "bomMaterials", required: true, placeholder: "Select MPN" },
          { name: "gas", label: "Direct process gas", type: "select", options: PROCESS_GASES, required: true, placeholder: "Select gas" },
          { name: "quantity", label: "Total Quantity", type: "number", required: true, min: 0, placeholder: "0.00" },
          { name: "unit", label: "Unit", type: "select", options: GAS_UNITS, required: true, placeholder: "Select unit" },
          { name: "origin", label: "Fossil / biogenic origin", type: "select", options: FOSSIL_BIOGENIC, placeholder: "Select origin (optional)" },
        ],
      },
      {
        name: "energy.qc_it_energy",
        label: "13. How much energy did quality control and production IT consume? (optional)",
        type: "table",
        addButtonLabel: "Add Row",
        required: false,
        placeholder:
          "If this energy is already included in the Q10 electricity total, select 'Yes' under 'Is it included in Q10?' to avoid double-counting.",
        columns: [
          { name: "mpn", label: "MPN Code", type: "select", apiDropdown: "bomMaterials", placeholder: "Select MPN" },
          { name: "equipment_type", label: "Equipment Type", type: "text", placeholder: "e.g. CMM, oven, test rig" },
          { name: "category", label: "Category (Energy type)", type: "select", efTaxonomyLevel: "category", placeholder: "Search category…" },
          { name: "sub_category", label: "Subcategory", type: "select", efTaxonomyLevel: "sub_category", placeholder: "Search sub-category…" },
          { name: "group", label: "Group", type: "select", efTaxonomyLevel: "group", placeholder: "Search group…" },
          { name: "specific_type", label: "Specific Type", type: "select", efTaxonomyLevel: "specific_type", placeholder: "Search specific type…" },
          { name: "value", label: "Total Quantity", type: "number", min: 0, placeholder: "0.00" },
          { name: "unit", label: "Unit", type: "select", options: ENERGY_UNITS, placeholder: "Select unit" },
          { name: "already_in_q10", label: "Is it included in Q10? (Y/N)", type: "select", options: YES_NO, placeholder: "Y/N" },
        ],
      },
      {
        name: "energy.production_waste",
        label:
          "14. What production and quality-control waste were generated, and how was it treated?",
        type: "table",
        addButtonLabel: "Add Row",
        required: true,
        columns: [
          { name: "product_id", label: "MPN", type: "select", apiDropdown: "bomMaterials", required: true, placeholder: "Select MPN" },
          { name: "category", label: "Category", type: "select", efTaxonomyLevel: "category", required: true, placeholder: "Search category…" },
          { name: "sub_category", label: "Subcategory", type: "select", efTaxonomyLevel: "sub_category", required: true, placeholder: "Search sub-category…" },
          { name: "group", label: "Group", type: "select", efTaxonomyLevel: "group", required: true, placeholder: "Search group…" },
          { name: "specific_type", label: "Specific Type", type: "select", efTaxonomyLevel: "specific_type", required: true, placeholder: "Search specific type…" },
          { name: "quantity", label: "Quantity (Per Component)", type: "number", required: true, min: 0, placeholder: "0.00" },
          { name: "unit", label: "Unit", type: "select", options: MASS_UNITS, required: true, placeholder: "Select unit" },
          { name: "energy_recovered", label: "Energy recovered? (Y/N)", type: "select", options: YES_NO, placeholder: "Y/N" },
          { name: "polluter_pays_applied", label: "Polluter Pays Applied? (Y/N)", type: "select", options: YES_NO, placeholder: "Y/N" },
        ],
      },
    ],
  },

  // =========================================================================
  // Section E — Packaging (Q15–Q17)
  // =========================================================================
  {
    id: "section_e_packaging",
    title: "Section E: Packaging",
    fields: [
      {
        name: "packaging.include_packaging",
        label: "15. Should packaging be included within this footprint?",
        type: "radio",
        options: PACKAGING_INCLUDE,
        required: true,
      },
      {
        name: "packaging.materials_used",
        label: "16. Which packaging materials are used for the product?",
        type: "table",
        addButtonLabel: "Add Packaging Material",
        required: true,
        dependency: { field: "packaging.include_packaging", value: "Yes, include packaging" },
        columns: [
          { name: "product_id", label: "Product ID / MPN", type: "select", apiDropdown: "bomMaterials", placeholder: "Select MPN" },
          { name: "category", label: "Category (Packaging)", type: "select", efTaxonomyLevel: "category", placeholder: "Search category…" },
          { name: "sub_category", label: "Sub category", type: "select", efTaxonomyLevel: "sub_category", placeholder: "Search sub-category…" },
          { name: "group", label: "Group", type: "select", efTaxonomyLevel: "group", placeholder: "Search group…" },
          { name: "specific_type", label: "Specific Type", type: "select", efTaxonomyLevel: "specific_type", placeholder: "Search specific type…" },
          { name: "packaging_weight", label: "Packaging weight", type: "number", min: 0, placeholder: "0.00" },
          { name: "unit", label: "Units", type: "select", options: MASS_UNITS, placeholder: "Select unit" },
          { name: "region", label: "Region", type: "select", options: REGIONS, placeholder: "Select region" },
          { name: "country", label: "Country", type: "select", options: COUNTRIES, placeholder: "Select country" },
          { name: "recycled_percent", label: "Recycled (%)", type: "number", min: 0, max: 100, placeholder: "0-100" },
          { name: "carbon_biogenic_percent", label: "Carbon / Biogenic (%)", type: "number", min: 0, max: 100, placeholder: "0-100" },
        ],
      },
      {
        name: "packaging.transport",
        label: "16.1 How is each packaging item transported to your site?",
        type: "table",
        addButtonLabel: "Add Transport Leg",
        required: true,
        dependency: { field: "packaging.include_packaging", value: "Yes, include packaging" },
        placeholder:
          "One row per packaging transport leg, from delivery notes or freight invoices. Distance in km. Select Mode = Air for any air-freighted packaging.",
        columns: [
          { name: "product_id", label: "Packaging Product ID / MPN", type: "select", apiDropdown: "bomMaterials", placeholder: "Select MPN" },
          { name: "category", label: "Category (Pack Transport)", type: "select", efTaxonomyLevel: "category", placeholder: "Search category…" },
          { name: "sub_category", label: "Sub category", type: "select", efTaxonomyLevel: "sub_category", placeholder: "Search sub-category…" },
          { name: "group", label: "Group", type: "select", efTaxonomyLevel: "group", placeholder: "Search group…" },
          { name: "specific_type", label: "Specific Type", type: "select", efTaxonomyLevel: "specific_type", placeholder: "Search specific type…" },
          { name: "weight", label: "Weight", type: "number", min: 0, placeholder: "0.00" },
          { name: "unit", label: "Unit", type: "select", options: MASS_UNITS, placeholder: "Select unit" },
          { name: "distance_km", label: "Distance (km)", type: "number", min: 0, placeholder: "0" },
        ],
      },
      {
        name: "packaging.waste",
        label: "17. What packaging waste was generated, and how was it treated?",
        type: "table",
        addButtonLabel: "Add Row",
        required: true,
        dependency: { field: "packaging.include_packaging", value: "Yes, include packaging" },
        columns: [
          { name: "mpn_code", label: "MPN Code", type: "select", apiDropdown: "bomMaterials", placeholder: "Select MPN" },
          { name: "category", label: "Category (Pack waste)", type: "select", efTaxonomyLevel: "category", placeholder: "Search category…" },
          { name: "sub_category", label: "Sub category", type: "select", efTaxonomyLevel: "sub_category", placeholder: "Search sub-category…" },
          { name: "group", label: "Group", type: "select", efTaxonomyLevel: "group", placeholder: "Search group…" },
          { name: "specific_type", label: "Specific Type", type: "select", efTaxonomyLevel: "specific_type", placeholder: "Search specific type…" },
          { name: "quantity", label: "Quantity", type: "number", min: 0, placeholder: "0.00" },
          { name: "unit", label: "Unit", type: "select", options: MASS_UNITS, placeholder: "Select unit" },
          { name: "energy_recovered", label: "Energy recovered? (Y/N)", type: "select", options: YES_NO, placeholder: "Y/N" },
        ],
      },
    ],
  },

  // =========================================================================
  // Section F — Transport (Q18–Q19)
  // =========================================================================
  {
    id: "section_f_transport",
    title: "Section F: Transport",
    fields: [
      {
        name: "transport.outbound_in_boundary",
        label: "18. Is outbound (distribution) transport arranged and paid for by your company?",
        type: "radio",
        options: OUTBOUND_TRANSPORT,
        required: true,
      },
      {
        name: "transport.legs",
        label: "19. What are the transport legs for the product and its components?",
        type: "table",
        addButtonLabel: "Add Transport Leg",
        required: true,
        dependency: {
          field: "transport.outbound_in_boundary",
          value: "Yes, distribution is within my boundary",
        },
        placeholder:
          "One row per journey, from delivery notes or freight invoices. Weight in tonnes, distance in km.",
        columns: [
          { name: "product_id", label: "Product ID / MPN", type: "select", apiDropdown: "bomMaterials", placeholder: "Select MPN" },
          { name: "category", label: "Category", type: "select", efTaxonomyLevel: "category", placeholder: "Search category…" },
          { name: "sub_category", label: "Sub category", type: "select", efTaxonomyLevel: "sub_category", placeholder: "Search sub-category…" },
          { name: "group", label: "Group", type: "select", efTaxonomyLevel: "group", placeholder: "Search group…" },
          { name: "specific_type", label: "Specific Type", type: "select", efTaxonomyLevel: "specific_type", placeholder: "Search specific type…" },
          { name: "source", label: "Source", type: "text", placeholder: "Origin" },
          { name: "destination", label: "Destination", type: "text", placeholder: "Destination" },
          { name: "weight", label: "Weight", type: "number", min: 0, placeholder: "0.00" },
          { name: "unit", label: "Unit", type: "select", options: MASS_UNITS, placeholder: "Select unit" },
          { name: "distance_km", label: "Distance (km)", type: "number", min: 0, placeholder: "0" },
          { name: "low_carbon_fuel", label: "Low-Carbon Fuel? (Y/N)", type: "select", options: YES_NO, placeholder: "Y/N" },
          { name: "fuel_certificate_ref", label: "Fuel Certificate Ref.", type: "text", placeholder: "Reference" },
        ],
      },
    ],
  },

  // =========================================================================
  // Section G — Bio-based feedstock & land use (Q20)
  // =========================================================================
  {
    id: "section_g_biobased",
    title: "Section G: Bio-based Feedstock & Land Use",
    fields: [
      {
        name: "biobased.contains_biobased",
        label: "20. Does the product or its packaging contain bio-based feedstock? (optional)",
        type: "radio",
        options: BIOBASED_PRESENT,
        required: false,
      },
      {
        name: "biobased.details",
        label: "20.1 Bio-based feedstock details",
        type: "table",
        addButtonLabel: "Add Feedstock",
        required: false,
        dependency: {
          field: "biobased.contains_biobased",
          value: "Yes, contains bio-based feedstock",
        },
        columns: [
          { name: "feedstock", label: "Type of Biomass Feedstock", type: "select", options: BIOMASS_FEEDSTOCKS, placeholder: "Select feedstock" },
          { name: "stage_used", label: "In which stage is the feedstock used?", type: "text", placeholder: "e.g. raw material, packaging" },
          { name: "quantity", label: "Quantity", type: "number", placeholder: "0.00" },
          { name: "unit", label: "Unit", type: "select", options: QUANTITY_UNITS, placeholder: "Select unit" },
          { name: "biogenic_carbon_percent", label: "Biogenic Carbon Content (%)", type: "number", placeholder: "0-100" },
        ],
      },
      {
        name: "biobased.uses_agri_forestry_land",
        label: "Uses agricultural / forestry land? (Y/N)",
        type: "radio",
        options: YES_NO,
        required: false,
        dependency: {
          field: "biobased.contains_biobased",
          value: "Yes, contains bio-based feedstock",
        },
      },
      {
        name: "biobased.land_area_hectares",
        label: "Land area for feedstock (hectares)",
        type: "number",
        required: false,
        placeholder: "0.00",
        dependency: {
          field: "biobased.contains_biobased",
          value: "Yes, contains bio-based feedstock",
        },
      },
      {
        name: "biobased.forest_converted",
        label: "Forest converted to agricultural land? (Y/N)",
        type: "radio",
        options: YES_NO,
        required: false,
        dependency: {
          field: "biobased.contains_biobased",
          value: "Yes, contains bio-based feedstock",
        },
      },
    ],
  },

  // =========================================================================
  // Section H — Methodology & allocation (Q21–Q23)
  // =========================================================================
  {
    id: "section_h_methodology",
    title: "Section H: Methodology & Allocation",
    fields: [
      {
        // Q21 header — three sub-fields below, all mandatory per Word doc.
        // Plain heading style (no blue card) so the question reads as a
        // section header above its sub-fields rather than a callout box.
        name: "methodology.q21_intro",
        type: "info",
        label: "21. Which standards and characterisation factors did you apply?",
        content: "",
        className: "",
      },
      {
        // Fixed default (ISO 14067) seeded in SupplierQuestionnaire; disabled
        // so the supplier does not change it.
        name: "methodology.cross_sectoral_standard",
        label: "Cross-sectoral standard(s)",
        type: "text",
        required: true,
        disabled: true,
        placeholder: "ISO 14067",
      },
      {
        name: "methodology.product_sector_pcr",
        label: "Product / sector PCR (reference)",
        type: "text",
        required: true,
        placeholder: "e.g. Catena-X PCF Rulebook v4",
      },
      {
        // Fixed default (AR6) seeded in SupplierQuestionnaire; disabled so the
        // supplier does not change it.
        name: "methodology.ipcc_gwp_version",
        label: "IPCC GWP version",
        type: "text",
        required: true,
        disabled: true,
        placeholder: "AR6",
      },
      {
        name: "methodology.mass_balancing_used",
        label: "Mass balancing used? (Y/N)",
        type: "radio",
        options: YES_NO,
        required: true,
      },
      {
        name: "methodology.certificate_scheme",
        label: "Certificate scheme (e.g. REDCert II, ISCC Plus)",
        type: "text",
        required: true,
        placeholder: "Chain-of-custody / certificate scheme",
      },
      {
        name: "methodology.free_attribution_used",
        label: "Free attribution used? (Y/N)",
        type: "radio",
        options: YES_NO,
        required: true,
      },
      {
        // Q23 header — three sub-fields below per Word doc.
        name: "methodology.q23_intro",
        type: "info",
        label: "23. How are shared emissions allocated?",
        content: "",
        className: "",
      },
      {
        name: "methodology.recycled_carbon_method",
        label: "Recycled-carbon method (optional)",
        type: "text",
        required: false,
        placeholder: "e.g. Cut-off (per §5.2.5)",
      },
      {
        name: "methodology.waste_incineration_method",
        label: "Waste-incineration method",
        type: "text",
        required: true,
        placeholder: "e.g. Polluter pays principle (per §5.2.4)",
      },
      {
        name: "methodology.allocation_rationale",
        label: "Allocation rationale (short) (optional)",
        type: "textarea",
        required: false,
        placeholder: "Briefly describe your allocation approach",
      },
    ],
  },

  // =========================================================================
  // Section I — Boundary, technology & data quality (Q24–Q25)
  // =========================================================================
  {
    id: "section_i_boundary_dqr",
    title: "Section I: Boundary, Technology & Data Quality",
    fields: [
      {
        // Q24 header — the 4 fields below are sub-rows of this question.
        name: "boundary.q24_intro",
        type: "info",
        label: "24. What lies inside the assessment boundary, and is carbon capture used?",
        content: "",
        className: "",
      },
      {
        name: "boundary.processes_inside",
        label: "Processes inside the boundary (optional)",
        type: "textarea",
        required: false,
        placeholder: "List the processes covered by this footprint",
      },
      {
        name: "boundary.ccs_ccu_used",
        label: "Is CCS / CCU CO₂ capture used? (Y/N)",
        type: "radio",
        options: YES_NO,
        required: true,
      },
      {
        name: "boundary.excluded_flows",
        label: "Excluded (cut-off) flows, or write 'No exemption'",
        type: "textarea",
        required: true,
        placeholder: "Describe excluded flows, or write 'No exemption'",
      },
      {
        name: "boundary.exempted_percent",
        label: "Estimated exempted emissions as % of total PCF",
        type: "number",
        required: true,
        min: 0,
        max: 3,
        placeholder: "Enter 0 if no exemption; must be ≤ 3%",
      },
      {
        name: "dqr.primary_data_share",
        label: "25. Primary data share (%) (optional)",
        type: "number",
        required: false,
        min: 0,
        max: 100,
        placeholder: "0-100",
      },
      {
        name: "dqr.secondary_ef_source",
        label: "Secondary emission-factor source (e.g. ecoinvent 3.8)",
        type: "text",
        required: false,
        placeholder: "e.g. ecoinvent 3.8",
      },
      {
        name: "dqr.data_year",
        label: "Year the data was collected",
        type: "number",
        required: false,
        placeholder: "e.g. 2024",
      },
      {
        name: "dqr.technological",
        label: "Technological DQR (1-5, 1 = best)",
        type: "select",
        options: DQR_SCALE,
        required: false,
        placeholder: "Select",
      },
      {
        name: "dqr.geographical",
        label: "Geographical DQR (1-5, 1 = best)",
        type: "select",
        options: DQR_SCALE,
        required: false,
        placeholder: "Select",
      },
      {
        name: "dqr.temporal",
        label: "Temporal DQR (1-5, 1 = best)",
        type: "select",
        options: DQR_SCALE,
        required: false,
        placeholder: "Select",
      },
    ],
  },

  // =========================================================================
  // Section J — Verification & attestation (Q26–Q27)
  // =========================================================================
  {
    id: "section_j_verification",
    title: "Section J: Verification & Attestation",
    fields: [
      {
        name: "verification.product_certified",
        label: "26. Is the product certified? (Y/N)",
        type: "radio",
        options: YES_NO,
        required: true,
      },
      {
        name: "verification.certification_scheme",
        label: "Certification scheme",
        type: "text",
        required: false,
        placeholder: "Scheme name",
        dependency: { field: "verification.product_certified", value: "Yes" },
      },
      {
        name: "verification.certificate_number",
        label: "Certificate number",
        type: "text",
        required: false,
        placeholder: "Certificate number",
        dependency: { field: "verification.product_certified", value: "Yes" },
      },
      {
        name: "verification.certificate_valid_from",
        label: "Certificate valid FROM",
        type: "date",
        required: false,
        dependency: { field: "verification.product_certified", value: "Yes" },
      },
      {
        name: "verification.certificate_valid_to",
        label: "Certificate valid TO",
        type: "date",
        required: false,
        dependency: { field: "verification.product_certified", value: "Yes" },
      },
      {
        name: "verification.pcf_verified",
        label: "Has the PCF been independently verified? (Y/N)",
        type: "radio",
        options: YES_NO,
        required: true,
      },
      {
        // Fixed default (seeded in SupplierQuestionnaire); disabled.
        name: "verification.attestation_type",
        label: "Attestation type",
        type: "text",
        required: true,
        disabled: true,
        placeholder: "PCF Program Certification",
        dependency: { field: "verification.pcf_verified", value: "Yes" },
      },
      {
        // Fixed default (seeded in SupplierQuestionnaire); disabled.
        name: "verification.conformant_standards",
        label: "Conformant standard(s) / PCR(s)",
        type: "text",
        required: true,
        disabled: true,
        placeholder: "Catena-X Product Carbon Footprint Rulebook v4",
        dependency: { field: "verification.pcf_verified", value: "Yes" },
      },
      {
        name: "verification.attestation_scheme_standard",
        label: "Attestation scheme standard",
        type: "text",
        required: true,
        placeholder: "Scheme standard",
        dependency: { field: "verification.pcf_verified", value: "Yes" },
      },
      {
        name: "verification.attestation_id",
        label: "Attestation ID",
        type: "text",
        required: true,
        placeholder: "Attestation identifier",
        dependency: { field: "verification.pcf_verified", value: "Yes" },
      },
      {
        name: "verification.attestation_issuer",
        label: "Issuer of attestation",
        type: "text",
        required: true,
        placeholder: "Issuing body",
        dependency: { field: "verification.pcf_verified", value: "Yes" },
      },
      {
        name: "verification.issuer_id",
        label: "Issuer ID (URN / BPN) (optional)",
        type: "text",
        required: false,
        placeholder: "URN / BPN",
        dependency: { field: "verification.pcf_verified", value: "Yes" },
      },
      {
        name: "verification.attestation_url",
        label: "Link to attestation (URL) (optional)",
        type: "text",
        required: false,
        placeholder: "https://",
        dependency: { field: "verification.pcf_verified", value: "Yes" },
      },
      {
        name: "verification.attestation_completed_at",
        label: "Attestation completed at (optional)",
        type: "date",
        required: false,
        dependency: { field: "verification.pcf_verified", value: "Yes" },
      },
      {
        // Q27 — the six volume types are pre-listed (fixed rows); the supplier
        // only enters Volume and Share for each. Rows can't be added/removed.
        name: "verification.volumes",
        label: "27. Which production or product volumes are certified or verified? (optional)",
        type: "table",
        required: false,
        lockAddRemove: true,
        prefillRows: VOLUME_TYPES.map((t) => ({ volume_type: t })),
        placeholder: "Volume types are pre-listed; enter the volume and share for each.",
        columns: [
          { name: "volume_type", label: "Volume type", type: "text", readOnly: true },
          { name: "volume", label: "Volume (units / tonnes)", type: "number", min: 0, placeholder: "0.00" },
          { name: "share_percent", label: "Share (%)", type: "number", min: 0, max: 100, placeholder: "0-100" },
        ],
      },
    ],
  },

  // =========================================================================
  // Section K — Anything else (Q28)
  // =========================================================================
  {
    id: "section_k_other",
    title: "Section K: Anything Else",
    fields: [
      {
        name: "notes.comments",
        label: "28. Are there any assumptions, exclusions or additional notes? (optional)",
        type: "textarea",
        required: false,
        placeholder: "Any assumptions, exclusions, or comments",
      },
    ],
  },
];
