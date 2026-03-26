import { useState, useEffect, useMemo } from 'react';
import {
    X,
    Search,
    ChevronDown,
    Check,
    ArrowRight,
    ArrowLeft,
    Calendar,
    Shield,
    Info,
    Mail,
    Share2,
    Copy,
    Link
} from 'lucide-react';
import { advancedReportsAPI } from '../services/api';

interface CustomReportWizardProps {
    onClose: () => void;
    onSave: (config: any) => void;
}

const WIZARD_STYLES = `
    .cr-wizard-overlay {
        position: fixed !important;
        inset: 0 !important;
        background: rgba(15, 23, 42, 0.4) !important;
        backdrop-filter: blur(8px) !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        z-index: 9999 !important;
        padding: 2rem !important;
        animation: cr-fadeIn 0.3s ease-out !important;
        font-family: 'Inter', sans-serif !important;
    }

    .cr-wizard-modal {
        background: rgba(255, 255, 255, 0.98) !important;
        backdrop-filter: blur(16px) !important;
        border: 1px solid rgba(255, 255, 255, 0.5) !important;
        border-radius: 2rem !important;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.2) !important;
        display: flex !important;
        flex-direction: column !important;
        overflow: hidden !important;
        animation: cr-slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) !important;
    }

    .cr-header { padding: 2rem !important; display: flex !important; align-items: center !important; justify-content: space-between !important; border-bottom: 1px solid #f1f5f9 !important; background: rgba(255, 255, 255, 0.5) !important; backdrop-filter: blur(8px) !important; }
    .cr-body { flex: 1 !important; overflow-y: auto !important; padding: 2.5rem !important; background: rgba(248, 250, 252, 0.3) !important; }
    .cr-footer { padding: 2rem !important; display: flex !important; align-items: center !important; justify-content: space-between !important; border-top: 1px solid #f1f5f9 !important; background: rgba(248, 250, 252, 0.8) !important; }

    .cr-title { font-size: 1.5rem !important; font-weight: 900 !important; color: #0f172a !important; margin: 0 !important; line-height: 1.2 !important; }
    .cr-subtitle { font-size: 0.75rem !important; font-weight: 700 !important; color: #64748b !important; text-transform: uppercase !important; letter-spacing: 0.1em !important; margin-top: 0.25rem !important; }

    .cr-btn {
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        gap: 0.75rem !important;
        padding: 0.875rem 1.75rem !important;
        font-size: 0.875rem !important;
        font-weight: 800 !important;
        border-radius: 1.25rem !important;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
        cursor: pointer !important;
        border: none !important;
        line-height: 1 !important;
        white-space: nowrap !important;
    }

    .cr-btn-primary {
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
        color: white !important;
        box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3) !important;
    }

    .cr-btn-primary:hover:not(:disabled) {
        transform: translateY(-2px) !important;
        box-shadow: 0 12px 24px rgba(37, 99, 235, 0.4) !important;
        background: linear-gradient(135deg, #1d4ed8 0%, #1745be 100%) !important;
    }

    .cr-btn-secondary { background: #f1f5f9 !important; color: #475569 !important; }
    .cr-btn-ghost { background: transparent !important; color: #64748b !important; }
    .cr-btn-ghost:hover { background: #f1f5f9 !important; color: #0f172a !important; }

    .cr-input-group { position: relative !important; display: flex !important; flex-direction: column !important; gap: 0.5rem !important; width: 100% !important; }
    .cr-label { font-size: 0.75rem !important; font-weight: 800 !important; color: #94a3b8 !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; }
    
    .cr-input {
        width: 100% !important;
        height: 3.5rem !important;
        padding: 0 1.25rem !important;
        background: white !important;
        border: 2px solid #f1f5f9 !important;
        border-radius: 1.25rem !important;
        font-size: 0.9375rem !important;
        font-weight: 600 !important;
        color: #0f172a !important;
        transition: all 0.2s !important;
        box-sizing: border-box !important;
    }

    .cr-input:focus { outline: none !important; border-color: #2563eb !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1) !important; }
    
    select.cr-input { appearance: none !important; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8' stroke-width='3'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E") !important; background-repeat: no-repeat !important; background-position: right 1.25rem center !important; background-size: 1.25rem !important; padding-right: 3.5rem !important; }

    .cr-card {
        background: white !important;
        border: 1px solid #f1f5f9 !important;
        border-radius: 2rem !important;
        padding: 2rem !important;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05) !important;
        position: relative !important;
    }

    .cr-grid { display: grid !important; gap: 2rem !important; width: 100% !important; }
    .cr-grid-2 { grid-template-columns: repeat(2, 1fr) !important; }
    
    .cr-flex { display: flex !important; }
    .cr-flex-col { flex-direction: column !important; }
    .cr-items-center { align-items: center !important; }
    .cr-justify-between { justify-content: space-between !important; }
    .cr-gap-4 { gap: 1rem !important; }
    .cr-gap-6 { gap: 1.5rem !important; }

    .cr-step-indicator { display: flex !important; justify-content: space-between !important; align-items: center !important; position: relative !important; margin-bottom: 2.5rem !important; width: 100% !important; }
    .cr-step-indicator::before { content: '' !important; position: absolute !important; top: 1.25rem !important; left: 10% !important; right: 10% !important; height: 3px !important; background: #f1f5f9 !important; z-index: 1 !important; }
    
    .cr-step-item { position: relative !important; z-index: 2 !important; display: flex !important; flex-direction: column !important; align-items: center !important; gap: 0.75rem !important; flex: 1 !important; }
    .cr-step-circle { width: 2.5rem !important; height: 2.5rem !important; border-radius: 50% !important; background: white !important; border: 3px solid #f1f5f9 !important; display: flex !important; align-items: center !important; justify-content: center !important; font-size: 0.9375rem !important; font-weight: 900 !important; color: #94a3b8 !important; transition: all 0.3s !important; }
    
    .cr-step-item.active .cr-step-circle { border-color: #2563eb !important; color: #2563eb !important; transform: scale(1.1) !important; box-shadow: 0 10px 15px -3px rgba(37, 99, 235, 0.2) !important; }
    .cr-step-item.completed .cr-step-circle { background: #10b981 !important; border-color: #10b981 !important; color: white !important; }
    .cr-step-label { font-size: 0.75rem !important; font-weight: 800 !important; color: #94a3b8 !important; text-transform: uppercase !important; letter-spacing: 0.05em !important; }
    .cr-step-item.active .cr-step-label { color: #0f172a !important; }

    .cr-scrollbar::-webkit-scrollbar { width: 8px !important; height: 8px !important; }
    .cr-scrollbar::-webkit-scrollbar-track { background: transparent !important; }
    .cr-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0 !important; border-radius: 10px !important; border: 2px solid transparent !important; background-clip: padding-box !important; }
    .cr-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1 !important; background-clip: padding-box !important; }

    @keyframes cr-fadeIn { from { opacity: 0; } to { opacity: 1; } }
    @keyframes cr-slideUp { from { opacity: 0; transform: translateY(30px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }

    .cr-preview-table { width: 100% !important; border-collapse: separate !important; border-spacing: 0 !important; }
    .cr-preview-table th { background: #f8fafc !important; padding: 1.25rem 1rem !important; font-size: 0.6875rem !important; font-weight: 900 !important; text-transform: uppercase !important; color: #64748b !important; letter-spacing: 0.05em !important; border-bottom: 2px solid #f1f5f9 !important; text-align: left !important; }
    .cr-preview-table td { padding: 1rem !important; font-size: 0.8125rem !important; color: #334155 !important; border-bottom: 1px solid #f1f5f9 !important; font-weight: 600 !important; }
    .cr-preview-table tr:hover td { background: #f1f5f9 !important; color: #2563eb !important; }
`;

