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
    const token = authService.getToken();
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
    if (s === "yes" || s === "true" || s === "1" || s === "y") return true;
    if (s === "no" || s === "false" || s === "0" || s === "n") return false;
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
        process: str(b.process),
        massPct: num(b.mass_percent),
        carbonPct: num(b.carbon_percent),
        biogenicYN: yesNoToBool(b.biogenic),
        biogenicCarbonPct: num(b.biogenic_carbon_percent),
        recycledYN: yesNoToBool(b.recycled),
        recycledCarbonPct: num(b.recycled_carbon_percent),
    }));

    const coProducts = arr(bomBlock.co_products).map((c: any) => ({
        mpn: str(c.mpn),
        componentName: str(c.component_name),
        coProductName: str(c.co_product_name),
        coProductPrice: num(c.co_product_price),
        isPrimaryProduct: yesNoToBool(c.is_primary),
    }));

    const electricity = arr(energy.electricity).map((e: any) => ({
        electricityType: str(e.electricity_type),
        generatorType: str(e.generator_type),
        quantity: num(e.quantity),
        unit: str(e.unit),
        renewablePct: num(e.renewable_percent),
        renewableSourcing: str(e.renewable_sourcing),
        infrastructureEmissionsIncluded: yesNoToBool(e.infrastructure_included),
    }));

    const fuels = arr(energy.other_fuels).map((f: any) => ({
        fuelCarrier: str(f.fuel_carrier),
        quantity: num(f.quantity),
        unit: str(f.unit),
        biogenicYN: yesNoToBool(f.biogenic),
    }));

    const processGases = arr(energy.direct_process_gases).map((g: any) => ({
        directProcessGas: str(g.gas),
        quantity: num(g.quantity),
        unit: str(g.unit),
        fossilOrBiogenic: str(g.origin),
    }));

    const qcItEnergy = arr(energy.qc_it_energy).map((q: any) => ({
        item: str(q.item),
        value: num(q.value),
        unit: str(q.unit),
        alreadyInQ10: yesNoToBool(q.already_in_q10),
    }));

    const productionWaste = arr(energy.production_waste).map((w: any) => ({
        productIdOrMpn: str(w.product_id),
        componentName: str(w.component_name),
        wasteType: str(w.waste_type),
        treatmentType: str(w.treatment_type),
        quantity: num(w.quantity),
        unit: str(w.unit),
        energyRecovered: yesNoToBool(w.energy_recovered),
        polluterPaysApplied: yesNoToBool(w.polluter_pays_applied),
    }));

    const packagingMaterials = arr(packaging.materials_used).map((p: any) => ({
        productIdOrMpn: str(p.product_id),
        componentName: str(p.component_name),
        packagingType: str(p.packaging_type),
        processType: str(p.process_type),
        packagingWeight: num(p.packaging_weight),
        unit: str(p.unit),
        region: str(p.region),
        country: str(p.country),
        recycledPct: num(p.recycled_percent),
        carbonBiogenicPct: num(p.carbon_biogenic_percent),
    }));

    const packagingTransport = arr(packaging.transport).map((t: any) => ({
        packagingProductIdOrMpn: str(t.product_id),
        componentName: str(t.component_name),
        transportMode: str(t.transport_mode),
        weight: num(t.weight),
        unit: str(t.unit),
        distanceKm: num(t.distance_km),
    }));

    const packagingWaste = arr(packaging.waste).map((w: any) => ({
        mpnCode: str(w.mpn_code),
        componentName: str(w.component_name),
        packagingWasteType: str(w.packaging_waste_type),
        treatmentType: str(w.treatment_type),
        quantity: num(w.quantity),
        unit: str(w.unit),
        energyRecovered: yesNoToBool(w.energy_recovered),
    }));

    const transportLegs = arr(transport.legs).map((t: any) => ({
        productIdOrMpn: str(t.product_id),
        componentName: str(t.component_name),
        transportMode: str(t.transport_mode),
        source: str(t.source),
        destination: str(t.destination),
        weight: num(t.weight),
        unit: str(t.unit),
        distanceKm: num(t.distance_km),
        lowCarbonFuel: yesNoToBool(t.low_carbon_fuel),
        fuelCertificateRef: str(t.fuel_certificate_ref),
    }));

    const biomass = arr(biobased.details).map((d: any) => ({
        biomassFeedstockType: str(d.feedstock_type ?? d.type),
        quantity: num(d.quantity),
        unit: str(d.unit),
        biogenicCarbonContentPct: num(d.biogenic_carbon_percent),
    }));

    return {
        // identifiers
        responseId: ctx.responseId,
        bomPcfRequestId: ctx.bomPcfRequestId,
        supplierId: ctx.supplierId,
        status: ctx.status ?? "draft",

        // Q1 — Catena-X requires BPN as the canonical company identifier;
        // the generic company_id (DUNS/VAT/CIN) is kept as a secondary record.
        companyName: str(company.legal_name),
        companyIdUrn: str(company.bpn) ?? str(company.company_id),
        companyBpn: str(company.bpn),
        companyRegistrationId: str(company.company_id),

        // Q2
        productNameCompany: str(product.name),
        productIdUrn: str(product.product_id),
        productDescription: str(product.description),
        productClassificationUrn: str(product.classification),

        // Q3
        declaredUnit: str(product.declared_unit),
        declaredUnitAmount: num(product.declared_unit_quantity),
        productMassPerDeclaredUnit: num(product.declared_mass),

        // Q5
        referencePeriodStart: str(sp.reference_start),
        referencePeriodEnd: str(sp.reference_end),
        validityPeriodStart: str(sp.validity_start),
        validityPeriodEnd: str(sp.validity_end),

        // Q6 / Q7
        retroOrProspectivePcfType: str(sp.pcf_type),
        systemBoundary: str(sp.system_boundary),

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
        lucEmissionFactor: num(biobased.luc_emission_factor),

        // Q21
        crossSectoralStandards: str(methodology.cross_sectoral_standard),
        productOrSectorSpecificRules: str(methodology.product_sector_pcr),
        ipccGwpVersion: str(methodology.gwp_version_info),

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

        // Q25 DQR
        primaryDataSharePct: num(dqr.primary_data_share),
        secondaryEfSource: str(dqr.secondary_ef_source),
        dataYear: str(dqr.data_year),
        dqrTechnological: num(dqr.technological),
        dqrGeographical: num(dqr.geographical),
        dqrTemporal: num(dqr.temporal),

        // Q26 verification
        productCertified: yesNoToBool(verification.product_certified),
        certificationScheme: str(verification.certification_scheme),
        certificateNumber: str(verification.certificate_number),
        certificateValidFrom: str(verification.certificate_valid_from),
        certificateValidTo: str(verification.certificate_valid_to),
        pcfVerified: yesNoToBool(verification.pcf_verified),
        attestationType: str(verification.attestation_type),
        attestationSchemeStandard: str(verification.attestation_scheme_standard),
        attestationId: str(verification.attestation_id),
        attestationIssuer: str(verification.attestation_issuer),
        attestationUrl: str(verification.attestation_url),
        attestationCompletedAt: str(verification.attestation_completed_at),

        // children
        sites,
        bom,
        coProducts,
        electricity,
        fuels,
        processGases,
        qcItEnergy,
        productionWaste,
        packagingMaterials,
        packagingTransport,
        packagingWaste,
        transportLegs,
        biomass,
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
    return postJson(`${API_BASE_URL}/api/questionnaire/save`, payload);
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
