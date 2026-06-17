import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { reportCategories, searchReports, getAllReports, type Report } from '../data/reports';
import MainLayout from '../components/MainLayout';
import * as api from '../services/api';
import {
    FileText, Clock, User, Bookmark, RefreshCw,
    ChevronRight, Share2, Search, ArrowUpRight,
    BarChart3, Users, Heart, DollarSign, TrendingUp,
    Wallet, Target, Calendar,
} from 'lucide-react';
import './Dashboard.css';

interface DashboardProps {
    onLogout: () => Promise<void>;
}

// Category accent colors — one per category id
const CATEGORY_COLORS: Record<string, { gradient: string; bg: string; text: string; glow: string }> = {
    staff:                  { gradient: 'linear-gradient(135deg,#3b82f6,#6366f1)', bg: 'rgba(59,130,246,0.1)',   text: '#3b82f6', glow: '#3b82f6' },
    patients:               { gradient: 'linear-gradient(135deg,#f43f5e,#ec4899)', bg: 'rgba(244,63,94,0.1)',    text: '#f43f5e', glow: '#f43f5e' },
    appointments:           { gradient: 'linear-gradient(135deg,#10b981,#14b8a6)', bg: 'rgba(16,185,129,0.1)',   text: '#10b981', glow: '#10b981' },
    'appointment-details':  { gradient: 'linear-gradient(135deg,#06b6d4,#0ea5e9)', bg: 'rgba(6,182,212,0.1)',    text: '#06b6d4', glow: '#06b6d4' },
    receivables:            { gradient: 'linear-gradient(135deg,#f59e0b,#f97316)', bg: 'rgba(245,158,11,0.1)',   text: '#f59e0b', glow: '#f59e0b' },
    'financial-kpi':        { gradient: 'linear-gradient(135deg,#8b5cf6,#a78bfa)', bg: 'rgba(139,92,246,0.1)',   text: '#8b5cf6', glow: '#8b5cf6' },
    supervision:            { gradient: 'linear-gradient(135deg,#ec4899,#f43f5e)', bg: 'rgba(236,72,153,0.1)',   text: '#ec4899', glow: '#ec4899' },
    'aba-hours':            { gradient: 'linear-gradient(135deg,#14b8a6,#06b6d4)', bg: 'rgba(20,184,166,0.1)',   text: '#14b8a6', glow: '#14b8a6' },
    'billing-ledger':       { gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', bg: 'rgba(99,102,241,0.1)',   text: '#6366f1', glow: '#6366f1' },
    payroll:                { gradient: 'linear-gradient(135deg,#0ea5e9,#3b82f6)', bg: 'rgba(14,165,233,0.1)',   text: '#0ea5e9', glow: '#0ea5e9' },
    'expected-pr':          { gradient: 'linear-gradient(135deg,#f97316,#eab308)', bg: 'rgba(249,115,22,0.1)',   text: '#f97316', glow: '#f97316' },
};

const DEFAULT_COLOR = { gradient: 'linear-gradient(135deg,#6366f1,#8b5cf6)', bg: 'rgba(99,102,241,0.1)', text: '#6366f1', glow: '#6366f1' };

const CATEGORY_ICONS: Record<string, any> = {
    Users, Heart, DollarSign, TrendingUp, Clock, FileText, Wallet, Target, BarChart3, Calendar,
};

function getCategoryColor(id: string) {
    return CATEGORY_COLORS[id] ?? DEFAULT_COLOR;
}

function getCategoryIcon(iconName: string) {
    return CATEGORY_ICONS[iconName] ?? FileText;
}

export default function Dashboard({ onLogout }: DashboardProps) {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const selectedCategory = searchParams.get('category');
    const currentView = searchParams.get('view');
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

    const getFilteredReports = () => {
        if (currentView === 'shared') return [];
        if (searchQuery) return searchReports(searchQuery);
        if (selectedCategory) {
            const category = reportCategories.find((cat) => cat.id === selectedCategory);
            return category?.reports || [];
        }
        return getAllReports();
    };

    const groupedReports = () => {
        const filtered = getFilteredReports();
        const grouped: Record<string, Report[]> = {};
        filtered.forEach((report) => {
            if (!grouped[report.category]) grouped[report.category] = [];
            grouped[report.category].push(report);
        });
        return grouped;
    };

    const totalReports = getAllReports().length;
    const privateReports = savedReports.filter(r => r.config?.preferences?.shareWith === 'Only Me');
    const sharedReports  = savedReports.filter(r => r.config?.preferences?.shareWith !== 'Only Me');

    const isDefaultView = !searchQuery && !selectedCategory && currentView !== 'shared';
    const isSharedView  = currentView === 'shared';

    const visibleSavedReports = isSharedView ? sharedReports : privateReports;

    return (
        <MainLayout
            onLogout={onLogout}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
        >
            <div className="dashboard-container">

                {/* ── LOADING STATE ── */}
                {loadingSaved ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '5rem 0' }}>
                        <div className="loader-logo-wrapper" style={{ marginBottom: '1rem', transform: 'scale(0.75)' }}>
                            <div className="loader-ring" />
                            <div className="loader-ring" />
                            <RefreshCw size={32} className="loader-icon" />
                        </div>
                        <div className="loader-text" style={{ fontSize: '0.7rem' }}>Syncing Intelligence...</div>
                    </div>
                ) : (
                    <>
                        {/* ── STATS BANNER (default view only) ── */}
                        {isDefaultView && (
                            <div className="stats-banner">
                                {/* Total System Reports */}
                                <div className="stat-card">
                                    <div className="stat-card-glow" style={{ background: '#4f46e5' }} />
                                    <div className="stat-icon-box" style={{ background: 'rgba(79,70,229,0.12)' }}>
                                        <BarChart3 size={22} style={{ color: '#4f46e5' }} />
                                    </div>
                                    <div className="stat-label">Total Reports</div>
                                    <div className="stat-number" style={{ backgroundImage: 'linear-gradient(135deg,#4f46e5,#6366f1)' }}>
                                        {totalReports}
                                    </div>
                                    <div className="stat-sub">System generated</div>
                                </div>

                                {/* Categories */}
                                <div className="stat-card">
                                    <div className="stat-card-glow" style={{ background: '#10b981' }} />
                                    <div className="stat-icon-box" style={{ background: 'rgba(16,185,129,0.12)' }}>
                                        <Target size={22} style={{ color: '#10b981' }} />
                                    </div>
                                    <div className="stat-label">Categories</div>
                                    <div className="stat-number" style={{ backgroundImage: 'linear-gradient(135deg,#10b981,#14b8a6)' }}>
                                        {reportCategories.length}
                                    </div>
                                    <div className="stat-sub">Report modules</div>
                                </div>

                                {/* Custom / Private */}
                                <div className="stat-card">
                                    <div className="stat-card-glow" style={{ background: '#f43f5e' }} />
                                    <div className="stat-icon-box" style={{ background: 'rgba(244,63,94,0.12)' }}>
                                        <Bookmark size={22} style={{ color: '#f43f5e' }} />
                                    </div>
                                    <div className="stat-label">Custom Reports</div>
                                    <div className="stat-number" style={{ backgroundImage: 'linear-gradient(135deg,#f43f5e,#ec4899)' }}>
                                        {privateReports.length}
                                    </div>
                                    <div className="stat-sub">Private pipelines</div>
                                </div>

                                {/* Shared */}
                                <div className="stat-card">
                                    <div className="stat-card-glow" style={{ background: '#f59e0b' }} />
                                    <div className="stat-icon-box" style={{ background: 'rgba(245,158,11,0.12)' }}>
                                        <Share2 size={22} style={{ color: '#f59e0b' }} />
                                    </div>
                                    <div className="stat-label">Shared Reports</div>
                                    <div className="stat-number" style={{ backgroundImage: 'linear-gradient(135deg,#f59e0b,#f97316)' }}>
                                        {sharedReports.length}
                                    </div>
                                    <div className="stat-sub">Team visibility</div>
                                </div>
                            </div>
                        )}

                        {/* ── SAVED CUSTOM REPORTS SECTION ── */}
                        {visibleSavedReports.length > 0 && !selectedCategory && !searchQuery && (
                            <section className="mb-12">
                                <div className="section-header-modern">
                                    <div className="section-icon-box" style={{
                                        background: isSharedView ? 'rgba(245,158,11,0.12)' : 'rgba(244,63,94,0.12)',
                                        color: isSharedView ? '#f59e0b' : '#f43f5e'
                                    }}>
                                        {isSharedView ? <Share2 size={18} /> : <Bookmark size={18} />}
                                    </div>
                                    <h2 className="section-title-modern">
                                        {isSharedView ? 'Shared Intelligence' : 'My Custom Reports'}
                                        <span className="count-badge-modern" style={{
                                            background: isSharedView ? 'rgba(245,158,11,0.1)' : 'rgba(244,63,94,0.1)',
                                            color: isSharedView ? '#f59e0b' : '#f43f5e'
                                        }}>
                                            {visibleSavedReports.length}
                                        </span>
                                    </h2>
                                </div>

                                <div className="report-grid">
                                    {visibleSavedReports.map((report) => (
                                        <div
                                            key={report.id}
                                            className="saved-report-card"
                                            onClick={() => navigate(`/report/${report.id}?custom=true`)}
                                        >
                                            <div className="card-decoration" />
                                            <div className="card-header-top">
                                                <div className="card-icon-wrapper">
                                                    <FileText size={18} />
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
                                                    <span key={col} className="column-tag">{col}</span>
                                                ))}
                                                {report.columns.length > 3 && (
                                                    <span className="column-tag more">+{report.columns.length - 3} More</span>
                                                )}
                                            </div>
                                            <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
                                                <div style={{ background: 'var(--color-bg-secondary)', padding: '0.5rem', borderRadius: '0.625rem', color: 'var(--color-text-tertiary)', transition: 'all 0.2s' }}>
                                                    <ChevronRight size={15} strokeWidth={3} />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* ── CATEGORY BENTO GRID (default view, no search) ── */}
                        {isDefaultView && !searchQuery && (
                            <section className="mb-12">
                                <div className="section-header-modern">
                                    <div className="section-icon-box" style={{ background: 'rgba(79,70,229,0.1)', color: 'var(--color-primary)' }}>
                                        <BarChart3 size={18} />
                                    </div>
                                    <h2 className="section-title-modern">
                                        Report Categories
                                        <span className="count-badge-modern">{reportCategories.length}</span>
                                    </h2>
                                </div>

                                <div className="category-bento-grid">
                                    {reportCategories.map((cat) => {
                                        const color = getCategoryColor(cat.id);
                                        const IconComponent = getCategoryIcon(cat.icon);
                                        return (
                                            <div
                                                key={cat.id}
                                                className="category-bento-card"
                                                onClick={() => handleCategorySelect(cat.id)}
                                                style={{ '--cat-shadow': `0 20px 40px -12px ${color.glow}30` } as React.CSSProperties}
                                                onMouseEnter={e => {
                                                    (e.currentTarget as HTMLElement).style.boxShadow = `0 20px 40px -12px ${color.glow}30`;
                                                }}
                                                onMouseLeave={e => {
                                                    (e.currentTarget as HTMLElement).style.boxShadow = '';
                                                }}
                                            >
                                                {/* Gradient bg overlay on hover */}
                                                <div className="category-bento-bg" style={{ background: color.gradient }} />
                                                {/* Color orb */}
                                                <div className="category-bento-orb" style={{ background: color.glow }} />

                                                <div className="category-bento-top">
                                                    <div className="category-bento-icon" style={{ background: color.bg }}>
                                                        <IconComponent size={20} style={{ color: color.text }} />
                                                    </div>
                                                    <div className="category-bento-arrow" style={{ background: 'var(--color-bg-secondary)' }}
                                                        onMouseEnter={e => {
                                                            const el = e.currentTarget as HTMLElement;
                                                            el.style.background = color.text;
                                                        }}
                                                        onMouseLeave={e => {
                                                            const el = e.currentTarget as HTMLElement;
                                                            el.style.background = 'var(--color-bg-secondary)';
                                                        }}
                                                    >
                                                        <ArrowUpRight size={14} />
                                                    </div>
                                                </div>

                                                <div className="category-bento-count" style={{ backgroundImage: color.gradient }}>
                                                    {cat.reports.length}
                                                </div>
                                                <div className="category-bento-name">{cat.name}</div>
                                                <div className="category-bento-sub">
                                                    {cat.reports.length === 1 ? '1 report' : `${cat.reports.length} reports`} available
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>
                        )}

                        {/* ── FILTERED / SEARCH RESULTS (table view) ── */}
                        {Object.entries(groupedReports()).map(([categoryName, reports]) => {
                            const catEntry = reportCategories.find(c => c.name === categoryName);
                            const color = catEntry ? getCategoryColor(catEntry.id) : DEFAULT_COLOR;
                            return (
                                <section key={categoryName} className="mb-12">
                                    <div className="section-header-modern">
                                        <div className="section-icon-box" style={{ background: color.bg }}>
                                            {catEntry && (() => {
                                                const Icon = getCategoryIcon(catEntry.icon);
                                                return <Icon size={18} style={{ color: color.text }} />;
                                            })()}
                                        </div>
                                        <h2 className="section-title-modern">
                                            {categoryName}
                                            <span className="count-badge-modern" style={{ background: color.bg, color: color.text }}>
                                                {reports.length}
                                            </span>
                                        </h2>
                                    </div>

                                    <div className="reports-table-wrapper">
                                        <div className="table-header">
                                            <div>Report Name</div>
                                            <div>Created By</div>
                                            <div>Last Visited</div>
                                        </div>
                                        {reports.map((report) => (
                                            <div
                                                key={report.id}
                                                className="table-row"
                                                onClick={() => navigate(`/report/${report.id}`)}
                                                style={{ '--row-accent': color.text } as React.CSSProperties}
                                                onMouseEnter={e => {
                                                    const el = e.currentTarget as HTMLElement;
                                                    el.style.background = color.bg;
                                                    el.style.borderLeftColor = color.text;
                                                }}
                                                onMouseLeave={e => {
                                                    const el = e.currentTarget as HTMLElement;
                                                    el.style.background = '';
                                                    el.style.borderLeftColor = 'transparent';
                                                }}
                                            >
                                                <div className="report-name">{report.name}</div>
                                                <div className="report-creator">{report.createdBy}</div>
                                                <div className="report-date">{report.lastVisited || '—'}</div>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            );
                        })}

                        {/* ── EMPTY STATE ── */}
                        {Object.keys(groupedReports()).length === 0 && visibleSavedReports.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-state-icon-box">
                                    {isSharedView ? <Share2 size={30} /> : <Search size={30} />}
                                </div>
                                <h3 className="empty-state-title">
                                    {isSharedView ? 'No Shared Reports Yet' : searchQuery ? 'No Results Found' : 'No Reports Here'}
                                </h3>
                                <p className="empty-state-description">
                                    {isSharedView
                                        ? 'Reports shared with your organization will appear here.'
                                        : searchQuery
                                            ? `We couldn't find any reports matching "${searchQuery}". Try a different keyword.`
                                            : 'No reports available for this selection.'}
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </MainLayout>
    );
}
