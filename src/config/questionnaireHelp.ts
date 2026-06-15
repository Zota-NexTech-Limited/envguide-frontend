/**
 * Plain-language guidance for the supplier questionnaire.
 *
 * Many suppliers are not sustainability experts, so each question gets a short
 * explanation, a "where do I find this" hint, and an example answer. This data
 * powers two things:
 *   1. Inline help shown next to questions (zero AI calls for simple cases).
 *   2. The context handed to the Eco AI assistant so its chat/voice answers are
 *      grounded in the exact question the supplier is looking at.
 *
 * SECTION_HELP is keyed by `QuestionnaireSection.id`.
 * FIELD_HELP is keyed by `QuestionnaireField.name` (the dotted path in the schema).
 *
 * Only the currently-active questions are covered today (General Information,
 * Organization Details, Product Details, Scope 2, Scope 3). Add more entries as
 * the questionnaire grows, the assistant degrades gracefully when one is missing.
 */

export interface FieldHelp {
  /** What the question is really asking, in plain words. */
  plain?: string;
  /** Where the supplier can find the data to answer it. */
  whereToFind?: string;
  /** A short, concrete example answer (with units where relevant). */
  example?: string;
}

export interface SectionHelp {
  /** One or two sentences on what this whole section is for. */
  summary: string;
  /** Common place(s) to gather the data for this section. */
  whereToFind?: string;
}

export const SECTION_HELP: Record<string, SectionHelp> = {
  general_information: {
    summary:
      "A short introduction and consent. It explains how your data is used (only for sustainability assessment) and what counts as renewable electricity. Just read and acknowledge.",
  },
  section_a_company_product: {
    summary:
      "Who you are and which exact product this footprint is for: legal name, company ID, product name and IDs, the declared unit, and where it is made.",
    whereToFind:
      "Your company registration documents, the product spec sheet or datasheet, and your facility address records.",
  },
  section_b_scope_period: {
    summary:
      "The time period the data covers, how long the result stays valid, whether the PCF is historical or forward-looking, and how far the boundary reaches (cradle to gate or cradle to grave).",
    whereToFind:
      "Your reporting calendar (usually the prior calendar year) and your PCF methodology decision.",
  },
  section_c_bom: {
    summary:
      "The bill of materials: every material and component in one unit of the product, with its mass share and any biogenic or recycled carbon, plus any saleable co-products.",
    whereToFind:
      "Your bill of materials (BOM), material datasheets, and sales records for any co-products.",
  },
  section_d_energy_process: {
    summary:
      "Energy used to make the product (electricity and its renewable share, other fuels), any direct process gases, quality-control and IT energy, and production waste and its treatment.",
    whereToFind:
      "Electricity and fuel invoices or meter readings, and your waste contractor statements.",
  },
  section_e_packaging: {
    summary:
      "Whether packaging is in scope, the packaging materials and their weight, how packaging reaches your site, and the packaging waste generated.",
    whereToFind:
      "Packaging spec sheets or a scale, plus delivery notes and freight invoices for packaging transport.",
  },
  section_f_transport: {
    summary:
      "Whether you arrange outbound distribution, and the transport legs (mode, route, weight and distance) for the product and its components.",
    whereToFind:
      "Delivery notes and freight invoices, which show mode, route, weight and distance.",
  },
  section_g_biobased: {
    summary:
      "Only if your product or packaging contains bio-based feedstock: the feedstock type, quantity, biogenic carbon content, and any land use or land-use change.",
    whereToFind:
      "Material datasheets for bio-based content and your feedstock supplier information.",
  },
  section_h_methodology: {
    summary:
      "The standards and PCR you followed, whether mass balancing or a chain-of-custody scheme was used, and how shared emissions are allocated.",
    whereToFind:
      "Your PCF methodology notes, certificate schemes, and the applicable product category rule (PCR).",
  },
  section_i_boundary_dqr: {
    summary:
      "What is inside the assessment boundary, whether carbon capture is used, any excluded flows, and a self-rating of your data quality (primary data share and DQR scores).",
    whereToFind:
      "Your process map and the sources of your emission factors (for example ecoinvent).",
  },
  section_j_verification: {
    summary:
      "Whether the product is certified and whether the PCF was independently verified, with the attestation details and the certified or verified volumes.",
    whereToFind:
      "Your certificates and any verification or attestation reports.",
  },
  section_k_other: {
    summary:
      "A free-text space for any assumptions, exclusions or notes you want to add.",
  },
};

