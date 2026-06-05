import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SupplierQuestionnaire.module.css'

const listIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const SECTIONS = [
    { id: 'section1', num: 'Section 1', title: 'Organization Details', icon: listIcon },
    { id: 'section2', num: 'Section 2', title: 'Product Details', icon: listIcon },
    { id: 'section3', num: 'Section 3', title: 'Scope 1 - Direct Emissions', icon: listIcon },
    { id: 'section4', num: 'Section 4', title: 'Scope 2 - Indirect Emissions', icon: listIcon },
    { id: 'section5', num: 'Section 5', title: 'Scope 3 - Other Indirect Emissions', icon: listIcon },
    { id: 'section6', num: 'Section 6', title: 'Scope 4 - Avoided Emissions', icon: listIcon },
]

const SECTION_DESCS = {
    section2: 'This section collects product-level information required for accurate Product Carbon Footprint (PCF) or environmental impact assessment. Please ensure all mandatory fields are completed with correct and verifiable data.',
    section3: 'Scope 1 includes emissions from sources that are owned or controlled by your organization. This section covers stationary combustion, mobile combustion, fugitive emissions, and process emissions. Please provide accurate annual data for the selected reporting year.',
    section4: 'Emissions from electricity, steam, heating, and cooling purchased and consumed by the organization. Accurate reporting ensures correct Scope 2 calculation and helps identify opportunities for renewable energy transition.',
    section5: 'Scope 3 includes emissions that occur outside your direct operations, but are linked to your value chain — including raw materials, packaging, logistics, and waste generated across the product lifecycle.',
    section6: 'Scope 4 refers to emissions avoided as a result of your products, services, or initiatives. These emissions represent the positive climate impact your organization enables beyond your direct footprint.',
}

