/**
 * Presentational layout for the Full Form UI. Groups the flat V3 schema fields
 * (questionnaireSchemaV3.ts) into the mock's "question cards" by REFERENCING
 * field `name`s. The flat schema stays the source of truth for control type,
 * options, required, placeholder and dependency — this file only decides
 * grouping, headings, blurbs and the General Information consent content.
 *
 * Nothing here changes formData keys, so the backend mapper, PDF builder and
 * preview modal are unaffected.
 */

export interface QuestionGroup {
  /** Badge number, e.g. "1", "8a". Absent → no badge. */
  num?: string;
  /** Clean question heading (number lives in the badge). */
  label: string;
  help?: string;
  /** Flat-schema field name rendered as the primary control. */
  primaryName?: string;
  /** Flat-schema field names rendered in the follow-up panel. */
  subNames?: string[];
  subsLabel?: string;
  /** Flat-schema table field name. */
  tableName?: string;
  /**
   * Optional explicit gate. When set, the table + subs are hidden behind a
   * dashed gate-hint panel until the gate field equals gateValue. When unset,
   * gating falls back to each field's own schema `dependency`.
   */
  gateName?: string;
  gateValue?: string;
  gateHint?: string;
}

export interface ConsentGroup {
  heading?: string;
  ordered?: boolean;
  items: string[];
}

export interface ConsentCardDef {
  ackName: string; // flat-schema checkbox field name (value persists)
  title: string;
  intro?: string;
  groups: ConsentGroup[];
  checkboxLabel: string;
  required?: boolean;
}

export interface NoticeDef {
  title: string;
  body: string;
}

export interface GeneralLayout {
  notice: NoticeDef;
  consents: ConsentCardDef[];
}

export const SECTION_META: Record<string, { blurb: string }> = {
  general_information: {
    blurb:
      "Please read and acknowledge the items below, then add a few details to identify this submission.",
  },
  section_a_company_product: {
    blurb: "Tell us who you are and which product this footprint describes.",
  },
  section_b_scope_period: {
    blurb:
      "Define the time period the data covers and the boundary of the assessment.",
  },
  section_c_bom: { blurb: "Break down what one unit of the product is made of." },
  section_d_energy_process: {
    blurb: "Capture manufacturing energy, process emissions and waste.",
  },
  section_e_packaging: {
    blurb: "Account for packaging materials, transport and waste.",
  },
  section_f_transport: {
    blurb: "Record outbound transport legs for the product.",
  },
  section_g_biobased: {
    blurb:
      "Only needed if the product or packaging contains bio-based feedstock.",
  },
  section_h_methodology: {
    blurb: "Standards, characterisation factors and allocation choices.",
  },
  section_i_boundary_dqr: {
    blurb: "Define the assessment boundary and rate your data quality.",
  },
  section_j_verification: {
    blurb: "Certification, verification and attestation details.",
  },
  section_k_other: { blurb: "Anything else we should know." },
};

// Cleaner display labels for a few sub-fields whose schema label carries a
// leading number or punctuation that reads awkwardly inside a follow-up panel.
export const LABEL_OVERRIDES: Record<string, string> = {
  "company.legal_name": "Company legal name",
  "company.bpn": "Business Partner Number (BPNL)",
  "company.other_identifier": "Other identifier (DUNS / VAT / CIN)",
  "product.name": "Product name",
  "product.declared_unit": "Declared unit",
  "methodology.mass_balancing_used": "Mass balancing used?",
  "scope_period.reference_start": "Reference period: start",
  "scope_period.reference_end": "Reference period: end",
  "scope_period.validity_start": "Validity: start",
  "scope_period.validity_end": "Validity: end",
};

