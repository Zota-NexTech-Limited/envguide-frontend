import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'step1', label: 'Step 1: Navigate to Manufacturer Management' },
    { id: 'step2', label: 'Step 2: Choose Your Method' },
    { id: 'step3', label: 'Step 3: Manufacturer Form Sections' },
    { id: 'step4', label: 'Step 4: Submit & Complete' },
    { id: 'summary', label: 'Summary' },
    { id: 'notes', label: 'Important Notes' },
]

export default function ArticleCreateManufacturer() {
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

            {/* ── Top Bar ── */}
            <div className={styles.topBar}>
                <button className={styles.backBtn} onClick={() => navigate('/manuals-admin')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to Admin Manuals
                </button>
            </div>

            {/* ── Main Layout ── */}
            <div className={styles.layout}>

                {/* ── TOC Sidebar ── */}
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

                {/* ── Article ── */}
                <article className={styles.article}>

                    {/* Breadcrumb */}
                    <div className={styles.breadcrumb}>
                        <button className={styles.breadLink} onClick={() => navigate('/help-centre')}>Help Center</button>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18l6-6-6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <button className={styles.breadLink} onClick={() => navigate('/manuals-admin')}>Admin Manuals</button>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18l6-6-6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={styles.breadCurrent}>Create a Manufacturer</span>
                    </div>

                    {/* Article Header */}
                    <div className={styles.articleHeader}>
                        <span className={styles.articleTag}>ADMIN MANUALS · DOCUMENT #01</span>
                        <h1 className={styles.articleTitle}>How to Create a Manufacturer?</h1>
                        <p className={styles.articleSubtitle}>
                            A complete guide for Super Admins on how to add a new manufacturer to the Enviguide platform.
                            Follow the step-by-step instructions below.
                        </p>
                        <div className={styles.articleMeta}>
                            <span className={styles.metaItem}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="2" />
                                    <path d="M12 6v6l4 2" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                8 min read
                            </span>
                            <span className={styles.metaDot} />
                            <span className={styles.metaItem}>Updated Feb 2026</span>
                            <span className={styles.metaDot} />
                            <span className={styles.metaItem}>Super Admin</span>
                        </div>
                    </div>

                    <hr className={styles.divider} />

                    {/* ── Overview ── */}
                    <section id="overview" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Complete Guide to Create a Manufacturer in Enviguide</h2>
                        <p className={styles.body}>
                            This comprehensive guide will help you understand how to add a new manufacturer to the
                            Enviguide platform as a Super Admin. Follow the step-by-step instructions below.
                        </p>
                        <div className={styles.calloutGreen}>
                            <div className={styles.calloutIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <p className={styles.calloutTitle}>Super Admin Access Required</p>
                                <p className={styles.calloutText}>
                                    Only users with the <strong>Super Admin</strong> role can create manufacturers in Enviguide.
                                    Make sure you are logged in with Super Admin credentials before following this guide.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ── Step 1 ── */}
                    <section id="step1" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 1: Navigate to Manufacturer Management</h2>

                        {/* ── Sub: Access Settings ── */}
                        <div className={styles.subSection}>
                            <h3 className={styles.subSectionTitle}>Access the Settings Page</h3>
                            <p className={styles.body}>
                                To create a manufacturer, you need to access the administrator settings:
                            </p>
                            <div className={styles.numberedSteps}>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>1</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Log in to your Enviguide dashboard as a <strong>Super Admin</strong></p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>2</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Locate the <strong>Settings</strong> option in the left sidebar</p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>3</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Click on <strong>Settings</strong> to open the settings menu</p>
                                    </div>
                                </div>
                            </div>

                            {/* Screenshot: Settings Sidebar */}
                            <div className={styles.imageContainer}>
                                <img
                                    src="/admin-create-mfr-step1-settings.png"
                                    alt="Enviguide Dashboard — Settings in left sidebar"
                                    className={styles.articleImage}
                                />
                                <p className={styles.imageCaption}>STEP 1 — SETTINGS IN THE LEFT SIDEBAR</p>
                            </div>
                        </div>

                        {/* ── Sub: Access Manage Users ── */}
                        <div className={styles.subSection}>
                            <h3 className={styles.subSectionTitle}>Access Manage Users</h3>
                            <p className={styles.body}>Once you are in the Settings section:</p>
                            <div className={styles.numberedSteps}>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>1</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>You will see the <strong>User Management</strong> section</p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>2</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Click on <strong>Manage Users</strong> to proceed</p>
                                    </div>
                                </div>
                            </div>

                            {/* Screenshot: Manage Users */}
                            <div className={styles.imageContainer}>
                                <img
                                    src="/admin-create-mfr-step1-manage-users.png"
                                    alt="Settings Page — User Management section with Manage Users button"
                                    className={styles.articleImage}
                                />
                                <p className={styles.imageCaption}>STEP 1 — USER MANAGEMENT SECTION IN SETTINGS</p>
                            </div>
                        </div>

                        {/* ── Sub: Navigate to Manufacturer Tab ── */}
                        <div className={styles.subSection}>
                            <h3 className={styles.subSectionTitle}>Navigate to Manufacturer Tab</h3>
                            <p className={styles.body}>
                                In the Manage Users page, you will see three tabs at the top:
                            </p>

                            {/* Tab pills visual */}
                            <div className={styles.tabPills}>
                                <div className={styles.tabPill}>
                                    <span>👥</span>
                                    <div>
                                        <p className={styles.tabPillName}>Enviguide Team</p>
                                        <p className={styles.tabPillDesc}>For team members</p>
                                    </div>
                                </div>
                                <div className={`${styles.tabPill} ${styles.tabPillActive}`}>
                                    <span>🏭</span>
                                    <div>
                                        <p className={styles.tabPillName}>Manufacturer</p>
                                        <p className={styles.tabPillDesc}>You are here</p>
                                    </div>
                                    <span className={styles.tabPillBadge}>← Click this</span>
                                </div>
                                <div className={styles.tabPill}>
                                    <span>📦</span>
                                    <div>
                                        <p className={styles.tabPillName}>Supplier</p>
                                        <p className={styles.tabPillDesc}>For suppliers</p>
                                    </div>
                                </div>
                            </div>

                            <p className={styles.body}>
                                Click on the <strong>Manufacturer</strong> tab to view the manufacturer management interface.
                            </p>

                            {/* Screenshot: Manufacturer Tab */}
                            <div className={styles.imageContainer}>
                                <img
                                    src="/admin-create-mfr-step1-manufacturer-tab.png"
                                    alt="Manage Users Page — Manufacturer tab selected"
                                    className={styles.articleImage}
                                />
                                <p className={styles.imageCaption}>STEP 1 — MANUFACTURER TAB IN MANAGE USERS</p>
                            </div>
                        </div>
                    </section>

                    {/* ══════════════════════════════════════════ */}
                    {/* ── Step 2 ── */}
                    <section id="step2" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 2: Choose Your Method to Create a Manufacturer</h2>
                        <p className={styles.body}>
                            On the Manufacturer tab, you will see <strong>two ways</strong> to add a new manufacturer:
                        </p>
                        <div className={styles.imageContainer}>
                            <img src="/admin-create-mfr-step2-overview.png" alt="Two methods to create a manufacturer" className={styles.articleImage} />
                            <p className={styles.imageCaption}>STEP 2 — TWO METHODS VISIBLE ON THE MANUFACTURER TAB</p>
                        </div>

                        {/* Method 1 */}
                        <div className={styles.subSection}>
                            <h3 className={styles.subSectionTitle}>Method 1: Manually Add Manufacturer</h3>
                            <p className={styles.body}>
                                Use this method when a manufacturer provides you with their details via email, and you want to
                                enter the information directly into the system.
                            </p>
                            <div className={styles.numberedSteps}>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>1</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Click on the <strong>+ Add Manufacturer</strong> button (located at the top right of the page)</p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>2</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>The <strong>"New Manufacturer Onboarding"</strong> form will open</p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>3</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Fill in all the required information (see Step 3 below for all form sections)</p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>4</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Click <strong>Create Manufacturer</strong> to complete the process</p>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.imageContainer}>
                                <img src="/admin-create-mfr-step2-method1-form.png" alt="Add Manufacturer button and New Manufacturer Onboarding form" className={styles.articleImage} />
                                <p className={styles.imageCaption}>METHOD 1 — ADD MANUFACTURER BUTTON & ONBOARDING FORM</p>
                            </div>
                        </div>

                        {/* Method 2 */}
                        <div className={styles.subSection}>
                            <h3 className={styles.subSectionTitle}>Method 2: Share Registration Link for Self-Registration</h3>
                            <p className={styles.body}>
                                Use this method when you want the manufacturer to fill in their own details.
                                A public registration link is provided for this purpose.
                            </p>
                            <div className={styles.numberedSteps}>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>1</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>In the Manufacturer tab, locate the <strong>Public Registration Link</strong> section</p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>2</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Click the <strong>Copy Link</strong> button to copy the registration URL</p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>3</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Send this link to the manufacturer via email</p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>4</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>The manufacturer opens the link and fills in their own details</p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>5</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Upon submission, their account is created automatically in the system</p>
                                    </div>
                                </div>
                            </div>

                            {/* Registration Link Box */}
                            <div className={styles.regLinkBox}>
                                <p className={styles.regLinkLabel}>PUBLIC REGISTRATION LINK</p>
                                <p className={styles.regLinkUrl}>https://Enviguide.nextechltd.in/manufacturer-onboarding</p>
                                <p className={styles.regLinkNote}>This link can be reused multiple times for different manufacturers.</p>
                            </div>

                            <div className={styles.imageContainer}>
                                <img src="/admin-create-mfr-step2-method2-link.png" alt="Public Registration Link section with Copy Link button" className={styles.articleImage} />
                                <p className={styles.imageCaption}>METHOD 2 — PUBLIC REGISTRATION LINK WITH COPY LINK BUTTON</p>
                            </div>
                        </div>
                    </section>

                    {/* ── Step 3 ── */}
                    <section id="step3" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 3: Manufacturer Form Sections</h2>
                        <p className={styles.body}>
                            Whether using Method 1 (Admin adds) or Method 2 (Self-registration), the manufacturer
                            information form contains the following sections:
                        </p>

                        {/* Section 1: Company Info */}
                        <div className={styles.subSection}>
                            <div className={styles.sectionBadgeRow}>
                                <span className={styles.sectionBadge}>SECTION 1</span>
                                <h3 className={styles.subSectionTitle} style={{ border: 'none', padding: 0, margin: 0 }}>Company Information</h3>
                            </div>
                            <div className={styles.imageContainer}>
                                <img src="/admin-create-mfr-step3-company-info.png" alt="Company Information form section" className={styles.articleImage} />
                                <p className={styles.imageCaption}>SECTION 1 — COMPANY INFORMATION FORM</p>
                            </div>
                            <p className={styles.body}>This section collects the basic details about the manufacturing company:</p>
                            <div className={styles.articleTable}>
                                <table>
                                    <thead><tr><th>Field Name</th><th>What We Are Asking</th><th>Required?</th><th>Notes</th></tr></thead>
                                    <tbody>
                                        <tr><td><strong>Company Name</strong></td><td>Full legal name of the manufacturing company</td><td><span className={styles.tagRequired}>Required</span></td><td>Enter the official registered name of the company</td></tr>
                                        <tr><td><strong>Email</strong></td><td>Official company email address</td><td><span className={styles.tagRequired}>Required</span></td><td>Used for company communications and login</td></tr>
                                        <tr><td><strong>Phone Number</strong></td><td>Primary contact phone number</td><td><span className={styles.tagRequired}>Required</span></td><td>Include country code if applicable</td></tr>
                                        <tr><td><strong>Alternate Phone</strong></td><td>Secondary phone number</td><td><span className={styles.tagOptional}>Optional</span></td><td>Useful for having a backup contact number</td></tr>
                                        <tr><td><strong>Website</strong></td><td>Company website URL</td><td><span className={styles.tagOptional}>Optional</span></td><td>Include complete URL starting with https://</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Section 2: Location */}
                        <div className={styles.subSection}>
                            <div className={styles.sectionBadgeRow}>
                                <span className={styles.sectionBadge}>SECTION 2</span>
                                <h3 className={styles.subSectionTitle} style={{ border: 'none', padding: 0, margin: 0 }}>Location Details</h3>
                            </div>
                            <div className={styles.imageContainer}>
                                <img src="/admin-create-mfr-step3-location.png" alt="Location Details form section" className={styles.articleImage} />
                                <p className={styles.imageCaption}>SECTION 2 — LOCATION DETAILS FORM</p>
                            </div>
                            <p className={styles.body}>This section captures the physical address of the company:</p>
                            <div className={styles.articleTable}>
                                <table>
                                    <thead><tr><th>Field Name</th><th>What We Are Asking</th><th>Required?</th><th>Notes</th></tr></thead>
                                    <tbody>
                                        <tr><td><strong>Address</strong></td><td>Complete street address of the company</td><td><span className={styles.tagRequired}>Required</span></td><td>Include street number, street name, and building number</td></tr>
                                        <tr><td><strong>City</strong></td><td>City or town name</td><td><span className={styles.tagRequired}>Required</span></td><td>Name of the city where the company is located</td></tr>
                                        <tr><td><strong>State</strong></td><td>State or province name</td><td><span className={styles.tagRequired}>Required</span></td><td>Name of the state or province</td></tr>
                                        <tr><td><strong>Country</strong></td><td>Country name</td><td><span className={styles.tagRequired}>Required</span></td><td>Country where the company operates</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Section 3: Factory Details */}
                        <div className={styles.subSection}>
                            <div className={styles.sectionBadgeRow}>
                                <span className={styles.sectionBadge}>SECTION 3</span>
                                <h3 className={styles.subSectionTitle} style={{ border: 'none', padding: 0, margin: 0 }}>Factory Details</h3>
                            </div>
                            <div className={styles.imageContainer}>
                                <img src="/admin-create-mfr-step3-factory.png" alt="Factory Details form section" className={styles.articleImage} />
                                <p className={styles.imageCaption}>SECTION 3 — FACTORY DETAILS FORM</p>
                            </div>
                            <p className={styles.body}>This section collects information about the manufacturing facility and capabilities:</p>
                            <div className={styles.articleTable}>
                                <table>
                                    <thead><tr><th>Field Name</th><th>What We Are Asking</th><th>Required?</th><th>Notes</th></tr></thead>
                                    <tbody>
                                        <tr><td><strong>Factory/Plant Name</strong></td><td>Name or identifier of the manufacturing facility</td><td><span className={styles.tagOptional}>Optional</span></td><td>Specify which plant if the company has multiple</td></tr>
                                        <tr><td><strong>Factory Address</strong></td><td>Complete address of the factory location</td><td><span className={styles.tagOptional}>Optional</span></td><td>If different from company address</td></tr>
                                        <tr><td><strong>Years of Operation</strong></td><td>How long the factory has been operating</td><td><span className={styles.tagOptional}>Optional</span></td><td>Enter number of years e.g., 10, 15, 20</td></tr>
                                        <tr><td><strong>Number of Employees</strong></td><td>Total workforce at the factory</td><td><span className={styles.tagOptional}>Optional</span></td><td>Total count of employees at this facility</td></tr>
                                        <tr><td><strong>Installed Capacity/Month</strong></td><td>Monthly production capacity</td><td><span className={styles.tagOptional}>Optional</span></td><td>Max units/volume that can be produced per month</td></tr>
                                        <tr><td><strong>Manufacturing Capabilities</strong></td><td>Types of manufacturing processes available</td><td><span className={styles.tagOptional}>Optional</span></td><td>Comma-separated: CNC Machining, Die Casting, Welding…</td></tr>
                                        <tr><td><strong>Key OEM Clients</strong></td><td>Major clients the manufacturer supplies to</td><td><span className={styles.tagOptional}>Optional</span></td><td>Comma-separated: Toyota, Honda, Ford, BMW…</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>

                        {/* Section 4: Contact Person */}
                        <div className={styles.subSection}>
                            <div className={styles.sectionBadgeRow}>
                                <span className={styles.sectionBadge}>SECTION 4</span>
                                <h3 className={styles.subSectionTitle} style={{ border: 'none', padding: 0, margin: 0 }}>Contact Person Information</h3>
                            </div>
                            <div className={styles.imageContainer}>
                                <img src="/admin-create-mfr-step3-contact.png" alt="Contact Person form section" className={styles.articleImage} />
                                <p className={styles.imageCaption}>SECTION 4 — CONTACT PERSON INFORMATION FORM</p>
                            </div>
                            <p className={styles.body}>This section captures the details of the primary contact person at the manufacturing company:</p>
                            <div className={styles.articleTable}>
                                <table>
                                    <thead><tr><th>Field Name</th><th>What We Are Asking</th><th>Required?</th><th>Notes</th></tr></thead>
                                    <tbody>
                                        <tr><td><strong>Name</strong></td><td>Full name of the contact person</td><td><span className={styles.tagOptional}>Optional</span></td><td>Primary contact for this manufacturer</td></tr>
                                        <tr><td><strong>Designation</strong></td><td>Job title or position</td><td><span className={styles.tagOptional}>Optional</span></td><td>E.g., Managing Director, Operations Manager</td></tr>
                                        <tr><td><strong>Email</strong></td><td>Personal email of the contact person</td><td><span className={styles.tagOptional}>Optional</span></td><td>Individual email for direct communication</td></tr>
                                        <tr><td><strong>Phone</strong></td><td>Direct phone number</td><td><span className={styles.tagOptional}>Optional</span></td><td>Direct mobile or office number</td></tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* ── Step 4 ── */}
                    <section id="step4" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 4: Submit and Complete</h2>
                        <div className={styles.imageContainer}>
                            <img src="/admin-create-mfr-step4-submit.png" alt="Create Manufacturer submit button" className={styles.articleImage} />
                            <p className={styles.imageCaption}>STEP 4 — SUBMIT / CREATE MANUFACTURER BUTTON</p>
                        </div>

                        <div className={styles.twoColGrid}>
                            {/* Method 1 */}
                            <div className={styles.methodCard}>
                                <div className={styles.methodCardHeader}>
                                    <span className={styles.methodCardBadge}>Method 1</span>
                                    <p className={styles.methodCardTitle}>Admin Adds</p>
                                </div>
                                <div className={styles.numberedSteps}>
                                    <div className={styles.numberedStep}><div className={styles.stepCircle}>1</div><div className={styles.stepContent}><p className={styles.stepTitle}>After filling all information, click <strong>Create Manufacturer</strong> at the bottom of the form</p></div></div>
                                    <div className={styles.numberedStep}><div className={styles.stepCircle}>2</div><div className={styles.stepContent}><p className={styles.stepTitle}>The system will validate the information</p></div></div>
                                    <div className={styles.numberedStep}><div className={styles.stepCircle}>3</div><div className={styles.stepContent}><p className={styles.stepTitle}>If all required fields are filled correctly, the manufacturer will be created</p></div></div>
                                    <div className={styles.numberedStep}><div className={styles.stepCircle}>4</div><div className={styles.stepContent}><p className={styles.stepTitle}>The manufacturer appears in the list on the Manufacturer tab</p></div></div>
                                    <div className={styles.numberedStep}><div className={styles.stepCircle}>5</div><div className={styles.stepContent}><p className={styles.stepTitle}>The manufacturer receives login credentials via email</p></div></div>
                                </div>
                            </div>
                            {/* Method 2 */}
                            <div className={styles.methodCard}>
                                <div className={styles.methodCardHeader}>
                                    <span className={styles.methodCardBadge}>Method 2</span>
                                    <p className={styles.methodCardTitle}>Self-Registration</p>
                                </div>
                                <div className={styles.numberedSteps}>
                                    <div className={styles.numberedStep}><div className={styles.stepCircle}>1</div><div className={styles.stepContent}><p className={styles.stepTitle}>Manufacturer fills in their own details via the shared registration link</p></div></div>
                                    <div className={styles.numberedStep}><div className={styles.stepCircle}>2</div><div className={styles.stepContent}><p className={styles.stepTitle}>After completing the form, they click <strong>Submit Registration</strong></p></div></div>
                                    <div className={styles.numberedStep}><div className={styles.stepCircle}>3</div><div className={styles.stepContent}><p className={styles.stepTitle}>The system validates the information</p></div></div>
                                    <div className={styles.numberedStep}><div className={styles.stepCircle}>4</div><div className={styles.stepContent}><p className={styles.stepTitle}>Upon successful submission, the manufacturer account is created automatically</p></div></div>
                                    <div className={styles.numberedStep}><div className={styles.stepCircle}>5</div><div className={styles.stepContent}><p className={styles.stepTitle}>They receive a confirmation email with login credentials</p></div></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Summary ── */}
                    <section id="summary" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Summary: Two Methods at a Glance</h2>
                        <div className={styles.articleTable}>
                            <table>
                                <thead>
                                    <tr><th>Aspect</th><th>Method 1: Admin Adds</th><th>Method 2: Self-Registration</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td><strong>Who Enters Data</strong></td><td>Super Admin</td><td>Manufacturer</td></tr>
                                    <tr><td><strong>How to Start</strong></td><td>Click "+ Add Manufacturer" button</td><td>Share "Copy Link" registration link</td></tr>
                                    <tr><td><strong>Communication</strong></td><td>Admin gets details via email</td><td>Manufacturer fills form directly</td></tr>
                                    <tr><td><strong>Time Requirement</strong></td><td>May be slower (depends on email)</td><td>Faster (asynchronous)</td></tr>
                                    <tr><td><strong>Data Accuracy</strong></td><td>Subject to admin interpretation</td><td>Higher (direct from source)</td></tr>
                                    <tr><td><strong>Best For</strong></td><td>Small number of registrations</td><td>Bulk or remote registrations</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* ── Important Notes ── */}
                    <section id="notes" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Important Notes</h2>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>🔴</div><div className={styles.stepContent}><p className={styles.stepTitle}>Required Fields</p><p className={styles.stepBody}>Fields marked with * must be filled for successful creation. The system will show an error if any required field is empty.</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>📋</div><div className={styles.stepContent}><p className={styles.stepTitle}>Optional Fields</p><p className={styles.stepBody}>All factory and contact details can be added later if needed. They are not required to create the manufacturer account.</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>🔗</div><div className={styles.stepContent}><p className={styles.stepTitle}>Registration Link</p><p className={styles.stepBody}>The Public Registration Link can be used unlimited times for different manufacturers.</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>📧</div><div className={styles.stepContent}><p className={styles.stepTitle}>Email Format</p><p className={styles.stepBody}>Ensure emails are in valid format (e.g., company@example.com). Invalid formats will be rejected by the system.</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>📞</div><div className={styles.stepContent}><p className={styles.stepTitle}>Phone Format</p><p className={styles.stepBody}>Include country codes for international numbers (e.g., +91 for India, +1 for USA).</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>📝</div><div className={styles.stepContent}><p className={styles.stepTitle}>Comma-Separated Values</p><p className={styles.stepBody}>For Manufacturing Capabilities and Key OEM Clients, separate multiple items with commas (e.g., Toyota, Honda, Ford).</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>🔑</div><div className={styles.stepContent}><p className={styles.stepTitle}>Account Access</p><p className={styles.stepBody}>Once created, manufacturers can log in with their email and the password set during registration.</p></div></div>
                        </div>
                    </section>

                    {/* ── Footer Nav ── */}
                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/manuals-admin')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Back to Admin Manuals
                        </button>
                        <button className={styles.footerNavBtnNext} onClick={() => navigate('/manuals-admin')}>
                            Next: Create a New User
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
