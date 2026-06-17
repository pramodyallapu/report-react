import { useState, useEffect, useRef } from 'react';
import { X, Calendar, Download, RefreshCw, Filter, ArrowLeft, BarChart2, Table as TableIcon, FileText, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';
import { type Report } from '../data/reports';
import * as api from '../services/api';
import BillingLedgerAging from './reports/BillingLedgerAging';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    const [showDownloadMenu, setShowDownloadMenu] = useState(false);
    const downloadMenuRef = useRef<HTMLDivElement>(null);
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        year: new Date().getFullYear().toString(),
        payroll_time: '',
        till_date: '',
        staff_provider_text: '',
    });

    const filterType = report.filterType;
    const needsFilter = report.requiresDateFilter || !!filterType;

    const getStaffProviderIds = (): number[] =>
        filters.staff_provider_text
            .split(',')
            .map(s => parseInt(s.trim(), 10))
            .filter(n => !isNaN(n) && n > 0);
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

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (downloadMenuRef.current && !downloadMenuRef.current.contains(e.target as Node)) {
                setShowDownloadMenu(false);
            }
        };
        if (showDownloadMenu) document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showDownloadMenu]);

    const isBillingLedgerAging = report.id === 'billing-ledger-aging';

    // Auto-load reports that need no filter input at all
    useEffect(() => {
        if (!report.requiresDateFilter && !report.filterType && !isBillingLedgerAging) {
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
                        case 'missing_credential_files':
                            response = await api.staffReportsAPI.getMissingCredentialFiles(filters);
                            break;
                        case 'missing_other_document_files':
                            response = await api.staffReportsAPI.getMissingOtherDocumentFiles(filters);
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
                        case 'bcba_billable_kpi':
                            response = await api.staffReportsAPI.getBCBABillableKPI(filters);
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
                        case 'patients_without_schedules':
                            response = await api.patientReportsAPI.getPatientsWithoutSchedules(filters);
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
                } else if (endpointUrl.includes('/sessions/rendered_not_billed')) {
                    response = await api.appointmentReportsAPI.getRenderedNotBilled(filters);
                } else if (endpointUrl.includes('billing-ledger-aging')) {
                    response = await api.billingLedgerAPI.getAgingData({
                        type: 1,
                        date_type: 'dos',
                    });
                } else if (endpointUrl.includes('/appointment_details/')) {
                    // Nested appointment detail routes
                    const subType = endpointUrl.split('/appointment_details/').pop();
                    switch (subType) {
                        case 'total':
                            response = await api.appointmentDetailReportsAPI.getTotal(filters);
                            break;
                        case 'billable':
                            response = await api.appointmentDetailReportsAPI.getBillable(filters);
                            break;
                        case 'nonbillable':
                            response = await api.appointmentDetailReportsAPI.getNonBillable(filters);
                            break;
                        case 'employee_wise':
                            response = await api.appointmentDetailReportsAPI.getEmployeeWise(filters);
                            break;
                        case 'patient_wise':
                            response = await api.appointmentDetailReportsAPI.getPatientWise(filters);
                            break;
                        case 'overtime':
                            response = await api.appointmentDetailReportsAPI.getOvertime(filters);
                            break;
                    }
                } else if (endpointUrl.includes('/profit_loss/')) {
                    // Nested profit/loss routes
                    const subType = endpointUrl.split('/profit_loss/').pop();
                    switch (subType) {
                        case 'by_service':
                            response = await api.financialReportsAPI.getProfitLossByService(filters);
                            break;
                        case 'by_provider':
                            response = await api.financialReportsAPI.getProfitLossByProvider(filters);
                            break;
                    }
                } else if (endpointUrl.includes('/reports/')) {
                    const endpoint = endpointUrl.split('/').pop();
                    switch (endpoint) {
                        case 'schedule_billable':
                            response = await api.financialReportsAPI.getScheduleBillable(filters);
                            break;
                        case 'payment_deposits':
                            response = await api.financialReportsAPI.getPaymentDeposits(filters);
                            break;
                        case 'last_week_deposits':
                            response = await api.financialReportsAPI.getLastWeekDeposits(filters);
                            break;
                        case 'last_month_statements':
                            response = await api.financialReportsAPI.getLastMonthStatements(filters);
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
                        case 'appointment_count_by_month':
                            response = await api.financialReportsAPI.getAppointmentCountByMonth(filters);
                            break;
                        case 'client_service_summary':
                            response = await api.financialReportsAPI.getClientServiceSummary(filters);
                            break;
                        case 'xero_report':
                            response = await api.financialReportsAPI.getXeroReport(filters);
                            break;
                        case 'leave_tracking':
                            response = await api.financialReportsAPI.getLeaveTracking({ year: parseInt(filters.year, 10) });
                            break;
                        case 'supervision_rbt_wise':
                            response = await api.supervisionReportsAPI.getSupervisionRBTWise(filters);
                            break;
                        case 'supervision_patient_wise':
                            response = await api.supervisionReportsAPI.getSupervisionPatientWise(filters);
                            break;
                        case 'supervision_per_staff':
                            response = await api.supervisionReportsAPI.getSupervisionPerStaff(filters);
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
                        case 'ar_ledger_production_hourly':
                            response = await api.ledgerReportsAPI.getARLedgerProductionHourly(filters);
                            break;
                        case 'billing_production_hourly':
                            response = await api.ledgerReportsAPI.getBillingProductionHourly(filters);
                            break;
                        case 'deposit_production_hourly':
                            response = await api.ledgerReportsAPI.getDepositProductionHourly(filters);
                            break;
                        case 'manage_secondary_claims':
                            response = await api.ledgerReportsAPI.getManageSecondaryClaims(filters);
                            break;
                        case 'sftp_push_pending_batches':
                            response = await api.ledgerReportsAPI.getSFTPPushPendingBatches(filters);
                            break;
                        case 'concurrent_billing':
                            response = await api.ledgerReportsAPI.getConcurrentBilling(filters);
                            break;
                        case 'cpt_icd_billed_vs_invoice':
                            response = await api.ledgerReportsAPI.getCPTICDBilledVsInvoice(filters);
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
                        case 'gusto_payroll':
                            response = await api.payrollReportsAPI.getGustoPayroll({
                                payroll_time: parseInt(filters.payroll_time, 10),
                                staff_provider: getStaffProviderIds(),
                            });
                            break;
                        case 'adp_payroll':
                            response = await api.payrollReportsAPI.getADPPayroll({
                                till_date: filters.till_date,
                                staff_provider: getStaffProviderIds(),
                            });
                            break;
                        case 'bamboohr_payroll':
                            response = await api.payrollReportsAPI.getBambooHRPayroll({
                                payroll_time: parseInt(filters.payroll_time, 10),
                                staff_provider: getStaffProviderIds(),
                            });
                            break;
                        case 'fingercheck_payroll':
                            response = await api.payrollReportsAPI.getFingerchecKPayroll(filters);
                            break;
                        case 'paychex_payroll':
                            response = await api.payrollReportsAPI.getPaychexPayroll(filters);
                            break;
                        case 'paycom_report':
                            response = await api.payrollReportsAPI.getPaycomReport(filters);
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
        if (filterType === 'year' && !filters.year) {
            setError('Please enter a year');
            return;
        }
        if (filterType === 'payroll-period') {
            if (!filters.payroll_time) { setError('Please enter the Pay Period ID'); return; }
            if (!filters.staff_provider_text.trim()) { setError('Please enter at least one Provider ID'); return; }
        }
        if (filterType === 'adp-payroll') {
            if (!filters.till_date) { setError('Please enter the Till Date'); return; }
            if (!filters.staff_provider_text.trim()) { setError('Please enter at least one Provider ID'); return; }
        }
        loadReportData();
    };

    const dlMenuItemStyle: React.CSSProperties = {
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        width: '100%', padding: '0.5rem 0.875rem', border: 'none', background: 'none',
        cursor: 'pointer', fontSize: '0.8125rem', color: 'var(--color-text-primary)',
        textAlign: 'left', whiteSpace: 'nowrap',
        transition: 'background 0.15s',
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
            const { rows: displayData } = normalizeData(data);

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

    const handleExportPDF = () => {
        setShowDownloadMenu(false);
        if (!data) return;
        const { rows: displayData, colMeta } = normalizeData(data);
        if (!displayData || displayData.length === 0) {
            alert('No data available to export');
            return;
        }

        const keys = Object.keys(displayData[0]).filter(k => k !== 'prov_ins_file' && k !== 'is_total');

        const headerLabel = (key: string): string => {
            if (colMeta) {
                const found = colMeta.find(c => c.field === key);
                if (found) return found.title;
            }
            return key.replace(/_/g, ' ').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/\b\w/g, c => c.toUpperCase());
        };

        const doc = new jsPDF({ orientation: keys.length > 7 ? 'landscape' : 'portrait', unit: 'pt', format: 'a4' });
        const pageWidth = doc.internal.pageSize.getWidth();

        // Header bar
        doc.setFillColor(30, 27, 75);
        doc.rect(0, 0, pageWidth, 50, 'F');

        // Report title
        doc.setTextColor(255, 255, 255);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(15);
        doc.text(report.name, pageWidth / 2, 22, { align: 'center' });

        // Subtitle: category + date range
        const subtitleParts: string[] = [];
        if (report.category) subtitleParts.push(report.category);
        if (filters.start_date && filters.end_date) subtitleParts.push(`${filters.start_date} to ${filters.end_date}`);
        else if (filters.year && report.filterType === 'year') subtitleParts.push(`Year: ${filters.year}`);
        if (subtitleParts.length > 0) {
            doc.setFont('helvetica', 'normal');
            doc.setFontSize(9);
            doc.setTextColor(200, 200, 230);
            doc.text(subtitleParts.join('  ·  '), pageWidth / 2, 39, { align: 'center' });
        }

        // Generated date stamp
        doc.setTextColor(170, 170, 200);
        doc.setFontSize(7.5);
        doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 14, 45, { align: 'right' });

        const body = displayData.map(row =>
            keys.map(k => {
                const v = row[k];
                if (v === null || v === undefined) return '';
                if (typeof v === 'boolean') return v ? 'Yes' : 'No';
                if (typeof v === 'object') return JSON.stringify(v);
                return String(v);
            })
        );

        autoTable(doc, {
            head: [keys.map(headerLabel)],
            body,
            startY: 58,
            theme: 'grid',
            styles: { fontSize: 7.5, cellPadding: 3, overflow: 'linebreak', valign: 'middle' },
            headStyles: {
                fillColor: [231, 230, 230],
                textColor: [30, 27, 75],
                fontStyle: 'bold',
                halign: 'center',
                lineColor: [180, 180, 180],
                lineWidth: 0.5,
            },
            bodyStyles: { textColor: [50, 50, 70] },
            alternateRowStyles: { fillColor: [248, 248, 252] },
            didParseCell: (hookData) => {
                if (hookData.row.raw && (hookData.row.raw as any[]).includes?.('TOTAL') === false
                    && displayData[hookData.row.index]?.is_total) {
                    hookData.cell.styles.fontStyle = 'bold';
                    hookData.cell.styles.fillColor = [240, 240, 245];
                }
            },
            didDrawPage: (hookData) => {
                const pageCount = (doc as any).internal.getNumberOfPages();
                const pageNum = hookData.pageNumber;
                doc.setFontSize(7);
                doc.setTextColor(150, 150, 170);
                doc.text(
                    `Page ${pageNum} of ${pageCount}`,
                    pageWidth / 2,
                    doc.internal.pageSize.getHeight() - 8,
                    { align: 'center' }
                );
                doc.text('TherapyPM Report', 14, doc.internal.pageSize.getHeight() - 8);
            },
        });

        const dateStr = new Date().toISOString().split('T')[0];
        const safeName = report.name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        doc.save(`${safeName}_${dateStr}.pdf`);
    };

    const handleExportCSV = () => {
        setShowDownloadMenu(false);
        handleExport();
    };

    // Normalize any API response shape into a flat array + optional column meta
    const normalizeData = (raw: any): { rows: any[]; colMeta: { field: string; title: string }[] | null } => {
        if (!raw) return { rows: [], colMeta: null };
        // Plain array
        if (Array.isArray(raw)) return { rows: raw, colMeta: null };
        // { data: [...], columns?: [...] }
        if (raw.data && Array.isArray(raw.data)) {
            const colMeta = Array.isArray(raw.columns) && raw.columns.length > 0 ? raw.columns : null;
            return { rows: raw.data, colMeta };
        }
        // leave_tracking: { leave_types: [...], rows: [...] }
        if (raw.rows && Array.isArray(raw.rows)) return { rows: raw.rows, colMeta: null };
        return { rows: [], colMeta: null };
    };

    const renderTableData = () => {
        if (!data) return null;

        const { rows: displayData, colMeta } = normalizeData(data);

        if (displayData !== null && displayData !== undefined) {
            if (displayData.length === 0) {
                return (
                    <div className="empty-state">
                        <p>No data available for the selected criteria</p>
                    </div>
                );
            }

            const keys = displayData[0] ? Object.keys(displayData[0]).filter(k => k !== 'prov_ins_file' && k !== 'is_total') : [];

            // Build a header label map: field → display title
            const headerLabel = (key: string): string => {
                if (colMeta) {
                    const found = colMeta.find(c => c.field === key);
                    if (found) return found.title;
                }
                // Convert snake_case / camelCase to Title Case
                return key
                    .replace(/_/g, ' ')
                    .replace(/([a-z])([A-Z])/g, '$1 $2')
                    .replace(/\b\w/g, c => c.toUpperCase());
            };

            // Format cell value
            const cellVal = (v: any): string => {
                if (v === null || v === undefined) return '-';
                if (typeof v === 'boolean') return v ? 'Yes' : 'No';
                if (typeof v === 'object') return JSON.stringify(v);
                return String(v);
            };

            let chartContent = null;
            if (viewMode === 'chart') {
                const chartData = displayData.map((row: any) => {
                    const newRow: any = {};
                    keys.forEach(key => {
                        const v = row[key];
                        if (typeof v === 'string') {
                            const parsed = parseFloat(v.replace(/,/g, '').replace(/^\$/, ''));
                            newRow[key] = (!isNaN(parsed) && v.match(/[0-9]/) && !v.includes('-202') && !v.includes('/202')) ? parsed : v;
                        } else {
                            newRow[key] = v;
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
                                    <div ref={downloadMenuRef} style={{ position: 'relative' }}>
                                        <button
                                            className="btn btn-secondary"
                                            onClick={() => setShowDownloadMenu(v => !v)}
                                            disabled={loading}
                                            title="Download"
                                            style={{ padding: '0.5rem 0.625rem', borderRadius: '0.5rem', height: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', minWidth: 0 }}
                                        >
                                            <Download size={14} />
                                            <ChevronDown size={11} />
                                        </button>
                                        {showDownloadMenu && (
                                            <div style={{
                                                position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 200,
                                                background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)',
                                                borderRadius: '0.625rem', boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                                                minWidth: '170px', overflow: 'hidden',
                                            }}>
                                                <button onClick={handleExportCSV} style={dlMenuItemStyle}>
                                                    <FileSpreadsheet size={14} style={{ color: '#16a34a' }} />
                                                    Download as CSV
                                                </button>
                                                <button onClick={handleExportPDF} style={dlMenuItemStyle}>
                                                    <FileText size={14} style={{ color: '#dc2626' }} />
                                                    Download as PDF
                                                </button>
                                            </div>
                                        )}
                                    </div>
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
                                                <th key={key}>{headerLabel(key)}</th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {displayData.map((row: any, idx: number) => (
                                            <tr key={idx} style={row.is_total ? { fontWeight: 700, background: 'var(--color-bg-secondary)' } : undefined}>
                                                {keys.map((key) => (
                                                    <td key={key}>{cellVal(row[key])}</td>
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

        return null;
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
                        {filterType === 'year' && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-secondary)', padding: '0.25rem 0.25rem 0.25rem 0.75rem', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)', fontWeight: 600 }}>YEAR</span>
                                <input type="number" min="2000" max="2100"
                                    style={{ height: '32px', width: '80px', padding: '0 0.5rem', fontSize: '0.8rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
                                    value={filters.year}
                                    onChange={(e) => setFilters({ ...filters, year: e.target.value })} />
                                <button className="btn-run-report" onClick={handleRunReport} disabled={loading}
                                    style={{ margin: 0, height: '32px', padding: '0 1rem', borderRadius: '0.5rem', fontSize: '0.8rem', gap: '0.375rem', boxShadow: 'none' }}>
                                    <Filter size={14} />
                                    Run
                                </button>
                            </div>
                        )}
                        {(filterType === 'payroll-period' || filterType === 'adp-payroll') && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-bg-secondary)', padding: '0.25rem 0.25rem 0.25rem 0.75rem', borderRadius: '0.75rem', border: '1px solid var(--color-border)' }}>
                                {filterType === 'payroll-period' ? (
                                    <>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 700, whiteSpace: 'nowrap' }}>PERIOD ID</span>
                                        <input type="number" placeholder="Pay Period ID"
                                            style={{ height: '32px', width: '100px', padding: '0 0.5rem', fontSize: '0.8rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
                                            value={filters.payroll_time}
                                            onChange={(e) => setFilters({ ...filters, payroll_time: e.target.value })} />
                                    </>
                                ) : (
                                    <>
                                        <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 700, whiteSpace: 'nowrap' }}>TILL DATE</span>
                                        <input type="date" className="modern-date-input"
                                            style={{ height: '32px', padding: '0 0.25rem', fontSize: '0.8rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)', cursor: 'pointer' }}
                                            value={filters.till_date}
                                            onChange={(e) => setFilters({ ...filters, till_date: e.target.value })} />
                                    </>
                                )}
                                <span style={{ fontSize: '0.7rem', color: 'var(--color-text-tertiary)', fontWeight: 700, whiteSpace: 'nowrap' }}>PROVIDERS</span>
                                <input type="text" placeholder="IDs e.g. 1,2,3"
                                    style={{ height: '32px', width: '120px', padding: '0 0.5rem', fontSize: '0.8rem', border: '1px solid var(--color-border)', borderRadius: '0.375rem', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
                                    value={filters.staff_provider_text}
                                    onChange={(e) => setFilters({ ...filters, staff_provider_text: e.target.value })} />
                                <button className="btn-run-report" onClick={handleRunReport} disabled={loading}
                                    style={{ margin: 0, height: '32px', padding: '0 1rem', borderRadius: '0.5rem', fontSize: '0.8rem', gap: '0.375rem', boxShadow: 'none' }}>
                                    <Filter size={14} />
                                    Run
                                </button>
                            </div>
                        )}
                        {!needsFilter && (
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
                                                    : filterType === 'year'
                                                        ? 'Select a year and click "Run Report" to view data'
                                                        : filterType === 'payroll-period'
                                                            ? 'Enter Pay Period ID and Provider IDs, then click "Run Report"'
                                                            : filterType === 'adp-payroll'
                                                                ? 'Enter Till Date and Provider IDs, then click "Run Report"'
                                                                : 'Loading report data...'}
                                            </p>
                                            {!needsFilter && (
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
                            {needsFilter && (
                                <div className="report-viewer-card mb-6" style={{ padding: 'min(2.5rem, 4vh)' }}>
                                    <div className="report-description">
                                        {report.description}
                                    </div>
                                    <div className="report-filters-container">
                                        {report.requiresDateFilter && (
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                                                <div className="filter-input-group">
                                                    <label className="filter-label">START DATE</label>
                                                    <div className="date-input-wrapper">
                                                        <input type="date" className="modern-date-input"
                                                            value={filters.start_date}
                                                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div className="filter-input-group">
                                                    <label className="filter-label">END DATE</label>
                                                    <div className="date-input-wrapper">
                                                        <input type="date" className="modern-date-input"
                                                            value={filters.end_date}
                                                            onChange={(e) => setFilters({ ...filters, end_date: e.target.value })} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {filterType === 'year' && (
                                            <div className="filter-input-group">
                                                <label className="filter-label">YEAR</label>
                                                <input type="number" min="2000" max="2100"
                                                    style={{ height: '44px', width: '120px', padding: '0 0.75rem', fontSize: '0.9rem', border: '1px solid var(--color-border)', borderRadius: '0.625rem', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
                                                    value={filters.year}
                                                    onChange={(e) => setFilters({ ...filters, year: e.target.value })} />
                                            </div>
                                        )}
                                        {(filterType === 'payroll-period' || filterType === 'adp-payroll') && (
                                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                                                {filterType === 'payroll-period' ? (
                                                    <div className="filter-input-group">
                                                        <label className="filter-label">PAY PERIOD ID</label>
                                                        <input type="number" placeholder="e.g. 42"
                                                            style={{ height: '44px', width: '140px', padding: '0 0.75rem', fontSize: '0.9rem', border: '1px solid var(--color-border)', borderRadius: '0.625rem', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
                                                            value={filters.payroll_time}
                                                            onChange={(e) => setFilters({ ...filters, payroll_time: e.target.value })} />
                                                    </div>
                                                ) : (
                                                    <div className="filter-input-group">
                                                        <label className="filter-label">TILL DATE</label>
                                                        <div className="date-input-wrapper">
                                                            <input type="date" className="modern-date-input"
                                                                value={filters.till_date}
                                                                onChange={(e) => setFilters({ ...filters, till_date: e.target.value })} />
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="filter-input-group">
                                                    <label className="filter-label">PROVIDER IDs (comma-separated)</label>
                                                    <input type="text" placeholder="e.g. 1,2,3"
                                                        style={{ height: '44px', minWidth: '200px', padding: '0 0.75rem', fontSize: '0.9rem', border: '1px solid var(--color-border)', borderRadius: '0.625rem', background: 'var(--color-bg-primary)', color: 'var(--color-text-primary)' }}
                                                        value={filters.staff_provider_text}
                                                        onChange={(e) => setFilters({ ...filters, staff_provider_text: e.target.value })} />
                                                </div>
                                            </div>
                                        )}
                                        <button className="btn-run-report" onClick={handleRunReport} disabled={loading}
                                            style={{ margin: 0, height: '44px', alignSelf: 'flex-end', padding: '0 1.5rem', borderRadius: '0.75rem' }}>
                                            <Filter size={18} />
                                            Run Report
                                        </button>
                                    </div>
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
                                                : filterType === 'year'
                                                    ? 'Select a year and click "Run Report" to view data'
                                                    : filterType === 'payroll-period'
                                                        ? 'Enter Pay Period ID and Provider IDs, then click "Run Report"'
                                                        : filterType === 'adp-payroll'
                                                            ? 'Enter Till Date and Provider IDs, then click "Run Report"'
                                                            : 'Click "Run Report" to view data'}
                                        </p>
                                        {!needsFilter && (
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
                        <div ref={downloadMenuRef} style={{ position: 'relative' }}>
                            <button
                                className="btn btn-primary"
                                onClick={() => setShowDownloadMenu(v => !v)}
                                disabled={loading}
                                style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}
                            >
                                <Download size={16} />
                                Download
                                <ChevronDown size={13} />
                            </button>
                            {showDownloadMenu && (
                                <div style={{
                                    position: 'absolute', bottom: 'calc(100% + 6px)', right: 0, zIndex: 200,
                                    background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)',
                                    borderRadius: '0.625rem', boxShadow: '0 8px 24px rgba(0,0,0,0.14)',
                                    minWidth: '170px', overflow: 'hidden',
                                }}>
                                    <button onClick={handleExportCSV} style={dlMenuItemStyle}>
                                        <FileSpreadsheet size={14} style={{ color: '#16a34a' }} />
                                        Download as CSV
                                    </button>
                                    <button onClick={handleExportPDF} style={dlMenuItemStyle}>
                                        <FileText size={14} style={{ color: '#dc2626' }} />
                                        Download as PDF
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
