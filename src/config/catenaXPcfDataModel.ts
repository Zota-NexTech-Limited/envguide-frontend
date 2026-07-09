/**
 * Catena-X Semantic PCF Data Model v3.0.0
 * ---------------------------------------
 * Field catalog used by the "Catena-X Semantic PCF Data Model" section on the
 * Footprint Connect (PCF Request) detail page.
 *
 * Source: Catena-X Semantic PCF Data Model v3.0.0 (cx-pcf-data-model-V3.0).
 * NOTE: Technical field names are NOT shown in the UI — only the human-facing
 * labels are rendered. Each field additionally carries a `key`: the dot-path
 * into the backend's assembled PCF submodel JSON (GET /api/quintari/pcf-submodel).
 * The key is used ONLY to look up the real value — it is never displayed.
 *
 * Requirement legend (the spreadsheet "M&O" column):
 *   M     → Mandatory
 *   O     → Optional
 *   D     → Derived / defaulted (system-populated)
 *   M2027 → Mandatory from 2027 (optional until then)
 *   Mif   → Conditional — Mandatory only if a rule is met
 *   Oif   → Conditional — Optional only if a rule is met
 */

export type Requirement = "M" | "O" | "D" | "M2027" | "Mif" | "Oif";

export interface CxField {
  /** Human-facing field label (never the technical field name). */
  label: string;
  requirement: Requirement;
  /**
   * Dot-path into the backend submodel JSON for value binding, e.g.
   * "companyAndProductInformation.0.companyInformation.0.companyName".
   * Never rendered. Omitted when the backend does not emit the field.
   */
  key?: string;
  /** Populated for conditional (Mif/Oif) fields — the "if" rule. */
  condition?: string;
}

export interface CxGroup {
  title: string;
  fields: CxField[];
}

export type SectionAccent = "emerald" | "sky" | "violet" | "amber";

export interface CxSection {
  title: string;
  /** Lucide icon key resolved in the component. */
  icon: "scope" | "company" | "assessment" | "lifecycle";
  accent: SectionAccent;
  blurb: string;
  groups: CxGroup[];
}

const ASSESSMENT_INFO = "pcfAssessmentAndMethodology.0.pcfAssessmentInformation.0";
const METHODOLOGY = "pcfAssessmentAndMethodology.0.pcfMethodology.0";
const LIFECYCLE = "productLifeCycleStagesAndEmissions.0";

