import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from './Support.module.css'

const CATEGORIES = [
    { value: 'technical', label: '🔧 Technical Issue' },
    { value: 'billing', label: '💳 Billing & Subscription' },
    { value: 'data', label: '📊 Data & Reporting' },
    { value: 'account', label: '👤 Account & Access' },
    { value: 'feedback', label: '💬 General Feedback' },
    { value: 'other', label: '📋 Other' },
]

export default function Support() {
    const navigate = useNavigate()
    const [form, setForm] = useState({ name: '', email: '', category: '', description: '' })
    const [errors, setErrors] = useState({})
    const [sending, setSending] = useState(false)
    const [sent, setSent] = useState(false)

    const validate = () => {
        const e = {}
        if (!form.name.trim()) e.name = 'Please enter your name.'
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Please enter a valid email.'
        if (!form.category) e.category = 'Please select a category.'
        if (!form.description.trim()) e.description = 'Please describe your issue.'
        return e
    }

    const handleChange = (field, value) => {
        setForm(f => ({ ...f, [field]: value }))
        if (errors[field]) setErrors(e => ({ ...e, [field]: undefined }))
        if (errors.submit) setErrors(e => ({ ...e, submit: undefined }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        const errs = validate()
        if (Object.keys(errs).length) { setErrors(errs); return }

        setSending(true)

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Accept: "application/json",
                },
                body: JSON.stringify({
                    access_key: import.meta.env.VITE_WEB3FORMS_KEY || "YOUR_ACCESS_KEY_HERE",
                    name: form.name,
                    email: form.email,
                    subject: `Support: ${CATEGORIES.find(c => c.value === form.category)?.label || form.category}`,
                    message: form.description,
                    from_name: "Enviguide Dashboard"
                }),
            });

            const result = await response.json();
            if (result.success) {
                setSent(true);
            } else {
                setErrors({ submit: result.message || "Something went wrong. Please try again." });
            }
        } catch {
            setErrors({ submit: "Network error. Please try again later." });
        } finally {
            setSending(false)
        }
    }

    return (
        <div className={styles.page}>

            {/* Slim Top Bar */}
            <div className={styles.topBar}>
                <button className={styles.backBtn} onClick={() => navigate('/help-centre')}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Back to Help Centre
                </button>
                <div className={styles.topBarBrand}>
                    <div className={styles.brandIcon}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <span className={styles.brandName}>Enviguide Support</span>
                </div>
            </div>

            {/* Page Body */}
            <div className={styles.wrapper}>

                {/* Hero */}
                <div className={styles.hero}>
                    <div className={styles.heroBadge}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Support Center
                    </div>
                    <h1 className={styles.heroTitle}>How can we help you?</h1>
                    <p className={styles.heroSub}>
                        Our team typically responds within 24 hours. Fill in the form and we'll get back to you.
                    </p>
                </div>

                {/* Content Grid */}
                <div className={styles.grid}>

                    {/* Left Column */}
                    <div className={styles.leftCol}>

                        {/* Direct Support */}
                        <div className={styles.infoCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardIconWrap}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.01 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <span className={styles.cardTitle}>Direct Support</span>
                            </div>
                            <p className={styles.cardText}>Prefer email? Reach out directly to our support team.</p>
                            <a href="mailto:help@enviguide.com" className={styles.emailLink}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    <path d="M22 6l-10 7L2 6" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                info@enviguide.com
                            </a>
                        </div>

                        {/* Quick Links */}
                        <div className={styles.infoCard}>
                            <div className={styles.cardHeader}>
                                <span className={styles.cardIconWrap}>
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <span className={styles.cardTitle}>Quick Links</span>
                            </div>
                            <ul className={styles.linksList}>
                                {[
                                    { icon: 'info', label: 'Help Centre & FAQs', path: '/help-centre' },
                                    { icon: 'book', label: 'PCF User Manuals', path: '/manuals-pcf' },
                                    { icon: 'users', label: 'Manufacturer Manuals', path: '/manuals-manufacturer' },
                                    { icon: 'shield', label: 'Supplier Manuals', path: '/manuals-supplier' },
                                ].map(({ icon, label, path }) => (
                                    <li key={label}>
                                        <button
                                            className={styles.quickLink}
                                            onClick={() => path ? navigate(path) : null}
                                            style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', padding: '6px 10px' }}
                                        >
                                            <span className={styles.quickLinkLeft}>
                                                <QuickIcon type={icon} />
                                                {label}
                                            </span>
                                            <svg className={styles.quickArrow} width="12" height="12" viewBox="0 0 24 24" fill="none">
                                                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                    </div>

                    {/* Right Column — Form / Success */}
                    <div className={styles.formCard}>
                        {!sent ? (
                            <form onSubmit={handleSubmit} noValidate>

                                <div className={styles.formCardHeader}>
                                    <h2 className={styles.formCardTitle}>Send us a message</h2>
                                    <p className={styles.formCardSub}>Fill in the details below and we'll respond promptly.</p>
                                </div>

                                {/* Name + Email */}
                                <div className={styles.formRow}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} htmlFor="sup-name">Full Name</label>
                                        <input
                                            id="sup-name"
                                            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                                            placeholder="Enter your full name"
                                            value={form.name}
                                            onChange={e => handleChange('name', e.target.value)}
                                        />
                                        {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
                                    </div>

                                    <div className={styles.formGroup}>
                                        <label className={styles.label} htmlFor="sup-email">Email Address</label>
                                        <input
                                            id="sup-email"
                                            type="email"
                                            className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                                            placeholder="example@domain.com"
                                            value={form.email}
                                            onChange={e => handleChange('email', e.target.value)}
                                        />
                                        {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
                                    </div>
                                </div>

                                {/* Category — Pill Chips */}
                                <div className={styles.formGroup} style={{ marginBottom: '22px' }}>
                                    <label className={styles.label}>Issue Category</label>
                                    <div className={styles.chipGrid}>
                                        {CATEGORIES.map(c => (
                                            <button
                                                key={c.value}
                                                type="button"
                                                className={`${styles.chip} ${form.category === c.value ? styles.chipActive : ''}`}
                                                onClick={() => handleChange('category', c.value)}
                                            >
                                                {c.label}
                                            </button>
                                        ))}
                                    </div>
                                    {errors.category && <span className={styles.fieldError}>{errors.category}</span>}
                                </div>

                                {/* Description */}
                                <div className={styles.formGroup} style={{ marginBottom: '22px' }}>
                                    <div className={styles.descHeader}>
                                        <label className={styles.label} htmlFor="sup-desc">Description</label>
                                        <span className={styles.charCount} style={{ color: form.description.length > 450 ? '#ef4444' : '#9ca3af' }}>
                                            {form.description.length} / 500
                                        </span>
                                    </div>
                                    <textarea
                                        id="sup-desc"
                                        className={`${styles.textarea} ${errors.description ? styles.inputError : ''}`}
                                        placeholder="Describe your issue in detail so we can help you faster..."
                                        maxLength={500}
                                        value={form.description}
                                        onChange={e => handleChange('description', e.target.value)}
                                    />
                                    {errors.description && <span className={styles.fieldError}>{errors.description}</span>}
                                </div>

                                {/* Submit */}
                                {errors.submit && (
                                    <div className={styles.fieldError} style={{
                                        textAlign: 'center',
                                        marginBottom: '15px',
                                        padding: '10px',
                                        background: '#fef2f2',
                                        borderRadius: '8px',
                                        border: '1px solid #fee2e2'
                                    }}>
                                        {errors.submit}
                                    </div>
                                )}
                                <button type="submit" className={styles.sendBtn} disabled={sending}>
                                    {sending ? (
                                        <>
                                            <span className={styles.spinner} />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            Send Message
                                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none">
                                                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </>
                                    )}
                                </button>
                                <p className={styles.disclaimer}>By submitting, you agree to our terms and privacy policy.</p>
                            </form>
                        ) : (
                            <div className={styles.successState}>
                                <div className={styles.successIcon}>
                                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                        <path d="M20 6L9 17l-5-5" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                                <h2 className={styles.successTitle}>Message Sent!</h2>
                                <p className={styles.successDesc}>
                                    Thank you for reaching out. Our team will get back to you within 24 hours.
                                </p>
                                <button className={styles.successBackBtn} onClick={() => navigate('/help-centre')}>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                        <path d="M19 12H5M5 12l7 7M5 12l7-7" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                    Back to Help Centre
                                </button>
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    )
}

function QuickIcon({ type }) {
    if (type === 'info') return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
    )
    if (type === 'users') return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 11a4 4 0 100-8 4 4 0 000 8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
    if (type === 'book') return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
    return (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}
