import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'navigation', label: 'Navigating to Configuration' },
    { id: 'products', label: '1. Products Architecture' },
    { id: 'components', label: '2. Components Architecture' },
    { id: 'manufacturing', label: '3. Manufacturing Logic' },
    { id: 'org', label: '4. Organization Ownership' },
    { id: 'connect', label: 'How it Connects to PCF' },
]

export default function ArticleDataConfiguration() {
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

    const CONFIG_MODULES = [
        { title: 'Products', icon: '📦', desc: 'Defines high-level system groupings and assemblies.' },
        { title: 'Components', icon: '🧩', desc: 'Defines the physical building blocks of products.' },
        { title: 'Manufacturing', icon: '🏭', desc: 'Connects engineering operations with carbon stages.' },
        { title: 'Organization', icon: '🏢', desc: 'Defines ownership and accountability tiers.' },
    ]

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
                    <p className={styles.tocLabel}>CONFIGURATION GUIDES</p>
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
                        <span className={styles.breadCurrent}>Data Configuration</span>
                    </div>

                    <div className={styles.articleHeader}>
                        <span className={styles.articleTag}>ADMIN MANUALS · DOCUMENT #06</span>
                        <h1 className={styles.articleTitle}>What is Data Configuration in Enviguide?</h1>
                        <p className={styles.articleSubtitle}>
                            Understanding the structural foundation that governs how the platform models products,
                            components, manufacturing logic, and organizational responsibility.
                        </p>
                    </div>

                    <hr className={styles.divider} />

                    {/* Overview */}
                    <section id="overview" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Overview</h2>
                        <p className={styles.body}>
                            Data Configuration is the architectural foundation of Enviguide. Before any PCF request is initiated or emissions calculated,
                            the system must know how your real-world ecosystem is structured.
                        </p>
                        <div className={styles.calloutBlue}>
                            <div className={styles.calloutIcon}>🏛️</div>
                            <div>
                                <p className={styles.calloutTitle}>Architecture vs. Setup</p>
                                <p className={styles.calloutText}>
                                    This is not just "setup"—it is <strong>Architecture</strong>. It defines what is being calculated,
                                    how it is classified, and where it sits in the lifecycle.
                                </p>
                            </div>
                        </div>

                        <div className={styles.rolesGrid} style={{ marginTop: '30px' }}>
                            {CONFIG_MODULES.map((m, i) => (
                                <div key={i} className={styles.roleCard} style={{ display: 'block' }}>
                                    <span style={{ fontSize: '24px' }}>{m.icon}</span>
                                    <p className={styles.roleName} style={{ margin: '10px 0 5px', color: '#111827' }}>{m.title}</p>
                                    <p className={styles.body} style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{m.desc}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Navigation */}
                    <section id="navigation" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Navigating to Configuration</h2>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>1</div><div className={styles.stepContent}><p className={styles.stepTitle}>Navigate to <strong>Settings</strong> in the main sidebar</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>2</div><div className={styles.stepContent}><p className={styles.stepTitle}>Locate the <strong>Data Configuration</strong> section</p></div></div>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/admin-data-config-overview.png" alt="Data Configuration menu list" className={styles.articleImage} />
                        </div>
                    </section>

                    {/* Products */}
                    <section id="products" className={styles.section}>
                        <h2 className={styles.sectionTitle}>1. Products Architecture</h2>
                        <p className={styles.body}>Establishes the hierarchy of how products are structured across two layers:</p>
                        <ul className={styles.body}>
                            <li><strong>Product Categories:</strong> High-level groupings (e.g., Powertrain, Battery Systems).</li>
                            <li><strong>Product Sub-Categories:</strong> Refined assemblies (e.g., Electric Motor, Battery Pack).</li>
                        </ul>
                        <div className={styles.imageContainer}>
                            <img src="/admin-data-config-products-header.png" alt="Products module interface" className={styles.articleImage} />
                        </div>
                        <div className={styles.twoColGrid}>
                            <div className={styles.imageContainer}>
                                <img src="/admin-data-config-products-categories.png" alt="Categories table" className={styles.articleImage} />
                                <p className={styles.imageCaption}>PRODUCT CATEGORIES</p>
                            </div>
                            <div className={styles.imageContainer}>
                                <img src="/admin-data-config-products-subcategories.png" alt="Sub-categories table" className={styles.articleImage} />
                                <p className={styles.imageCaption}>PRODUCT SUB-CATEGORIES</p>
                            </div>
                        </div>
                    </section>

                    {/* Components */}
                    <section id="components" className={styles.section}>
                        <h2 className={styles.sectionTitle}>2. Components Architecture</h2>
                        <p className={styles.body}>Defines the physical building blocks required for emission mapping and process linking.</p>
                        <div className={styles.imageContainer}>
                            <img src="/admin-data-config-components-header.png" alt="Components module" className={styles.articleImage} />
                        </div>
                        <div className={styles.twoColGrid}>
                            <div className={styles.imageContainer}>
                                <img src="/admin-data-config-components-types.png" alt="Component types" className={styles.articleImage} />
                                <p className={styles.imageCaption}>TYPES (Mechanical, PCB, etc.)</p>
                            </div>
                            <div className={styles.imageContainer}>
                                <img src="/admin-data-config-components-categories.png" alt="Component categories" className={styles.articleImage} />
                                <p className={styles.imageCaption}>CATEGORIES (Cell, Inverter, etc.)</p>
                            </div>
                        </div>
                    </section>

                    {/* Manufacturing */}
                    <section id="manufacturing" className={styles.section}>
                        <h2 className={styles.sectionTitle}>3. Manufacturing Configuration</h2>
                        <p className={styles.body}>Connects engineering reality with carbon accounting boundaries.</p>
                        <div className={styles.imageContainer}>
                            <img src="/admin-data-config-mfg-header.png" alt="Manufacturing config" className={styles.articleImage} />
                        </div>
                        <div className={styles.twoColGrid}>
                            <div className={styles.imageContainer}>
                                <img src="/admin-data-config-mfg-processes.png" alt="Manufacturing processes" className={styles.articleImage} />
                                <p className={styles.imageCaption}>PROCESSES (Casting, SMT, etc.)</p>
                            </div>
                            <div className={styles.imageContainer}>
                                <img src="/admin-data-config-mfg-lifecycle.png" alt="Lifecycle stages" className={styles.articleImage} />
                                <p className={styles.imageCaption}>LIFECYCLE STAGES (Logistics, Mfg, etc.)</p>
                            </div>
                        </div>
                    </section>

                    {/* Org */}
                    <section id="org" className={styles.section}>
                        <h2 className={styles.sectionTitle}>4. Organization Configuration</h2>
                        <p className={styles.body}>Defines ownership and supply chain hierarchy (OEM vs Tier Structure).</p>
                        <div className={styles.imageContainer}><img src="/admin-data-config-org-industry.png" alt="Industries" className={styles.articleImage} /></div>
                        <div className={styles.twoColGrid}>
                            <div className={styles.imageContainer}><img src="/admin-data-config-org-manufacturer.png" alt="Manufacturers" className={styles.articleImage} /></div>
                            <div className={styles.imageContainer}><img src="/admin-data-config-org-tier.png" alt="Tier structure" className={styles.articleImage} /></div>
                        </div>
                        <div className={styles.imageContainer}><img src="/admin-data-config-org-tags.png" alt="Custom tags" className={styles.articleImage} /></div>
                    </section>

                    {/* Connect */}
                    <section id="connect" className={styles.section}>
                        <h2 className={styles.sectionTitle}>How Data Configuration Connects to PCF</h2>
                        <div className={styles.flowSummaryBox}>
                            {[
                                { t: 'Products', d: 'Define WHAT is being assessed.' },
                                { t: 'Components', d: 'Define WHAT it is made of.' },
                                { t: 'Manufacturing', d: 'Define HOW it is made.' },
                                { t: 'Lifecycle', d: 'Define WHERE emissions occur.' },
                                { t: 'Organization', d: 'Define WHO is responsible.' },
                            ].map((item, i) => (
                                <div key={i} className={styles.flowSummaryStep}>
                                    <div className={styles.flowSummaryNum}>{i + 1}</div>
                                    <p className={styles.flowSummaryText}><strong>{item.t}:</strong> {item.d}</p>
                                </div>
                            ))}
                        </div>
                        <p className={styles.body} style={{ textAlign: 'center', marginTop: '20px', fontWeight: '600', color: '#16a34a' }}>
                            Master Configuration = Audit-Ready Calculations ✅
                        </p>
                    </section>

                    {/* Footer Nav */}
                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/admin-article-pcf-workflow')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Previous: PCF Workflow
                        </button>
                        <button className={styles.footerNavBtnNext} onClick={() => navigate('/manuals-admin')}>
                            Back to Admin Manuals
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
