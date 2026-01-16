import { useState, useEffect } from 'react';
import { X, Calendar, Download, RefreshCw, Filter } from 'lucide-react';
import { type Report } from '../data/reports';
import * as api from '../services/api';
import BillingLedgerAging from './reports/BillingLedgerAging';
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

    const renderTableData = () => {
        if (!data) return null;

        // Try to get the actual array if it's wrapped in an object
        const displayData = Array.isArray(data) ? data : (data.data && Array.isArray(data.data) ? data.data : null);

        if (displayData) {
            if (displayData.length === 0) {
                return (
                    <div className="empty-state">
                        <p>No data available for the selected criteria</p>
                    </div>
                );
            }

            // Render as table
            const keys = Object.keys(displayData[0]).filter(k => k !== 'prov_ins_file');
            return (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-100">
                        <thead className="bg-gray-50/50">
                            <tr>
                                {keys.map((key) => (
                                    <th
                                        key={key}
                                        className="px-6 py-4 text-left text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100"
                                    >
                                        {key.replace(/_/g, ' ')}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-50">
                            {displayData.map((row: any, idx: number) => (
                                <tr
                                    key={idx}
                                    className="hover:bg-gray-50/50 transition-colors group"
                                >
                                    {keys.map((key) => (
                                        <td
                                            key={key}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium group-hover:text-gray-900"
                                        >
                                            {row[key] !== null && row[key] !== undefined ? String(row[key]) : '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
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
            <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-white">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">{report.name}</h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {report.description}
                        </p>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col p-6">
                    {isBillingLedgerAging ? (
                        <div className="flex-1 overflow-hidden -m-6">
                            <BillingLedgerAging />
                        </div>
                    ) : (
                        <>
                            {/* Filters Section */}
                            {report.requiresDateFilter && (
                                <div className="report-viewer-card mb-8">
                                    <div className="report-description">
                                        {report.description || `Compare expected vs actual ${report.name.toLowerCase()}`}
                                    </div>
                                    <div className="report-filters-container">
                                        <div className="flex gap-4 items-start">
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
                                        <button className="btn-run-report" onClick={handleRunReport} disabled={loading}>
                                            <Filter size={24} />
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
                                <div className="p-4 bg-red-50 border border-red-100 rounded-lg text-red-600 mb-6">
                                    {error}
                                </div>
                            )}

                            {/* Loading State */}
                            {loading && (
                                <div className="text-center p-12">
                                    <RefreshCw size={32} className="shimmer mx-auto text-primary" />
                                    <p className="mt-4 text-gray-500">Loading report data...</p>
                                </div>
                            )}

                            {/* Data Display */}
                            <div className="flex-1 overflow-auto rounded-lg border border-gray-100">
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
                        </>
                    )}
                </div>

                <div className="p-4 border-t border-gray-100 flex justify-end gap-3 bg-gray-50">
                    <button className="btn btn-secondary" onClick={onClose}>
                        Back to Reports
                    </button>
                    {data && (
                        <button className="btn btn-primary">
                            <Download size={18} />
                            Export
                        </button>
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
                style={{ maxWidth: '90vw', width: '1200px' }}
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
                    height: '75vh',
                    padding: isBillingLedgerAging ? 0 : '0'
                }}>
                    {isBillingLedgerAging ? (
                        <BillingLedgerAging />
                    ) : (
                        <div style={{ padding: '2.5rem' }}>
                            {/* Filters Section */}
                            {report.requiresDateFilter && (
                                <div className="report-viewer-card mb-8">
                                    <div className="report-description">
                                        {report.description || `Compare expected vs actual ${report.name.toLowerCase()}`}
                                    </div>
                                    <div className="report-filters-container">
                                        <div className="flex gap-4 items-start">
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
                                        <button className="btn-run-report" onClick={handleRunReport} disabled={loading}>
                                            <Filter size={24} />
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
                                <div style={{ textAlign: 'center', padding: 'var(--spacing-2xl)' }}>
                                    <RefreshCw size={32} className="shimmer" style={{ margin: '0 auto' }} />
                                    <p style={{ marginTop: 'var(--spacing-md)', color: 'var(--color-text-secondary)' }}>
                                        Loading report data...
                                    </p>
                                </div>
                            )}

                            {/* Data Display */}
                            <div style={{ flex: 1, overflow: 'auto' }}>
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
                        <button className="btn btn-primary">
                            <Download size={18} />
                            Export
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