export const CATENA_X_PCF_MODEL: CxSection[] = [
  {
    title: "Scope of PCF Form",
    icon: "scope",
    accent: "emerald",
    blurb: "What this declaration covers and which model version it follows.",
    groups: [
      {
        title: "Scope",
        fields: [
          {
            label: "Data model and version",
            requirement: "M",
            key: "scopeOfPcfForm.0.specVersion",
          },
          {
            label: "Partial or a full PCF declaration",
            requirement: "D",
            key: "scopeOfPcfForm.0.partialFullPcf",
          },
        ],
      },
    ],
  },
  {
    title: "Company & Product Information",
    icon: "company",
    accent: "sky",
    blurb: "Who is declaring and which product the footprint belongs to.",
    groups: [
      {
        title: "Company Information",
        fields: [
          {
            label: "Company name",
            requirement: "M",
            key: "companyAndProductInformation.0.companyInformation.0.companyName",
          },
          {
            label: "Company Ids",
            requirement: "M",
            key: "companyAndProductInformation.0.companyInformation.0.companyIds",
          },
        ],
      },
      {
        title: "Product Information",
        fields: [
          {
            label: "Product name",
            requirement: "M",
            key: "companyAndProductInformation.0.productInformation.0.productNameCompany",
          },
          {
            label: "Product identifiers",
            requirement: "M",
            key: "companyAndProductInformation.0.productInformation.0.productIds",
          },
          {
            label: "Product description",
            requirement: "O",
            key: "companyAndProductInformation.0.productInformation.0.productDescription",
          },
          {
            label: "Product classification",
            requirement: "O",
            key: "companyAndProductInformation.0.productInformation.0.productClassifications",
          },
          {
            label: "Declared unit",
            requirement: "M",
            key: "companyAndProductInformation.0.productInformation.0.declaredUnitOfMeasurement",
          },
          {
            label: "Quantity (of declared unit)",
            requirement: "M",
            key: "companyAndProductInformation.0.productInformation.0.declaredUnitAmount",
          },
          {
            label: "Product mass [kg] per declared unit amount",
            requirement: "M",
            key: "companyAndProductInformation.0.productInformation.0.productMassPerDeclaredUnit",
          },
        ],
      },
    ],
  },
  {
    title: "PCF Assessment & Methodology",
    icon: "assessment",
    accent: "violet",
    blurb: "How the footprint was calculated — boundaries, standards and data quality.",
    groups: [
      {
        title: "ID and Version",
        fields: [
          { label: "PCF ID", requirement: "M", key: `${ASSESSMENT_INFO}.idAndVersion.0.id` },
          {
            label: "Previous PCF IDs",
            requirement: "O",
            key: `${ASSESSMENT_INFO}.idAndVersion.0.precedingPfIds`,
          },
          {
            label: "PCF version",
            requirement: "D",
            key: `${ASSESSMENT_INFO}.idAndVersion.0.version`,
          },
          {
            label: "PCF status",
            requirement: "D",
            key: `${ASSESSMENT_INFO}.idAndVersion.0.status`,
          },
          {
            label: "Retrospective or prospective PCF types",
            requirement: "M",
            key: `${ASSESSMENT_INFO}.idAndVersion.0.retroOrProspectivePcfType`,
          },
        ],
      },
      {
        title: "Boundary Specifications",
        fields: [
          {
            label: "Cut-off rule",
            requirement: "M",
            key: `${ASSESSMENT_INFO}.boundarySpecifications.0.exemptedEmissionsPercent`,
          },
          {
            label: "Exemption rules: explanation",
            requirement: "O",
            key: `${ASSESSMENT_INFO}.boundarySpecifications.0.exemptedEmissionsDescription`,
          },
        ],
      },
      {
        title: "Technology",
        fields: [
          {
            label: "Important unit processes and used technologies",
            requirement: "O",
            key: `${ASSESSMENT_INFO}.technology.0.boundaryProcessesDescription`,
          },
          {
            label: "CCS / BECCS applied",
            requirement: "M",
            key: `${ASSESSMENT_INFO}.technology.0.ccsTechnologicalCO2CaptureIncluded`,
          },
        ],
      },
      {
        title: "Geography",
        fields: [
          {
            label: "City / state as country subdivision",
            requirement: "O",
            key: `${ASSESSMENT_INFO}.geography.0.geographyCountrySubdivision`,
          },
          {
            label: "Geography country",
            requirement: "O",
            key: `${ASSESSMENT_INFO}.geography.0.geographyCountry`,
          },
          {
            label: "Geography with region or subregion",
            requirement: "M",
            key: `${ASSESSMENT_INFO}.geography.0.geographyRegionOrSubregion`,
          },
        ],
      },
      {
        title: "Time",
        fields: [
          {
            label: "Reference period start",
            requirement: "M",
            key: `${ASSESSMENT_INFO}.time.0.referencePeriodStart`,
          },
          {
            label: "Reference period end",
            requirement: "M",
            key: `${ASSESSMENT_INFO}.time.0.referencePeriodEnd`,
          },
          {
            label: "Date of issue",
            requirement: "M",
            key: `${ASSESSMENT_INFO}.time.0.created`,
          },
          {
            label: "Validity period start",
            requirement: "O",
            key: `${ASSESSMENT_INFO}.time.0.validityPeriodStart`,
          },
          {
            label: "Validity period end",
            requirement: "M",
            key: `${ASSESSMENT_INFO}.time.0.validityPeriodEnd`,
          },
        ],
      },
      {
        title: "Standards",
        fields: [
          {
            label: "Cross-sectoral standards applied",
            requirement: "M",
            key: `${METHODOLOGY}.standards.0.crossSectoralStandards`,
          },
          {
            label: "Product or sector rules",
            requirement: "M",
            key: `${METHODOLOGY}.standards.0.productOrSectorSpecificRules`,
          },
        ],
      },
      {
        title: "GWP Characterization Factors",
        fields: [
          {
            label: "IPCC report version of GWP values",
            requirement: "M",
            key: `${METHODOLOGY}.gwpCharacterizationFactorDetails.0.ipccCharacterizationFactors`,
          },
        ],
      },
      {
        title: "Allocation in Foreground (Own Processes)",
        fields: [
          {
            label: "Allocation rules used",
            requirement: "O",
            key: `${METHODOLOGY}.allocationInForeground.0.allocationRulesDescription`,
          },
          {
            label:
              "Allocation approach for waste incineration with energy recovery",
            requirement: "M",
            key: `${METHODOLOGY}.allocationInForeground.0.allocationWasteIncineration`,
          },
          {
            label: "Calculation approach for material recycling",
            requirement: "O",
            key: `${METHODOLOGY}.allocationInForeground.0.allocationRecycledCarbon`,
          },
        ],
      },
      {
        title: "Mass Balancing Information",
        fields: [
          {
            label: "Mass balancing used",
            requirement: "M",
            key: `${METHODOLOGY}.massBalancingInformation.0.massBalancingUsed`,
          },
          {
            label: "Free attribution in mass balancing",
            requirement: "Mif",
            key: `${METHODOLOGY}.massBalancingInformation.0.freeAttributionInMassBalancing`,
            condition: 'Mandatory if "Mass balancing used" = true',
          },
          {
            label: "Mass balancing certificate scheme",
            requirement: "Mif",
            key: `${METHODOLOGY}.massBalancingInformation.0.massBalancingCertificateScheme`,
            condition: 'Mandatory if "Mass balancing used" = true',
          },
        ],
      },
      {
        title: "Data Sources & Quality",
        fields: [
          {
            label: "Primary Data Share (PDS)",
            requirement: "M2027",
            key: "pcfAssessmentAndMethodology.0.dataSourcesAndQuality.0.primaryDataShare",
          },
          {
            label: "Secondary data source and version",
            requirement: "M",
            key: "pcfAssessmentAndMethodology.0.dataSourcesAndQuality.0.secondaryEmissionFactorSources",
          },
          {
            label: "Technological representativeness",
            requirement: "M2027",
            key: "pcfAssessmentAndMethodology.0.dataSourcesAndQuality.0.technologicalDQR",
          },
          {
            label: "Temporal representativeness",
            requirement: "M2027",
            key: "pcfAssessmentAndMethodology.0.dataSourcesAndQuality.0.temporalDQR",
          },
          {
            label: "Geographical representativeness",
            requirement: "M2027",
            key: "pcfAssessmentAndMethodology.0.dataSourcesAndQuality.0.geographicalDQR",
          },
        ],
      },
      {
        title: "Verification & Certification Shares",
        fields: [
          {
            label: "Program Certification Share (PCS)",
            requirement: "O",
            key: "pcfAssessmentAndMethodology.0.verificationAndCertificationShares.0.programCertificationShare",
          },
          {
            label: "3rd-Party Verification Share (3PVS)",
            requirement: "O",
            key: "pcfAssessmentAndMethodology.0.verificationAndCertificationShares.0.productVerificationShare3rdParty",
          },
          {
            label: "2nd-Party Verification Share (2PVS)",
            requirement: "O",
            key: "pcfAssessmentAndMethodology.0.verificationAndCertificationShares.0.productVerificationShare2ndParty",
          },
          {
            label: "1st-Party Verification Share (1PVS)",
            requirement: "O",
            key: "pcfAssessmentAndMethodology.0.verificationAndCertificationShares.0.productVerificationShare1stParty",
          },
        ],
      },
      {
        title: "General",
        fields: [
          { label: "Comment", requirement: "O", key: "general.0.comment" },
          // pcfLegalStatement is not emitted by the current backend payload.
          { label: "Legal statement", requirement: "O" },
        ],
      },
    ],
  },
  {
    title: "Product Life Cycle Stages & Emissions",
    icon: "lifecycle",
    accent: "amber",
    blurb: "Stage-by-stage GWP results and carbon content of the product.",
    groups: [
      {
        title: "Production Stage",
        fields: [
          {
            label: "GWP total incl. biogenic uptake",
            requirement: "M",
            key: `${LIFECYCLE}.productionStage.0.pcfIncludingBiogenicUptake`,
          },
          {
            label: "GWP total excl. biogenic uptake",
            requirement: "M",
            key: `${LIFECYCLE}.productionStage.0.pcfExcludingBiogenicUptake`,
          },
          {
            label: "GWP fossil",
            requirement: "O",
            key: `${LIFECYCLE}.productionStage.0.fossilGhgEmissions`,
          },
          {
            label: "GWP biogenic emissions other than CO₂",
            requirement: "O",
            key: `${LIFECYCLE}.productionStage.0.biogenicNonCO2Emissions`,
          },
          {
            label: "GWP biogenic CO₂ uptake",
            requirement: "O",
            key: `${LIFECYCLE}.productionStage.0.biogenicCO2Uptake`,
          },
          {
            label: "GWP land use change (LUC, excl. iLUC)",
            requirement: "O",
            key: `${LIFECYCLE}.productionStage.0.landUseChangeGhgEmissions`,
          },
          {
            label: "GWP land management CO₂ emissions",
            requirement: "O",
            key: `${LIFECYCLE}.productionStage.0.landManagementBiogenicCO2Emissions`,
          },
          {
            label: "GWP land management CO₂ removals",
            requirement: "O",
            key: `${LIFECYCLE}.productionStage.0.landManagementBiogenicCO2Removals`,
          },
          {
            label: "GWP aviation emissions (upstream)",
            requirement: "O",
            key: `${LIFECYCLE}.productionStage.0.aircraftGhgEmissions`,
          },
        ],
      },
      {
        title: "Packaging Stage",
        fields: [
          {
            label: "Packaging emissions included",
            requirement: "M",
            key: `${LIFECYCLE}.packagingStage.0.packagingEmissionsIncluded`,
          },
          {
            label: "Packaging GWP total incl. biogenic uptake",
            requirement: "O",
            key: `${LIFECYCLE}.packagingStage.0.packagingPcfIncludingBiogenicUptake`,
          },
          {
            label: "Packaging GWP total excl. biogenic uptake",
            requirement: "O",
            key: `${LIFECYCLE}.packagingStage.0.packagingPcfExcludingBiogenicUptake`,
          },
          {
            label: "Packaging GWP fossil",
            requirement: "O",
            key: `${LIFECYCLE}.packagingStage.0.packagingFossilGhgEmissions`,
          },
          {
            label: "Packaging GWP biogenic emissions other than CO₂",
            requirement: "O",
            key: `${LIFECYCLE}.packagingStage.0.packagingBiogenicNonCO2Emissions`,
          },
          {
            label: "Packaging GWP biogenic CO₂ uptake",
            requirement: "O",
            key: `${LIFECYCLE}.packagingStage.0.packagingBiogenicCO2Uptake`,
          },
          {
            label: "Packaging GWP land use change (LUC, excl. iLUC)",
            requirement: "O",
            key: `${LIFECYCLE}.packagingStage.0.packagingLandUseChangeGhgEmissions`,
          },
          {
            label: "Packaging GWP land management CO₂ emissions",
            requirement: "O",
            key: `${LIFECYCLE}.packagingStage.0.packagingLandManagementBiogenicCO2Emissions`,
          },
          {
            label: "Packaging GWP land management CO₂ removals",
            requirement: "O",
            key: `${LIFECYCLE}.packagingStage.0.packagingLandManagementBiogenicCO2Removals`,
          },
          {
            label: "Packaging GWP aviation emissions (upstream)",
            requirement: "O",
            key: `${LIFECYCLE}.packagingStage.0.packagingAircraftGhgEmissions`,
          },
        ],
      },
      {
        title: "Distribution Stage",
        fields: [
          {
            label: "Distribution stage included",
            requirement: "M",
            key: `${LIFECYCLE}.distributionStage.0.distributionStageIncluded`,
          },
          {
            label: "Distribution GWP total incl. biogenic uptake",
            requirement: "O",
            key: `${LIFECYCLE}.distributionStage.0.distributionStagePcfIncludingBiogenicUptake`,
          },
          {
            label: "Distribution GWP total excl. biogenic uptake",
            requirement: "O",
            key: `${LIFECYCLE}.distributionStage.0.distributionStagePcfExcludingBiogenicUptake`,
          },
          {
            label: "Distribution GWP fossil",
            requirement: "O",
            key: `${LIFECYCLE}.distributionStage.0.distributionStageFossilGhgEmissions`,
          },
          {
            label: "Distribution GWP biogenic emissions other than CO₂",
            requirement: "O",
            key: `${LIFECYCLE}.distributionStage.0.distributionStageBiogenicNonCO2Emissions`,
          },
          {
            label: "Distribution GWP biogenic CO₂ uptake",
            requirement: "O",
            key: `${LIFECYCLE}.distributionStage.0.distributionStageBiogenicCO2Uptake`,
          },
          {
            label: "Distribution GWP land use change (LUC, excl. iLUC)",
            requirement: "O",
            key: `${LIFECYCLE}.distributionStage.0.distributionStageLandUseChangeGhgEmissions`,
          },
          {
            label: "Distribution GWP land management CO₂ emissions",
            requirement: "O",
            key: `${LIFECYCLE}.distributionStage.0.distributionStageLandManagementBiogenicCO2Emissions`,
          },
          {
            label: "Distribution GWP land management CO₂ removals",
            requirement: "O",
            key: `${LIFECYCLE}.distributionStage.0.distributionStageLandManagementBiogenicCO2Removals`,
          },
          {
            label: "Distribution GWP aviation emissions (gate to gate)",
            requirement: "O",
            key: `${LIFECYCLE}.distributionStage.0.distributionStageAircraftGhgEmissions`,
          },
        ],
      },
      {
        title: "Carbon Content",
        fields: [
          {
            label: "Total carbon content",
            requirement: "O",
            key: "carbonContent.0.carbonContentTotal",
          },
          {
            label: "Fossil carbon content",
            requirement: "O",
            key: "carbonContent.0.fossilCarbonContent",
          },
          {
            label: "Biogenic carbon content",
            requirement: "Oif",
            key: "carbonContent.0.biogenicCarbonContent",
            condition: 'Mandatory if "Mass balancing used" = true',
          },
          {
            label: "Packaging biogenic carbon content",
            requirement: "O",
            key: "carbonContent.0.packagingBiogenicCarbonContent",
          },
          {
            label: "Recycled carbon content",
            requirement: "O",
            key: "carbonContent.0.recycledCarbonContent",
          },
        ],
      },
      {
        title: "Attestation of Conformance",
        fields: [
          {
            label: "Attestation type",
            requirement: "Mif",
            key: "attestationOfConformance.0.attestationType",
            condition: "Mandatory if a declaration of conformance is provided",
          },
          {
            label: "Conformant standards / sector rules",
            requirement: "Mif",
            key: "attestationOfConformance.0.standardName",
            condition: "Mandatory if a declaration of conformance is provided",
          },
          {
            label: "Attestation scheme standard",
            requirement: "Mif",
            key: "attestationOfConformance.0.attestationStandard",
            condition: "Mandatory if a declaration of conformance is provided",
          },
          {
            label: "Attestation ID",
            requirement: "Mif",
            key: "attestationOfConformance.0.attestationOfConformanceId",
            condition: "Mandatory if a declaration of conformance is provided",
          },
          {
            label: "Link to attestation",
            requirement: "Oif",
            key: "attestationOfConformance.0.attestationOfConformanceLink",
            condition: "Optional if a declaration of conformance is provided",
          },
          {
            label: "Issuer of attestation",
            requirement: "Mif",
            key: "attestationOfConformance.0.providerName",
            condition: "Mandatory if a declaration of conformance is provided",
          },
          {
            label: "Issuer of attestation ID",
            requirement: "Oif",
            key: "attestationOfConformance.0.providerId",
            condition: "Optional if a declaration of conformance is provided",
          },
          {
            label: "Date of attestation",
            requirement: "Oif",
            key: "attestationOfConformance.0.completedAt",
            condition: "Optional if a declaration of conformance is provided",
          },
        ],
      },
    ],
  },
];

