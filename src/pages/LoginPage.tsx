import React, { useState } from 'react';
import { LogIn, Lock, Mail, AlertCircle, RefreshCw } from 'lucide-react';
import { authAPI } from '../services/api';

interface LoginPageProps {
    onLoginSuccess: () => void;
}

export default function LoginPage({ onLoginSuccess }: LoginPageProps) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            setError('Please enter both email and password');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Create form data as FastAPI expects
            const formData = new FormData();
            formData.append('username', email);
            formData.append('password', password);

            // In your FastAPI project, /login usually expects Form data
            // For this demo, let's try the authAPI.login with JSON first, 
            // but we might need to adjust based on how your backend handles it.
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
        <div className="login-container" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            backgroundColor: 'var(--color-bg-secondary)',
            padding: 'var(--spacing-lg)'
        }}>
            <div className="card" style={{
                maxWidth: '400px',
                width: '100%',
                padding: 'var(--spacing-2xl)',
                animation: 'fadeIn 0.5s ease-out'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xl)' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--color-primary-light)',
                        color: 'var(--color-primary)',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        <LogIn size={32} />
                    </div>
                    <h1 style={{ fontSize: '1.5rem', marginBottom: 'var(--spacing-xs)' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                        Login to access your reports dashboard
                    </p>
                </div>

                {error && (
                    <div style={{
                        padding: 'var(--spacing-md)',
                        backgroundColor: '#fee',
                        border: '1px solid #fcc',
                        borderRadius: 'var(--radius-md)',
                        color: '#c00',
                        marginBottom: 'var(--spacing-lg)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                        fontSize: '0.875rem'
                    }}>
                        <AlertCircle size={18} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <div className="search-wrapper">
                            <Mail size={18} className="search-icon" />
                            <input
                                id="email"
                                type="email"
                                className="input search-input"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 'var(--spacing-xl)' }}>
                        <label className="form-label" htmlFor="password">Password</label>
                        <div className="search-wrapper">
                            <Lock size={18} className="search-icon" />
                            <input
                                id="password"
                                type="password"
                                className="input search-input"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '0.875rem' }}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <RefreshCw size={18} className="shimmer" style={{ marginRight: 'var(--spacing-sm)' }} />
                                Logging in...
                            </>
                        ) : 'Sign In'}
                    </button>
                </form>

                <div style={{ marginTop: 'var(--spacing-xl)', textAlign: 'center', fontSize: '0.875rem' }}>
                    <p style={{ color: 'var(--color-text-tertiary)' }}>
                        Securely access your data
                    </p>
                </div>
            </div>
        </div>
    );
}
