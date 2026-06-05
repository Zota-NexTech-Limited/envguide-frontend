import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'part1', label: '1. Open Questionnaire' },
    { id: 'guidance', label: '2. Questionnaire Guidance' },
]

export default function ArticleOwnEmissions() {
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
                        <span className={styles.breadCurrent}>Own Emissions Guide</span>
                    </div>

                    {/* Article Header */}
                    <div className={styles.articleHeader}>
                        <h1 className={styles.articleTitle}>5. How to Add Own Emissions (Manufacturer Own Emissions Questionnaire)</h1>
                        <p className={styles.articleSubtitle}>
                            You have successfully reached the final step of the PCF series. This guide covers how to access the questionnaire and redirects you to the detailed guidance for completion.
                        </p>
                    </div>

                    <hr className={styles.divider} />

                    {/* Part 1: How to Open Questionnaire Page */}
                    <section id="part1" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Part 1: How to Open Questionnaire Page</h2>

                        <div className={styles.stepGroup}>
                            <h3 className={styles.stepTitle}>Navigate to Digital Emissions Questionnaire</h3>
                            <p className={styles.body}>Follow these steps to launch the official Manufacturer Own Emissions form:</p>

                            <div className={styles.numberedSteps} style={{ marginTop: '20px' }}>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>1</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepBody}>Log in and find your product in the <strong>Products</strong> portfolio table.</p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>2</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepBody}>Click <strong>View</strong> to enter the product details page.</p>
                                        <div className={styles.imageContainer}>
                                            <img src="/own-emissions-portfolio-view.png" alt="Select Product View" className={styles.articleImage} />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>3</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepBody}>Switch to the <strong>Own Emission</strong> tab at the top.</p>
                                        <div className={styles.imageContainer}>
                                            <img src="/own-emissions-tabs-navigation.png" alt="Own Emission Tab Navigation" className={styles.articleImage} />
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>4</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepBody}>Click the green <strong>Fill Questionnaire</strong> button to start.</p>
                                        <div className={styles.imageContainer}>
                                            <img src="/own-emissions-action-buttons.png" alt="Fill Questionnaire Action" className={styles.articleImage} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="guidance" className={styles.section} style={{ marginTop: '48px' }}>
                        <div style={{
                            background: '#fff',
                            border: '1px solid #e5e7eb',
                            borderRadius: '20px',
                            padding: '24px 32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '24px',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div style={{
                                    background: '#f0fdf4',
                                    width: '48px',
                                    height: '48px',
                                    borderRadius: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: '1px solid #dcfce7',
                                    flexShrink: 0
                                }}>
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: '0 0 4px' }}>Step 5 Complete!</h3>
                                    <p style={{ fontSize: '14px', color: '#6b7280', margin: 0, maxWidth: '400px', lineHeight: '1.5' }}>
                                        You've reached the final tab. Visit the <strong>Guidance Center</strong> for a detailed breakdown of all questions and required metrics.
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={() => navigate('/manufacturer-questionnaire')}
                                className={styles.helpBtn}
                                style={{
                                    width: 'auto',
                                    padding: '12px 24px',
                                    fontSize: '14px',
                                    fontWeight: '700',
                                    borderRadius: '12px',
                                    whiteSpace: 'nowrap'
                                }}
                            >
                                View Detailed Guidance
                            </button>
                        </div>
                    </section>

                    {/* Footer Nav */}
                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/article-pcf-workflow')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Previous: PCF Workflow
                        </button>
                        <button className={styles.footerNavBtnNext} onClick={() => navigate('/article-component-master')}>
                            Next: Component Master
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
