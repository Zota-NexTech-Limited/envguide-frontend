import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './SupplierQuestionnaire.module.css'

const listIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
)

const SECTIONS = [
    { id: 'section1', label: 'Section 1', icon: listIcon },
    { id: 'section2', label: 'Section 2', icon: listIcon },
    { id: 'section3', label: 'Section 3', icon: listIcon },
    { id: 'section4', label: 'Section 4', icon: listIcon },
    { id: 'section5', label: 'Section 5', icon: listIcon },
    { id: 'section6', label: 'Section 6', icon: listIcon },
]

const SECTION_DESCS = {
    section1: 'Foundational information about your organization to ensure correct reporting alignment and traceability.',
    section2: 'Details regarding previous carbon reports and specific production sites to define the scope of analysis.',
    section3: 'Direct emissions from sources owned or controlled by your company (e.g., boilers, furnaces, and vehicles).',
    section4: 'Indirect emissions from the generation of purchased electricity, steam, heating and cooling.',
    section5: 'Emissions linked to your value chain—including raw materials, packaging, logistics, and certifications.',
    section6: 'Positive climate impacts and circular practices that reduce emissions for customers or the environment.',
}

const QUESTIONS = {
    section1: [
        {
            id: 'q01', num: 'QUESTION 01', title: 'Organization Name', defaultOpen: true,
            what: 'Your company’s full legal registered name as it appears in official documentation. Example: "ABC Manufacturing Ltd."',
            why: 'Ensures traceability, legal validation, and correct mapping of emissions data to your reporting entity.',
        },
        {
            id: 'q02', num: 'QUESTION 02', title: 'Core Business Activity', defaultOpen: false,
            what: 'The primary industry or operational sector (e.g., Electronics, Automotive).',
            why: 'Determines applicable emission factors, benchmarking standards, and sector-specific methodologies.',
        },
        {
            id: 'q03', num: 'QUESTION 03', title: 'Designation / Role / Title', defaultOpen: false,
            what: 'Your official job title. Example: "Environmental Manager", "Sustainability Officer"',
            why: 'Confirms accountability and authority of the person submitting the environmental data.',
        },
        {
            id: 'q04', num: 'QUESTION 04', title: 'Email Address', defaultOpen: false,
            what: 'A valid professional contact email for your organization.',
            why: 'Required for secure verification, follow-ups, and official report communication.',
        },
        {
            id: 'q05', num: 'QUESTION 05', title: 'Number of Employees', defaultOpen: false,
            what: 'Your total workforce size range (e.g., 51-200).',
            why: 'Indicates organizational scale and helps contextualize the operational footprint.',
        },
        {
            id: 'q06', num: 'QUESTION 06', title: 'Annual Revenue', defaultOpen: false,
            what: 'Your organization’s annual revenue range for the reporting year.',
            why: 'Helps assess the economic intensity of emissions (emissions per unit of revenue).',
        },
        {
            id: 'q07', num: 'QUESTION 07', title: 'Reporting Period', defaultOpen: false,
            what: 'Your fiscal year or reporting timeframe. Example: "January–December".',
            why: 'Ensures emissions data aligns with your financial and operational reporting cycles.',
        },
        {
            id: 'q08', num: 'QUESTION 08', title: 'Scope 1, 2, 3 Emissions Data Availability', defaultOpen: false,
            what: 'Whether organizational-level GHG data already exists. (If YES → Q9 appears).',
            why: 'Determines whether we can use existing verified emissions data or need to perform fresh calculations.',
        },
        {
            id: 'q09', num: 'QUESTION 09', title: 'Provide Emission Data', defaultOpen: false,
            what: 'Quantified Scope 1, 2, 3 emissions per manufacturing location in MT CO2e.',
            why: 'Allows for baseline comparison and prevents manual recalculation of already verified emissions.',
        },
    ],

    section2: [
        {
            id: 'q10', num: 'QUESTION 10', title: 'Existing Product Carbon Footprint (PCF)?', defaultOpen: true,
            what: 'Whether a PCF study was completed for the product(s) in the last 12 months. (If YES → Q11 & Q12 appear).',
            why: 'Determines if product-level emissions are pre-calculated or require fresh analysis in Enviguide.',
        },
        {
            id: 'q11', num: 'QUESTION 11', title: 'Methodology Used', defaultOpen: false,
            what: 'The specific standard followed (e.g., ISO 14067, GHG Protocol, PACT).',
            why: 'Ensures that previous calculations meet internationally recognized environmental standards.',
        },
        {
            id: 'q12', num: 'QUESTION 12', title: 'Upload PCF Report', defaultOpen: false,
            what: 'Documentary proof (PDF/Excel) showing the results and boundaries of your PCF study.',
            why: 'Enables audit verification, data validation, and methodological transparency.',
        },
        {
            id: 'q13', num: 'QUESTION 13', title: 'Production Site', defaultOpen: false,
            what: 'The manufacturing or assembly locations for each product. Multiple rows can be added.',
            why: 'Emissions vary by geography due to electricity grid intensity and local logistics factors.',
        },
        {
            id: 'q14', num: 'QUESTION 14', title: 'Environmental Impact Method Required', defaultOpen: false,
            what: 'Specific impact categories you wish to assess (e.g., Carbon, Water, Ecotoxicity).',
            why: 'Defines the scope of environmental analysis beyond carbon footprint alone.',
        },
        {
            id: 'q15', num: 'QUESTION 15', title: 'Products Manufactured', defaultOpen: false,
            what: 'Detailed list including Product Code, Name, Weight, and Production Volume.',
            why: 'Essential data required to allocate emissions per unit and perform full lifecycle analysis (LCA).',
        },
        {
            id: 'q151', num: 'QUESTION 15.1', title: 'Co-products Generated?', defaultOpen: false,
            what: 'Whether economically valuable by-products are generated during production. (If YES → Q15.2 appears).',
            why: 'Co-products require special emission allocation between the main product and secondary outputs.',
        },
        {
            id: 'q152', num: 'QUESTION 15.2', title: 'Co-product Details', defaultOpen: false,
            what: 'The quantity and economic value of the co-products generated.',
            why: 'Enables proper emission sharing ("Economic Allocation") under international LCA rules.',
        },
    ],

    section3: [
        {
            id: 'q16', num: 'QUESTION 16', title: 'On-site Fuel Use', defaultOpen: true,
            what: 'Type and quantity of fuels (diesel, natural gas, etc.) burned internally for heat or power.',
            why: 'Direct stationary combustion is a primary driver of Scope 1 emissions.',
        },
        {
            id: 'q17', num: 'QUESTION 17', title: 'Company Vehicle Fuel Use', defaultOpen: false,
            what: 'Annual fuel consumption (Petrol, Diesel, CNG) of company-owned/controlled vehicles.',
            why: 'Captures direct mobile combustion emissions from your fleet operations.',
        },
        {
            id: 'q18', num: 'QUESTION 18', title: 'Refrigerant Top-ups?', defaultOpen: false,
            what: 'Whether refrigerants were refilled for AC or industrial systems. (If YES → Q19 appears).',
            why: 'Refrigerants have extremely high global warming potential; even small leaks count significantly.',
        },
        {
            id: 'q19', num: 'QUESTION 19', title: 'Refrigerant Types and Quantities', defaultOpen: false,
            what: 'The specific gas types (e.g., R-134a) and quantified refill weights.',
            why: 'Allows for accurate calculation of fugitive emissions based on specific gas GWP values.',
        },
        {
            id: 'q20', num: 'QUESTION 20', title: 'Process Emissions?', defaultOpen: false,
            what: 'Whether industrial processes emit gases beyond energy use. (If YES → Q21 appears).',
            why: 'Certain chemical or material processes generate emissions independently of fuel combustion.',
        },
        {
            id: 'q21', num: 'QUESTION 21', title: 'Gas Sources and Quantities', defaultOpen: false,
            what: 'Source description (e.g., Kiln Line) and type of gases emitted.',
            why: 'Essential for complete and accurate direct emissions (Scope 1) accounting.',
        },
    ],

    section4: [
        {
            id: 'q22', num: 'QUESTION 22', title: 'Purchased Energy Details', defaultOpen: true,
            what: 'Total purchased electricity, steam, heating, or cooling for the reporting year.',
            why: 'This is the primary source of Scope 2 indirect emissions from external energy providers.',
        },
        {
            id: 'q23', num: 'QUESTION 23', title: 'Renewable Energy Certificates?', defaultOpen: false,
            what: 'Whether renewable energy certificates (RECs, GOs) were acquired. (If YES → Q24 appears).',
            why: 'Affects market-based emission factor calculations for your electricity usage.',
        },
        {
            id: 'q24', num: 'QUESTION 24', title: 'Certificate Details', defaultOpen: false,
            what: 'Specific quantity and energy period covered by the renewable certificates.',
            why: 'Enables accurate downward adjustment of your organization’s electricity emission footprint.',
        },
        {
            id: 'q25', num: 'QUESTION 25', title: 'Product-level Energy Allocation Methodology?', defaultOpen: false,
            what: 'Whether you can trace factory-level energy down to specific products. (If YES → Q26 appears).',
            why: 'Enables precise per-product carbon footprint calculation instead of general facility averages.',
        },
        {
            id: 'q26', num: 'QUESTION 26', title: 'Upload Energy Allocation Methodology', defaultOpen: false,
            what: 'Document explaining how total energy is distributed across different product lines.',
            why: 'Transparency in methodology ensures audit defensibility and data reliability.',
        },
        {
            id: 'q27', num: 'QUESTION 27', title: 'Energy Intensity per Product', defaultOpen: false,
            what: 'Energy consumed (kWh/MJ) per unit of product produced.',
            why: 'Directly converts facility-level energy into product-level carbon metrics.',
        },
        {
            id: 'q28', num: 'QUESTION 28', title: 'Process-Specific Energy Usage', defaultOpen: false,
            what: 'Energy consumed by individual stages (e.g., molding, curing) of the manufacturing process.',
            why: 'Improves allocation accuracy and identifies high-impact areas for optimization.',
        },
        {
            id: 'q29', num: 'QUESTION 29', title: 'Use of Abatement Systems?', defaultOpen: false,
            what: 'Whether emission control systems (scrubbers, oxidizers) are used. (If YES → Q30 appears).',
            why: 'Abatement systems reduce environmental impact but typically consume significant energy.',
        },
        {
            id: 'q30', num: 'QUESTION 30', title: 'Abatement System Energy Consumption', defaultOpen: false,
            what: 'Quantified electricity/fuel consumed by emission reduction hardware.',
            why: 'Ensures complete energy accounting for all production-related infrastructure.',
        },
        {
            id: 'q31', num: 'QUESTION 31', title: 'Water Consumption and Treatment', defaultOpen: false,
            what: 'Annual water usage and energy-intensive treatment details.',
            why: 'Water processing and treatment can drive significant indirect energy emissions.',
        },
        {
            id: 'q32', num: 'QUESTION 32', title: 'Quality Control Equipment Used', defaultOpen: false,
            what: 'Types of testing and inspection hardware deployed (e.g., X-ray, testers).',
            why: 'Captures functional energy demand from quality verification activities.',
        },
        {
            id: 'q33', num: 'QUESTION 33', title: 'Electricity Used for Quality Control', defaultOpen: false,
            what: 'The specific energy consumption allocated to QC activities.',
            why: 'Separates testing-related indirect emissions from main production line data.',
        },
        {
            id: 'q34', num: 'QUESTION 34', title: 'Utilities Used in Quality Control', defaultOpen: false,
            what: 'Use of compressed air, nitrogen, or other industrial gas systems.',
            why: 'Utility systems require dedicated, often energy-intensive support infrastructure.',
        },
        {
            id: 'q341', num: 'QUESTION 34.1', title: 'Pressure or Flow-Based Utilities', defaultOpen: false,
            what: 'Details on vacuum, pressure leak rigs, or flow benches used in QC.',
            why: 'These specialized systems add incremental demand to the facility footprint.',
        },
        {
            id: 'q35', num: 'QUESTION 35', title: 'Consumables Used in Quality Control', defaultOpen: false,
            what: 'Materials (chemicals, test boards, probes) consumed during inspection.',
            why: 'Consumables contribute to both material emissions and waste disposal impacts.',
        },
        {
            id: 'q36', num: 'QUESTION 36', title: 'Destructive Testing?', defaultOpen: false,
            what: 'Whether products are destroyed during quality testing. (If YES → Q37 appears).',
            why: 'Destroyed samples increase the total material-related emissions per finished unit.',
        },
        {
            id: 'q37', num: 'QUESTION 37', title: 'Weight of Samples Destroyed', defaultOpen: false,
            what: 'The quantified weight and type of material lost during testing.',
            why: 'Required for accurate material waste accounting and LCA allocation.',
        },
        {
            id: 'q38', num: 'QUESTION 38', title: 'Defect/Rejection Rate', defaultOpen: false,
            what: 'The percentage of units that fail QC inspections.',
            why: 'Higher rejection rates increase total resource intensity and waste per unit of output.',
        },
        {
            id: 'q39', num: 'QUESTION 39', title: 'Rework Rate', defaultOpen: false,
            what: 'Percentage of products requiring reprocessing to meet specs.',
            why: 'Rework adds extra energy and resource demand beyond standard manufacturing.',
        },
        {
            id: 'q40', num: 'QUESTION 40', title: 'Quality Control Waste', defaultOpen: false,
            what: 'Types and volumes of waste generated during testing activities.',
            why: 'End-of-life disposal of test waste contributes to shared Scope 3 impacts.',
        },
        {
            id: 'q41', num: 'QUESTION 41', title: 'IT Systems Used', defaultOpen: false,
            what: 'Digital systems (MES, ERP, PLCs) supporting production control.',
            why: 'Digital infrastructure has a measurable operational electricity footprint.',
        },
        {
            id: 'q42', num: 'QUESTION 42', title: 'Energy Consumption of IT Hardware?', defaultOpen: false,
            what: 'Whether IT/Hardware energy usage is tracked. (If YES → Q44 appears).',
            why: 'Server and terminal electricity contributes to total indirect (Scope 2) energy use.',
        },
        {
            id: 'q43', num: 'QUESTION 43', title: 'Is IT Energy Included in Purchased Energy?', defaultOpen: false,
            what: 'Whether IT electricity is already part of the Q22 reporting total.',
            why: 'Cross-checks data consistency and prevents duplicative energy reporting.',
        },
        {
            id: 'q44', num: 'QUESTION 44', title: 'IT Energy Consumption', defaultOpen: false,
            what: 'Quantified electricity usage for IT and data center infrastructure.',
            why: 'Essential for a complete and granular Scope 2 emissions inventory.',
        },
        {
            id: 'q45', num: 'QUESTION 45', title: 'Use of Cloud Systems?', defaultOpen: false,
            what: 'Whether cloud platforms (SaaS/IaaS) are used in production. (If YES → Q46 appears).',
            why: 'Cloud computing relies on external data centers with indirect carbon impacts.',
        },
        {
            id: 'q46', num: 'QUESTION 46', title: 'Cloud Provider and Usage', defaultOpen: false,
            what: 'Provider name (e.g., AWS, Azure) and estimated compute utilization.',
            why: 'Enables modeled estimation of your organization’s indirect digital carbon footprint.',
        },
        {
            id: 'q47', num: 'QUESTION 47', title: 'Monitoring Sensors Used', defaultOpen: false,
            what: 'Deployment of IoT or industrial sensors for facility tracking.',
            why: 'Sensor nets carry both embodied material emissions and small energy loads.',
        },
        {
            id: 'q48', num: 'QUESTION 48', title: 'Sensor Replacement Rate', defaultOpen: false,
            what: 'Annual replacement frequency of sensor hardware or batteries.',
            why: 'Captures the recurring lifecycle cost and electronic waste impact.',
        },
        {
            id: 'q49', num: 'QUESTION 49', title: 'Cooling Systems for Server Rooms?', defaultOpen: false,
            what: 'Whether dedicated CRAC or AC units are used. (If YES → Q50 appears).',
            why: 'Server cooling is often one of the largest single points of IT-related electricity demand.',
        },
        {
            id: 'q50', num: 'QUESTION 50', title: 'Is Cooling Energy Included in Purchased Energy?', defaultOpen: false,
            what: 'Whether cooling electricity is accounted for in your main facility meter (Q22).',
            why: 'Ensures no omissions or data overlaps in energy-intensive utilities.',
        },
        {
            id: 'q51', num: 'QUESTION 51', title: 'Cooling Energy Consumption', defaultOpen: false,
            what: 'Quantified electricity used specifically for IT/server climate control.',
            why: 'Crucial for refined Scope 2 reporting and facility efficiency benchmarking.',
        },
    ],

    section5: [
        {
            id: 'q52', num: 'QUESTION 52', title: 'Raw Material Composition', defaultOpen: true,
            what: 'The detailed material types and percentage breakdown of your product. (Need assistance? → See Q52.1).',
            why: 'Raw materials often represent the single largest share of a product’s lifecycle emissions.',
        },
        {
            id: 'q521', num: 'QUESTION 52.1', title: 'Support for Material Identification', defaultOpen: false,
            what: 'Whether you require professional assistance in determining your accurate material breakdown.',
            why: 'Ensures data accuracy if internal technical specifications are unavailable or complex.',
        },
        {
            id: 'q53', num: 'QUESTION 53', title: 'Grade of Metal Used', defaultOpen: false,
            what: 'The specific industrial grades of metals used (e.g., Al 6061, SS304).',
            why: 'Emissions vary significantly based on the specific alloy and its primary processing intensity.',
        },
        {
            id: 'q54', num: 'QUESTION 54', title: 'Upload Material Documentation', defaultOpen: false,
            what: 'Technical or safety data sheets (TDS/SDS) confirming the product’s material makeup.',
            why: 'Provides formal evidence required to validate material sustainability and emission claims.',
        },
        {
            id: 'q55', num: 'QUESTION 55', title: 'Recycled Materials Used?', defaultOpen: false,
            what: 'Whether recycled inputs are part of your raw material mix. (If YES → Q56 appears).',
            why: 'Using recycled content significantly lowers the embodied carbon footprint of your products.',
        },
        {
            id: 'q56', num: 'QUESTION 56', title: 'Recycled Material Percentage', defaultOpen: false,
            what: 'The percentage of total product weight made from recycled feedstock.',
            why: 'Quantifies the net carbon reduction achieved by diverting waste from the primary supply chain.',
        },
        {
            id: 'q57', num: 'QUESTION 57', title: 'Know Pre/Post-Consumer Breakdown?', defaultOpen: false,
            what: 'Whether you can distinguish the origin of your recycled content. (If YES → Q58 appears).',
            why: 'Required for refined lifecycle assessment reporting under international environmental standards.',
        },
        {
            id: 'q58', num: 'QUESTION 58', title: 'Pre/Post-Consumer Percentages', defaultOpen: false,
            what: 'Detailed split between industrial scrap (Pre) and end-of-life recycled material (Post).',
            why: 'Allows for refined precision in Lifecycle Assessment (LCA) according to GHG Protocol rules.',
        },
        {
            id: 'q59', num: 'QUESTION 59', title: 'PIR and PCR Materials', defaultOpen: false,
            what: 'Quantified levels of Post-Industrial (PIR) and Post-Consumer (PCR) recycled content.',
            why: 'Directly validates circular economy performance and resource efficiency strategies.',
        },
        {
            id: 'q60', num: 'QUESTION 60', title: 'Packaging Materials', defaultOpen: false,
            what: 'The types of materials (Cardboard, Plastic, Wood) used to package/ship your product.',
            why: 'Packaging contributes to material-related and end-of-life disposal emissions.',
        },
        {
            id: 'q61', num: 'QUESTION 61', title: 'Packaging Weight', defaultOpen: false,
            what: 'The net weight of packaging material per single unit of finished product.',
            why: 'Required to calculate the "Cradle-to-Gate" carbon footprint of the packaged unit.',
        },
        {
            id: 'q62', num: 'QUESTION 62', title: 'Packaging Size', defaultOpen: false,
            what: 'The physical dimensions (Length x Width x Height) of the product’s packaging.',
            why: 'Packaging volume directly affects transport efficiency and logistics CO2 intensity.',
        },
        {
            id: 'q63', num: 'QUESTION 63', title: 'Recycled Packaging Used?', defaultOpen: false,
            what: 'Whether your packaging contains recycled materials. (If YES → Q64 appears).',
            why: 'Reduces the embodied carbon footprint of the product’s protective layers.',
        },
        {
            id: 'q64', num: 'QUESTION 64', title: 'Recycled Packaging Percentage', defaultOpen: false,
            what: 'The percentage of recycled content within your packaging components.',
            why: 'Quantifies carbon savings and demonstrates proactive circular packaging choices.',
        },
        {
            id: 'q65', num: 'QUESTION 65', title: 'Electricity Used for Packaging?', defaultOpen: false,
            what: 'Whether separate electricity is used for final packaging lines. (If YES → Q66 appears).',
            why: 'Ensures that all operational energy is captured, including final assembly and boxing.',
        },
        {
            id: 'q66', num: 'QUESTION 66', title: 'Is Packaging Energy Included in Scope 2?', defaultOpen: false,
            what: 'Whether this energy is already reported in your facility’s total purchased energy (Q22).',
            why: 'Cross-checks boundaries to avoid double-counting energy loads across reporting categories.',
        },
        {
            id: 'q67', num: 'QUESTION 67', title: 'Packaging Energy Consumption', defaultOpen: false,
            what: 'Quantified electricity used specifically for the packaging or shipping operation.',
            why: 'Completes the energy inventory and identifies processing intensity for fulfillment.',
        },
        {
            id: 'q68', num: 'QUESTION 68', title: 'Production and Packaging Waste', defaultOpen: false,
            what: 'Total weight and types of waste generated during manufacturing and packing.',
            why: 'The treatment and disposal of production waste generate Scope 3 indirect emissions.',
        },
        {
            id: 'q69', num: 'QUESTION 69', title: '% Waste Recycled', defaultOpen: false,
            what: 'The percentage of production waste diverted from landfills to recycling facilities.',
            why: 'Significantly lowers the negative carbon impact of your organization’s waste stream.',
        },
        {
            id: 'q70', num: 'QUESTION 70', title: 'By-products Generated?', defaultOpen: false,
            what: 'Whether any economically valuable secondary outputs are produced. (If YES → Q71 appears).',
            why: 'Affects how emissions are allocated between the primary product and secondary side-streams.',
        },
        {
            id: 'q71', num: 'QUESTION 71', title: 'By-product Details', defaultOpen: false,
            what: 'The quantity and economic valuation of the secondary by-products.',
            why: 'Enables compliant carbon "sharing" calculations based on economic value (LCA allocation).',
        },
        {
            id: 'q72', num: 'QUESTION 72', title: 'Track Raw Material Transport Emissions?', defaultOpen: false,
            what: 'Whether transport emissions from your suppliers are monitored. (If YES → Q73 appears).',
            why: 'Upstream logistics can represent a major, often hidden, part of a product’s footprint.',
        },
        {
            id: 'q73', num: 'QUESTION 73', title: 'Transport CO₂ Estimates', defaultOpen: false,
            what: 'Quantified CO2e emissions from inbound logistics and raw material shipments.',
            why: 'Provides essential data for the "Upstream Transportation" Scope 3 reporting category.',
        },
        {
            id: 'q741', num: 'QUESTION 74.1', title: 'Support for Transport Calculations', defaultOpen: false,
            what: 'Whether you require assistance in estimating your logistics-related emissions.',
            why: 'Ensures accuracy if your internal logistics data is incomplete or unverified.',
        },
        {
            id: 'q75', num: 'QUESTION 75', title: 'Destination Plant', defaultOpen: false,
            what: 'The final destination location for the components or products.',
            why: 'Enables calculation of "Downstream" transport emissions for full cradle-to-gate reporting.',
        },
        {
            id: 'q76', num: 'QUESTION 76', title: 'ISO 14001/50001 Certified?', defaultOpen: false,
            what: 'Whether your manufacturing site holds formal environmental or energy management certificates.',
            why: 'Indicates a structured approach to environmental management and higher data reliability.',
        },
        {
            id: 'q77', num: 'QUESTION 77', title: 'Follow Carbon Standards?', defaultOpen: false,
            what: 'Whether you follow standards like GHG Protocol or PACT for carbon accounting.',
            why: 'Ensures that your reported data meets global methodological and transparency requirements.',
        },
        {
            id: 'q78', num: 'QUESTION 78', title: 'Report to sustainability frameworks (CDP, SBTi, etc.)?', defaultOpen: false,
            what: 'Whether you disclose data to frameworks like CDP or Science Based Targets.',
            why: 'Demonstrates high corporate transparency and commitment to external climate reporting.',
        },
        {
            id: 'q79', num: 'QUESTION 79', title: 'Carbon Reduction Measures', defaultOpen: false,
            what: 'Specific actions taken to lower your operational energy or material emissions.',
            why: 'Highlights active decarbonization strategy beyond simple data disclosure.',
        },
        {
            id: 'q80', num: 'QUESTION 80', title: 'Renewable or Recycling Initiatives', defaultOpen: false,
            what: 'Programs specifically promoting clean energy transition or circular material loops.',
            why: 'Demonstrates sustainability leadership and proactive ecological impact reduction.',
        },
        {
            id: 'q81', num: 'QUESTION 81', title: 'Sustainability Strategy', defaultOpen: false,
            what: 'Your organization’s overall environmental goals, targets, and sustainability roadmap.',
            why: 'Aligns granular data entry with your broader organizational climate objectives.',
        },
    ],

    section6: [
        {
            id: 'q82', num: 'QUESTION 82', title: 'Product Avoided Emissions', defaultOpen: true,
            what: 'Whether your product reduces customer emissions compared to conventional alternatives.',
            why: 'Captures the positive "Scope 4" impact your products enable for your clients.',
        },
        {
            id: 'q83', num: 'QUESTION 83', title: 'Circular Economy Practices', defaultOpen: false,
            what: 'Programs for product refurbishment, reuse, repair, or closed-loop recycling.',
            why: 'Extends product lifespan and lowers the overall material intensity of the economy.',
        },
        {
            id: 'q84', num: 'QUESTION 84', title: 'Renewable or Offset Projects', defaultOpen: false,
            what: 'Direct investment in carbon offset projects or renewable energy generation.',
            why: 'Reflects organizational climate leadership beyond mandatory reporting boundaries.',
        },
    ],
}

