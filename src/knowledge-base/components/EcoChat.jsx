import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../pages/HelpCentre.module.css'
import { getApiBaseUrl } from '../../lib/apiBaseUrl'

/* Friendly animated AI support character (blinking + waving; sleeps when idle) */
function AiHuman({ className, idPrefix = 'ai', wave = true, sleeping = false }) {
    const torso = `${idPrefix}-torso`
    const skin = `${idPrefix}-skin`
    const face = `${idPrefix}-face`
    return (
        <svg className={className} viewBox="0 0 64 64" fill="none" aria-hidden="true">
            <defs>
                <linearGradient id={torso} x1="14" y1="44" x2="50" y2="64" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#34d399" />
                    <stop offset="1" stopColor="#059669" />
                </linearGradient>
                <linearGradient id={skin} x1="22" y1="16" x2="42" y2="40" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#ffe0c2" />
                    <stop offset="1" stopColor="#f6c89a" />
                </linearGradient>
                <clipPath id={face}><circle cx="32" cy="26" r="12.5" /></clipPath>
            </defs>

            {/* shoulders / torso */}
            <path d="M13 63c0-11 8.5-17 19-17s19 6 19 17Z" fill={`url(#${torso})`} />
            <path d="M26 47c2 3 10 3 12 0" stroke="#ffffff" strokeWidth="1.6" strokeLinecap="round" opacity="0.85" />
            {/* neck */}
            <rect x="28.5" y="35" width="7" height="9" rx="3.5" fill="#f6c89a" />

            {/* head */}
            <circle cx="32" cy="26" r="12.5" fill={`url(#${skin})`} />
            <circle cx="19.8" cy="27" r="2.4" fill="#f6c89a" />
            <circle cx="44.2" cy="27" r="2.4" fill="#f6c89a" />
            {/* hair */}
            <path d="M19.5 24c0-8 5.5-13.5 12.5-13.5S44.5 16 44.5 24c-1.2-2-3.5-3-6-3-2.4-2.6-11-3.4-14.5.6-2.2.1-4.3 1-4.5 2.4Z" fill="#374151" clipPath={`url(#${face})`} />
            <path d="M19.5 24c0-8 5.5-13.5 12.5-13.5S44.5 16 44.5 24c-1.2-2-3.5-3-6-3-2.4-2.6-11-3.4-14.5.6-2.2.1-4.3 1-4.5 2.4Z" fill="#374151" />

            {/* eyes — open & blinking, or closed when sleeping */}
            {sleeping ? (
                <g stroke="#1f2937" strokeWidth="1.8" strokeLinecap="round" fill="none">
                    <path d="M24.5 25.6c1.5 1.8 3.5 1.8 5 0" />
                    <path d="M34.5 25.6c1.5 1.8 3.5 1.8 5 0" />
                </g>
            ) : (
                <g className={styles.avatarEyes}>
                    <circle cx="27" cy="25.5" r="1.8" fill="#1f2937" />
                    <circle cx="37" cy="25.5" r="1.8" fill="#1f2937" />
                    <circle cx="27.7" cy="24.9" r="0.6" fill="#fff" />
                    <circle cx="37.7" cy="24.9" r="0.6" fill="#fff" />
                </g>
            )}
            {/* cheeks */}
            <circle cx="24.5" cy="30" r="2.2" fill="#fca5a5" opacity="0.55" />
            <circle cx="39.5" cy="30" r="2.2" fill="#fca5a5" opacity="0.55" />
            {/* mouth — gentle smile, or small "o" when sleeping */}
            {sleeping ? (
                <ellipse cx="32" cy="32" rx="1.6" ry="2.1" fill="#1f2937" opacity="0.8" />
            ) : (
                <path d="M27.5 30.5c2 2.4 7 2.4 9 0" stroke="#1f2937" strokeWidth="1.8" strokeLinecap="round" />
            )}

            {/* headset */}
            <path d="M20 26a12 12 0 0 1 24 0" stroke="#10b981" strokeWidth="2.6" strokeLinecap="round" />
            <rect x="17" y="23.5" width="5.5" height="9" rx="2.75" fill="#10b981" />
            <rect x="41.5" y="23.5" width="5.5" height="9" rx="2.75" fill="#10b981" />
            <path d="M45 30v2.5c0 3.2-3 5.5-7.5 5.5" stroke="#10b981" strokeWidth="2.2" strokeLinecap="round" />
            <circle cx="37" cy="38" r="1.7" fill="#10b981" />

            {/* arm — waves when active, rests when sleeping */}
            {sleeping ? (
                <path d="M47 49c4 1 7 4 8 9" stroke={`url(#${torso})`} strokeWidth="6.5" strokeLinecap="round" />
            ) : (
                <g className={wave ? styles.wavingArm : undefined}>
                    <path d="M48 50c5-1 8.5-5 10-11" stroke={`url(#${torso})`} strokeWidth="6.5" strokeLinecap="round" />
                    <circle cx="58.5" cy="36" r="5" fill="#ffe0c2" />
                    <path d="M56 32.5l1-2M59 32l.4-2M61 33l1-1.6" stroke="#f6c89a" strokeWidth="1.6" strokeLinecap="round" />
                </g>
            )}

            {/* floating Zzz when sleeping */}
            {sleeping && (
                <g className={styles.sleepZ} fill="#0f766e" fontWeight="800" fontFamily="inherit">
                    <text className={styles.zA} x="44" y="16" fontSize="7">z</text>
                    <text className={styles.zB} x="49" y="11" fontSize="9">z</text>
                    <text className={styles.zC} x="55" y="6" fontSize="11">Z</text>
                </g>
            )}
        </svg>
    )
}

