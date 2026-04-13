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
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white uppercase tracking-tight">Quản lý Lớp Học</h1>
                    <p className="text-sm text-zinc-500 mt-1">{classes.length} lớp học trong lịch trình</p>
                </div>
                <button onClick={openAdd} className="btn-gold flex items-center gap-2 text-sm">
                    <Plus size={15} /> Thêm lớp mới
                </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? [...Array(6)].map((_, i) => <div key={i} className="skeleton h-40 rounded-2xl" />) :
                    classes.map(c => (
                        <div key={c.id} className="card border-zinc-800 p-6 group hover:border-yellow-500/30 transition-all flex flex-col">
                            <div className="flex justify-between items-start mb-4">
                                <span className="badge badge-yellow uppercase !text-[10px] font-black">{c.class_type}</span>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-white/5 text-zinc-500 hover:text-white transition-colors">
                                        <Edit2 size={13} />
                                    </button>
                                    <button onClick={() => del(c.id)} className="p-1.5 rounded hover:bg-red-900/20 text-zinc-500 hover:text-red-400 transition-colors">
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-black text-white mb-2 leading-tight">{c.title}</h3>

                            <div className="space-y-2 mb-6">
                                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                                    <Clock size={14} className="text-yellow-500" /> {DAYS.find(d => d.v === c.day_of_week)?.l} @ {c.start_time} ({c.duration_min}p)
                                </div>
                                <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                                    <Users size={14} className="text-yellow-500" /> {c.trainer_name || 'Chưa phân công'} · Tối đa {c.max_capacity} chỗ
                                </div>
                            </div>

                            {!c.is_active && <span className="text-[10px] text-zinc-600 font-black uppercase tracking-widest mt-auto">⚠️ Đã tạm ngưng</span>}
                        </div>
                    ))
                }
            </div>

            {modal && createPortal(
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="modal-box max-w-lg p-6">
                        <h2 className="text-xl font-black text-white mb-6 uppercase tracking-tight">
                            {editing ? 'Cập nhật thông tin lớp học' : 'Thiết lập lớp học mới'}
                        </h2>
                        <form onSubmit={submit} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Tên lớp học *</label>
                                    <input name="title" required className="input-dark text-sm" placeholder="Yoga Basic / Boxing Advanced..." value={form.title} onChange={handle} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Loại hình</label>
                                    <select name="class_type" className="input-dark text-sm uppercase font-black" value={form.class_type} onChange={handle}>
                                        {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Huấn luyện viên</label>
                                    <select name="trainer_id" className="input-dark text-sm" value={form.trainer_id} onChange={handle}>
                                        <option value="">-- Chọn HLV --</option>
                                        {trainers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Ngày trong tuần</label>
                                    <select name="day_of_week" className="input-dark text-sm" value={form.day_of_week} onChange={handle}>
                                        {DAYS.map(d => <option key={d.v} value={d.v}>{d.l}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Giờ bắt đầu</label>
                                    <input name="start_time" type="time" required className="input-dark text-sm" value={form.start_time} onChange={handle} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Thời lượng (phút)</label>
                                    <input name="duration_min" type="number" min="15" className="input-dark text-sm" value={form.duration_min} onChange={handle} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5">Sức chứa tối đa</label>
                                    <input name="max_capacity" type="number" min="1" className="input-dark text-sm" value={form.max_capacity} onChange={handle} />
                                </div>
                                <div className="col-span-2">
                                    <label className="flex items-center gap-2 text-xs font-black text-zinc-500 uppercase tracking-widest cursor-pointer mt-2">
                                        <input type="checkbox" checked={form.is_active} onChange={e => setForm(p => ({ ...p, is_active: e.target.checked }))} className="accent-yellow-500" />
                                        Lớp học đang hoạt động
                                    </label>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-6">
                                <button type="button" onClick={() => setModal(false)} className="btn-ghost flex-1 text-xs font-black uppercase tracking-widest">Hủy</button>
                                <button type="submit" className="btn-gold flex-1 text-xs font-black uppercase tracking-widest py-3">
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
