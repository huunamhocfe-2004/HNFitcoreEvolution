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
        <div className="grid gap-6 pb-20 text-slate-900 md:pb-0 lg:grid-cols-12">
            <div className="mb-2 lg:col-span-12">
                <h1 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                    Nhật Ký Tập Luyện
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                    Ghi lại quá trình khổ luyện của bạn hôm nay
                </p>
            </div>

            {/* Log Form Area */}
            <div className="self-start lg:col-span-4">
                <div className="sticky top-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
                    <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600">
                            <Plus size={20} />
                        </div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-900">
                            Ghi chép bài tập
                        </h3>
                    </div>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <label className="mb-1.5 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Tên bài tập *
                            </label>
                            <input
                                name="exercise_name"
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                placeholder="Bench Press / Squat / Deadlift..."
                                value={form.exercise_name}
                                onChange={handle}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div>
                                <label className="mb-1.5 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Số hiệp
                                </label>
                                <input
                                    name="sets"
                                    type="number"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                    placeholder="0"
                                    value={form.sets}
                                    onChange={handle}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Lần/hiệp
                                </label>
                                <input
                                    name="reps"
                                    type="number"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-center text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                    placeholder="0"
                                    value={form.reps}
                                    onChange={handle}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Trọng lượng
                                </label>
                                <div className="relative">
                                    <input
                                        name="weight_kg"
                                        type="number"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 pr-7 text-center text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        placeholder="0"
                                        value={form.weight_kg}
                                        onChange={handle}
                                    />
                                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400">
                                        KG
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="mb-1.5 ml-1 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                                Ghi chú thêm
                            </label>
                            <textarea
                                name="notes"
                                rows={2}
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                placeholder="Cảm giác cơ tốt, tăng tạ..."
                                value={form.notes}
                                onChange={handle}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="mt-2 w-full rounded-xl bg-red-600 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitting ? 'ĐANG LƯU...' : 'LƯU NHẬT KÝ'}
                        </button>
                    </form>
                </div>
            </div>

            {/* History Area */}
            <div className="lg:col-span-8">
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                        <History size={18} className="text-slate-500" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-700">
                        Lịch sử luyện tập
                    </h3>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className="h-32 animate-pulse rounded-2xl bg-slate-200"
                            />
                        ))}
                    </div>
                ) : Object.keys(grouped).length === 0 ? (
                    <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center shadow-sm shadow-slate-200/70">
                        <BookOpen size={48} className="mx-auto mb-4 text-slate-300" />
                        <p className="text-sm font-medium italic text-slate-500">
                            Lịch sử luyện tập của bạn hiện đang trống.
                            <br />
                            Hãy bắt đầu ghi chép buổi tập đầu tiên!
                        </p>
                    </div>
                ) : (
                    Object.entries(grouped).map(([date, items]) => (
                        <div key={date} className="mb-8">
                            <div className="mb-4 flex items-center gap-4">
                                <div className="h-px flex-1 bg-slate-200" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                                    {date}
                                </span>
                                <div className="h-px flex-1 bg-slate-200" />
                            </div>

                            <div className="space-y-3">
                                {items.map(log => (
                                    <div
                                        key={log.id}
                                        className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm shadow-slate-200/70 transition-all hover:border-red-200 hover:bg-red-50/40 hover:shadow-md"
                                    >
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-600">
                                            <Dumbbell size={18} />
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <h4 className="truncate text-sm font-black uppercase tracking-tight text-slate-900">
                                                {log.exercise_name}
                                            </h4>

                                            <div className="mt-1.5 flex flex-wrap items-center gap-3">
                                                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                                    {log.sets || 0} Sets
                                                </span>
                                                <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                                                    {log.reps || 0} Reps
                                                </span>
                                                <span className="rounded border border-red-100 bg-red-50 px-2 py-0.5 text-[11px] font-bold text-red-600">
                                                    {log.weight_kg || 0} KG
                                                </span>
                                            </div>
                                        </div>

                                        {log.notes && (
                                            <div className="hidden max-w-[150px] truncate pr-4 text-[10px] italic text-slate-500 sm:block">
                                                "{log.notes}"
                                            </div>
                                        )}

                                        <ChevronRight
                                            size={14}
                                            className="shrink-0 text-slate-400"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}