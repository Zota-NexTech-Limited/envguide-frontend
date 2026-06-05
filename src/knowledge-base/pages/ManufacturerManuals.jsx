import { useNavigate } from 'react-router-dom'
import styles from './ManualsPCF.module.css'

const MANUALS = [
    { id: 1, title: 'How to Get Access to Enviguide', path: '/article-get-access' },
    { id: 2, title: 'How to Add a Product to the Product Portfolio', path: '/article-add-product' },
    { id: 3, title: 'How to Create a PCF Request for a product', path: '/article-create-pcf-request' },
    { id: 4, title: 'PCF Request Processing Workflow & Admin Actions', path: '/article-pcf-workflow' },
    { id: 5, title: 'How to Add Own Emissions (Manufacturer Own Emissions Questionnaire)', path: '/article-own-emissions' },
    { id: 6, title: 'Component Master', path: '/article-component-master' },
    { id: 7, title: 'Document Master', path: '/article-document-master' },
]

export default function ManufacturerManuals() {
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
                    <div className={styles.badge}>
                        Manufacturer Documentation
                    </div>
                    <h1 className={styles.title}>Manufacturer <span>User Manuals</span></h1>
                    <p className={styles.subtitle}>
                        Master the Product Carbon Footprint workflows with our detailed, step-by-step guidance manuals specifically for manufacturers.
                    </p>
                </section>

                <div className={styles.grid}>
                    {MANUALS.map(manual => (
                        <div key={manual.id} className={styles.card} onClick={() => manual.path && navigate(manual.path)}>
                            <div className={styles.iconBox}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                    <polyline points="14 2 14 8 20 8" />
                                    <line x1="16" y1="13" x2="8" y2="13" />
                                    <line x1="16" y1="17" x2="8" y2="17" />
                                    <polyline points="10 9 9 9 8 9" />
                                </svg>
                            </div>
                            <h2 className={styles.cardHeadline}>{manual.title}</h2>
                            <div className={styles.footer}>
                                <span className={styles.number}>DOCUMENT #0{manual.id}</span>
                                <div className={styles.arrow}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
