import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'intro', label: '1. What is Component Master?' },
    { id: 'access', label: '2. How to Get to it?' },
    { id: 'dashboard', label: '3. Status Dashboard' },
    { id: 'columns', label: '4. Understanding Columns' },
    { id: 'details', label: '5. Detailed View' },
    { id: 'download', label: '6. Download PCF' },
]

export default function ArticleComponentMaster() {
    const navigate = useNavigate()
    const [activeSection, setActiveSection] = useState('intro')

    useEffect(() => {
        const handleScroll = () => {
            const sectionElements = SECTIONS.map(s => document.getElementById(s.id))
            const scrollPosition = window.scrollY + 100

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
        if (el) {
            window.scrollTo({
                top: el.offsetTop - 80,
                behavior: 'smooth'
            })
        }
    }

    return (
        <div className={styles.page}>
            <header className={styles.topBar}>
                <button className={styles.backBtn} onClick={() => navigate('/manuals-manufacturer')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M5 12l7 7M5 12l7-7" />
                    </svg>
                    Back to Manuals
                </button>
            </header>

            <div className={styles.layout}>
                <aside className={styles.toc}>
                    <div className={styles.tocLabel}>CONTENTS</div>
                    <nav className={styles.tocNav}>
                        {SECTIONS.map(section => (
                            <a
                                key={section.id}
                                href={`#${section.id}`}
                                className={`${styles.tocLink} ${activeSection === section.id ? styles.tocLinkActive : ''}`}
                                onClick={(e) => {
                                    e.preventDefault()
                                    scrollToSection(section.id)
                                }}
                            >
                                {section.label}
                            </a>
                        ))}
                    </nav>
                </aside>

                <article className={styles.article}>
                    <div className={styles.breadcrumb}>
                        <button className={styles.breadLink} onClick={() => navigate('/manuals-pcf')}>Manuals</button>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <button className={styles.breadLink} onClick={() => navigate('/manuals-manufacturer')}>Manufacturer</button>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2.5">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                        <span className={styles.breadCurrent}>Component Master</span>
                    </div>

                    <header className={styles.articleHeader}>
                        <span className={styles.articleTag}>USER GUIDE</span>
                        <h1 className={styles.articleTitle}>Component Master</h1>
                        <p className={styles.articleSubtitle}>
                            A beginner's guide to understanding and using the Component Master "Warehouse" in Enviguide.
                        </p>
                    </header>

                    <section id="intro" className={styles.section}>
                        <h2 className={styles.sectionTitle}>What is Component Master?</h2>
                        <p className={styles.body}>
                            Component Master is like a <strong>"warehouse"</strong> or <strong>"storage place"</strong> where you can see all the information about every component (product part) that your company is working with. Think of it as a big register where all the environmental data about each component is kept and organized.
                        </p>
                        <div className={styles.calloutGreen}>
                            <div className={styles.calloutIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                </svg>
                            </div>
                            <div>
                                <h4 className={styles.calloutTitle}>Centralized Data</h4>
                                <p className={styles.calloutText}>
                                    When you submit a PCF (Product Carbon Footprint) request, all information gets saved here. Whenever you want to check status or results, come to Component Master.
                                </p>
                            </div>
                        </div>
                        <p className={styles.body}>In Component Master, you will see:</p>
                        <ul className={styles.bullets}>
                            <li>All components that your company is tracking</li>
                            <li>The status of each PCF request (Complete, In progress, or Rejected)</li>
                            <li>The PCF certificate data (environmental impact numbers)</li>
                            <li>The document/certificate files you can download</li>
                            <li>Detailed specifications for each component</li>
                        </ul>
                    </section>

                    <section id="access" className={styles.section}>
                        <h2 className={styles.sectionTitle}>How to Get to Component Master?</h2>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>1</div>
                                <div className={styles.stepBody}>
                                    <div className={styles.stepTitle}>Open Enviguide</div>
                                    <p>Login to your account to see the main dashboard.</p>
                                </div>
                            </div>
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>2</div>
                                <div className={styles.stepBody}>
                                    <div className={styles.stepTitle}>Navigate Menu</div>
                                    <p>Look at the left-side navigation menu for "Components Master".</p>
                                </div>
                            </div>
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>3</div>
                                <div className={styles.stepBody}>
                                    <div className={styles.stepTitle}>Enter the Warehouse</div>
                                    <p>Click the option to enter the master registry.</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/component_master_menu.png" alt="Navigation Menu" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Navigation to Component Master</p>
                        </div>
                    </section>

                    <section id="dashboard" className={styles.section}>
                        <h2 className={styles.sectionTitle}>What do you see when you open Component Master?</h2>
                        <p className={styles.body}>
                            At the top of the page, you will see a <strong>STATUS DASHBOARD</strong>. This is a quick summary of all your components divided into four categories:
                        </p>
                        <div className={styles.dqGrid}>
                            <div className={styles.dqCard}>
                                <span className={styles.dqEmoji}>📊</span>
                                <h4 className={styles.dqDimension}>Total Components</h4>
                                <p className={styles.dqDesc}>The collective number of unique components in your register.</p>
                            </div>
                            <div className={styles.dqCard}>
                                <span className={styles.dqEmoji}>✅</span>
                                <h4 className={styles.dqDimension}>Approved</h4>
                                <p className={styles.dqDesc}>Components with verified, completed environmental data.</p>
                            </div>
                            <div className={styles.dqCard}>
                                <span className={styles.dqEmoji}>⏳</span>
                                <h4 className={styles.dqDimension}>In Progress</h4>
                                <p className={styles.dqDesc}>Components currently undergoing PCF calculation or review.</p>
                            </div>
                            <div className={styles.dqCard}>
                                <span className={styles.dqEmoji}>❌</span>
                                <h4 className={styles.dqDimension}>Rejected</h4>
                                <p className={styles.dqDesc}>Components where data submitted was incomplete or incorrect.</p>
                            </div>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/component_master_dashboard.png" alt="Status Dashboard" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Component Status Dashboard</p>
                        </div>
                    </section>

                    <section id="columns" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Understanding the Columns</h2>
                        <p className={styles.body}>
                            When you scroll the table to the right, you will see many detailed columns. Here are the most critical ones to track:
                        </p>
                        <div className={styles.whyList}>
                            <div className={styles.whyItem}>
                                <div className={styles.whyNum}>01</div>
                                <div>
                                    <div className={styles.whyTitle}>Product & Category</div>
                                    <p className={styles.whyBody}>Shows the main product name, code, and category (Interior/Exterior/etc.)</p>
                                </div>
                            </div>
                            <div className={styles.whyItem}>
                                <div className={styles.whyNum}>02</div>
                                <div>
                                    <div className={styles.whyTitle}>Specifications</div>
                                    <p className={styles.whyBody}>Includes Component Name, Weight (in grams), and Material Category.</p>
                                </div>
                            </div>
                            <div className={styles.whyItem}>
                                <div className={styles.whyNum}>03</div>
                                <div>
                                    <div className={styles.whyTitle}>Environmental Metrics</div>
                                    <p className={styles.whyBody}>Tracks Material, Production, Transport, and Logistics emissions (kg CO2e).</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/component_master_columns.png" alt="Table Columns" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Scrolling right to see environmental metrics</p>
                        </div>
                    </section>

                    <section id="details" className={styles.section}>
                        <h2 className={styles.sectionTitle}>What happens when you click "VIEW"?</h2>
                        <p className={styles.body}>
                            Clicking the green <strong>View</strong> button takes you to the Detail Page, which contains three specialized tabs.
                        </p>
                        <div className={styles.imageContainer}>
                            <img src="/component_master_view_btn.png" alt="View Button" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Accessing component details</p>
                        </div>

                        <div className={styles.reportTypes}>
                            <div className={styles.reportCard}>
                                <span className={styles.reportEmoji}>📋</span>
                                <div className={styles.reportInfo}>
                                    <div className={styles.reportTitleRow}>
                                        <span className={styles.reportTitle}>Tab 1: OVERVIEW</span>
                                        <span className={styles.reportTag}>BASIC INFO</span>
                                    </div>
                                    <p className={styles.reportDesc}>Basic status, product type, creation date, and Bill of Materials.</p>
                                </div>
                            </div>
                            <div className={styles.reportCard}>
                                <span className={styles.reportEmoji}>📊</span>
                                <div className={styles.reportInfo}>
                                    <div className={styles.reportTitleRow}>
                                        <span className={styles.reportTitle}>Tab 2: PCF DATA</span>
                                        <span className={styles.reportTag}>RESULTS</span>
                                    </div>
                                    <p className={styles.reportDesc}>Primary carbon footprint result and breakdown (Material/Logistics/Waste).</p>
                                </div>
                            </div>
                            <div className={styles.reportCard}>
                                <span className={styles.reportEmoji}>📜</span>
                                <div className={styles.reportInfo}>
                                    <div className={styles.reportTitleRow}>
                                        <span className={styles.reportTitle}>Tab 3: CERTIFICATES</span>
                                        <span className={styles.reportTag}>DOCUMENTS</span>
                                    </div>
                                    <p className={styles.reportDesc}>Downloadable PDF certificates and supporting evidence files.</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/component_master_pcf_tab.png" alt="PCF Data Tab" className={styles.articleImage} />
                            <p className={styles.imageCaption}>The PCF Data Results Breakdown</p>
                        </div>
                    </section>

                    <section id="download" className={styles.section}>
                        <h2 className={styles.sectionTitle}>How to Download the PCF Certificate</h2>
                        <div className={styles.calloutBlue}>
                            <div className={styles.calloutIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2.5">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                    <polyline points="7 10 12 15 17 10" />
                                    <line x1="12" y1="15" x2="12" y2="3" />
                                </svg>
                            </div>
                            <div>
                                <h4 className={styles.calloutTitle}>Exporting Reports</h4>
                                <p className={styles.calloutText}>
                                    Once status is <strong>COMPLETED</strong>, you can export the full sustainability report from the certificates or data tab.
                                </p>
                            </div>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/component_master_export.png" alt="Export Certificate" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Exporting the final PCF Report</p>
                        </div>
                    </section>
                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/article-own-emissions')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Previous: Own Emissions
                        </button>
                        <button className={styles.footerNavBtnNext} onClick={() => navigate('/article-document-master')}>
                            Next: Document Master
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </button>
                    </div>
                </article>
            </div>


        </div >
    )
}