export const FIELD_HELP: Record<string, FieldHelp> = {
  // ===== Version 3.0 (active) field guidance =====
  "product.declared_unit": {
    plain:
      "The unit the footprint is reported per, for example one piece or one kilogram of the product.",
    whereToFind: "Pick the unit you sell or quote the product in.",
    example: "piece (declared quantity 1)",
  },
  "product.manufacturing_sites": {
    plain:
      "Each factory or site where the product is made, with its region, country and subdivision.",
    whereToFind: "Your facility address records.",
    example: "Plant 2, Pune, Maharashtra, India",
  },
  "scope_period.reference_start": {
    plain:
      "The 12-month window your data covers. Usually the prior calendar year; keep every answer consistent with it.",
    whereToFind: "Align it with your financial year or a calendar year.",
    example: "01 Jan 2024 to 31 Dec 2024",
  },
  "scope_period.pcf_type": {
    plain:
      "Whether this footprint is based on historical, measured data (retrospective) or is forward-looking (prospective).",
    whereToFind: "Decide based on whether the data is already measured or estimated for future production.",
    example: "Retrospective PCF (historical / measured data)",
  },
  "scope_period.system_boundary": {
    plain:
      "How far the footprint reaches. Cradle to gate stops at your factory gate; cradle to grave includes use and end of life.",
    whereToFind: "The default for Catena-X is cradle to gate.",
    example: "Cradle-to-Gate",
  },
  "bom.bill_of_materials": {
    plain:
      "Every material and component in one unit of the product, with its mass share and any biogenic or recycled carbon content.",
    whereToFind: "Your bill of materials (BOM) and material datasheets.",
    example: "Steel, machining, 60% mass; ABS, injection moulding, 40% mass",
  },
  "bom.co_products_produced": {
    plain:
      "Answer Yes if the same process also makes another saleable output (so emissions can be shared fairly), otherwise No.",
    whereToFind: "Ask your production team what saleable by-products the process creates.",
    example: "Yes",
  },
  "energy.electricity": {
    plain:
      "Electricity used to make the product over the reporting period, and how much of it was renewable.",
    whereToFind: "Meter readings or electricity invoices. The default unit is kWh.",
    example: "120000 kWh, 20% renewable",
  },
  "energy.production_waste": {
    plain:
      "The waste your process produces, how much, and how it is treated (recycled, landfilled, incinerated).",
    whereToFind: "Your waste contractor invoices or disposal manifests.",
    example: "Metal scrap, 200 kg, recycled",
  },
  "packaging.include_packaging": {
    plain:
      "Whether packaging should be counted in this footprint. If excluded, the packaging questions are skipped.",
    whereToFind: "Follow the customer's request or the applicable PCR.",
    example: "Yes, include packaging",
  },
  "packaging.materials_used": {
    plain:
      "The packaging used to ship the product, by material type and weight per unit.",
    whereToFind: "Packaging spec sheets, or simply weigh the packaging.",
    example: "Cardboard box, 0.12 kg; LDPE film, 0.01 kg",
  },
  "transport.legs": {
    plain:
      "How the product and components move: the mode, route, weight and distance for each journey.",
    whereToFind: "Delivery notes or freight invoices. Weight in tonnes, distance in km.",
    example: "Road truck, 350 km, 2 tonnes",
  },
  "methodology.cross_sectoral_standard": {
    plain: "The overarching standard you applied to calculate the footprint.",
    whereToFind: "Your PCF methodology notes.",
    example: "ISO 14067",
  },
  "boundary.excluded_flows": {
    plain:
      "Anything you left out of the calculation (cut-off flows). If nothing was excluded, write 'No exemption'.",
    whereToFind: "Your process map and any documented assumptions.",
    example: "No exemption",
  },
  "dqr.primary_data_share": {
    plain:
      "The share of the result based on your own measured (primary) data rather than generic averages.",
    whereToFind: "Estimate from how much of the BOM and energy you measured directly.",
    example: "70",
  },
  "verification.pcf_verified": {
    plain:
      "Whether an independent party has checked and confirmed this footprint.",
    whereToFind: "Your verification or attestation report, if any.",
    example: "No",
  },

  // ===== Legacy field guidance (kept for reference; not used by the V3 schema) =====
  // Section 1: Organization Details
  "organization_details.organization_name": {
    plain: "The legal name of your company, the one that supplies this component.",
    whereToFind: "Your company registration or incorporation documents.",
    example: "Acme Components Pvt Ltd",
  },
  "organization_details.email_address": {
    plain:
      "A contact email we can use about this sustainability data, ideally someone who can answer follow-up questions.",
    whereToFind: "Use your work email, or your sustainability or operations contact.",
    example: "sustainability@acme.com",
  },
  "organization_details.annual_reporting_period": {
    plain:
      "The 12-month period that all your answers should cover. Pick one year and keep every answer consistent with it.",
    whereToFind:
      "Align it with your financial year or a calendar year. Your finance team can confirm.",
    example: "1 Jan 2024 to 31 Dec 2024",
  },

  // Section 2: Product Details
  "product_details.production_site_details": {
    plain:
      "The factory or site location(s) where you make the component you supply.",
    whereToFind: "Your facility address records.",
    example: "Plant 2, Pune, India",
  },
  "product_details.products_manufactured": {
    plain:
      "List each component you supply with its weight per unit, the unit of measure, the quantity, and the price. This describes what you actually ship.",
    whereToFind:
      "Your bill of materials (BOM), product spec sheets, and ERP or sales records for quantity and price.",
    example: "Steel bracket, 0.45 kg per unit, 10000 units, 1.20 per unit",
  },
  "product_details.any_co_product_have_economic_value": {
    plain:
      "Answer Yes if making your product also creates a useful by-product you sell or reuse (for example scrap metal or offcuts that have value). Otherwise No.",
    whereToFind: "Ask your production team what saleable by-products the process creates.",
    example: "Yes",
  },
  "product_details.co_products": {
    plain:
      "List those valuable by-products and roughly what they are worth. This lets the footprint be shared fairly between the main product and the by-products.",
    whereToFind: "Your sales records for scrap or by-product revenue.",
    example: "Steel offcuts, sold as scrap, 0.30 per kg",
  },

  // Section 4: Scope 2 (Purchased Energy)
  "scope_2.purchased_energy": {
    plain:
      "How much electricity and other energy you bought from outside to make the product during the reporting year, and how much of it was renewable.",
    whereToFind:
      "Add up the kWh from your 12 monthly electricity bills, or use the annual total. Check any renewable energy certificates for the renewable share.",
    example: "120000 kWh for the year, of which 20% renewable",
  },

  // Section 5: Scope 3 (Other Indirect Emissions)
  "scope_3.materials.raw_materials": {
    plain:
      "The raw materials that go into your product, listed by type and how much of each is used per unit.",
    whereToFind:
      "Your bill of materials (BOM), material spec sheets, and purchase invoices from your own suppliers.",
    example: "Aluminium, 0.30 kg per unit; ABS plastic, 0.05 kg per unit",
  },
  "scope_3.packaging.materials_used": {
    plain:
      "The packaging used to ship the product, listed by material type and weight per unit.",
    whereToFind:
      "Your packaging spec sheets, or simply weigh the packaging on a scale.",
    example: "Cardboard box, 0.12 kg per unit; LDPE film, 0.01 kg per unit",
  },
  "scope_3.waste_disposal.types_and_weight": {
    plain:
      "The waste your process produces, how much of it, and how it is dealt with (recycled, landfilled, incinerated).",
    whereToFind:
      "Your waste contractor's invoices or disposal manifests, which list weights and treatment.",
    example: "Metal scrap, 200 kg per year, recycled",
  },
  "scope_3.logistics.transport_modes": {
    plain:
      "How your materials come in and your products go out, the mode of transport and the distance.",
    whereToFind:
      "Your shipping and logistics records or freight invoices, which show mode and route.",
    example: "Road truck, 350 km from plant to customer",
  },
};
