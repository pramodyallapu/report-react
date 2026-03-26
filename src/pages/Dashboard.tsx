import { reportCategories, searchReports, getAllReports, type Report } from '../data/reports';
import MainLayout from '../components/MainLayout';
import * as api from '../services/api';
import { FileText, Clock, User, Bookmark, RefreshCw, ChevronRight, Share2 } from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
    onLogout: () => Promise<void>;
}

import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function Dashboard({ onLogout }: DashboardProps) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedCategory = searchParams.get('category');
    const currentView = searchParams.get('view'); // null (default) or 'shared'
    const [searchQuery, setSearchQuery] = useState('');
    const [savedReports, setSavedReports] = useState<any[]>([]);
    const [loadingSaved, setLoadingSaved] = useState(false);

    useEffect(() => {
        fetchSavedReports();
    }, []);

    const fetchSavedReports = async () => {
        setLoadingSaved(true);
        try {
            const data = await api.advancedReportsAPI.getSavedReports();
            setSavedReports(data);
        } catch (err) {
            console.error('Failed to fetch saved reports:', err);
        } finally {
            setLoadingSaved(false);
        }
    };

    const handleCategorySelect = (categoryId: string | null) => {
        if (categoryId) {
            setSearchParams({ category: categoryId });
        } else {
            setSearchParams({});
        }
    };

    // Filter reports based on search and category
    const getFilteredReports = () => {
        // Hide standard reports if we are in "Shared Reports" view
        if (currentView === 'shared') return [];

        if (searchQuery) {
            return searchReports(searchQuery);
        }
        if (selectedCategory) {
            const category = reportCategories.find((cat) => cat.id === selectedCategory);
            return category?.reports || [];
        }
        return getAllReports();
    };

    // Group reports by category for display
    const groupedReports = () => {
        const filtered = getFilteredReports();
        const grouped: Record<string, Report[]> = {};

        filtered.forEach((report) => {
            if (!grouped[report.category]) {
                grouped[report.category] = [];
            }
            grouped[report.category].push(report);
        });

        return grouped;
    };

    const handleReportClick = (report: Report) => {
        navigate(`/report/${report.id}`);
    };

    return (
        <MainLayout
            onLogout={onLogout}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
        >
            <div className="dashboard-container">
                {/* Saved Custom Reports Section */}
                {loadingSaved ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
                        <div className="loader-logo-wrapper" style={{ marginBottom: '1rem', transform: 'scale(0.75)' }}>
                            <div className="loader-ring" />
                            <div className="loader-ring" />
                            <RefreshCw size={32} className="loader-icon" />
                        </div>
                        <div className="loader-text" style={{ fontSize: '0.7rem' }}>Syncing Intelligence...</div>
                    </div>
                ) : (currentView === 'shared' ? savedReports.filter(r => r.config?.preferences?.shareWith !== 'Only Me') : savedReports.filter(r => r.config?.preferences?.shareWith === 'Only Me')).length > 0 && !selectedCategory && !searchQuery ? (
                    <section className="mb-16">
                        <div className="section-header-modern">
                            <div className="section-icon-box" style={{ background: currentView === 'shared' ? 'var(--color-primary-light)' : 'var(--color-danger-light, rgba(239, 68, 68, 0.1))', color: currentView === 'shared' ? 'var(--color-primary)' : 'var(--color-danger)' }}>
                                {currentView === 'shared' ? <Share2 size={20} /> : <Bookmark size={20} />}
                            </div>
                            <h2 className="section-title-modern">
                                {currentView === 'shared' ? 'Shared Intelligence' : 'Private Custom Reports'}
                                <span className="count-badge-modern" style={{ background: currentView === 'shared' ? 'var(--color-primary)' : 'var(--color-danger)', color: '#ffffff' }}>
                                    {(currentView === 'shared'
                                        ? savedReports.filter(r => r.config?.preferences?.shareWith !== 'Only Me')
                                        : savedReports.filter(r => r.config?.preferences?.shareWith === 'Only Me')).length}
                                </span>
                            </h2>
                        </div>

                        <div className="report-grid">
                            {(currentView === 'shared'
                                ? savedReports.filter(r => r.config?.preferences?.shareWith !== 'Only Me')
                                : savedReports.filter(r => r.config?.preferences?.shareWith === 'Only Me')).map((report) => (
                                    <div
                                        key={report.id}
                                        className="saved-report-card"
                                        onClick={() => navigate(`/report/${report.id}?custom=true`)}
                                    >
                                        <div className="card-decoration" />
                                        <div className="card-header-top">
                                            <div className="card-icon-wrapper">
                                                <FileText size={20} />
                                            </div>
                                            <div className="table-id-badge">{report.table_id}</div>
                                        </div>

                                        <h3 className="card-title">{report.name}</h3>

                                        <div className="card-meta">
                                            <div className="meta-item">
                                                <User size={12} strokeWidth={3} />
                                                <span>Custom Architect</span>
                                            </div>
                                            <div className="meta-item">
                                                <Clock size={12} strokeWidth={3} />
                                                <span>{new Date(report.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            </div>
                                        </div>

                                        <div className="column-tags">
                                            {report.columns.filter((col: string) => col !== 'prov_ins_file').slice(0, 3).map((col: string) => (
                                                <span key={col} className="column-tag">
                                                    {col}
                                                </span>
                                            ))}
                                            {report.columns.length > 3 && (
                                                <span className="column-tag more">
                                                    +{report.columns.length - 3} More
                                                </span>
                                            )}
                                        </div>

                                        <div className="mt-6 flex justify-end">
                                            <div className="bg-slate-50 p-2 rounded-lg text-slate-400 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                                                <ChevronRight size={16} strokeWidth={3} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </section>
                ) : null}

                {/* Categories / Results Section */}
                {Object.entries(groupedReports()).map(([categoryName, reports]) => (
                    <section key={categoryName} className="reports-section mb-12">
                        <div className="section-header-modern">
                            <h2 className="section-title-modern">
                                {categoryName}
                                <span className="count-badge-modern">{reports.length}</span>
                            </h2>
                        </div>

                        <div className="reports-table">
                            <div className="table-header">
                                <div>REPORT NAME</div>
                                <div>CREATED BY</div>
                                <div>LAST VISITED</div>
                            </div>
                            {reports.map((report) => (
                                <div
                                    key={report.id}
                                    className="table-row"
                                    onClick={() => handleReportClick(report)}
                                >
                                    <div className="report-name">{report.name}</div>
                                    <div className="report-creator">{report.createdBy}</div>
                                    <div className="report-date">{report.lastVisited || '-'}</div>
                                </div>
                            ))}
                        </div>
                    </section>
                ))}

                {Object.keys(groupedReports()).length === 0 && (currentView === 'shared' ? savedReports.filter(r => r.config?.preferences?.shareWith !== 'Only Me') : savedReports.filter(r => r.config?.preferences?.shareWith === 'Only Me')).length === 0 && (
                    <div className="empty-state">
                        <div className="cr-flex cr-items-center cr-justify-center" style={{ width: '5rem', height: '5rem', background: '#f8fafc', borderRadius: '1.5rem', marginBottom: '2rem', color: '#94a3b8' }}>
                            {currentView === 'shared' ? <Share2 size={32} /> : <Search size={32} />}
                        </div>
                        <h3 className="empty-state-title">
                            {currentView === 'shared' ? 'No Shared Intelligence' : 'No Private Reports Found'}
                        </h3>
                        <p className="empty-state-description">
                            {currentView === 'shared'
                                ? 'Reports shared with the entire organization will appear here.'
                                : 'You haven\'t created any private reports yet. Start by creating a custom architecture!'}
                        </p>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
