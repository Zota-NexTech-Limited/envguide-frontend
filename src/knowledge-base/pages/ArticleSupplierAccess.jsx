import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'introduction', label: '1. Introduction' },
    { id: 'purpose', label: '2. Purpose & Methodology' },
    { id: 'privacy', label: '3. Data Privacy' },
    { id: 'access', label: '4. How to Access' },
    { id: 'scope3', label: '5. Scope 3 — Value Chain' },
    { id: 'scope4', label: '6. Scope 4 — Avoided Emissions' },
]

export default function ArticleSupplierAccess() {
    const navigate = useNavigate()
    const [activeSection, setActiveSection] = useState('introduction')

    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = SECTIONS.map(s => document.getElementById(s.id))
            const scrollPosition = window.scrollY + 100

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
        if (el) {
            window.scrollTo({
                top: el.offsetTop - 80,
                behavior: 'smooth'
            })
        }
    }

    return (
        <div className={styles.page}>
            <header className={styles.topBar}>
                <button className={styles.backBtn} onClick={() => navigate('/manuals-supplier')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M5 12l7 7M5 12l7-7" />
                    </svg>
                    Back to Manuals
                </button>
            </header>

            <div className={styles.layout}>
                <aside className={styles.toc}>
                    <div className={styles.tocLabel}>CONTENTS</div>
                    <nav className={styles.tocNav}>
                        {SECTIONS.map(section => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className={`${styles.tocLink} ${activeSection === section.id ? styles.tocLinkActive : ''}`}
                                onClick={(e) => {
                                    e.preventDefault()
                                    scrollToSection(section.id)
                                }}
                            >
                                {section.label}
                            </a>
                        ))}
                    </nav>
                </aside>

                <article className={styles.article}>
                    <div className={styles.breadcrumb}>
                        <button className={styles.breadLink} onClick={() => navigate('/manuals-pcf')}>Manuals</button>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <button className={styles.breadLink} onClick={() => navigate('/manuals-supplier')}>Supplier</button>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <span className={styles.breadCurrent}>Accessing the Questionnaire</span>
                    </div>

                    <header className={styles.articleHeader}>
                        <span className={styles.articleTag} style={{ background: '#ecfdf5', color: '#059669' }}>SUPPLIER GUIDE</span>
                        <h1 className={styles.articleTitle}>Accessing the Supplier Questionnaire</h1>
                        <p className={styles.articleSubtitle}>
                            A guide for our valued partners to navigate sustainability reporting and carbon footprint assessment.
                        </p>
                    </header>

                    <section id="introduction" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Section 1: Introduction for Suppliers</h2>
                        <p className={styles.body}>Dear Supplier,</p>
                        <p className={styles.body}>
                            We are currently conducting a <strong>Product Carbon Footprint (PCF)</strong> assessment for your manufacturer. As part of this process, we need to collect specific data related to the components and materials you supply.
                        </p>
                        <div className={styles.calloutGreen}>
                            <div className={styles.calloutIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                            </div>
                            <div>
                                <h4 className={styles.calloutTitle}>Project Collaboration</h4>
                                <p className={styles.calloutText}>
                                    This questionnaire is shared with the permission of your manufacturer to gather accurate energy, waste, and material data for carbon footprint calculations.
                                </p>
                            </div>
                        </div>
                        <p className={styles.body}>
                            Your inputs will be used solely for sustainability reporting and PCF calculation. If you need assistance, please reach out to our support team.
                        </p>
                    </section>

                    <section id="purpose" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Section 2: Purpose & Methodology</h2>
                        <p className={styles.body}>
                            The assessment follows a <strong>"cradle-to-gate"</strong> boundary, covering emissions from raw material extraction through manufacturing up to the factory gate.
                        </p>

                        <div className={styles.rolesGrid}>
                            <div className={styles.roleCard}>
                                <span className={styles.roleEmoji}>📊</span>
                                <div>
                                    <div className={styles.roleName}>Emissions tracking</div>
                                    <p className={styles.roleDesc}>Includes Scope 1 (Direct), Scope 2 (Energy), and Scope 3 (Value Chain).</p>
                                </div>
                            </div>
                            <div className={styles.roleCard}>
                                <span className={styles.roleEmoji}>📏</span>
                                <div>
                                    <div className={styles.roleName}>Global Standards</div>
                                    <p className={styles.roleDesc}>Aligns with GHG Protocol Product Standard and ISO 14067.</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.whyList}>
                            <div className={styles.whyItem}>
                                <div className={styles.whyNum}>✓</div>
                                <div>
                                    <div className={styles.whyTitle}>Accurate Reporting</div>
                                    <p className={styles.whyBody}>Ensures compliance with global sustainability requirements.</p>
                                </div>
                            </div>
                            <div className={styles.whyItem}>
                                <div className={styles.whyNum}>✓</div>
                                <div>
                                    <div className={styles.whyTitle}>Reliable Results</div>
                                    <p className={styles.whyBody}>Generating trustworthy PCF results for the entire supply chain.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="privacy" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Section 3: Data Privacy (GDPR Compliance)</h2>
                        <div className={styles.calloutBlue}>
                            <div className={styles.calloutIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                            </div>
                            <div>
                                <h4 className={styles.calloutTitle}>Confidentiality Guaranteed</h4>
                                <p className={styles.calloutText}>
                                    All information is treated as strictly confidential and processed in accordance with General Data Protection Regulation (GDPR) standards.
                                </p>
                            </div>
                        </div>
                        <p className={styles.body}>
                            Access is restricted to authorized personnel. Appropriate technical measures protect your data against unauthorized disclosure. Data is retained only for a necessary period and you have the right to request clarification or deletion subject to legal obligations.
                        </p>
                    </section>

                    <section id="access" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Section 4: How to Access</h2>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>1</div>
                                <div className={styles.stepBody}>
                                    <div className={styles.stepTitle}>Receive Email Notification</div>
                                    <p>Check your inbox for the official Enviguide questionnaire request.</p>
                                </div>
                            </div>
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>2</div>
                                <div className={styles.stepBody}>
                                    <div className={styles.stepTitle}>Select Action</div>
                                    <p>Click the <strong>"Complete Questionnaire"</strong> option within the email.</p>
                                </div>
                            </div>
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>3</div>
                                <div className={styles.stepBody}>
                                    <div className={styles.stepTitle}>Alternative Access</div>
                                    <p>If buttons are disabled due to security, use the secure link provided in the email text.</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/supplier_email_access.png" alt="Email Access Interface" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Image: Dashboard / Email access interface</p>
                        </div>
                    </section>

                    <section id="scope3" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Section 5: Scope 3 — Value Chain Emissions</h2>
                        <p className={styles.body}>
                            Scope 3 emissions include all indirect emissions that occur in your organization's value chain. This is often the most significant part of a product's carbon footprint.
                        </p>
                        <div className={styles.dqGrid}>
                            <div className={styles.dqCard}>
                                <span className={styles.dqEmoji}>🏗️</span>
                                <h4 className={styles.dqDimension}>Materials</h4>
                                <p className={styles.dqDesc}>Raw materials and components used in the product.</p>
                            </div>
                            <div className={styles.dqCard}>
                                <span className={styles.dqEmoji}>📦</span>
                                <h4 className={styles.dqDimension}>Packaging</h4>
                                <p className={styles.dqDesc}>Primary and secondary packaging for delivery.</p>
                            </div>
                            <div className={styles.dqCard}>
                                <span className={styles.dqEmoji}>🚛</span>
                                <h4 className={styles.dqDimension}>Logistics</h4>
                                <p className={styles.dqDesc}>Upstream and downstream transport of goods.</p>
                            </div>
                            <div className={styles.dqCard}>
                                <span className={styles.dqEmoji}>♻️</span>
                                <h4 className={styles.dqDimension}>Waste</h4>
                                <p className={styles.dqDesc}>Disposal and treatment of production waste.</p>
                            </div>
                        </div>
                        <p className={styles.body} style={{ marginTop: '16px' }}>
                            We collect detailed data on material types, recycled content percentages, and transport modes to ensure the highest degree of accuracy in our PCF modeling.
                        </p>
                    </section>

                    <section id="scope4" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Section 6: Scope 4 — Avoided Emissions</h2>
                        <p className={styles.body}>
                            Scope 4 refers to emissions reductions that happen outside of a product's lifecycle but are enabled by it. This section captures the positive climate impact of your innovations.
                        </p>
                        <div className={styles.calloutBlue}>
                            <div className={styles.calloutIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
                                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                                </svg>
                            </div>
                            <div>
                                <h4 className={styles.calloutTitle}>Capturing Positive Impact</h4>
                                <p className={styles.calloutText}>
                                    This includes circular economy practices, products that enable customer emissions savings, and investments in external renewable projects.
                                </p>
                            </div>
                        </div>
                        <div className={styles.whyList}>
                            <div className={styles.whyItem}>
                                <div className={styles.whyNum}>01</div>
                                <div>
                                    <div className={styles.whyTitle}>Product Impact</div>
                                    <p className={styles.whyBody}>How your product helps customers reduce their own footprint.</p>
                                </div>
                            </div>
                            <div className={styles.whyItem}>
                                <div className={styles.whyNum}>02</div>
                                <div>
                                    <div className={styles.whyTitle}>Circular Practices</div>
                                    <p className={styles.whyBody}>Take-back programs, reuse, and refurbishment initiatives.</p>
                                </div>
                            </div>
                            <div className={styles.whyItem}>
                                <div className={styles.whyNum}>03</div>
                                <div>
                                    <div className={styles.whyTitle}>Environmental Projects</div>
                                    <p className={styles.whyBody}>Off-site renewable energy financing or restoration projects.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                </article>
            </div>
        </div>
    )
}
