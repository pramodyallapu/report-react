import axios from 'axios';

// Base API URL - Update this to match your FastAPI server
const API_BASE_URL = 'http://localhost:8000';

// Create axios instance with default config
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Important for cookie-based authentication
});

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
    (config) => {
        // Token is handled via cookies, but you can add custom headers here if needed
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling errors
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        // Do not redirect here, handle 401 in the application state
        return Promise.reject(error);
    }
);

// Authentication APIs
export const authAPI = {
    login: async (email: string, password: string) => {
        const formData = new URLSearchParams();
        formData.append('email', email);
        formData.append('password', password);
        const response = await apiClient.post('/login', formData, {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        });
        return response.data;
    },
    logout: async () => {
        const response = await apiClient.post('/logout');
        return response.data;
    },
};

// Billing Ledger Aging APIs
export const billingLedgerAPI = {
    getAgingData: async (params: {
        type: number;
        date_type?: string;
        payor_id?: string;
        client_id?: string;
        claim_no?: string;
    }) => {
        const response = await apiClient.get('/api/billing-ledger-aging', { params });
        return response.data;
    },

    getBreakdown: async (params: {
        payor_id?: string;
        client_id?: string;
        claim_no?: string;
        dos?: string;
        bucket_index: number;
    }) => {
        const response = await apiClient.get('/api/billing-ledger-aging/breakdown', { params });
        return response.data;
    },

    downloadClaim: async (claimId: string) => {
        const response = await apiClient.post('/api/billing-ledger-aging/download-claim', {
            claim_id: claimId,
        });
        return response.data;
    },

    getClientComments: async (clientName: string, claimNo?: string) => {
        const response = await apiClient.post('/api/client-comments', {
            client_name: clientName,
            claim_no: claimNo,
            action: 'fetch',
        });
        return response.data;
    },
};

// Staff Reports APIs
export const staffReportsAPI = {
    getActiveStaff: async (filters?: any) => {
        const response = await apiClient.post('/api/admin/staffs/active_staff', filters);
        return response.data;
    },

    getMissingCredentials: async (filters?: any) => {
        const response = await apiClient.post('/api/admin/staffs/missing_credentials', filters);
        return response.data;
    },

    getExpiringCredentials: async (filters?: any) => {
        const response = await apiClient.post('/api/admin/staffs/expiring_credentials', filters);
        return response.data;
    },

    getTimeOffManagement: async (filters?: any) => {
        const response = await apiClient.post('/api/admin/staffs/time_of_mgmt', filters);
        return response.data;
    },

    getProviderMissingSign: async (filters?: any) => {
        const response = await apiClient.post('/api/admin/staffs/provider_missing_sign', filters);
        return response.data;
    },
};

// Patient Reports APIs
export const patientReportsAPI = {
    getExpiredAuth: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/patients/expired_auth', filters);
        return response.data;
    },

    getExpiringAuth: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/patients/expiring_auth', filters);
        return response.data;
    },

    getWithoutAuth: async (filters?: any) => {
        const response = await apiClient.post('/api/admin/patients/without_auth', filters);
        return response.data;
    },

    getExpiringDoc: async (filters?: any) => {
        const response = await apiClient.post('/api/admin/patients/expiring_doc', filters);
        return response.data;
    },

    getAuthPlaceholder: async (filters?: any) => {
        const response = await apiClient.post('/api/admin/patients/auth_placeholder', filters);
        return response.data;
    },

    getNonPayorTag: async (filters?: any) => {
        const response = await apiClient.post('/api/admin/patients/non_payor_tag', filters);
        return response.data;
    },

    getArrivedInfo: async (filters?: any) => {
        const response = await apiClient.post('/api/admin/patients/arrived_info', filters);
        return response.data;
    },
};

// Appointment Reports APIs
export const appointmentReportsAPI = {
    getScheduledNotRendered: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/appointments/scheduled_not_rendered', filters);
        return response.data;
    },

    getScheduledNotAttended: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/appointments/scheduled_not_attended', filters);
        return response.data;
    },

    getSessionMissingSignature: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/appointments/session_missing_signature', filters);
        return response.data;
    },

    getSessionNoteMissing: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/appointments/session_note_missing', filters);
        return response.data;
    },

    getSessionUnlockedNotes: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/appointments/session_unlocked_notes', filters);
        return response.data;
    },
};

// Financial/KPI Reports APIs
export const financialReportsAPI = {
    getScheduleBillable: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/schedule_billable', filters);
        return response.data;
    },

    getPaymentDeposits: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/payment_deposits', filters);
        return response.data;
    },

    getKPIByMonth: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/kpi_by_month', filters);
        return response.data;
    },

    getKPIByPatient: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/kpi_by_patient', filters);
        return response.data;
    },

    getKPIByInsurance: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/kpi_by_insurance', filters);
        return response.data;
    },
};

