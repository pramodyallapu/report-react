import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Lock, FileText, Download, ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { sharedReportsAPI } from '../services/api';

export default function SharedReportPage() {
    const { reportId } = useParams();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);

    // Check if report requires password or is accessible right away
    useEffect(() => {
        // We will do a quick check to see if it even needs a password or exists.
        // The export endpoint will throw if password is required but not provided.
        // Let's just hold on that and try a quick export attempt if no password is submitted
        // But to be safe, we just wait for the user to submit a form.
    }, [reportId]);

    const handleExport = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!password) {
            setError('Please enter a password');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await sharedReportsAPI.exportReport(reportId || '', password);
            setDownloadSuccess(true);
            setTimeout(() => setDownloadSuccess(false), 5000); // Reset success after 5s
        } catch (err: any) {
            if (err.response?.status === 401) {
                setError('Incorrect password. Please try again.');
            } else if (err.response?.status === 403) {
                setError('This report is completely private and cannot be accessed via sharing link.');
            } else if (err.response?.status === 404) {
                setError('Report not found or has been deleted.');
            } else {
                setError(err.response?.data?.detail || 'Failed to download report. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="cr-modal-overlay">
            <div className="cr-modal-content" style={{ maxWidth: '480px', padding: '0', overflow: 'hidden', paddingBottom: '1rem' }}>
                <div style={{ height: '4px', background: 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />

                <div style={{ padding: '2.5rem 2.5rem 1.5rem', textAlign: 'center' }}>
                    <div style={{
                        width: '5rem', height: '5rem', borderRadius: '1.5rem',
                        background: downloadSuccess ? '#dcfce7' : '#eff6ff',
                        color: downloadSuccess ? '#16a34a' : '#3b82f6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 1.5rem'
                    }}>
                        {downloadSuccess ? <Check size={36} strokeWidth={3} /> : <Lock size={36} strokeWidth={2.5} />}
                    </div>

                    <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.5rem' }}>
                        {downloadSuccess ? 'Download Complete!' : 'Secure Intelligence'}
                    </h1>
                    <p style={{ fontSize: '0.9375rem', color: '#64748b', fontWeight: 500, lineHeight: 1.5 }}>
                        {downloadSuccess
                            ? 'Your PDF report has been successfully decrypted and downloaded to your device.'
                            : 'This report is protected. Please enter the secure access password below to download the PDF.'}
                    </p>
                </div>

                {!downloadSuccess && (
                    <form onSubmit={handleExport} style={{ padding: '0 2.5rem 2.5rem' }}>
                        {error && (
                            <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#ef4444', padding: '0.75rem 1rem', borderRadius: '1rem', fontSize: '0.875rem', fontWeight: 700, textAlign: 'center', marginBottom: '1.5rem' }}>
                                {error}
                            </div>
                        )}

                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <label style={{ fontSize: '0.625rem', fontWeight: 900, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', position: 'absolute', top: '-0.5rem', left: '1rem', background: 'white', padding: '0 0.25rem' }}>
                                Access Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{
                                    width: '100%', height: '3.5rem', background: '#f8fafc', border: '2px solid #e2e8f0',
                                    borderRadius: '1rem', padding: '0 1.25rem', fontSize: '1.125rem', fontWeight: 700,
                                    color: '#0f172a', transition: 'all 0.2s', outline: 'none', boxSizing: 'border-box'
                                }}
                                placeholder="Enter password..."
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !password}
                            className="cr-btn"
                            style={{
                                width: '100%', height: '3.5rem', background: '#0f172a', color: 'white',
                                borderRadius: '1rem', fontWeight: 800, fontSize: '0.875rem', border: 'none',
                                opacity: (loading || !password) ? 0.5 : 1, transition: 'all 0.3s'
                            }}
                        >
                            {loading ? (
                                <span style={{ animation: 'pulse 1.5s infinite pt-2 pb-2' }}>DECRYPTING & DOWNLOADING...</span>
                            ) : (
                                <span className="cr-flex cr-items-center cr-justify-center cr-gap-2">
                                    <Download size={18} /> DOWNLOAD PDF REPORT
                                </span>
                            )}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
