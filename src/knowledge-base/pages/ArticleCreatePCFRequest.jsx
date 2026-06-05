import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'navigate', label: '1. Navigate' },
    { id: 'new-request', label: '2. New Request' },
    { id: 'overview', label: 'Overview' },
    { id: 'form-step1', label: 'Basic Information' },
    { id: 'form-step2', label: 'Product Details' },
    { id: 'form-step3', label: 'Documentation' },
    { id: 'form-step4', label: 'Review & Submit' },
    { id: 'portfolio-constraint', label: 'Constraint' },
    { id: 'tips', label: 'Success Tips' },
]

export default function ArticleCreatePCFRequest() {
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
                        <span className={styles.breadCurrent}>Create PCF Request</span>
                    </div>

                    {/* Article Header */}
                    <div className={styles.articleHeader}>
                        <span className={styles.articleTag}>PCF MANUALS</span>
                        <h1 className={styles.articleTitle}>How to Create a PCF Request for a product</h1>
                        <p className={styles.articleSubtitle}>
                            This guide provides step-by-step instructions on how to create a Product Carbon Footprint (PCF) Request
                            in the Enviguide Management Suite.
                        </p>
                        <div className={styles.articleMeta}>
                            <span className={styles.metaItem}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="2" />
                                    <path d="M12 6v6l4 2" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                6 min read
                            </span>
                            <span className={styles.metaDot} />
                            <span className={styles.metaItem}>Updated Feb 2026</span>
                        </div>
                    </div>

                    <hr className={styles.divider} />

                    {/* Step 1: Navigate */}
                    <section id="navigate" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 1: Navigate to PCF Request Management</h2>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>1</div>
                                <div className={styles.stepContent}>
                                    <p className={styles.stepBody}>Log in to your Enviguide Management Suite account with your credentials</p>
                                </div>
                            </div>
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>2</div>
                                <div className={styles.stepContent}>
                                    <p className={styles.stepBody}>From the left sidebar menu, locate and click on "PCF Request" (displayed with a green document icon)</p>
                                </div>
                            </div>
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>3</div>
                                <div className={styles.stepContent}>
                                    <p className={styles.stepBody}>You will be redirected to the PCF Request Management Dashboard</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.imageContainer}>
                            <img src="/pcf-management-dashboard.png" alt="PCF Request Management Dashboard" className={styles.articleImage} />
                            <p className={styles.imageCaption}>PCF Request Management dashboard with status cards, search filters, and the green "+ New Request" button.</p>
                        </div>
                    </section>

                    {/* Step 2: Locate Button */}
                    <section id="new-request" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 2: Locate and Click the "+New Request" Button</h2>
                        <p className={styles.body}>
                            In the PCF Requests section of the dashboard, you will see a prominent <strong>green "+ New Request" button</strong> located above the table of existing requests.
                        </p>
                        <div className={styles.calloutBlue} style={{ marginTop: '16px' }}>
                            <p className={styles.calloutText} style={{ margin: 0 }}>
                                📍 <strong>Location:</strong> The button is positioned to the left of the search bar in the PCF Requests section
                            </p>
                        </div>

                        <div className={styles.imageContainer}>
                            <img src="/locate-new-request.png" alt="New Request Button Location" className={styles.articleImage} />
                            <p className={styles.imageCaption}>ACTION: CLICK THIS BUTTON TO INITIALIZE THE PCF REQUEST CREATION FORM WITH ALL 4 STEPS</p>
                        </div>
                    </section>

                    <hr className={styles.divider} />

                    {/* Overview */}
                    <section id="overview" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Overview</h2>
                        <p className={styles.body}>The PCF request process consists of 4 main steps:</p>
                        <div className={styles.dqGrid} style={{ marginTop: '20px' }}>
                            <div className={styles.dqCard}>
                                <p className={styles.dqTitle}>1. Basic Information</p>
                            </div>
                            <div className={styles.dqCard}>
                                <p className={styles.dqTitle}>2. Product Details</p>
                            </div>
                            <div className={styles.dqCard}>
                                <p className={styles.dqTitle}>3. Documentation</p>
                            </div>
                            <div className={styles.dqCard}>
                                <p className={styles.dqTitle}>4. Review & Submit</p>
                            </div>
                        </div>
                    </section>

                    <hr className={styles.divider} />

                    {/* Form Step 1 */}
                    <section id="form-step1" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 1: Basic Information</h2>
                        <p className={styles.body}>
                            In this first step, you'll enter the basic details of your PCF request. All fields marked with an asterisk
                            (<span style={{ color: '#ef4444' }}>*</span>) are required.
                        </p>

                        {/* 1. Request Title */}
                        <div style={{ marginTop: '40px', paddingLeft: '8px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0, background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>1. Request Title <span style={{ color: '#ef4444' }}>*</span></h3>
                            </div>
                            <div style={{ paddingLeft: '46px' }}>
                                <p style={{ fontSize: '14.5px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }}>
                                    Enter a descriptive name to help identify and track your request in the dashboard.
                                </p>
                                <div className={styles.imageContainer} style={{ margin: '0' }}>
                                    <img src="/pcf-step1-title.png" alt="Request Title Field" className={styles.articleImage} />
                                </div>
                            </div>
                        </div>

                        {/* 2. Priority Level */}
                        <div style={{ marginTop: '48px', paddingLeft: '8px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0, background: '#ecfdf5', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>2. Priority Level <span style={{ color: '#ef4444' }}>*</span></h3>
                            </div>
                            <div style={{ paddingLeft: '46px' }}>
                                <p style={{ fontSize: '14.5px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 20px' }}>
                                    Assign an urgency level. Turnaround times are set automatically:
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                                    {[
                                        { label: 'HIGH', time: '10 Days', bg: '#fef2f2', border: '#fee2e2', text: '#991b1b', tag: '#ef4444' },
                                        { label: 'MEDIUM', time: '21 Days', bg: '#f0fdfa', border: '#ccfbf1', text: '#0d9488', tag: '#14b8a6' },
                                        { label: 'LOW', time: '30 Days', bg: '#f0f9ff', border: '#e0f2fe', text: '#075985', tag: '#3b82f6' }
                                    ].map((p, i) => (
                                        <div key={i} style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: '14px', padding: '16px', textAlign: 'center' }}>
                                            <span style={{ fontSize: '10px', fontWeight: '900', color: '#fff', background: p.tag, padding: '2px 8px', borderRadius: '6px', marginBottom: '8px', display: 'inline-block' }}>{p.label}</span>
                                            <p style={{ fontSize: '20px', fontWeight: '800', color: p.text, margin: 0 }}>{p.time}</p>
                                        </div>
                                    ))}
                                </div>
                                <div className={styles.imageContainer} style={{ margin: '0' }}>
                                    <img src="/pcf-step1-priority.png" alt="Priority Selection" className={styles.articleImage} />
                                </div>
                            </div>
                        </div>

                        {/* 3. Due Date */}
                        <div style={{ marginTop: '48px', paddingLeft: '8px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0, background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>3. Due Date <span style={{ color: '#ef4444' }}>*</span></h3>
                            </div>
                            <div style={{ paddingLeft: '46px' }}>
                                <p style={{ fontSize: '14.5px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }}>
                                    Automatically calculated based on priority level to ensure timely completion.
                                </p>
                                <div className={styles.imageContainer} style={{ margin: '0' }}>
                                    <img src="/pcf-step1-duedate.png" alt="Due Date Field" className={styles.articleImage} />
                                </div>
                            </div>
                        </div>

                        {/* 4. Requesting Organization */}
                        <div style={{ marginTop: '48px', paddingLeft: '8px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0, background: '#f5f3ff', borderRadius: '12px', border: '1px solid #ede9fe' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>4. Requesting Organization <span style={{ color: '#ef4444' }}>*</span></h3>
                            </div>
                            <div style={{ paddingLeft: '46px' }}>
                                <p style={{ fontSize: '14.5px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }}>
                                    Specify the organization account that is requesting this PCF assessment.
                                </p>
                                <div className={styles.imageContainer} style={{ margin: '0' }}>
                                    <img src="/pcf-step1-org.png" alt="Organization Field" className={styles.articleImage} />
                                </div>
                            </div>
                        </div>

                        {/* 5. Request Description */}
                        <div style={{ marginTop: '48px', paddingLeft: '8px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0, background: '#f8fafc', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 6h16M4 12h16M4 18h7" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>5. Request Description</h3>
                            </div>
                            <div style={{ paddingLeft: '46px' }}>
                                <p style={{ fontSize: '14.5px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }}>
                                    Provide any extra notes or specific details for the review team (Max 500 chars).
                                </p>
                                <div className={styles.imageContainer} style={{ margin: '0' }}>
                                    <img src="/pcf-step1-desc.png" alt="Description Field" className={styles.articleImage} />
                                </div>
                            </div>
                        </div>

                        <div className={styles.calloutGreen} style={{ marginTop: '60px' }}>
                            <p className={styles.calloutText} style={{ margin: 0 }}>
                                ✅ After completing Step 1, click <strong>Save & Continue</strong> to proceed to Step 2.
                            </p>
                        </div>
                    </section>

                    <hr className={styles.divider} />

                    {/* Form Step 2 */}
                    <section id="form-step2" className={styles.section} style={{ marginTop: '0' }}>
                        <h2 className={styles.sectionTitle}>Step 2: Product Details</h2>
                        <p className={styles.body}>In this step, you'll define the product category, specifications, and Bill of Materials (BOM) for your PCF request. This step has 4 required fields.</p>

                        {/* 1. Product Category */}
                        <div style={{ marginTop: '40px', paddingLeft: '8px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0, background: '#f0fdf4', borderRadius: '12px', border: '1px solid #dcfce7' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 6h16M4 10h16M4 14h16M4 18h16" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>1. Product Category <span style={{ color: '#ef4444' }}>*</span></h3>
                            </div>
                            <div style={{ paddingLeft: '46px' }}>
                                <p style={{ fontSize: '14.5px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }}>
                                    Select from a dropdown list of predefined product categories from your Portfolio.
                                </p>
                                <div className={styles.imageContainer} style={{ margin: '0' }}>
                                    <img src="/pcf-step2-category.png" alt="Product Category" className={styles.articleImage} />
                                </div>
                            </div>
                        </div>

                        {/* 2 & 3. Component Details */}
                        <div style={{ marginTop: '48px', paddingLeft: '8px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0, background: '#eff6ff', borderRadius: '12px', border: '1px solid #dbeafe' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>2. Component Category & Type <span style={{ color: '#ef4444' }}>*</span></h3>
                            </div>
                            <div style={{ paddingLeft: '46px' }}>
                                <p style={{ fontSize: '14.5px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }}>
                                    Classify the product and specify the type of component to ensure accurate calculation mapping.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div className={styles.imageContainer} style={{ margin: '0' }}>
                                        <img src="/pcf-step2-comp-cat.png" alt="Component Category" className={styles.articleImage} />
                                    </div>
                                    <div className={styles.imageContainer} style={{ margin: '0' }}>
                                        <img src="/pcf-step2-comp-type.png" alt="Component Type" className={styles.articleImage} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Product Code */}
                        <div style={{ marginTop: '48px', paddingLeft: '8px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0, background: '#f5f3ff', borderRadius: '12px', border: '1px solid #ede9fe' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M7 7h.01M7 11h.01M7 15h.01M10 7h.01M10 11h.01M10 15h.01M13 7h.01M13 11h.01M13 15h.01M17 7h.01M17 11h.01M17 15h.01" stroke="#8b5cf6" strokeWidth="3" strokeLinecap="round" />
                                        <rect x="3" y="3" width="18" height="18" rx="2" stroke="#8b5cf6" strokeWidth="2" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>4. Product Code <span style={{ color: '#ef4444' }}>*</span></h3>
                            </div>
                            <div style={{ paddingLeft: '46px' }}>
                                <p style={{ fontSize: '14.5px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }}>
                                    Select the unique ID associated with the specific product variant.
                                </p>
                                <div className={styles.imageContainer} style={{ margin: '0' }}>
                                    <img src="/pcf-step2-code.png" alt="Product Code" className={styles.articleImage} />
                                </div>
                            </div>
                        </div>

                        {/* Specifications */}
                        <div style={{ marginTop: '48px', paddingLeft: '8px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0, background: '#ecfdf5', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>7. Product Specifications</h3>
                            </div>
                            <div style={{ paddingLeft: '46px' }}>
                                <p style={{ fontSize: '14.5px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }}>
                                    Add technical parameters (Weight, Dimensions, Materials) using the specification table.
                                </p>
                                <div className={styles.imageContainer} style={{ margin: '0' }}>
                                    <img src="/pcf-step2-specs.png" alt="Specifications Table" className={styles.articleImage} />
                                </div>
                            </div>
                        </div>

                        {/* BOM Section */}
                        <div style={{ marginTop: '48px', paddingLeft: '8px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0, background: '#ecfdf5', borderRadius: '12px', border: '1px solid #d1fae5' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 17v-2m3 2v-4m3 2v-6m-8-5l-1.5 1.5M16 4l1.5 1.5M3 10V4h6m12 10v6h-6" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>8. Bill of Materials (BOM)</h3>
                            </div>
                            <div style={{ paddingLeft: '46px' }}>
                                <p style={{ fontSize: '14.5px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }}>
                                    Upload your material list using a CSV or Excel file for automated processing.
                                </p>
                                <div className={styles.imageContainer} style={{ margin: '0' }}>
                                    <img src="/pcf-step2-bom-import.png" alt="BOM Import" className={styles.articleImage} />
                                </div>

                                <div style={{ marginTop: '32px', background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#111827', margin: '0 0 12px' }}>CSV Column Mapping</h4>
                                    <p style={{ fontSize: '13.5px', color: '#64748b', lineHeight: '1.6', marginBottom: '20px' }}>
                                        After uploading, match your file columns to Enviguide data fields. Required fields must be mapped to proceed.
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div className={styles.imageContainer} style={{ margin: '0', background: '#fff' }}>
                                            <img src="/pcf-step2-mapping-1.png" alt="Mapping Dialog" className={styles.articleImage} />
                                        </div>
                                        <div className={styles.imageContainer} style={{ margin: '0', background: '#fff' }}>
                                            <img src="/pcf-step2-mapping-2.png" alt="Mapping Selection" className={styles.articleImage} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.calloutGreen} style={{ marginTop: '60px' }}>
                            <p className={styles.calloutText}>
                                ✅ After completing Step 2, click <strong>Save & Continue</strong> to move to Step 3.
                            </p>
                        </div>
                    </section>

                    <hr className={styles.divider} />

                    {/* Form Step 3 */}
                    <section id="form-step3" className={styles.section} style={{ marginTop: '0' }}>
                        <h2 className={styles.sectionTitle}>Step 3: Documentation</h2>
                        <p className={styles.body}>In this step, you'll upload supporting documentation for your PCF request.</p>

                        {/* Technical Spec */}
                        <div style={{ marginTop: '40px', paddingLeft: '8px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0, background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>Technical Specification</h3>
                            </div>
                            <div style={{ paddingLeft: '46px' }}>
                                <p style={{ fontSize: '14.5px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }}>
                                    A technical specification clearly describes the product’s functional details. A good spec should include:
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', background: '#f9fafb', padding: '20px', borderRadius: '14px', border: '1px solid #f3f4f6', marginBottom: '20px' }}>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {['Product name & model', 'Brief description', 'Dimensions & weight', 'Material details'].map((item, i) => (
                                            <li key={i} style={{ fontSize: '13px', color: '#374151', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e' }} /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {['Technical parameters', 'Operating conditions', 'Standard & Certs', 'Relevant diagrams'].map((item, i) => (
                                            <li key={i} style={{ fontSize: '13px', color: '#374151', display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#22c55e' }} /> {item}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className={styles.imageContainer} style={{ margin: '0' }}>
                                    <img src="/pcf-step3-techspec.png" alt="Technical Specification" className={styles.articleImage} />
                                </div>
                            </div>
                        </div>

                        {/* Product Images */}
                        <div style={{ marginTop: '48px', paddingLeft: '8px' }}>
                            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '40px', height: '40px', flexShrink: 0, background: '#fdf2f8', borderRadius: '12px', border: '1px solid #fce7f3' }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" stroke="#db2777" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#111827', margin: 0 }}>Product Images</h3>
                            </div>
                            <div style={{ paddingLeft: '46px' }}>
                                <p style={{ fontSize: '14.5px', color: '#4b5563', lineHeight: '1.6', margin: '0 0 16px' }}>
                                    High-quality images help stakeholders visually understand the product's design and form factor.
                                </p>
                                <div className={styles.imageContainer} style={{ margin: '0' }}>
                                    <img src="/pcf-step3-images.png" alt="Product Images" className={styles.articleImage} />
                                </div>
                            </div>
                        </div>

                        <div className={styles.calloutGreen} style={{ marginTop: '60px' }}>
                            <p className={styles.calloutText}>
                                ✅ After completing Step 3, click <strong>Save & Continue</strong> to move to Step 4.
                            </p>
                        </div>
                    </section>

                    <hr className={styles.divider} />

                    {/* Form Step 4 */}
                    <section id="form-step4" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 4: Review & Submit</h2>
                        <p className={styles.body}>In this final step, you'll review all the information you've entered and submit your PCF request.</p>
                        <div style={{
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '20px',
                            padding: '32px',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></div>
                                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Submission Checklist</span>
                                </div>
                                <span style={{ fontSize: '12px', background: '#f0fdf4', color: '#16a34a', padding: '4px 12px', borderRadius: '12px', fontWeight: '700' }}>Ready to Submit</span>
                            </div>

                            <div style={{ display: 'grid', gap: '20px' }}>
                                {[
                                    { title: 'Information Review', desc: 'Verify all data from Steps 1, 2, and 3 for accuracy.' },
                                    { title: 'Validation Check', desc: 'Ensure all required fields and documents are present.' },
                                    { title: 'Final submission', desc: 'Confirm and lock all details by clicking the Submit button.' },
                                    { title: 'Tracking ID', desc: 'Save the generated PCF tracking number for your records.' }
                                ].map((step, i) => (
                                    <div key={i} style={{
                                        display: 'flex',
                                        gap: '20px',
                                        alignItems: 'flex-start',
                                        padding: '16px',
                                        borderRadius: '12px',
                                        background: '#f8fafc',
                                        border: '1px solid #f1f5f9'
                                    }}>
                                        <div style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            width: '32px',
                                            height: '32px',
                                            flexShrink: 0,
                                            background: '#22c55e',
                                            color: '#fff',
                                            borderRadius: '50%',
                                            fontSize: '14px',
                                            fontWeight: '800'
                                        }}>
                                            {i + 1}
                                        </div>
                                        <div>
                                            <p style={{ fontSize: '15px', fontWeight: '800', color: '#111827', margin: '0 0 4px 0' }}>{step.title}</p>
                                            <p style={{ fontSize: '13.5px', color: '#64748b', margin: 0, lineHeight: '1.5' }}>{step.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <hr className={styles.divider} />

                    {/* Portfolio Constraint */}
                    <section id="portfolio-constraint" className={styles.section}>
                        <div style={{
                            background: '#eff6ff',
                            border: '1px solid #dbeafe',
                            borderRadius: '16px',
                            padding: '24px',
                            display: 'flex',
                            gap: '20px',
                            alignItems: 'flex-start'
                        }}>
                            <div style={{
                                width: '48px',
                                height: '48px',
                                background: '#dbeafe',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0
                            }}>
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 15v2m0-8V7m0-4L3 21h18L12 3z" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#1e40af' }}>Portfolio Constraint</h3>
                                    <span style={{ fontSize: '10px', background: '#2563eb', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontWeight: '700', textTransform: 'uppercase' }}>Mandatory</span>
                                </div>
                                <p style={{ fontSize: '14.5px', color: '#3b82f6', lineHeight: '1.6', margin: '0 0 16px 0', fontWeight: '500' }}>
                                    Only products listed in the <strong>Product Portfolio</strong> can be selected. If a product is missing, it must be added by an admin before a PCF request can be initiated.
                                </p>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }}></div>
                                        <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: '600' }}>Existing Portfolio Products</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#2563eb' }}></div>
                                        <span style={{ fontSize: '13px', color: '#1e40af', fontWeight: '600' }}>Admin Authorization Required</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Success Tips */}
                    <section id="tips" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Tips for Successful PCF Request Submission</h2>
                        <div className={styles.dqGrid} style={{ marginTop: '20px' }}>
                            <div className={styles.dqCard}>
                                <p className={styles.dqTitle}>1. Prepare Information</p>
                                <p className={styles.dqText}>Gather all product details, specs, and BOM data before starting.</p>
                            </div>
                            <div className={styles.dqCard}>
                                <p className={styles.dqTitle}>2. Portfolio First</p>
                                <p className={styles.dqText}>Verify that your product exists in the Product Portfolio before beginning.</p>
                            </div>
                            <div className={styles.dqCard}>
                                <p className={styles.dqTitle}>3. Organise Docs</p>
                                <p className={styles.dqText}>Have all supporting documents ready (technical specs, datasheets, etc.).</p>
                            </div>
                            <div className={styles.dqCard}>
                                <p className={styles.dqTitle}>4. BOM Format</p>
                                <p className={styles.dqText}>Use structured Excel/CSV format for smooth BOM import.</p>
                            </div>
                            <div className={styles.dqCard}>
                                <p className={styles.dqTitle}>5. Double Check</p>
                                <p className={styles.dqText}>Review all information in Step 4 before clicking Submit.</p>
                            </div>
                            <div className={styles.dqCard}>
                                <p className={styles.dqTitle}>6. Tracking ID</p>
                                <p className={styles.dqText}>After submission, save your PCF request tracking number.</p>
                            </div>
                        </div>
                    </section>

                    {/* Article Footer Nav */}
                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/article-add-product')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Previous: Add Product
                        </button>
                        <button className={styles.footerNavBtnNext} onClick={() => navigate('/article-pcf-workflow')}>
                            Next: Processing Workflow
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
