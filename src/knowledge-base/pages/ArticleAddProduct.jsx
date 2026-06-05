import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'precondition', label: 'Pre-Conditions' },
    { id: 'step1', label: 'Step 1: Login as Super Admin' },
    { id: 'step2', label: 'Step 2: Product Portfolio' },
    { id: 'step3', label: 'Step 3: Add Product' },
    { id: 'step4', label: 'Step 4: Product Information' },
    { id: 'step5', label: 'Step 5: Technical Specifications' },
    { id: 'step6', label: 'Step 6: Create Product' },
    { id: 'step7', label: 'Step 7: Verify in Manufacturer Account' },
    { id: 'summary', label: 'Quick Summary' },
]

export default function ArticleAddProduct() {
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

    const PRODUCT_INFO_FIELDS = [
        { name: 'Product Name', note: 'The full commercial name of the product' },
        { name: 'Category', note: 'Select the relevant product category' },
        { name: 'Sub Category', note: 'Further classify the product within the category' },
        { name: 'Description', note: 'Detailed product description for reference' },
        { name: 'Client / Manufacturer', note: 'Must match the exact manufacturer account — product will not appear otherwise' },
    ]

    const TECH_FIELDS = [
        { name: 'Weight (kg)', note: 'Product weight in kilograms' },
        { name: 'Dimensions', note: 'Length x Width x Height' },
        { name: 'Material', note: 'Primary material(s) used in manufacturing' },
        { name: 'Manufacturing Process', note: 'Process used to manufacture the product' },
        { name: 'Supplier', note: 'Select the linked supplier for this product' },
        { name: 'Part Number', note: 'Unique part identifier / SKU' },
    ]

    const SUMMARY_STEPS = [
        { icon: '🔑', step: 'Login as Super Admin' },
        { icon: '📦', step: 'Click Product Portfolio in the left sidebar' },
        { icon: '➕', step: 'Click + Add Product' },
        { icon: '📝', step: 'Fill Product Information (including correct Manufacturer)' },
        { icon: '⚙️', step: 'Fill Technical Specifications' },
        { icon: '✅', step: 'Click Create Product — Product Code auto-generated' },
        { icon: '🏭', step: 'Manufacturer can now see the product in their account' },
    ]

    return (
        <div className={styles.page}>

            {/* Top Bar */}
            <div className={styles.topBar}>
                <button className={styles.backBtn} onClick={() => navigate('/manuals-admin')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to Admin Manuals
                </button>
            </div>

            <div className={styles.layout}>

                {/* TOC */}
                <aside className={styles.toc}>
                    <p className={styles.tocLabel}>ON THIS PAGE</p>
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

                    {/* Breadcrumb */}
                    <div className={styles.breadcrumb}>
                        <button className={styles.breadLink} onClick={() => navigate('/help-centre')}>Help Center</button>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <button className={styles.breadLink} onClick={() => navigate('/manuals-admin')}>Admin Manuals</button>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span className={styles.breadCurrent}>Add a Product</span>
                    </div>

                    {/* Header */}
                    <div className={styles.articleHeader}>
                        <span className={styles.articleTag}>ADMIN MANUALS · DOCUMENT #04</span>
                        <h1 className={styles.articleTitle}>How to Add a Product in Enviguide</h1>
                        <p className={styles.articleSubtitle}>
                            A step-by-step guide for Super Admins on how to add a new product and make it
                            visible in the assigned Manufacturer account.
                        </p>
                        <div className={styles.articleMeta}>
                            <span className={styles.metaItem}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="2" />
                                    <path d="M12 6v6l4 2" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                7 min read
                            </span>
                            <span className={styles.metaDot} />
                            <span className={styles.metaItem}>Updated Feb 2026</span>
                            <span className={styles.metaDot} />
                            <span className={styles.metaItem}>Super Admin</span>
                        </div>
                    </div>

                    <hr className={styles.divider} />

                    {/* Overview */}
                    <section id="overview" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Overview</h2>
                        <p className={styles.body}>
                            This guide explains the exact steps a <strong>Super Admin</strong> must follow to add a product
                            so that it becomes visible in the Manufacturer account. Products are always created by the
                            Super Admin and then linked to the correct manufacturer.
                        </p>
                        <div className={styles.calloutGreen}>
                            <div className={styles.calloutIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <p className={styles.calloutTitle}>Super Admin Only</p>
                                <p className={styles.calloutText}>
                                    Only <strong>Super Admins</strong> can add new products. The product must be linked to
                                    the correct manufacturer during creation — otherwise it will not appear in their account.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Pre-Condition */}
                    <section id="precondition" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Pre-Conditions (Before Adding a Product)</h2>
                        <p className={styles.body}>Before adding a product, ensure the following steps are already completed:</p>
                        <div className={styles.flowSummaryBox}>
                            {[
                                { icon: '🏭', label: 'Manufacturer is created', doc: 'Doc #01', route: '/admin-article-create-manufacturer' },
                                { icon: '🔑', label: 'Manufacturer login credentials are shared', doc: 'Doc #02', route: '/admin-article-create-new-user' },
                                { icon: '🔐', label: 'Manufacturer authorization and permissions are assigned', doc: 'Doc #03', route: '/admin-article-manage-authorizations' },
                            ].map((pre, i) => (
                                <div key={i} className={styles.flowSummaryStep}>
                                    <div className={styles.flowSummaryNum}>{i + 1}</div>
                                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{pre.icon}</span>
                                    <p className={styles.flowSummaryText} style={{ margin: 0, flex: 1 }}>{pre.label}</p>
                                    <button
                                        onClick={() => navigate(pre.route)}
                                        style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)', color: '#22c55e', borderRadius: '12px', padding: '3px 10px', fontSize: '11px', fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap' }}
                                    >
                                        {pre.doc} →
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className={styles.calloutBlue}>
                            <div className={styles.calloutIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" />
                                    <line x1="12" y1="16" x2="12" y2="12" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div>
                                <p className={styles.calloutTitle}>If These Steps Are Not Completed</p>
                                <p className={styles.calloutText}>The product will not appear correctly in the manufacturer account. Always complete all three pre-conditions before proceeding.</p>
                            </div>
                        </div>
                    </section>

                    {/* Step 1 */}
                    <section id="step1" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 1: Login as Super Admin</h2>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>1</div><div className={styles.stepContent}><p className={styles.stepTitle}>Open the Enviguide platform in your web browser</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>2</div><div className={styles.stepContent}><p className={styles.stepTitle}>Enter your <strong>Super Admin</strong> credentials</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>3</div><div className={styles.stepContent}><p className={styles.stepTitle}>Click <strong>Login</strong></p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>4</div><div className={styles.stepContent}><p className={styles.stepTitle}>You will land on the <strong>Dashboard</strong></p></div></div>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/admin-add-product-step1-dashboard.png" alt="Enviguide dashboard after Super Admin login" className={styles.articleImage} />
                            <p className={styles.imageCaption}>STEP 1 — SUPER ADMIN DASHBOARD</p>
                        </div>
                    </section>

                    {/* Step 2 */}
                    <section id="step2" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 2: Click on "Product Portfolio"</h2>
                        <p className={styles.body}>From the left sidebar:</p>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>1</div><div className={styles.stepContent}><p className={styles.stepTitle}>Locate <strong>Product Portfolio</strong> in the left navigation sidebar</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>2</div><div className={styles.stepContent}><p className={styles.stepTitle}>Click on <strong>Product Portfolio</strong></p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>3</div><div className={styles.stepContent}><p className={styles.stepTitle}>You will be redirected to the <strong>All Products</strong> page</p></div></div>
                        </div>
                    </section>

                    {/* Step 3 */}
                    <section id="step3" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 3: Click on "+ Add Product"</h2>
                        <p className={styles.body}>On the top right side of the All Products page:</p>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>1</div><div className={styles.stepContent}><p className={styles.stepTitle}>Look for the <strong>+ Add Product</strong> button in the top-right corner</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>2</div><div className={styles.stepContent}><p className={styles.stepTitle}>Click <strong>+ Add Product</strong></p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>3</div><div className={styles.stepContent}><p className={styles.stepTitle}>This will open the <strong>Add New Product</strong> form page</p></div></div>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/admin-add-product-step3-add-btn.png" alt="All Products page with + Add Product button" className={styles.articleImage} />
                            <p className={styles.imageCaption}>STEP 3 — CLICK + ADD PRODUCT</p>
                        </div>
                    </section>

                    {/* Step 4 */}
                    <section id="step4" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 4: Fill Product Information</h2>
                        <p className={styles.body}>In the <strong>Product Information</strong> section, fill in all required fields:</p>
                        <div className={styles.articleTable}>
                            <table>
                                <thead><tr><th>Field</th><th>Required?</th><th>Notes</th></tr></thead>
                                <tbody>
                                    {PRODUCT_INFO_FIELDS.map((f, i) => (
                                        <tr key={i}>
                                            <td><strong>{f.name}</strong></td>
                                            <td><span className={styles.tagRequired}>Required</span></td>
                                            <td>{f.note}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className={styles.calloutGreen} style={{ borderColor: '#fbbf24', background: 'rgba(251,191,36,0.06)' }}>
                            <div className={styles.calloutIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <p className={styles.calloutTitle} style={{ color: '#92400e' }}>Critical: Select the Correct Manufacturer</p>
                                <p className={styles.calloutText} style={{ color: '#78350f' }}>
                                    In the <strong>Client / Manufacturer</strong> field, you <strong>must</strong> select the
                                    exact manufacturer account for this product. If wrong or not selected,
                                    the product will <strong>not appear</strong> in their account.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Step 5 */}
                    <section id="step5" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 5: Fill Technical Specifications</h2>
                        <p className={styles.body}>Enter the required technical details for the product. All fields are required:</p>
                        <div className={styles.articleTable}>
                            <table>
                                <thead><tr><th>Field</th><th>Required?</th><th>Notes</th></tr></thead>
                                <tbody>
                                    {TECH_FIELDS.map((f, i) => (
                                        <tr key={i}>
                                            <td><strong>{f.name}</strong></td>
                                            <td><span className={styles.tagRequired}>Required</span></td>
                                            <td>{f.note}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/admin-add-product-step5-tech-specs.png" alt="Technical Specifications form" className={styles.articleImage} />
                            <p className={styles.imageCaption}>STEP 5 — TECHNICAL SPECIFICATIONS FORM</p>
                        </div>
                    </section>

                    {/* Step 6 */}
                    <section id="step6" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 6: Click "Create Product"</h2>
                        <div className={styles.imageContainer}>
                            <img src="/admin-add-product-step6-create.png" alt="Create Product button" className={styles.articleImage} />
                            <p className={styles.imageCaption}>STEP 6 — CLICK CREATE PRODUCT TO SAVE</p>
                        </div>
                        <p className={styles.body}>After filling all details:</p>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>1</div><div className={styles.stepContent}><p className={styles.stepTitle}>Click the <strong>Create Product</strong> button</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>2</div><div className={styles.stepContent}><p className={styles.stepTitle}>The system validates all the information entered</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>3</div><div className={styles.stepContent}><p className={styles.stepTitle}>Product is saved to the system</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>4</div><div className={styles.stepContent}><p className={styles.stepTitle}>A <strong>Product Code</strong> is generated automatically</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>5</div><div className={styles.stepContent}><p className={styles.stepTitle}>The product appears in the <strong>All Products</strong> list ✅</p></div></div>
                        </div>
                    </section>

                    {/* Step 7 */}
                    <section id="step7" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 7: Verify in Manufacturer Account</h2>
                        <p className={styles.body}>To confirm the product was linked correctly:</p>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>1</div><div className={styles.stepContent}><p className={styles.stepTitle}>Login as the <strong>assigned Manufacturer</strong></p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>2</div><div className={styles.stepContent}><p className={styles.stepTitle}>Go to <strong>Product Portfolio</strong></p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>3</div><div className={styles.stepContent}><p className={styles.stepTitle}>The newly created product will now be visible ✅</p></div></div>
                        </div>
                        <div className={styles.twoColGrid} style={{ marginTop: '20px' }}>
                            <div className={styles.methodCard} style={{ borderColor: '#fecaca', background: 'rgba(254,202,202,0.1)' }}>
                                <div className={styles.methodCardHeader}>
                                    <span className={styles.methodCardBadge} style={{ color: '#ef4444', background: 'rgba(239,68,68,0.08)' }}>Before</span>
                                    <p className={styles.methodCardTitle} style={{ color: '#ef4444' }}>No products visible</p>
                                </div>
                                <p className={styles.body} style={{ fontSize: '13px', color: '#6b7280' }}>The Manufacturer's Product Portfolio shows an empty list before the Super Admin creates a product.</p>
                            </div>
                            <div className={styles.methodCard} style={{ borderColor: '#bbf7d0', background: 'rgba(187,247,208,0.1)' }}>
                                <div className={styles.methodCardHeader}>
                                    <span className={styles.methodCardBadge} style={{ color: '#22c55e', background: 'rgba(34,197,94,0.08)' }}>After</span>
                                    <p className={styles.methodCardTitle} style={{ color: '#22c55e' }}>Product now visible</p>
                                </div>
                                <p className={styles.body} style={{ fontSize: '13px', color: '#6b7280' }}>After the Super Admin creates and links the product, the Manufacturer can see and manage it immediately.</p>
                            </div>
                        </div>
                    </section>

                    {/* Summary */}
                    <section id="summary" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Quick Summary of the Flow</h2>
                        <p className={styles.body}>End-to-end process at a glance:</p>
                        <div className={styles.flowSummaryBox}>
                            {SUMMARY_STEPS.map((s, i) => (
                                <div key={i} className={styles.flowSummaryStep}>
                                    <div className={styles.flowSummaryNum}>{i + 1}</div>
                                    <span style={{ fontSize: '18px', flexShrink: 0 }}>{s.icon}</span>
                                    <p className={styles.flowSummaryText}>{s.step}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Footer Nav */}
                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/admin-article-manage-authorizations')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Previous: Manage Authorizations
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