/** Requirement display metadata (label + palette) used across the section. */
export const REQUIREMENT_META: Record<
  Requirement,
  { label: string; short: string; group: "mandatory" | "optional" | "conditional" | "derived" }
> = {
  M: { label: "Mandatory", short: "M", group: "mandatory" },
  M2027: { label: "Mandatory (2027)", short: "M ’27", group: "mandatory" },
  O: { label: "Optional", short: "O", group: "optional" },
  Mif: { label: "Conditional", short: "if", group: "conditional" },
  Oif: { label: "Conditional", short: "if", group: "conditional" },
  D: { label: "Derived", short: "D", group: "derived" },
};

export interface CxCounts {
  total: number;
  mandatory: number;
  optional: number;
  conditional: number;
  derived: number;
}

/** Aggregate field counts by requirement group (for the summary chips). */
export function getCatenaXCounts(model: CxSection[] = CATENA_X_PCF_MODEL): CxCounts {
  const counts: CxCounts = {
    total: 0,
    mandatory: 0,
    optional: 0,
    conditional: 0,
    derived: 0,
  };
  for (const section of model) {
    for (const group of section.groups) {
      for (const field of group.fields) {
        counts.total += 1;
        counts[REQUIREMENT_META[field.requirement].group] += 1;
      }
    }
  }
  return counts;
}

