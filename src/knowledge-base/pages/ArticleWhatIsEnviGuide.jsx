import { useNavigate } from 'react-router-dom'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'overview', label: 'Overview' },
    { id: 'who-is-it-for', label: 'Who Is It For?' },
    { id: 'key-modules', label: 'Key Modules' },
    { id: 'why-enviguide', label: 'Why Enviguide?' },
    { id: 'next-steps', label: 'Next Steps' },
]

const MODULES = [
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#22c55e" strokeWidth="2" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#22c55e" strokeWidth="2" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#22c55e" strokeWidth="2" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#22c55e" strokeWidth="2" />
            </svg>
        ),
        color: 'rgba(34,197,94,0.10)',
        name: 'Dashboard',
        desc: 'Live KPI cards showing CO₂e emissions, recyclability rate, manufacturing and transport emissions — all in one view.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 12h6M9 16h6M17 21H7a2 2 0 01-2-2V5a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        color: 'rgba(59,130,246,0.10)',
        name: 'PCF Request',
        desc: 'Send structured Product Carbon Footprint data requests to your suppliers and track response status end-to-end.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" stroke="#a855f7" strokeWidth="2" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        color: 'rgba(168,85,247,0.10)',
        name: 'Product Portfolio',
        desc: 'Manage your complete product library — each with its own lifecycle data, materials, and emission factors.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="#f97316" strokeWidth="2" />
                <path d="M12 2v3M12 19v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M2 12h3M19 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12" stroke="#f97316" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        color: 'rgba(249,115,22,0.10)',
        name: 'Components Master',
        desc: 'A centralized library of base materials and components with pre-configured emission factors used across all products.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#0ea5e9" strokeWidth="2" strokeLinecap="round" />
            </svg>
        ),
        color: 'rgba(14,165,233,0.10)',
        name: 'Document Master',
        desc: 'Upload, version, and link compliance documents — certifications, test reports, and regulatory evidence — to your products.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 11l3 3L22 4" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        color: 'rgba(34,197,94,0.10)',
        name: 'Task Management',
        desc: 'Assign, track, and close data tasks across your team with priority levels and due dates.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 20V10M12 20V4M6 20v-6" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        color: 'rgba(59,130,246,0.10)',
        name: 'Reports',
        desc: 'Generate audit-ready PDF and CSV reports covering lifecycle emissions, supplier breakdowns, and compliance status.',
    },
    {
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" stroke="#ec4899" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        ),
        color: 'rgba(236,72,153,0.10)',
        name: 'Data Quality Rating',
        desc: 'Score your emissions data against accuracy, completeness, and methodology benchmarks for trustworthy reporting.',
    },
]

