export interface Report {
    id: string;
    name: string;
    category: string;
    createdBy: string;
    lastVisited?: string;
    description?: string;
    requiresDateFilter?: boolean;
    apiEndpoint?: string;
    columns?: string[];
    isCustom?: boolean;
    config?: any;
}

export interface ReportCategory {
    id: string;
    name: string;
    icon: string;
    reports: Report[];
}

// All available reports organized by category
export const reportCategories: ReportCategory[] = [
    {
        id: 'staff',
        name: 'Staff',
        icon: 'Users',
        reports: [
            {
                id: 'active-staff',
                name: 'Active Staff',
                category: 'Staff',
                createdBy: 'System Generated',
                description: 'View all active staff members',
                apiEndpoint: '/api/admin/staffs/active_staff',
                columns: ['First Name', 'Last Name', 'Office Phone', 'Email', 'Title', 'Hire Date', 'Language', 'NPI'],
            },
            {
                id: 'missing-credentials',
                name: 'Staff with Missing Credentials',
                category: 'Staff',
                createdBy: 'System Generated',
                description: 'Staff members with incomplete credential information',
                apiEndpoint: '/api/admin/staffs/missing_credentials',
            },
            {
                id: 'expiring-credentials',
                name: 'Staff with Expiring Credentials',
                category: 'Staff',
                createdBy: 'System Generated',
                description: 'Staff members whose credentials are expiring soon',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/staffs/expiring_credentials',
            },
            {
                id: 'time-off-mgmt',
                name: 'Time Off Management',
                category: 'Staff',
                createdBy: 'System Generated',
                description: 'Track staff time off requests and approvals',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/staffs/time_of_mgmt',
            },
            {
                id: 'provider-missing-sign',
                name: 'Providers Missing Signatures',
                category: 'Staff',
                createdBy: 'System Generated',
                description: 'Providers who have not signed required documents',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/staffs/provider_missing_sign',
            },
        ],
    },
    {
        id: 'patients',
        name: 'Patients',
        icon: 'Heart',
        reports: [
            {
                id: 'expired-auth',
                name: 'Expired Authorizations',
                category: 'Patients',
                createdBy: 'System Generated',
                description: 'Patients with expired authorizations',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/patients/expired_auth',
                columns: ['Patient Name', 'Payor Name', 'Auth Number', 'End Date', 'Supervisor', 'Status'],
            },
            {
                id: 'expiring-auth',
                name: 'Expiring Authorizations',
                category: 'Patients',
                createdBy: 'System Generated',
                description: 'Patients with authorizations expiring soon',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/patients/expiring_auth',
            },
            {
                id: 'without-auth',
                name: 'Patients Without Authorization',
                category: 'Patients',
                createdBy: 'System Generated',
                description: 'Patients who do not have active authorizations',
                apiEndpoint: '/api/admin/patients/without_auth',
            },
            {
                id: 'expiring-doc',
                name: 'Expiring Documents',
                category: 'Patients',
                createdBy: 'System Generated',
                description: 'Patient documents that are expiring',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/patients/expiring_doc',
            },
            {
                id: 'auth-placeholder',
                name: 'Authorization Placeholders',
                category: 'Patients',
                createdBy: 'System Generated',
                description: 'Temporary authorization placeholders',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/patients/auth_placeholder',
            },
            {
                id: 'patient-guarantor-pay',
                name: 'Patient/Guarantor Pay Clients',
                category: 'Patients',
                createdBy: 'System Generated',
                description: 'Patients with self-pay or guarantor payment',
                apiEndpoint: '/api/admin/patients/non_payor_tag',
            },
            {
                id: 'arrived-info',
                name: 'Patient Arrival Information',
                category: 'Patients',
                createdBy: 'System Generated',
                description: 'Track patient arrival and check-in data',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/patients/arrived_info',
            },
        ],
    },
    {
        id: 'appointments',
        name: 'Appointments',
        icon: 'Calendar',
        reports: [
            {
                id: 'scheduled-not-rendered',
                name: 'Scheduled but Not Rendered',
                category: 'Appointments',
                createdBy: 'System Generated',
                description: 'Appointments scheduled but not marked as rendered',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/appointments/scheduled_not_rendered',
                columns: ['Client Name', 'Provider Name', 'Schedule Date', 'Status', 'Time Range', 'Billable Status'],
            },
            {
                id: 'sessions-not-attended',
                name: 'Sessions Not Attended',
                category: 'Appointments',
                createdBy: 'System Generated',
                description: 'Scheduled sessions that were not attended',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/appointments/scheduled_not_attended',
            },
            {
                id: 'session-missing-signature',
                name: 'Sessions Missing Signatures',
                category: 'Appointments',
                createdBy: 'System Generated',
                description: 'Sessions that require signatures',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/appointments/session_missing_signature',
            },
            {
                id: 'session-note-missing',
                name: 'Sessions with Missing Notes',
                category: 'Appointments',
                createdBy: 'System Generated',
                description: 'Sessions without clinical notes',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/appointments/session_note_missing',
            },
            {
                id: 'session-unlocked-notes',
                name: 'Sessions with Unlocked Notes',
                category: 'Appointments',
                createdBy: 'System Generated',
                description: 'Sessions with notes that are not locked',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/appointments/session_unlocked_notes',
            },
        ],
    },
    {
        id: 'receivables',
        name: 'Receivables',
        icon: 'DollarSign',
        reports: [
            {
                id: 'billing-ledger-aging',
                name: 'Billing Ledger Aging',
                category: 'Receivables',
                createdBy: 'System Generated',
                description: 'Aging analysis of outstanding receivables',
                apiEndpoint: '/api/billing-ledger-aging',
                columns: ['Payor', 'Client', 'Claim No', 'DOS', '0-30', '31-60', '61-90', '91-120', '121-180', '181-365', '365+'],
            },
            {
                id: 'ar-ledger-balance',
                name: 'AR Ledger with Balance',
                category: 'Receivables',
                createdBy: 'System Generated',
                description: 'Accounts receivable ledger showing balances',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/ar_ledger_with_balance',
            },
        ],
    },
    {
        id: 'financial-kpi',
        name: 'Financial & KPI',
        icon: 'TrendingUp',
        reports: [
            {
                id: 'schedule-billable',
                name: 'Schedule Billable Report',
                category: 'Financial & KPI',
                createdBy: 'System Generated',
                description: 'Billable hours from scheduled appointments',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/schedule_billable',
            },
            {
                id: 'payment-deposits',
                name: 'Payment Deposits',
                category: 'Financial & KPI',
                createdBy: 'System Generated',
                description: 'Track payment deposits and transactions',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/payment_deposits',
            },
            {
                id: 'kpi-by-month',
                name: 'KPI Report by Month',
                category: 'Financial & KPI',
                createdBy: 'System Generated',
                description: 'Monthly key performance indicators',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/kpi_by_month',
            },
            {
                id: 'kpi-by-patient',
                name: 'KPI Report by Patient',
                category: 'Financial & KPI',
                createdBy: 'System Generated',
                description: 'Patient-level key performance indicators',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/kpi_by_patient',
            },
            {
                id: 'kpi-by-insurance',
                name: 'KPI Report by Insurance',
                category: 'Financial & KPI',
                createdBy: 'System Generated',
                description: 'Insurance-level key performance indicators',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/kpi_by_insurance',
            },
        ],
    },
    {
        id: 'aba-hours',
        name: 'ABA Hours',
        icon: 'Clock',
        reports: [
            {
                id: 'aba-hour-client',
                name: 'ABA Hours by Client',
                category: 'ABA Hours',
                createdBy: 'System Generated',
                description: 'ABA therapy hours tracked by client',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/aba_hour_client',
            },
            {
                id: 'aba-hour-provider',
                name: 'ABA Hours by Provider',
                category: 'ABA Hours',
                createdBy: 'System Generated',
                description: 'ABA therapy hours tracked by provider',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/aba_hour_provider',
            },
        ],
    },
    {
        id: 'billing-ledger',
        name: 'Billing & Ledger',
        icon: 'FileText',
        reports: [
            {
                id: 'appointment-ledger',
                name: 'Appointment vs Ledger Report',
                category: 'Billing & Ledger',
                createdBy: 'System Generated',
                description: 'Compare appointments with ledger entries',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/appointment_ledger',
            },
            {
                id: 'appointment-billed',
                name: 'Appointment Billed Report',
                category: 'Billing & Ledger',
                createdBy: 'System Generated',
                description: 'Track billed appointments',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/appointment_billed',
            },
            {
                id: 'max-auth-utilization',
                name: 'Max Total Auth Utilization',
                category: 'Billing & Ledger',
                createdBy: 'System Generated',
                description: 'Authorization utilization tracking',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/max_total_auth_total',
            },
        ],
    },
    {
        id: 'payroll',
        name: 'Payroll',
        icon: 'Wallet',
        reports: [
            {
                id: 'service-payroll-detail',
                name: 'Service Wise Payroll Detail',
                category: 'Payroll',
                createdBy: 'System Generated',
                description: 'Detailed payroll breakdown by service',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/service_payroll_detail',
            },
            {
                id: 'service-payroll-summary',
                name: 'Service Wise Payroll Summary',
                category: 'Payroll',
                createdBy: 'System Generated',
                description: 'Summary of payroll by service',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/service_payroll_summary',
            },
            {
                id: 'ratewise-payroll-detail',
                name: 'Rate Wise Payroll Detail',
                category: 'Payroll',
                createdBy: 'System Generated',
                description: 'Detailed payroll breakdown by rate',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/ratewise_payroll_detail',
            },
            {
                id: 'ratewise-payroll-summary',
                name: 'Rate Wise Payroll Summary',
                category: 'Payroll',
                createdBy: 'System Generated',
                description: 'Summary of payroll by rate',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/ratewise_payroll_summary',
            },
        ],
    },
    {
        id: 'expected-pr',
        name: 'Expected PR',
        icon: 'Target',
        reports: [
            {
                id: 'expected-actual-pr',
                name: 'Expected vs Actual PR Report',
                category: 'Expected PR',
                createdBy: 'System Generated',
                description: 'Compare expected vs actual payment received',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/expected_actual_pr',
            },
        ],
    },
];

// Get all reports flattened
export const getAllReports = (): Report[] => {
    return reportCategories.flatMap((category) => category.reports);
};

// Get reports by category
export const getReportsByCategory = (categoryId: string): Report[] => {
    const category = reportCategories.find((cat) => cat.id === categoryId);
    return category?.reports || [];
};

// Search reports
export const searchReports = (query: string): Report[] => {
    const lowercaseQuery = query.toLowerCase();
    return getAllReports().filter(
        (report) =>
            report.name.toLowerCase().includes(lowercaseQuery) ||
            report.category.toLowerCase().includes(lowercaseQuery) ||
            report.description?.toLowerCase().includes(lowercaseQuery)
    );
};

// Get report by ID
export const getReportById = (id: string): Report | undefined => {
    return getAllReports().find((report) => report.id === id);
};