/* ------------------------------------------------------------------ */
/*  Value binding helpers (submodel JSON → display string)            */
/* ------------------------------------------------------------------ */

/** Resolve a dot-path (with numeric segments) against the submodel object. */
export function getValueByPath(obj: unknown, path?: string): unknown {
  if (obj == null || !path) return undefined;
  return path.split(".").reduce<unknown>((acc, seg) => {
    if (acc == null) return undefined;
    const key = /^\d+$/.test(seg) ? Number(seg) : seg;
    return (acc as Record<string | number, unknown>)[key];
  }, obj);
}

function formatScalar(value: unknown): string {
  if (value === null || value === undefined) return "";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "";
    return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(4)));
  }
  const s = String(value).trim();
  // ISO date / datetime → YYYY-MM-DD
  const iso = s.match(/^(\d{4}-\d{2}-\d{2})(?:T.*)?$/);
  return iso ? iso[1] : s;
}

/**
 * Format a resolved submodel value for display.
 * Returns null when the value is absent/empty (rendered as "—").
 * Note: numeric 0 and boolean false are real values and ARE shown.
 */
export function formatFieldValue(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  if (Array.isArray(value)) {
    const parts = value.map(formatScalar).filter((s) => s !== "");
    return parts.length ? parts.join(", ") : null;
  }
  const s = formatScalar(value);
  return s === "" ? null : s;
}

