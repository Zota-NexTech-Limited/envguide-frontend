/**
 * Thin client for the V3 (28-question / CX-PCF Rulebook v4) questionnaire
 * backend endpoints. Independent from the legacy supplierQuestionnaireService,
 * which still serves the old 70-question flow.
 *
 * Backend routes (envguide-backend-clean2):
 *   POST /api/questionnaire/save
 *   GET  /api/questionnaire/:responseId
 *   POST /api/questionnaire/submit/:responseId
 *   POST /api/questionnaire/publish/:responseId      (super admin)
 *   GET  /api/questionnaire/by-pcf/:bomPcfRequestId  (super admin)
 */

import authService from "./authService";
import { getApiBaseUrl } from "./apiBaseUrl";

const API_BASE_URL = getApiBaseUrl();

interface ApiResponse<T = any> {
    status: boolean;
    success?: boolean;
    message: string;
    code: number;
    data?: T;
}

function headers() {
    // A supplier opens the emailed magic link (…?token=…) — that URL token
    // authenticates them with no account/login. Fall back to the logged-in
    // user's token (e.g. a super admin filling on the supplier's behalf).
    const urlToken = new URLSearchParams(window.location.search).get("token");
    const token = urlToken || authService.getToken();
    return {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `${token}` } : {}),
    };
}

// --- helpers ----------------------------------------------------------------

const yesNoToBool = (v: any): boolean | undefined => {
    if (v === undefined || v === null || v === "") return undefined;
    if (typeof v === "boolean") return v;
    const s = String(v).toLowerCase().trim();
    // Some dropdowns use verbose labels like "Yes, include packaging" /
    // "No, exclude packaging" / "No, the customer arranges it", so match on the
    // leading yes/no token rather than requiring an exact "yes"/"no".
    if (s === "true" || s === "1" || s === "y" || s.startsWith("yes")) return true;
    if (s === "false" || s === "0" || s === "n" || s.startsWith("no")) return false;
    return undefined;
};

const num = (v: any): number | undefined => {
    if (v === undefined || v === null || v === "") return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
};

const str = (v: any): string | undefined => {
    if (v === undefined || v === null) return undefined;
    // Safe stringify dayjs / Date so they don't crash here.
    let s: string;
    try {
        if (v instanceof Date) {
            s = v.toISOString().split("T")[0];
        } else if (typeof v === "object") {
            const o: any = v;
            if (typeof o.format === "function") {
                s = o.format("YYYY-MM-DD");
            } else if (typeof o.toISOString === "function") {
                s = o.toISOString().split("T")[0];
            } else if (o.$d instanceof Date) {
                s = o.$d.toISOString().split("T")[0];
            } else {
                s = String(v);
            }
        } else {
            s = String(v);
        }
    } catch {
        return undefined;
    }
    const trimmed = s.trim();
    return trimmed === "" ? undefined : trimmed;
};

const arr = (v: any): any[] => (Array.isArray(v) ? v.filter(Boolean) : []);

// --- mapper: V3 nested formData -> backend QuestionnaireInput ---------------

export interface V3MapperContext {
    bomPcfRequestId: string;
    supplierId: string;
    responseId?: string;
    status?: "draft" | "submitted";
}

