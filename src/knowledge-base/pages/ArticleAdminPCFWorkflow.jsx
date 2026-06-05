import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'background', label: 'Background & Prerequisites' },
    { id: 'step1', label: 'Step 1: Access PCF Request' },
    { id: 'step2', label: 'Step 2: BOM Verification' },
    { id: 'step3', label: 'Step 3: Data Collection (Tasks)' },
    { id: 'step4', label: 'Step 4: Data Quality Rating (DQR)' },
    { id: 'step5', label: 'Step 5: PCF Calculation' },
    { id: 'step6', label: 'Step 6: Result Validation' },
    { id: 'final', label: 'Final Completion' },
    { id: 'summary', label: 'Process Summary' },
]

export default function ArticleAdminPCFWorkflow() {
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

    const DQR_SECTIONS = [
        { id: '1', title: 'Product Details', items: ['PCF Methodology', 'PCF Report Files', 'Production Site Details', 'Products Manufactured'] },
        { id: '2', title: 'Scope 1 Emissions', items: ['Stationary Combustion', 'Mobile Combustion'] },
        { id: '3', title: 'Scope 2 Emissions', items: ['Purchased Energy', 'Supporting Documents', 'Energy Intensity', 'Process-Specific Usage'] },
        { id: '4', title: 'Quality Control', items: ['Equipment Usage', 'Energy Consumption', 'Process Flow', 'Defect/Rework Rates'] },
        { id: '5', title: 'IT for Production', items: ['IT Automation', 'Server Usage'] },
        { id: '6', title: 'Material Composition', items: ['Raw Material Used in Component Manufacturing'] },
        { id: '7', title: 'Scope 3 Emissions', items: ['Treatment Support Info', 'Production & Packaging Waste'] },
        { id: '8', title: 'Packaging', items: ['PIR/PCR Material %', 'Packaging Material & Weight'] },
        { id: '9', title: 'Transport', items: ['Raw Material Transport CO₂', 'Delivery Point Location'] },
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
                    <p className={styles.tocLabel}>WORKFLOW STAGES</p>
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
                        <span className={styles.breadCurrent}>PCF Admin Workflow</span>
                    </div>

                    <div className={styles.articleHeader}>
                        <span className={styles.articleTag}>ADMIN MANUALS · DOCUMENT #05</span>
                        <h1 className={styles.articleTitle}>Super Admin Guide: After Manufacturer PCF Submission</h1>
                        <p className={styles.articleSubtitle}>
                            A complete operational guide for Super Admins on managing the lifecycle of a Product Carbon Footprint
                            request from submission to final validation.
                        </p>
                    </div>

                    <hr className={styles.divider} />

                    {/* Overview */}
                    <section id="overview" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Overview</h2>
                        <p className={styles.body}>
                            This guide explains the critical actions a <strong>Super Admin</strong> must take once a manufacturer has
                            submitted their initial PCF request. You will manage BOM verification, data collection tasks,
                            data quality assessments, and the final calculation trigger.
                        </p>
                    </section>

                    {/* Background */}
                    <section id="background" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Background & Prerequisites</h2>
                        <p className={styles.body}>Ensure the following milestones have been hit before starting this workflow:</p>
                        <div className={styles.flowSteps}>
                            <div className={styles.flowStep}><div className={styles.flowCircle}>1</div><p className={styles.flowLabel}>Product Created by Admin</p></div>
                            <div className={styles.flowArrow}>→</div>
                            <div className={styles.flowStep}><div className={styles.flowCircle}>2</div><p className={styles.flowLabel}>Manufacturer Submits PCF Request</p></div>
                        </div>
                        <div className={styles.calloutBlue} style={{ marginTop: '20px' }}>
                            <div className={styles.calloutIcon}>🛡️</div>
                            <div>
                                <p className={styles.calloutTitle}>Starting Status</p>
                                <p className={styles.calloutText}>
                                    The request status should show: <strong>✅ PCF Request Created</strong> and <strong>✅ PCF Request Submitted</strong>.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Step 1 */}
                    <section id="step1" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 1: Access and Open the PCF Request</h2>
                        <p className={styles.body}>Navigate to the PCF Management portal:</p>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>1</div><div className={styles.stepContent}><p className={styles.stepTitle}>Start from the <strong>Dashboard</strong> and click <strong>PCF Request</strong> in the sidebar</p></div></div>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/admin-pcf-step1-dashboard.png" alt="Dashboard PCF Request link" className={styles.articleImage} />
                            <p className={styles.imageCaption}>1.1 ACCESSING PCF REQUESTS FROM SIDEBAR</p>
                        </div>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>2</div><div className={styles.stepContent}><p className={styles.stepTitle}>Identify the correct request number and click <strong>View</strong></p></div></div>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/admin-pcf-step1-select-request.png" alt="PCF Request List" className={styles.articleImage} />
                            <p className={styles.imageCaption}>1.2 SELECTING A REQUEST TO EXAMINE</p>
                        </div>
                    </section>

                    {/* Step 2 */}
                    <section id="step2" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 2: Analysis & BOM Verification</h2>
                        <p className={styles.body}>Enter the Request Details page and verify the integrity of the submission.</p>
                        <div className={styles.imageContainer}>
                            <img src="/admin-pcf-step2-details.png" alt="PCF details interface" className={styles.articleImage} />
                            <p className={styles.imageCaption}>2.1 PCF REQUEST DETAILS INTERFACE</p>
                        </div>

                        <h3 className={styles.subSectionTitle}>2.1 Check Workflow Status</h3>
                        <p className={styles.body}>Verify the tracker at the top shows: <strong>🔄 BOM Verified - In Progress</strong>.</p>
                        <div className={styles.imageContainer}>
                            <img src="/admin-pcf-step2-bom-verified.png" alt="BOM stage tracker" className={styles.articleImage} />
                            <p className={styles.imageCaption}>2.2 TRACKER SHOWING BOM VERIFICATION IN PROGRESS</p>
                        </div>

                        <h3 className={styles.subSectionTitle}>2.2 Bill of Materials (BOM) Analysis</h3>
                        <div className={styles.methodCard}>
                            <div className={styles.methodCardHeader}><span className={styles.methodCardBadge} style={{ background: '#3b82f6', color: '#fff' }}>Admin Checklist</span></div>
                            <ul className={styles.body} style={{ paddingLeft: '20px' }}>
                                <li><strong>Component Accuracy:</strong> Are any required parts missing?</li>
                                <li><strong>Validity:</strong> Do material numbers match components?</li>
                                <li><strong>Quantity & Weight:</strong> Are values realistic and mathematically consistent?</li>
                                <li><strong>Duplicates:</strong> Ensure no repeated entries.</li>
                            </ul>
                        </div>

                        <h3 className={styles.subSectionTitle}>2.3 Final BOM Decision</h3>
                        <p className={styles.body}>Scroll to the bottom to <strong>Approve</strong> or <strong>Reject</strong> (with comments).</p>
                    </section>

                    {/* Step 3 */}
                    <section id="step3" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 3: Data Collection (Create Tasks)</h2>
                        <p className={styles.body}>Once BOM is approved, the tracker moves to <strong>🔄 Data Collection</strong>.</p>
                        <div className={styles.imageContainer}>
                            <img src="/admin-pcf-step3-task-mgmt.png" alt="Task management navigation" className={styles.articleImage} />
                            <p className={styles.imageCaption}>3.1 NAVIGATING TO TASK MANAGEMENT</p>
                        </div>

                        <div className={styles.calloutGreen}>
                            <div className={styles.calloutIcon}>📝</div>
                            <div>
                                <p className={styles.calloutTitle}>Creating the Task</p>
                                <p className={styles.calloutText}>
                                    You must link the task to the specific <strong>PCF Request</strong> in the "Additional Details" section
                                    to ensure the workflow maps correctly.
                                </p>
                            </div>
                        </div>

                        <div className={styles.imageContainer}>
                            <img src="/admin-pcf-step3-task-details.png" alt="Create task form" className={styles.articleImage} />
                            <p className={styles.imageCaption}>3.2 FILLING TASK INFORMATION & PCF LINKING</p>
                        </div>

                        <div className={styles.imageContainer}>
                            <img src="/admin-pcf-step3-completed.png" alt="Data collection phase completed" className={styles.articleImage} />
                            <p className={styles.imageCaption}>3.3 DATA COLLECTION STAGE NOW COMPLETED</p>
                        </div>
                    </section>

                    {/* Step 4 */}
                    <section id="step4" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 4: Data Quality Rating (DQR)</h2>
                        <p className={styles.body}>This critical stage evaluates data reliability across multiple sectors.</p>
                        <div className={styles.imageContainer}>
                            <img src="/admin-pcf-step4-dqr-interface.png" alt="DQR interface overview" className={styles.articleImage} />
                            <p className={styles.imageCaption}>4.1 DATA QUALITY ASSESSMENT INTERFACE</p>
                        </div>

                        <h3 className={styles.subSectionTitle}>4.1 Multi-Point Evaluation</h3>
                        <div className={styles.rolesGrid}>
                            {DQR_SECTIONS.map(sec => (
                                <div key={sec.id} className={styles.roleCard} style={{ display: 'block' }}>
                                    <p className={styles.roleName} style={{ marginBottom: '8px', color: '#16a34a' }}>Section {sec.id}: {sec.title}</p>
                                    <p className={styles.body} style={{ fontSize: '11px', lineHeight: 1.4 }}>{sec.items.join(', ')}</p>
                                </div>
                            ))}
                        </div>

                        <h3 className={styles.subSectionTitle}>4.2 The 5 Evaluation Criteria (TeR, TiR, GR, PDS, C)</h3>
                        <p className={styles.body}>Each data point must be assigned ratings for Technology, Time, Geography, Source type, and Completeness.</p>
                        <div className={styles.imageContainer}>
                            <img src="/admin-pcf-step4-dqr-save.png" alt="Saving DQR progress" className={styles.articleImage} />
                            <p className={styles.imageCaption}>4.2 SAVING VERIFIED DQR VALUATIONS</p>
                        </div>
                    </section>

                    {/* Step 5 */}
                    <section id="step5" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 5: PCF Calculation</h2>
                        <p className={styles.body}>Once DQR is confirmed, the workflow moves to <strong>🔄 PCF Calculation</strong>.</p>
                        <div className={styles.imageContainer}>
                            <img src="/admin-pcf-step5-calc-stage.png" alt="Calculation stage tracker" className={styles.articleImage} />
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/admin-pcf-step5-calc-card.png" alt="Calculation card" className={styles.articleImage} />
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/admin-pcf-step5-calc-start.png" alt="Start calculation button" className={styles.articleImage} />
                            <p className={styles.imageCaption}>CLICK "START PCF CALCULATION" TO GENERATE EMISSION RESULTS</p>
                        </div>
                    </section>

                    {/* Step 6 */}
                    <section id="step6" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 6: Result Validation & Final Submission</h2>
                        <p className={styles.body}>Review component-level spikes, totals, and unit consistency (kg CO₂e).</p>
                        <div className={styles.imageContainer}>
                            <img src="/admin-pcf-step6-submit.png" alt="Final submission button" className={styles.articleImage} />
                            <p className={styles.imageCaption}>FINAL VALIDATION: REVIEWING TOTAL EMISSION BREAKDOWN</p>
                        </div>
                    </section>

                    {/* Final */}
                    <section id="final" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Final Stage - PCF Request Completed</h2>
                        <div className={styles.imageContainer}>
                            <img src="/admin-pcf-final-completed.png" alt="Complete workflow stages green" className={styles.articleImage} />
                            <p className={styles.imageCaption}>LIFECYCLE CLOSED: ALL STAGES FINALIZED ✅</p>
                        </div>
                    </section>

                    {/* Summary */}
                    <section id="summary" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Complete Workflow Summary</h2>
                        <div className={styles.flowSummaryBox}>
                            {[
                                'BOM Verification — Review and Approve component list',
                                'Data Collection — Create Task for supplier questionnaires',
                                'DQR Evaluation — Rate Technology, Time, and Geography',
                                'Calculation — Trigger automated system emissions computation',
                                'Result Validation — Audit totals and breakdown before final lock',
                                'Submission — All stages completed and workflow closed',
                            ].map((step, i) => (
                                <div key={i} className={styles.flowSummaryStep}>
                                    <div className={styles.flowSummaryNum}>{i + 1}</div>
                                    <p className={styles.flowSummaryText}>{step}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Footer Nav */}
                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/admin-article-add-product')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Previous: Add a Product
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
