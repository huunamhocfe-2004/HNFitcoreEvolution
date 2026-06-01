import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { createPortal } from "react-dom";
import toast from 'react-hot-toast'
import { Line } from 'react-chartjs-2'
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Title, Tooltip, Legend, Filler
} from 'chart.js'
import { Activity, Plus, History, Scale } from 'lucide-react'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler)

export default function Progress() {
    const { user } = useAuth()
    const [metrics, setMetrics] = useState([])
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState({ weight: '', height: '', body_fat: '', muscle_mass: '' })

    const loadData = async () => {
        if (!user?.member_id) return
        try {
            const [m, l] = await Promise.all([
                api.get(`/metrics?member_id=${user.member_id}`),
                api.get(`/metrics/logs?member_id=${user.member_id}`)
            ])
            setMetrics(m.data)
            setLogs(l.data)
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { loadData() }, [user])

    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

    const submit = async e => {
        e.preventDefault()
        try {
            await api.post('/metrics', { ...form, member_id: user.member_id })
            toast.success('Đã lưu chỉ số mới!')
            setModal(false)
            setForm({ weight: '', height: '', body_fat: '', muscle_mass: '' })
            loadData()
        } catch (err) {
            toast.error('Lỗi khi lưu chỉ số')
        }
    }

    const chartData = {
        labels: metrics.map(m => new Date(m.recorded_at).toLocaleDateString('vi-VN')),
        datasets: [
            {
                label: 'Cân nặng (kg)',
                data: metrics.map(m => m.weight),
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220,38,38,0.08)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#dc2626',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
            },
            {
                label: 'BMI',
                data: metrics.map(m => m.bmi),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.06)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#2563eb',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
            }
        ]
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#475569',
                    font: { size: 11, weight: 'bold' },
                    usePointStyle: true,
                    padding: 20,
                }
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#ffffff',
                titleColor: '#0f172a',
                bodyColor: '#334155',
                borderColor: '#e5e7eb',
                borderWidth: 1,
            },
        },
        scales: {
            x: {
                grid: { color: '#e5e7eb' },
                ticks: { color: '#64748b', font: { size: 10, weight: 'bold' } }
            },
            y: {
                grid: { color: '#e5e7eb' },
                ticks: { color: '#64748b', font: { size: 10, weight: 'bold' } }
            },
        }
    }

    if (loading) {
        return (
            <div className="h-96 animate-pulse rounded-2xl bg-slate-200" />
        )
    }

    return (
        <div className="space-y-6 text-slate-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        Theo Dõi Tiến Độ
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Sự thay đổi cơ thể qua thời gian
                    </p>
                </div>

                <button
                    onClick={() => setModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
                >
                    <Plus size={16} /> Cập nhật chỉ số
                </button>
            </div>

            {/* Chart Section */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
                <div className="mb-6 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50">
                        <Activity size={18} className="text-red-600" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                        Biểu đồ biến thiên
                    </h3>
                </div>

                {metrics.length > 0 ? (
                    <div className="h-64 w-full sm:h-80">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-20 text-center text-slate-500">
                        Chưa có dữ liệu biểu đồ. Hãy cập nhật chỉ số đầu tiên của bạn!
                    </div>
                )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Latest Metrics */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-200 bg-red-50">
                            <Scale size={18} className="text-red-600" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                            Chỉ số mới nhất
                        </h3>
                    </div>

                    {metrics.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                {
                                    label: 'Cân nặng',
                                    value: metrics[metrics.length - 1].weight + ' kg',
                                    color: 'text-red-600',
                                },
                                {
                                    label: 'BMI',
                                    value: metrics[metrics.length - 1].bmi,
                                    color: 'text-blue-600',
                                },
                                {
                                    label: '% Mỡ',
                                    value: (metrics[metrics.length - 1].body_fat || '—') + ' %',
                                    color: 'text-slate-900',
                                },
                                {
                                    label: '% Cơ',
                                    value: (metrics[metrics.length - 1].muscle_mass || '—') + ' %',
                                    color: 'text-slate-900',
                                },
                            ].map(item => (
                                <div
                                    key={item.label}
                                    className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                                >
                                    <div className="mb-1 text-[10px] font-bold uppercase text-slate-500">
                                        {item.label}
                                    </div>
                                    <div className={`text-xl font-black ${item.color}`}>
                                        {item.value}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="py-8 text-center text-sm text-slate-500">
                            Chưa có chỉ số cơ thể.
                        </div>
                    )}
                </div>

                {/* Workout/Update History */}
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
                    <div className="mb-4 flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                            <History size={18} className="text-slate-500" />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                            Lịch sử cập nhật
                        </h3>
                    </div>

                    <div className="max-h-60 space-y-3 overflow-y-auto pr-2">
                        {metrics.slice().reverse().map((m, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-3"
                            >
                                <div>
                                    <div className="text-xs font-medium text-slate-500">
                                        {new Date(m.recorded_at).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="text-sm font-bold text-slate-900">
                                        {m.weight} kg · BMI {m.bmi}
                                    </div>
                                </div>

                                {m.body_fat && (
                                    <div className="text-xs font-semibold text-slate-500">
                                        Fat: {m.body_fat}%
                                    </div>
                                )}
                            </div>
                        ))}

                        {metrics.length === 0 && (
                            <div className="py-4 text-sm text-slate-500">
                                Chưa có lịch sử.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {modal && createPortal(
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                    onClick={e => e.target === e.currentTarget && setModal(false)}
                >
                    <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
                        <div className="mb-6 border-b border-slate-200 pb-4">
                            <h2 className="text-lg font-black uppercase tracking-tight text-slate-900">
                                Cập Nhật Chỉ Số Cơ Thể
                            </h2>
                            <p className="mt-1 text-sm text-slate-500">
                                Nhập chỉ số mới để theo dõi tiến độ luyện tập
                            </p>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase text-slate-500">
                                        Cân nặng kg *
                                    </label>
                                    <input
                                        name="weight"
                                        type="number"
                                        step="0.1"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        placeholder="70.5"
                                        value={form.weight}
                                        onChange={handle}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase text-slate-500">
                                        Chiều cao cm *
                                    </label>
                                    <input
                                        name="height"
                                        type="number"
                                        step="0.1"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        placeholder="175"
                                        value={form.height}
                                        onChange={handle}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase text-slate-500">
                                        % Mỡ cơ thể
                                    </label>
                                    <input
                                        name="body_fat"
                                        type="number"
                                        step="0.1"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        placeholder="15"
                                        value={form.body_fat}
                                        onChange={handle}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase text-slate-500">
                                        % Khối lượng cơ
                                    </label>
                                    <input
                                        name="muscle_mass"
                                        type="number"
                                        step="0.1"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        placeholder="45"
                                        value={form.muscle_mass}
                                        onChange={handle}
                                    />
                                </div>
                            </div>

                            <div className="flex gap-3 border-t border-slate-200 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setModal(false)}
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
                                >
                                    Lưu chỉ số
                                </button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}