export default function CustomReportWizard({ onClose, onSave }: CustomReportWizardProps) {
    const [step, setStep] = useState(0); // 0 is selection, 1-4 are wizard steps
    const [categories, setCategories] = useState<any[]>([]);
    const [tables, setTables] = useState<any[]>([]);
    const [columns, setColumns] = useState<Record<string, string>>({});

    const [selectedTable, setSelectedTable] = useState<any | null>(null);

    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [previewData, setPreviewData] = useState<any[]>([]);
    const [previewLoading, setPreviewLoading] = useState(false);
    const [savedReportId, setSavedReportId] = useState<number | null>(null);
    const [isCopying, setIsCopying] = useState(false);
    // Form State
    const [config, setConfig] = useState(() => ({
        dateRange: 'Today',
        compareBasedOn: 'Period/Year',
        compareWith: 'None',
        selectedColumns: [] as string[],
        displayOptions: {
            organizationName: true,
            organizationLogo: false,
            reportBasis: true,
            pageNumber: false,
            generatedBy: false,
            generatedDate: false,
            generatedTime: false,
            logoWatermark: false,
        },
        layout: {
            tableDensity: 'Classic',
            autoResize: true,
            paperSize: 'A4',
            orientation: 'Portrait',
            fontFamily: 'Open Sans',
            margins: { top: 0.7, bottom: 0.7, left: 0.55, right: 0.2 }
        },
        preferences: {
            reportName: '',
            nameInExport: '',
            description: '',
            shareWith: 'Protected Link',
            sharedEmails: '',
            sharePassword: Math.random().toString(36).slice(-5) + Math.floor(Math.random() * 999).toString() // Generate secure default
        }
    }));

    // Hardcoded fallback data in case API fails
    const FALLBACK_CATEGORIES = [
        { id: "staff", name: "Staff", description: "Staff and provider related reports" },
        { id: "patients", name: "Patients", description: "Patient and client related reports" },
        { id: "appointments", name: "Appointments", description: "Scheduling and session reports" }
    ];

    const FALLBACK_TABLES = [
        { id: "employees", name: "Employees List", category_id: "staff", description: "Active and inactive employees" },
        { id: "clients", name: "Clients List", category_id: "patients", description: "Patient demographics" },
        { id: "appoinments", name: "Appointments List", category_id: "appointments", description: "Appointment schedules and status" }
    ];

    // Fetch Data on Mount (Categories and All Tables)
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                // Load Categories
                let cats = [];
                try {
                    cats = await advancedReportsAPI.getCategories();
                } catch (e) {
                    console.error("Failed to load categories", e);
                }
                if (!cats || cats.length === 0) cats = FALLBACK_CATEGORIES;
                setCategories(cats);

                // Load All Tables
                let tabs = [];
                try {
                    tabs = await advancedReportsAPI.getTables();
                } catch (e) {
                    console.error("Failed to load tables", e);
                }
                if (!tabs || tabs.length === 0) tabs = FALLBACK_TABLES;
                setTables(tabs);

            } catch (err) {
                console.error("Error loading initial data", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    // Filter tables based on search
    const filteredTables = useMemo(() => {
        if (!tables.length) return [];
        return tables
            .filter(t => t.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .sort((a, b) => a.name.localeCompare(b.name));
    }, [tables, searchQuery]);

    // Fetch Preview Data when entering Step 3
    useEffect(() => {
        if (step === 3 && selectedTable && config.selectedColumns.length > 0) {
            const fetchPreview = async () => {
                setPreviewLoading(true);
                try {
                    const res = await advancedReportsAPI.previewReport({
                        table_id: selectedTable.id,
                        columns: config.selectedColumns
                    });
                    setPreviewData(res.data?.slice(0, 10) || []); // Limit to 10 rows for preview
                } catch (err) {
                    console.error("Failed to load preview", err);
                } finally {
                    setPreviewLoading(false);
                }
            };
            fetchPreview();
        }
    }, [step, selectedTable, config.selectedColumns]);

    // On Table Click - Just Select, Don't Fetch/Navigate yet
    const handleTableSelect = (table: any) => {
        setSelectedTable(table);
    };

    // New handler for manual Continue
    const handleNextFromSelection = async () => {
        if (!selectedTable) return;
        setLoading(true);
        try {
            const cols = await advancedReportsAPI.getColumns(selectedTable.id);
            setColumns(cols);

            // Auto-select first few columns (excluding prov_ins_file)
            const colKeys = Object.keys(cols).filter(k => k !== 'prov_ins_file');
            setConfig(prev => ({
                ...prev,
                selectedColumns: colKeys.slice(0, 5),
                preferences: {
                    ...prev.preferences,
                    reportName: '',
                    nameInExport: selectedTable.name
                }
            }));

            setStep(1);
        } catch (err) {
            console.error("Failed to load columns", err);
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const renderSelection = () => {
        return (
            <div className="cr-wizard-overlay">
                <style>{WIZARD_STYLES}</style>
                <div className="cr-wizard-modal" style={{ maxWidth: '600px', width: '90%' }}>
                    <div className="cr-header">
                        <h2 className="cr-title">New Custom Report</h2>
                        <div
                            onClick={onClose}
                            style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#64748b' }}
                        >
                            <X size={18} />
                        </div>
                    </div>
                    <div className="cr-body cr-scrollbar" style={{ padding: '2rem' }}>
                        <div className="cr-card" style={{ background: '#eff6ff', border: '1px solid #dbeafe', marginBottom: '2rem', padding: '1.25rem' }}>
                            <div className="cr-flex cr-gap-4 cr-items-center">
                                <div className="cr-flex cr-items-center cr-justify-center" style={{ width: '2.5rem', height: '2.5rem', background: 'white', borderRadius: '0.75rem', color: '#2563eb', flexShrink: 0 }}>
                                    <Info size={20} />
                                </div>
                                <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0, fontWeight: '600' }}>
                                    Choose a data source to begin. We'll help you customize fields, layout, and privacy in the following steps.
                                </p>
                            </div>
                        </div>

                        <div className="cr-input-group">
                            <label className="cr-label">Reporting Data Source</label>
                            <div
                                className="cr-input cr-flex cr-items-center cr-justify-between"
                                style={{ height: 'auto', padding: '1rem 1.25rem', cursor: 'pointer', border: isDropdownOpen ? '2px solid #2563eb' : '2px solid #f1f5f9' }}
                                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            >
                                <div className="cr-flex cr-items-center cr-gap-4">
                                    <div className="cr-flex cr-items-center cr-justify-center" style={{ width: '2.5rem', height: '2.5rem', borderRadius: '0.75rem', background: selectedTable ? '#2563eb' : '#f1f5f9', color: selectedTable ? 'white' : '#94a3b8' }}>
                                        <Search size={18} />
                                    </div>
                                    <div className="cr-flex cr-flex-col">
                                        <span style={{ fontWeight: '800', color: selectedTable ? '#0f172a' : '#94a3b8' }}>
                                            {selectedTable ? selectedTable.name : 'Select a source...'}
                                        </span>
                                    </div>
                                </div>
                                <ChevronDown size={20} style={{ color: '#94a3b8', transform: isDropdownOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                            </div>

                            {isDropdownOpen && (
                                <div className="cr-card" style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, marginTop: '0.5rem', padding: '0.5rem', maxHeight: '300px', overflowY: 'auto' }}>
                                    <div style={{ padding: '0.5rem', borderBottom: '1px solid #f1f5f9', marginBottom: '0.5rem' }}>
                                        <input
                                            autoFocus
                                            className="cr-input"
                                            style={{ height: '2.5rem', fontSize: '0.875rem' }}
                                            placeholder="Search datasets..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                    </div>
                                    <div style={{ padding: '0 0.5rem', fontSize: '0.625rem', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>All Data Sources</div>
                                    {filteredTables.map((table: any) => (
                                        <div
                                            key={table.id}
                                            style={{ padding: '0.75rem', borderRadius: '0.75rem', cursor: 'pointer', background: selectedTable?.id === table.id ? '#2563eb' : 'transparent', color: selectedTable?.id === table.id ? 'white' : '#475569', fontWeight: '600', fontSize: '0.875rem', marginBottom: '0.25rem' }}
                                            onClick={(e) => { e.stopPropagation(); handleTableSelect(table); setIsDropdownOpen(false); }}
                                        >
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span>{table.name}</span>
                                                {table.description && <span style={{ fontSize: '0.7rem', color: selectedTable?.id === table.id ? 'rgba(255,255,255,0.8)' : '#94a3b8', marginTop: '0.125rem' }}>{table.description}</span>}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="cr-footer">
                        <button className="cr-btn cr-btn-ghost" style={{ flex: 1 }} onClick={onClose}>CANCEL</button>
                        <button
                            className="cr-btn cr-btn-primary"
                            style={{ flex: 2 }}
                            disabled={!selectedTable || loading}
                            onClick={handleNextFromSelection}
                        >
                            START CONFIGURING <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    const renderStep1 = () => (
        <div className="cr-flex cr-flex-col cr-gap-6" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div className="cr-card" style={{ background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.08) 0%, rgba(37, 99, 235, 0.03) 100%)', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', opacity: 0.05, pointerEvents: 'none' }}>
                    <Shield size={120} />
                </div>
                <div>
                    <div className="cr-flex cr-items-center cr-gap-4" style={{ marginBottom: '1rem' }}>
                        <div style={{ width: '3rem', height: '0.25rem', background: '#2563eb', borderRadius: '1rem' }} />
                        <span className="cr-subtitle" style={{ color: '#2563eb' }}>Source Configuration</span>
                    </div>
                    <h3 className="cr-title" style={{ fontSize: '2rem' }}>{selectedTable?.name}</h3>
                    <p style={{ color: '#64748b', fontWeight: '500', marginTop: '0.5rem', margin: 0 }}>
                        {selectedTable?.description || "You are customizing the data fields and layout for this dataset."}
                    </p>
                </div>
            </div>

            <div className="cr-grid cr-grid-2">
                <div className="cr-input-group">
                    <label className="cr-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Calendar size={14} /> Reporting Period
                    </label>
                    <select
                        className="cr-input"
                        value={config.dateRange}
                        onChange={e => setConfig({ ...config, dateRange: e.target.value })}
                    >
                        <option>Today</option>
                        <option>Yesterday</option>
                        <option>This Week</option>
                        <option>Last Week</option>
                        <option>This Month</option>
                        <option>Last Month</option>
                        <option>Custom Range</option>
                    </select>
                </div>
            </div>

            <div style={{ paddingTop: '2.5rem', borderTop: '2px solid #f1f5f9' }}>
                <div className="cr-flex cr-items-center cr-gap-4" style={{ marginBottom: '2rem' }}>
                    <div className="cr-flex cr-items-center cr-justify-center" style={{ width: '3.5rem', height: '3.5rem', background: '#e0e7ff', borderRadius: '1.25rem', color: '#4f46e5' }}>
                        <Info size={28} />
                    </div>
                    <div>
                        <h4 className="cr-title" style={{ fontSize: '1.125rem' }}>Historical Intelligence</h4>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Enable comparative analysis to identify performance trends.</p>
                    </div>
                </div>

                <div className="cr-grid cr-grid-2">
                    <div className="cr-input-group">
                        <label className="cr-label">Compare Based ON</label>
                        <select
                            className="cr-input"
                            value={config.compareBasedOn}
                            onChange={e => setConfig({ ...config, compareBasedOn: e.target.value })}
                        >
                            <option>Period/Year</option>
                            <option>Quarter</option>
                            <option>Month</option>
                        </select>
                    </div>
                    <div className="cr-input-group">
                        <label className="cr-label">Comparison Target</label>
                        <select
                            className="cr-input"
                            value={config.compareWith}
                            onChange={e => setConfig({ ...config, compareWith: e.target.value })}
                        >
                            <option>None</option>
                            <option>Previous Period</option>
                            <option>Previous Year</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => {
        const availableKeys = Object.keys(columns).filter(c => !config.selectedColumns.includes(c) && c !== 'prov_ins_file');

        return (
            <div className="cr-flex cr-gap-6" style={{ height: '520px' }}>
                {/* Available */}
                <div className="cr-flex cr-flex-col cr-card" style={{ flex: 1, padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                        <span className="cr-label" style={{ marginBottom: '1rem', display: 'block' }}>Available Dimensions</span>
                        <div style={{ position: 'relative' }}>
                            <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                            <input type="text" className="cr-input" style={{ paddingLeft: '3rem', height: '3rem' }} placeholder="Search fields..." />
                        </div>
                    </div>
                    <div className="cr-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                        <div className="cr-flex cr-flex-col cr-gap-4">
                            {availableKeys.map(key => (
                                <div
                                    key={key}
                                    className="cr-flex cr-items-center cr-justify-between"
                                    style={{ padding: '1rem', borderRadius: '1rem', border: '1px solid #f1f5f9', cursor: 'pointer', fontWeight: '600', fontSize: '0.875rem' }}
                                    onClick={() => setConfig({ ...config, selectedColumns: [...config.selectedColumns, key] })}
                                >
                                    <span>{columns[key]}</span>
                                    <div className="cr-flex cr-items-center cr-justify-center" style={{ color: '#2563eb' }}>
                                        <ArrowRight size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="cr-flex cr-flex-col cr-items-center cr-justify-center cr-gap-4" style={{ width: '80px' }}>
                    <div className="cr-flex cr-items-center cr-justify-center" style={{ width: '3.5rem', height: '3.5rem', borderRadius: '50%', background: '#2563eb', color: 'white', boxShadow: '0 10px 15px -3px rgba(37, 99, 235, 0.3)' }}>
                        <ArrowRight size={24} />
                    </div>
                </div>

                {/* Selected */}
                <div className="cr-flex cr-flex-col cr-card" style={{ flex: 1, padding: 0, overflow: 'hidden', border: '2px solid #e0e7ff', background: 'rgba(224, 231, 255, 0.05)' }}>
                    <div style={{ padding: '1.5rem', borderBottom: '1px solid #e0e7ff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white' }}>
                        <span className="cr-label" style={{ color: '#4f46e5' }}>Selected Fields</span>
                        <span style={{ background: '#4f46e5', color: 'white', fontSize: '0.75rem', fontWeight: '900', padding: '0.2rem 0.6rem', borderRadius: '1rem' }}>{config.selectedColumns.length}</span>
                    </div>
                    <div className="cr-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
                        <div className="cr-flex cr-flex-col cr-gap-4">
                            {config.selectedColumns.map(col => (
                                <div
                                    key={col}
                                    className="cr-flex cr-items-center cr-justify-between"
                                    style={{ padding: '1rem', borderRadius: '1rem', background: 'white', borderLeft: '4px solid #2563eb', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                                >
                                    <span style={{ fontWeight: '700', fontSize: '0.875rem' }}>{columns[col] || col}</span>
                                    <div
                                        style={{ width: '2rem', height: '2rem', borderRadius: '0.5rem', background: '#fef2f2', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        onClick={() => setConfig({ ...config, selectedColumns: config.selectedColumns.filter(c => c !== col) })}
                                    >
                                        <X size={16} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    const renderStep3 = () => (
        <div className="cr-flex cr-gap-10" style={{ height: '520px' }}>
            <div className="cr-scrollbar" style={{ flex: 1, overflowY: 'auto', paddingRight: '1.5rem' }}>
                <div className="cr-flex cr-flex-col cr-gap-10">
                    <div>
                        <div className="cr-flex cr-items-center cr-gap-4" style={{ marginBottom: '1.5rem' }}>
                            <div className="cr-flex cr-items-center cr-justify-center" style={{ width: '2.5rem', height: '2.5rem', background: '#dbeafe', borderRadius: '0.75rem', color: '#2563eb' }}>
                                <Shield size={20} />
                            </div>
                            <h4 className="cr-title" style={{ fontSize: '1rem' }}>Visibility Overlays</h4>
                        </div>
                        <div className="cr-grid cr-grid-2">
                            {Object.entries(config.displayOptions).map(([key, val]) => (
                                <div
                                    key={key}
                                    className="cr-flex cr-items-center cr-justify-between"
                                    style={{ padding: '1.25rem', borderRadius: '1.25rem', border: '2px solid', borderColor: val ? '#2563eb' : '#f1f5f9', background: val ? '#eff6ff' : 'white', cursor: 'pointer' }}
                                    onClick={() => setConfig({ ...config, displayOptions: { ...config.displayOptions, [key]: !val } })}
                                >
                                    <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: val ? '#1e40af' : '#64748b' }}>{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                                    <div className="cr-flex cr-items-center cr-justify-center" style={{ width: '1.5rem', height: '1.5rem', borderRadius: '0.5rem', background: val ? '#2563eb' : '#f8fafc', color: 'white' }}>
                                        {val && <Check size={14} strokeWidth={4} />}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div style={{ paddingTop: '2.5rem', borderTop: '2px solid #f1f5f9' }}>
                        <div className="cr-flex cr-items-center cr-gap-4" style={{ marginBottom: '1.5rem' }}>
                            <div className="cr-flex cr-items-center cr-justify-center" style={{ width: '2.5rem', height: '2.5rem', background: '#ffedd5', borderRadius: '0.75rem', color: '#f97316' }}>
                                <Calendar size={20} />
                            </div>
                            <h4 className="cr-title" style={{ fontSize: '1rem' }}>Page Optimization</h4>
                        </div>
                        <div className="cr-grid cr-grid-2">
                            <div className="cr-input-group">
                                <label className="cr-label">Grid Density</label>
                                <select className="cr-input" value={config.layout.tableDensity} onChange={e => setConfig({ ...config, layout: { ...config.layout, tableDensity: e.target.value } })}>
                                    <option>Classic</option>
                                    <option>Compact</option>
                                    <option>Comfortable</option>
                                </select>
                            </div>
                            <div className="cr-input-group">
                                <label className="cr-label">Sheet Format</label>
                                <div className="cr-flex" style={{ height: '3.5rem', background: '#f1f5f9', borderRadius: '1.25rem', padding: '0.375rem' }}>
                                    {['A4', 'Letter'].map(size => (
                                        <button
                                            key={size}
                                            className="cr-flex cr-items-center cr-justify-center"
                                            style={{ flex: 1, borderRadius: '1rem', fontSize: '0.875rem', fontWeight: '800', border: 'none', background: config.layout.paperSize === size ? 'white' : 'transparent', color: config.layout.paperSize === size ? '#2563eb' : '#94a3b8', boxShadow: config.layout.paperSize === size ? '0 4px 6px rgba(0,0,0,0.05)' : 'none', cursor: 'pointer', outline: 'none' }}
                                            onClick={() => setConfig({ ...config, layout: { ...config.layout, paperSize: size } })}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div style={{ width: '420px', background: '#f1f5f9', borderRadius: '2.5rem', padding: '2rem', display: 'flex', flexDirection: 'column' }}>
                <span className="cr-label" style={{ textAlign: 'center', display: 'block', marginBottom: '1.5rem' }}>Data Simulation</span>
                <div className="cr-flex cr-flex-col" style={{ flex: 1, background: 'white', borderRadius: '2rem', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
                    <div className="cr-scrollbar" style={{ flex: 1, overflow: 'auto' }}>
                        <table className="cr-preview-table">
                            <thead>
                                <tr>
                                    {config.selectedColumns.map(col => <th key={col}>{columns[col] || col}</th>)}
                                </tr>
                            </thead>
                            <tbody>
                                {previewData.map((row, i) => (
                                    <tr key={i}>
                                        {config.selectedColumns.map(col => (
                                            <td key={col}>{String(row[col] ?? '')}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div style={{ padding: '1rem', borderTop: '1px solid #f1f5f9', background: '#f8fafc', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '0.625rem', fontWeight: '900', color: '#10b981' }}>● LIVE PREVIEW</span>
                        <span style={{ fontSize: '0.625rem', fontWeight: '700', color: '#94a3b8' }}>SAMPLE DATA</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="cr-flex cr-flex-col cr-gap-12" style={{ maxWidth: '800px', margin: '0 auto', padding: '1rem 0' }}>
            <div className="cr-flex cr-flex-col cr-gap-8">
                <div className="cr-flex cr-items-center cr-gap-4">
                    <div className="cr-flex cr-items-center cr-justify-center" style={{ width: '3.5rem', height: '3.5rem', background: '#e0e7ff', borderRadius: '1.25rem', color: '#4f46e5' }}>
                        <Info size={28} />
                    </div>
                    <div>
                        <h4 className="cr-title">Identity & Branding</h4>
                        <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>How this report will be identified across the system.</p>
                    </div>
                </div>

                <div className="cr-grid cr-grid-2">
                    <div className="cr-input-group">
                        <label className="cr-label">Report Label*</label>
                        <input className="cr-input" placeholder="e.g. Sales Audit 2024" value={config.preferences.reportName} onChange={e => setConfig({ ...config, preferences: { ...config.preferences, reportName: e.target.value } })} />
                    </div>
                    <div className="cr-input-group">
                        <label className="cr-label">Export Filename</label>
                        <input className="cr-input" placeholder="Filename for PDFs" value={config.preferences.nameInExport} onChange={e => setConfig({ ...config, preferences: { ...config.preferences, nameInExport: e.target.value } })} />
                    </div>
                </div>

                <div className="cr-input-group">
                    <label className="cr-label">Documentation / Notes</label>
                    <textarea className="cr-input" style={{ height: '8rem', padding: '1rem', resize: 'none' }} placeholder="Notes for your team..." value={config.preferences.description} onChange={e => setConfig({ ...config, preferences: { ...config.preferences, description: e.target.value } })} />
                </div>
            </div>

            <div style={{ paddingTop: '3rem', borderTop: '2px solid #f1f5f9' }}>
                <div className="cr-flex cr-items-center cr-gap-4" style={{ marginBottom: '2rem' }}>
                    <div className="cr-flex cr-items-center cr-justify-center" style={{ width: '3.5rem', height: '3.5rem', background: '#ede9fe', borderRadius: '1.25rem', color: '#7c3aed' }}>
                        <Shield size={28} strokeWidth={2.5} />
                    </div>
                    <h4 className="cr-title">Privacy & Access</h4>
                </div>

                <div className="cr-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    {[
                        { id: 'Protected Link', desc: 'Secure Share', color: '#f59e0b' },
                        { id: 'Selected Users', desc: 'Restricted', color: '#8b5cf6' },
                        { id: 'Organization', desc: 'Public', color: '#10b981' }
                    ].map(opt => (
                        <div
                            key={opt.id}
                            onClick={() => {
                                setConfig({
                                    ...config,
                                    preferences: {
                                        ...config.preferences,
                                        shareWith: opt.id
                                    }
                                });
                            }}
                            className="cr-flex cr-flex-col cr-items-center cr-gap-6"
                            style={{ padding: '2.5rem 1.5rem', borderRadius: '2rem', border: '2px solid', borderColor: config.preferences.shareWith === opt.id ? '#2563eb' : '#f1f5f9', background: config.preferences.shareWith === opt.id ? '#eff6ff' : 'white', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                        >
                            <div className="cr-flex cr-items-center cr-justify-center" style={{ width: '4rem', height: '4rem', borderRadius: '1.5rem', background: config.preferences.shareWith === opt.id ? '#2563eb' : '#f8fafc', color: config.preferences.shareWith === opt.id ? 'white' : '#94a3b8', transform: config.preferences.shareWith === opt.id ? 'rotate(6deg)' : 'none', transition: 'all 0.3s' }}>
                                <Shield size={32} strokeWidth={2.5} />
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <span style={{ fontSize: '10px', fontWeight: '900', color: opt.color, textTransform: 'uppercase', display: 'block', marginBottom: '0.25rem' }}>{opt.desc}</span>
                                <span style={{ fontWeight: '800', color: '#0f172a' }}>{opt.id}</span>
                            </div>
                            {config.preferences.shareWith === opt.id && (
                                <div style={{ position: 'absolute', top: '1rem', right: '1rem', color: '#2563eb' }}>
                                    <div style={{ width: '2rem', height: '2rem', borderRadius: '50%', background: 'rgba(37, 99, 235, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Check size={16} strokeWidth={4} />
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {config.preferences.shareWith === 'Selected Users' && (
                <div style={{ marginTop: '2.5rem', animation: 'cr-slideUp 0.3s ease-out' }}>
                    <div className="cr-input-group">
                        <label className="cr-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Mail size={14} /> Authorized Recipient Emails
                        </label>
                        <textarea
                            className="cr-input"
                            style={{ height: '8rem', padding: '1.25rem', resize: 'none' }}
                            placeholder="Enter emails separated by commas (e.g. manager@clinic.com, admin@practice.org)"
                            value={config.preferences.sharedEmails}
                            onChange={e => setConfig({ ...config, preferences: { ...config.preferences, sharedEmails: e.target.value } })}
                        />
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.5rem', fontWeight: '500' }}>
                            Grant access to specific team members. They will be able to view the report via the shared intelligence link.
                        </p>
                    </div>
                </div>
            )}

            <div style={{ marginTop: '3rem', padding: '2rem', borderRadius: '2rem', background: '#f8fafc', border: '2px dashed #e2e8f0', display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                <div className="cr-flex cr-items-center cr-justify-center" style={{ width: '4rem', height: '4rem', background: 'white', borderRadius: '1.25rem', color: '#2563eb', flexShrink: 0, boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                    <Share2 size={24} />
                </div>
                <div style={{ flex: 1 }}>
                    <span className="cr-label" style={{ color: '#0f172a', marginBottom: '0.25rem', display: 'block' }}>Intelligence Access Link</span>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0, fontWeight: '500' }}>
                        {config.preferences.shareWith === 'Protected Link' ? 'Strictly protected link requiring the generated password.' :
                            config.preferences.shareWith === 'Selected Users' ? 'Only authorized recipients listed above can access this intelligence via the link.' :
                                'Anyone with this link and password across your organization can view this report.'}
                    </p>
                    <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <code style={{ background: 'white', padding: '0.5rem 1rem', borderRadius: '0.75rem', fontSize: '0.875rem', color: '#2563eb', fontWeight: '700', border: '1px solid #e2e8f0' }}>
                            {window.location.origin}/shared/[ID]
                        </code>
                        {config.preferences.sharePassword && (
                            <span style={{ fontSize: '0.875rem', color: '#10b981', fontWeight: '700', paddingLeft: '1rem' }}>
                                Requires Password 🔒
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderSuccess = () => (
        <div className="cr-flex cr-flex-col cr-items-center cr-justify-center" style={{ padding: '2rem 0', textAlign: 'center', animation: 'cr-fadeIn 0.5s ease-out' }}>
            <div style={{ position: 'relative', marginBottom: '2.5rem' }}>
                <div style={{ position: 'absolute', inset: -20, background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50%', filter: 'blur(20px)', animation: 'pulse 2s infinite' }} />
                <div className="cr-flex cr-items-center cr-justify-center" style={{ width: '6rem', height: '6rem', background: '#10b981', color: 'white', borderRadius: '50%', position: 'relative', boxShadow: '0 20px 25px -5px rgba(16, 185, 129, 0.4)' }}>
                    <Check size={48} strokeWidth={4} />
                </div>
            </div>

            <h2 className="cr-title" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Great Work!</h2>
            <p style={{ fontSize: '1.125rem', color: '#64748b', maxWidth: '500px', margin: '0 auto 3rem', fontWeight: '500' }}>
                Your custom intelligence report <strong>{config.preferences.reportName}</strong> has been deployed and is ready for analysis.
            </p>

            <div className="cr-card" style={{ width: '100%', maxWidth: '600px', border: '2px solid #10b981', background: '#f0fdf4', padding: '2.5rem' }}>
                <div className="cr-flex cr-items-center cr-gap-3" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
                    <Link size={20} style={{ color: '#10b981' }} />
                    <span className="cr-label" style={{ color: '#065f46', marginBottom: 0 }}>Intelligence Access Link</span>
                </div>

                <div className="cr-flex cr-flex-col cr-gap-3" style={{ background: 'white', padding: '1.25rem', borderRadius: '1.25rem', border: '1px solid #d1fae5', position: 'relative' }}>
                    <div className="cr-flex cr-items-center cr-gap-3" style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: '1rem' }}>
                        <code style={{ flex: 1, textAlign: 'left', fontSize: '1rem', color: '#065f46', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {window.location.origin}/shared/{savedReportId}
                        </code>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(`${window.location.origin}/shared/${savedReportId}`);
                                setIsCopying(true);
                                setTimeout(() => setIsCopying(false), 2000);
                            }}
                            className="cr-btn"
                            style={{ height: '2.5rem', padding: '0 1rem', background: isCopying ? '#10b981' : '#065f46', color: 'white', borderRadius: '0.75rem', border: 'none', transition: 'all 0.3s', fontSize: '0.75rem' }}
                        >
                            {isCopying ? <Check size={14} /> : <Copy size={14} />}
                            {isCopying ? 'COPIED' : 'COPY'}
                        </button>
                    </div>

                    {config.preferences.sharePassword && (
                        <div className="cr-flex cr-items-center cr-justify-between" style={{ paddingTop: '0.25rem' }}>
                            <div>
                                <span style={{ fontSize: '0.625rem', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'block', marginBottom: '0.25rem' }}>Access Password</span>
                                <code style={{ fontSize: '1.25rem', color: '#0f172a', fontWeight: '900', letterSpacing: '0.05em', background: '#f1f5f9', padding: '0.25rem 0.5rem', borderRadius: '0.5rem' }}>{config.preferences.sharePassword}</code>
                            </div>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: '500' }}>Share this securely with recipients.</span>
                        </div>
                    )}
                </div>

                <p style={{ marginTop: '1.5rem', fontSize: '0.8125rem', color: '#059669', fontWeight: '600' }}>
                    {config.preferences.shareWith === 'Protected Link'
                        ? 'This link requires the generated password to access.'
                        : config.preferences.shareWith === 'Organization'
                            ? 'This link can be accessed with the password by your organization.'
                            : 'This link is restricted but requires the password to authorize viewing.'}
                </p>
            </div>

            <button
                className="cr-btn cr-btn-primary"
                style={{ marginTop: '3rem', width: '240px', height: '4rem', fontSize: '1rem' }}
                onClick={onClose}
            >
                RETURN TO DASHBOARD
            </button>
        </div>
    );

    if (step === 99) return (
        <div className="cr-wizard-overlay">
            <style>{WIZARD_STYLES}</style>
            <div className="cr-wizard-modal" style={{ maxWidth: '800px', width: '90%', padding: '4rem 2rem' }}>
                {renderSuccess()}
            </div>
        </div>
    );

    if (step === 0) return renderSelection();

    return (
        <div className="cr-wizard-overlay">
            <style>{WIZARD_STYLES}</style>
            <div className="cr-wizard-modal" style={{ maxWidth: '1200px', width: '95%', height: '90vh' }}>
                <div className="cr-header">
                    <div className="cr-flex cr-flex-col">
                        <h2 className="cr-title">Customize Your Report</h2>
                        <div className="cr-subtitle">SOURCE: {selectedTable?.name}</div>
                    </div>
                    <div
                        onClick={onClose}
                        style={{ width: '2.5rem', height: '2.5rem', borderRadius: '50%', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#94a3b8' }}
                    >
                        <X size={24} />
                    </div>
                </div>

                <div className="cr-body cr-scrollbar">
                    <div className="cr-step-indicator">
                        {[
                            { id: 1, name: 'General' },
                            { id: 2, name: 'Columns' },
                            { id: 3, name: 'Layout' },
                            { id: 4, name: 'Finalize' },
                        ].map((s) => (
                            <div key={s.id} className={`cr-step-item ${step === s.id ? 'active' : ''} ${step > s.id ? 'completed' : ''}`}>
                                <div className="cr-step-circle">{step > s.id ? <Check size={18} strokeWidth={3} /> : s.id}</div>
                                <span className="cr-step-label">{s.name}</span>
                            </div>
                        ))}
                    </div>

                    <div style={{ marginTop: '2rem' }}>
                        {step === 1 && renderStep1()}
                        {step === 2 && renderStep2()}
                        {step === 3 && renderStep3()}
                        {step === 4 && renderStep4()}
                    </div>
                </div>

                <div className="cr-footer">
                    <button
                        className="cr-btn cr-btn-secondary"
                        style={{ visibility: step === 1 ? 'hidden' : 'visible' }}
                        onClick={prevStep}
                    >
                        <ArrowLeft size={18} /> BACK
                    </button>

                    <div className="cr-flex cr-gap-4">
                        <button className="cr-btn cr-btn-ghost" onClick={onClose}>DISCARD</button>
                        {step < 4 ? (
                            <button className="cr-btn cr-btn-primary" onClick={nextStep}>
                                CONTINUE <ArrowRight size={18} />
                            </button>
                        ) : (
                            <button
                                className="cr-btn cr-btn-primary"
                                style={{ background: '#10b981' }}
                                onClick={async () => {
                                    setLoading(true);
                                    try {
                                        const res = await advancedReportsAPI.saveReport({ ...config, selectedTable: selectedTable?.id });
                                        if (res.success && res.id) {
                                            setSavedReportId(res.id);
                                            setStep(99);
                                        } else {
                                            onSave({ ...config, selectedTable: selectedTable?.id });
                                        }
                                    } catch (err) {
                                        console.error("Failed to save report:", err);
                                        onSave({ ...config, selectedTable: selectedTable?.id });
                                    } finally {
                                        setLoading(false);
                                    }
                                }}
                            >
                                SAVE REPORT <Check size={18} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
