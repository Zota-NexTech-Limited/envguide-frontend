import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'common', label: 'Common Columns' },
    { id: 'materials', label: '1. Materials' },
    { id: 'electricity', label: '2. Electricity' },
    { id: 'fuel', label: '3. Fuel' },
    { id: 'packaging', label: '4. Packaging' },
    { id: 'vehicles', label: '5. Vehicles' },
    { id: 'waste', label: '6. Waste' },
]

export default function ArticleEcoInventFactors() {
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
                    <p className={styles.tocLabel}>FACTOR CONFIGURATION</p>
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
                        <span className={styles.breadCurrent}>EcoInvent Emission Factors</span>
                    </div>

                    <div className={styles.articleHeader}>
                        <span className={styles.articleTag} style={{ background: '#fef3c7', color: '#92400e' }}>TECHNICAL MANUAL · DOCUMENT #08</span>
                        <h1 className={styles.articleTitle}>What is EcoInvent Emission Factor in Enviguide?</h1>
                        <p className={styles.articleSubtitle}>
                            Learn how Enviguide converts activity data into emissions using the world-class EcoInvent life cycle database.
                        </p>
                    </div>

                    {/* Overview */}
                    <section id="overview" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Overview</h2>
                        <p className={styles.body}>
                            An EcoInvent emission factor in Enviguide tells you how much greenhouse gas (typically in <strong>kg CO₂e</strong>) is emitted per unit of a specific activity or material.
                        </p>
                        <p className={styles.body}>
                            Each of the six sections in your settings (Materials, Electricity, Fuel, Packaging, Vehicles, Waste) lets you configure those factors so the system can convert activity data (like kg of steel or kWh of power) into emissions for product carbon footprints and reports.
                        </p>
                    </section>

                    {/* Common Columns */}
                    <section id="common" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Common columns across all factors</h2>
                        <p className={styles.body}>Most EcoInvent factor tables in Enviguide share a core set of columns to ensure transparency and traceability.</p>

                        <div className={styles.articleTable}>
                            <table>
                                <thead>
                                    <tr><th>Column</th><th>Purpose & Meaning</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td><strong>Category / Type</strong></td><td>High-level group (e.g., “Steel”, “Grid electricity”). Helps in finding the right factor quickly.</td></tr>
                                    <tr><td><strong>Name / Description</strong></td><td>Plain-language label (e.g., “Steel, low-alloy, at plant, global”). Helps distinguish similar options.</td></tr>
                                    <tr><td><strong>Unit</strong></td><td>The measurement basis (kg, m³, kWh, ton-km). Must match the real-world tracking data.</td></tr>
                                    <tr><td><strong>Emission factor</strong></td><td>The numeric value (kg CO₂e per unit) that converts activity into climate impact.</td></tr>
                                    <tr><td><strong>Geography / Region</strong></td><td>The country or region reflective of the production mix (e.g., IN, EU, GLO).</td></tr>
                                    <tr><td><strong>Source / Version</strong></td><td>Reference to the specific version (e.g., “EcoInvent 3.11”).</td></tr>
                                    <tr><td><strong>Year / Validity</strong></td><td>The data year (e.g., based on 2020 energy mix). Crucial for auditing and targets.</td></tr>
                                    <tr><td><strong>Scope / Boundary</strong></td><td>Lifecycle stage (e.g., Cradle-to-Gate). Defines what parts of the lifecycle are included.</td></tr>
                                    <tr><td><strong>Data Quality</strong></td><td>Descriptive label of reliability based on EcoInvent metadata.</td></tr>
                                    <tr><td><strong>Active / Status</strong></td><td>Toggle to prevent selection of outdated or incorrect factors.</td></tr>
                                    <tr><td><strong>Notes</strong></td><td>Free-text for internal rules (e.g., “Use only for EU suppliers”).</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* 1. Materials */}
                    <section id="materials" className={styles.section}>
                        <h2 className={styles.sectionTitle}>1. Materials Emission Factors</h2>
                        <p className={styles.body}>Translate quantities of raw or processed materials (metals, plastics, chemicals) into embedded emissions.</p>
                        <ul className={styles.body}>
                            <li><strong>Production route:</strong> Captures if it is primary, recycled, or specific chemical processes.</li>
                            <li><strong>Recycled content:</strong> Optional column for modeling design changes like switching to recycled plastics.</li>
                        </ul>

                        <div className={styles.imageContainer}>
                            <img src="/admin-ecoinvent-materials.png" alt="Materials Emission Factors" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Material Factor Master Settings</p>
                        </div>

                        <div className={styles.calloutBlue} style={{ marginTop: '20px' }}>
                            <strong>Why it is useful:</strong> Links your BOM quantities directly to CO₂e so you can see which materials dominate product footprint and perform scenario analysis.
                        </div>
                    </section>

                    {/* 2. Electricity */}
                    <section id="electricity" className={styles.section}>
                        <h2 className={styles.sectionTitle}>2. Electricity Emission Factors</h2>
                        <p className={styles.body}>Convert energy consumption (kWh) into emissions using grid or specific source data.</p>
                        <ul className={styles.body}>
                            <li><strong>Voltage level:</strong> Low, medium, or high voltage processes from EcoInvent.</li>
                            <li><strong>Scope split:</strong> Distinguishes Scope 2 (generation) and Scope 3 (upstream/WTT) impacts.</li>
                        </ul>

                        <div className={styles.imageContainer}>
                            <img src="/admin-ecoinvent-electricity.png" alt="Electricity Emission Factors" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Electricity Grid & Source Management</p>
                        </div>
                    </section>

                    {/* 3. Fuel */}
                    <section id="fuel" className={styles.section}>
                        <h2 className={styles.sectionTitle}>3. Fuel Emission Factors</h2>
                        <p className={styles.body}>Covers direct fuels (diesel, natural gas, LPG, biomass) often used for stationary combustion or process heat.</p>
                        <ul className={styles.body}>
                            <li><strong>Combustion technology:</strong> Indicates boiler, furnace, or turbine efficiency profiles.</li>
                            <li><strong>Heating value:</strong> Energy content (MJ per unit) for energy-based calculations.</li>
                        </ul>

                        <div className={styles.imageContainer}>
                            <img src="/admin-ecoinvent-fuel.png" alt="Fuel Emission Factors" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Fuel Selection & Combustion Parameters</p>
                        </div>
                    </section>

                    {/* 4. Packaging */}
                    <section id="packaging" className={styles.section}>
                        <h2 className={styles.sectionTitle}>4. Packaging Emission Factors</h2>
                        <p className={styles.body}>Embedded emissions for packaging components like carton boxes, plastic films, and PET bottles.</p>
                        <ul className={styles.body}>
                            <li><strong>Material composition:</strong> Links discrete items to underlying EcoInvent material processes.</li>
                            <li><strong>End-of-life assumption:</strong> Assumed market-specific recycling or disposal mixes.</li>
                        </ul>

                        <div className={styles.imageGrid} style={{ gridTemplateColumns: '1fr 1fr' }}>
                            <img src="/admin-ecoinvent-packaging-1.png" alt="Packaging Setup 1" className={styles.articleImage} />
                            <img src="/admin-ecoinvent-packaging-2.png" alt="Packaging Setup 2" className={styles.articleImage} />
                        </div>
                    </section>

                    {/* 5. Vehicles */}
                    <section id="vehicles" className={styles.section}>
                        <h2 className={styles.sectionTitle}>5. Vehicle Emission Factors</h2>
                        <p className={styles.body}>Translate transport activity into emissions, expressed per distance (km) or per ton-distance (tkm).</p>
                        <ul className={styles.body}>
                            <li><strong>Load class:</strong> Indicates 7.5t or 32t trucks with average loading assumptions.</li>
                            <li><strong>Technology:</strong> Euro standards, electric, or hybrid engine variations.</li>
                        </ul>

                        <div className={styles.imageContainer}>
                            <img src="/admin-ecoinvent-vehicles.png" alt="Vehicle Load Factors" className={styles.articleImage} />
                        </div>
                    </section>

                    {/* 6. Waste */}
                    <section id="waste" className={styles.section}>
                        <h2 className={styles.sectionTitle}>6. Waste Emission Factors</h2>
                        <p className={styles.body}>Model emissions from treatment processes such as landfill, incineration, and recycling.</p>
                        <ul className={styles.body}>
                            <li><strong>Recovery rate:</strong> Indicates how much material is recovered vs disposed of in market mixes.</li>
                            <li><strong>Wastewater technology:</strong> Captures specific treatment plant archetypes.</li>
                        </ul>

                        <div className={styles.imageContainer}>
                            <img src="/admin-ecoinvent-waste.png" alt="Waste End-of-Life Factors" className={styles.articleImage} />
                        </div>
                    </section>

                    {/* Footer Nav */}
                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/admin-article-master-setup')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Previous: Master Data Setup
                        </button>
                        <button className={styles.footerNavBtnNext} onClick={() => navigate('/manuals-admin')}>
                            Finish Guides
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
