import { useNavigate } from 'react-router-dom'
import styles from './ManualsPCF.module.css'

const MANUALS = [
    { id: 1, title: 'How to get access for the Supplier Questionnaire', path: '/article-supplier-access' },
    { id: 2, title: 'Uploading Data Evidence & Certificates', path: '#' },
]

export default function SupplierManuals() {
    const navigate = useNavigate()

    return (
        <div className={styles.page}>
            <header className={styles.topBar}>
                <button className={styles.backBtn} onClick={() => navigate('/manuals-pcf')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M5 12l7 7M5 12l7-7" />
                    </svg>
                    Back to Manuals
                </button>
            </header>

            <main className={styles.container}>
                <section className={styles.hero}>
                    <div className={styles.badge} style={{ background: '#ecfdf5', color: '#059669', borderColor: '#d1fae5' }}>
                        Supplier Documentation
                    </div>
                    <h1 className={styles.title}>Supplier <span>User Manuals</span></h1>
                    <p className={styles.subtitle}>
                        Guides for external suppliers to handle sustainability requests, upload evidence, and manage compliance tasks.
                    </p>
                </section>

                <div className={styles.grid}>
                    {/* Card 1: Access */}
                    <div className={styles.card} onClick={() => navigate('/article-supplier-access')}>
                        <div className={styles.iconBox} style={{ background: '#ecfdf5', color: '#22c55e' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                                <polyline points="10 17 15 12 10 7" />
                                <line x1="15" y1="12" x2="3" y2="12" />
                            </svg>
                        </div>
                        <h2 className={styles.cardHeadline}>How to get access for the Supplier Questionnaire</h2>
                        <div className={styles.footer}>
                            <span className={styles.number}>DOCUMENT #01</span>
                            <div className={styles.arrow} style={{ background: '#22c55e', color: '#fff' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Guidance */}
                    <div className={styles.card} onClick={() => navigate('/supplier-questionnaire-guide')}>
                        <div className={styles.iconBox} style={{ background: '#ecfdf5', color: '#22c55e' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                            </svg>
                        </div>
                        <h2 className={styles.cardHeadline}>Supplier Questionnaire Guidance</h2>
                        <div className={styles.footer}>
                            <span className={styles.number}>DOCUMENT #02</span>
                            <div className={styles.arrow} style={{ background: '#22c55e', color: '#fff' }}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