export function mapV3FormToBackend(
    formData: Record<string, any>,
    ctx: V3MapperContext
): Record<string, any> {
    const company = formData?.company ?? {};
    const product = formData?.product ?? {};
    const sp = formData?.scope_period ?? {};
    const bomBlock = formData?.bom ?? {};
    const energy = formData?.energy ?? {};
    const packaging = formData?.packaging ?? {};
    const transport = formData?.transport ?? {};
    const biobased = formData?.biobased ?? {};
    const methodology = formData?.methodology ?? {};
    const boundary = formData?.boundary ?? {};
    const dqr = formData?.dqr ?? {};
    const verification = formData?.verification ?? {};

    const sites = arr(product.manufacturing_sites).map((s: any, i: number) => ({
        siteName: str(s.site_name),
        siteAddress: str(s.site_address),
        region: str(s.region),
        country: str(s.country),
        countrySubdivision: str(s.subdivision),
        isPrimary: i === 0, // first row is primary by convention; UI can override later
        notes: str(s.notes),
    }));

    const bom = arr(bomBlock.bill_of_materials).map((b: any) => ({
        productIdOrMpn: str(b.product_id),
        componentName: str(b.component_name),
        material: str(b.material),
        subCategory: str(b.sub_category),
        materialGroup: str(b.group),
        specificType: str(b.specific_type),
        massPct: num(b.mass_percent),
        carbonPct: num(b.carbon_percent),
        biogenicYN: yesNoToBool(b.biogenic),
        biogenicCarbonPct: num(b.biogenic_carbon_percent),
        biobasedMassPct: num(b.biobased_mass_percent),
        recycledYN: yesNoToBool(b.recycled),
        recycledCarbonPct: num(b.recycled_carbon_percent),
    }));

    // The primary co-product is no longer asked for: the backend resolves it as
    // the first row when no row carries the flag, so row order decides.
    const coProducts = arr(bomBlock.co_products).map((c: any) => ({
        mpn: str(c.mpn),
        coProductName: str(c.co_product_name),
        coProductPrice: num(c.co_product_price),
    }));

    // Q8a — supplier-provided component/material-specific emission factors.
    const componentEfDetails = arr(bomBlock.component_ef_details).map((e: any) => ({
        componentMaterialName: str(e.component_material_name),
        supplierEf: str(e.supplier_ef),
    }));

    // Q8b — process consumable materials used in production but not in the BOM.
    const processConsumables = arr(bomBlock.process_consumables).map((c: any) => ({
        mpn: str(c.mpn),
        consumableMaterial: str(c.consumable_material),
        category: str(c.category),
        subCategory: str(c.sub_category),
        materialGroup: str(c.group),
        specificType: str(c.specific_type),
        totalQuantity: num(c.total_quantity),
        unit: str(c.unit),
    }));

    const electricity = arr(energy.electricity).map((e: any) => ({
        electricityType: str(e.electricity_type),
        category: str(e.category),
        subCategory: str(e.sub_category),
        materialGroup: str(e.group),
        specificType: str(e.specific_type),
        // Q10 Geography (Electricity Sourcing) — the EF-DB geography the row's
        // electricity EF is matched against. Carried through for the backend
        // (persistence/EF-matching to be wired on the API side).
        geography: str(e.geography),
        quantity: num(e.quantity),
        unit: str(e.unit),
        renewablePct: num(e.renewable_percent),
        renewableSourcing: str(e.renewable_sourcing),
        infrastructureEmissionsIncluded: yesNoToBool(e.infrastructure_included),
    }));

    // Q10a / Q10b — per-product factory production totals (weight + units).
    const factoryProductWeights = arr(energy.factory_product_weights).map((r: any) => ({
        mpn: str(r.mpn),
        totalWeightKg: num(r.total_weight_kg),
    }));
    const factoryProductUnits = arr(energy.factory_product_units).map((r: any) => ({
        mpn: str(r.mpn),
        unitsProduced: num(r.units_produced),
    }));

    const fuels = arr(energy.other_fuels).map((f: any) => ({
        mpn: str(f.mpn),
        fuelCarrier: str(f.fuel_carrier),
        category: str(f.category),
        subCategory: str(f.sub_category),
        materialGroup: str(f.group),
        specificType: str(f.specific_type),
        quantity: num(f.quantity),
        unit: str(f.unit),
        biogenicYN: yesNoToBool(f.biogenic),
    }));

    const processGases = arr(energy.direct_process_gases).map((g: any) => ({
        mpn: str(g.mpn),
        directProcessGas: str(g.gas),
        quantity: num(g.quantity),
        unit: str(g.unit),
        fossilOrBiogenic: str(g.origin),
    }));

    // Q13 — only collected when the supplier answered "No" to "already in Q10?",
    // so every row here is by definition not yet counted in Q10. The backend
    // skips rows flagged alreadyInQ10, so these must report false to be counted.
    //
    // "Yes" sends no rows at all: the energy is already in the Q10 total. Rows
    // left in form state from a previous "No" would otherwise be submitted as
    // countable and double-count that energy.
    const qcItEnergy = str(energy.qc_it_energy_in_q10) === "Yes" ? [] : arr(energy.qc_it_energy).map((q: any) => ({
        mpn: str(q.mpn),
        equipmentType: str(q.equipment_type),
        category: str(q.category),
        subCategory: str(q.sub_category),
        materialGroup: str(q.group),
        specificType: str(q.specific_type),
        geography: str(q.geography),
        value: num(q.value),
        unit: str(q.unit),
        alreadyInQ10: false,
    }));

    const productionWaste = arr(energy.production_waste).map((w: any) => ({
        productIdOrMpn: str(w.product_id),
        category: str(w.category),
        subCategory: str(w.sub_category),
        materialGroup: str(w.group),
        specificType: str(w.specific_type),
        quantity: num(w.quantity),
        unit: str(w.unit),
        energyRecovered: yesNoToBool(w.energy_recovered),
        polluterPaysApplied: yesNoToBool(w.polluter_pays_applied),
    }));

    const packagingMaterials = arr(packaging.materials_used).map((p: any) => ({
        productIdOrMpn: str(p.product_id),
        category: str(p.category),
        subCategory: str(p.sub_category),
        materialGroup: str(p.group),
        specificType: str(p.specific_type),
        packagingWeight: num(p.packaging_weight),
        unit: str(p.unit),
        region: str(p.region),
        country: str(p.country),
        recycledPct: num(p.recycled_percent),
        // `carbon_biogenic_pct` is the biogenic fraction as far as the backend is
        // concerned (formulaEngine: bioFrac = carbon_biogenic_pct / 100), so the
        // biogenic input — not the carbon one — is what maps onto it.
        carbonBiogenicPct: num(p.biogenic_percent),
        // Q16 `carbon_percent` is intentionally NOT sent: sq_q16_packaging_materials
        // has no carbon column, so the API would drop it anyway. Add it here once
        // the backend can store it.
    }));

    const packagingTransport = arr(packaging.transport).map((t: any) => ({
        packagingProductIdOrMpn: str(t.product_id),
        category: str(t.category),
        subCategory: str(t.sub_category),
        materialGroup: str(t.group),
        specificType: str(t.specific_type),
        weight: num(t.weight),
        unit: str(t.unit),
        distanceKm: num(t.distance_km),
    }));

    const packagingWaste = arr(packaging.waste).map((w: any) => ({
        mpnCode: str(w.mpn_code),
        category: str(w.category),
        subCategory: str(w.sub_category),
        materialGroup: str(w.group),
        specificType: str(w.specific_type),
        quantity: num(w.quantity),
        unit: str(w.unit),
        energyRecovered: yesNoToBool(w.energy_recovered),
    }));

    const transportLegs = arr(transport.legs).map((t: any) => ({
        productIdOrMpn: str(t.product_id),
        category: str(t.category),
        subCategory: str(t.sub_category),
        materialGroup: str(t.group),
        specificType: str(t.specific_type),
        source: str(t.source),
        destination: str(t.destination),
        weight: num(t.weight),
        unit: str(t.unit),
        distanceKm: num(t.distance_km),
        lowCarbonFuel: yesNoToBool(t.low_carbon_fuel),
        fuelCertificateRef: str(t.fuel_certificate_ref),
    }));

    const biomass = arr(biobased.details).map((d: any) => ({
        biomassFeedstockType: str(d.feedstock ?? d.feedstock_type ?? d.type),
        // Q20 EF taxonomy cascade — carried through for the backend
        // (persistence to be wired on the API side).
        category: str(d.category),
        subCategory: str(d.sub_category),
        materialGroup: str(d.group),
        specificType: str(d.specific_type),
        stageUsed: str(d.stage_used),
        quantity: num(d.quantity),
        unit: str(d.unit),
        biogenicCarbonContentPct: num(d.biogenic_carbon_percent),
    }));

    // Q27 — production / product volumes (fixed volume types). Drop rows with no
    // volume type selected (possible from a draft save that skips validation) so
    // an untyped row can't be sent to the backend and silently dropped.
    const volumes = arr(verification.volumes)
        .filter((v: any) => str(v.volume_type))
        .map((v: any) => ({
            volumeType: str(v.volume_type),
            volume: num(v.volume),
            sharePct: num(v.share_percent),
        }));

    return {
        // identifiers
        responseId: ctx.responseId,
        bomPcfRequestId: ctx.bomPcfRequestId,
        supplierId: ctx.supplierId,
        status: ctx.status ?? "draft",

        // Q1 — Catena-X requires BPNL as the canonical company identifier;
        // company_id is the supplier's own ID and other_identifier captures a
        // jurisdiction-specific code (DUNS/VAT/CIN).
        companyName: str(company.legal_name),
        companyIdUrn: str(company.bpn) ?? str(company.company_id),
        companyBpn: str(company.bpn),
        companyRegistrationId: str(company.company_id),
        companyOtherIdentifier: str(company.other_identifier),

        // Form header — contact metadata
        contactPerson: str(formData?.contact?.person),
        contactEmail: str(formData?.contact?.email),

        // Q2
        productNameCompany: str(product.name),
        productIdUrn: str(product.product_id),
        productDescription: str(product.description),
        productClassificationUrn: str(product.classification),

        // Q3
        declaredUnit: str(product.declared_unit),
        declaredUnitAmount: num(product.declared_unit_quantity),
        productMassPerDeclaredUnit: num(product.declared_mass),
        productPrice: num(product.price),
        productionPeriod: str(product.production_period),

        // Q5 — reference end is auto-derived (start + 1 year − 1 day) in the
        // form. Validity is no longer collected from the supplier; the backend
        // sets it at PCF report generation (generation date → +1 year).
        referencePeriodStart: str(sp.reference_start),
        referencePeriodEnd: str(sp.reference_end),

        // Q6 / Q7
        retroOrProspectivePcfType: str(sp.pcf_type),
        systemBoundary: str(sp.system_boundary),

        // Q8a — supplier-provided component/material-specific EF available?
        componentSpecificEfAvailable: yesNoToBool(bomBlock.component_specific_ef_available),

        // Q9 (co-products flag)
        coProductsProduced: yesNoToBool(bomBlock.co_products_produced),

        // Q15 / Q18
        packagingEmissionsIncluded: yesNoToBool(packaging.include_packaging),
        distributionStageIncluded: yesNoToBool(transport.outbound_in_boundary),

        // Q20
        containsBiobased: yesNoToBool(biobased.contains_biobased),
        usesAgriForestryLand: yesNoToBool(biobased.uses_agri_forestry_land),
        landAreaHectares: num(biobased.land_area_hectares),
        forestConverted: yesNoToBool(biobased.forest_converted),

        // Q21
        crossSectoralStandards: str(methodology.cross_sectoral_standard),
        productOrSectorSpecificRules: str(methodology.product_sector_pcr),
        ipccGwpVersion: str(methodology.ipcc_gwp_version),

        // Q22
        massBalancingUsed: yesNoToBool(methodology.mass_balancing_used),
        certificateScheme: str(methodology.certificate_scheme),
        freeAttributionUsed: yesNoToBool(methodology.free_attribution_used),

        // Q23
        allocationRationale: str(methodology.allocation_rationale),

        // Q24
        ccsCo2CaptureIncluded: yesNoToBool(boundary.ccs_ccu_used),
        exemptedEmissionsDescription: str(boundary.excluded_flows),
        exemptedEmissionsPercent: num(boundary.exempted_percent),

        // Q25 DQR — key names MUST match the backend QuestionnaireInput
        // (technologicalDqr/temporalDqr/geographicalDqr/secondaryEfSources/
        // dataCollectedYear); otherwise the values are dropped and the PCF
        // submodel falls back to the default DQR of 2.
        primaryDataSharePct: num(dqr.primary_data_share),
        secondaryEfSources: str(dqr.secondary_ef_source),
        dataCollectedYear: num(dqr.data_year),
        technologicalDqr: num(dqr.technological),
        geographicalDqr: num(dqr.geographical),
        temporalDqr: num(dqr.temporal),

        // Q26 verification
        productCertified: yesNoToBool(verification.product_certified),
        certificationScheme: str(verification.certification_scheme),
        certificateNumber: str(verification.certificate_number),
        certificateValidFrom: str(verification.certificate_valid_from),
        certificateValidTo: str(verification.certificate_valid_to),
        pcfVerified: yesNoToBool(verification.pcf_verified),
        attestationType: str(verification.attestation_type),
        conformantStandards: str(verification.conformant_standards),
        attestationSchemeStandard: str(verification.attestation_scheme_standard),
        attestationId: str(verification.attestation_id),
        attestationIssuer: str(verification.attestation_issuer),
        issuerId: str(verification.issuer_id),
        attestationUrl: str(verification.attestation_url),
        attestationCompletedAt: str(verification.attestation_completed_at),

        // children
        sites,
        bom,
        coProducts,
        componentEfDetails,
        processConsumables,
        electricity,
        factoryProductWeights,
        factoryProductUnits,
        fuels,
        processGases,
        qcItEnergy,
        productionWaste,
        packagingMaterials,
        packagingTransport,
        packagingWaste,
        transportLegs,
        biomass,
        volumes,
    };
}