/** Count how many catalog fields resolve to a present value in the submodel. */
export function countMappedFields(submodel: unknown): number {
  let mapped = 0;
  for (const section of CATENA_X_PCF_MODEL) {
    for (const group of section.groups) {
      for (const field of group.fields) {
        if (formatFieldValue(getValueByPath(submodel, field.key)) !== null) {
          mapped += 1;
        }
      }
    }
  }
  return mapped;
}

/**
 * Data sovereignty flow — the "if" section.
 * Describes how a validated PCF moves from the Enviguide platform to a
 * customer/partner across the Catena-X dataspace, under the provider's control.
 * Mirrors the backend Quintari / sovity (EDC) integration.
 */
export interface SovereigntyStep {
  id: string;
  /** Lucide icon key resolved in the component. */
  icon:
    | "platform"
    | "twin"
    | "submodel"
    | "connector"
    | "dataspace"
    | "partner";
  title: string;
  side: "Enviguide" | "Sovereignty boundary" | "Catena-X";
  description: string;
}

export const SOVEREIGNTY_FLOW: SovereigntyStep[] = [
  {
    id: "platform",
    icon: "platform",
    title: "Enviguide Platform",
    side: "Enviguide",
    description:
      "PCF is calculated and validated here. Nothing leaves until it is explicitly published.",
  },
  {
    id: "twin",
    icon: "twin",
    title: "Digital Twin Registry",
    side: "Enviguide",
    description:
      "A digital twin (AAS shell) is registered for the product with its identifiers.",
  },
  {
    id: "submodel",
    icon: "submodel",
    title: "PCF Submodel",
    side: "Enviguide",
    description:
      "The validated data is mapped to the Catena-X Semantic PCF submodel.",
  },
  {
    id: "connector",
    icon: "connector",
    title: "EDC Connector + Access Policy",
    side: "Sovereignty boundary",
    description:
      "Data is offered — not pushed — behind a usage policy restricted to an authorised Business Partner Number (BPN).",
  },
  {
    id: "dataspace",
    icon: "dataspace",
    title: "Catena-X Dataspace",
    side: "Catena-X",
    description:
      "The partner negotiates a contract via the Dataspace Protocol; transfer is governed and auditable.",
  },
  {
    id: "partner",
    icon: "partner",
    title: "Customer / Partner",
    side: "Catena-X",
    description:
      "The partner consumes the PCF under the agreed policy. You retain control and can revoke access.",
  },
];

/** Sovereignty guarantees shown alongside the flow. */
export const SOVEREIGNTY_GUARANTEES: string[] = [
  "Access is restricted to an authorised BPN — no open sharing.",
  "Usage policies travel with the data and are enforced by the connector.",
  "You keep control: offers can be updated or revoked at any time.",
  "Every contract negotiation and transfer is logged and auditable.",
];
