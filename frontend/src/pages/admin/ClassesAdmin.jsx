import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { Plus, Edit2, Trash2, School, Clock, Users, Calendar } from 'lucide-react'

const EMPTY = {
    title: '',
    class_type: 'yoga',
    trainer_id: '',
    day_of_week: 1, // Thứ 2
    start_time: '08:00',
    duration_min: 60,
    max_capacity: 20
}

const TYPES = ['yoga', 'zumba', 'boxing', 'crossfit', 'cycling', 'other']
const DAYS = [
    { v: 1, l: 'Thứ Hai' }, { v: 2, l: 'Thứ Ba' }, { v: 3, l: 'Thứ Tư' },
    { v: 4, l: 'Thứ Năm' }, { v: 5, l: 'Thứ Sáu' }, { v: 6, l: 'Thứ Bảy' }, { v: 0, l: 'Chủ Nhật' }
]

export default function ClassesAdmin() {
    const [classes, setClasses] = useState([])
    const [trainers, setTrainers] = useState([])
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editing, setEditing] = useState(null)
    const [loading, setLoading] = useState(true)

    const load = () => {
        setLoading(true)
        Promise.all([api.get('/bookings/classes'), api.get('/bookings/trainers')])
            .then(([c, t]) => { setClasses(c.data); setTrainers(t.data) })
            .finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

    const openEdit = c => {
        setEditing(c.id)
        setForm({ ...c, trainer_id: c.trainer_id || '' })
        setModal(true)
    }

    const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }

    const submit = async e => {
        e.preventDefault()
        try {
            if (editing) {
                await api.put(`/bookings/classes/${editing}`, form)
                toast.success('Đã cập nhật lớp học')
            } else {
                await api.post('/bookings/classes', form)
                toast.success('Đã thêm lớp học mới')
            }
            setModal(false); load()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra')
        }
    }

    const del = async id => {
        if (!confirm('Ẩn lớp học này?')) return
        await api.delete(`/bookings/classes/${id}`)
        toast.success('Đã ẩn lớp học'); load()
    }

    return (
        <div className="space-y-6 text-slate-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 uppercase tracking-tight">
                        Quản lý Lớp Học
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {classes.length} lớp học trong lịch trình
                    </p>
                </div>

                <button
                    onClick={openAdd}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
                >
                    <Plus size={15} /> Thêm lớp mới
                </button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {loading
                    ? [...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="h-40 animate-pulse rounded-2xl bg-slate-200"
                        />
                    ))
                    : classes.map(c => (
                        <div
                            key={c.id}
                            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 transition-all duration-300 hover:border-red-200 hover:shadow-lg"
                        >
                            <div className="mb-4 flex items-start justify-between">
                                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-black uppercase text-red-600">
                                    {c.class_type}
                                </span>

                                <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                    <button
                                        onClick={() => openEdit(c)}
                                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                        title="Sửa lớp học"
                                    >
                                        <Edit2 size={13} />
                                    </button>

                                    <button
                                        onClick={() => del(c.id)}
                                        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                        title="Ẩn lớp học"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="mb-2 text-lg font-black leading-tight text-slate-900">
                                {c.title}
                            </h3>

                            <div className="mb-6 space-y-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <Clock size={14} className="text-red-600" />
                                    {DAYS.find(d => d.v === c.day_of_week)?.l} @ {c.start_time} ({c.duration_min}p)
                                </div>

                                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                                    <Users size={14} className="text-red-600" />
                                    {c.trainer_name || 'Chưa phân công'} · Tối đa {c.max_capacity} chỗ
                                </div>
                            </div>

                            {!c.is_active && (
                                <span className="mt-auto rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-orange-600">
                                    ⚠️ Đã tạm ngưng
                                </span>
                            )}
                        </div>
                    ))
                }
            </div>

            {modal && createPortal(
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                    onClick={e => e.target === e.currentTarget && setModal(false)}
                >
                    <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                            <div>
                                <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                                    {editing ? 'Cập nhật thông tin lớp học' : 'Tạo lớp học mới'}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {editing ? 'Chỉnh sửa lịch lớp học trong hệ thống' : 'Nhập thông tin để tạo lớp học mới'}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setModal(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                            >
                                ×
                            </button>
                        </div>

                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Tên lớp học *
                                    </label>
                                    <input
                                        name="title"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        placeholder="Yoga Basic / Boxing Advanced..."
                                        value={form.title}
                                        onChange={handle}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Loại hình
                                    </label>
                                    <select
                                        name="class_type"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-black uppercase text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        value={form.class_type}
                                        onChange={handle}
                                    >
                                        {TYPES.map(t => (
                                            <option key={t} value={t}>{t}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Huấn luyện viên
                                    </label>
                                    <select
                                        name="trainer_id"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        value={form.trainer_id}
                                        onChange={handle}
                                    >
                                        <option value="">-- Chọn HLV --</option>
                                        {trainers.map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Ngày trong tuần
                                    </label>
                                    <select
                                        name="day_of_week"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        value={form.day_of_week}
                                        onChange={handle}
                                    >
                                        {DAYS.map(d => (
                                            <option key={d.v} value={d.v}>{d.l}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Giờ bắt đầu
                                    </label>
                                    <input
                                        name="start_time"
                                        type="time"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        value={form.start_time}
                                        onChange={handle}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Thời lượng phút
                                    </label>
                                    <input
                                        name="duration_min"
                                        type="number"
                                        min="15"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        value={form.duration_min}
                                        onChange={handle}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Sức chứa tối đa
                                    </label>
                                    <input
                                        name="max_capacity"
                                        type="number"
                                        min="1"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        value={form.max_capacity}
                                        onChange={handle}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className="mt-2 flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600">
                                        <input
                                            type="checkbox"
                                            checked={form.is_active}
                                            onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))}
                                            className="accent-red-600"
                                        />
                                        Lớp học đang hoạt động
                                    </label>
                                </div>
                            </div>

                            <div className="flex gap-3 border-t border-slate-200 pt-6">
                                <button
                                    type="button"
                                    onClick={() => setModal(false)}
                                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    className="flex-1 rounded-xl bg-red-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
                                >
                                    {editing ? 'LƯU THAY ĐỔI' : 'XÁC NHẬN TẠO LỚP'}
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