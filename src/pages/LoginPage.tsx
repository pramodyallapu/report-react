import React, { useState, useEffect } from 'react';
import { Lock, Mail, AlertCircle, RefreshCw, CheckCircle2 } from 'lucide-react';
import { authAPI } from '../services/api';
import slide1 from '../assets/login-slide-1.png';
import slide2 from '../assets/login-slide-2.png';
import slide3 from '../assets/login-slide-3.png';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

const slides = [
    {
        image: slide1,
        title: "Welcome!",
        description: "Your gateway to advanced reporting and data-driven intelligence. Experience the future of medical diagnostics analytics."
    },
    {
        image: slide2,
        title: "Smart Insights",
        description: "Visualize growth and patterns with our automated analytics. Take clinical decisions backed by comprehensive data."
    },
    {
        image: slide3,
        title: "Precision First",
        description: "Built for accuracy and high-end security. Ensure that every report you generate is compliant and error-free."
    }
];

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [rememberMe, setRememberMe] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);

    // Auto-slide effect
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await authAPI.login(email, password);
            onLoginSuccess();
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.response?.data?.detail || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            display: 'flex',
            minHeight: '100vh',
            width: '100vw',
            background: '#f8fafc',
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Split Screen Container */}
            <div style={{
                display: 'flex',
                width: '100%',
                maxWidth: '1200px',
                margin: 'auto',
                height: '740px',
                backgroundColor: 'white',
                borderRadius: '2.5rem',
                overflow: 'hidden',
                boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.15)',
                position: 'relative',
                zIndex: 1
            }}>
                {/* Left Panel - Hero Slider */}
                <div style={{
                    flex: '1.2',
                    background: 'linear-gradient(155deg, #1e1b4b 0%, #312e81 45%, #1e1b4b 100%)',
                    padding: '4rem',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    color: 'white',
                    overflow: 'hidden',
                }}>
                    {/* Geometric background decorations */}
                    <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.08 }} viewBox="0 0 500 700" xmlns="http://www.w3.org/2000/svg">
                        <circle cx="420" cy="80" r="180" fill="none" stroke="white" strokeWidth="1.5" />
                        <circle cx="420" cy="80" r="120" fill="none" stroke="white" strokeWidth="1" />
                        <circle cx="60" cy="580" r="150" fill="none" stroke="white" strokeWidth="1.5" />
                        <circle cx="60" cy="580" r="90" fill="none" stroke="white" strokeWidth="1" />
                        <line x1="0" y1="200" x2="500" y2="500" stroke="white" strokeWidth="0.5" />
                        <line x1="100" y1="0" x2="400" y2="700" stroke="white" strokeWidth="0.5" />
                        <rect x="350" y="300" width="200" height="200" fill="none" stroke="white" strokeWidth="1" transform="rotate(30 420 380)" />
                    </svg>
                    {/* Blurred color blobs */}
                    <div style={{ position: 'absolute', top: '-5%', right: '-10%', width: '55%', height: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)', pointerEvents: 'none' }} />
                    <div style={{ position: 'absolute', bottom: '-5%', left: '-5%', width: '50%', height: '45%', background: 'radial-gradient(circle, rgba(139,92,246,0.25) 0%, transparent 70%)', pointerEvents: 'none' }} />

                    <div style={{ marginBottom: '2rem', position: 'relative', zIndex: 10 }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontSize: '1.1rem',
                            fontWeight: '800',
                            letterSpacing: '0.04em',
                            textTransform: 'uppercase'
                        }}>
                            <div style={{ width: '34px', height: '34px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.5)' }}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>
                            </div>
                            AMROMED
                        </div>
                    </div>

                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                        <div key={currentSlide} style={{
                            animation: 'fadeInSlide 0.8s ease-out forwards',
                            position: 'relative'
                        }}>
                            <h2 style={{
                                fontSize: '3.5rem',
                                fontWeight: '900',
                                marginBottom: '1rem',
                                lineHeight: 1.1,
                                letterSpacing: '-0.02em',
                                color: 'white'
                            }}>{slides[currentSlide].title}</h2>
                            <p style={{
                                fontSize: '1.125rem',
                                fontWeight: '500',
                                color: 'rgba(255,255,255,0.7)',
                                maxWidth: '380px',
                                lineHeight: 1.6,
                                marginBottom: '2rem'
                            }}>
                                {slides[currentSlide].description}
                            </p>

                            <div style={{ marginTop: '1rem', position: 'relative' }}>
                                <img
                                    src={slides[currentSlide].image}
                                    alt="Slide Illustration"
                                    style={{
                                        width: '100%',
                                        maxWidth: '420px',
                                        height: 'auto',
                                        filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))'
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Navigation Dots */}
                    <div style={{ display: 'flex', gap: '12px', marginTop: 'auto', position: 'relative', zIndex: 10 }}>
                        {slides.map((_, idx) => (
                            <div
                                key={idx}
                                onClick={() => setCurrentSlide(idx)}
                                style={{
                                    width: currentSlide === idx ? '32px' : '10px',
                                    height: '10px',
                                    borderRadius: '5px',
                                    background: currentSlide === idx ? 'white' : 'rgba(255,255,255,0.3)',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                                }}
                            />
                        ))}
                    </div>

                    <style>{`
                        @keyframes fadeInSlide {
                            from { opacity: 0; transform: translateX(20px); }
                            to { opacity: 1; transform: translateX(0); }
                        }
                        .hero-grid-overlay {
                            position: absolute;
                            inset: 0;
                            background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px),
                                              linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px);
                            background-size: 40px 40px;
                            pointer-events: none;
                        }
                    `}</style>
                    <div className="hero-grid-overlay" />
                </div>

                {/* Right Panel - Login Form */}
                <div style={{
                    flex: '1',
                    padding: '4rem 5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    backgroundColor: 'white'
                }}>
                    <div style={{ marginBottom: '3rem' }}>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: '900',
                            color: '#0f172a',
                            marginBottom: '0.5rem',
                            letterSpacing: '-0.02em'
                        }}>Log In</h1>
                        <p style={{
                            color: '#64748b',
                            fontSize: '1rem',
                            fontWeight: '500'
                        }}>It will take less than a minute</p>
                    </div>

                    {error && (
                        <div style={{
                            padding: '1rem',
                            backgroundColor: '#fef2f2',
                            border: '1px solid #fee2e2',
                            borderRadius: '12px',
                            color: '#ef4444',
                            marginBottom: '2rem',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            fontSize: '0.875rem',
                            fontWeight: '600'
                        }}>
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                        <div className="login-form-group">
                            <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                marginBottom: '0.5rem'
                            }}>Username</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="email"
                                    placeholder="yourname@domain.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '3.5rem',
                                        padding: '0 1.25rem',
                                        fontSize: '0.9375rem',
                                        fontWeight: '600',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: '12px',
                                        color: '#0f172a',
                                        boxSizing: 'border-box',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                                <Mail size={20} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            </div>
                        </div>

                        <div className="login-form-group">
                            <label style={{
                                display: 'block',
                                fontSize: '0.75rem',
                                fontWeight: '800',
                                color: '#94a3b8',
                                textTransform: 'uppercase',
                                letterSpacing: '0.1em',
                                marginBottom: '0.5rem'
                            }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '3.5rem',
                                        padding: '0 1.25rem',
                                        fontSize: '0.9375rem',
                                        fontWeight: '600',
                                        border: '1.5px solid #e2e8f0',
                                        borderRadius: '12px',
                                        color: '#0f172a',
                                        boxSizing: 'border-box',
                                        outline: 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#4f46e5'}
                                    onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                                />
                                <Lock size={20} style={{ position: 'absolute', right: '1.25rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                            <div
                                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}
                                onClick={() => setRememberMe(!rememberMe)}
                            >
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '6px',
                                    border: '2px solid #e2e8f0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: rememberMe ? '#4f46e5' : 'white',
                                    borderColor: rememberMe ? '#4f46e5' : '#e2e8f0',
                                    transition: 'all 0.2s ease'
                                }}>
                                    {rememberMe && <CheckCircle2 size={14} color="white" strokeWidth={3} />}
                                </div>
                                <span style={{ fontSize: '0.875rem', fontWeight: '600', color: '#64748b' }}>Remember password</span>
                            </div>
                            <span style={{ fontSize: '0.875rem', fontWeight: '700', color: '#4f46e5', cursor: 'pointer' }}>
                                Sign in
                            </span>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                height: '3.5rem',
                                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '12px',
                                fontSize: '1rem',
                                fontWeight: '800',
                                cursor: 'pointer',
                                marginTop: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '1rem',
                                boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.5)',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(79,70,229,0.6)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(79,70,229,0.5)'; }}
                        >
                            {loading ? <RefreshCw size={20} className="animate-spin" /> : 'SIGN IN'}
                        </button>
                    </form>

                    <div style={{ marginTop: '3rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <p style={{ fontSize: '0.875rem', fontWeight: '600', color: '#94a3b8' }}>
                            Don't have an account? <span style={{ color: '#4f46e5', fontWeight: '800', cursor: 'pointer' }}>Create an account</span>
                        </p>
                        <span style={{ fontSize: '0.8125rem', fontWeight: '700', color: '#4f46e5', cursor: 'pointer', opacity: 0.8 }}>
                            Forgot your password?
                        </span>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
                .animate-spin {
                    animation: spin 1s linear infinite;
                }
            `}</style>
        </div>
    );
}


