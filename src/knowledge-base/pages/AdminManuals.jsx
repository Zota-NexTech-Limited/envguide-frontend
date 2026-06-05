import { useNavigate } from 'react-router-dom'
import styles from './ManualsPCF.module.css'

const MANUALS = [
    { id: 1, title: 'How to create a Manufacture ?', path: '/admin-article-create-manufacturer' },
    { id: 2, title: 'How to Create a New User ?', path: '/admin-article-create-new-user' },
    { id: 3, title: 'Complete Guide to Manage User Authorizations in Enviguide', path: '/admin-article-manage-authorizations' },
    { id: 4, title: 'How to Add a Product in Enviguide', path: '/admin-article-add-product' },
    { id: 5, title: 'What a Super Admin must do after a Manufacturer submits a PCF request.', path: '/admin-article-pcf-workflow' },
    { id: 6, title: 'What is Data Configuration in Enviguide ?', path: '/admin-article-data-config' },
    { id: 7, title: 'What is Master Data Setup in Enviguide?', path: '/admin-article-master-setup' },
    { id: 8, title: 'What is EcoInvent Emission Factor in Enviguide ?', path: '/admin-article-ecoinvent' },
]

export default function AdminManuals() {
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
                        Admin Documentation
                    </div>
                    <h1 className={styles.title}>Admin <span>User Manuals</span></h1>
                    <p className={styles.subtitle}>
                        Internal guides for platform administrators to manage users, data integrity, and system configurations.
                    </p>
                </section>

                <div className={styles.grid}>
                    {MANUALS.map(manual => (
                        <div key={manual.id} className={styles.card} onClick={() => manual.path !== '#' && navigate(manual.path)}>
                            <div className={styles.iconBox} style={{ background: '#ecfdf5', color: '#22c55e' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                                    <path d="M12 8v4M12 16h.01" />
                                </svg>
                            </div>
                            <h2 className={styles.cardHeadline}>{manual.title}</h2>
                            <div className={styles.footer}>
                                <span className={styles.number}>DOCUMENT #{String(manual.id).padStart(2, '0')}</span>
                                <div className={styles.arrow} style={{ background: manual.path === '#' ? '#f1f5f9' : '#22c55e', color: manual.path === '#' ? '#94a3b8' : '#fff' }}>
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M5 12h14M12 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

            </main >
        </div >
    )
}
