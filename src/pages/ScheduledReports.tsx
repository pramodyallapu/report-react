import React, { useState, useEffect } from 'react';
import MainLayout from '../components/MainLayout';
import './ScheduledReports.css';
import {
    Clock,
    Play,
    Pause,
    Trash2,
    Search,
    FileText,
    RefreshCw,
    Plus,
    X,
    Settings2,
    MonitorPlay,
    AlertCircle,
    Zap
} from 'lucide-react';
import * as api from '../services/api';
import { reportCategories } from '../data/reports';

interface ScheduledReport {
    id: number;
    report_id: number;
    name: string;
    frequency: 'Daily' | 'Weekly' | 'Monthly';
    schedule_time: string;
    day_of_week?: string;
    day_of_month?: number;
    recipients: string[];
    format: 'PDF' | 'Excel' | 'CSV';
    status: 'Active' | 'Paused' | 'Failed';
    last_run?: string;
    next_run?: string;
}

export default function ScheduledReports() {
    const [reports, setReports] = useState<ScheduledReport[]>([]);
    const [savedReports, setSavedReports] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [runningId, setRunningId] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        report_id: '',
        name: '',
        frequency: 'Daily',
        schedule_time: '09:00',
        day_of_week: 'Monday',
        day_of_month: 1,
        recipients: '',
        format: 'PDF'
    });

    useEffect(() => { fetchData(); }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [schedules, saved] = await Promise.all([
                api.scheduledReportsAPI.list(),
                api.advancedReportsAPI.getSavedReports()
            ]);
            setReports(schedules);
            setSavedReports(saved);
        } catch (err) { console.error(err); }
        finally { setLoading(false); }
    };

    const handleLogout = async () => {
        try {
            await api.authAPI.logout();
            window.location.href = '/login';
        } catch (err) { console.error(err); }
    };

    const handleToggle = async (id: number, currentStatus: string) => {
        const newStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
        try {
            await api.scheduledReportsAPI.toggle(id, newStatus);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Are you sure you want to delete this schedule?')) return;
        try {
            await api.scheduledReportsAPI.delete(id);
            fetchData();
        } catch (err) { console.error(err); }
    };

    const handleRunNow = async (id: number) => {
        setRunningId(id);
        try {
            const res = await api.scheduledReportsAPI.runNow(id);
            alert(res.message || 'Execution triggered! Check your inbox.');
        } catch (err) {
            console.error(err);
            alert('Failed to trigger execution. Check server logs.');
        } finally {
            setRunningId(null);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const isSystem = formData.report_id.startsWith('system-');
            const cleanId = formData.report_id.replace('custom-', '').replace('system-', '');

            const payload = {
                ...formData,
                report_id: cleanId || null,
                source: isSystem ? 'system' : 'custom',
                recipients: formData.recipients.split(',').map(e => e.trim()).filter(e => e),
                day_of_month: parseInt(formData.day_of_month.toString())
            };
            await api.scheduledReportsAPI.save(payload);
            setShowModal(false);
            fetchData();
            setFormData({
                report_id: '', name: '', frequency: 'Daily', schedule_time: '09:00',
                day_of_week: 'Monday', day_of_month: 1, recipients: '', format: 'PDF'
            });
        } catch (err) { console.error(err); }
    };

    const filteredReports = reports.filter(r => {
        const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All' || r.status === filterStatus;
        return matchesSearch && matchesStatus;
    });

    return (
        <MainLayout onLogout={handleLogout}>
            <div className="bg-aura">
                <div className="aura-1"></div>
                <div className="aura-2"></div>
            </div>

            <div className="scheduled-container">
                {/* Hero Card */}
                <div className="hero-card">
                    <div className="hero-card-gradient"></div>
                    <div className="hero-content">
                        <div className="hero-text">
                            <div className="hero-badge">
                                <Zap size={14} />
                                Smart Flows Engine
                            </div>
                            <h1>Automate your <br /><span className="text-gradient">Data Intelligence</span></h1>
                            <p className="hero-subtitle">
                                Configure autonomous pipelines that handle data extraction, transformation,
                                and secure delivery across your entire provider network.
                            </p>
                        </div>
                        <div className="hero-actions">
                            <button onClick={() => setShowModal(true)} className="btn-premium px-10 h-16 rounded-2xl text-sm font-black flex items-center gap-3">
                                <Plus size={24} />
                                Deploy Pipeline
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-icon-box bg-indigo-50 text-indigo-600"><Settings2 size={24} /></div>
                            <span className="stat-label">Pipelines</span>
                        </div>
                        <div className="stat-value">{reports.length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-icon-box bg-emerald-50 text-emerald-600"><MonitorPlay size={24} /></div>
                            <span className="stat-label">Active</span>
                        </div>
                        <div className="stat-value">{reports.filter(r => r.status === 'Active').length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-icon-box bg-amber-50 text-amber-600"><Pause size={24} /></div>
                            <span className="stat-label">Standby</span>
                        </div>
                        <div className="stat-value">{reports.filter(r => r.status === 'Paused').length}</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-icon-box bg-rose-50 text-rose-600"><AlertCircle size={24} /></div>
                            <span className="stat-label">Errors</span>
                        </div>
                        <div className="stat-value">{reports.filter(r => r.status === 'Failed').length}</div>
                    </div>
                </div>

                {/* Table Section */}
                <div className="table-container">
                    <div className="table-header-row">
                        <div className="search-box">
                            <Search size={20} />
                            <input
                                type="text"
                                placeholder="Search pipelines..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="filter-group flex gap-2">
                            {['All', 'Active', 'Paused'].map(s => (
                                <button
                                    key={s}
                                    onClick={() => setFilterStatus(s)}
                                    className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${filterStatus === s ? 'filter-active' : 'filter-inactive'}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Intelligence Instance</th>
                                <th>Cadence</th>
                                <th>Time</th>
                                <th>Status</th>
                                <th style={{ textAlign: 'right' }}>Management</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '10rem' }}>
                                        <RefreshCw size={48} className="animate-spin text-indigo-500" />
                                    </td>
                                </tr>
                            ) : filteredReports.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '10rem' }}>
                                        <div className="text-slate-300 font-bold">No automation pipelines found.</div>
                                    </td>
                                </tr>
                            ) : filteredReports.map(report => (
                                <tr key={report.id}>
                                    <td>
                                        <div className="pipeline-info">
                                            <div className={`pipeline-icon ${report.format === 'PDF' ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                                <FileText size={24} />
                                            </div>
                                            <div>
                                                <div className="pipeline-name">{report.name}</div>
                                                <div className="pipeline-meta">{report.format} • ID_{report.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="hero-badge" style={{ background: '#f8fafc', color: '#0f172a' }}>
                                            {report.frequency}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex items-center gap-2 font-bold text-slate-600">
                                            <Clock size={16} /> {report.schedule_time}
                                        </div>
                                    </td>
                                    <td>
                                        <div className={`status-badge ${report.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                            {report.status}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex justify-end gap-2">
                                            <button
                                                onClick={() => handleRunNow(report.id)}
                                                disabled={runningId === report.id}
                                                className={`p-3 rounded-xl transition-all border-none cursor-pointer ${runningId === report.id ? 'bg-indigo-100 text-indigo-400' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                                title="Run Now"
                                            >
                                                {runningId === report.id ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />}
                                            </button>
                                            <button onClick={() => handleToggle(report.id, report.status)} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-all border-none cursor-pointer" title={report.status === 'Active' ? 'Pause' : 'Activate'}>
                                                {report.status === 'Active' ? <Pause size={18} /> : <Zap size={18} />}
                                            </button>
                                            <button onClick={() => handleDelete(report.id)} className="p-3 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-all border-none cursor-pointer" title="Delete">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="modal-backdrop">
                    <div className="modern-modal">
                        <div className="modal-header">
                            <div className="modal-title">
                                <h2>Deploy Pipeline</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:text-slate-900 transition-all border-none cursor-pointer">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSave}>
                            <div className="modal-body">
                                <div className="form-grid">
                                    <div className="form-group full">
                                        <label className="form-label">Flow Name</label>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="e.g., Performance Metrics"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Frequency</label>
                                        <select
                                            className="form-select"
                                            value={formData.frequency}
                                            onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                                        >
                                            <option value="Daily">Daily</option>
                                            <option value="Weekly">Weekly</option>
                                            <option value="Monthly">Monthly</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Time (UTC)</label>
                                        <input
                                            type="time"
                                            className="form-input"
                                            value={formData.schedule_time}
                                            onChange={(e) => setFormData({ ...formData, schedule_time: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group full">
                                        <label className="form-label">Recipients (Comma separated)</label>
                                        <textarea
                                            className="form-textarea"
                                            placeholder="admin@example.com, ceo@example.com"
                                            rows={3}
                                            value={formData.recipients}
                                            onChange={(e) => setFormData({ ...formData, recipients: e.target.value })}
                                            required
                                        ></textarea>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Format</label>
                                        <select
                                            className="form-select"
                                            value={formData.format}
                                            onChange={(e) => setFormData({ ...formData, format: e.target.value as any })}
                                        >
                                            <option value="PDF">PDF Document</option>
                                            <option value="Excel">Excel Sheet</option>
                                            <option value="CSV">CSV Data</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Intel Source (Report Type)</label>
                                        <select
                                            className="form-select"
                                            value={formData.report_id}
                                            onChange={(e) => setFormData({ ...formData, report_id: e.target.value })}
                                        >
                                            <option value="">None (Custom Flow)</option>

                                            {savedReports.length > 0 && (
                                                <optgroup label="Shared Custom Designs">
                                                    {savedReports.map(r => (
                                                        <option key={`custom-${r.id}`} value={`custom-${r.id}`}>{r.name}</option>
                                                    ))}
                                                </optgroup>
                                            )}

                                            <optgroup label="System Intelligence">
                                                {reportCategories.map(cat => (
                                                    cat.reports.map(r => (
                                                        <option key={`system-${r.id}`} value={`system-${r.id}`}>{r.name}</option>
                                                    ))
                                                ))}
                                            </optgroup>
                                        </select>
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                                    <button type="submit" className="btn-primary-action">
                                        <Zap size={20} /> Launch Pipeline
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </MainLayout>
    );
}