// --- mapper: backend QuestionnaireInput -> V3 nested formData ---------------
// Inverse of mapV3FormToBackend. Used to rehydrate the form for responses saved
// BEFORE form snapshots existed (snapshot null) by rebuilding the form shape
// from the structured DB data returned by loadQuestionnaire. Best-effort: a few
// non-persisted fields (contact, company BPN, product price, biomass stage,
// acknowledgements) can't be restored and stay blank.
const b2yn = (v: any): string | undefined =>
    v === true || v === "true" || v === "Yes" || v === "Y" ? "Yes"
    : v === false || v === "false" || v === "No" || v === "N" ? "No"
    : undefined;
const dstr = (v: any): string | undefined => (v ? String(v).slice(0, 10) : undefined);

export function mapV3BackendToForm(d: any): Record<string, any> {
    if (!d) return {};

    // Q13 — "already in Q10?" is a UI-only gate with no backend column, so it is
    // derived from the saved rows. The table now means "QC/IT energy NOT yet
    // counted in Q10", so rows the backend skips (alreadyInQ10) are dropped
    // rather than shown: they contribute nothing today, and re-saving them
    // through the new mapper would count them and double-count the energy.
    const qcItAllRows = (d.qcItEnergy ?? []) as any[];
    const qcItRows = qcItAllRows.filter((q) => !q.alreadyInQ10);
    const qcItInQ10 =
        qcItRows.length > 0 ? "No"
        : qcItAllRows.length > 0 ? "Yes"
        : undefined; // never answered — leave the gate blank

    return {
        company: {
            legal_name: d.companyName,
            company_id: d.companyIdUrn,
        },
        product: {
            name: d.productNameCompany,
            product_id: d.productIdUrn,
            description: d.productDescription,
            classification: d.productClassificationUrn,
            declared_unit: d.declaredUnit,
            declared_unit_quantity: d.declaredUnitAmount,
            declared_mass: d.productMassPerDeclaredUnit,
            production_period: d.productionPeriod,
            manufacturing_sites: (d.sites ?? []).map((s: any) => ({
                site_name: s.siteName,
                site_address: s.siteAddress,
                region: s.region,
                country: s.country,
                subdivision: s.countrySubdivision,
                notes: s.notes,
            })),
        },
        scope_period: {
            reference_start: dstr(d.referencePeriodStart),
            reference_end: dstr(d.referencePeriodEnd),
            // Validity is computed on the backend at report generation and is not
            // shown/edited in the supplier form, so it is intentionally omitted.
            pcf_type: d.retroOrProspectivePcfType,
            system_boundary: d.systemBoundary,
        },
        bom: {
            co_products_produced: b2yn(d.coProductsPresent),
            bill_of_materials: (d.bom ?? []).map((b: any) => ({
                product_id: b.productIdOrMpn,
                component_name: b.componentName,
                material: b.material,
                sub_category: b.subCategory,
                group: b.materialGroup,
                specific_type: b.specificType,
                mass_percent: b.massPct,
                carbon_percent: b.carbonPct,
                biogenic: b2yn(b.biogenicYN),
                biogenic_carbon_percent: b.biogenicCarbonPct,
                recycled: b2yn(b.recycledYN),
                recycled_carbon_percent: b.recycledCarbonPct,
            })),
            co_products: (d.coProducts ?? []).map((c: any) => ({
                mpn: c.mpn,
                co_product_name: c.coProductName,
                co_product_price: c.coProductPrice,
            })),
            process_consumables: (d.processConsumables ?? []).map((c: any) => ({
                mpn: c.mpn,
                consumable_material: c.consumableMaterial,
                category: c.category,
                sub_category: c.subCategory,
                group: c.materialGroup,
                specific_type: c.specificType,
                total_quantity: c.totalQuantity,
                unit: c.unit,
            })),
        },
        energy: {
            factory_product_weights: (d.factoryProductWeights ?? []).map((r: any) => ({
                mpn: r.mpn,
                total_weight_kg: r.totalWeightKg,
            })),
            factory_product_units: (d.factoryProductUnits ?? []).map((r: any) => ({
                mpn: r.mpn,
                units_produced: r.unitsProduced,
            })),
            electricity: (d.electricity ?? []).map((e: any) => ({
                electricity_type: e.electricityType,
                category: e.category,
                sub_category: e.subCategory,
                group: e.materialGroup,
                specific_type: e.specificType,
                geography: e.geography,
                quantity: e.quantity,
                unit: e.unit,
                renewable_percent: e.renewablePct,
                renewable_sourcing: e.renewableSourcing,
                infrastructure_included: b2yn(e.infrastructureEmissionsIncluded),
            })),
            other_fuels: (d.fuels ?? []).map((f: any) => ({
                mpn: f.mpn,
                fuel_carrier: f.fuelCarrier,
                category: f.category,
                sub_category: f.subCategory,
                group: f.materialGroup,
                specific_type: f.specificType,
                quantity: f.quantity,
                unit: f.unit,
                biogenic: b2yn(f.biogenicYN),
            })),
            direct_process_gases: (d.processGases ?? []).map((g: any) => ({
                mpn: g.mpn,
                gas: g.directProcessGas,
                quantity: g.quantity,
                unit: g.unit,
                origin: g.fossilOrBiogenic,
            })),
            qc_it_energy_in_q10: qcItInQ10,
            qc_it_energy: qcItRows.map((q: any) => ({
                mpn: q.mpn,
                equipment_type: q.equipmentType,
                category: q.category,
                sub_category: q.subCategory,
                group: q.materialGroup,
                specific_type: q.specificType,
                geography: q.geography,
                value: q.value,
                unit: q.unit,
            })),
            production_waste: (d.productionWaste ?? []).map((w: any) => ({
                product_id: w.productIdOrMpn,
                category: w.category,
                sub_category: w.subCategory,
                group: w.materialGroup,
                specific_type: w.specificType,
                quantity: w.quantity,
                unit: w.unit,
                energy_recovered: b2yn(w.energyRecovered),
                polluter_pays_applied: b2yn(w.polluterPaysApplied),
            })),
        },
        packaging: {
            include_packaging: b2yn(d.packagingEmissionsIncluded),
            materials_used: (d.packagingMaterials ?? []).map((p: any) => ({
                product_id: p.productIdOrMpn,
                category: p.category,
                sub_category: p.subCategory,
                group: p.materialGroup,
                specific_type: p.specificType,
                packaging_weight: p.packagingWeight,
                unit: p.unit,
                region: p.region,
                country: p.country,
                recycled_percent: p.recycledPct,
                // The stored column is the biogenic fraction, so it loads back
                // into the biogenic input. `carbon_percent` has no stored
                // counterpart yet and so always loads blank.
                biogenic_percent: p.carbonBiogenicPct,
            })),
            transport: (d.packagingTransport ?? []).map((t: any) => ({
                product_id: t.packagingProductIdOrMpn,
                category: t.category,
                sub_category: t.subCategory,
                group: t.materialGroup,
                specific_type: t.specificType,
                weight: t.weight,
                unit: t.unit,
                distance_km: t.distanceKm,
            })),
            waste: (d.packagingWaste ?? []).map((w: any) => ({
                mpn_code: w.mpnCode,
                category: w.category,
                sub_category: w.subCategory,
                group: w.materialGroup,
                specific_type: w.specificType,
                quantity: w.quantity,
                unit: w.unit,
                energy_recovered: b2yn(w.energyRecovered),
            })),
        },
        transport: {
            outbound_in_boundary: b2yn(d.distributionStageIncluded),
            legs: (d.transportLegs ?? []).map((t: any) => ({
                product_id: t.productIdOrMpn,
                category: t.category,
                sub_category: t.subCategory,
                group: t.materialGroup,
                specific_type: t.specificType,
                source: t.source,
                destination: t.destination,
                weight: t.weight,
                unit: t.unit,
                distance_km: t.distanceKm,
                low_carbon_fuel: b2yn(t.lowCarbonFuel),
                fuel_certificate_ref: t.fuelCertificateRef,
            })),
        },
        biobased: {
            contains_biobased: b2yn(d.usesAgriculturalForestryLand),
            details: (d.biomass ?? []).map((b: any) => ({
                feedstock: b.biomassFeedstockType,
                category: b.category,
                sub_category: b.subCategory,
                group: b.materialGroup,
                specific_type: b.specificType,
                quantity: b.quantity,
                unit: b.unit,
                biogenic_carbon_percent: b.biogenicCarbonContentPct,
            })),
        },
        methodology: {
            cross_sectoral_standard: d.crossSectoralStandards,
            product_sector_pcr: d.productOrSectorSpecificRules,
            ipcc_gwp_version: d.ipccGwpVersion,
            mass_balancing_used: b2yn(d.massBalancingUsed),
            certificate_scheme: d.massBalancingCertificateScheme,
            free_attribution_used: b2yn(d.freeAttributionInMassBalancing),
            recycled_carbon_method: d.allocationRecycledCarbon,
            waste_incineration_method: d.allocationWasteIncineration,
            allocation_rationale: d.allocationRulesDescription,
        },
        boundary: {
            ccs_ccu_used: b2yn(d.ccsCo2CaptureIncluded),
            excluded_flows: d.exemptedEmissionsDescription,
            exempted_percent: d.exemptedEmissionsPercent,
        },
        dqr: {
            primary_data_share: d.primaryDataSharePct,
            secondary_ef_source: d.secondaryEfSources,
            data_year: d.dataCollectedYear,
            technological: d.technologicalDqr,
            geographical: d.geographicalDqr,
            temporal: d.temporalDqr,
        },
        verification: {
            product_certified: b2yn(d.isProductCertified),
            pcf_verified: b2yn(d.isPcfVerified),
            // Q27 is now an add-row dropdown table: reload only the volume types
            // that actually have a stored value, so empty types don't come back
            // as pre-filled rows.
            volumes: [
                { volume_type: "Certified volume", volume: d.certifiedVolume },
                { volume_type: "Total production volume", volume: d.totalProductionVolume },
                { volume_type: "1st-party verified volume", volume: d.verifiedVolume1stParty },
                { volume_type: "2nd-party verified volume", volume: d.verifiedVolume2ndParty },
                { volume_type: "3rd-party verified volume", volume: d.verifiedVolume3rdParty },
                { volume_type: "Total product volume", volume: d.totalProductVolume },
            ].filter((r) => r.volume !== undefined && r.volume !== null),
        },
        comments: d.comments,
    };
}

