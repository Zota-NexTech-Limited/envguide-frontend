import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'context', label: 'Understanding the Context' },
    { id: 'step1', label: 'Step 1: Navigate to Create New User' },
    { id: 'step2', label: 'Step 2: The Create New User Form' },
    { id: 'step3', label: 'Step 3: Security & Password Options' },
    { id: 'step4', label: 'Step 4: Password Strategy Comparison' },
    { id: 'step6', label: 'Step 5: Complete User Creation' },
    { id: 'step7', label: 'Step 6: Providing Access' },
    { id: 'notes', label: 'Important Notes' },
    { id: 'summary', label: 'Summary' },
]

export default function ArticleCreateNewUser() {
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
                        <span className={styles.breadCurrent}>Create a New User</span>
                    </div>

                    {/* Article Header */}
                    <div className={styles.articleHeader}>
                        <span className={styles.articleTag}>ADMIN MANUALS · DOCUMENT #02</span>
                        <h1 className={styles.articleTitle}>How to Create a New User?</h1>
                        <p className={styles.articleSubtitle}>
                            A complete guide for Super Admins on how to assign user login credentials to a
                            manufacturer that has already been created in the Enviguide platform.
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
                            <span className={styles.metaDot} />
                            <span className={styles.metaItem}>Super Admin</span>
                        </div>
                    </div>

                    <hr className={styles.divider} />

                    {/* ── Overview ── */}
                    <section id="overview" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Complete Guide to Create a New User for Manufacturer</h2>
                        <p className={styles.body}>
                            This guide explains how to assign user credentials to a manufacturer that has already been
                            created in the Enviguide platform. After creating a manufacturer, you need to create user
                            login credentials so they can access the system.
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
                                    Only users with the <strong>Super Admin</strong> role can create new users in Enviguide.
                                    Make sure you are logged in with Super Admin credentials before following this guide.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ── Context ── */}
                    <section id="context" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Understanding the Context</h2>
                        <p className={styles.body}>
                            When you create a manufacturer using the <strong>"How to Create a Manufacturer"</strong> guide,
                            you are adding the company details but <strong>NOT</strong> creating user login credentials.
                            The manufacturer company profile is created, but without login credentials, they cannot
                            access the platform. This guide explains how to create those login credentials.
                        </p>

                        {/* Two-step flow visual */}
                        <div className={styles.flowSteps}>
                            <div className={styles.flowStep}>
                                <div className={styles.flowCircle} style={{ background: '#22c55e' }}>1</div>
                                <div>
                                    <p className={styles.flowLabel}>Create Manufacturer</p>
                                    <p className={styles.flowSub}>Company profile only — no login yet</p>
                                </div>
                            </div>
                            <div className={styles.flowArrow}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M5 12h14M12 5l7 7-7 7" stroke="#d1d5db" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div className={styles.flowStep}>
                                <div className={styles.flowCircle} style={{ background: '#22c55e' }}>2</div>
                                <div>
                                    <p className={styles.flowLabel}>Create New User</p>
                                    <p className={styles.flowSub}>Assigns login credentials — platform access granted</p>
                                </div>
                            </div>
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
                                <p className={styles.calloutTitle}>Before You Start</p>
                                <p className={styles.calloutText}>
                                    Make sure you have already created the manufacturer company profile. If not, refer to
                                    <button
                                        onClick={() => navigate('/admin-article-create-manufacturer')}
                                        style={{ background: 'none', border: 'none', color: '#3b82f6', fontWeight: '700', cursor: 'pointer', padding: '0 4px' }}
                                    >
                                        Document #01 — How to Create a Manufacturer
                                    </button>
                                    before proceeding.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ── Step 1 ── */}
                    <section id="step1" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 1: Navigate to Create New User</h2>

                        {/* Sub: Access Dashboard */}
                        <div className={styles.subSection}>
                            <h3 className={styles.subSectionTitle}>Access the Enviguide Dashboard</h3>
                            <p className={styles.body}>To create a new user for a manufacturer:</p>
                            <div className={styles.numberedSteps}>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>1</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Open the Enviguide dashboard in your web browser</p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>2</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Ensure you are logged in as a <strong>Super Admin</strong></p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>3</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>You will see the main dashboard with various menu options</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sub: Access Settings */}
                        <div className={styles.subSection}>
                            <h3 className={styles.subSectionTitle}>Access the Settings Menu</h3>
                            <p className={styles.body}>From the dashboard:</p>
                            <div className={styles.numberedSteps}>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>1</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Look at the left sidebar for the <strong>Settings</strong> option</p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>2</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Click on <strong>Settings</strong> to open the settings page</p>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.imageContainer}>
                                <img
                                    src="/admin-create-user-step1-settings.png"
                                    alt="Enviguide Dashboard — Settings option in the left sidebar"
                                    className={styles.articleImage}
                                />
                                <p className={styles.imageCaption}>STEP 1 — SETTINGS OPTION IN THE LEFT SIDEBAR</p>
                            </div>
                        </div>

                        {/* Sub: User Management */}
                        <div className={styles.subSection}>
                            <h3 className={styles.subSectionTitle}>Navigate to User Management Section</h3>
                            <p className={styles.body}>Once in Settings:</p>
                            <div className={styles.numberedSteps}>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>1</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>You will see various options in the Settings page</p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>2</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Locate the <strong>User Management</strong> section</p>
                                    </div>
                                </div>
                                <div className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>3</div>
                                    <div className={styles.stepContent}>
                                        <p className={styles.stepTitle}>Under User Management, find and click on <strong>Create New User</strong></p>
                                    </div>
                                </div>
                            </div>
                            <div className={styles.imageContainer}>
                                <img
                                    src="/admin-create-user-step1-user-mgmt.png"
                                    alt="Settings page — User Management section with Create New User option"
                                    className={styles.articleImage}
                                />
                                <p className={styles.imageCaption}>STEP 1 — USER MANAGEMENT → CREATE NEW USER</p>
                            </div>
                        </div>
                    </section>

                    {/* ── Step 2 ── */}
                    <section id="step2" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 2: The Create New User Form</h2>
                        <p className={styles.body}>
                            When you click on <strong>"Create New User"</strong>, a form will open with several fields to fill.
                        </p>
                        <div className={styles.imageContainer}>
                            <img
                                src="/admin-create-user-step2-form.png"
                                alt="Create New User form with all fields"
                                className={styles.articleImage}
                            />
                            <p className={styles.imageCaption}>STEP 2 — CREATE NEW USER FORM</p>
                        </div>
                    </section>


                    {/* ── Form Sections inside Step 2 ── */}

                    {/* Section 1: Basic User Info */}
                    <div className={styles.subSection} style={{ marginTop: '28px' }}>
                        <div className={styles.sectionBadgeRow}>
                            <span className={styles.sectionBadge}>SECTION 1</span>
                            <h3 className={styles.subSectionTitle} style={{ border: 'none', padding: 0, margin: 0 }}>Basic User Information</h3>
                        </div>
                        <p className={styles.body}>This section collects the essential login information for the new user:</p>
                        <div className={styles.articleTable}>
                            <table>
                                <thead><tr><th>Field Name</th><th>What We Are Asking</th><th>Required?</th><th>Notes</th></tr></thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Username</strong></td>
                                        <td>Unique login username for the user</td>
                                        <td><span className={styles.tagRequired}>Required</span></td>
                                        <td>Must be unique in the system. This is what the user enters to log in (e.g., manufacturer_user_001, john.doe)</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Email</strong></td>
                                        <td>Email address matching the manufacturer company email</td>
                                        <td><span className={styles.tagRequired}>Required</span></td>
                                        <td>⚠️ Must be the <strong>same email</strong> used when creating the manufacturer company — this links the user to the correct manufacturer</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Mobile Number</strong></td>
                                        <td>Contact phone number of the user</td>
                                        <td><span className={styles.tagRequired}>Required</span></td>
                                        <td>Include country code if applicable (e.g., +91 for India). Used for contact and account recovery</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Section 2: Role & Department */}
                    <div className={styles.subSection}>
                        <div className={styles.sectionBadgeRow}>
                            <span className={styles.sectionBadge}>SECTION 2</span>
                            <h3 className={styles.subSectionTitle} style={{ border: 'none', padding: 0, margin: 0 }}>Role and Department Selection</h3>
                        </div>
                        <p className={styles.body}>This section determines what type of access and permissions the user will have:</p>
                        <div className={styles.articleTable}>
                            <table>
                                <thead><tr><th>Field Name</th><th>What We Are Asking</th><th>Required?</th><th>Notes</th></tr></thead>
                                <tbody>
                                    <tr>
                                        <td><strong>Role</strong></td>
                                        <td>What role/position will this user have in the system?</td>
                                        <td><span className={styles.tagRequired}>Required</span></td>
                                        <td>For a manufacturer user, select <strong>"Manufacturer"</strong> from the dropdown. The role determines what features and data the user can access</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Department</strong></td>
                                        <td>Which department does this user belong to?</td>
                                        <td><span className={styles.tagRequired}>Required</span></td>
                                        <td>For a manufacturer user, select <strong>"Manufacturer"</strong> from the Department dropdown. This ensures they only see manufacturer-related information</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className={styles.calloutGreen}>
                            <div className={styles.calloutIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <p className={styles.calloutTitle}>Important</p>
                                <p className={styles.calloutText}>
                                    When creating a user for a manufacturer, <strong>BOTH</strong> Role and Department should be set to <strong>"Manufacturer"</strong>. Do not use other options unless specifically instructed.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Step 3: Security Settings ── */}
                    <section id="step3" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 3: Security Settings and Password Options</h2>
                        <p className={styles.body}>
                            This is the most important section as it determines how the user will access the system
                            and manage their password. When you reach the Security section, you will see <strong>two important password options</strong>.
                        </p>


                        {/* Two password option cards */}
                        <div className={styles.twoColGrid}>
                            {/* Option 1 */}
                            <div className={styles.methodCard}>
                                <div className={styles.methodCardHeader}>
                                    <span className={styles.methodCardBadge}>Option 1</span>
                                    <p className={styles.methodCardTitle}>Password Never Expires</p>
                                </div>
                                <p className={styles.body} style={{ fontSize: '13px', marginBottom: '12px' }}>
                                    <strong>What this does:</strong>
                                </p>
                                <div className={styles.numberedSteps}>
                                    <div className={styles.numberedStep}><div style={{ fontSize: '16px', width: '22px', flexShrink: 0 }}>🔒</div><div className={styles.stepContent}><p className={styles.stepTitle}>The password you set will <strong>never expire</strong></p></div></div>
                                    <div className={styles.numberedStep}><div style={{ fontSize: '16px', width: '22px', flexShrink: 0 }}>🚫</div><div className={styles.stepContent}><p className={styles.stepTitle}>The user <strong>CANNOT</strong> change their password themselves</p></div></div>
                                    <div className={styles.numberedStep}><div style={{ fontSize: '16px', width: '22px', flexShrink: 0 }}>🔑</div><div className={styles.stepContent}><p className={styles.stepTitle}>Only a Super Admin can change the password if needed</p></div></div>
                                </div>
                                <p className={styles.body} style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px' }}>
                                    Best for: Administrative control, ensuring consistent access
                                </p>
                            </div>
                            {/* Option 2 */}
                            <div className={styles.methodCard}>
                                <div className={styles.methodCardHeader}>
                                    <span className={styles.methodCardBadge}>Option 2</span>
                                    <p className={styles.methodCardTitle}>Change Password at Next Login</p>
                                </div>
                                <p className={styles.body} style={{ fontSize: '13px', marginBottom: '12px' }}>
                                    <strong>What this does:</strong>
                                </p>
                                <div className={styles.numberedSteps}>
                                    <div className={styles.numberedStep}><div style={{ fontSize: '16px', width: '22px', flexShrink: 0 }}>🔐</div><div className={styles.stepContent}><p className={styles.stepTitle}>You provide an <strong>initial temporary password</strong></p></div></div>
                                    <div className={styles.numberedStep}><div style={{ fontSize: '16px', width: '22px', flexShrink: 0 }}>🔄</div><div className={styles.stepContent}><p className={styles.stepTitle}>User is <strong>required</strong> to change password on first login</p></div></div>
                                    <div className={styles.numberedStep}><div style={{ fontSize: '16px', width: '22px', flexShrink: 0 }}>✅</div><div className={styles.stepContent}><p className={styles.stepTitle}>User can manage their own password going forward</p></div></div>
                                </div>
                                <p className={styles.body} style={{ fontSize: '12px', color: '#9ca3af', marginTop: '12px' }}>
                                    Best for: Better security, user autonomy, professional onboarding
                                </p>
                            </div>
                        </div>

                        {/* Password fields table */}
                        <div className={styles.subSection} style={{ marginTop: '28px' }}>
                            <h3 className={styles.subSectionTitle}>Password Fields</h3>
                            <div className={styles.articleTable}>
                                <table>
                                    <thead><tr><th>Field Name</th><th>What We Are Asking</th><th>Required?</th><th>Notes</th></tr></thead>
                                    <tbody>
                                        <tr>
                                            <td><strong>Set Password</strong></td>
                                            <td>Create a password for this user</td>
                                            <td><span className={styles.tagRequired}>Required</span></td>
                                            <td>Use a strong password with uppercase, lowercase, numbers, and special characters. Example: Manuf@123*456</td>
                                        </tr>
                                        <tr>
                                            <td><strong>Confirm Password</strong></td>
                                            <td>Re-enter the password to confirm</td>
                                            <td><span className={styles.tagRequired}>Required</span></td>
                                            <td>Must exactly match the password entered above to ensure no typos</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    {/* ── Step 4: Password Comparison ── */}
                    <section id="step4" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 4: Choose Your Password Strategy</h2>
                        <p className={styles.body}>Comparison of both password options to help you decide which to use:</p>
                        <div className={styles.articleTable}>
                            <table>
                                <thead>
                                    <tr><th>Aspect</th><th>Password Never Expires</th><th>Change Password at Next Login</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td><strong>Initial Password</strong></td><td>Set by Admin (Permanent)</td><td>Set by Admin (Temporary)</td></tr>
                                    <tr><td><strong>User Can Change Password</strong></td><td>NO — Only Admin can change it</td><td>YES — Required on first login</td></tr>
                                    <tr><td><strong>Security Level</strong></td><td>Lower (Admin controls)</td><td>Higher (User's own password)</td></tr>
                                    <tr><td><strong>Best For</strong></td><td>Administrative control</td><td>User autonomy and security</td></tr>
                                    <tr><td><strong>First Login Experience</strong></td><td>Uses admin-set password directly</td><td>Prompted to change password</td></tr>
                                    <tr><td><strong>Password Management</strong></td><td>Admin manages all changes</td><td>User manages own password</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* ── Step 5 (originally Step 6): Complete User Creation ── */}
                    <section id="step6" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 5: Complete User Creation</h2>
                        <div className={styles.imageContainer}>
                            <img
                                src="/admin-create-user-step6-create-btn.png"
                                alt="Create User button — finalize the account"
                                className={styles.articleImage}
                            />
                            <p className={styles.imageCaption}>STEP 5 — CLICK CREATE USER TO FINALIZE</p>
                        </div>
                        <p className={styles.body}>After filling in all the required fields:</p>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>1</div><div className={styles.stepContent}><p className={styles.stepTitle}>Review all the information you have entered — Username, Email, Mobile Number, Role, Department, and Password</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>2</div><div className={styles.stepContent}><p className={styles.stepTitle}>Click the <strong>Create User</strong> button to create the account</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>3</div><div className={styles.stepContent}><p className={styles.stepTitle}>The system will validate all fields</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>4</div><div className={styles.stepContent}><p className={styles.stepTitle}>If successful, you will see a confirmation message</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>5</div><div className={styles.stepContent}><p className={styles.stepTitle}>The new user account for the manufacturer is now active ✅</p></div></div>
                        </div>
                    </section>

                    {/* ── Step 6 (originally Step 7): Providing Access ── */}
                    <section id="step7" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 6: Providing Access to the Manufacturer</h2>
                        <p className={styles.body}>Once the user account is created, you need to securely share the login credentials:</p>

                        <div className={styles.twoColGrid}>
                            <div className={styles.methodCard}>
                                <div className={styles.methodCardHeader}>
                                    <span className={styles.methodCardBadge}>Option 1</span>
                                    <p className={styles.methodCardTitle}>Password Never Expires</p>
                                </div>
                                <p className={styles.body} style={{ fontSize: '13px', marginBottom: '10px' }}>Send the username and password via secure email, phone call, or secure messaging. Include:</p>
                                <div className={styles.regLinkBox} style={{ margin: '0' }}>
                                    <p className={styles.regLinkLabel}>SHARE THESE DETAILS</p>
                                    <p className={styles.regLinkUrl}>Dashboard URL</p>
                                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>https://Enviguide.nextechltd.in/dashboard</p>
                                    <p className={styles.regLinkUrl}>Username + Password</p>
                                    <p style={{ fontSize: '12px', color: '#6b7280' }}>The credentials you set during user creation</p>
                                </div>
                            </div>
                            <div className={styles.methodCard}>
                                <div className={styles.methodCardHeader}>
                                    <span className={styles.methodCardBadge}>Option 2</span>
                                    <p className={styles.methodCardTitle}>Change Password at Next Login</p>
                                </div>
                                <p className={styles.body} style={{ fontSize: '13px', marginBottom: '10px' }}>Send the username and temporary password. Include clear instructions:</p>
                                <div className={styles.regLinkBox} style={{ margin: '0' }}>
                                    <p className={styles.regLinkLabel}>SHARE THESE DETAILS</p>
                                    <p className={styles.regLinkUrl}>Dashboard URL</p>
                                    <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>https://Enviguide.nextechltd.in/dashboard</p>
                                    <p className={styles.regLinkUrl}>Temporary Username + Password</p>
                                    <p style={{ fontSize: '12px', color: '#6b7280' }}>Note: "You will be asked to change this password on your first login"</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* ── Important Notes ── */}
                    <section id="notes" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Important Notes and Best Practices</h2>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>📧</div><div className={styles.stepContent}><p className={styles.stepTitle}>Email Must Match</p><p className={styles.stepBody}>The email used for the user account MUST be the same as the email used when creating the manufacturer company. This links the user to the correct manufacturer.</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>🆔</div><div className={styles.stepContent}><p className={styles.stepTitle}>Username Uniqueness</p><p className={styles.stepBody}>Each username must be unique in the system. Two users cannot have the same username.</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>📞</div><div className={styles.stepContent}><p className={styles.stepTitle}>Mobile Number Format</p><p className={styles.stepBody}>Include the country code for international numbers (e.g., +91 for India, +1 for USA).</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>🔐</div><div className={styles.stepContent}><p className={styles.stepTitle}>Security Best Practice</p><p className={styles.stepBody}>Using "Change Password at Next Login" is more secure as users create passwords only they know.</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>💪</div><div className={styles.stepContent}><p className={styles.stepTitle}>Password Strength</p><p className={styles.stepBody}>Use strong passwords with: Minimum 8 characters · Uppercase (A-Z) · Lowercase (a-z) · Numbers (0–9) · Special characters (!@#$%^&amp;*)</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>🏷️</div><div className={styles.stepContent}><p className={styles.stepTitle}>Role and Department</p><p className={styles.stepBody}>Always set both to "Manufacturer" for manufacturer users. Do not use other options unless specifically instructed.</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>👥</div><div className={styles.stepContent}><p className={styles.stepTitle}>Multiple Users</p><p className={styles.stepBody}>You can create multiple users for the same manufacturer company if needed. Just ensure each has a unique username.</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>🔄</div><div className={styles.stepContent}><p className={styles.stepTitle}>Resetting Password</p><p className={styles.stepBody}>If "Never Expires" is set: Only Super Admin can reset it. If "Change at Next Login" is set: User should use the password recovery option.</p></div></div>
                        </div>
                    </section>

                    {/* ── Summary Flow ── */}
                    <section id="summary" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Summary: Complete User Creation Process</h2>
                        <p className={styles.body}>Quick reference flow for creating a new user:</p>
                        <div className={styles.flowSummaryBox}>
                            {[
                                'Dashboard → Settings → User Management → Create New User',
                                'Fill in Username, Email, Mobile Number',
                                'Select Role: Manufacturer  ·  Select Department: Manufacturer',
                                'Choose Password Option: "Password Never Expires" OR "Change Password at Next Login"',
                                'Set Password / Temporary Password + Confirm Password',
                                'Click Create User',
                                'Share credentials with manufacturer',
                                'Manufacturer can now log in and access the platform ✅',
                            ].map((step, i) => (
                                <div key={i} className={styles.flowSummaryStep}>
                                    <div className={styles.flowSummaryNum}>{i + 1}</div>
                                    <p className={styles.flowSummaryText}>{step}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Footer Nav ── */}
                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/admin-article-create-manufacturer')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Previous: Create a Manufacturer
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
