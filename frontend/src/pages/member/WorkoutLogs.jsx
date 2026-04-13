import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { Plus, BookOpen, Dumbbell, History, ChevronRight, Trash2 } from 'lucide-react'

const EMPTY = {
    exercise_name: '',
    sets: '',
    reps: '',
    weight_kg: '',
    notes: ''
}

export default function WorkoutLogs() {
    const { user } = useAuth()
    const [logs, setLogs] = useState([])
    const [loading, setLoading] = useState(true)
    const [form, setForm] = useState(EMPTY)
    const [submitting, setSubmitting] = useState(false)

    const load = () => {
        if (user?.member_id) {
            setLoading(true)
            api.get(`/metrics/logs?member_id=${user.member_id}`)
                .then(r => setLogs(r.data))
                .finally(() => setLoading(false))
        }
    }

    useEffect(() => { load() }, [user])

    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

    const submit = async e => {
        e.preventDefault()
        if (!form.exercise_name) return toast.error('Nhập tên bài tập')
        setSubmitting(true)
        try {
            await api.post('/metrics/logs', { ...form, member_id: user.member_id })
            toast.success('Đã lưu nhật ký tập luyện')
            setForm(EMPTY); load()
        } catch (err) {
            toast.error('Có lỗi xảy ra khi lưu')
        } finally {
            setSubmitting(false)
        }
    }

    // Group logs by date
    const grouped = logs.reduce((acc, log) => {
        const date = new Date(log.logged_at).toLocaleDateString('vi-VN')
        if (!acc[date]) acc[date] = []
        acc[date].push(log)
        return acc
    }, {})

    return (
        <div className="grid lg:grid-cols-12 gap-6 pb-20 md:pb-0">
            <div className="lg:col-span-12 mb-2">
                <h1 className="text-2xl font-bold text-white uppercase tracking-tight">Nhật Ký Tập Luyện</h1>
                <p className="text-sm text-zinc-500 mt-1">Ghi lại quá trình khổ luyện của bạn hôm nay</p>
            </div>

            {/* Log Form Area */}
            <div className="lg:col-span-4 self-start">
                <div className="card bg-zinc-900 border-zinc-800 p-6 sticky top-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-500">
                            <Plus size={20} />
                        </div>
                        <h3 className="text-sm font-bold text-white uppercase tracking-widest">Ghi chép bài tập</h3>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Tên bài tập *</label>
                            <input name="exercise_name" className="input-dark text-sm placeholder:text-zinc-700" placeholder="Bench Press / Squat / Deadlift..." value={form.exercise_name} onChange={handle} />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Số hiệp</label>
                                <input name="sets" type="number" className="input-dark text-sm text-center" placeholder="0" value={form.sets} onChange={handle} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Lần/hiệp</label>
                                <input name="reps" type="number" className="input-dark text-sm text-center" placeholder="0" value={form.reps} onChange={handle} />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Trọng lượng</label>
                                <div className="relative">
                                    <input name="weight_kg" type="number" className="input-dark text-sm text-center pr-1" placeholder="0" value={form.weight_kg} onChange={handle} />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-zinc-600 font-bold">KG</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1.5 ml-1">Ghi chú thêm</label>
                            <textarea name="notes" rows={2} className="input-dark text-sm placeholder:text-zinc-700" placeholder="Cảm giác cơ tốt, tăng tạ..." value={form.notes} onChange={handle} />
                        </div>
                        <button type="submit" disabled={submitting} className="btn-gold w-full text-xs font-black uppercase tracking-widest py-3 mt-2">
                            {submitting ? 'ĐANG LƯU...' : 'LƯU NHẬT KÝ'}
                        </button>
                    </form>
                </div>
            </div>

            {/* History Area */}
            <div className="lg:col-span-8">
                <div className="flex items-center gap-3 mb-6">
                    <History size={20} className="text-zinc-500" />
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Lịch sử luyện tập</h3>
                </div>

                {loading ? <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-32 rounded-2xl" />)}</div> :
                    Object.keys(grouped).length === 0 ? (
                        <div className="card border-dashed border-zinc-800 p-12 text-center">
                            <BookOpen size={48} className="mx-auto text-zinc-800 mb-4" />
                            <p className="text-zinc-500 text-sm italic font-medium">Lịch sử luyện tập của bạn hiện đang trống.<br />Hãy bắt đầu ghi chép buổi tập đầu tiên!</p>
                        </div>
                    ) :
                        Object.entries(grouped).map(([date, items]) => (
                            <div key={date} className="mb-8">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="h-px flex-1 bg-zinc-900" />
                                    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">{date}</span>
                                    <div className="h-px flex-1 bg-zinc-900" />
                                </div>

                                <div className="space-y-3">
                                    {items.map(log => (
                                        <div key={log.id} className="card border-zinc-800 p-4 hover:border-zinc-700 hover:bg-zinc-900/10 transition-all flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-yellow-500 shrink-0">
                                                <Dumbbell size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-white uppercase tracking-tight truncate">{log.exercise_name}</h4>
                                                <div className="flex items-center gap-3 mt-1.5">
                                                    <span className="text-[11px] font-bold text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded">{log.sets || 0} Sets</span>
                                                    <span className="text-[11px] font-bold text-zinc-400 bg-zinc-800/50 px-2 py-0.5 rounded">{log.reps || 0} Reps</span>
                                                    <span className="text-[11px] font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/10">{log.weight_kg || 0} KG</span>
                                                </div>
                                            </div>
                                            {log.notes && (
                                                <div className="max-w-[150px] hidden sm:block text-[10px] text-zinc-500 italic truncate italic pr-4">
                                                    "{log.notes}"
                                                </div>
                                            )}
                                            <ChevronRight size={14} className="text-zinc-700 shrink-0" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                }
            </div>
        </div>
    )
}
