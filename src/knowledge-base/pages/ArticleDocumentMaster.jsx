import { useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import styles from './Article.module.css'

const SECTIONS = [
    { id: 'understanding', label: '1. What is Document Master?' },
    { id: 'access', label: '2. How to Access' },
    { id: 'interface', label: '3. Exploring the Interface' },
    { id: 'types', label: '4. Document Types' },
    { id: 'actions', label: '5. View and Edit' },
    { id: 'workflow', label: '6. The Workflow' },
]

export default function ArticleDocumentMaster() {
    const navigate = useNavigate()
    const [activeSection, setActiveSection] = useState('understanding')

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
                        <span className={styles.breadCurrent}>Document Master</span>
                    </div>

                    <header className={styles.articleHeader}>
                        <span className={styles.articleTag}>USER GUIDE</span>
                        <h1 className={styles.articleTitle}>Document Master</h1>
                        <p className={styles.articleSubtitle}>
                            The centralized hub for organizing and managing technical specifications and product visual evidence.
                        </p>
                    </header>

                    <section id="understanding" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Section 1: Understanding Document Master</h2>
                        <p className={styles.body}>
                            Document Master is a specialized feature in Enviguide that functions as a single, <strong>unified repository</strong> for all supporting documents and visual media associated with your PCF records.
                        </p>
                        <div className={styles.calloutGreen}>
                            <div className={styles.calloutIcon}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            <div>
                                <h4 className={styles.calloutTitle}>Centralized Hub</h4>
                                <p className={styles.calloutText}>
                                    Any technical specifications or photos you upload during the PCF creation process automatically appear here for easy management.
                                </p>
                            </div>
                        </div>
                        <p className={styles.body}>Key Purposes:</p>
                        <ul className={styles.bullets}>
                            <li>Centralized storage and retrieval of product documentation</li>
                            <li>Organized archive for audit trails and compliance</li>
                            <li>Quick verification of supporting evidence</li>
                            <li>Simplified management across multiple PCF requests</li>
                        </ul>
                    </section>

                    <section id="access" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Section 2: How to Access Document Master</h2>
                        <div className={styles.numberedSteps}>
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>1</div>
                                <div className={styles.stepBody}>
                                    <div className={styles.stepTitle}>Login to Enviguide</div>
                                    <p>Navigate to the Management Suite and use your credentials.</p>
                                </div>
                            </div>
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>2</div>
                                <div className={styles.stepBody}>
                                    <div className={styles.stepTitle}>Navigate from Dashboard</div>
                                    <p>Look at the left-side navigation sidebar.</p>
                                </div>
                            </div>
                            <div className={styles.numberedStep}>
                                <div className={styles.stepCircle}>3</div>
                                <div className={styles.stepBody}>
                                    <div className={styles.stepTitle}>Click Document Master</div>
                                    <p>Find the link at the fourth position in the navigation menu.</p>
                                </div>
                            </div>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/dm_access_sidebar.png" alt="Sidebar Navigation" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Image #1: Document Master Menu Location</p>
                        </div>
                    </section>

                    <section id="interface" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Section 3: Exploring the Interface</h2>
                        <h3 className={styles.body}>A. Status Summary Cards</h3>
                        <p className={styles.body}>At the top of the page, you will see four colored status indicators:</p>
                        <div className={styles.dqGrid}>
                            <div className={styles.dqCard}>
                                <span className={styles.dqEmoji}>📑</span>
                                <h4 className={styles.dqDimension}>Total Documents</h4>
                                <p className={styles.dqDesc}>Complete count across all PCF records.</p>
                            </div>
                            <div className={styles.dqCard}>
                                <span className={styles.dqEmoji}>✅</span>
                                <h4 className={styles.dqDimension}>Approved</h4>
                                <p className={styles.dqDesc}>Verified and compliant documentation.</p>
                            </div>
                            <div className={styles.dqCard}>
                                <span className={styles.dqEmoji}>⏳</span>
                                <h4 className={styles.dqDimension}>In Progress</h4>
                                <p className={styles.dqDesc}>Files still under review or processing.</p>
                            </div>
                            <div className={styles.dqCard}>
                                <span className={styles.dqEmoji}>❌</span>
                                <h4 className={styles.dqDimension}>Rejected</h4>
                                <p className={styles.dqDesc}>Declined or non-compliant documents.</p>
                            </div>
                        </div>
                        <div className={styles.imageContainer}>
                            <img src="/dm_status_cards.png" alt="Status Cards" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Image #2: Status Summary Indicators</p>
                        </div>

                        <h3 className={styles.body} style={{ marginTop: '32px' }}>B. PCF Documents Table</h3>
                        <p className={styles.body}>The table displays PCF requests with their associated document counts and last modified dates:</p>
                        <div className={styles.imageContainer}>
                            <img src="/dm_documents_table.png" alt="Documents Table" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Image #3: PCF Documents Main Table</p>
                        </div>

                        <h3 className={styles.body} style={{ marginTop: '32px' }}>C. Search and Filter Options</h3>
                        <p className={styles.body}>Use the search bar at the top right to find specific product IDs or names quickly.</p>
                        <div className={styles.imageContainer}>
                            <img src="/dm_search_filters.png" alt="Search and Filters" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Image #4: Search, Filters, and Pagination</p>
                        </div>
                    </section>

                    <section id="types" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Section 4: Document Types and Categories</h2>
                        <p className={styles.body}>Document Master organizes your files into two primary categories:</p>
                        <div className={styles.rolesGrid}>
                            <div className={styles.roleCard}>
                                <span className={styles.roleEmoji}>📘</span>
                                <div>
                                    <div className={styles.roleName}>Technical Specifications (Specs)</div>
                                    <p className={styles.roleDesc}>PDF, Word, or Excel sheets covering datasheets, certifications, and test reports.</p>
                                </div>
                            </div>
                            <div className={styles.roleCard}>
                                <span className={styles.roleEmoji}>🖼️</span>
                                <div>
                                    <div className={styles.roleName}>Product Images (Images)</div>
                                    <p className={styles.roleDesc}>Visual media including photography, label screenshots, and facility photos.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section id="actions" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Section 5: Action Buttons - View and Edit</h2>
                        <p className={styles.body}>
                            Every PCF record has a green <strong>"View / Edit"</strong> button on the right.
                        </p>
                        <div className={styles.imageContainer}>
                            <img src="/dm_view_edit_button.png" alt="Action Button Location" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Image #5: Locate the View / Edit button</p>
                        </div>

                        <h3 className={styles.body} style={{ marginTop: '32px' }}>A. The Detail Panel</h3>
                        <p className={styles.body}>Clicking the button opens a detailed side panel on the right side of the screen.</p>
                        <div className={styles.imageContainer}>
                            <img src="/dm_detail_panel.png" alt="Detail Panel" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Image #6: The PCF Detail Panel</p>
                        </div>

                        <h3 className={styles.body} style={{ marginTop: '32px' }}>B. Technical Specifications</h3>
                        <p className={styles.body}>Access clickable links for all technical documents associated with the request.</p>
                        <div className={styles.imageContainer}>
                            <img src="/dm_tech_specs.png" alt="Technical Specifications List" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Image #7: Folder view for specification documents</p>
                        </div>

                        <h3 className={styles.body} style={{ marginTop: '32px' }}>C. Product Images</h3>
                        <p className={styles.body}>View thumbnail previews of all product visual evidence.</p>
                        <div className={styles.imageContainer}>
                            <img src="/dm_product_images.png" alt="Product Images Gallery" className={styles.articleImage} />
                            <p className={styles.imageCaption}>Image #8: Thumbnail gallery for images</p>
                        </div>
                    </section>

                    <section id="workflow" className={styles.section}>
                        <h2 className={styles.sectionTitle}>Section 6: Workflow - From Upload to Master</h2>
                        <p className={styles.body}>How documents get into Document Master:</p>
                        <div className={styles.whyList}>
                            <div className={styles.whyItem}>
                                <div className={styles.whyNum}>01</div>
                                <div>
                                    <div className={styles.whyTitle}>Create Request</div>
                                    <p className={styles.whyBody}>Start a new PCF request in the portal.</p>
                                </div>
                            </div>
                            <div className={styles.whyItem}>
                                <div className={styles.whyNum}>02</div>
                                <div>
                                    <div className={styles.whyTitle}>Upload Documents</div>
                                    <p className={styles.whyBody}>Attach your specs and images during the creation process.</p>
                                </div>
                            </div>
                            <div className={styles.whyItem}>
                                <div className={styles.whyNum}>03</div>
                                <div>
                                    <div className={styles.whyTitle}>Automatic Sync</div>
                                    <p className={styles.whyBody}>Files are instantly categorized and visible in Document Master.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className={styles.section} style={{ borderTop: '1px solid #f3f4f6', paddingTop: '40px' }}>
                        <p className={styles.body} style={{ fontStyle: 'italic', color: '#6b7280' }}>
                            This comprehensive guide covers all aspects of Document Master functionality and should serve as your complete reference for understanding and using this essential feature in Enviguide PCF management.
                        </p>
                    </section>
                    <div className={styles.articleFooterNav}>
                        <button className={styles.footerNavBtn} onClick={() => navigate('/article-component-master')}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Previous: Component Master
                        </button>
                        <button className={styles.footerNavBtnNext} onClick={() => navigate('/manuals-manufacturer')}>
                            Back to Manuals
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
