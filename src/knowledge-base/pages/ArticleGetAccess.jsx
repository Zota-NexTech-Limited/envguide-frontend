import { useNavigate } from 'react-router-dom'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'who-is-it-for', label: 'Who Is It For?' },
    { id: 'steps', label: 'Step-by-Step Guide' },
    { id: 'next-steps', label: 'What\'s Next?' },
]

export default function ArticleGetAccess() {
    const navigate = useNavigate()

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
                            <a key={s.id} href={`#${s.id}`} className={styles.tocLink}>
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
                        <span className={styles.breadCurrent}>How to Get Access</span>
                    </div>

                    {/* Article Header */}
                    <div className={styles.articleHeader}>
                        <span className={styles.articleTag}>PCF MANUALS</span>
                        <h1 className={styles.articleTitle}>How to Get Access to Enviguide</h1>
                        <p className={styles.articleSubtitle}>
                            A detailed walkthrough for manufacturers and clients on how to request platform access,
                            receive credentials, and complete your first secure login for PCF calculations.
                        </p>
                        <div className={styles.articleMeta}>
                            <span className={styles.metaItem}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="2" />
                                    <path d="M12 6v6l4 2" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                3 min read
                            </span>
                            <span className={styles.metaDot} />
                            <span className={styles.metaItem}>Updated Feb 2026</span>
                        </div>
                    </div>

                    <hr className={styles.divider} />

                    {/* Overview */}
                    <section id="overview" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Overview</h2>
                        <p className={styles.body}>
                            In order to maintain data integrity and security for Product Carbon Footprint (PCF) calculations,
                            access to the Enviguide platform is strictly managed. This guide outlines the formal process
                            for new manufacturers and clients to obtain their secure login credentials.
                        </p>
                    </section>

                    {/* Who is this for */}
                    <section id="who-is-it-for" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Who Is It For?</h2>
                        <div className={styles.calloutBlue}>
                            <div className={styles.calloutIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" />
                                    <path d="M12 16v-4M12 8h.01" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div>
                                <p className={styles.calloutTitle}>Target Audience</p>
                                <p className={styles.calloutText}>
                                    This manual is designed for <strong>new manufacturers</strong> or <strong>clients</strong> who
                                    intend to calculate environmental impact metrics for their materials and require unique
                                    credentials to access the centralized Enviguide dashboard.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Steps */}
                    <section id="steps" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step-by-Step Guide</h2>

                        <div className={styles.numberedSteps}>
                            {/* Step 1 */}
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>1</div>
                                <div className={styles.stepContent}>
                                    <p className={styles.stepTitle}>Contact Enviguide Team</p>
                                    <p className={styles.stepBody}>
                                        Reach out to our onboarding specialists to request platform access. Please ensure your
                                        request includes:
                                    </p>
                                    <ul className={styles.bullets} style={{ marginTop: '10px' }}>
                                        <li>Company legal name and registration details</li>
                                        <li>Primary contact person (Name & Corporate Email)</li>
                                        <li>Brief overview of materials or products to be assessed</li>
                                        <li>Any specific compliance standards (ISO, GHG Protocol, etc.)</li>
                                    </ul>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>2</div>
                                <div className={styles.stepContent}>
                                    <p className={styles.stepTitle}>Request Review & Account Setup</p>
                                    <p className={styles.stepBody}>
                                        Once submitted, the Enviguide team will verify your details and set up your
                                        dedicated workspace. Our data team will also map your initial material
                                        categories into the platform to prepare for your calculation requests.
                                    </p>
                                    <div className={styles.calloutGreen} style={{ margin: '14px 0 0' }}>
                                        <p className={styles.calloutText} style={{ fontSize: '13px' }}>
                                            ⏱️ <strong>Typical Timeline:</strong> Account provisioning is usually completed
                                            within <strong>1-2 business days</strong>.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>3</div>
                                <div className={styles.stepContent}>
                                    <p className={styles.stepTitle}>Receive Login Credentials</p>
                                    <p className={styles.stepBody}>
                                        You will receive a secure welcome email containing your registered email address,
                                        a temporary password, and a direct link to the platform.
                                    </p>
                                    <div className={styles.calloutBlue} style={{ margin: '14px 0 0' }}>
                                        <p className={styles.calloutText} style={{ fontSize: '13px' }}>
                                            🔗 <strong>Official Platform URL:</strong> <a href="https://Enviguide.nextechltd.in" target="_blank" rel="noopener noreferrer">Enviguide.nextechltd.in</a>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Step 4 */}
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>4</div>
                                <div className={styles.stepContent}>
                                    <p className={styles.stepTitle}>Complete First Login</p>
                                    <p className={styles.stepBody}>
                                        Navigate to the login URL and enter your credentials. Upon successful entry, you will be
                                        prompted to set a new, secure password to protect your company's sustainability data.
                                    </p>

                                    {/* Actual Login Screenshot */}
                                    <div className={styles.imageContainer}>
                                        <img
                                            src="/login-screenshot.png"
                                            alt="Enviguide Login Screen"
                                            className={styles.articleImage}
                                        />
                                        <p className={styles.imageCaption}>OFFICIAL Enviguide LOGIN PORTAL</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* What's Next */}
                    <section id="next-steps" className={styles.section}>
                        <h2 className={styles.sectionTitle}>What's Next?</h2>
                        <p className={styles.body}>
                            Once you are logged in, your organization is ready to start the PCF assessment process:
                        </p>
                        <div className={styles.nextGrid}>
                            <button className={styles.nextCard} onClick={() => navigate('/manuals-pcf')}>
                                <span className={styles.nextTag} style={{ color: '#22c55e', background: '#22c55e18' }}>MANUAL 02</span>
                                <p className={styles.nextTitle}>Building Your Product Portfolio</p>
                                <p className={styles.nextDesc}>Learn how to add and manage your complete list of assessed materials.</p>
                                <span className={styles.nextArrow} style={{ color: '#22c55e' }}>Read article →</span>
                            </button>
                            <button className={styles.nextCard} onClick={() => navigate('/manuals-pcf')}>
                                <span className={styles.nextTag} style={{ color: '#3b82f6', background: '#3b82f618' }}>MANUAL 03</span>
                                <p className={styles.nextTitle}>Creating PCF Requests</p>
                                <p className={styles.nextDesc}>Start your first Product Carbon Footprint calculation request workflow.</p>
                                <span className={styles.nextArrow} style={{ color: '#3b82f6' }}>Read article →</span>
                            </button>
                        </div>
                    </section>

                    {/* Article Footer Nav */}
                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/manuals-pcf')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Back to Manuals
                        </button>
                        <button className={styles.footerNavBtnNext} onClick={() => navigate('/manuals-pcf')}>
                            Next: Product Portfolio
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