const QUESTIONS = {
    section1: [
        {
            id: 'q01', num: 'QUESTION 01', title: 'Please enter the name of your organization?', mandatory: true, defaultOpen: true,
            what: 'The registered legal name of your organization as it appears in official government and tax documentation. If you are a subsidiary, provide the name of the reporting entity responsible for this supply chain.',
            why: 'Accurate legal identification ensures traceability, regulatory compliance, and correct mapping of emissions data to the appropriate reporting entity. It prevents duplication or misallocation in sustainability reporting.',
            instructions: 'Enter the full legal name of your organization. Avoid abbreviations unless they are officially registered.',
        },
        {
            id: 'q02', num: 'QUESTION 02', title: 'What is your core business activities?', mandatory: true, defaultOpen: false,
            what: 'The primary business activity that best represents your organization\'s main operations within the supply chain.',
            why: 'Understanding your operational category helps classify emissions profiles, apply appropriate industry benchmarks, and ensure sector-specific accuracy in Product Carbon Footprint (PCF) calculations.',
            instructions: 'Select your primary business activity from the dropdown. Use the search icon to find your category quickly.\n\nExamples include:\n\nTier-1 Manufacturing\nComponent Manufacturing\nLogistics & Warehousing\nChemical / Resin Production\nOthers\n\nIf your activity isn\'t listed, select "Others" and specify.',
        },
        {
            id: 'q03', num: 'QUESTION 03', title: 'Please enter your Designation/Role/Title?', mandatory: true, defaultOpen: false,
            what: 'Your official job title or designation within the organization submitting this data.',
            why: 'Identifying the responsible individual ensures accountability, data credibility, and traceability for audit and verification purposes.',
            instructions: 'Enter your official designation within the organization. This ensures the response is traceable and authorized.',
        },
        {
            id: 'q04', num: 'QUESTION 04', title: 'Please enter your e-mail address?', mandatory: true, defaultOpen: false,
            what: 'Your official company email address for communication and verification.',
            why: 'This enables secure follow-ups, clarification requests, and validation of submitted data, ensuring reporting transparency.',
            instructions: 'Provide your official company email address. This will be used for communication, clarification or validation if required.',
        },
        {
            id: 'q05', num: 'QUESTION 05', title: 'How many employees does your organization have?', mandatory: true, defaultOpen: false,
            what: 'The total number of employees or employee range within your organization.',
            why: 'Organization size helps contextualize emissions intensity, operational scale, and benchmarking comparisons within similar industry categories.',
            instructions: 'Select the appropriate employee range from the dropdown.\nIf you prefer to provide the exact number, enter it in the numeric input box. This helps classify your organization size for reporting and benchmarking purposes.',
        },
        {
            id: 'q06', num: 'QUESTION 06', title: 'What is your organization\'s annual revenue?', mandatory: true, defaultOpen: false,
            what: 'Your organization\'s annual revenue for the selected reporting period.',
            why: 'Revenue data supports normalization of emissions metrics and improves sustainability performance comparisons across entities of different economic scale.',
            instructions: 'Select the revenue range that best represents your organization.\nIf required, provide the exact annual revenue value in the numeric input box. Revenue data supports organizational classification and sustainability reporting alignment.',
        },
        {
            id: 'q07', num: 'QUESTION 07', title: 'Please enter the organizational annual reporting period?', mandatory: true, defaultOpen: false,
            what: 'The specific reporting year for which emissions and operational data are being submitted.',
            why: 'Consistent reporting periods ensure accurate year-on-year comparison and alignment with PCF boundary conditions.',
            instructions: 'Select the reporting year (YYYY format) from the dropdown list (2020–2050).\nPlease ensure the selected year matches the year for which emissions and energy data are being reported.',
        },
        {
            id: 'q08', num: 'QUESTION 08', title: 'Do you have Site or Organizational level Scope 1, 2, and 3 emissions data available?', mandatory: true, defaultOpen: false,
            what: 'Whether your organization has calculated emissions data at the site or organizational level for Scope 1, 2, and 3.',
            why: 'This determines the maturity of your carbon accounting system and allows integration of verified emissions data into PCF modeling.',
            instructions: 'Indicate whether your organization has site-level or organization-level emissions data available.\nSelect:\nYes – if emissions have been calculated\nNo – if emissions data is not currently available',
        },
        {
            id: 'q09', num: 'QUESTION 09', title: 'Provide Emission Data If “Yes”?', mandatory: true, defaultOpen: false,
            what: 'Total Scope 1, Scope 2, and Scope 3 emissions for each manufacturing location.',
            why: 'Site-level emissions enable accurate allocation of environmental impact across facilities and improve precision in cradle-to-gate footprint calculations.',
            instructions: 'If you have selected “Yes”, you must provide emission data in the table below.\n\nPlease enter the details manually for each manufacturing location:\nCountry Code | Scope 1 | Scope 2 | Scope 3\n\nClick on “Add row” button to add additional locations.',
        },
    ],

    section2: [
        {
            id: 'q10', num: 'QUESTION 10', title: 'Do you already have a Product Carbon Footprint (PCF) report for requested product(s) within 12 months?', mandatory: true, defaultOpen: true,
            what: 'Whether a Product Carbon Footprint study has been completed within the past year.',
            why: 'Recent studies provide verified baselines and ensure carbon accounting remains accurate and up-to-date.',
            instructions: 'Select: Yes / No.\nIf your PCF study is older than 12 months, please select No.',
        },
        {
            id: 'q11', num: 'QUESTION 11', title: 'Share methodology (ISO 14067, GHG Protocol, Catena-X etc.)?', mandatory: true, defaultOpen: false,
            what: 'The carbon accounting standard or methodology used for the PCF calculation.',
            why: 'standardized methodologies ensure consistency and alignment with international reporting requirements.',
            instructions: 'If you selected Yes, specify the methodology used.\n\nExamples include:\nISO 14067\nGHG Protocol Product Standard\nCatena-X\nFull Life Cycle Assessment (LCA)\n\nEnter the methodology in the open text field. If multiple were used, click "Add" to enter additional ones.',
        },
        {
            id: 'q12', num: 'QUESTION 12', title: 'Please provide/upload the Product Carbon Footprint (PCF) report for your product(s)?', mandatory: true, defaultOpen: false,
            what: 'The full PCF report document for the selected products.',
            why: 'Documentation validates assumptions, system boundaries, and the emission factors used in your footprint calculation.',
            instructions: 'Upload the latest PCF report.\n\nEnsure:\n- Report matches the selected recording period\n- Methodology is clearly mentioned\n- System boundary (e.g. Cradle-to-gate) is defined\n- Units (kg CO₂e, etc.) are clearly stated',
        },
        {
            id: 'q13', num: 'QUESTION 13', title: 'Please Specify the Production Site Where the Product is manufactured/ assembled?', mandatory: true, defaultOpen: false,
            what: 'The specific manufacturing or assembly location for each product component.',
            why: 'Geographic location influences energy mix and logistics impacts in the final footprint result.',
            instructions: 'Select MPN from the dropdown (auto-generated from BOM). Product Name will auto-populate. Manually enter the Production Location.\n\nExample: MPN 729600.20.0002 | Chennai.',
        },
        {
            id: 'q14', num: 'QUESTION 14', title: 'Which Environmental Impact method is required for your product?', mandatory: true, defaultOpen: false,
            what: 'The specific environmental assessment method required for the product reporting.',
            why: 'Different impact categories (like water or toxicity) help evaluate environmental burdens beyond just carbon.',
            instructions: 'Select the required impact method.\n\nExamples include:\nProduct Carbon Footprint (PCF)\nWater Footprint\nLand Use Impact\nFull LCA (All Categories)\nHuman Toxicity\nAcidification\nEutrophication\nOzone Depletion\nParticulate Matter Formation\nResource Depletion\n\nIf not listed, select "Other" and specify.',
        },
        {
            id: 'q15', num: 'QUESTION 15', title: 'Please list all the products/components you manufacture and provide details for each?', mandatory: true, defaultOpen: false,
            what: 'Detailed production data including weight, period, and volume for each manufactured item.',
            why: 'Production scale and material weight are critical inputs for per-unit carbon intensity calculations.',
            instructions: 'Select MPN from dropdown. Product Name auto-fills. Enter Period (Monthly/Annual), Weight (kg/Tons), Price, and Quantity.\n\nExample: BRK-4587-A1 | Brake Pad | Annual | 2.35kg | $45 | 50,000 Pcs.',
        },
        {
            id: 'q151', num: 'QUESTION 15.1', title: 'Any Co-products generated which have economic value?', mandatory: true, defaultOpen: false,
            what: 'Whether the process generates valuable secondary products or by-products.',
            why: 'Co-products require emissions allocation, which affects the final footprint of the primary product.',
            instructions: 'Select: Yes / No.\nIf you select "Yes", please provide details in Question 15.2.',
        },
        {
            id: 'q152', num: 'QUESTION 15.2', title: 'Specify type of Co-products details?', mandatory: true, defaultOpen: false,
            what: 'Information about co-products including weight, quantity, and economic value.',
            why: 'Economic allocation distributes emissions appropriately between primary products and valuable by-products.',
            instructions: 'Select MPN from dropdown. Enter Co-Product Name, Weight, Price, and Quantity.\n\nExample: AL-HSG-210 | Aluminium Housing | Aluminium Scrap | 0.30kg | ₹150 | 20,000 Pcs.',
        },
    ],

    section3: [
        // ── 3.1 Stationary Combustion ──
        { type: 'group', id: 'g31', label: '3.1 Stationary Combustion (On-Site Energy)' },
        {
            id: 'q16', num: 'QUESTION 16', title: 'What type and quantity of fuel does your company use for energy generation?', mandatory: true, defaultOpen: true,
            what: 'The type and annual quantity of fuels used for on-site energy generation, including boilers, furnaces, and generators.',
            why: 'Fuel combustion is a primary source of direct greenhouse gas emissions. Tracking this enables precise Scope 1 calculation and identification of energy efficiency opportunities.',
            instructions: 'Select Fuel and Sub-Fuel Type from dropdowns. Enter total consumption. Choose unit of measure.\n\nExample:\nFuel: Natural Gas\nSub-fuel: CNG\nQuantity: 15,000\nUnit: m³',
        },

        // ── 3.2 Mobile Combustion ──
        { type: 'group', id: 'g32', label: '3.2 Mobile Combustion (Owned Vehicles)' },
        {
            id: 'q17', num: 'QUESTION 17', title: 'What type and quantity of fuel is consumed annually by company-owned vehicles?', mandatory: true, defaultOpen: false,
            what: 'Total annual fuel consumption from company-owned or controlled vehicles and mobile machinery.',
            why: 'Mobile combustion contributes directly to Scope 1 emissions. tracking fleet fuel usage supports emission reduction strategies like fleet electrification.',
            instructions: 'Select Fuel Type. Enter total quantity used. Choose unit of measure.\n\nExample:\nFuel: Diesel Fuel\nQuantity: 18,500\nUnit: Litres',
        },

        // ── 3.3 Fugitive Emissions ──
        { type: 'group', id: 'g33', label: '3.3 Fugitive Emissions (Refrigerants)' },
        {
            id: 'q18', num: 'QUESTION 18', title: 'Have you performed refrigerant top-ups for air conditioning, refrigeration, or fire suppression systems?', mandatory: true, defaultOpen: false,
            what: 'Whether refrigerants or industrial gases were replenished or leaked during the reporting period.',
            why: 'Refrigerants often have high Global Warming Potential (GWP). Even small leaks can significantly increase direct emissions.',
            instructions: 'Select: Yes / No.\nIf you select "Yes", please provide data in Question 19.',
        },
        {
            id: 'q19', num: 'QUESTION 19', title: 'What types and quantities of refrigerants (e.g. HFCs) have been used?', mandatory: true, defaultOpen: false,
            what: 'The specific refrigerant types and total quantities used, replenished, or emitted during the reporting period.',
            why: 'Different gases have different climate impacts. Identifying gas type and quantity allows precise calculation of CO₂e emissions.',
            instructions: 'Select Refrigerant Type. Enter Quantity. Choose Unit.\n\nExample:\nR-134a | 45 | kg\nR-410A | 20 | kg',
        },

        // ── 3.4 Process Emissions ──
        { type: 'group', id: 'g34', label: '3.4 Process Emissions (Manufacturing Activities)' },
        {
            id: 'q20', num: 'QUESTION 20', title: 'Are there emissions from industrial processes (e.g. chemical reactions, material processing)?', mandatory: true, defaultOpen: false,
            what: 'Whether your operations generate emissions from chemical reactions or material transformation beyond fuel combustion.',
            why: 'Certain processes emit greenhouse gases independently of energy use. Identifying these ensures complete Scope 1 accounting.',
            instructions: 'Select: Yes / No.\nIf you select "Yes", please specify details in Question 21.',
        },
        {
            id: 'q21', num: 'QUESTION 21', title: 'What are the Sources and types of gases emitted (e.g. CO2, CH4, N20)?', mandatory: true, defaultOpen: false,
            what: 'the specific sources and types of greenhouse gases released from industrial processes, along with total annual quantities.',
            why: 'Reporting gas-level data for processes like cement production or resin manufacturing ensures precise emissions conversion and transparency.',
            instructions: 'Enter Emission Source. Select Gas Type from dropdown. Enter Quantity. Select Unit.\n\nExamples:\n- Cement Production Kiln | CO₂ | 1,250 | kg/tons\n- Resin Manufacturing | CH₄ | 3.5 | kg/tons\n- Nitric Acid Process | N₂O | 1.2 | kg/tons',
        },
    ],

    section4: [
        {
            id: 'q22', num: 'QUESTION 22', title: 'Please enter the details of Energy purchased or acquired below?', mandatory: true, defaultOpen: true,
            what: 'The total quantity and type of energy purchased (electricity, steam, heat, cooling) during the reporting period.',
            why: 'Purchased energy is a major contributor to indirect emissions. This data ensures correct Scope 2 calculation and supports renewable transition strategies.',
            instructions: 'Select Energy Source and Type from dropdowns. Enter total consumption. Choose unit of measure.\n\nExamples:\n- Electricity | Purchased Grid | 1000 | MWh\n- Heating | Natural Gas | 750 | MWh',
        },
        {
            id: 'q23', num: 'QUESTION 23', title: 'Do you acquire any standardized certificate related to RE?', mandatory: true, defaultOpen: false,
            what: 'Standardized renewable energy certificates (RECs, I-RECs) acquired to offset or claim renewable electricity use.',
            why: 'RE procurement affects market-based Scope 2 calculations and demonstrates commitment to low-carbon energy sourcing.',
            instructions: 'Select: Yes / No.\nIf you select "Yes", please provide details in Question 24.',
        },
        {
            id: 'q24', num: 'QUESTION 24', title: 'Provide the details of standardized Certificate below.', mandatory: true, defaultOpen: false,
            what: 'Detailed information for each renewable energy certificate obtained, including serial ID and generator details.',
            why: 'Certificate transparency ensures credibility of renewable claims and prevents double-counting within sustainability reporting.',
            instructions: 'Enter Certificate Name, Procurement Mechanism, Serial ID, and Generator details.\n\nExample:\nI-REC | I-REC Purchase | IND-2023-001245 | Green Sun Solar Farm | 30-06-23',
        },

        // ── 4.1 Manufacturing Process-specific energy ──
        { type: 'group', id: 'g41', label: '4.1 Manufacturing Process-specific energy' },
        {
            id: 'q25', num: 'QUESTION 25', title: 'Do you have any device or methodology to calculate from factory level to product level energy?', mandatory: true, defaultOpen: false,
            what: 'Whether a defined system exists to allocate total factory energy consumption to individual products or components.',
            why: 'Product-level energy allocation improves the precision of PCF calculations by avoiding generalized assumptions.',
            instructions: 'Select: Yes / No.\nIf you select "Yes", please provide details in Question 26.',
        },
        {
            id: 'q26', num: 'QUESTION 26', title: 'Provide detailed Methodology?', mandatory: true, defaultOpen: false,
            what: 'A documented explanation of the methodology used to allocate energy from facility to product level.',
            why: 'Transparent methodology enhances auditability and strengthens data reliability.',
            instructions: 'Upload the document explaining your detailed allocation methodology.',
        },
        {
            id: 'q27', num: 'QUESTION 27', title: 'Please write the energy intensity of production estimated kWh or MJ per unit of product?', mandatory: true, defaultOpen: false,
            what: 'The amount of energy consumed per unit of product manufactured.',
            why: 'Energy intensity monitors efficiency, tracks performance improvements, and supports emission reduction initiatives.',
            instructions: 'Select MPN. Enter Product Name, Energy Intensity (numeric), and Unit (kWh or MJ per unit).\n\nExample:\nMPN-001 | Electronic Control Unit | 12.5 | kWh/unit',
        },
        {
            id: 'q28', num: 'QUESTION 28', title: 'Please write the Process-specific energy usage (if available)?', mandatory: false, defaultOpen: false,
            what: 'Energy consumed during specific manufacturing steps (e.g., molding, machining, assembly) per product unit.',
            why: 'Process-level data improves accuracy in footprint allocation and identifies high-impact production stages.',
            instructions: 'Select MPN, Process Type, Energy Source, and Type. Enter Quantity consumed per product.\n\nExample:\nABC-123 | Injection Molding | Grid Electricity | 2.5 | kWh/unit',
        },
        {
            id: 'q29', num: 'QUESTION 29', title: 'Do you use any abatement systems (VOC treatment, heat recovery)?', mandatory: true, defaultOpen: false,
            what: 'Whether emission control systems like VOC treatment or heat recovery are used in the facility.',
            why: 'Abatement systems reduce emissions but consume energy; including this demand ensures complete environmental accounting.',
            instructions: 'Select: Yes / No.\nIf you select "Yes", specify details in Question 30.',
        },
        {
            id: 'q30', num: 'QUESTION 30', title: 'Provide abatement source energy consumption if applicable?', mandatory: true, defaultOpen: false,
            what: 'Total energy consumed by emission control or abatement systems.',
            why: 'Capturing this prevents underestimation of total facility emissions.',
            instructions: 'Enter Abatement Source (e.g., scrubber), Quantity, and Unit.\n\nExample:\nProcess VOC Treatment | 250 | kWh/month',
        },
        {
            id: 'q31', num: 'QUESTION 31', title: 'Provide Water consumption and treatment details?', mandatory: false, defaultOpen: false,
            what: 'Details of water sources, quantities consumed, and treatment processes associated with manufacturing.',
            why: 'Water usage and treatment influence indirect energy use and broader environmental impact assessments.',
            instructions: 'Enter Source, Quantity, Unit, and Period. Mention treatment methods (ETP, RO, etc.) if applicable.',
        },

        // ── 4.2 Quality control in production ──
        { type: 'group', id: 'g42', label: '4.2 Quality control in production' },
        {
            id: 'q32', num: 'QUESTION 32', title: 'What types of quality control/testing equipment do you use?', mandatory: true, defaultOpen: false,
            what: 'Details of the quality control or testing hardware used in the facility.',
            why: 'Testing equipment consumes energy and contributes to overall operational emissions.',
            instructions: 'Enter Equipment Name, Quantity, and Avg. Operating Hours per month.\n\nExample:\nX-ray Inspection Machine | 2 Units | 160 hours/mo',
        },
        {
            id: 'q33', num: 'QUESTION 33', title: 'How much electricity is consumed for quality control activities?', mandatory: true, defaultOpen: false,
            what: 'Energy used associated specifically with quality control activities.',
            why: 'Properly allocating QC energy improves the accuracy of PCF and energy intensity calculations.',
            instructions: 'Enter Energy Type, Quantity, Unit, and Period.\n\nExample:\nGrid Electricity | 1,250 | kWh | Monthly',
        },
        {
            id: 'q34', num: 'QUESTION 34', title: 'Do your quality control processes use compressed air, nitrogen, or other utilities?', mandatory: true, defaultOpen: false,
            what: 'Utilities consumed during quality testing that have embedded energy impacts.',
            why: 'Incorporating utility consumption ensures a comprehensive evaluation of indirect QC emissions.',
            instructions: 'Enter Process Name, Quantity, and Period.\n\nExample:\nLeak Testing (Compressed Air) | 950 | Nm³ | Monthly',
        },
        {
            id: 'q341', num: 'QUESTION 34.1', title: 'Do your quality control processes use pressure or flow-based utilities?', mandatory: true, defaultOpen: false,
            what: 'Resource demand linked to pressure or flow-based utilities used in testing.',
            why: 'quantifying these inputs enables proper allocation of operational inputs for impact assessment.',
            instructions: 'Enter Flow Name, Quantity, Unit, and Period.\n\nExample:\nCompressed Air Flow | 1,200 | Nm³ | Monthly',
        },
        {
            id: 'q35', num: 'QUESTION 35', title: 'Do quality control activities use any consumables?', mandatory: true, defaultOpen: false,
            what: 'Material inputs (chemicals, gases, filters) consumed during validation processes.',
            why: 'Consumables contribute to material usage and environmental impacts in the total footprint.',
            instructions: 'Enter Consumable Name, Mass, and Period.\n\nExample:\nCleaning Solvent | 45 | kg | Monthly',
        },
        {
            id: 'q36', num: 'QUESTION 36', title: 'Do you perform destructive testing?', mandatory: true, defaultOpen: false,
            what: 'Whether products are destroyed during quality testing procedures.',
            why: 'Destructive testing increases material consumption and waste, influencing the total environmental burden per unit.',
            instructions: 'Select: Yes / No.\nIf you select "Yes", provide weight data in Question 37.',
        },
        {
            id: 'q37', num: 'QUESTION 37', title: 'Please write the weight of samples destroyed?', mandatory: true, defaultOpen: false,
            what: 'The weight of materials destroyed during quality testing activities.',
            why: 'Quantifying destroyed material ensures accurate allocation of material loss and waste impacts.',
            instructions: 'Select MPN. Enter Component Name, Weight, and Period.\n\nExample:\nMPN-10045 | Valve Housing | 12.5 | kg | Monthly',
        },
        {
            id: 'q38', num: 'QUESTION 38', title: 'What is the defect or rejection rate identified by quality control?', mandatory: true, defaultOpen: false,
            what: 'Percentage of products rejected during quality control inspections.',
            why: 'Rejection rates help allocate scrap, rework, and associated environmental burdens accurately.',
            instructions: 'Select MPN. Enter Percentage (%) per product.\n\nExample:\nMPN-10045 | Valve Housing | 2.5%',
        },
        {
            id: 'q39', num: 'QUESTION 39', title: 'What is the rework rate due to quality control findings?', mandatory: true, defaultOpen: false,
            what: 'The percentage of products requiring rework and the associated operational impacts.',
            why: 'Rework operations add extra energy and resource consumption beyond standard production.',
            instructions: 'Select MPN. Enter Processes Involved and Percentage (%).\n\nExample:\nMPN-10045 | Valve Housing | Re-machining | 1.2%',
        },
        {
            id: 'q40', num: 'QUESTION 40', title: 'What are the types and weight of Quality control waste generated?', mandatory: true, defaultOpen: false,
            what: 'Types and quantities of waste generated during QC and their treatment methods.',
            why: 'Waste handling impacts are necessary to calculate the overall environmental burden of the product.',
            instructions: 'Select MPN. Enter Waste Type, Weight, and Treatment Type.\n\nExample:\nMPN-10045 | Valve Housing | Metal Scrap | 18.5 | kg | Recycling',
        },

        // ── 4.3 Information Technology (IT) ──
        { type: 'group', id: 'g43', label: '4.3 Information Technology (IT) for Production Control' },
        {
            id: 'q41', num: 'QUESTION 41', title: 'What IT systems do you use for production control?', mandatory: true, defaultOpen: false,
            what: 'Digital systems (PLC, SCADA, MES, ERP, IoT) used for manufacturing or shop-floor management.',
            why: 'Digital infrastructure contributes to total energy demand and operational footprint.',
            instructions: 'Select all applicable: PLCs, SCADA, MES, ERP, Automation, IoT, Others.',
        },
        {
            id: 'q42', num: 'QUESTION 42', title: 'Do you have energy consumption of IT hardware or on-site servers?', mandatory: true, defaultOpen: false,
            what: 'Energy consumed by servers, data centres, and IT hardware supporting production.',
            why: 'Digital infrastructure can significantly influence the overall operational footprint.',
            instructions: 'Select: Yes / No.',
        },
        {
            id: 'q43', num: 'QUESTION 43', title: 'Is this IT energy consumption included in Section 4 - Q22?', mandatory: true, defaultOpen: false,
            what: 'Whether IT energy use has already been captured under total purchased energy reporting.',
            why: 'Confirmation ensures no double counting or omission in electricity reporting.',
            instructions: 'Select: Yes / No.\nIf "No", provide details in Question 44.',
        },
        {
            id: 'q44', num: 'QUESTION 44', title: 'Please write the energy consumption for IT hardware?', mandatory: true, defaultOpen: false,
            what: 'Total energy consumed specifically by IT systems supporting production.',
            why: 'Essential for accurately determining PCF and identifying reduction opportunities.',
            instructions: 'Select Energy Source and Type. Enter Quantity and Unit.\n\nExample:\nElectricity | Grid Electricity | 5000 | kWh',
        },
        {
            id: 'q45', num: 'QUESTION 45', title: 'Do you use cloud-based systems for production or QC?', mandatory: true, defaultOpen: false,
            what: 'Use of external data centres or cloud services for core operations.',
            why: 'Cloud-based systems involve indirect energy use that should be considered in the overall assessment.',
            instructions: 'Select: Yes / No.\nIf "Yes", provide details in Question 46.',
        },
        {
            id: 'q46', num: 'QUESTION 46', title: 'Cloud provider name and approximate monthly usage?', mandatory: true, defaultOpen: false,
            what: 'Provider details and usage metrics (compute hours, storage, data transfer).',
            why: 'Usage data allows approximating the environmental impact of outsourced digital infrastructure.',
            instructions: 'Enter Provider, CPU hours, Storage (GB), and Data Transfer (GB).\n\nExample:\nAWS | 4,500 CPU hours | 2,000 GB | 850 GB',
        },
        {
            id: 'q47', num: 'QUESTION 47', title: 'Are any dedicated monitoring sensors used for energy or vibration?', mandatory: true, defaultOpen: false,
            what: 'Use of IoT sensors for operational data collection.',
            why: 'Monitoring devices consume incremental energy that contributes to the total operational footprint.',
            instructions: 'Enter Sensor Type, Quantity, and Energy Consumption.\n\nExample:\nEnergy monitoring meter | 12 | 480 | kWh/year',
        },
        {
            id: 'q48', num: 'QUESTION 48', title: 'What is the annual replacement rate for sensors or IT consumables?', mandatory: true, defaultOpen: false,
            what: 'Annual replacement quantity for digital devices and consumables.',
            why: 'Replacement rates capture periodic resource consumption and disposal impacts.',
            instructions: 'Enter Item Name, Quantity, and Unit.\n\nExample:\nTemperature Sensors | 15 | MWh',
        },
        {
            id: 'q49', num: 'QUESTION 49', title: 'Do you use any cooling systems for server rooms?', mandatory: true, defaultOpen: false,
            what: 'Presence of dedicated cooling infrastructure for IT equipment.',
            why: 'Cooling systems can significantly increase electricity consumption and overall footprint.',
            instructions: 'Select: Yes / No.',
        },
        {
            id: 'q50', num: 'QUESTION 50', title: 'Is cooling energy included in total purchased energy in Q22?', mandatory: true, defaultOpen: false,
            what: 'Whether cooling energy use is already captured in the facility-level reporting.',
            why: 'Ensures no missing or double-counted energy data in the overall calculation.',
            instructions: 'Select: Yes / No.\nIf "No", provide details in Question 51.',
        },
        {
            id: 'q51', num: 'QUESTION 51', title: 'Please write the energy consumption for cooling systems?', mandatory: true, defaultOpen: false,
            what: 'Total electricity used for IT cooling infrastructure.',
            why: 'Accurate tracking ensures comprehensive indirect digital emission reporting.',
            instructions: 'Select Source and Type. Enter Quantity and Unit.\n\nExample:\nElectricity | Grid Electricity | 5000 | kWh',
        },
    ],

    section5: [
        // ── 5.1 Materials Details ──
        { type: 'group', id: 'g51', label: '5.1 Materials Details' },
        {
            id: 'q52', num: 'QUESTION 52', title: 'Please select or write all the raw materials used in your component manufacturing?', mandatory: true, defaultOpen: true,
            what: 'The specific types of raw materials used in each component and their percentage composition by weight.',
            why: 'Composition is a primary driver of carbon footprint. Accurate breakdown enables precise lifecycle emission calculation.',
            instructions: 'Select MPN and Material. Enter % Composition (must total 100% per MPN).\n\nExample:\nSS304 | 65%\nEPDM Rubber | 20%\nBrass | 10%\nPA6 | 5%',
        },
        {
            id: 'q521', num: 'QUESTION 52.1', title: 'Would you like Enviguide support to help identify material compositions?', mandatory: false, defaultOpen: false,
            what: 'This option is provided in case you do not have detailed material composition data available. Enviguide support can assist in identifying approximate compositions.',
            why: 'Ensures accurate environmental calculations by providing expert guidance on material identification.',
            instructions: 'Select: Yes / No.\nIf "Yes", our team will contact you.',
        },
        {
            id: 'q53', num: 'QUESTION 53', title: 'What is the grade of metal used in the manufacture of this component?', mandatory: true, defaultOpen: false,
            what: 'To determine the exact material specification, as different metal grades have different compositions and environmental impacts.',
            why: 'Different metal grades have varying embodied emissions; precise data improves PCF accuracy.',
            instructions: 'Type the exact metal grade as per your material specification or purchase record.\nExample: SS304, SS316, Al 6061, Mild Steel IS2062.',
        },
        {
            id: 'q54', num: 'QUESTION 54', title: 'Please provide material safety data sheets (MSDS) or composition breakdowns if available?', mandatory: false, defaultOpen: false,
            what: 'MSDS or detailed composition breakdowns give environmental and safety context, critical for calculating a reliable PCF.',
            why: 'Required for emission calculation accuracy, health & safety compliance, and supply chain transparency.',
            instructions: 'Kindly upload the Material Safety Data Sheets (MSDS) or a detailed composition breakdown document.',
        },
        {
            id: 'q55', num: 'QUESTION 55', title: 'Does your company have Consumption of recycled material content / secondary materials used in your products?', mandatory: true, defaultOpen: false,
            what: 'Usage of materials recovered from waste streams and reprocessed into new products.',
            why: 'Recycled content significantly reduces environmental impact and contribution to the Product Carbon Footprint (PCF).',
            instructions: 'Select: Yes / No.\nIf you choose "Yes", specify the details in Question 56.',
        },
        {
            id: 'q56', num: 'QUESTION 56', title: 'Please write the recycled materials with percentage of recycled material content?', mandatory: true, defaultOpen: false,
            what: 'This information helps track the use of recycled or secondary materials in your products.',
            why: 'Important for calculating the Product Carbon Footprint (PCF) accurately and supports sustainability reporting.',
            instructions: 'Select MPN and Material. Enter % Recycled content.\n\nExample:\nPlastic (HDPE) | 25%\nAluminium | 40%',
        },
        {
            id: 'q57', num: 'QUESTION 57', title: 'Does your company know (or can give a rough estimate) of the percentage of pre-consumer, post-consumer and reutilization materials?', mandatory: true, defaultOpen: false,
            what: 'Estimated proportion of materials classified as pre-consumer, post-consumer, or reused.',
            why: 'Refines the carbon model by distinguishing between different recovery pathways.',
            instructions: 'Select: Yes / No.\nIf you select "Yes", you need to fill Question 58.',
        },
        {
            id: 'q58', num: 'QUESTION 58', title: 'Please write the percentage of pre-consumer, post-consumer and reutilization materials used in your products?', mandatory: true, defaultOpen: false,
            what: 'Quantitative breakdown of material source types by recovery category.',
            why: 'Improves supply chain transparency and alignment with circular economy standards.',
            instructions: 'Select Material Type and enter %.\n\nExample:\nPre-consumer | 30%\nPost-consumer | 15%\nReused | 10%',
        },
        {
            id: 'q59', num: 'QUESTION 59', title: 'Please specify the post-industrial recycling (PIR) materials and post-consumer recycling (PCR) materials with percentage (%)?', mandatory: true, defaultOpen: false,
            what: 'Specific breakdown of PIR and PCR recycled content usage.',
            why: 'Differentiates the environmental impact source of recycled material streams.',
            instructions: 'Select PIR/PCR and enter %.\nExample: PIR | 25%, PCR | 15%',
        },

        // ── 5.2 Packaging Details ──
        { type: 'group', id: 'g52', label: '5.2 Packaging Details' },
        {
            id: 'q60', num: 'QUESTION 60', title: 'What type of packaging materials are used for delivering the product?', mandatory: true, defaultOpen: false,
            what: 'Physical materials (boxes, bags, pallets) used for component transport.',
            why: 'Packaging contributes to Scope 3 waste emissions and transport weight impacts.',
            instructions: 'Select MPN. Choose Packaging Type and Treatment.\n\nExample:\nBox | 50 | kg | Palletized',
        },
        {
            id: 'q61', num: 'QUESTION 61', title: 'Approximate weight of packaging per unit product?', mandatory: true, defaultOpen: false,
            what: 'The average weight of packaging allocated to a single product unit.',
            why: 'Directly influences total lifecycle material usage and logistics emissions.',
            instructions: 'Enter weight per product and select unit (kg/g).\nExample: MPN123 | 0.5 | kg',
        },
        {
            id: 'q62', num: 'QUESTION 62', title: 'What is the size of packing?', mandatory: true, defaultOpen: false,
            what: 'Physical dimensions/size category of the shipping package.',
            why: 'Determines logistics load efficiency and storage volume impacts.',
            instructions: 'Enter package size and unit.\nExample: 50 | Cm/M',
        },
        {
            id: 'q63', num: 'QUESTION 63', title: 'Do you use recycled material for packaging?', mandatory: true, defaultOpen: false,
            what: 'Whether packaging materials incorporate recycled content.',
            why: 'Reduces upstream material impact and supports circularity goals.',
            instructions: 'Select: Yes / No.\nIf "Yes", specify % in Question 64.',
        },
        {
            id: 'q64', num: 'QUESTION 64', title: 'What % of recycled content used in packaging materials?', mandatory: true, defaultOpen: false,
            what: 'The percentage of recycled content used in your packaging materials.',
            why: 'Reduces environmental impact. Knowing the percentage helps accurately estimate emissions from raw material extraction.',
            instructions: 'Enter the percentage of recycled content (e.g., 15%).',
        },
        {
            id: 'q65', num: 'QUESTION 65', title: 'Do you use Electricity for packaging?', mandatory: true, defaultOpen: false,
            what: 'Understanding electricity use in packaging helps calculate energy-related emissions.',
            why: 'Enables complete energy accounting for the packaging stage.',
            instructions: 'Select: Yes / No.\nIf "Yes", proceed to Question 66.\nIf "No", specify waste details in Question 68.',
        },
        {
            id: 'q66', num: 'QUESTION 66', title: 'Is this Energy consumption included in the total energy purchased Section 4 - Q22?', mandatory: true, defaultOpen: false,
            what: 'Confirmation if packaging energy is already captured in the facility-level energy reporting.',
            why: 'Ensures data consistency and prevents duplication or omission in accounting.',
            instructions: 'Select: Yes / No.\nIf "No", fill Question 67 for detailed information.',
        },
        {
            id: 'q67', num: 'QUESTION 67', title: 'Please write the energy consumption for packaging?', mandatory: true, defaultOpen: false,
            what: 'Total energy used specifically for packaging operations.',
            why: 'Ensures the PCF reflects all energy inputs at the final production stage.',
            instructions: 'Select Source/Type and Enter Quantity.\nExample: Grid Electricity | 5000 | kWh',
        },

        // ── 5.3 Disposal of Waste ──
        { type: 'group', id: 'g53', label: '5.3 Disposal of Waste' },
        {
            id: 'q68', num: 'QUESTION 68', title: 'What are the types and weight of production and packaging waste?', mandatory: true, defaultOpen: false,
            what: 'Types and volumes of waste generated during manufacturing and shipping prep.',
            why: 'Waste disposal impacts are a critical part of the Scope 3 footprint.',
            instructions: 'Select Waste Type and Treatment method.\n\nExample:\nPlastic Scrap | 50 | kg | Recycled',
        },
        {
            id: 'q69', num: 'QUESTION 69', title: 'Write the scrap percentage internally/externally recycled?', mandatory: true, defaultOpen: false,
            what: 'Measurement of the recycling efficiency for total production scrap.',
            why: 'Directly impacts the footprint by offsetting virgin material demand.',
            instructions: 'Enter total percentage (e.g., 85%).',
        },
        {
            id: 'q70', num: 'QUESTION 70', title: 'Any by-products generated?', mandatory: true, defaultOpen: false,
            what: 'Secondary materials created during the main production process.',
            why: 'By-products can reduce waste or generate emissions depending on their handling.',
            instructions: 'Select: Yes / No.\nIf "Yes", specify in Question 71.',
        },
        {
            id: 'q71', num: 'QUESTION 71', title: 'Specify type of By-product?', mandatory: true, defaultOpen: false,
            what: 'Detailed metrics for secondary operational outputs.',
            why: 'Captures opportunities for material recovery and circular economy credits.',
            instructions: 'Enter By-product name, price, and quantity.\nExample: Metal Scrap | ₹50 | 100 kg',
        },

        // ── 5.4 Logistics ──
        { type: 'group', id: 'g54', label: '5.4 Logistics (Raw Materials & Transport)' },
        {
            id: 'q72', num: 'QUESTION 72', title: 'Do you track emissions from transporting raw materials?', mandatory: true, defaultOpen: false,
            what: 'Presence of an tracking system for upstream raw material delivery.',
            why: 'Enables capturing upstream Scope 3 transportation impacts accurately.',
            instructions: 'Select: Yes / No.\n"Yes" leads to Q73, "No" leads to Q74.',
        },
        {
            id: 'q73', num: 'QUESTION 73', title: 'Provide estimated CO₂ emissions for your raw materials?', mandatory: true, defaultOpen: false,
            what: 'Estimated CO₂ emissions associated with transporting raw materials, based on weight, mode, and distance.',
            why: 'Captures Scope 3 upstream transportation impacts, essential for accurate PCF.',
            instructions: 'Select MPN. Enter Raw Material, Weight, Transport Mode, and Locations.\n\nExample:\nMPN123 | Aluminium | Truck | Delhi to Chennai | 120 kgCO2e',
        },
        {
            id: 'q74', num: 'QUESTION 74', title: 'What is(are) the Mode(s) of transport used for transportation of components/products? Select all the multimode transports?', mandatory: true, defaultOpen: false,
            what: 'The transport modes, distances, and weights associated with moving products.',
            why: 'Capturing these helps calculate transportation-related emissions accurately.',
            instructions: 'Select MPN. Enter Transport Mode (e.g. Truck, Rail, Ship, Air), Weight transported (Tons), and Distance (KMS).\n\nExample:\nMPN-101 | Truck, Rail | 5 Tons | 2000 KM',
        },
        {
            id: 'q741', num: 'QUESTION 74.1', title: 'Would you like Enviguide support to help calculate transport emissions?', mandatory: false, defaultOpen: false,
            what: 'Assistance from Enviguide support team to calculate transport-related CO2 emissions.',
            why: 'Ensures calculation accuracy for complex multi-modal logistics chains.',
            instructions: 'Select: Yes / No.',
        },
        {
            id: 'q75', num: 'QUESTION 75', title: 'Which destination plant are the components transported to?', mandatory: true, defaultOpen: false,
            what: 'Geographic location of the final receiving facility.',
            why: 'Determines precise logistics distances and informs regional emission factors.',
            instructions: 'Enter Country, State, City, and Pincode.\nExample: India | Tamil Nadu | Chennai | 600001',
        },

        // ── 5.5 Certifications & Standards ──
        { type: 'group', id: 'g55', label: '5.5 Certifications & Standards' },
        {
            id: 'q76', num: 'QUESTION 76', title: 'Are you certified to ISO 14001 or ISO 50001?', mandatory: true, defaultOpen: false,
            what: 'Status of international environmental or energy management system certification.',
            why: 'Demonstrates data reliability and adherence to recognized management frameworks.',
            instructions: 'Select: Yes / No.',
        },
        {
            id: 'q77', num: 'QUESTION 77', title: 'Do you follow ISO 14067, GHG Protocol, or Catena-X guidelines?', mandatory: true, defaultOpen: false,
            what: 'Adherence to internationally recognized carbon accounting standards.',
            why: 'Ensures data consistency and transparency for supply chain validation.',
            instructions: 'Select: Yes / No.',
        },
        {
            id: 'q78', num: 'QUESTION 78', title: 'Do you report to CDP, SBTi, or other ESG frameworks?', mandatory: true, defaultOpen: false,
            what: 'Participation in global sustainability disclosure platforms.',
            why: 'Indicates climate commitment and facilitates data cross-verification.',
            instructions: 'Select: Yes / No.',
        },

        // ── 5.6 Additional Notes ──
        { type: 'group', id: 'g56', label: '5.6 Decarbonization Initiatives' },
        {
            id: 'q79', num: 'QUESTION 79', title: 'What measures are you taking to reduce carbon emissions?', mandatory: true, defaultOpen: false,
            what: 'Qualitative details on active production decarbonization efforts.',
            why: 'Captures policy-driven improvements that may not be visible in raw consumption data.',
            instructions: 'Describe initiatives (e.g., Lean manufacturing, Heat recovery).\n\nExample: Switched to solar, installed VRF systems.',
        },
        {
            id: 'q80', num: 'QUESTION 80', title: 'What renewable energy or recycling programs are in place?', mandatory: true, defaultOpen: false,
            what: 'Specific initiatives like solar installation or rainwater harvesting.',
            why: 'Identifies facility-level sustainability investments that lower product footprint.',
            instructions: 'Detail programs (e.g., 30% solar coverage, on-site biogas).',
        },
        {
            id: 'q81', num: 'QUESTION 81', title: 'Share information about your current sustainability strategies?', mandatory: true, defaultOpen: false,
            what: 'Broad overview of long-term environmental goals and governance.',
            why: 'Evaluates overall environmental performance and supply chain stability.',
            instructions: 'Outline strategies (e.g., Waste reduction targets, Water conservation).',
        },
    ],

    section6: [
        {
            id: 'q82', num: 'QUESTION 82', title: 'Product Impact: Does your company produce any products or services that help reduce emissions for your customers? Can you estimate the emissions avoided by using your product?', mandatory: true, defaultOpen: true,
            what: 'Describe the product or service and how it helps reduce emissions. Provide an estimate of the emissions avoided per unit or per year, if available.',
            why: 'Quantifying avoided emissions highlights the positive environmental value of your offerings and supports accurate Product Carbon Footprint (PCF) calculations.',
            instructions: 'Describe the product or service and how it helps reduce emissions.\nProvide an estimate of the emissions avoided per unit or per year, if available.\n\nExample:\nMotor A (MPN101) is an energy-efficient electric motor that can reduce approximately 150 kg CO₂e per unit per year for customers by lowering energy consumption. The HVAC Unit B (MPN202) is a low-emission heating and cooling system, helping save around 500 kg CO₂e per unit per year by using cleaner energy and optimized operation. Similarly, the LED Light C (MPN303) is a high-efficiency lighting solution, which can reduce 200 kg CO₂e per unit per year through lower electricity usage.',
        },
        {
            id: 'q83', num: 'QUESTION 83', title: 'Circular Economy Practices: Do you implement any recycling or reuse programs in your business model that contribute to reducing emissions (e.g., product take-back or Extended Producer Responsibility regulations, refurbishment)?', mandatory: true, defaultOpen: false,
            what: 'Describe any circular economy initiatives, such as recycling, reuse, refurbishment, or take-back programs. Provide details on the scope or scale of these programs, if available.',
            why: 'These circular economy measures help lower emissions across the product lifecycle and improve the accuracy of Product Carbon Footprint (PCF) calculations.',
            instructions: 'Describe any circular economy initiatives, such as recycling, reuse, refurbishment, or take-back programs.\nProvide details on the scope or scale of these programs, if available.\n\nExample:\nOur Aluminium Panel X (MPN401) is part of a take-back program where old panels are collected and recycled, avoiding approximately 120 kg CO₂e per unit per year. The Industrial Pump Y (MPN502) undergoes a refurbishment program for returned pumps, reducing about 350 kg CO₂e per unit per year by reusing components and minimizing new material production. Additionally, our Plastic Container Z (MPN603) is included in a material reuse initiative, saving 80 kg CO₂e per unit per year by recycling plastics back into production.',
        },
        {
            id: 'q84', num: 'QUESTION 84', title: 'Renewable Energy Projects: Has your company implemented or invested in any carbon offset projects or initiatives (e.g., renewable energy investments (e.g., solar, wind), reforestation projects)?', mandatory: true, defaultOpen: false,
            what: 'Specify the project or initiative implemented. Provide the estimated emissions avoided (e.g., in tons CO₂e per year). Mention the type of emission-reduction activity (e.g., solar energy, wind energy, reforestation).',
            why: 'These initiatives directly contribute to lowering our carbon footprint and support accurate accounting in Product Carbon Footprint (PCF) calculations.',
            instructions: 'Specify the project or initiative implemented.\nProvide the estimated emissions avoided (e.g., in tons CO₂e per year).\nMention the type of emission-reduction activity (e.g., solar energy, wind energy, reforestation).\n\nExample:\nThe Solar Plant A (MPN701) generates clean electricity for our manufacturing facility, avoiding approximately 500 tons CO₂e per year. The Wind Turbine B (MPN802) supplies renewable energy to our production lines, reducing about 350 tons CO₂e per year compared to grid electricity. Additionally, the Reforestation Project C (MPN903) restores degraded land by planting native trees, sequestering roughly 200 tons CO₂e per year.',
        },
    ],
}

