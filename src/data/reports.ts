export interface Report {
    id: string;
    name: string;
    category: string;
    createdBy: string;
    lastVisited?: string;
    description?: string;
    requiresDateFilter?: boolean;
    filterType?: 'year' | 'payroll-period' | 'adp-payroll';
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

export const reportCategories: ReportCategory[] = [
    // ─────────────────────────────────────────────
    // STAFF
    // ─────────────────────────────────────────────
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
                id: 'missing-credential-files',
                name: 'Staff Missing Credential Files',
                category: 'Staff',
                createdBy: 'System Generated',
                description: 'Staff members who are missing required credential file uploads',
                apiEndpoint: '/api/admin/staffs/missing_credential_files',
            },
            {
                id: 'missing-other-document-files',
                name: 'Staff Missing Document Files',
                category: 'Staff',
                createdBy: 'System Generated',
                description: 'Staff members who are missing required other document uploads',
                apiEndpoint: '/api/admin/staffs/missing_other_document_files',
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
            {
                id: 'bcba-billable-kpi',
                name: 'BCBA Billable KPI',
                category: 'Staff',
                createdBy: 'System Generated',
                description: 'Key performance indicators for BCBA billable hours and targets',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/staffs/bcba_billable_kpi',
            },
        ],
    },

    // ─────────────────────────────────────────────
    // PATIENTS
    // ─────────────────────────────────────────────
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
                id: 'patients-without-schedules',
                name: 'Patients Without Schedules',
                category: 'Patients',
                createdBy: 'System Generated',
                description: 'Active patients who have no upcoming sessions scheduled',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/patients/patients_without_schedules',
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

    // ─────────────────────────────────────────────
    // APPOINTMENTS
    // ─────────────────────────────────────────────
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
            {
                id: 'rendered-not-billed',
                name: 'Rendered but Not Billed',
                category: 'Appointments',
                createdBy: 'System Generated',
                description: 'Sessions that have been rendered but not yet billed',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/sessions/rendered_not_billed',
            },
        ],
    },

    // ─────────────────────────────────────────────
    // APPOINTMENT DETAILS
    // ─────────────────────────────────────────────
    {
        id: 'appointment-details',
        name: 'Appointment Details',
        icon: 'BarChart3',
        reports: [
            {
                id: 'appt-details-total',
                name: 'Total Appointment Details',
                category: 'Appointment Details',
                createdBy: 'System Generated',
                description: 'Comprehensive total appointment details across all types',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/appointment_details/total',
            },
            {
                id: 'appt-details-billable',
                name: 'Billable Appointment Details',
                category: 'Appointment Details',
                createdBy: 'System Generated',
                description: 'Detailed breakdown of billable appointments',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/appointment_details/billable',
            },
            {
                id: 'appt-details-nonbillable',
                name: 'Non-Billable Appointment Details',
                category: 'Appointment Details',
                createdBy: 'System Generated',
                description: 'Detailed breakdown of non-billable appointments',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/appointment_details/nonbillable',
            },
            {
                id: 'appt-details-employee-wise',
                name: 'Appointment Details by Employee',
                category: 'Appointment Details',
                createdBy: 'System Generated',
                description: 'Appointment details grouped and summarized by employee',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/appointment_details/employee_wise',
            },
            {
                id: 'appt-details-patient-wise',
                name: 'Appointment Details by Patient',
                category: 'Appointment Details',
                createdBy: 'System Generated',
                description: 'Appointment details grouped and summarized by patient',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/appointment_details/patient_wise',
            },
            {
                id: 'appt-details-overtime',
                name: 'Overtime Appointment Details',
                category: 'Appointment Details',
                createdBy: 'System Generated',
                description: 'Appointment and hours that qualify as overtime',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/appointment_details/overtime',
            },
            {
                id: 'appointment-count-by-month',
                name: 'Appointment Count by Month',
                category: 'Appointment Details',
                createdBy: 'System Generated',
                description: 'Monthly appointment volume and count analysis',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/appointment_count_by_month',
            },
        ],
    },

    // ─────────────────────────────────────────────
    // RECEIVABLES
    // ─────────────────────────────────────────────
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
            {
                id: 'ar-ledger-production-hourly',
                name: 'AR Ledger Production (Hourly)',
                category: 'Receivables',
                createdBy: 'System Generated',
                description: 'Hourly production breakdown from the AR ledger',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/ar_ledger_production_hourly',
            },
            {
                id: 'billing-production-hourly',
                name: 'Billing Production (Hourly)',
                category: 'Receivables',
                createdBy: 'System Generated',
                description: 'Hourly billing production analysis',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/billing_production_hourly',
            },
            {
                id: 'deposit-production-hourly',
                name: 'Deposit Production (Hourly)',
                category: 'Receivables',
                createdBy: 'System Generated',
                description: 'Hourly deposit production report',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/deposit_production_hourly',
            },
            {
                id: 'manage-secondary-claims',
                name: 'Manage Secondary Claims',
                category: 'Receivables',
                createdBy: 'System Generated',
                description: 'View and manage outstanding secondary insurance claims',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/manage_secondary_claims',
            },
            {
                id: 'sftp-push-pending-batches',
                name: 'SFTP Push Pending Batches',
                category: 'Receivables',
                createdBy: 'System Generated',
                description: 'Claim batches pending SFTP submission',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/sftp_push_pending_batches',
            },
            {
                id: 'concurrent-billing',
                name: 'Concurrent Billing',
                category: 'Receivables',
                createdBy: 'System Generated',
                description: 'Detect and review concurrent billing occurrences',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/concurrent_billing',
            },
            {
                id: 'cpt-icd-billed-vs-invoice',
                name: 'CPT / ICD Billed vs Invoice',
                category: 'Receivables',
                createdBy: 'System Generated',
                description: 'Compare CPT and ICD codes billed against invoice records',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/cpt_icd_billed_vs_invoice',
            },
        ],
    },

    // ─────────────────────────────────────────────
    // FINANCIAL & KPI
    // ─────────────────────────────────────────────
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
                id: 'last-week-deposits',
                name: 'Last Week Deposits',
                category: 'Financial & KPI',
                createdBy: 'System Generated',
                description: 'Summary of all payment deposits from last week',
                apiEndpoint: '/api/admin/reports/last_week_deposits',
            },
            {
                id: 'last-month-statements',
                name: 'Last Month Statements',
                category: 'Financial & KPI',
                createdBy: 'System Generated',
                description: 'Financial statements generated for last month',
                apiEndpoint: '/api/admin/reports/last_month_statements',
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
            {
                id: 'profit-loss-by-service',
                name: 'Profit & Loss by Service',
                category: 'Financial & KPI',
                createdBy: 'System Generated',
                description: 'Profit and loss analysis broken down by service type',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/profit_loss/by_service',
            },
            {
                id: 'profit-loss-by-provider',
                name: 'Profit & Loss by Provider',
                category: 'Financial & KPI',
                createdBy: 'System Generated',
                description: 'Profit and loss analysis broken down by provider',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/profit_loss/by_provider',
            },
            {
                id: 'client-service-summary',
                name: 'Client Service Summary',
                category: 'Financial & KPI',
                createdBy: 'System Generated',
                description: 'Summary of services rendered per client',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/client_service_summary',
            },
            {
                id: 'xero-report',
                name: 'Xero Report',
                category: 'Financial & KPI',
                createdBy: 'System Generated',
                description: 'Financial data export formatted for Xero accounting',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/xero_report',
            },
            {
                id: 'leave-tracking',
                name: 'Leave Tracking',
                category: 'Financial & KPI',
                createdBy: 'System Generated',
                description: 'Track employee leave usage and balances by year',
                filterType: 'year',
                apiEndpoint: '/api/admin/reports/leave_tracking',
            },
        ],
    },

    // ─────────────────────────────────────────────
    // SUPERVISION
    // ─────────────────────────────────────────────
    {
        id: 'supervision',
        name: 'Supervision',
        icon: 'Target',
        reports: [
            {
                id: 'supervision-rbt-wise',
                name: 'Supervision by RBT',
                category: 'Supervision',
                createdBy: 'System Generated',
                description: 'Supervision hours and compliance tracked per RBT',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/supervision_rbt_wise',
            },
            {
                id: 'supervision-patient-wise',
                name: 'Supervision by Patient',
                category: 'Supervision',
                createdBy: 'System Generated',
                description: 'Supervision hours tracked per patient',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/supervision_patient_wise',
            },
            {
                id: 'supervision-per-staff',
                name: 'Supervision per Staff',
                category: 'Supervision',
                createdBy: 'System Generated',
                description: 'Total supervision hours and ratios per staff member',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/supervision_per_staff',
            },
        ],
    },

    // ─────────────────────────────────────────────
    // ABA HOURS
    // ─────────────────────────────────────────────
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

    // ─────────────────────────────────────────────
    // BILLING & LEDGER
    // ─────────────────────────────────────────────
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

    // ─────────────────────────────────────────────
    // PAYROLL
    // ─────────────────────────────────────────────
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
            {
                id: 'gusto-payroll',
                name: 'Gusto Payroll',
                category: 'Payroll',
                createdBy: 'System Generated',
                description: 'Payroll data for Gusto — select pay period and providers',
                filterType: 'payroll-period',
                apiEndpoint: '/api/admin/reports/gusto_payroll',
            },
            {
                id: 'adp-payroll',
                name: 'ADP Payroll',
                category: 'Payroll',
                createdBy: 'System Generated',
                description: 'Payroll data for ADP — select till date and providers',
                filterType: 'adp-payroll',
                apiEndpoint: '/api/admin/reports/adp_payroll',
            },
            {
                id: 'bamboohr-payroll',
                name: 'BambooHR Payroll',
                category: 'Payroll',
                createdBy: 'System Generated',
                description: 'Payroll data for BambooHR — select pay period and provider',
                filterType: 'payroll-period',
                apiEndpoint: '/api/admin/reports/bamboohr_payroll',
            },
            {
                id: 'fingercheck-payroll',
                name: 'Fingercheck Payroll',
                category: 'Payroll',
                createdBy: 'System Generated',
                description: 'Payroll data formatted for Fingercheck integration',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/fingercheck_payroll',
            },
            {
                id: 'paychex-payroll',
                name: 'Paychex Payroll',
                category: 'Payroll',
                createdBy: 'System Generated',
                description: 'Payroll data formatted for Paychex integration',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/paychex_payroll',
            },
            {
                id: 'paycom-report',
                name: 'Paycom Report',
                category: 'Payroll',
                createdBy: 'System Generated',
                description: 'Payroll and HR data formatted for Paycom integration',
                requiresDateFilter: true,
                apiEndpoint: '/api/admin/reports/paycom_report',
            },
        ],
    },

    // ─────────────────────────────────────────────
    // EXPECTED PR
    // ─────────────────────────────────────────────
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

// ─────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────

export const getAllReports = (): Report[] =>
    reportCategories.flatMap((category) => category.reports);

export const getReportsByCategory = (categoryId: string): Report[] => {
    const category = reportCategories.find((cat) => cat.id === categoryId);
    return category?.reports || [];
};

export const searchReports = (query: string): Report[] => {
    const q = query.toLowerCase();
    return getAllReports().filter(
        (report) =>
            report.name.toLowerCase().includes(q) ||
            report.category.toLowerCase().includes(q) ||
            report.description?.toLowerCase().includes(q)
    );
};

export const getReportById = (id: string): Report | undefined =>
    getAllReports().find((report) => report.id === id);
