import { useState, useEffect } from 'react';
import { X, Calendar, Download, RefreshCw, Filter, ArrowLeft, BarChart2, Table as TableIcon } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { type Report } from '../data/reports';
import * as api from '../services/api';
import BillingLedgerAging from './reports/BillingLedgerAging';
import Papa from 'papaparse';
import './ReportViewer.css';

interface ReportViewerProps {
    report: Report;
    onClose: () => void;
    isPage?: boolean;
}

export default function ReportViewer({ report, onClose, isPage = false }: ReportViewerProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [data, setData] = useState<any>(null);
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
    });
    const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');
    const [hiddenMetrics, setHiddenMetrics] = useState<string[]>([]);

    const handleLegendClick = (e: any) => {
        const { dataKey } = e;
        if (!dataKey) return;
        setHiddenMetrics(prev =>
            prev.includes(dataKey) ? prev.filter(key => key !== dataKey) : [...prev, dataKey]
        );
    };

    const [layoutPreference, setLayoutPreference] = useState<'compact' | 'relaxed'>(() => {
        // First priority: report config if it's a custom report
        if (report.config?.layout?.tableDensity) {
            const density = report.config.layout.tableDensity.toLowerCase();
            return density === 'compact' ? 'compact' : 'relaxed';
        }
        // Second priority: localStorage
        const saved = localStorage.getItem('rv-layout-preference');
        return (saved as 'compact' | 'relaxed') || 'relaxed';
    });

    useEffect(() => {
        localStorage.setItem('rv-layout-preference', layoutPreference);
    }, [layoutPreference]);

    const isBillingLedgerAging = report.id === 'billing-ledger-aging';

    // Auto-load reports that don't require date filters
    useEffect(() => {
        if (!report.requiresDateFilter && !isBillingLedgerAging) {
            loadReportData();
        }
    }, [report]);

    const loadReportData = async () => {
        if (!report.apiEndpoint && !report.isCustom) {
            setError('No API endpoint configured for this report');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            let response;

            if (report.isCustom && report.config) {
                // Use the preview endpoint for custom reports
                response = await api.advancedReportsAPI.previewReport({
                    table_id: report.config.selectedTable,
                    columns: report.config.selectedColumns
                });
            } else if (report.apiEndpoint) {
                const endpointUrl = report.apiEndpoint;

                if (endpointUrl.includes('/staffs/')) {
                    const endpoint = endpointUrl.split('/').pop();
                    switch (endpoint) {
                        case 'active_staff':
                            response = await api.staffReportsAPI.getActiveStaff(filters);
                            break;
                        case 'missing_credentials':
                            response = await api.staffReportsAPI.getMissingCredentials(filters);
                            break;
                        case 'expiring_credentials':
                            response = await api.staffReportsAPI.getExpiringCredentials(filters);
                            break;
                        case 'time_of_mgmt':
                            response = await api.staffReportsAPI.getTimeOffManagement(filters);
                            break;
                        case 'provider_missing_sign':
                            response = await api.staffReportsAPI.getProviderMissingSign(filters);
                            break;
                    }
                } else if (endpointUrl.includes('/patients/')) {
                    const endpoint = endpointUrl.split('/').pop();
                    switch (endpoint) {
                        case 'expired_auth':
                            response = await api.patientReportsAPI.getExpiredAuth(filters);
                            break;
                        case 'expiring_auth':
                            response = await api.patientReportsAPI.getExpiringAuth(filters);
                            break;
                        case 'without_auth':
                            response = await api.patientReportsAPI.getWithoutAuth(filters);
                            break;
                        case 'expiring_doc':
                            response = await api.patientReportsAPI.getExpiringDoc(filters);
                            break;
                        case 'auth_placeholder':
                            response = await api.patientReportsAPI.getAuthPlaceholder(filters);
                            break;
                        case 'non_payor_tag':
                            response = await api.patientReportsAPI.getNonPayorTag(filters);
                            break;
                        case 'arrived_info':
                            response = await api.patientReportsAPI.getArrivedInfo(filters);
                            break;
                    }
                } else if (endpointUrl.includes('/appointments/')) {
                    const endpoint = endpointUrl.split('/').pop();
                    switch (endpoint) {
                        case 'scheduled_not_rendered':
                            response = await api.appointmentReportsAPI.getScheduledNotRendered(filters);
                            break;
                        case 'scheduled_not_attended':
                            response = await api.appointmentReportsAPI.getScheduledNotAttended(filters);
                            break;
                        case 'session_missing_signature':
                            response = await api.appointmentReportsAPI.getSessionMissingSignature(filters);
                            break;
                        case 'session_note_missing':
                            response = await api.appointmentReportsAPI.getSessionNoteMissing(filters);
                            break;
                        case 'session_unlocked_notes':
                            response = await api.appointmentReportsAPI.getSessionUnlockedNotes(filters);
                            break;
                    }
                } else if (endpointUrl.includes('billing-ledger-aging')) {
                    response = await api.billingLedgerAPI.getAgingData({
                        type: 1,
                        date_type: 'dos',
                    });
                } else if (endpointUrl.includes('/reports/')) {
                    const endpoint = endpointUrl.split('/').pop();
                    switch (endpoint) {
                        case 'schedule_billable':
                            response = await api.financialReportsAPI.getScheduleBillable(filters);
                            break;
                        case 'payment_deposits':
                            response = await api.financialReportsAPI.getPaymentDeposits(filters);
                            break;
                        case 'kpi_by_month':
                            response = await api.financialReportsAPI.getKPIByMonth(filters);
                            break;
                        case 'kpi_by_patient':
                            response = await api.financialReportsAPI.getKPIByPatient(filters);
                            break;
                        case 'kpi_by_insurance':
                            response = await api.financialReportsAPI.getKPIByInsurance(filters);
                            break;
                        case 'aba_hour_client':
                            response = await api.abaReportsAPI.getABAHourClient(filters);
                            break;
                        case 'aba_hour_provider':
                            response = await api.abaReportsAPI.getABAHourProvider(filters);
                            break;
                        case 'ar_ledger_with_balance':
                            response = await api.ledgerReportsAPI.getARLedgerWithBalance(filters);
                            break;
                        case 'appointment_ledger':
                            response = await api.ledgerReportsAPI.getAppointmentLedger(filters);
                            break;
                        case 'appointment_billed':
                            response = await api.ledgerReportsAPI.getAppointmentBilled(filters);
                            break;
                        case 'max_total_auth_total':
                            response = await api.ledgerReportsAPI.getMaxTotalAuthTotal(filters);
                            break;
                        case 'service_payroll_detail':
                            response = await api.payrollReportsAPI.getServicePayrollDetail(filters);
                            break;
                        case 'service_payroll_summary':
                            response = await api.payrollReportsAPI.getServicePayrollSummary(filters);
                            break;
                        case 'ratewise_payroll_detail':
                            response = await api.payrollReportsAPI.getRatewisePayrollDetail(filters);
                            break;
                        case 'ratewise_payroll_summary':
                            response = await api.payrollReportsAPI.getRatewisePayrollSummary(filters);
                            break;
                        case 'expected_actual_pr':
                            response = await api.expectedPRReportsAPI.getExpectedActualPR(filters);
                            break;
                    }
                }
            }

            setData(response);
        } catch (err: any) {
            console.error('Error loading report:', err);
            setError(err.response?.data?.detail || err.message || 'Failed to load report data');
        } finally {
            setLoading(false);
        }
    };

    const handleRunReport = () => {
        if (report.requiresDateFilter && (!filters.start_date || !filters.end_date)) {
            setError('Please select both start and end dates');
            return;
        }
        loadReportData();
    };

    const handleExport = async () => {
        if (report.isCustom && report.config) {
            setLoading(true);
            try {
                await api.advancedReportsAPI.exportReport(report.config);
            } catch (err: any) {
                console.error('Export failed:', err);
                setError('Export failed: ' + (err.response?.data?.detail || err.message));
            } finally {
                setLoading(false);
            }
        } else {
            if (!data) return;
            const displayData = Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : null);

            if (!displayData || displayData.length === 0) {
                alert('No data available to export');
                return;
            }

            try {
                const csv = Papa.unparse(displayData);
                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.setAttribute("href", url);

                const dateStr = new Date().toISOString().split('T')[0];
                const safeName = report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
                link.setAttribute("download", `${safeName}_${dateStr}.csv`);

                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (err: any) {
                console.error('CSV Export failed:', err);
                setError('Failed to generate CSV export');
            }
        }
    };

    const renderTableData = () => {
        if (!data) return null;

        const displayData = Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : null);

        if (displayData) {
            if (displayData.length === 0) {
                return (
                    <div className="empty-state">
                        <p>No data available for the selected criteria</p>
                    </div>
                );
            }

            const keys = Object.keys(displayData[0]).filter(k => k !== 'prov_ins_file');

            let chartContent = null;
            if (viewMode === 'chart') {
                const chartData = displayData.map((row: any) => {
                    const newRow = { ...row };
                    Object.keys(newRow).forEach(key => {
                        if (typeof newRow[key] === 'string') {
                            // Strip typical formatting chars to expose underlying number
                            const parsed = parseFloat(newRow[key].replace(/,/g, '').replace(/^\$/, ''));
                            if (!isNaN(parsed) && newRow[key].match(/[0-9]/) && !newRow[key].includes('-202') && !newRow[key].includes('/202')) {
                                newRow[key] = parsed;
                            }
                        }
                    });
                    return newRow;
                });

                const xAxisKey = keys.find(k => k.toLowerCase().match(/name|month|insurance|payer|date|patient/)) || keys[0];
                const numericKeys = keys.filter(k => k !== xAxisKey && typeof chartData[0][k] === 'number').slice(0, 3);
                const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

                if (numericKeys.length === 0) {
                    chartContent = (
                        <div className="empty-state">
                            <p style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>No numeric data found to generate chart.</p>
                        </div>
                    );
                } else if (report.id === 'kpi-by-patient' || report.id === 'kpi-by-insurance') {
                    // KPI Proportional Comparison - Horizontal Layout
                    chartContent = (
                        <div style={{ flex: 1, minHeight: 0, padding: '2rem', background: 'var(--color-bg-primary)', borderRadius: '0 0 1.5rem 1.5rem', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                                <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 100, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                    <XAxis type="number" stroke="#64748b" />
                                    <YAxis dataKey={xAxisKey} type="category" stroke="#64748b" tick={{ fontSize: 12 }} width={120} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', backgroundColor: 'var(--color-bg-primary)' }} cursor={{ fill: 'var(--color-bg-secondary)' }} />
                                    <Legend onClick={handleLegendClick} wrapperStyle={{ cursor: 'pointer' }} />
                                    {numericKeys.map((key, index) => (
                                        <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[0, 4, 4, 0]} barSize={24} hide={hiddenMetrics.includes(key)} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    );
                } else {
                    // Standard Vertical Trend Chart (e.g. KPI by Month)
                    chartContent = (
                        <div style={{ flex: 1, minHeight: 0, padding: '2rem', background: 'var(--color-bg-primary)', borderRadius: '0 0 1.5rem 1.5rem', width: '100%' }}>
                            <ResponsiveContainer width="100%" height="100%" minHeight={400}>
                                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey={xAxisKey} stroke="#64748b" tick={{ fontSize: 12 }} angle={chartData.length > 8 ? -45 : 0} textAnchor={chartData.length > 8 ? 'end' : 'middle'} />
                                    <YAxis stroke="#64748b" tick={{ fontSize: 12 }} />
                                    <RechartsTooltip contentStyle={{ borderRadius: '0.75rem', border: '1px solid var(--color-border)', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', backgroundColor: 'var(--color-bg-primary)' }} cursor={{ fill: 'var(--color-bg-secondary)' }} />
                                    <Legend onClick={handleLegendClick} wrapperStyle={{ paddingTop: '20px', cursor: 'pointer' }} />
                                    {numericKeys.map((key, index) => (
                                        <Bar key={key} dataKey={key} fill={COLORS[index % COLORS.length]} radius={[4, 4, 0, 0]} hide={hiddenMetrics.includes(key)} />
                                    ))}
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    );
                }
            }

            return (
                <div className={layoutPreference === 'compact' ? 'rv-compact' : 'rv-relaxed'}
                    style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, overflow: 'hidden' }}>
                    <div className="rv-summary-bar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div className="rv-layout-controls" style={{ margin: 0 }}>
                                <button
                                    className={`rv-layout-btn ${viewMode === 'table' ? 'active' : ''}`}
                                    onClick={() => setViewMode('table')}
                                    style={{ display: 'flex', alignItems: 'center' }}
                                    title="Table View"
                                >
                                    <TableIcon size={14} style={{ marginRight: '0.25rem' }} />
                                    Table
                                </button>
                                <button
                                    className={`rv-layout-btn ${viewMode === 'chart' ? 'active' : ''}`}
                                    onClick={() => setViewMode('chart')}
                                    style={{ display: 'flex', alignItems: 'center' }}
                                    title="Chart View"
                                >
                                    <BarChart2 size={14} style={{ marginRight: '0.25rem' }} />
                                    Chart
                                </button>
                            </div>
                            {viewMode === 'table' && (
                                <div className="rv-layout-controls" style={{ margin: 0 }}>
                                    <button
                                        className={`rv-layout-btn ${layoutPreference === 'relaxed' ? 'active' : ''}`}
                                        onClick={() => setLayoutPreference('relaxed')}
                                    >
                                        Relaxed
                                    </button>
                                    <button
                                        className={`rv-layout-btn ${layoutPreference === 'compact' ? 'active' : ''}`}
                                        onClick={() => setLayoutPreference('compact')}
                                    >
                                        Compact
                                    </button>
                                </div>
                            )}
                            <div className="rv-summary-item">
                                <span className="rv-summary-label">Total Records Found</span>
                                <span className="rv-summary-value">{displayData.length}</span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div className="rv-status-badge">
                                <span className="rv-badge-dot"></span>
                                Generated Successfully
                            </div>
                            {isPage && (
                                <>
                                    <button className="btn btn-secondary" onClick={handleExport} disabled={loading} title="Export"
                                        style={{ padding: '0.5rem', borderRadius: '0.5rem', height: 'auto', display: 'flex', minWidth: '0' }}>
                                        <Download size={16} />
                                    </button>
                                    <button className="btn btn-ghost" onClick={onClose} title="Back"
                                        style={{ padding: '0.5rem', borderRadius: '0.5rem', height: 'auto', display: 'flex', minWidth: '0', background: 'transparent', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}>
                                        <ArrowLeft size={16} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="rv-table-container" style={{ borderRadius: '0 0 1.5rem 1.5rem' }}>
                        {viewMode === 'chart' ? chartContent : (
                            <div className="rv-table-wrapper premium-scrollbar">
                                <table className="rv-table">
                                    <thead>
                                        <tr>
                                            {keys.map((key) => (
                                                <th key={key}>
                                                    {key.replace(/_/g, ' ')}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayData.map((row: any, idx: number) => (
                                            <tr key={idx}>
                                                {keys.map((key) => (
                                                    <td key={key}>
                                                        {row[key] !== null && row[key] !== undefined ? String(row[key]) : '-'}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        // Handle object response (like billing ledger aging)
        return (
            <div className="p-6 bg-gray-50 rounded-xl border border-gray-100">
                <pre className="text-xs text-gray-600 font-mono overflow-auto max-h-[500px] custom-scrollbar">
                    {JSON.stringify(data, null, 2)}
                </pre>
            </div>
        );
    };

    if (isPage) {
        return (
            <div style={{
                display: 'flex', flexDirection: 'column',
                height: '100%',       /* fills the calc() wrapper in ReportPage */
                minHeight: 0,
                background: 'var(--color-bg-primary)',
                borderRadius: '1.25rem',
                border: '1px solid var(--color-border)',
                boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
                overflow: 'hidden',
            }}>
                {/* ── Report Header ── */}
                <div style={{
                    padding: '1rem 1.75rem',
                    borderBottom: '1px solid var(--color-border)',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'var(--color-bg-primary)', flexShrink: 0, gap: '1rem',
                }}>
                    <div style={{ minWidth: 0 }}>
                        {report.category && (
                            <span style={{
                                fontSize: '0.7rem', fontWeight: '700', color: 'var(--color-text-tertiary)',
                                textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block', marginBottom: '0.2rem',
                            }}>
                                {report.category}
                            </span>
                        )}
                        <h2 style={{
                            fontSize: '1.125rem', fontWeight: '800', color: 'var(--color-text-primary)',
                            margin: 0, letterSpacing: '-0.01em',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                            {report.name}
                        </h2>
                        {report.description && (
                            <p style={{
                                fontSize: '0.8rem', color: 'var(--color-text-tertiary)',
                                margin: '0.2rem 0 0', lineHeight: 1.4,
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                                {report.description}
                            </p>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexShrink: 0 }}>
                        {report.requiresDateFilter && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-secondary)', padding: '0.25rem 0.25rem 0.25rem 0.75rem', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }}>
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input type="date" className="modern-date-input"
                                        style={{ height: '32px', padding: '0 0.25rem', fontSize: '0.8rem', border: 'none', background: 'transparent', width: 'auto', cursor: 'pointer', color: 'var(--color-text-primary)' }}
                                        value={filters.start_date}
                                        onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                        title="Start Date" />
                                    <span style={{ color: 'var(--color-text-tertiary)', fontWeight: 600, fontSize: '0.75rem' }}>to</span>
                                    <input type="date" className="modern-date-input"
                                        style={{ height: '32px', padding: '0 0.25rem', fontSize: '0.8rem', border: 'none', background: 'transparent', width: 'auto', cursor: 'pointer', color: 'var(--color-text-primary)' }}
                                        value={filters.end_date}
                                        onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                        title="End Date" />
                                </div>
                                <button className="btn-run-report" onClick={handleRunReport} disabled={loading}
                                    style={{ margin: 0, height: '32px', padding: '0 1rem', borderRadius: '0.5rem', fontSize: '0.8rem', gap: '0.375rem', boxShadow: 'none' }}>
                                    <Filter size={14} />
                                    Run
                                </button>
                            </div>
                        )}
                        {!report.requiresDateFilter && (
                            <button className="btn btn-primary" onClick={handleRunReport} disabled={loading}
                                style={{ height: '36px', padding: '0 1rem', borderRadius: '0.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <RefreshCw size={14} />
                                Refresh Report
                            </button>
                        )}
                        {!data && (
                            <button className="btn btn-ghost" onClick={onClose} title="Back"
                                style={{ padding: '0.5rem', borderRadius: '0.5rem', display: 'flex', border: '1px solid var(--color-border)' }}>
                                <ArrowLeft size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Body ── */}
                <div style={{
                    flex: 1, display: 'flex', flexDirection: 'column',
                    overflow: 'hidden', padding: '1.25rem 1.5rem',
                    minHeight: 0, gap: '1rem',
                }}>
                    {isBillingLedgerAging ? (
                        <div style={{ flex: 1, overflow: 'hidden', margin: '-1.25rem -1.5rem' }}>
                            <BillingLedgerAging />
                        </div>
                    ) : (
                        <>
                            {/* Date Filters block removed as they are now in the header */}

                            {/* Error */}
                            {error && (
                                <div style={{
                                    flexShrink: 0, padding: '0.75rem 1rem',
                                    backgroundColor: '#fef2f2', border: '1px solid #fee2e2',
                                    borderRadius: '0.625rem', color: '#dc2626',
                                    fontSize: '0.875rem', fontWeight: '600',
                                }}>
                                    {error}
                                </div>
                            )}

                            {/* Loading */}
                            {loading && (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="rv-loader-container">
                                        <div className="rv-spinner-ring"></div>
                                        <div className="rv-loader-text">Analyzing Data...</div>
                                        <div className="rv-loader-subtext">Compiling your comprehensive report</div>
                                    </div>
                                </div>
                            )}

                            {/* Data Table — fills all remaining height */}
                            {!loading && (
                                <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                                    {data && renderTableData()}

                                    {!data && !error && (
                                        <div className="empty-state" style={{ marginTop: '2rem' }}>
                                            <Calendar style={{ width: '3rem', height: '3rem', color: 'var(--color-text-tertiary)', margin: '0 auto 1.25rem' }} />
                                            <h3 className="empty-state-title">Ready to run report</h3>
                                            <p className="empty-state-description">
                                                {report.requiresDateFilter
                                                    ? 'Select date range and click "Run Report" to view data'
                                                    : 'Loading report data...'}
                                            </p>
                                            {!report.requiresDateFilter && (
                                                <button className="btn btn-primary" onClick={handleRunReport}>
                                                    <RefreshCw size={16} />
                                                    Run Report
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div
                className="modal"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: '95vw', width: 'min(1280px, 95vw)', borderRadius: '2rem' }}
            >
                <div className="modal-header">
                    <div>
                        <h2 className="modal-title">{report.name}</h2>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
                            {report.description}
                        </p>
                    </div>
                    <button className="modal-close" onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className="modal-body" style={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '80vh',
                    padding: 0,
                    overflow: 'hidden'
                }}>
                    {isBillingLedgerAging ? (
                        <BillingLedgerAging />
                    ) : (
                        <div style={{ padding: 'min(2.5rem, 4vh)', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
                            {/* Filters Section */}
                            {report.requiresDateFilter && (
                                <div className="report-viewer-card mb-6" style={{ padding: 'min(2.5rem, 4vh)' }}>
                                    <div className="report-description">
                                        {report.description || `Compare expected vs actual ${report.name.toLowerCase()}`}
                                    </div>
                                    <div className="report-filters-container">
                                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                            <div className="filter-input-group">
                                                <label className="filter-label">START DATE</label>
                                                <div className="date-input-wrapper">
                                                    <input
                                                        type="date"
                                                        className="modern-date-input"
                                                        value={filters.start_date}
                                                        onChange={(e) => setFilters({ ...filters, start_date: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="filter-input-group">
                                                <label className="filter-label">END DATE</label>
                                                <div className="date-input-wrapper">
                                                    <input
                                                        type="date"
                                                        className="modern-date-input"
                                                        value={filters.end_date}
                                                        onChange={(e) => setFilters({ ...filters, end_date: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                        <button className="btn-run-report" onClick={handleRunReport} disabled={loading}
                                            style={{ margin: 0, height: '44px', alignSelf: 'flex-end', padding: '0 1.5rem', borderRadius: '0.75rem' }}>
                                            <Filter size={18} />
                                            Run Report
                                        </button>
                                    </div>
                                    {(!filters.start_date || !filters.end_date) && (
                                        <div className="filter-help-text">
                                            Please select both start and end dates
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div
                                    style={{
                                        padding: 'var(--spacing-md)',
                                        backgroundColor: '#fee',
                                        border: '1px solid #fcc',
                                        borderRadius: 'var(--radius-md)',
                                        color: '#c00',
                                        marginBottom: 'var(--spacing-lg)',
                                    }}
                                >
                                    {error}
                                </div>
                            )}

                            {/* Loading State */}
                            {loading && (
                                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', minHeight: '400px' }}>
                                    <div className="rv-loader-container">
                                        <div className="rv-spinner-ring"></div>
                                        <div className="rv-loader-text">Analyzing Data...</div>
                                        <div className="rv-loader-subtext">Compiling your comprehensive report</div>
                                    </div>
                                </div>
                            )}

                            {/* Data Display */}
                            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
                                {!loading && data && renderTableData()}

                                {/* Empty State */}
                                {!loading && !data && !error && (
                                    <div className="empty-state">
                                        <Calendar className="empty-state-icon" />
                                        <h3 className="empty-state-title">Ready to run report</h3>
                                        <p className="empty-state-description">
                                            {report.requiresDateFilter
                                                ? 'Select date range and click "Run Report" to view data'
                                                : 'Click "Run Report" to view data'}
                                        </p>
                                        {!report.requiresDateFilter && (
                                            <button className="btn btn-primary" onClick={handleRunReport}>
                                                <RefreshCw size={18} />
                                                Run Report
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Close
                    </button>
                    {data && (
                        <button className="btn btn-primary" onClick={handleExport} disabled={loading}>
                            <Download size={18} />
                            Export
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