/**
 * Global floating Eco AI chat widget. Mounted once per layout so it is
 * available on every page. Self-contained: own state machine, API call,
 * and outside-click handling.
 */
export default function EcoChat() {
    const navigate = useNavigate()
    const chatRef = useRef(null)
    const chatBodyRef = useRef(null)
    const sleepTimer = useRef(null)

    const [isChatOpen, setIsChatOpen] = useState(false)
    const [chatInput, setChatInput] = useState('')
    // Assistant state machine: 'idle' | 'thinking' | 'searching' | 'typing' | 'sleeping'
    const [mode, setMode] = useState('idle')
    const [messages, setMessages] = useState([
        { role: 'ai', text: "Hi there! 🌱 I'm Eco AI, your assistant for the PCF Supplier Intelligence Suite. Ask me anything, or pick a context below and I'll connect you with the right help." },
    ])

    const busy = mode === 'thinking' || mode === 'searching' || mode === 'typing'

    const scheduleSleep = () => {
        clearTimeout(sleepTimer.current)
        sleepTimer.current = setTimeout(() => setMode((m) => (m === 'idle' ? 'sleeping' : m)), 22000)
    }
    const wake = () => {
        setMode((m) => (m === 'sleeping' ? 'idle' : m))
        scheduleSleep()
    }

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (chatRef.current && !chatRef.current.contains(event.target)) {
                setIsChatOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    // Auto-scroll to the newest message
    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
        }
    }, [messages, mode])

    // Start/stop the idle-sleep timer with the chat panel
    useEffect(() => {
        if (isChatOpen) {
            setMode('idle')
            scheduleSleep()
        } else {
            clearTimeout(sleepTimer.current)
        }
        return () => clearTimeout(sleepTimer.current)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isChatOpen])

    const buildReply = (text) => {
        const t = text.toLowerCase()
        if (/\b(hi|hello|hey|hii|yo)\b/.test(t)) {
            return "Hey! 👋 Great to see you. What would you like help with today — PCF reports, supplier questionnaires, or something else?"
        }
        if (t.includes('pcf') || t.includes('carbon') || t.includes('footprint') || t.includes('emission')) {
            return "For Product Carbon Footprints, the PCF Manuals walk you through every step. Want me to open the PCF guidance, or connect you with a Manufacturer Consultant?"
        }
        if (t.includes('questionnaire') || t.includes('supplier')) {
            return "Supplier questionnaire trouble? A Supplier Consultant can help directly. Tap “Supplier Consultant” below and I'll route you there."
        }
        if (t.includes('api') || t.includes('key') || t.includes('token')) {
            return "You'll find API key setup under the API documentation. Need a hand generating one?"
        }
        if (t.includes('contact') || t.includes('human') || t.includes('agent') || t.includes('support') || t.includes('email')) {
            return "Of course — our team replies within 24 hours. I can take you to the Support form, or you can email info@enviguide.com."
        }
        if (t.includes('thank')) {
            return "You're very welcome! 🌿 Happy to help anytime."
        }
        return "Got it! While I'm still learning, I can point you to the right place. Pick a context below, or I can take you to our Support team for a detailed answer."
    }

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

    const sendChat = async (e) => {
        e.preventDefault()
        const text = chatInput.trim()
        if (!text || busy) return
        const history = [...messages, { role: 'user', text }]
        setMessages(history)
        setChatInput('')
        clearTimeout(sleepTimer.current)

        const replyPromise = (async () => {
            try {
                const res = await fetch(`${getApiBaseUrl()}/api/ai-chat`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ messages: history.slice(-12) }),
                })
                const json = await res.json()
                const reply = json?.data?.reply
                return reply && reply.trim() ? reply : buildReply(text)
            } catch {
                return buildReply(text)
            }
        })()

        const needsSearch = /\b(find|search|where|link|manual|guide|doc|docs|list|how (do|to)|show|article)\b/.test(text.toLowerCase())
        setMode('thinking')
        await sleep(650)
        if (needsSearch) {
            setMode('searching')
            await sleep(850)
        }
        setMode('typing')

        const [reply] = await Promise.all([replyPromise, sleep(550)])
        setMessages((prev) => [...prev, { role: 'ai', text: reply }])
        setMode('idle')
        scheduleSleep()
    }

    return (
        <div ref={chatRef} className={styles.chatWrapper}>
            {isChatOpen && (
                <div className={styles.chatPanel} role="dialog" aria-label="Eco AI assistant">
                    {/* Header */}
                    <div className={styles.chatHeader}>
                        <div className={styles.chatAvatar} onClick={wake}>
                            <AiHuman className={styles.chatAvatarHuman} idPrefix="hdr" sleeping={mode === 'sleeping'} />
                            <span className={`${styles.statusDot} ${mode === 'sleeping' ? styles.statusAway : ''}`} aria-hidden="true" />
                        </div>
                        <div className={styles.chatHeaderText}>
                            <p className={styles.chatTitle}>Eco AI</p>
                            <p className={styles.chatStatus}>
                                <span className={`${styles.statusPing} ${mode === 'sleeping' ? styles.statusAway : ''}`} aria-hidden="true" />
                                <span className={styles.statusText}>
                                    {mode === 'sleeping' ? 'Away · tap to wake'
                                        : mode === 'thinking' ? 'Thinking…'
                                        : mode === 'searching' ? 'Searching resources…'
                                        : mode === 'typing' ? 'Typing…'
                                        : 'Online · PCF Supplier Intelligence'}
                                </span>
                            </p>
                        </div>
                        <button
                            type="button"
                            className={styles.chatClose}
                            aria-label="Close chat"
                            onClick={() => setIsChatOpen(false)}
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M18 6 6 18M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Conversation */}
                    <div className={styles.chatBody} ref={chatBodyRef}>
                        {messages.map((m, i) => (
                            m.role === 'ai' ? (
                                <div key={i} className={styles.msgRow}>
                                    <div className={styles.msgAvatar}>
                                        <AiHuman className={styles.msgAvatarHuman} idPrefix={`msg${i}`} />
                                    </div>
                                    <div className={styles.msgBubble}>
                                        {i === 0 && <span className={styles.aiBadgeText}>ECO-ASSISTANT</span>}
                                        {m.text}
                                    </div>
                                </div>
                            ) : (
                                <div key={i} className={`${styles.msgRow} ${styles.msgRowUser}`}>
                                    <div className={styles.msgBubbleUser}>{m.text}</div>
                                </div>
                            )
                        ))}

                        {busy && (
                            <div className={styles.msgRow}>
                                <div className={styles.msgAvatar}>
                                    <AiHuman className={styles.msgAvatarHuman} idPrefix="active" />
                                </div>
                                <div className={`${styles.msgBubble} ${styles.statusBubble}`}>
                                    {mode === 'thinking' && (
                                        <span className={styles.stateRow}>
                                            <span className={styles.thinkBrain}>💭</span>
                                            <span className={styles.stateLabel}>Thinking</span>
                                            <span className={styles.thinkDots}><i /><i /><i /></span>
                                        </span>
                                    )}
                                    {mode === 'searching' && (
                                        <span className={styles.stateRow}>
                                            <span className={styles.searchGlass}>
                                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <circle cx="11" cy="11" r="7" />
                                                    <path d="M21 21l-4.3-4.3" />
                                                </svg>
                                            </span>
                                            <span className={styles.stateLabel}>Searching resources</span>
                                        </span>
                                    )}
                                    {mode === 'typing' && (
                                        <span className={styles.typingBubbleInner}>
                                            <span className={styles.typingDot} />
                                            <span className={styles.typingDot} />
                                            <span className={styles.typingDot} />
                                        </span>
                                    )}
                                </div>
                            </div>
                        )}

                        {messages.length <= 1 && !busy && (<>
                        <p className={styles.quickLabel}>Choose your context</p>
                        <div className={styles.roleGrid}>
                            <button className={styles.roleOption} onClick={() => navigate('/support')}>
                                <span className={styles.roleIcon}>🤝</span>
                                <div className={styles.roleInfo}>
                                    <p className={styles.roleName}>Supplier Consultant</p>
                                    <p className={styles.roleDesc}>Issues with questionnaires</p>
                                </div>
                                <svg className={styles.roleArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                            <button className={styles.roleOption} onClick={() => navigate('/support')}>
                                <span className={styles.roleIcon}>🏭</span>
                                <div className={styles.roleInfo}>
                                    <p className={styles.roleName}>Manufacturer Consultant</p>
                                    <p className={styles.roleDesc}>PCF guidance</p>
                                </div>
                                <svg className={styles.roleArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                            <button className={styles.roleOption} onClick={() => navigate('/support')}>
                                <span className={styles.roleIcon}>👤</span>
                                <div className={styles.roleInfo}>
                                    <p className={styles.roleName}>Own Consultant</p>
                                    <p className={styles.roleDesc}>Platform help</p>
                                </div>
                                <svg className={styles.roleArrow} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                        </div>
                        </>)}
                    </div>

                    {/* Input bar */}
                    <form className={styles.chatInputBar} onSubmit={sendChat}>
                        <input
                            type="text"
                            className={styles.chatInput}
                            placeholder="Ask me anything…"
                            aria-label="Message Eco AI"
                            value={chatInput}
                            onChange={(e) => { setChatInput(e.target.value); wake() }}
                            onFocus={wake}
                        />
                        <button type="submit" className={styles.chatSend} aria-label="Send message" disabled={!chatInput.trim() || busy}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="m22 2-7 20-4-9-9-4Z" />
                                <path d="M22 2 11 13" />
                            </svg>
                        </button>
                    </form>
                </div>
            )}

            <div className={styles.launcherRow}>
                {!isChatOpen && (
                    <div className={styles.greetingBubble}>
                        <span className={styles.greetingWave}>👋</span>
                        <span>Hi! How can I help you?</span>
                    </div>
                )}

                <button
                    type="button"
                    className={`${styles.chatTrigger} ${isChatOpen ? styles.chatTriggerOpen : ''}`}
                    title="Talk to Eco AI"
                    aria-label={isChatOpen ? 'Close Eco AI' : 'Talk to Eco AI'}
                    aria-expanded={isChatOpen}
                    onClick={() => setIsChatOpen((o) => !o)}
                >
                    {isChatOpen ? (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M18 6 6 18M6 6l12 12" />
                        </svg>
                    ) : (
                        <AiHuman className={styles.humanAvatar} idPrefix="launch" />
                    )}
                    {!isChatOpen && <span className={styles.launcherStatus} aria-hidden="true" />}
                </button>
            </div>
        </div>
    )
}