function AccordionItem({ q }) {
    const [open, setOpen] = useState(q.defaultOpen)

    return (
        <div className={`${styles.accordion} ${open ? styles.accordionOpen : ''}`}>
            <button className={styles.accordionHeader} onClick={() => setOpen(o => !o)}>
                <div className={styles.accordionLeft}>
                    <span className={styles.qNum}>{q.num}</span>
                    <span className={styles.qTitle}>{q.title}</span>
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
                            <p className={styles.colText}>{q.what}</p>
                        </div>
                        <div className={styles.accordionDivider} />
                        <div className={styles.accordionCol}>
                            <p className={styles.colLabel}>WHY THIS MATTERS</p>
                            <p className={styles.colText}>{q.why}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function ManufacturerQuestionnaire() {
    const navigate = useNavigate()
    const [activeSection, setActiveSection] = useState('section1')
    const [search, setSearch] = useState('')

    const activeSectionLabel = SECTIONS.find(s => s.id === activeSection)?.label ?? 'Section 1'
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
                                {s.label}
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
                        <span className={styles.breadcrumbCurrent}>Manufacture Own Emission Questionnaire Guidance</span>
                    </div>

                    {/* Page Title Row */}
                    <div className={styles.titleRow}>
                        <div>
                            <h1 className={styles.pageTitle}>Manufacture Own Emission Questionnaire Guidance</h1>
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
                        <h2 className={styles.sectionHeading}>{activeSectionLabel}</h2>
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

                    {/* Section 3: Completing & Submitting */}
                    <div className={styles.sectionTitle} style={{ marginTop: '48px' }}>
                        <div className={styles.sectionBar} />
                        <h2 className={styles.sectionHeading}>Completing and Submitting the Questionnaire</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px', marginBottom: '32px' }}>
                        {[
                            { title: 'Previous', desc: 'Go back to review or edit the previous section.', icon: 'M15 19l-7-7 7-7', color: '#6b7280' },
                            { title: 'Save & Exit', desc: 'Saves your progress so you can finish later.', icon: 'M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4', color: '#3b82f6' },
                            { title: 'Next Section', desc: 'Advance to the next part. Shortcut: Ctrl + Enter', icon: 'M9 5l7 7-7 7', color: '#16a34a' }
                        ].map(ctrl => (
                            <div key={ctrl.title} style={{
                                background: '#fff',
                                padding: '24px',
                                borderRadius: '20px',
                                border: '1px solid #e5e7eb',
                                display: 'flex',
                                alignItems: 'flex-start',
                                gap: '16px',
                                transition: 'all 0.2s ease'
                            }}>
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '12px',
                                    background: `${ctrl.color}15`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={ctrl.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d={ctrl.icon} />
                                    </svg>
                                </div>
                                <div>
                                    <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>{ctrl.title}</h4>
                                    <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>{ctrl.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{
                        background: 'linear-gradient(to right, #f8fafc, #fff)',
                        borderRadius: '20px',
                        padding: '24px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '20px',
                        marginBottom: '48px'
                    }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '50%',
                            background: '#fff',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '20px',
                            flexShrink: 0
                        }}>📈</div>
                        <div>
                            <h4 style={{ fontSize: '15px', fontWeight: '800', color: '#111827', marginBottom: '4px' }}>Progress Real-time Tracking</h4>
                            <p style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
                                The sidebar displays your exact progress—tracked by completion percentage, answer count, and validated section checkmarks.
                            </p>
                        </div>
                    </div>

                    {/* Section 4: Tips for Success */}
                    <div className={styles.sectionTitle}>
                        <div className={styles.sectionBar} />
                        <h2 className={styles.sectionHeading}>Tips for Success</h2>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '24px', marginTop: '20px', marginBottom: '64px' }}>
                        {/* Checklist Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 100%)',
                            border: '1px solid #dcfce7',
                            borderRadius: '24px',
                            padding: '32px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <span style={{ fontSize: '24px' }}>🎯</span>
                                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#166534', letterSpacing: '-0.01em' }}>Success Checklist</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    'Gather material composition data first',
                                    'Collect fuel and electricity bills',
                                    'Have QC reject/rework rates ready',
                                    'Consult subject matter experts'
                                ].map(item => (
                                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M20 6L9 17l-5-5" />
                                            </svg>
                                        </div>
                                        <span style={{ fontSize: '14.5px', color: '#166534', fontWeight: '500' }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pitfalls Card */}
                        <div style={{
                            background: 'linear-gradient(135deg, #fef2f2 0%, #ffffff 100%)',
                            border: '1px solid #fee2e2',
                            borderRadius: '24px',
                            padding: '32px'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                                <span style={{ fontSize: '24px' }}>⚠️</span>
                                <h3 style={{ fontSize: '18px', fontWeight: '900', color: '#991b1b', letterSpacing: '-0.01em' }}>Common Pitfalls</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {[
                                    'Skipping optional but impact-heavy data',
                                    'Using inconsistent units of measure',
                                    'Leaving Scope 3 entirely blank',
                                    'Not reviewing before final submission'
                                ].map(item => (
                                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M18 6L6 18M6 6l12 12" />
                                            </svg>
                                        </div>
                                        <span style={{ fontSize: '14.5px', color: '#991b1b', fontWeight: '500' }}>{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Footer Disclosure */}
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
                                This manufacturer guidance is optimized for the GHG Protocol and IFRS S2 standards. Last updated: Feb 2026.
                            </p>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
