import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import ReportViewer from '../components/ReportViewer';
import MainLayout from '../components/MainLayout';
import { getReportById } from '../data/reports';
import { AlertCircle, RefreshCw } from 'lucide-react';
import * as api from '../services/api';

export default function ReportPage() {
    const { reportId } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isCustom = searchParams.get('custom') === 'true';

    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isCustom) {
            fetchCustomReport();
        } else {
            setReport(getReportById(reportId || ''));
            setLoading(false);
        }
    }, [reportId, isCustom]);

    const fetchCustomReport = async () => {
        setLoading(true);
        try {
            const savedReports = await api.advancedReportsAPI.getSavedReports();
            const found = savedReports.find((r: any) => r.id.toString() === reportId);
            if (found) {
                // Transform SQLite format to Report format
                setReport({
                    id: found.id.toString(),
                    name: found.name,
                    category: 'Custom Reports',
                    createdBy: 'You',
                    columns: found.columns,
                    // Additional info from config if needed
                    isCustom: true,
                    config: found.config
                });
            }
        } catch (err) {
            console.error('Failed to fetch custom report:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/');
    };

    // We need to handle logout in ReportPage too if we want the layout to work fully
    const handleLogout = async () => {
        try {
            await api.authAPI.logout();
            // In a real app, authenticated state would be in context, but for now
            // we will let App.tsx handle the redirect or simple reload
            window.location.href = '/';
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    if (loading) {
        return (
            <MainLayout onLogout={handleLogout}>
                <div style={{ height: 'var(--page-panel-height)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="loader-logo-wrapper">
                        <div className="loader-ring" />
                        <div className="loader-ring" />
                        <RefreshCw size={40} className="loader-icon" />
                    </div>
                    <div className="loader-text">Loading Report</div>
                </div>
            </MainLayout>
        );
    }

    if (!report) {
        return (
            <MainLayout onLogout={handleLogout}>
                <div style={{ height: 'var(--page-panel-height)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '3rem' }}>
                    <AlertCircle size={64} style={{ color: 'var(--color-danger)', marginBottom: '1rem', opacity: 0.7 }} />
                    <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'var(--color-text-primary)', marginBottom: '0.5rem' }}>Report Not Found</h2>
                    <p style={{ color: 'var(--color-text-secondary)', marginBottom: '1.5rem' }}>The report you are looking for does not exist or has been removed.</p>
                    <button className="btn btn-primary" onClick={handleBack}>Go Back Home</button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout onLogout={handleLogout}>
            {/* calc(100vh - header - content top/bottom padding) = exact visible area */}
            <div style={{
                height: 'var(--page-panel-height)',
                display: 'flex',
                flexDirection: 'column',
            }}>
                <ReportViewer
                    report={report}
                    onClose={handleBack}
                    isPage={true}
                />
            </div>
        </MainLayout>
    );
}
