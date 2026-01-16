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
                <div className="flex flex-col items-center justify-center h-full">
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
                <div className="flex flex-col items-center justify-center h-full text-center p-12">
                    <AlertCircle className="w-16 h-16 text-red-400 mb-4" />
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Report Not Found</h2>
                    <p className="text-gray-500 mb-6">The report you are looking for does not exist or has been removed.</p>
                    <button className="btn btn-primary" onClick={handleBack}>Go Back Home</button>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout onLogout={handleLogout}>
            <div className="h-[calc(100vh-100px)]">
                <ReportViewer
                    report={report}
                    onClose={handleBack}
                    isPage={true}
                />
            </div>
        </MainLayout>
    );
}
