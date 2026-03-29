import { FileText } from "lucide-react";

export interface ColumnMapping {
    header: string;
    key: string;
    filterKey?: string;
}

export interface ReportConfig {
    id: string;
    title: string;
    description: string;
    module: string;
    updatedAt: string;
    icon: any;
    iconColor: string;
    moduleColor: string;
    typeColor: string;
    type: string;
    endpoint: string;
    columns: ColumnMapping[];
}

export const reportsConfig: ReportConfig[] = [
    {
        id: "product-footprint",
        title: "Product Footprint",
        description: "Detailed carbon footprint analysis for all products including raw materials and production.",
        module: "Sustainability",
        type: "System",
        updatedAt: "Updated 2h ago",
        icon: FileText,
        iconColor: "text-blue-500 bg-blue-50",
        moduleColor: "text-green-600 bg-green-50",
        typeColor: "text-green-600 bg-green-50",
        endpoint: "/api/report/product-foot-print-list",
        columns: [
            { header: "SL.NO", key: "index" },
            { header: "Supplier ID/Code", key: "supplier_details.code", filterKey: "supplier_code" },
            { header: "Supplier name", key: "supplier_details.supplier_name", filterKey: "supplier_name" },
            { header: "Component or Parts Name", key: "component_name", filterKey: "component_name" },

            { header: "Weight (gms) /unit", key: "weight_gms" },
            { header: "Total Weight (gms)", key: "total_weight_gms" },
            { header: "Component Category", key: "component_category", filterKey: "component_category" },
            { header: "Transport Mode", key: "transportation_details.mode_of_transport", filterKey: "mode_of_transport" },
            { header: "Economic Ratio", key: "economic_ratio" },
            { header: "Allocation Methodology", key: "production_emission_calculation.allocation_methodology" },
            { header: "Raw Materials Emissions", key: "pcf_total_emission_calculation.material_value" },
            { header: "Production Emissions", key: "pcf_total_emission_calculation.production_value" },
            { header: "Packaging Emissions", key: "pcf_total_emission_calculation.packaging_value" },
            { header: "Waste Emissions", key: "pcf_total_emission_calculation.waste_value" },
            { header: "Transportation Emissions", key: "pcf_total_emission_calculation.logistic_value" },
            { header: "PCF [kg CO2e / kg Material]", key: "pcf_total_emission_calculation.total_pcf_value" },
        ]
    },
    {
        id: "supplier-footprint",
        title: "Supplier Footprint",
        description: "Emissions tracking across the supplier network and manufacturing regions.",
        module: "Emissions",
        type: "System",
        updatedAt: "Updated 5h ago",
        icon: FileText,
        iconColor: "text-purple-500 bg-purple-50",
        moduleColor: "text-orange-600 bg-orange-50",
        typeColor: "text-green-600 bg-green-50",
        endpoint: "/api/report/supplier-foot-print-list",
        columns: [
            { header: "SL. No.", key: "index" },
            { header: "Supplier ID/Code", key: "supplier_details.code", filterKey: "supplier_code" },
            { header: "Supplier Name", key: "supplier_details.supplier_name", filterKey: "supplier_name" },
            { header: "Manufacturing Region", key: "Q13_data.location", filterKey: "manufacturing_region" },
            { header: "Component / Part Supplied", key: "component_name", filterKey: "component_name" },
            { header: "Material Type", key: "Q52_material_type_data.material_name", filterKey: "material_type" },
            { header: "Energy Type Used in Manufacturing", key: "Q22_energy_type_and_energy_quantity.energy_type", filterKey: "energy_type" },
            { header: "Energy Quantity (kWh/kg)", key: "Q22_energy_type_and_energy_quantity.quantity", filterKey: "energy_quantity" },
            { header: "Recycled Content (%)", key: "recycled_content_percentage" },
            { header: "Emission Factor", key: "Q22_energy_type_and_energy_quantity.emission_factor" },
            { header: "Supplier Emission", key: "supplier_total_pcf_emission" },
        ]
    },
    {
        id: "material-footprint",
        title: "Material Footprint",
        description: "Detailed product material breakdown and recyclability metrics.",
        module: "Sustainability",
        type: "System",
        updatedAt: "Updated 1d ago",
        icon: FileText,
        iconColor: "text-green-500 bg-green-50",
        moduleColor: "text-green-600 bg-green-50",
        typeColor: "text-green-600 bg-green-50",
        endpoint: "/api/report/material-foot-print-list",
        columns: [
            { header: "SL.No", key: "index" },
            { header: "Supplier ID/Code", key: "supplier_details.code", filterKey: "supplier_code" },
            { header: "Supplier Name", key: "supplier_details.supplier_name", filterKey: "supplier_name" },
            { header: "Component Name", key: "component_name", filterKey: "component_name" },
            { header: "Material", key: "material_name", filterKey: "material_name" },
            { header: "Material Composition (%)", key: "material_percentage" },
            { header: "Recyclability (%)", key: "recycled_percentage" },
            { header: "Weight in kg", key: "material_weight_kg" },
            { header: "Emission Factor (kg CO₂e/kg material)", key: "emission_factor_used" },
            { header: "Emission in CO2 eq", key: "emission_in_co2_eq" }
        ]
    },
    {
        id: "electricity-footprint",
        title: "Electricity Footprint",
        description: "Energy consumption and electricity source emissions categories.",
        module: "Emissions",
        type: "System",
        updatedAt: "Updated 3h ago",
        icon: FileText,
        iconColor: "text-indigo-500 bg-indigo-50",
        moduleColor: "text-orange-600 bg-orange-50",
        typeColor: "text-green-600 bg-green-50",
        endpoint: "/api/report/electricity-foot-print-list",
        columns: [
            { header: "Sl.No", key: "index" },
            { header: "Supplier ID/Code", key: "supplier_details.code", filterKey: "supplier_code" },
            { header: "Supplier Name", key: "supplier_details.supplier_name", filterKey: "supplier_name" },
            { header: "Component Name", key: "component_name", filterKey: "component_name" },
            { header: "Electricity Source", key: "electricity_source" },
            { header: "Energy Type", key: "energy_type", filterKey: "energy_type" },
            { header: "Quantity", key: "energy_quantity" },
            { header: "Unit", key: "energy_unit" },
            { header: "Source Section", key: "source_section" },
            { header: "Emission Factor (kg CO₂e/kWh)", key: "emission_factor" },
            { header: "Emission", key: "calculated_emission" }
        ]
    },
    {
        id: "transportation-footprint",
        title: "Transportation Footprint",
        description: "Logistics emissions categorized by transport modes and distances.",
        module: "Emissions",
        type: "System",
        updatedAt: "Updated 6h ago",
        icon: FileText,
        iconColor: "text-teal-500 bg-teal-50",
        moduleColor: "text-orange-600 bg-orange-50",
        typeColor: "text-green-600 bg-green-50",
        endpoint: "/api/report/transporation-foot-print-list",
        columns: [
            { header: "Sl. No", key: "index" },
            { header: "Supplier ID/Code", key: "supplier_details.code", filterKey: "supplier_code" },
            { header: "Supplier Name", key: "supplier_details.supplier_name", filterKey: "supplier_name" },
            { header: "Component Name", key: "component_name", filterKey: "component_name" },
            { header: "Mode / Category", key: "transport_mode", filterKey: "mode_of_transport" },
            { header: "Source", key: "source_point" },
            { header: "Destination", key: "drop_point" },
            { header: "Weight Transported", key: "weight_transported" },
            { header: "Distance (km)", key: "distance_km" },
            { header: "Emission Factor (kg CO₂e / tonne·km)", key: "emission_factor" },
            { header: "Total Emission (kg CO₂e)", key: "total_emission" }
        ]
    },
    {
        id: "packaging-footprint",
        title: "Packaging Footprint",
        description: "Packaging material types and their contribution to total emissions.",
        module: "Emissions",
        type: "System",
        updatedAt: "Updated 4h ago",
        icon: FileText,
        iconColor: "text-amber-500 bg-amber-50",
        moduleColor: "text-orange-600 bg-orange-50",
        typeColor: "text-green-600 bg-green-50",
        endpoint: "/api/report/packaging-foot-print-list",
        columns: [
            { header: "Sl. No", key: "index" },
            { header: "Supplier ID/Code", key: "supplier_details.code", filterKey: "supplier_code" },
            { header: "Supplier Name", key: "supplier_details.supplier_name", filterKey: "supplier_name" },
            { header: "Component Name", key: "component_name", filterKey: "component_name" },
            { header: "Packaging Material / Type", key: "packaging_type", filterKey: "packagin_type" },
            { header: "Treatment Type", key: "treatment_type" },
            { header: "Type of Energy Used", key: "energy_type", filterKey: "energy_type" },
            { header: "Recyclability (%)", key: "packaging_recyclability" },
            { header: "Emission Factor (kg CO₂e / kg)", key: "emission_factor" },
            { header: "Emission @ 0.25 kg (kg CO₂e)", key: "emission_0_25" },
            { header: "Emission @ 0.5 kg (kg CO₂e)", key: "emission_0_5" },
        ]
    },
    {
        id: "dqr-rating",
        title: "DQR Rating",
        description: "Comprehensive data quality validation and transparency metrics.",
        module: "Quality",
        type: "System",
        updatedAt: "Updated 1h ago",
        icon: FileText,
        iconColor: "text-rose-500 bg-rose-50",
        moduleColor: "text-blue-600 bg-blue-50",
        typeColor: "text-green-600 bg-green-50",
        endpoint: "/api/report/supplier-dqr-rating-report",
        columns: [
            { header: "Sl. No", key: "index" },
            { header: "Supplier ID/Code", key: "supplier_code" },
            { header: "Supplier Name", key: "supplier_name" },
            { header: "Technological Representativeness (TeR)", key: "total_average_value_ter" },
            { header: "Geographical Representativeness (GR)", key: "total_average_value_gr" },
            { header: "Temporal Representativeness (TiR)", key: "total_average_value_tir" },
            { header: "Completeness (C)", key: "total_average_value_c" },
            { header: "Reliability (PDS)", key: "total_average_value_pds" },
            { header: "Average DQR Score", key: "overall_dqr_score" },
            { header: "Data Quality Level (Catena-X)", key: "criterion" },
            { header: "Description", key: "meaning_description" }
        ]
    },
];