// --- API methods ------------------------------------------------------------

async function postJson<T = any>(url: string, body: any): Promise<ApiResponse<T>> {
    const res = await fetch(url, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    return {
        status: !!json.status,
        success: !!json.status,
        message: json.message ?? (res.ok ? "ok" : `HTTP ${res.status}`),
        code: json.code ?? res.status,
        data: json.data,
    };
}

async function getJson<T = any>(url: string): Promise<ApiResponse<T>> {
    const res = await fetch(url, { method: "GET", headers: headers() });
    const json = await res.json().catch(() => ({}));
    return {
        status: !!json.status,
        success: !!json.status,
        message: json.message ?? (res.ok ? "ok" : `HTTP ${res.status}`),
        code: json.code ?? res.status,
        data: json.data,
    };
}

export async function saveV3Questionnaire(
    formData: Record<string, any>,
    ctx: V3MapperContext
): Promise<ApiResponse<{ responseId: string; status: string }>> {
    const payload = mapV3FormToBackend(formData, ctx);
    // Also persist the raw form state so it can be reloaded losslessly.
    payload.formSnapshot = formData;
    return postJson(`${API_BASE_URL}/api/questionnaire/save`, payload);
}

// The current supplier's own saved response for this PCF request (id + status +
// raw form snapshot), used to reload the form when they reopen it. Returns
// { data: null } when no draft exists yet.
export async function loadMineV3(
    bomPcfRequestId: string,
    supplierId?: string
): Promise<ApiResponse<{ responseId: string; status: string; formSnapshot: any } | null>> {
    const qs = supplierId ? `?supplierId=${encodeURIComponent(supplierId)}` : "";
    return getJson(`${API_BASE_URL}/api/questionnaire/mine/${encodeURIComponent(bomPcfRequestId)}${qs}`);
}

export async function loadV3Questionnaire(
    responseId: string
): Promise<ApiResponse<any>> {
    return getJson(`${API_BASE_URL}/api/questionnaire/${encodeURIComponent(responseId)}`);
}

export async function submitV3Questionnaire(
    responseId: string
): Promise<ApiResponse<{ responseId: string; computed: any }>> {
    return postJson(
        `${API_BASE_URL}/api/questionnaire/submit/${encodeURIComponent(responseId)}`,
        {}
    );
}

export async function publishV3ToQuintari(
    responseId: string
): Promise<ApiResponse<any>> {
    return postJson(
        `${API_BASE_URL}/api/questionnaire/publish/${encodeURIComponent(responseId)}`,
        {}
    );
}

export async function listV3ByPcf(
    bomPcfRequestId: string
): Promise<ApiResponse<any[]>> {
    return getJson(
        `${API_BASE_URL}/api/questionnaire/by-pcf/${encodeURIComponent(bomPcfRequestId)}`
    );
}

// Render branded PDF on the backend from a frontend-built sections array.
// Returns a Blob (the PDF bytes) — caller is responsible for triggering the download.
export async function downloadV3Pdf(body: {
    sections: any[];
    supplier_name?: string;
    submission_date?: string;
    reference_id?: string;
    bom_pcf_id?: string;
}): Promise<{ success: boolean; blob?: Blob; message?: string }> {
    try {
        const res = await fetch(`${API_BASE_URL}/api/questionnaire/pdf`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify(body),
        });
        if (!res.ok) {
            const json = await res.json().catch(() => ({}));
            return { success: false, message: json?.message ?? `HTTP ${res.status}` };
        }
        const blob = await res.blob();
        return { success: true, blob };
    } catch (e: any) {
        return { success: false, message: e?.message ?? "PDF download failed" };
    }
}

export default {
    mapV3FormToBackend,
    saveV3Questionnaire,
    loadV3Questionnaire,
    submitV3Questionnaire,
    publishV3ToQuintari,
    listV3ByPcf,
};