export const GENERAL_LAYOUT: GeneralLayout = {
  notice: {
    title: "Data privacy (GDPR)",
    body:
      "All information provided is confidential and used only for corporate and product-level sustainability assessment.",
  },
  consents: [
    {
      ackName: "general_information.re_technologies_acknowledgement",
      required: true,
      title: "Eligible technologies considered as renewable electricity (RE)",
      intro:
        "Please read the following technologies to be considered as renewable electricity (RE) and acknowledge them.",
      groups: [
        {
          heading: "Eligible technologies",
          ordered: true,
          items: [
            "Wind",
            "Hydro",
            "Solar power",
            "Geothermal",
            "Solid, liquid and gaseous biomass from fuels (woody waste, landfill gas, wastewater methane, animal & other organic waste, energy crops)",
            "Ocean-based energy resources captured through tidal and wave technologies",
          ],
        },
        {
          heading: "Excluded technologies",
          ordered: true,
          items: [
            "Electricity from nuclear power is not regarded as renewable electricity.",
            "Electricity from waste combustion is not regarded as renewable electricity.",
          ],
        },
      ],
      checkboxLabel:
        "I acknowledge that I have read and understood the eligible technologies considered as renewable electricity (RE) above.",
    },
    {
      ackName: "general_information.re_procurement_acknowledgement",
      required: true,
      title: "Procurement mechanisms",
      intro:
        "Electricity is regarded as renewable if provided using one of the mechanisms below, respecting the requirements regarding double counting. Please review which apply to your processes. If none apply in the country where carbon emissions occur, an alternative locally accepted type of proof at the time of production may be used.",
      groups: [
        {
          heading: "Acronyms",
          ordered: false,
          items: [
            "PPA: Power Purchase Agreements",
            "EAC: Energy Attribute Certificates",
            "iREC / I-REC: International Green Energy Certificates",
            "GOO: Guarantee of Origin",
          ],
        },
        {
          heading: "Procurement mechanisms",
          ordered: true,
          items: [
            "On-site generation: EACs generated",
            "On-site generation: no EACs generated",
            "Off-site generation: PPA / sleeved PPA (proof of delivery necessary)",
            "Off-site generation: virtual PPA (proof via EAC necessary)",
            "Off-site generation: green power tariff / green power product",
            "Power supplied by an electricity provider that takes over responsibility to provide the electricity either directly from renewable sources (e.g. through PPAs) or procures and deletes unbundled EACs for the supplied electricity",
            "Unbundled EACs",
            "Unbundled RECs / I-RECs",
          ],
        },
      ],
      checkboxLabel:
        "I acknowledge that I have read and understood the procurement mechanisms above.",
    },
    {
      ackName: "general_information.double_counting_acknowledgement",
      required: true,
      title: "Double counting",
      intro:
        "Please acknowledge that the mechanism you use does not fall under double counting. Examples of prohibited double uses include, but are not limited to:",
      groups: [
        {
          ordered: true,
          items: [
            "When the same EAC is sold by one party to more than one party, or any case where another party has a conflicting contract for the EACs or the renewable electricity.",
            "When the same EAC is claimed by more than one party, including any expressed or implied environmental claims relating to renewable electricity, environmental labelling or disclosure requirements, e.g. representing the energy as renewable in another entity's product or portfolio resource mix for marketing or disclosure.",
            "When the same EAC is used by an electricity provider or utility to meet an environmental mandate (such as an RPS) and is also used to satisfy customer sales.",
            'Use of one or more attributes of the renewable energy or EAC by another party, e.g. an EAC simultaneously sold as "renewable electricity" to one party while one or more attributes of the same MWh (such as CO2 reduction) are sold to another party.',
          ],
        },
      ],
      checkboxLabel:
        "I acknowledge my mechanisms do not fall under double counting.",
    },
  ],
};

