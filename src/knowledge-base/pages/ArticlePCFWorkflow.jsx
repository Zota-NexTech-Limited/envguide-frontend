import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'overview', label: 'Workflow Overview' },
    { id: 'status-stages', label: 'Lifecycle Stages' },
    { id: 'supplier-engagement', label: 'Supplier Engagement' },
    { id: 'data-quality', label: 'Data Quality' },
    { id: 'calculation', label: 'PCF Calculation' },
    { id: 'validation', label: 'Validation & Completion' },
    { id: 'completion', label: 'Final Completion' },
]

export default function ArticlePCFWorkflow() {
    const navigate = useNavigate()
    const [activeSection, setActiveSection] = useState('')

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveSection(entry.target.id)
                    }
                })
            },
            { rootMargin: '-20% 0% -35% 0%', threshold: 0.1 }
        )

        SECTIONS.forEach((s) => {
            const el = document.getElementById(s.id)
            if (el) observer.observe(el)
        })

        return () => observer.disconnect()
    }, [])

    return (
        <div className={styles.page}>

            {/* ── Minimal Top Bar ── */}
            <div className={styles.topBar}>
                <button className={styles.backBtn} onClick={() => navigate('/manuals-pcf')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to PCF Manuals
                </button>
            </div>

            {/* ── Main Layout ── */}
            <div className={styles.layout}>

                {/* ── Left Sidebar TOC ── */}
                <aside className={styles.toc}>
                    <p className={styles.tocLabel}>ON THIS PAGE</p>
                    <nav className={styles.tocNav}>
                        {SECTIONS.map(s => (
                            <a
                                key={s.id}
                                href={`#${s.id}`}
                                className={`${styles.tocLink} ${activeSection === s.id ? styles.tocLinkActive : ''}`}
                            >
                                {s.label}
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* ── Article Content ── */}
                <article className={styles.article}>

                    {/* Breadcrumb */}
                    <div className={styles.breadcrumb}>
                        <button className={styles.breadLink} onClick={() => navigate('/help-centre')}>Help Center</button>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18l6-6-6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <button className={styles.breadLink} onClick={() => navigate('/manuals-pcf')}>PCF Manuals</button>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18l6-6-6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={styles.breadCurrent}>Processing Workflow</span>
                    </div>

                    {/* Article Header */}
                    <div className={styles.articleHeader}>
                        <span className={styles.articleTag}>PCF MANUALS</span>
                        <h1 className={styles.articleTitle}>PCF Request Processing Workflow & Admin Actions</h1>
                        <p className={styles.articleSubtitle}>
                            This guide explains what happens after you submit a PCF request, including all the stages,
                            verification processes, and actions taken by admins and suppliers.
                        </p>
                        <div className={styles.articleMeta}>
                            <span className={styles.metaItem}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="2" />
                                    <path d="M12 6v6l4 2" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                5 min read
                            </span>
                            <span className={styles.metaDot} />
                            <span className={styles.metaItem}>Updated Feb 2026</span>
                        </div>
                    </div>

                    <hr className={styles.divider} />

                    {/* Overview */}
                    <section id="overview" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Overview of PCF Request Lifecycle</h2>
                        <p className={styles.body}>
                            After you submit your PCF request, it goes through several stages involving verification,
                            supplier engagement, data collection, and PCF calculation.
                        </p>

                        <div className={styles.calloutBlue}>
                            <p className={styles.calloutTitle}>💡 The Lifecycle Stages</p>
                            <ul className={styles.bullets} style={{ marginTop: '10px', fontSize: '13px' }}>
                                <li><strong>Created:</strong> Initial submission and ID assignment.</li>
                                <li><strong>Verification:</strong> Admin review of BOM and technical files.</li>
                                <li><strong>Engagement:</strong> Supplier outreach for component carbon data.</li>
                                <li><strong>Validation:</strong> Quality checks and result locking.</li>
                            </ul>
                        </div>
                    </section>

                    {/* Status Stages */}
                    <section id="status-stages" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Request Status Stages</h2>
                        <p className={styles.body}>Your PCF request will display different statuses as it progresses through the system:</p>

                        <div className={styles.numberedSteps}>
                            {/* Stage 1 */}
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>1</div>
                                <div className={styles.stepContent}>
                                    <p className={styles.stepTitle}>PCF Request Created</p>
                                    <p className={styles.stepBody}>Initial state when you first submit. Your request is successfully recorded, and a unique tracking number is assigned.</p>
                                    <div className={styles.imageContainer}>
                                        <img src="/workflow-request-created.png" alt="PCF Request Status: Created" className={styles.articleImage} />
                                    </div>
                                </div>
                            </div>

                            {/* Stage 2 */}
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>2</div>
                                <div className={styles.stepContent}>
                                    <p className={styles.stepTitle}>PCF Request Submitted (Admin Review)</p>
                                    <p className={styles.stepBody}>Awaiting admin verification. Admin verifies all information, documentation, and BOM files are complete and correct.</p>
                                </div>
                            </div>

                            {/* Stage 3 */}
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>3</div>
                                <div className={styles.stepContent}>
                                    <p className={styles.stepTitle}>BOM Verification</p>
                                    <p className={styles.stepBody}>The most critical stage. The system automatically identifies suppliers and generates individual questionnaires for each component.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Supplier Engagement */}
                    <section id="supplier-engagement" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Supplier Questionnaires Explained</h2>
                        <div className={styles.rolesGrid}>
                            <div className={styles.roleCard}>
                                <p className={styles.roleEmoji}>🔒</p>
                                <div>
                                    <p className={styles.roleName}>Confidential Engagement</p>
                                    <p className={styles.roleDesc}>Suppliers receive customized links via email. They NEVER see your company details or other supplier data.</p>
                                </div>
                            </div>
                            <div className={styles.roleCard}>
                                <p className={styles.roleEmoji}>📊</p>
                                <div>
                                    <p className={styles.roleName}>Data Collection</p>
                                    <p className={styles.roleDesc}>Suppliers submit technical environmental data back to Enviguide for their specific components.</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.calloutBlue} style={{ marginTop: '20px' }}>
                            <p className={styles.calloutText}>
                                <strong>Important:</strong> These questionnaires are completely separate from your request dashboard to ensure data privacy.
                            </p>
                        </div>
                    </section>

                    {/* Data Quality */}
                    <section id="data-quality" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Data Quality Assessment</h2>
                        <p className={styles.body}>Admin team reviews all collected supplier data for accuracy. Ratings are based on:</p>
                        <div className={styles.dqGrid}>
                            <div className={styles.dqCard}>
                                <span className={styles.dqEmoji}>📊</span>
                                <h4 className={styles.dqDimension}>Completeness</h4>
                                <p className={styles.dqDesc}>Are all required supplier responses received?</p>
                            </div>
                            <div className={styles.dqCard}>
                                <span className={styles.dqEmoji}>🎯</span>
                                <h4 className={styles.dqDimension}>Accuracy</h4>
                                <p className={styles.dqDesc}>Verification of environmental data provided.</p>
                            </div>
                        </div>
                    </section>

                    {/* PCF Calculation */}
                    <section id="calculation" className={styles.section}>
                        <h2 className={styles.sectionTitle}>PCF Calculation</h2>
                        <p className={styles.body}>
                            Once quality-checked, the Enviguide engine computes total carbon footprint values (e.g., cradle‑to‑gate).
                            Results are linked back to your tracking number and become available for review.
                        </p>
                    </section>

                    {/* Validation & Completion */}
                    <section id="validation" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Validation & "Check & Post" Action</h2>
                        <p className={styles.body}>
                            Admin uses an internal checklist (data coverage, quality rating) before moving to final validation.
                            The admin clicks the <strong>“Check & Post”</strong> action to lock the results and make them visible to you.
                        </p>
                        <div className={styles.imageContainer}>
                            <img src="/workflow-admin-post.png" alt="Admin Check & Post Action" className={styles.articleImage} />
                            <p className={styles.imageCaption}>ADMIN-ONLY VIEW: VALIDATING AND POSTING RESULTS</p>
                        </div>
                    </section>

                    {/* Final Completion */}
                    <section id="completion" className={styles.section}>
                        <h2 className={styles.sectionTitle}>User View and Final Confirmation</h2>
                        <p className={styles.body}>
                            Once posted, all relevant checkboxes for data completeness will appear as completed on your screen.
                            You can now view, verify, and use the information for reporting and disclosures.
                        </p>
                        <div className={styles.imageContainer}>
                            <img src="/workflow-user-results.png" alt="Final User Results View" className={styles.articleImage} />
                            <p className={styles.imageCaption}>FINAL USER VIEW: PCF VALUES AND VALIDATION BADGES COMPLETE</p>
                        </div>
                        <div className={styles.calloutGreen}>
                            <p className={styles.calloutText} style={{ margin: 0 }}>
                                ✅ The PCF lifecycle is now <strong>Complete</strong> for this product version.
                            </p>
                        </div>
                    </section>

                    {/* Article Footer Nav */}
                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/article-create-pcf-request')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Back to Create Request
                        </button>
                        <button className={styles.footerNavBtnNext} onClick={() => navigate('/article-own-emissions')}>
                            Next: Add Own Emissions
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