// ABA Hour Reports APIs
export const abaReportsAPI = {
    getABAHourClient: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/aba_hour_client', filters);
        return response.data;
    },

    getABAHourProvider: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/aba_hour_provider', filters);
        return response.data;
    },
};

// Ledger/Billing Reports APIs
export const ledgerReportsAPI = {
    getARLedgerWithBalance: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/ar_ledger_with_balance', filters);
        return response.data;
    },

    getAppointmentLedger: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/appointment_ledger', filters);
        return response.data;
    },

    getAppointmentBilled: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/appointment_billed', filters);
        return response.data;
    },

    getMaxTotalAuthTotal: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/max_total_auth_total', filters);
        return response.data;
    },
};

// Payroll Reports APIs
export const payrollReportsAPI = {
    getServicePayrollDetail: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/service_payroll_detail', filters);
        return response.data;
    },

    getServicePayrollSummary: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/service_payroll_summary', filters);
        return response.data;
    },

    getRatewisePayrollDetail: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/ratewise_payroll_detail', filters);
        return response.data;
    },

    getRatewisePayrollSummary: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/ratewise_payroll_summary', filters);
        return response.data;
    },
};

// Expected PR Reports APIs
export const expectedPRReportsAPI = {
    getExpectedActualPR: async (filters: { start_date: string; end_date: string }) => {
        const response = await apiClient.post('/api/admin/reports/expected_actual_pr', filters);
        return response.data;
    },
};

export default apiClient;

// Advanced Custom Reporting API
export const advancedReportsAPI = {
    getCategories: async () => {
        const response = await apiClient.get('/api/advanced-reports/categories');
        return response.data;
    },

    getTables: async (categoryId?: string) => {
        const response = await apiClient.get('/api/advanced-reports/tables', {
            params: { category_id: categoryId }
        });
        return response.data;
    },

    getColumns: async (tableId: string) => {
        const response = await apiClient.get(`/api/advanced-reports/columns/${tableId}`);
        return response.data;
    },

    previewReport: async (config: { table_id: string; columns: string[] }) => {
        const response = await apiClient.post('/api/advanced-reports/preview', config);
        return response.data;
    },

    saveReport: async (config: any) => {
        const response = await apiClient.post('/api/advanced-reports/save', config);
        return response.data;
    },

    getSavedReports: async () => {
        const response = await apiClient.get('/api/advanced-reports/saved');
        return response.data;
    },

    exportReport: async (config: any) => {
        const response = await apiClient.post('/api/advanced-reports/export', config, {
            responseType: 'blob'
        });

        // Handle physical file download in browser
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        // Try to get filename from headers
        let filename = 'custom_report.pdf';
        const disposition = response.headers['content-disposition'];
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        // Clean up
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);

        return true;
    }
};

export const sharedReportsAPI = {
    previewReport: async (reportId: string, password?: string) => {
        const response = await apiClient.post(`/api/shared-reports/${reportId}/preview`, { password });
        return response.data;
    },
    exportReport: async (reportId: string, password?: string) => {
        const response = await apiClient.post(`/api/shared-reports/${reportId}/export`, { password }, {
            responseType: 'blob'
        });

        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;

        let filename = 'shared_report.pdf';
        const disposition = response.headers['content-disposition'];
        if (disposition && disposition.indexOf('attachment') !== -1) {
            const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = filenameRegex.exec(disposition);
            if (matches != null && matches[1]) {
                filename = matches[1].replace(/['"]/g, '');
            }
        }

        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();

        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);

        return true;
    }
}

// Scheduled Reports APIs
export const scheduledReportsAPI = {
    list: async () => {
        const response = await apiClient.get('/api/scheduled-reports/list');
        return response.data;
    },
    save: async (config: any) => {
        const response = await apiClient.post('/api/scheduled-reports/save', config);
        return response.data;
    },
    toggle: async (id: number, status: string) => {
        const response = await apiClient.post(`/api/scheduled-reports/${id}/toggle`, null, {
            params: { status }
        });
        return response.data;
    },
    delete: async (id: number) => {
        const response = await apiClient.delete(`/api/scheduled-reports/${id}`);
        return response.data;
    },
    runNow: async (id: number) => {
        const response = await apiClient.post(`/api/scheduled-reports/${id}/run-now`);
        return response.data;
    }
};

export const notificationsAPI = {
    fetch: async (limit: number = 20) => {
        const response = await apiClient.get('/api/notifications', { params: { limit } });
        return response.data;
    },
    markRead: async (id?: number) => {
        const response = await apiClient.post('/api/notifications/read', null, { params: { notification_id: id } });
        return response.data;
    }
};

export const chatbotAPI = {
    ask: async (message: string) => {
        const response = await apiClient.post('/api/chatbot/ask', { message });
        return response.data;
    }
};

