import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
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
                borderColor: '#eab308',
                backgroundColor: 'rgba(234,179,8,0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#eab308',
            },
            {
                label: 'BMI',
                data: metrics.map(m => m.bmi),
                borderColor: '#dc2626',
                backgroundColor: 'rgba(220,38,38,0.05)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#dc2626',
            }
        ]
    }

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#888', font: { size: 11 } } },
            tooltip: { mode: 'index', intersect: false },
        },
        scales: {
            x: { grid: { color: '#1f1f1f' }, ticks: { color: '#666', font: { size: 10 } } },
            y: { grid: { color: '#1f1f1f' }, ticks: { color: '#666', font: { size: 10 } } },
        }
    }

    if (loading) return <div className="skeleton h-96 rounded-2xl" />

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Theo Dõi Tiến Độ</h1>
                    <p className="text-sm text-gray-500 mt-1">Sự thay đổi cơ thể qua thời gian</p>
                </div>
                <button onClick={() => setModal(true)} className="btn-gold flex items-center gap-2 text-sm">
                    <Plus size={16} /> Cập nhật chỉ số
                </button>
            </div>

            {/* Chart Section */}
            <div className="card bg-zinc-900/50 border-zinc-800 p-6">
                <div className="flex items-center gap-2 mb-6">
                    <Activity size={18} className="text-yellow-500" />
                    <h3 className="font-bold text-white text-sm uppercase tracking-wider">Biểu đồ biến thiên</h3>
                </div>
                {metrics.length > 0 ? (
                    <div className="h-64 sm:h-80 w-full">
                        <Line data={chartData} options={chartOptions} />
                    </div>
                ) : (
                    <div className="py-20 text-center text-zinc-500 border border-dashed border-zinc-800 rounded-xl">
                        Chưa có dữ liệu biểu đồ. Hãy cập nhật chỉ số đầu tiên của bạn!
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Latest Metrics */}
                <div className="card bg-zinc-900/50 border-zinc-800 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Scale size={18} className="text-yellow-500" />
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Chỉ số mới nhất</h3>
                    </div>
                    {metrics.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { label: 'Cân nặng', value: metrics[metrics.length - 1].weight + ' kg', color: 'text-yellow-500' },
                                { label: 'BMI', value: metrics[metrics.length - 1].bmi, color: 'text-red-500' },
                                { label: '% Mỡ', value: (metrics[metrics.length - 1].body_fat || '—') + ' %', color: 'text-zinc-300' },
                                { label: '% Cơ', value: (metrics[metrics.length - 1].muscle_mass || '—') + ' %', color: 'text-zinc-300' },
                            ].map(item => (
                                <div key={item.label} className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800">
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">{item.label}</div>
                                    <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-zinc-500 text-sm py-8 text-center">Chưa có chỉ số cơ thể.</div>
                    )}
                </div>

                {/* Workout/Update History */}
                <div className="card bg-zinc-900/50 border-zinc-800 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <History size={18} className="text-zinc-500" />
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Lịch sử cập nhật</h3>
                    </div>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                        {metrics.slice().reverse().map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-zinc-950/30 border border-zinc-800/50">
                                <div>
                                    <div className="text-xs text-zinc-500 font-medium">
                                        {new Date(m.recorded_at).toLocaleDateString('vi-VN')}
                                    </div>
                                    <div className="text-sm font-bold text-zinc-300">
                                        {m.weight} kg · BMI {m.bmi}
                                    </div>
                                </div>
                                {m.body_fat && <div className="text-xs text-zinc-600">Fat: {m.body_fat}%</div>}
                            </div>
                        ))}
                        {metrics.length === 0 && <div className="text-zinc-500 text-sm py-4">Chưa có lịch sử.</div>}
                    </div>
                </div>
            </div>

            {modal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="modal-box max-w-sm">
                        <h2 className="text-lg font-bold text-white mb-4">Cập Nhật Chỉ Số Cơ Thể</h2>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Cân nặng (kg) *</label>
                                    <input name="weight" type="number" step="0.1" required className="input-dark text-sm" placeholder="70.5" value={form.weight} onChange={handle} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">Chiều cao (cm) *</label>
                                    <input name="height" type="number" step="0.1" required className="input-dark text-sm" placeholder="175" value={form.height} onChange={handle} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">% Mỡ cơ thể</label>
                                    <input name="body_fat" type="number" step="0.1" className="input-dark text-sm" placeholder="15" value={form.body_fat} onChange={handle} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-zinc-500 uppercase mb-1.5">% Khối lượng cơ</label>
                                    <input name="muscle_mass" type="number" step="0.1" className="input-dark text-sm" placeholder="45" value={form.muscle_mass} onChange={handle} />
                                </div>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1 text-sm py-2">Hủy</button>
                                <button type="submit" className="btn-gold flex-1 text-sm py-2">Lưu chỉ số</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
