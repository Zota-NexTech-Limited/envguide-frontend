import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'materials', label: '1. Materials' },
    { id: 'energy', label: '2. Energy' },
    { id: 'transport', label: '3. Transport' },
    { id: 'water', label: '4. Water & Waste' },
    { id: 'units', label: '5. Units' },
    { id: 'standards', label: '6. Standards' },
    { id: 'lifecycle', label: '7. Life Cycle' },
    { id: 'geography', label: '8. Geography & Time' },
    { id: 'org', label: '9. Organization' },
    { id: 'how-to', label: 'How to Add' },
]

export default function ArticleMasterDataSetup() {
    const navigate = useNavigate()
    const [activeSection, setActiveSection] = useState('overview')

    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = SECTIONS.map(s => document.getElementById(s.id))
            const scrollPosition = window.scrollY + 120
            for (let i = sectionElements.length - 1; i >= 0; i--) {
                const el = sectionElements[i]
                if (el && el.offsetTop <= scrollPosition) {
                    setActiveSection(SECTIONS[i].id)
                    break
                }
            }
        }
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToSection = (id) => {
        const el = document.getElementById(id)
        if (el) window.scrollTo({ top: el.offsetTop - 80, behavior: 'smooth' })
    }

    return (
        <div className={styles.page}>
            <div className={styles.topBar}>
                <button className={styles.backBtn} onClick={() => navigate('/manuals-admin')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to Admin Manuals
                </button>
            </div>

            <div className={styles.layout}>
                <aside className={styles.toc}>
                    <p className={styles.tocLabel}>MASTER DATA MODULES</p>
                    <nav className={styles.tocNav}>
                        {SECTIONS.map(s => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className={`${styles.tocLink} ${activeSection === s.id ? styles.tocLinkActive : ''}`}
                                onClick={(e) => { e.preventDefault(); scrollToSection(s.id) }}
                            >
                                {s.label}
                            </a>
                        ))}
                    </nav>
                </aside>

                <article className={styles.article}>
                    <div className={styles.breadcrumb}>
                        <button className={styles.breadLink} onClick={() => navigate('/help-centre')}>Help Center</button>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <button className={styles.breadLink} onClick={() => navigate('/manuals-admin')}>Admin Manuals</button>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span className={styles.breadCurrent}>Master Data Setup</span>
                    </div>

                    <div className={styles.articleHeader}>
                        <span className={styles.articleTag}>ADMIN MANUALS · DOCUMENT #07</span>
                        <h1 className={styles.articleTitle}>What is Master Data Setup in Enviguide?</h1>
                        <p className={styles.articleSubtitle}>
                            The <strong>reference data layer</strong> of Enviguide used to standardize all lookups (materials, energy, transport, water/waste, units, standards, life cycle, geography/time, organization).
                        </p>
                        <p className={styles.body} style={{ marginTop: '15px' }}>
                            It ensures every product and process uses the same controlled lists so calculations and reports are consistent, auditable, and reusable across the system.
                        </p>
                    </div>

                    <hr className={styles.divider} />

                    {/* Overview */}
                    <section id="overview" className={styles.section}>
                        <h2 className={styles.sectionTitle}>The 9 Master Data Setup modules (overview)</h2>
                        <p className={styles.body}>From the Settings page, Master Data Setup currently has these 9 configuration areas:</p>
                        <div className={styles.articleTable}>
                            <table>
                                <thead>
                                    <tr><th>#</th><th>Module name</th><th>Purpose (one line)</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td>1</td><td><strong>Materials Configuration</strong></td><td>Maintain material and <strong>composition</strong> master (e.g., metals, plastics, grades).</td></tr>
                                    <tr><td>2</td><td><strong>Energy Configuration</strong></td><td>Define all energy sources, energy types, fuels, and their attributes.</td></tr>
                                    <tr><td>3</td><td><strong>Transport Configuration</strong></td><td>Define transport modes, vehicles, routes, and related attributes.</td></tr>
                                    <tr><td>4</td><td><strong>Water & Waste Configuration</strong></td><td>Define water sources/uses and waste categories/treatments.</td></tr>
                                    <tr><td>5</td><td><strong>Units Configuration</strong></td><td>Central list of units and unit families used across modules.</td></tr>
                                    <tr><td>6</td><td><strong>Standards & Compliance</strong></td><td>List of standards, certificates, and verification schemes.</td></tr>
                                    <tr><td>7</td><td><strong>Life Cycle & Methodology</strong></td><td>Define life cycle stages, system boundaries, and LCA methodologies.</td></tr>
                                    <tr><td>8</td><td><strong>Geography & Time</strong></td><td>Countries/regions and time periods/time zones.</td></tr>
                                    <tr><td>9</td><td><strong>Organization Configuration</strong></td><td>Master data about suppliers and supplier tiers.</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 1. Materials */}
                    <section id="materials" className={styles.section}>
                        <h2 className={styles.sectionTitle}>1. Materials Configuration</h2>
                        <p className={styles.body}>This defines material composition reference data used for BOM mapping and emission factors.</p>

                        <div className={styles.calloutBlue} style={{ marginBottom: '25px' }}>
                            <p className={styles.calloutTitle}>Sub-groups:</p>
                            <ul className={styles.body} style={{ margin: 0 }}>
                                <li>Composition Metal</li>
                                <li>Composition Metal Type</li>
                            </ul>
                        </div>

                        <h3 className={styles.subSectionTitle}>Composition Metal</h3>
                        <p className={styles.body}>Defines individual elemental materials such as Iron (Fe), Aluminum (Al), Copper (Cu), Nickel (Ni), Li, Ti, Steel, and Industrial Gases (O2, N2, Cl2, F2).</p>

                        <div className={styles.imageContainer}>
                            <img src="/admin-master-setup-materials-metal.png" alt="Composition Metal Grid" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Composition Metal Master List</p>
                        </div>

                        <h3 className={styles.subSectionTitle}>Composition Metal Type</h3>
                        <p className={styles.body}>Defines grouping of materials into categories like Ferrous, Non-Ferrous, Alloy, Rare Earth, and Precious Metal to improve reporting and aggregation.</p>

                        <div className={styles.imageContainer}>
                            <img src="/admin-master-setup-materials-type.png" alt="Composition Metal Type" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Material Grouping Categories</p>
                        </div>
                    </section>

                    {/* 2. Energy */}
                    <section id="energy" className={styles.section}>
                        <h2 className={styles.sectionTitle}>2. Energy Configuration</h2>
                        <p className={styles.body}>Defines energy sources and fuels used in manufacturing and lifecycle stages (Electricity, Solar, Wind, Natural Gas, Diesel, Hydrogen, Coal, Biomass).</p>
                        <ul className={styles.body}>
                            <li>Energy Source / Type / Fuel Type</li>
                            <li>Unit applicability & Emission factor linking</li>
                            <li>Scope categorization (Scope 1 & Scope 2)</li>
                        </ul>

                        <div className={styles.imageGrid}>
                            <img src="/admin-master-setup-energy-sources.png" alt="Energy Sources" className={styles.articleImage} />
                            <img src="/admin-master-setup-energy-details.png" alt="Energy Details" className={styles.articleImage} />
                            <img src="/admin-master-setup-energy-types.png" alt="Energy Types" className={styles.articleImage} />
                            <img src="/admin-master-setup-energy-fuel.png" alt="Fuel Types" className={styles.articleImage} />
                            <img src="/admin-master-setup-energy-units.png" alt="Energy Units" className={styles.articleImage} />
                            <img src="/admin-master-setup-energy-factors.png" alt="Emission Factors" className={styles.articleImage} />
                            <img src="/admin-master-setup-energy-scope.png" alt="Scope Mapping" className={styles.articleImage} />
                        </div>
                    </section>

                    {/* 3. Transport */}
                    <section id="transport" className={styles.section}>
                        <h2 className={styles.sectionTitle}>3. Transport Configuration</h2>
                        <p className={styles.body}>Defines logistics-related carbon parameters (Road, Rail, Air, Sea) and vehicle types (LCVs, Heavy Duty Trucks, Cargo Ships, Freight Trains).</p>

                        <div className={styles.imageGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                            <img src="/admin-master-setup-transport-modes.png" alt="Transport Modes" className={styles.articleImage} />
                            <img src="/admin-master-setup-transport-vehicles.png" alt="Vehicle Types" className={styles.articleImage} />
                            <img src="/admin-master-setup-transport-routes.png" alt="Transport Routes" className={styles.articleImage} />
                        </div>
                    </section>

                    {/* 4. Water & Waste */}
                    <section id="water" className={styles.section}>
                        <h2 className={styles.sectionTitle}>4. Water & Waste Configuration</h2>
                        <p className={styles.body}>Defines environmental impact categories related to Water Sources (Groundwater, Municipal) and Waste Types (Hazardous, Recyclable) with their Treatment Methods (Incineration, Landfill).</p>

                        <div className={styles.imageGrid}>
                            <img src="/admin-master-setup-water-sources.png" alt="Water Sources" className={styles.articleImage} />
                            <img src="/admin-master-setup-waste-types.png" alt="Waste Types" className={styles.articleImage} />
                            <img src="/admin-master-setup-waste-treatment.png" alt="Waste Treatment" className={styles.articleImage} />
                            <img src="/admin-master-setup-waste-parameters.png" alt="Waste Parameters" className={styles.articleImage} />
                            <img src="/admin-master-setup-waste-eol.png" alt="End of Life" className={styles.articleImage} />
                        </div>
                    </section>

                    {/* 5. Units */}
                    <section id="units" className={styles.section}>
                        <h2 className={styles.sectionTitle}>5. Units Configuration</h2>
                        <p className={styles.body}>Defines measurement units (Mass, Energy, Distance, Volume) used platform-wide to prevent calculation distortion.</p>

                        <div className={styles.imageGrid}>
                            <img src="/admin-master-setup-units-energy.png" alt="Energy Units" className={styles.articleImage} />
                            <img src="/admin-master-setup-units-mass.png" alt="Mass Units" className={styles.articleImage} />
                            <img src="/admin-master-setup-units-distance.png" alt="Distance Units" className={styles.articleImage} />
                            <img src="/admin-master-setup-units-volume.png" alt="Volume Units" className={styles.articleImage} />
                            <img src="/admin-master-setup-units-families.png" alt="Unit Families" className={styles.articleImage} />
                            <img src="/admin-master-setup-units-conversion.png" alt="Conversion Grid" className={styles.articleImage} />
                            <img src="/admin-master-setup-units-usage.png" alt="System Usage" className={styles.articleImage} />
                        </div>
                    </section>

                    {/* 6. Standards */}
                    <section id="standards" className={styles.section}>
                        <h2 className={styles.sectionTitle}>6. Standards & Compliance</h2>
                        <p className={styles.body}>Defines reporting frameworks (ISO 14067, GHG Protocol) and verification systems (PAS 2050, Third-Party Verification).</p>

                        <div className={styles.imageGrid} style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                            <img src="/admin-master-setup-standards-iso.png" alt="ISO Standards" className={styles.articleImage} />
                            <img src="/admin-master-setup-standards-ghg.png" alt="GHG Protocol" className={styles.articleImage} />
                            <img src="/admin-master-setup-standards-audit.png" alt="Audit Standards" className={styles.articleImage} />
                            <img src="/admin-master-setup-standards-verification.png" alt="Verification" className={styles.articleImage} />
                        </div>
                    </section>

                    {/* 7. Life Cycle */}
                    <section id="lifecycle" className={styles.section}>
                        <h2 className={styles.sectionTitle}>7. Life Cycle & Methodology</h2>
                        <p className={styles.body}>Defines carbon accounting methodologies including Life Cycle Stages (Cradle-to-Gate/Grave), Boundary Definitions, and Allocation Methods (Mass, Economic, Energy).</p>

                        <div className={styles.imageGrid}>
                            <img src="/admin-master-setup-lifecycle-stages.png" alt="LCA Stages" className={styles.articleImage} />
                            <img src="/admin-master-setup-lifecycle-boundaries.png" alt="Boundaries" className={styles.articleImage} />
                            <img src="/admin-master-setup-lifecycle-allocation.png" alt="Allocation" className={styles.articleImage} />
                            <img src="/admin-master-setup-lifecycle-cradle-gate.png" alt="Cradle to Gate" className={styles.articleImage} />
                            <img src="/admin-master-setup-lifecycle-cradle-grave.png" alt="Cradle to Grave" className={styles.articleImage} />
                            <img src="/admin-master-setup-lifecycle-gate-gate.png" alt="Gate to Gate" className={styles.articleImage} />
                        </div>
                    </section>

                    {/* 8. Geography */}
                    <section id="geography" className={styles.section}>
                        <h2 className={styles.sectionTitle}>8. Geography & Time</h2>
                        <p className={styles.body}>Defines regional and temporal relevance (Country Codes, Regions, Time Zones). Used heavily in DQR (Geographical & Temporal Representativeness).</p>

                        <div className={styles.imageGrid} style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                            <img src="/admin-master-setup-geography-countries.png" alt="Countries" className={styles.articleImage} />
                            <img src="/admin-master-setup-geography-regions.png" alt="Regions" className={styles.articleImage} />
                            <img src="/admin-master-setup-geography-timezones.png" alt="Timezones" className={styles.articleImage} />
                        </div>
                    </section>

                    {/* 9. Organization */}
                    <section id="org" className={styles.section}>
                        <h2 className={styles.sectionTitle}>9. Organization Configuration</h2>
                        <p className={styles.body}>Defines structural responsibility across industries (Automotive, Energy, Electronics) and supplier tiers (OEM, Tier 1, 2, 3).</p>

                        <div className={styles.imageContainer}>
                            <img src="/admin-master-setup-org-tiers.png" alt="Organization Structure" className={styles.articleImage} />
                        </div>
                    </section>

                    {/* How to Add */}
                    <section id="how-to" className={styles.section}>
                        <h2 className={styles.sectionTitle}>How to Add New Master Data</h2>
                        <p className={styles.body}>Across all modules, the system allows:</p>
                        <div className={styles.flowSummaryBox}>
                            <div className={styles.flowSummaryStep}><div className={styles.flowSummaryNum}>1</div><p className={styles.flowSummaryText}><strong>Inline addition:</strong> Use the bottom row entry for quick adds.</p></div>
                            <div className={styles.flowSummaryStep}><div className={styles.flowSummaryNum}>2</div><p className={styles.flowSummaryText}><strong>Bulk Upload:</strong> Use CSV Import for large datasets.</p></div>
                            <div className={styles.flowSummaryStep}><div className={styles.flowSummaryNum}>3</div><p className={styles.flowSummaryText}><strong>Governance:</strong> Export data for control and auditing.</p></div>
                        </div>

                        <div className={styles.calloutBlue} style={{ marginTop: '30px' }}>
                            <div className={styles.calloutTitle}>When adding data, ensure:</div>
                            <ul className={styles.body} style={{ margin: '10px 0 0 0' }}>
                                <li>Unique code structure</li>
                                <li>Naming consistency</li>
                                <li>No duplications</li>
                                <li>Alignment with emission factor structure</li>
                            </ul>
                        </div>
                    </section>

                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/admin-article-data-config')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Previous: Data Configuration
                        </button>
                        <button className={styles.footerNavBtnNext} onClick={() => navigate('/admin-article-ecoinvent')}>
                            Next: Emission Factors
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </article>
            </div>
        </div>
    )
}