// Question groups for every section EXCEPT general_information (which renders
// from GENERAL_LAYOUT). Keyed by schema section id.
export const SECTION_LAYOUT: Record<string, QuestionGroup[]> = {
  // Rendered after the GDPR notice + acknowledgement consents on the General
  // Information step.
  general_information: [
    {
      label: "Submission details",
      subsLabel: "About this submission",
      subNames: ["contact.person", "contact.email"],
    },
  ],

  section_a_company_product: [
    {
      num: "1",
      label:
        "What is your company's full legal name and registration identifier?",
      subsLabel: "Company details",
      subNames: [
        "company.legal_name",
        "company.company_id",
        "company.bpn",
        "company.other_identifier",
      ],
    },
    {
      num: "2",
      label: "Which product does this carbon footprint apply to?",
      subsLabel: "Product details",
      subNames: [
        "product.name",
        "product.product_id",
        "product.description",
        "product.classification",
      ],
    },
    {
      num: "3",
      label:
        "In which unit is the carbon footprint declared, and for what quantity?",
      subsLabel: "Declared basis",
      subNames: [
        "product.declared_unit",
        "product.declared_unit_quantity",
        "product.declared_mass",
        "product.price",
        "product.production_period",
      ],
    },
    {
      num: "4",
      label: "At which site(s) is the product manufactured?",
      tableName: "product.manufacturing_sites",
    },
  ],

  section_b_scope_period: [
    {
      num: "5",
      label:
        "Which time period does the data cover, and how long should the result remain valid?",
      subsLabel: "Period & validity dates",
      subNames: [
        "scope_period.reference_start",
        "scope_period.reference_end",
        "scope_period.validity_start",
        "scope_period.validity_end",
      ],
    },
    {
      num: "6",
      label: "Is this a retrospective or a prospective PCF?",
      primaryName: "scope_period.pcf_type",
    },
    {
      num: "7",
      label: "Which system boundary does this footprint cover?",
      primaryName: "scope_period.system_boundary",
    },
  ],

  section_c_bom: [
    {
      num: "8",
      label:
        "List every material and component in one unit of the product, with biogenic and recycled characteristics.",
      tableName: "bom.bill_of_materials",
    },
    {
      num: "8a",
      label:
        "Can you provide a component- or material-specific emission factor?",
      primaryName: "bom.component_specific_ef_available",
      tableName: "bom.component_ef_details",
      gateName: "bom.component_specific_ef_available",
      gateValue: "Yes",
      gateHint:
        'Select "Yes" above to list each component / material and its emission factor.',
    },
    {
      num: "8b",
      label:
        "Which process consumable materials are used during manufacturing that are not part of the Bill of Materials?",
      help: "Optional. List consumables used up during production (e.g. lubricants, solvents, welding gas) that are not counted in the BOM.",
      tableName: "bom.process_consumables",
    },
    {
      // Single card: Yes reveals the co-product table; No shows nothing
      // (no gateHint, so the gate renders nothing when "No").
      num: "9",
      label:
        "Does the same manufacturing process also yield other saleable co-products? If yes, list each co-product with its price and mark the primary product.",
      help: "Only applies where one process produces more than one sellable output, so shared emissions can be allocated fairly. Component name is inferred from the MPN, so only the MPN, co-product name, price and primary-product flag are captured.",
      primaryName: "bom.co_products_produced",
      tableName: "bom.co_products",
      gateName: "bom.co_products_produced",
      gateValue: "Yes",
    },
  ],

  section_d_energy_process: [
    {
      num: "10",
      label:
        "How much electricity was consumed to manufacture the product, and what share was renewable?",
      help: "Use meter readings or electricity invoices for the reporting period. The default unit is kWh.",
      tableName: "energy.electricity",
    },
    {
      num: "10a",
      label:
        "What is the total weight of each product manufactured at the factory level during the reporting period?",
      tableName: "energy.factory_product_weights",
    },
    {
      num: "10b",
      label:
        "How many units of each product were manufactured during the reporting period?",
      tableName: "energy.factory_product_units",
    },
    {
      num: "11",
      label:
        "Which fuels, energy carriers, or utilities were used On-Site during the manufacturing of the declared product?",
      tableName: "energy.other_fuels",
    },
    {
      num: "12",
      label:
        "Does the manufacturing process release greenhouse gases directly (not from burning fuel)?",
      tableName: "energy.direct_process_gases",
    },
    {
      num: "13",
      label: "How much energy did quality control and production IT consume?",
      help: "If this energy is already included in the Q10 electricity total, mark 'Yes' under 'Already in Q10' to avoid double-counting.",
      tableName: "energy.qc_it_energy",
    },
    {
      num: "14",
      label:
        "What production and quality-control waste was generated, and how was it treated?",
      tableName: "energy.production_waste",
    },
  ],

  section_e_packaging: [
    {
      num: "15",
      label: "Should packaging be included within this footprint?",
      primaryName: "packaging.include_packaging",
    },
    {
      num: "16",
      label: "Which packaging materials are used for the product?",
      tableName: "packaging.materials_used",
      gateHint:
        'Select "Yes, include packaging" in Q15 to list packaging materials.',
    },
    {
      num: "16a",
      label: "How is each packaging item transported to your site?",
      help: "One row per packaging transport leg. Weight, distance in km. Use Air for any air-freighted packaging.",
      tableName: "packaging.transport",
      gateHint:
        'Select "Yes, include packaging" in Q15 to add packaging transport legs.',
    },
    {
      num: "17",
      label: "What packaging waste was generated, and how was it treated?",
      tableName: "packaging.waste",
      gateHint:
        'Select "Yes, include packaging" in Q15 to record packaging waste.',
    },
  ],

  section_f_transport: [
    {
      num: "18",
      label:
        "Is outbound (distribution) transport arranged and paid for by your company?",
      primaryName: "transport.outbound_in_boundary",
    },
    {
      num: "19",
      label: "What are the transport legs for the product and its components?",
      help: "One row per journey, from delivery notes or freight invoices. Weight in tonnes, distance in km.",
      tableName: "transport.legs",
      gateHint:
        'Select "Yes, distribution is within my boundary" in Q18 to add transport legs.',
    },
  ],

  section_g_biobased: [
    {
      num: "20",
      label: "Does the product or its packaging contain bio-based feedstock?",
      primaryName: "biobased.contains_biobased",
      tableName: "biobased.details",
      subsLabel: "Land use",
      subNames: [
        "biobased.uses_agri_forestry_land",
        "biobased.land_area_hectares",
        "biobased.forest_converted",
      ],
      gateName: "biobased.contains_biobased",
      gateValue: "Yes, contains bio-based feedstock",
      gateHint: 'Select "Yes" above to provide the bio-based feedstock details.',
    },
  ],

  section_h_methodology: [
    {
      num: "21",
      label: "Which standards and characterisation factors did you apply?",
      subsLabel: "Standards applied",
      subNames: [
        "methodology.cross_sectoral_standard",
        "methodology.product_sector_pcr",
        "methodology.ipcc_gwp_version",
      ],
    },
    {
      num: "22",
      label:
        "Did you apply any Sustainability Certificate or a chain-of-custody scheme?",
      subsLabel: "Certificate & chain-of-custody",
      subNames: [
        "methodology.certificate_scheme",
        "methodology.mass_balancing_used",
        "methodology.free_attribution_used",
      ],
    },
    {
      num: "23",
      label: "How are shared emissions allocated?",
      subsLabel: "Allocation methods",
      subNames: [
        "methodology.recycled_carbon_method",
        "methodology.waste_incineration_method",
        "methodology.allocation_rationale",
      ],
    },
  ],

  section_i_boundary_dqr: [
    {
      num: "24",
      label:
        "What lies inside the assessment boundary, and is carbon capture used?",
      help: "Exempted (cut-off) emissions must be ≤ 3% of the total PCF.",
      subsLabel: "Boundary & capture",
      subNames: [
        "boundary.processes_inside",
        "boundary.ccs_ccu_used",
        "boundary.excluded_flows",
        "boundary.exempted_percent",
      ],
    },
    {
      num: "25",
      label: "How would you rate the quality of your data?",
      subsLabel: "Data quality rating",
      subNames: [
        "dqr.primary_data_share",
        "dqr.secondary_ef_source",
        "dqr.data_year",
        "dqr.technological",
        "dqr.geographical",
        "dqr.temporal",
      ],
    },
  ],

  section_j_verification: [
    {
      num: "26",
      label: "Has the footprint been certified or independently verified?",
      subsLabel: "Certification & attestation",
      subNames: [
        "verification.product_certified",
        "verification.certification_scheme",
        "verification.certificate_number",
        "verification.certificate_valid_from",
        "verification.certificate_valid_to",
        "verification.pcf_verified",
        "verification.attestation_type",
        "verification.conformant_standards",
        "verification.attestation_scheme_standard",
        "verification.attestation_id",
        "verification.attestation_issuer",
        "verification.issuer_id",
        "verification.attestation_url",
        "verification.attestation_completed_at",
      ],
    },
    {
      num: "27",
      label: "Which production or product volumes are certified or verified?",
      tableName: "verification.volumes",
    },
  ],

  section_k_other: [
    {
      num: "28",
      label: "Are there any assumptions, exclusions or additional notes?",
      primaryName: "notes.comments",
    },
  ],
};