function AccordionItem({ q }) {
    const [open, setOpen] = useState(q.defaultOpen)
    const [showFullInstructions, setShowFullInstructions] = useState(false)

    // Helper to format text with line breaks and detect/style lists
    const formatContent = (text, truncate = false) => {
        if (!text) return null
        const lines = text.split('\n')
        
        let result = []
        let currentPills = []
        let inList = false

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim()
            
            // Detect the start of an examples list
            if (line.toLowerCase().startsWith('examples include:')) {
                result.push(<p key={`text-${i}`} className={styles.instructionLine}>{line}</p>)
                inList = true
                continue
            }

            // If we are in a list and the line looks like a list item (not too long, no full sentences)
            if (inList && line !== '' && line.length < 50 && !line.includes('.')) {
                currentPills.push(line)
                
                // If it's the last line or the next line is not a list item, flush pills
                const nextLine = lines[i + 1]?.trim()
                if (!nextLine || nextLine === '' || nextLine.length >= 50 || nextLine.includes('.') || nextLine.toLowerCase().startsWith('if none')) {
                    result.push(
                        <div key={`pills-${i}`} className={styles.pillGrid}>
                            {currentPills.map((pill, pi) => (
                                <span key={pi} className={styles.pill}>{pill}</span>
                            ))}
                        </div>
                    )
                    currentPills = []
                    inList = false
                }
            } else {
                if (line === '') {
                    result.push(<br key={`br-${i}`} />)
                } else {
                    result.push(<p key={`text-${i}`} className={styles.instructionLine}>{line}</p>)
                }
                inList = false
            }
        }

        if (truncate && result.length > 5 && !showFullInstructions) {
            return (
                <div className={styles.truncateWrapper}>
                    {result.slice(0, 5)}
                    <button 
                        className={styles.readMoreBtn} 
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowFullInstructions(true);
                        }}
                    >
                        Show more
                    </button>
                </div>
            )
        }

        return (
            <>
                {result}
                {truncate && showFullInstructions && (
                    <button 
                        className={styles.readLessBtn}
                        onClick={() => setShowFullInstructions(false)}
                    >
                        Show less
                    </button>
                )}
            </>
        )
    }

    return (
        <div className={`${styles.accordion} ${open ? styles.accordionOpen : ''}`}>
            <button className={styles.accordionHeader} onClick={() => setOpen(o => !o)}>
                <div className={styles.accordionLeft}>
                    <span className={styles.qNum}>{q.num}</span>
                    <span className={styles.qTitle}>
                        {q.title.replace(' (Mandatory)', '')}
                        {(q.mandatory || q.title.includes('(Mandatory)')) && (
                            <span className={styles.mandatoryStar} title="Mandatory">*</span>
                        )}
                    </span>
                </div>
                <svg
                    className={`${styles.chevron} ${open ? styles.chevronUp : ''}`}
                    width="18" height="18" viewBox="0 0 24 24" fill="none"
                >
                    <path d="M6 9l6 6 6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>

            {open && (
                <div className={styles.accordionBody}>
                    <div className={styles.accordionGrid}>
                        <div className={styles.accordionCol}>
                            <p className={styles.colLabel}>WHAT WE ARE ASKING</p>
                            <p className={styles.colText}>{formatContent(q.what)}</p>
                        </div>
                        <div className={styles.accordionDivider} />
                        <div className={styles.accordionCol}>
                            <p className={styles.colLabel}>WHY THIS MATTERS</p>
                            <p className={styles.colText}>{formatContent(q.why)}</p>
                        </div>
                    </div>
                    
                    {q.instructions && (
                        <div className={styles.instructionBlock}>
                            <p className={styles.colLabel}>SUPPLIER INSTRUCTIONS</p>
                            <div className={styles.instructionBox}>
                                {formatContent(q.instructions, true)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default function SupplierQuestionnaire() {
    const navigate = useNavigate()
    const [activeSection, setActiveSection] = useState('section1')
    const [search, setSearch] = useState('')

    const currentSection = SECTIONS.find(s => s.id === activeSection)
    const activeSectionLabel = currentSection ? `${currentSection.num}: ${currentSection.title}` : 'Section 1'
    const activeSectionDesc = SECTION_DESCS[activeSection] ?? null
    const activeQuestions = (QUESTIONS[activeSection] || []).filter(q =>
        q.type === 'group' ||
        search === '' ||
        q.title.toLowerCase().includes(search.toLowerCase()) ||
        q.what.toLowerCase().includes(search.toLowerCase()) ||
        q.why.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className={styles.page}>


            {/* ── Body ── */}
            <div className={styles.body}>

                {/* ── Left Sidebar ── */}
                <aside className={styles.sidebar}>
                    <p className={styles.sidebarLabel}>QUESTIONNAIRE SECTIONS</p>
                    <nav className={styles.sidebarNav}>
                        {SECTIONS.map(s => (
                            <button
                                key={s.id}
                                className={`${styles.sidebarItem} ${activeSection === s.id ? styles.sidebarItemActive : ''}`}
                                onClick={() => setActiveSection(s.id)}
                            >
                                <span className={styles.sidebarIcon}>{s.icon}</span>
                                <div className={styles.sidebarTextColumn}>
                                    <span className={styles.sidebarSectionPrefix}>{s.num}:</span>
                                    <span className={styles.sidebarSectionTitle}>{s.title}</span>
                                </div>
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* ── Main Content ── */}
                <main className={styles.main}>

                    {/* Breadcrumb */}
                    <div className={styles.breadcrumb}>
                        <button className={styles.breadcrumbLink} onClick={() => navigate('/help-centre')}>Help Center</button>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18l6-6-6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={styles.breadcrumbCurrent}>Supplier Questionnaire</span>
                    </div>

                    {/* Page Title Row */}
                    <div className={styles.titleRow}>
                        <div>
                            <h1 className={styles.pageTitle}>Supplier Questionnaire</h1>
                            <p className={styles.pageSub}>
                                Provide structured environmental, product, and sustainability data to help track and improve our shared impact.
                            </p>
                        </div>
                        <div className={styles.searchBox}>
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                                <circle cx="11" cy="11" r="8" stroke="#9ca3af" strokeWidth="2" />
                                <path d="M21 21l-4.35-4.35" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                            <input
                                className={styles.searchInput}
                                placeholder="Search guidance topics..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Section Title */}
                    <div className={styles.sectionTitle}>
                        <div className={styles.sectionBar} />
                        <h2 className={styles.sectionHeading}>
                            {currentSection?.num}: {currentSection?.title}
                        </h2>
                    </div>

                    {/* Section Description Banner (Scope 4 intro etc.) */}
                    {activeSectionDesc && (
                        <div className={styles.sectionBanner}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className={styles.sectionBannerText}>{activeSectionDesc}</p>
                        </div>
                    )}

                    {/* Accordion Questions */}
                    <div className={styles.questionList}>
                        {activeQuestions.length > 0 ? (
                            activeQuestions.map(q =>
                                q.type === 'group' ? (
                                    <div key={q.id} className={styles.groupHeader}>
                                        <span className={styles.groupLabel}>{q.label}</span>
                                        <div className={styles.groupLine} />
                                    </div>
                                ) : (
                                    <AccordionItem key={q.id} q={q} />
                                )
                            )
                        ) : (
                            <div className={styles.emptyState}>
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <p className={styles.emptyTitle}>
                                    {search ? 'No questions match your search.' : 'Content for this section is coming soon.'}
                                </p>
                                <p className={styles.emptyDesc}>
                                    {search ? 'Try a different keyword.' : 'Check back shortly for the full question set.'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Guidance Note */}
                    <div className={styles.guidanceNote}>
                        <div className={styles.guidanceIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" />
                                <path d="M12 16v-4M12 8h.01" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <span className={styles.guidanceLabel}>Guidance Notes</span>
                            <p className={styles.guidanceText}>
                                This guidance page is updated quarterly based on the latest GHG Protocol and IFRS S2 standards. Last updated: Feb 2026.
                            </p>
                        </div>
                    </div>

                </main>
            </div>
        </div>
    )
}
