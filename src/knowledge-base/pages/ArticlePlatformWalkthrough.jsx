import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'how-it-flows', label: 'How It All Flows' },
    { id: 'step1-dashboard', label: 'Step 1 — Dashboard' },
    { id: 'step2-pcf', label: 'Step 2 — PCF Request' },
    { id: 'step3-questionnaire', label: 'Step 3 — Supplier Questionnaire' },
    { id: 'step4-portfolio', label: 'Step 4 — Product Portfolio' },
    { id: 'step5-reports', label: 'Step 5 — Reports & Analytics' },
    { id: 'data-quality', label: 'Data Quality Rating' },
    { id: 'faq', label: 'FAQs' },
]

const FAQS = [
    {
        q: 'Do suppliers need an Enviguide account to fill out the questionnaire?',
        a: 'No. Suppliers receive a secure link via email and can fill out the questionnaire without creating an account. Their responses are automatically captured in your Enviguide workspace.',
    },
    {
        q: 'What emission standards does Enviguide follow?',
        a: 'Enviguide is aligned with the GHG Protocol Corporate Standard, ISO 14064-1, and IFRS S2 (Climate-related Disclosures). Scope 1, 2, and 3 definitions follow the GHG Protocol categorization.',
    },
    {
        q: 'Can I track multiple products across multiple clients?',
        a: 'Yes. Use the Client Selector on the Dashboard to filter KPI data by client. Each product in the Product Portfolio can be linked to specific clients and suppliers independently.',
    },
    {
        q: 'What formats can I export reports in?',
        a: 'Reports can be exported as PDF (for board presentations and external audits) and CSV (for further analysis in Excel or BI tools). Select Export Report from the Dashboard or Reports module.',
    },
    {
        q: 'How does the Data Quality Rating work?',
        a: 'Each product receives a score from 1–5 stars based on four dimensions: data completeness, methodology accuracy, recency (how recently data was updated), and verification status (self-declared vs. third-party verified).',
    },
]

