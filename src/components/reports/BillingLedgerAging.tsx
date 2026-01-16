import React, { useState, useEffect } from 'react';
import {
    Plus,
    Minus,
    Download,
    MessageSquare,
    FileText,
    Loader2
} from 'lucide-react';
import * as api from '../../services/api';



type LevelData = {
    id: string;
    name: string;
    values: string[];
    totalInsurance: string;
    totalPatient: string;
    isExpanded?: boolean;
    children?: LevelData[];
    loading?: boolean;
};

export default function BillingLedgerAging() {
    const [data, setData] = useState<LevelData[]>([]);
    const [total, setTotal] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dateType, setDateType] = useState('dos');
    const [breakdownModal, setBreakdownModal] = useState<{
        show: boolean;
        data: any;
        title: string;
    }>({ show: false, data: null, title: '' });

    const buckets = [
        '0-30', '31-60', '61-90', '91-120', '121-180', '181-365', '365+'
    ];

    const fetchInitialData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.billingLedgerAPI.getAgingData({ type: 1, date_type: dateType });

            const formattedData: LevelData[] = response.res.map((row: any[]) => ({
                id: row[0],
                name: row[1],
                values: row.slice(2, 16),
                totalInsurance: row[16],
                totalPatient: row[17],
                isExpanded: false,
                children: []
            }));

            setData(formattedData);
            setTotal(response.total);
        } catch (err: any) {
            setError(err.message || 'Failed to load aging data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [dateType]);

    const toggleLevel = async (item: LevelData, level: number, parentIds: string[] = []) => {
        const newData = [...data];

        // Recursive function to find and update the item in the state tree
        const updateItem = async (list: LevelData[], targetId: string, currentLevel: number): Promise<boolean> => {
            for (let i = 0; i < list.length; i++) {
                if (list[i].id === targetId && currentLevel === level) {
                    if (!list[i].isExpanded && list[i].children?.length === 0) {
                        list[i].loading = true;
                        setData([...newData]); // Update UI to show loading

                        try {
                            let response;
                            if (level === 1) { // Payor -> Client
                                response = await api.billingLedgerAPI.getAgingData({
                                    type: 2,
                                    date_type: dateType,
                                    payor_id: targetId
                                });
                            } else if (level === 2) { // Client -> Claim
                                response = await api.billingLedgerAPI.getAgingData({
                                    type: 3,
                                    date_type: dateType,
                                    payor_id: parentIds[0],
                                    client_id: targetId
                                });
                            } else if (level === 3) { // Claim -> DOS
                                response = await api.billingLedgerAPI.getAgingData({
                                    type: 4,
                                    date_type: dateType,
                                    payor_id: parentIds[0],
                                    client_id: parentIds[1],
                                    claim_no: targetId
                                });
                            }

                            if (response && response.res) {
                                list[i].children = response.res.map((row: any[]) => ({
                                    id: row[0],
                                    name: row[1],
                                    values: level === 3 ? row.slice(3, 17) : row.slice(2, 16),
                                    totalInsurance: level === 3 ? row[17] : row[16],
                                    totalPatient: level === 3 ? row[18] : row[17],
                                    isExpanded: false,
                                    children: []
                                }));
                            }
                        } catch (err) {
                            console.error('Failed to load children', err);
                        } finally {
                            list[i].loading = false;
                        }
                    }
                    list[i].isExpanded = !list[i].isExpanded;
                    return true;
                }

                if (list[i].children && list[i].children!.length > 0) {
                    const found = await updateItem(list[i].children!, targetId, currentLevel);
                    if (found) return true;
                }
            }
            return false;
        };

        await updateItem(newData, item.id, level);
        setData(newData);
    };

    const handleInsuranceClick = async (payorId: string, clientId?: string, claimNo?: string, dos?: string, bucketIndex?: number) => {
        if (bucketIndex === undefined) return;

        try {
            const response = await api.billingLedgerAPI.getBreakdown({
                payor_id: payorId,
                client_id: clientId,
                claim_no: claimNo,
                dos: dos,
                bucket_index: bucketIndex
            });

            setBreakdownModal({
                show: true,
                data: response,
                title: `Insurance Breakdown - ${buckets[bucketIndex - 1]} Days`
            });
        } catch (err) {
            console.error('Failed to fetch breakdown', err);
        }
    };

    const renderRows = (items: LevelData[], level: number, parentIds: string[] = []) => {
        return items.map((item) => (
            <React.Fragment key={`${level}-${item.id}`}>
                <tr className={`hover:bg-gray-50 transition-colors border-b border-gray-100 ${level > 1 ? 'bg-gray-50/30' : ''}`}>
                    <td className="py-2 px-4 sticky left-0 bg-white z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]" style={{ width: '250px', minWidth: '250px' }}>
                        <div className="flex items-center gap-2" style={{ paddingLeft: `${(level - 1) * 1.5}rem` }}>
                            <button
                                onClick={() => toggleLevel(item, level, parentIds)}
                                className="p-1 hover:bg-gray-200 rounded-md transition-colors text-gray-500"
                            >
                                {item.loading ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : item.isExpanded ? (
                                    <Minus size={14} />
                                ) : (
                                    <Plus size={14} />
                                )}
                            </button>
                            <span className={`text-[11px] truncate cursor-pointer hover:text-primary transition-colors ${level === 1 ? 'font-bold' : 'font-medium'}`} title={item.name}>
                                {item.name}
                            </span>
                            {level === 2 && (
                                <MessageSquare size={12} className="text-gray-400 cursor-pointer hover:text-primary" />
                            )}
                            {level === 3 && (
                                <Download size={12} className="text-gray-400 cursor-pointer hover:text-primary" />
                            )}
                            {level === 4 && (
                                <FileText size={12} className="text-gray-400 cursor-pointer hover:text-primary" />
                            )}
                        </div>
                    </td>
                    {item.values.map((val, idx) => {
                        const isInsurance = idx % 2 === 0;
                        const bucketIdx = Math.floor(idx / 2) + 1;
                        return (
                            <td
                                key={idx}
                                className={`py-2 px-2 text-[11px] text-right border-r border-gray-100 ${isInsurance ? 'text-blue-600 font-medium cursor-pointer hover:bg-blue-50' : 'text-gray-600'}`}
                                style={{ width: '80px', minWidth: '80px' }}
                                onClick={() => isInsurance && handleInsuranceClick(parentIds[0] || item.id, level >= 2 ? (parentIds[1] || item.id) : undefined, level >= 3 ? (parentIds[2] || item.id) : undefined, level === 4 ? item.id : undefined, bucketIdx)}
                            >
                                ${val}
                            </td>
                        );
                    })}
                    <td className="py-2 px-2 text-[11px] text-right font-bold text-blue-700 border-r border-gray-100" style={{ width: '80px', minWidth: '80px' }}>${item.totalInsurance}</td>
                    <td className="py-2 px-2 text-[11px] text-right font-bold text-gray-700" style={{ width: '80px', minWidth: '80px' }}>${item.totalPatient}</td>
                </tr>
                {item.isExpanded && item.children && renderRows(item.children, level + 1, [...parentIds, item.id])}
            </React.Fragment>
        ));
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-white">
            {/* Controls */}
            <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Type</label>
                        <select
                            className="input py-1.5 px-3 text-xs min-w-[150px] bg-white border-gray-200"
                            value={dateType}
                            onChange={(e) => setDateType(e.target.value)}
                        >
                            <option value="dos">Date Of Service</option>
                            <option value="billed_date">Billed Date</option>
                        </select>
                    </div>
                    <button onClick={fetchInitialData} className="btn btn-primary py-1.5 px-4 text-xs">
                        Refresh Data
                    </button>
                </div>
                <div className="text-xs text-gray-400 italic">
                    Drill down: Insurance → Client → Claim → DOS
                </div>
            </div>

            {/* Main Table Content */}
            <div className="flex-1 overflow-auto relative">
                <table className="w-full border-collapse table-fixed">
                    <thead className="sticky top-0 z-20 bg-white shadow-sm">
                        {/* Top Level Buckets */}
                        <tr className="border-b border-gray-200">
                            <th className="py-2 px-4 text-[10px] font-bold text-gray-500 uppercase text-left sticky left-0 bg-white z-30" style={{ width: '250px', minWidth: '250px' }}>Information</th>
                            {buckets.map((bucket) => (
                                <th key={bucket} colSpan={2} className="py-2 px-2 text-[10px] font-bold text-gray-600 uppercase text-center border-r border-gray-100 bg-gray-50/50">
                                    {bucket} Days
                                </th>
                            ))}
                            <th colSpan={2} className="py-2 px-2 text-[10px] font-bold text-primary uppercase text-center bg-blue-50/50">
                                Total Balance
                            </th>
                        </tr>
                        {/* Sub-headers */}
                        <tr className="border-b border-gray-200">
                            <th className="py-2 px-4 sticky left-0 bg-white z-30" style={{ width: '250px', minWidth: '250px' }}></th>
                            {buckets.map((_, i) => (
                                <React.Fragment key={i}>
                                    <th className="py-1 px-2 text-[9px] font-bold text-blue-500 uppercase text-right border-r border-gray-50 bg-white" style={{ width: '80px', minWidth: '80px' }}>Ins.</th>
                                    <th className="py-1 px-2 text-[9px] font-bold text-gray-500 uppercase text-right border-r border-gray-100 bg-white" style={{ width: '80px', minWidth: '80px' }}>Pat.</th>
                                </React.Fragment>
                            ))}
                            <th className="py-1 px-2 text-[9px] font-bold text-blue-600 uppercase text-right border-r border-gray-50 bg-blue-50/30" style={{ width: '80px', minWidth: '80px' }}>Ins.</th>
                            <th className="py-1 px-2 text-[9px] font-bold text-gray-600 uppercase text-right bg-blue-50/30" style={{ width: '80px', minWidth: '80px' }}>Pat.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            Array.from({ length: 10 }).map((_, i) => (
                                <tr key={i} className="animate-pulse">
                                    <td className="py-3 px-4 sticky left-0 bg-white"><div className="h-3 bg-gray-200 rounded w-3/4"></div></td>
                                    {Array.from({ length: 16 }).map((_, j) => (
                                        <td key={j} className="py-3 px-4"><div className="h-3 bg-gray-100 rounded"></div></td>
                                    ))}
                                </tr>
                            ))
                        ) : error ? (
                            <tr>
                                <td colSpan={17} className="py-10 text-center text-red-500 text-sm">
                                    {error}
                                </td>
                            </tr>
                        ) : (
                            <>
                                {/* Total Row */}
                                <tr className="bg-rose-50/80 font-bold border-b border-rose-100">
                                    <td className="py-2 px-4 sticky left-0 bg-rose-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] text-[11px] text-rose-800 uppercase tracking-wider" style={{ width: '250px', minWidth: '250px' }}>
                                        {total[1] || 'Grand Total'}
                                    </td>
                                    {total.slice(2, 16).map((val, i) => (
                                        <td key={i} className="py-2 px-2 text-[11px] text-right text-rose-700 border-r border-rose-100/30 font-bold" style={{ width: '80px', minWidth: '80px' }}>${val}</td>
                                    ))}
                                    <td className="py-2 px-2 text-[11px] text-right text-rose-900 border-r border-rose-100 font-bold" style={{ width: '80px', minWidth: '80px' }}>${total[16]}</td>
                                    <td className="py-2 px-2 text-[11px] text-right text-rose-900 font-bold" style={{ width: '80px', minWidth: '80px' }}>${total[17]}</td>
                                </tr>
                                {renderRows(data, 1)}
                            </>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Breakdown Modal */}
            {breakdownModal.show && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-slideUp">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-primary to-primary-dark text-white">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <TrendingUp className="text-white" size={20} />
                                </div>
                                <h3 className="font-bold">{breakdownModal.title}</h3>
                            </div>
                            <button
                                onClick={() => setBreakdownModal({ ...breakdownModal, show: false })}
                                className="p-1 hover:bg-white/20 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                                    <div className="text-xs font-semibold text-blue-500 uppercase mb-1">Primary Insurance</div>
                                    <div className="text-2xl font-bold text-blue-700">${breakdownModal.data?.primary?.toLocaleString() || '0.00'}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                                    <div className="text-xs font-semibold text-indigo-500 uppercase mb-1">Secondary Insurance</div>
                                    <div className="text-2xl font-bold text-indigo-700">${breakdownModal.data?.secondary?.toLocaleString() || '0.00'}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                                    <div className="text-xs font-semibold text-green-500 uppercase mb-1">Patient Balance</div>
                                    <div className="text-2xl font-bold text-green-700">${breakdownModal.data?.patient?.toLocaleString() || '0.00'}</div>
                                </div>
                                <div className="p-4 rounded-xl bg-gray-50 border border-gray-100 col-span-2">
                                    <div className="text-xs font-semibold text-gray-500 uppercase mb-1">Total Outstanding</div>
                                    <div className="text-2xl font-bold text-gray-800">${(breakdownModal.data?.insurance + breakdownModal.data?.patient)?.toLocaleString() || '0.00'}</div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
                            <button
                                className="btn btn-primary"
                                onClick={() => setBreakdownModal({ ...breakdownModal, show: false })}
                            >
                                Close Breakdown
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Re-using icons from main app if needed
const X = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
);

const TrendingUp = ({ size, className }: { size: number, className?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" /></svg>
);
