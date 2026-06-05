import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'step1', label: 'Step 1: Navigate to Dashboard' },
    { id: 'step2', label: 'Step 2: Access Settings Module' },
    { id: 'step3', label: 'Step 3: Authorizations Page' },
    { id: 'step4', label: 'Step 4: Filter by Role' },
    { id: 'step5', label: 'Step 5: Select a User' },
    { id: 'step6', label: 'Step 6: Permission Matrix' },
    { id: 'step7', label: 'Step 7: Available Modules' },
    { id: 'roles', label: 'Role-Based Strategy' },
    { id: 'step8', label: 'Step 8: Granting Permissions' },
    { id: 'step9', label: 'Step 9: Managing Role Logic' },
    { id: 'notes', label: 'Important Notes' },
    { id: 'summary', label: 'Summary' },
]

export default function ArticleManageAuthorizations() {
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

    const MODULES = [
        'Alert Management', 'Component Master', 'Dashboard', 'Data Quality Rating',
        'Document Master', 'PCF Request', 'Product Portfolio', 'Reports',
        'Settings (with submodules)', 'Task Management',
    ]

    const ROLES = [
        {
            num: '1️⃣', title: 'Super Admin', subtitle: 'Full control over system',
            img: '/admin-auth-role-super-admin.png',
            access: ['All permissions (Create, Read, Update, Delete, Print, Export, Send)', 'All modules enabled', 'Full Settings access', 'Manage Roles access'],
            restricted: [],
            note: 'Super Admin is responsible for governance and system-wide configuration.',
            color: '#22c55e',
        },
        {
            num: '2️⃣', title: 'Admin', subtitle: 'Operational control, limited governance',
            img: '/admin-auth-role-admin.png',
            access: ['Dashboard: Full', 'PCF Request: Full', 'Product Portfolio: Full', 'Reports: Full', 'Document Master: Full', 'Task Management: Full', 'Data Quality Rating: Full'],
            restricted: ['Settings: Limited (No role creation)', 'Authorizations: Optional (based on internal control structure)'],
            note: 'Admins should not override system architecture.',
            color: '#3b82f6',
        },
        {
            num: '3️⃣', title: 'Manufacturer', subtitle: 'Restricted to operational functions',
            img: '/admin-auth-role-manufacturer.png',
            access: ['Dashboard: Read', 'PCF Request: Create + Read + Update', 'Product Portfolio: Read', 'Document Master: Read', 'Reports: Limited Export', 'Task Management: Read'],
            restricted: ['Settings', 'Role Management', 'Delete permissions (unless required)', 'System configuration'],
            note: 'Manufacturers should only manage their environmental data.',
            color: '#f59e0b',
        },
        {
            num: '4️⃣', title: 'Supplier', subtitle: 'Very limited access',
            img: '/admin-auth-role-supplier.png',
            access: ['PCF Request: Create + Read', 'Document Master: Upload / Read', 'Dashboard: Read-only (optional)'],
            restricted: ['Delete permissions', 'Settings', 'Role management', 'Report generation across system'],
            note: 'Suppliers should only respond to data requests.',
            color: '#8b5cf6',
        },
    ]

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
                        <span className={styles.breadCurrent}>Manage User Authorizations</span>
                    </div>

                    {/* Article Header */}
                    <div className={styles.articleHeader}>
                        <span className={styles.articleTag}>ADMIN MANUALS · DOCUMENT #03</span>
                        <h1 className={styles.articleTitle}>Complete Guide to Manage User Authorizations in Enviguide</h1>
                        <p className={styles.articleSubtitle}>
                            Configure and manage module-level permissions for different users and roles to ensure proper
                            access control, data security, and operational governance.
                        </p>
                        <div className={styles.articleMeta}>
                            <span className={styles.metaItem}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#9ca3af" strokeWidth="2" />
                                    <path d="M12 6v6l4 2" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                10 min read
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
                        <h2 className={styles.sectionTitle}>Overview</h2>
                        <p className={styles.body}>
                            This guide explains how a <strong>Super Admin</strong> can configure and manage module-level
                            permissions for different users and roles within the Enviguide platform. This ensures proper
                            access control, data security, and operational governance.
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
                                    Only <strong>Super Admins</strong> can configure user authorizations and manage role permissions in Enviguide.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ── Step 1 ── */}
                    <section id="step1" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 1: Navigate to the Dashboard</h2>
                        <p className={styles.body}>
                            After logging in as a <strong>Super Admin</strong>, you will land on the main dashboard.
                            The dashboard provides system-level insights including:
                        </p>
                        <div className={styles.rolesGrid}>
                            {['Product Carbon Footprint metrics', 'Emissions summary', 'Recyclability rate', 'Reports export option'].map((item, i) => (
                                <div key={i} className={styles.roleCard}>
                                    <span className={styles.roleEmoji}>📊</span>
                                    <div><p className={styles.roleName}>{item}</p></div>
                                </div>
                            ))}
                        </div>
                        <p className={styles.body}>From here, all system configuration actions begin.</p>
                        <div className={styles.imageContainer}>
                            <img src="/admin-auth-step1-dashboard.png" alt="Enviguide main dashboard with PCF metrics" className={styles.articleImage} />
                            <p className={styles.imageCaption}>STEP 1 — MAIN DASHBOARD</p>
                        </div>
                    </section>

                    {/* ── Step 2 ── */}
                    <section id="step2" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 2: Access the Settings Module</h2>
                        <p className={styles.body}>To manage user authorizations:</p>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>1</div><div className={styles.stepContent}><p className={styles.stepTitle}>Locate the <strong>Settings</strong> option in the left sidebar</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>2</div><div className={styles.stepContent}><p className={styles.stepTitle}>Click on <strong>Settings</strong></p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>3</div><div className={styles.stepContent}><p className={styles.stepTitle}>You will see multiple configuration sections</p></div></div>
                        </div>
                        <p className={styles.body}>Under <strong>User Management</strong>, you will find:</p>
                        <div className={styles.tabPills}>
                            <div className={styles.tabPill}><span>👤</span><div><p className={styles.tabPillName}>Manage Users</p></div></div>
                            <div className={`${styles.tabPill} ${styles.tabPillActive}`}><span>🔐</span><div><p className={styles.tabPillName}>Authorizations</p><p className={styles.tabPillDesc}>You need this</p></div><span className={styles.tabPillBadge}>← Click this</span></div>
                            <div className={styles.tabPill}><span>➕</span><div><p className={styles.tabPillName}>Create New User</p></div></div>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/admin-auth-step2-settings.png" alt="Settings menu showing Authorizations option" className={styles.articleImage} />
                            <p className={styles.imageCaption}>STEP 2 — SETTINGS → USER MANAGEMENT → AUTHORIZATIONS</p>
                        </div>
                    </section>

                    {/* ── Step 3 ── */}
                    <section id="step3" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 3: Understanding the Authorizations Page</h2>
                        <p className={styles.body}>Once inside Authorizations, you will see the following header elements:</p>
                        <div className={styles.twoColGrid}>
                            <div className={styles.methodCard}>
                                <div className={styles.methodCardHeader}>
                                    <span className={styles.methodCardBadge}>Header Controls</span>
                                </div>
                                <div className={styles.numberedSteps}>
                                    <div className={styles.numberedStep}><div style={{ fontSize: '16px', width: '22px', flexShrink: 0 }}>🔄</div><div className={styles.stepContent}><p className={styles.stepTitle}>Refresh Button</p></div></div>
                                    <div className={styles.numberedStep}><div style={{ fontSize: '16px', width: '22px', flexShrink: 0 }}>💾</div><div className={styles.stepContent}><p className={styles.stepTitle}>Save Changes Button</p></div></div>
                                </div>
                            </div>
                            <div className={styles.methodCard}>
                                <div className={styles.methodCardHeader}>
                                    <span className={styles.methodCardBadge}>Tabs</span>
                                </div>
                                <div className={styles.numberedSteps}>
                                    <div className={styles.numberedStep}><div style={{ fontSize: '16px', width: '22px', flexShrink: 0 }}>👤</div><div className={styles.stepContent}><p className={styles.stepTitle}><strong>User Permissions</strong> Tab (active)</p></div></div>
                                    <div className={styles.numberedStep}><div style={{ fontSize: '16px', width: '22px', flexShrink: 0 }}>🏷️</div><div className={styles.stepContent}><p className={styles.stepTitle}>Manage Roles Tab</p></div></div>
                                </div>
                            </div>
                        </div>
                        <div className={styles.calloutGreen}>
                            <div className={styles.calloutIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" />
                                    <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <p className={styles.calloutTitle}>Make sure you are inside the User Permissions tab</p>
                                <p className={styles.calloutText}>This is the tab where you configure individual user access to modules.</p>
                            </div>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/admin-auth-step3-auth-page.png" alt="Authorizations page showing tabs and header controls" className={styles.articleImage} />
                            <p className={styles.imageCaption}>STEP 3 — AUTHORIZATIONS PAGE HEADER & TABS</p>
                        </div>
                    </section>

                    {/* ── Step 4 ── */}
                    <section id="step4" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 4: Filter by Role</h2>
                        <p className={styles.body}>At the top of the page, you will see two dropdowns: <strong>Filter by Role</strong> and <strong>Select User</strong>.</p>
                        <p className={styles.body}>Click the dropdown under <strong>Filter by Role</strong>. Available roles include:</p>
                        <div className={styles.tabPills}>
                            {['Super Admin', 'Admin', 'Manufacturer', 'Supplier'].map((role, i) => (
                                <div key={i} className={styles.tabPill}>
                                    <span>{['👑', '🛠️', '🏭', '📦'][i]}</span>
                                    <div><p className={styles.tabPillName}>{role}</p></div>
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
                                <p className={styles.calloutTitle}>How Role Filter Works</p>
                                <p className={styles.calloutText}>When you select a role, all users assigned to that role will appear in the <strong>Select User</strong> dropdown.</p>
                            </div>
                        </div>
                    </section>

                    {/* ── Step 5 ── */}
                    <section id="step5" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 5: Select a User</h2>
                        <p className={styles.body}>After selecting a role:</p>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>1</div><div className={styles.stepContent}><p className={styles.stepTitle}>Click on <strong>Select User</strong></p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>2</div><div className={styles.stepContent}><p className={styles.stepTitle}>Choose the specific user whose permissions you want to configure</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>3</div><div className={styles.stepContent}><p className={styles.stepTitle}>The system will load that user's <strong>permissions matrix</strong></p></div></div>
                        </div>
                    </section>

                    {/* ── Step 6: Permission Matrix ── */}
                    <section id="step6" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 6: Understanding the Permission Matrix</h2>
                        <p className={styles.body}>Each user has permissions across different modules. For each module, you can enable the following permission types:</p>
                        <div className={styles.articleTable}>
                            <table>
                                <thead>
                                    <tr><th>Permission</th><th>What It Allows</th></tr>
                                </thead>
                                <tbody>
                                    {[
                                        ['Create', 'Add new records in this module'],
                                        ['Read', 'View existing records'],
                                        ['Update', 'Edit and modify existing records'],
                                        ['Delete', 'Remove records permanently'],
                                        ['Print', 'Print records from this module'],
                                        ['Export', 'Export data to CSV/Excel/PDF'],
                                        ['Send', 'Send data or notifications from this module'],
                                        ['All', 'Grant all above permissions at once for this module'],
                                    ].map(([perm, desc]) => (
                                        <tr key={perm}><td><strong>{perm}</strong></td><td>{desc}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/admin-auth-step6-permission-matrix.png" alt="Permission matrix with module checkboxes" className={styles.articleImage} />
                            <p className={styles.imageCaption}>STEP 6 — PERMISSION MATRIX WITH MODULE CHECKBOXES</p>
                        </div>
                    </section>

                    {/* ── Step 7: Modules ── */}
                    <section id="step7" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 7: Modules Available for Authorization</h2>
                        <p className={styles.body}>The following modules are configurable — each with independent permissions:</p>
                        <div className={styles.rolesGrid}>
                            {MODULES.map((mod, i) => (
                                <div key={i} className={styles.roleCard}>
                                    <span className={styles.roleEmoji}>🔧</span>
                                    <div><p className={styles.roleName}>{mod}</p></div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Role-Based Strategy ── */}
                    <section id="roles" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Role-Based Authorization Strategy (Recommended Best Practice)</h2>
                        <p className={styles.body}>Below is the recommended permission structure for each role:</p>

                        {ROLES.map((role) => (
                            <div key={role.title} className={styles.rolePermCard}>
                                {/* Role Header Banner */}
                                <div className={styles.rolePermHeader} style={{ borderLeft: `4px solid ${role.color}`, background: `linear-gradient(135deg, ${role.color}0d 0%, #fff 100%)` }}>
                                    <div className={styles.rolePermHeaderLeft}>
                                        <span className={styles.rolePermNum}>{role.num}</span>
                                        <div>
                                            <p className={styles.rolePermTitle}>{role.title}</p>
                                            <p className={styles.rolePermSub}>{role.subtitle}</p>
                                        </div>
                                    </div>
                                    <span className={styles.rolePermLevelBadge} style={{ color: role.color, background: `${role.color}18`, border: `1px solid ${role.color}30` }}>
                                        {['Full Access', 'High Access', 'Moderate Access', 'Limited Access'][ROLES.indexOf(role)]}
                                    </span>
                                </div>

                                {/* Role Image */}
                                <div className={styles.imageContainer} style={{ margin: '0 0 20px' }}>
                                    <img src={role.img} alt={`${role.title} permission configuration`} className={styles.articleImage} />
                                    <p className={styles.imageCaption}>{role.title.toUpperCase()} — RECOMMENDED PERMISSIONS</p>
                                </div>

                                {/* Permission Pills */}
                                <div className={styles.rolePermBody}>
                                    {/* Should Have */}
                                    <div className={styles.rolePermGroup}>
                                        <div className={styles.rolePermGroupLabel} style={{ color: role.color }}>
                                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                                <path d="M9 12l2 2 4-4" stroke={role.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                                <circle cx="12" cy="12" r="10" stroke={role.color} strokeWidth="2" />
                                            </svg>
                                            Should Have
                                        </div>
                                        <div className={styles.rolePermPills}>
                                            {role.access.map((item, i) => (
                                                <span key={i} className={styles.rolePermPillGreen} style={{ borderColor: `${role.color}40`, color: role.color, background: `${role.color}0f` }}>
                                                    ✓ {item}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Restricted */}
                                    {role.restricted.length > 0 && (
                                        <div className={styles.rolePermGroup}>
                                            <div className={styles.rolePermGroupLabel} style={{ color: '#ef4444' }}>
                                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                                    <circle cx="12" cy="12" r="10" stroke="#ef4444" strokeWidth="2" />
                                                    <path d="M15 9l-6 6M9 9l6 6" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
                                                </svg>
                                                Restricted
                                            </div>
                                            <div className={styles.rolePermPills}>
                                                {role.restricted.map((item, i) => (
                                                    <span key={i} className={styles.rolePermPillRed}>
                                                        ✗ {item}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Note */}
                                <p className={styles.rolePermNote}>{role.note}</p>
                            </div>
                        ))}
                    </section>

                    {/* ── Step 8 ── */}
                    <section id="step8" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 8: Granting Permissions</h2>
                        <p className={styles.body}>To modify permissions:</p>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>1</div><div className={styles.stepContent}><p className={styles.stepTitle}>Click on the checkbox under the required permission for each module</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>2</div><div className={styles.stepContent}><p className={styles.stepTitle}>You may use the <strong>ALL</strong> option to enable all permissions in a module at once</p></div></div>
                            <div className={styles.numberedStep}><div className={styles.stepCircle}>3</div><div className={styles.stepContent}><p className={styles.stepTitle}>After making changes, click <strong>Save Changes</strong></p></div></div>
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
                                <p className={styles.calloutTitle}>Don't Navigate Away Without Saving</p>
                                <p className={styles.calloutText}>If you navigate away without saving, all changes will be lost. Always click <strong>Save Changes</strong> before leaving the page.</p>
                            </div>
                        </div>
                    </section>

                    {/* ── Step 9 ── */}
                    <section id="step9" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Step 9: Managing Role-Based Logic</h2>
                        <p className={styles.body}>Inside the <strong>Manage Roles</strong> tab:</p>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div style={{ fontSize: '16px', width: '22px', flexShrink: 0 }}>🏷️</div><div className={styles.stepContent}><p className={styles.stepTitle}>You can define permissions at the <strong>role level</strong></p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '16px', width: '22px', flexShrink: 0 }}>👤</div><div className={styles.stepContent}><p className={styles.stepTitle}>Users inherit default permissions from their assigned role</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '16px', width: '22px', flexShrink: 0 }}>⚙️</div><div className={styles.stepContent}><p className={styles.stepTitle}>Individual user permissions can override role settings</p></div></div>
                        </div>
                        <div className={styles.calloutGreen}>
                            <div className={styles.calloutIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M9 12l2 2 4-4" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                                    <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" />
                                </svg>
                            </div>
                            <div>
                                <p className={styles.calloutTitle}>Best Practice</p>
                                <p className={styles.calloutText}>Define standard permissions at the role level. Avoid customizing too many individual users as it becomes harder to audit and maintain.</p>
                            </div>
                        </div>
                    </section>

                    {/* ── Important Notes ── */}
                    <section id="notes" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Important Notes</h2>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>⚠️</div><div className={styles.stepContent}><p className={styles.stepTitle}>Verify Before Granting Delete</p><p className={styles.stepBody}>Always confirm before granting Delete permissions — deleted records may not be recoverable.</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>🚫</div><div className={styles.stepContent}><p className={styles.stepTitle}>Avoid Settings for Operational Roles</p><p className={styles.stepBody}>Do not give Settings access to operational roles like Manufacturer or Supplier.</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>🔍</div><div className={styles.stepContent}><p className={styles.stepTitle}>Use Filter by Role for Bulk Auditing</p><p className={styles.stepBody}>Filter by Role lets you quickly review all users of a specific role at once.</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>📅</div><div className={styles.stepContent}><p className={styles.stepTitle}>Review Permissions Regularly</p><p className={styles.stepBody}>Review permissions regularly for compliance with organizational policies.</p></div></div>
                            <div className={styles.numberedStep}><div style={{ fontSize: '20px', width: '30px', textAlign: 'center', flexShrink: 0 }}>🔄</div><div className={styles.stepContent}><p className={styles.stepTitle}>Use Refresh If Changes Don't Appear</p><p className={styles.stepBody}>Click the Refresh button if permission changes don't immediately appear on screen.</p></div></div>
                        </div>

                        <h3 className={styles.subSectionTitle} style={{ marginTop: '28px' }}>Authorization Governance Best Practices</h3>
                        <div className={styles.flowSummaryBox}>
                            {[
                                'Follow Principle of Least Privilege — give users only the access they need',
                                'Separate Governance (Super Admin) from Operations (Admin)',
                                'Do not give Settings access to external roles (Manufacturer, Supplier)',
                                'Review permissions quarterly',
                                'Audit inactive users regularly',
                            ].map((step, i) => (
                                <div key={i} className={styles.flowSummaryStep}>
                                    <div className={styles.flowSummaryNum}>{i + 1}</div>
                                    <p className={styles.flowSummaryText}>{step}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Summary Table ── */}
                    <section id="summary" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Summary</h2>
                        <div className={styles.articleTable}>
                            <table>
                                <thead>
                                    <tr><th>Role</th><th>Access Level</th><th>Governance</th><th>Operational</th><th>Recommended Scope</th></tr>
                                </thead>
                                <tbody>
                                    <tr><td><strong>Super Admin</strong></td><td>Full</td><td>✅ Yes</td><td>✅ Yes</td><td>Entire system</td></tr>
                                    <tr><td><strong>Admin</strong></td><td>High</td><td>⚠️ Limited</td><td>✅ Yes</td><td>Internal management</td></tr>
                                    <tr><td><strong>Manufacturer</strong></td><td>Moderate</td><td>🚫 No</td><td>✅ Yes</td><td>Product &amp; PCF related</td></tr>
                                    <tr><td><strong>Supplier</strong></td><td>Low</td><td>🚫 No</td><td>⚠️ Limited</td><td>Data submission only</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* ── Footer Nav ── */}
                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/admin-article-create-new-user')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Previous: Create a New User
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