function FaqItem({ q, a }) {
    const [open, setOpen] = useState(false)
    return (
        <div className={`${styles.faqItem} ${open ? styles.faqOpen : ''}`}>
            <button className={styles.faqHeader} onClick={() => setOpen(o => !o)}>
                <span className={styles.faqQ}>{q}</span>
                <svg className={`${styles.faqChevron} ${open ? styles.faqChevronUp : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M6 9l6 6 6-6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </button>
            {open && <p className={styles.faqA}>{a}</p>}
        </div>
    )
}

export default function ArticlePlatformWalkthrough() {
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
                            <a key={s.id} href={`#${s.id}`} className={styles.tocLink}>{s.label}</a>
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
                        <span className={styles.breadCurrent}>How the Platform Works</span>
                    </div>

                    {/* Article Header */}
                    <div className={styles.articleHeader}>
                        <span className={styles.articleTag}>GETTING STARTED</span>
                        <h1 className={styles.articleTitle}>How the Platform Works</h1>
                        <p className={styles.articleSubtitle}>
                            A step-by-step walkthrough of every key module in Enviguide — from the live emissions
                            Dashboard to sending PCF Requests, collecting supplier data, and generating compliance-ready reports.
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
                            <span className={styles.metaItem}>
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                                    <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Getting Started
                            </span>
                        </div>
                    </div>

                    <hr className={styles.divider} />

                    {/* ── How It All Flows ── */}
                    <section id="how-it-flows" className={styles.section}>
                        <h2 className={styles.sectionTitle}>How It All Flows</h2>
                        <p className={styles.body}>
                            Enviguide follows a logical five-step workflow that takes your organization from <strong>setting up
                                your product data</strong> all the way to <strong>publishing compliance-ready sustainability reports</strong>.
                        </p>

                        {/* Flow Steps */}
                        <div className={styles.flowSteps}>
                            {[
                                { num: '1', label: 'Dashboard', sub: 'Monitor live emissions KPIs', color: '#22c55e' },
                                { num: '2', label: 'PCF Request', sub: 'Collect supplier data', color: '#3b82f6' },
                                { num: '3', label: 'Questionnaire', sub: 'Guided data entry', color: '#a855f7' },
                                { num: '4', label: 'Portfolio', sub: 'Model lifecycle emissions', color: '#6366f1' },
                                { num: '5', label: 'Reports', sub: 'Export & share results', color: '#14b8a6' },
                            ].map((step, i, arr) => (
                                <div key={step.num} className={styles.flowRow}>
                                    <div className={styles.flowStep}>
                                        <div className={styles.flowCircle} style={{ background: step.color }}>
                                            {step.num}
                                        </div>
                                        <div>
                                            <p className={styles.flowLabel}>{step.label}</p>
                                            <p className={styles.flowSub}>{step.sub}</p>
                                        </div>
                                    </div>
                                    {i < arr.length - 1 && (
                                        <svg className={styles.flowArrow} width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <path d="M5 12h14M12 5l7 7-7 7" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    )}
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Step 1: Dashboard ── */}
                    <section id="step1-dashboard" className={styles.section}>
                        <div className={styles.stepHeader}>
                            <span className={styles.stepBadge} style={{ background: 'rgba(34,197,94,0.12)', color: '#16a34a' }}>STEP 1</span>
                            <h2 className={styles.sectionTitle}>Dashboard — Your Live Emissions Command Center</h2>
                        </div>
                        <p className={styles.body}>
                            When you log in to Enviguide, the <strong>Dashboard</strong> is the first thing you see. It gives you an
                            instant, real-time view of your organization's environmental performance across four key metrics:
                        </p>

                        <div className={styles.kpiTable}>
                            {[
                                { metric: 'Total CO₂e Emissions', value: '2,847 kg', change: '−12.3%', note: 'Total greenhouse gas output across all products and suppliers', good: true },
                                { metric: 'Manufacturing Emissions', value: '1,243 kg', change: '+5.2%', note: '43.7% of total — your largest single emission source', good: false },
                                { metric: 'Recyclability Rate', value: '72.5%', change: '+8.1%', note: 'Current target: 85% — tracking upward', good: true },
                                { metric: 'Transport Emissions', value: '487 kg', change: '−18.4%', note: '17.1% of total — improved through route optimization', good: true },
                            ].map(k => (
                                <div key={k.metric} className={styles.kpiRow}>
                                    <div>
                                        <p className={styles.kpiMetric}>{k.metric}</p>
                                        <p className={styles.kpiNote}>{k.note}</p>
                                    </div>
                                    <div className={styles.kpiRight}>
                                        <span className={styles.kpiValue}>{k.value}</span>
                                        <span className={styles.kpiBadge} style={{ background: k.good ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.10)', color: k.good ? '#16a34a' : '#dc2626' }}>
                                            {k.change}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <p className={styles.body} style={{ marginTop: 20 }}>
                            Below the KPI cards you'll find two charts:
                        </p>
                        <ul className={styles.bullets}>
                            <li><strong>Product Life Cycle Emission Bar Chart</strong> — shows emissions across 7 stages: Raw Materials, Manufacturing, Transport, Use Phase, Recycling, Disposal, and Other. Use this to identify your highest-emission lifecycle stages ("hotspots").</li>
                            <li><strong>Supplier Emission Donut Chart</strong> — shows which suppliers contribute most to your supply chain emissions. Hover over segments to see exact percentages. Use this to prioritize supplier engagement.</li>
                        </ul>

                        <div className={styles.calloutBlue}>
                            <div className={styles.calloutIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                            </div>
                            <div>
                                <p className={styles.calloutTitle}>Pro Tip — Use the Client Selector</p>
                                <p className={styles.calloutText}>
                                    If you manage data for multiple clients, use the <strong>Client Selector</strong> dropdown (below the header)
                                    to filter all KPI data and charts to a single client view. This is essential for client-specific
                                    sustainability reporting.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ── Step 2: PCF Request ── */}
                    <section id="step2-pcf" className={styles.section}>
                        <div className={styles.stepHeader}>
                            <span className={styles.stepBadge} style={{ background: 'rgba(59,130,246,0.12)', color: '#2563eb' }}>STEP 2</span>
                            <h2 className={styles.sectionTitle}>PCF Request — Collecting Data from Suppliers</h2>
                        </div>
                        <p className={styles.body}>
                            A <strong>PCF (Product Carbon Footprint) Request</strong> is how you formally ask a supplier to provide
                            their emissions data for a specific product. This replaces ad-hoc email chains with a structured,
                            tracked workflow.
                        </p>

                        <div className={styles.numberedSteps}>
                            {[
                                { step: 1, title: 'Navigate to PCF Request', body: 'In the left sidebar, click the PCF Request module (document icon). You\'ll see all active, pending, and completed requests.' },
                                { step: 2, title: 'Select the Product', body: 'Choose which product from your Product Portfolio you need emissions data for. You can select multiple products for bulk requests.' },
                                { step: 3, title: 'Select the Supplier', body: 'Pick the supplier from your registered supplier list. If they\'re new, you can add them directly from this screen.' },
                                { step: 4, title: 'Set the Reporting Period', body: 'Specify the year or quarter for which you need the emissions data (e.g., Full Year 2025, Q3 2025).' },
                                { step: 5, title: 'Send the Request', body: 'Click Send Request. The supplier receives a personalized email with a secure link to the Supplier Questionnaire. No account creation required.' },
                                { step: 6, title: 'Track the Status', body: 'Monitor progress in Task Management. Status moves: Draft → Sent → In Progress → Submitted → Under Review → Accepted.' },
                            ].map(s => (
                                <div key={s.step} className={styles.numberedStep}>
                                    <div className={styles.stepCircle}>{s.step}</div>
                                    <div>
                                        <p className={styles.stepTitle}>{s.title}</p>
                                        <p className={styles.stepBody}>{s.body}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Step 3: Questionnaire ── */}
                    <section id="step3-questionnaire" className={styles.section}>
                        <div className={styles.stepHeader}>
                            <span className={styles.stepBadge} style={{ background: 'rgba(168,85,247,0.12)', color: '#7c3aed' }}>STEP 3</span>
                            <h2 className={styles.sectionTitle}>Supplier Questionnaire — Guided Data Entry</h2>
                        </div>
                        <p className={styles.body}>
                            When a supplier opens the questionnaire link, they land on the <strong>Supplier Questionnaire</strong> —
                            a beautifully guided form broken into 6 sections:
                        </p>

                        <div className={styles.sectionGrid}>
                            {[
                                { num: '01', title: 'Organization Details', desc: 'Legal name, core business activity, NACE/SIC codes, contact details.' },
                                { num: '02', title: 'Product Details', desc: 'Product name, SKU, category, functional unit, and lifecycle.' },
                                { num: '03', title: 'Scope 1 — Direct Emissions', desc: 'Fuel combustion, on-site processes, refrigerant leaks from company-controlled sources.' },
                                { num: '04', title: 'Scope 2 — Energy Emissions', desc: 'Purchased electricity, steam, heat — market-based and location-based accounting.' },
                                { num: '05', title: 'Scope 3 — Value Chain', desc: 'Purchased goods, upstream transport, business travel, waste — covering the full supply chain.' },
                                { num: '06', title: 'Scope 4 — Avoided Emissions', desc: 'Positive climate impact enabled by the product or service (beyond own operations).' },
                            ].map(s => (
                                <div key={s.num} className={styles.qSectionCard}>
                                    <span className={styles.qSectionNum}>{s.num}</span>
                                    <p className={styles.qSectionTitle}>{s.title}</p>
                                    <p className={styles.qSectionDesc}>{s.desc}</p>
                                </div>
                            ))}
                        </div>

                        <p className={styles.body} style={{ marginTop: 20 }}>
                            Every question in the questionnaire has an expandable accordion that shows:
                        </p>
                        <ul className={styles.bullets}>
                            <li><strong>WHAT WE ARE ASKING</strong> — A plain-English explanation of the exact data needed and how it should be formatted.</li>
                            <li><strong>WHY THIS MATTERS</strong> — The business, compliance, or methodological reason this data is important.</li>
                        </ul>
                        <p className={styles.body}>
                            This means suppliers need zero prior knowledge of carbon accounting to contribute accurate, usable data.
                        </p>
                    </section>

                    {/* ── Step 4: Product Portfolio ── */}
                    <section id="step4-portfolio" className={styles.section}>
                        <div className={styles.stepHeader}>
                            <span className={styles.stepBadge} style={{ background: 'rgba(249,115,22,0.12)', color: '#ea580c' }}>STEP 4</span>
                            <h2 className={styles.sectionTitle}>Product Portfolio & Components Master</h2>
                        </div>
                        <p className={styles.body}>
                            Once supplier emissions data is received and validated, it feeds into the <strong>Product Portfolio</strong>.
                            Each product in the portfolio has its own lifecycle emission model built from:
                        </p>
                        <ul className={styles.bullets}>
                            <li><strong>Components Master</strong> — base materials with pre-configured emission factors (e.g., 1 kg virgin aluminium = 8.24 kg CO₂e)</li>
                            <li><strong>Supplier-Provided Data</strong> — Scope 1, 2, and 3 data collected through your questionnaires</li>
                            <li><strong>Document Master</strong> — linked certifications, test reports, and regulatory evidence that back up the data</li>
                        </ul>

                        <div className={styles.calloutGreen}>
                            <div className={styles.calloutIcon}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="10" stroke="#22c55e" strokeWidth="2" />
                                    <path d="M12 8v4M12 16h.01" stroke="#22c55e" strokeWidth="2.2" strokeLinecap="round" />
                                </svg>
                            </div>
                            <div>
                                <p className={styles.calloutTitle}>How Components Master Saves Time</p>
                                <p className={styles.calloutText}>
                                    Instead of re-entering emission factors for common materials every time, the Components Master
                                    stores them once. When you add aluminium to a new product, the correct emission factor is
                                    automatically applied — ensuring consistency across your entire portfolio.
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* ── Step 5: Reports ── */}
                    <section id="step5-reports" className={styles.section}>
                        <div className={styles.stepHeader}>
                            <span className={styles.stepBadge} style={{ background: 'rgba(245,158,11,0.12)', color: '#d97706' }}>STEP 5</span>
                            <h2 className={styles.sectionTitle}>Reports & Analytics — Share Your Results</h2>
                        </div>
                        <p className={styles.body}>
                            The final step is turning all your collected and modeled data into <strong>professional,
                                compliance-ready reports</strong> that can be shared with clients, regulators, or your leadership team.
                        </p>

                        <div className={styles.reportTypes}>
                            {[
                                {
                                    icon: '📊',
                                    title: 'Product Carbon Footprint Report',
                                    desc: 'A full lifecycle emission report for a single product — includes all 7 lifecycle stage breakdowns, data sources, and methodology notes.',
                                    tag: 'PDF + CSV',
                                },
                                {
                                    icon: '🏭',
                                    title: 'Supplier Emission Report',
                                    desc: 'Shows each supplier\'s contribution to your Scope 3 footprint with a donut chart breakdown and individual supplier scorecards.',
                                    tag: 'PDF',
                                },
                                {
                                    icon: '📋',
                                    title: 'Compliance Summary Report',
                                    desc: 'A structured document formatted for regulatory submissions — covers GHG Protocol Scope 1, 2, 3 disclosures with full audit trail.',
                                    tag: 'PDF',
                                },
                                {
                                    icon: '📈',
                                    title: 'Dashboard Export',
                                    desc: 'A one-click snapshot of your current Dashboard — all 4 KPI cards, charts, and client filter applied — formatted for presentations.',
                                    tag: 'PDF',
                                },
                            ].map(r => (
                                <div key={r.title} className={styles.reportCard}>
                                    <span className={styles.reportEmoji}>{r.icon}</span>
                                    <div className={styles.reportInfo}>
                                        <div className={styles.reportTitleRow}>
                                            <p className={styles.reportTitle}>{r.title}</p>
                                            <span className={styles.reportTag}>{r.tag}</span>
                                        </div>
                                        <p className={styles.reportDesc}>{r.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* ── Data Quality Rating ── */}
                    <section id="data-quality" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Data Quality Rating — Trust Your Numbers</h2>
                        <p className={styles.body}>
                            After all data is collected, the <strong>Data Quality Rating</strong> module scores each product's
                            emissions data across four dimensions. This score tells you how much you can trust the PCF value
                            before sharing it externally.
                        </p>

                        <div className={styles.dqGrid}>
                            {[
                                { dimension: 'Completeness', icon: '✅', desc: 'Are all lifecycle stages covered? Are all Scope 1, 2, and 3 categories addressed?' },
                                { dimension: 'Methodology Accuracy', icon: '🎯', desc: 'Are emission factors from recognized databases (ECOINVENT, DEFRA, EPA)? Is the boundary clearly defined?' },
                                { dimension: 'Recency', icon: '📅', desc: 'Was data collected within the current or previous reporting year? Older data scores lower.' },
                                { dimension: 'Verification Status', icon: '🔍', desc: 'Is data self-declared (lower score) or third-party verified by an accredited body (highest score)?' },
                            ].map(d => (
                                <div key={d.dimension} className={styles.dqCard}>
                                    <span className={styles.dqEmoji}>{d.icon}</span>
                                    <p className={styles.dqDimension}>{d.dimension}</p>
                                    <p className={styles.dqDesc}>{d.desc}</p>
                                </div>
                            ))}
                        </div>

                        <p className={styles.body} style={{ marginTop: 20 }}>
                            A composite score from <strong>1 to 5 stars</strong> is displayed on each product card.
                            Aim for 4+ stars before submitting data to external auditors or regulators.
                        </p>
                    </section>

                    {/* ── FAQs ── */}
                    <section id="faq" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Frequently Asked Questions</h2>
                        <div className={styles.faqList}>
                            {FAQS.map(f => <FaqItem key={f.q} q={f.q} a={f.a} />)}
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
                                This article reflects the current Enviguide platform and is updated quarterly. Feature availability
                                may vary by subscription tier. For enterprise features, contact your account manager. Last updated: February 2026.
                            </p>
                        </div>
                    </div>

                    {/* ── Article Footer Nav ── */}
                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/article-what-is-enviguide')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            What is Enviguide?
                        </button>
                        <button className={styles.footerNavBtnNext} onClick={() => navigate('/supplier-questionnaire-guide')}>
                            Supplier Questionnaire Guide
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