export default function ArticleWhatIsEnviguide() {
    const navigate = useNavigate()

    return (
        <div className={styles.page}>

            {/* ── Minimal Top Bar ── */}
            <div className={styles.topBar}>
                <button className={styles.backBtn} onClick={() => navigate('/help-centre')}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to Help Center
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
                        <span className={styles.breadCurrent}>Getting Started</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                            <path d="M9 18l6-6-6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className={styles.breadCurrent}>What is Enviguide?</span>
                    </div>

                    {/* Article Header */}
                    <div className={styles.articleHeader}>
                        <span className={styles.articleTag}>GETTING STARTED</span>
                        <h1 className={styles.articleTitle}>What is Enviguide?</h1>
                        <p className={styles.articleSubtitle}>
                            A complete introduction to the Enviguide Environmental Management Suite — what it does,
                            who it's built for, and how it helps your organization track, manage, and report
                            on sustainability data with confidence.
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
                            <span className={styles.metaItem}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Getting Started
                            </span>
                        </div>
                    </div>

                    {/* Divider */}
                    <hr className={styles.divider} />

                    {/* ── Section 1 — Overview ── */}
                    <section id="overview" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Overview</h2>
                        <p className={styles.body}>
                            <strong>Enviguide</strong> is an end-to-end <strong>Environmental Management Suite</strong> purpose-built
                            for organizations that need to measure, manage, and improve their environmental impact across
                            the entire product supply chain.
                        </p>
                        <p className={styles.body}>
                            At its core, Enviguide helps you calculate your organization's <strong>Product Carbon Footprint (PCF)</strong> —
                            the total greenhouse gas emissions associated with a product from cradle to grave: raw material extraction,
                            manufacturing, transport, use phase, and end-of-life disposal.
                        </p>

                        {/* Callout */}
                        <div className={styles.calloutGreen}>
                            <div className={styles.calloutIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" />
                                    <path d="M12 8v4M12 16h.01" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div>
                                <p className={styles.calloutTitle}>What is a Product Carbon Footprint (PCF)?</p>
                                <p className={styles.calloutText}>
                                    A PCF measures the total amount of greenhouse gases (in kg CO₂ equivalent) emitted throughout a product's
                                    lifecycle. It covers raw material sourcing, manufacturing, packaging, transport, use, and disposal.
                                    Enviguide automates the collection, calculation, and reporting of this data across your entire supply chain.
                                </p>
                            </div>
                        </div>

                        <p className={styles.body}>
                            Enviguide is used by sustainability managers, compliance teams, procurement departments, and compliance officers
                            to build a single, auditable source of truth for their organization's environmental performance.
                        </p>
                    </section>

                    {/* ── Section 2 — Who Is It For ── */}
                    <section id="who-is-it-for" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Who Is It For?</h2>
                        <p className={styles.body}>
                            Enviguide is designed for a wide range of roles within an organization. Here's how different teams benefit:
                        </p>

                        <div className={styles.rolesGrid}>
                            {[
                                {
                                    role: 'Sustainability Managers',
                                    icon: '🌿',
                                    desc: 'Monitor live emissions metrics, track progress against reduction targets, and get a consolidated view of your entire product carbon portfolio.',
                                },
                                {
                                    role: 'Compliance Teams',
                                    icon: '📋',
                                    desc: 'Send and receive structured questionnaires, validate supplier data, and generate audit-ready compliance reports aligned with GHG Protocol, ISO 14064, and IFRS S2.',
                                },
                                {
                                    role: 'Procurement Departments',
                                    icon: '🔗',
                                    desc: 'Compare supplier emission profiles, prioritize low-carbon sourcing, and enforce sustainability standards through the PCF Request workflow.',
                                },
                                {
                                    role: 'Data & Analytics Teams',
                                    icon: '📊',
                                    desc: 'Access lifecycle emission charts, supplier breakdown data, recyclability rates, and trend reports to drive data-informed sustainability decisions.',
                                },
                                {
                                    role: 'Suppliers & Partners',
                                    icon: '🤝',
                                    desc: "Respond to buyer PCF requests through the guided Supplier Questionnaire — no prior knowledge of carbon accounting is required. Enviguide's built-in guidance makes it easy.",
                                },
                                {
                                    role: 'Executive Leadership',
                                    icon: '📈',
                                    desc: 'View high-level KPI summaries, track progress toward net-zero commitments, and export board-ready sustainability reports in one click.',
                                },
                            ].map(r => (
                                <div key={r.role} className={styles.roleCard}>
                                    <span className={styles.roleEmoji}>{r.icon}</span>
                                    <div>
                                        <p className={styles.roleName}>{r.role}</p>
                                        <p className={styles.roleDesc}>{r.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Section 3 — Key Modules ── */}
                    <section id="key-modules" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Key Modules</h2>
                        <p className={styles.body}>
                            Enviguide is organized into <strong>8 specialized modules</strong>, each accessible from the left sidebar of the platform.
                            Together they cover the full journey from data collection to compliance reporting.
                        </p>

                        <div className={styles.modulesGrid}>
                            {MODULES.map(m => (
                                <div key={m.name} className={styles.moduleCard}>
                                    <div className={styles.moduleIcon} style={{ background: m.color }}>
                                        {m.icon}
                                    </div>
                                    <div>
                                        <p className={styles.moduleName}>{m.name}</p>
                                        <p className={styles.moduleDesc}>{m.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Section 4 — Why Enviguide ── */}
                    <section id="why-enviguide" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Why Enviguide?</h2>
                        <p className={styles.body}>
                            There are many sustainability tools available — so what makes Enviguide different?
                        </p>

                        <div className={styles.whyList}>
                            {[
                                {
                                    num: '01',
                                    title: 'Built for Supply Chain PCF',
                                    body: 'Unlike generic carbon tools, Enviguide is specifically designed around the product carbon footprint workflow — from sending supplier questionnaires all the way to lifecycle emission modeling.',
                                },
                                {
                                    num: '02',
                                    title: 'Standards-Aligned Reporting',
                                    body: 'All questionnaires and data structures are built on globally recognized frameworks: GHG Protocol, ISO 14064, IFRS S2 Climate Disclosures, and EU Taxonomy alignment.',
                                },
                                {
                                    num: '03',
                                    title: 'Guided for Non-Experts',
                                    body: 'Every questionnaire question comes with inline "What We Are Asking" and "Why This Matters" explanations — so suppliers and new users can contribute accurate data without specialist knowledge.',
                                },
                                {
                                    num: '04',
                                    title: 'Real-Time Visibility',
                                    body: 'Your dashboard updates in real time as supplier responses come in. Track total CO₂e, recyclability rates, and supplier emission breakdowns by client — live.',
                                },
                                {
                                    num: '05',
                                    title: 'End-to-End Audit Trail',
                                    body: 'Every data input is logged with user attribution, timestamps, and methodology references — creating a complete, defensible audit trail for external verification.',
                                },
                            ].map(w => (
                                <div key={w.num} className={styles.whyItem}>
                                    <span className={styles.whyNum}>{w.num}</span>
                                    <div>
                                        <p className={styles.whyTitle}>{w.title}</p>
                                        <p className={styles.whyBody}>{w.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Section 5 — Next Steps ── */}
                    <section id="next-steps" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Next Steps</h2>
                        <p className={styles.body}>
                            Now that you know what Enviguide is, here's where to go next:
                        </p>

                        <div className={styles.nextGrid}>
                            {[
                                {
                                    tag: 'READ NEXT',
                                    title: 'How the Platform Works',
                                    desc: 'A step-by-step walkthrough of every module and how they connect.',
                                    path: '/article-platform-walkthrough',
                                    color: '#22c55e',
                                },
                                {
                                    tag: 'POPULAR',
                                    title: 'How to Fill Out a Supplier Questionnaire',
                                    desc: 'Detailed guidance for every section and question in the Supplier form.',
                                    path: '/supplier-questionnaire-guide',
                                    color: '#3b82f6',
                                },
                                {
                                    tag: 'TUTORIAL',
                                    title: 'Understanding Your Dashboard',
                                    desc: 'Learn what every KPI card and chart on the dashboard means.',
                                    path: '/',
                                    color: '#a855f7',
                                },
                            ].map(n => (
                                <button key={n.title} className={styles.nextCard} onClick={() => navigate(n.path)}>
                                    <span className={styles.nextTag} style={{ color: n.color, background: `${n.color}18` }}>{n.tag}</span>
                                    <p className={styles.nextTitle}>{n.title}</p>
                                    <p className={styles.nextDesc}>{n.desc}</p>
                                    <span className={styles.nextArrow} style={{ color: n.color }}>
                                        Read article →
                                    </span>
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* ── Guidance Note ── */}
                    <div className={styles.guidanceNote}>
                        <div className={styles.guidanceIcon}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="10" stroke="#3b82f6" strokeWidth="2" />
                                <path d="M12 16v-4M12 8h.01" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </div>
                        <div>
                            <span className={styles.guidanceLabel}>Guidance Notes</span>
                            <p className={styles.guidanceText}>
                                This article is reviewed quarterly and reflects the current Enviguide Management Suite.
                                Platform features may vary based on your subscription tier. Last updated: February 2026.
                            </p>
                        </div>
                    </div>

                    {/* ── Article Footer Nav ── */}
                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/help-centre')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Back to Help Center
                        </button>
                        <button className={styles.footerNavBtnNext} onClick={() => navigate('/article-platform-walkthrough')}>
                            How the Platform Works
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
