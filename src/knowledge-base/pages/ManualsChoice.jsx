import { useNavigate } from 'react-router-dom'
import styles from './ManualsChoice.module.css'

const CHOICES = [
    {
        id: 'admin',
        title: 'Admin Manuals',
        desc: 'Internal workflows, request processing, and platform administration guides.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4M12 16h.01" />
            </svg>
        ),
        color: '#22c55e',
        path: '/manuals-admin'
    },
    {
        id: 'manufacturer',
        title: 'Manufacturer Manuals',
        desc: 'Product portfolio management, PCF requests, and emission reporting manuals.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18M3 7v14M13 3v18M21 11v10M8 9h2M16 13h2" />
            </svg>
        ),
        color: '#22c55e',
        path: '/manuals-manufacturer'
    },
    {
        id: 'supplier',
        title: 'Supplier Manuals',
        desc: 'Guidance for suppliers on responding to requests and sustainability disclosures.',
        icon: (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        color: '#22c55e',
        path: '/manuals-supplier'
    }
]

export default function ManualsChoice() {
    const navigate = useNavigate()

    return (
        <div className={styles.page}>
            <header className={styles.topBar}>
                <button className={styles.backBtn} onClick={() => navigate('/help-centre')}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 12H5M5 12l7 7M5 12l7-7" />
                    </svg>
                    Help Center
                </button>
            </header>

            <main className={styles.container}>
                <section className={styles.hero}>
                    <div className={styles.badge}>
                        Select Category
                    </div>
                    <h1 className={styles.title}>Knowledge <span>Hub</span></h1>
                    <p className={styles.subtitle}>
                        Find specialized documentation tailored to your specific role or workflow tasks.
                    </p>
                </section>

                <div className={styles.choiceGrid}>
                    {CHOICES.map(choice => (
                        <div
                            key={choice.id}
                            className={styles.choiceCard}
                            onClick={() => navigate(choice.path)}
                            style={{ '--accent-color': choice.color }}
                        >
                            <div
                                className={styles.iconBox}
                                style={{ color: choice.color }}
                            >
                                {choice.icon}
                            </div>

                            <h2 className={styles.cardTitle}>{choice.title}</h2>
                            <p className={styles.cardDesc}>
                                {choice.desc}
                            </p>

                            <div className={styles.exploreBtn} style={{ color: choice.color }}>
                                Explore Guide
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}
