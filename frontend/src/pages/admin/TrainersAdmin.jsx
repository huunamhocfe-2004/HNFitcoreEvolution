import { useEffect, useState, useMemo } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { createPortal } from 'react-dom'
import { Plus, User, Edit2, Trash2, Award, BookOpen, Eye, MapPin, DollarSign, Briefcase, CheckCircle2 } from 'lucide-react'
import AppDropdown from '../../components/common/AppDropdown'

const EMPTY = { 
    user_id: '', specialization: '', bio: '', experience_years: 0,
    title: '', hourly_rate: '', employment_status: 'HN Fitcore', badge: '', 
    work_address: '', skills: '', certifications: '', teaching: ''
}
const stt_Collab = ["Nội bộ (HN Fitcore)", "Freelancer"]

// Hàm hỗ trợ chuyển đổi Array từ DB thành chuỗi để hiển thị trong form
const joinArray = (data) => {
    if (!data) return '';
    if (typeof data === 'string') return data; // Nếu DB trả về chuỗi JSON thô
    if (Array.isArray(data)) return data.join(', ');
    return '';
}

// Hàm hỗ trợ parse JSON an toàn khi hiển thị chi tiết
const parseArray = (data) => {
    if (!data) return [];
    if (Array.isArray(data)) return data;
    try { return JSON.parse(data); } catch (e) { return []; }
}

export default function TrainersAdmin() {
    const [trainers, setTrainers] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(false)
    const [viewing, setViewing] = useState(null) // State cho popup xem chi tiết
    const [form, setForm] = useState(EMPTY)
    const [editing, setEditing] = useState(null)
    const [saving, setSaving] = useState(false)
    const [file, setFile] = useState(null)

    const load = async () => {
        setLoading(true)
        try {
            const [tRes, uRes] = await Promise.all([
                api.get('/trainers'),
                api.get('/users') // Tái sử dụng để lấy danh sách user
            ])
            setTrainers(tRes.data)
            setUsers(uRes.data) 
        } catch (err) {
            toast.error('Lỗi tải dữ liệu')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { load() }, [])

    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    const coachOptions = useMemo(() => {
        return users.map((m) => ({
            value: m.id,
            label: m.name,
        }))
    }, [users])
    const collabOptions = useMemo(() => {
        return stt_Collab.map((c) => ({
            value: c,
            label: c,
        }))
    })

    const openEdit = (t) => {
        setEditing(t.id)
        setForm({
            user_id: t.user_id,
            specialization: t.specialization || '',
            bio: t.bio || '',
            experience_years: t.experience_years || 0,
            title: t.title || '',
            hourly_rate: t.hourly_rate || '',
            employment_status: t.employment_status || 'HN Fitcore',
            badge: t.badge || '',
            work_address: t.work_address || '',
            skills: joinArray(t.skills),
            certifications: joinArray(t.certifications),
            teaching: joinArray(t.teaching)
        })
        setModal(true)
    }

    const submit = async e => {
        e.preventDefault(); setSaving(true)
        const data = new FormData()
        
        Object.keys(form).forEach(k => {
            // Chuyển chuỗi nhập vào có dấu phẩy thành JSON Array gửi lên server
            if (['skills', 'certifications', 'teaching'].includes(k)) {
                const arr = form[k] ? form[k].split(',').map(s => s.trim()).filter(Boolean) : [];
                data.append(k, JSON.stringify(arr));
            } else {
                data.append(k, form[k])
            }
        })
        
        if (file) data.append('avatar', file)

        try {
            if (editing) {
                await api.put(`/trainers/${editing}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
                toast.success('Cập nhật thành công')
            } else {
                await api.post('/trainers', data)
                toast.success('Đã thêm HLV thành công')
            }
            setModal(false); setForm(EMPTY); setFile(null); setEditing(null); load()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra')
        } finally { setSaving(false) }
    }

    const remove = async id => {
        if (!confirm('Xóa thông tin HLV này? (Tài khoản người dùng vẫn giữ nguyên)')) return
        try {
            await api.delete(`/trainers/${id}`)
            toast.success('Đã xóa'); load()
        } catch (err) {
            toast.error('Lỗi khi xóa')
        }
    }

    return (
        <div className="space-y-6 text-slate-900 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        Quản lý Huấn luyện viên PT
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Danh sách nhân sự PT chịu trách nhiệm chuyên môn
                    </p>
                </div>

                <button
                    onClick={() => { setEditing(null); setForm(EMPTY); setModal(true) }}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
                >
                    <Plus size={16} /> Thêm HLV
                </button>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? [...Array(3)].map((_, i) => (
                    <div
                        key={i}
                        className="h-48 animate-pulse rounded-2xl bg-slate-200"
                    />
                )) :
                    trainers.map(t => (
                        <div
                            key={t.id}
                            className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 transition-all duration-300 hover:border-red-200 hover:shadow-lg"
                        >
                            {/* Card Content */}
                            <div>
                                <div className="flex items-start gap-4">
                                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50">
                                        {t.avatar ? (
                                            <img
                                                src={t.avatar}
                                                alt={t.name}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-slate-50 text-slate-400">
                                                <User size={24} />
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start justify-between gap-2">
                                            <h3 className="truncate font-bold text-slate-900">
                                                {t.name}
                                            </h3>

                                            {t.badge && (
                                                <span className="ml-2 whitespace-nowrap rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-[10px] font-bold uppercase text-red-600">
                                                    {t.badge}
                                                </span>
                                            )}
                                        </div>

                                        <p className="truncate text-xs font-semibold text-red-600">
                                            {t.title || t.specialization}
                                        </p>

                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <Award size={12} className="text-red-500" /> {t.experience_years} năm
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Briefcase size={12} className="text-red-500" /> {t.employment_status}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 line-clamp-2 text-xs italic text-slate-500">
                                    "{t.bio || 'Chưa có tiểu sử...'}"
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="mt-4 flex gap-2 border-t border-slate-200 pt-4">
                                <button
                                    onClick={() => setViewing(t)}
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 py-1.5 text-[11px] font-bold uppercase tracking-wider text-blue-600 transition hover:bg-blue-100"
                                >
                                    <Eye size={12} /> Xem
                                </button>

                                <button
                                    onClick={() => openEdit(t)}
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                                >
                                    <Edit2 size={12} /> Sửa
                                </button>

                                <button
                                    onClick={() => remove(t.id)}
                                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white py-1.5 text-[11px] font-bold uppercase tracking-wider text-red-600 transition hover:bg-red-50"
                                >
                                    <Trash2 size={12} /> Xóa
                                </button>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* POPUP XEM CHI TIẾT HLV */}
            {viewing && createPortal(
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                    onClick={e => e.target === e.currentTarget && setViewing(null)}
                >
                    <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-2xl">
                        <div className="flex items-start justify-between border-b border-slate-200 bg-slate-50 p-6">
                            <div className="flex items-center gap-4">
                                <img
                                    src={viewing.avatar || '/placeholder-user.jpg'}
                                    alt="avatar"
                                    className="h-20 w-20 rounded-full border-2 border-red-100 object-cover"
                                />

                                <div>
                                    <h2 className="flex items-center gap-2 text-2xl font-black text-slate-900">
                                        {viewing.name} 
                                        {viewing.badge && (
                                            <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                                                {viewing.badge}
                                            </span>
                                        )}
                                    </h2>

                                    <p className="font-semibold text-red-600">
                                        {viewing.title || viewing.specialization}
                                    </p>

                                    <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-500">
                                        <span className="flex items-center gap-1">
                                            <Briefcase size={14}/> {viewing.employment_status}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <MapPin size={14}/> {viewing.work_address || 'Chưa cập nhật'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="flex items-center justify-end gap-1 text-xl font-black text-slate-900">
                                    <DollarSign size={20} className="text-red-600"/>
                                    {viewing.hourly_rate ? Number(viewing.hourly_rate).toLocaleString('vi-VN') : 0}đ
                                </div>
                                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                    Mỗi giờ
                                </div>
                            </div>
                        </div>

                        <div className="max-h-[60vh] space-y-6 overflow-y-auto p-6">
                            <div>
                                <h3 className="mb-2 text-sm font-black uppercase tracking-wider text-slate-900">
                                    Tiểu sử
                                </h3>
                                <p className="border-l-2 border-red-200 pl-4 text-sm italic leading-relaxed text-slate-600">
                                    "{viewing.bio || 'Chưa cập nhật'}"
                                </p>
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div>
                                    <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-900">
                                        <Award size={16} className="text-red-600"/>
                                        Chứng chỉ
                                    </h3>

                                    <ul className="space-y-2">
                                        {parseArray(viewing.certifications).length > 0 ? parseArray(viewing.certifications).map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-500"/>
                                                {item}
                                            </li>
                                        )) : (
                                            <li className="text-sm text-slate-400">
                                                Chưa cập nhật
                                            </li>
                                        )}
                                    </ul>
                                </div>

                                <div>
                                    <h3 className="mb-3 flex items-center gap-2 text-sm font-black uppercase tracking-wider text-slate-900">
                                        <BookOpen size={16} className="text-red-600"/>
                                        Lĩnh vực giảng dạy
                                    </h3>

                                    <ul className="space-y-2">
                                        {parseArray(viewing.teaching).length > 0 ? parseArray(viewing.teaching).map((item, idx) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                                                <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-blue-500"/>
                                                {item}
                                            </li>
                                        )) : (
                                            <li className="text-sm text-slate-400">
                                                Chưa cập nhật
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h3 className="mb-3 text-sm font-black uppercase tracking-wider text-slate-900">
                                    Kỹ năng nổi bật
                                </h3>

                                <div className="flex flex-wrap gap-2">
                                    {parseArray(viewing.skills).length > 0 ? parseArray(viewing.skills).map((skill, idx) => (
                                        <span
                                            key={idx}
                                            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
                                        >
                                            {skill}
                                        </span>
                                    )) : (
                                        <span className="text-sm text-slate-400">
                                            Chưa cập nhật
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-slate-200 bg-slate-50 p-4 text-right">
                            <button
                                onClick={() => setViewing(null)}
                                className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-red-50 hover:text-red-600"
                            >
                                Đóng lại
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* POPUP THÊM / SỬA HLV */}
            {modal && createPortal(
                <div
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                    onClick={e => e.target === e.currentTarget && setModal(false)}
                >
                    <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto hide-scrollbar rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
                        <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                            <div>
                                <h2 className="flex items-center gap-2 text-xl font-black uppercase tracking-tight text-slate-900">
                                    <BookOpen className="text-red-600" size={20} />
                                    {editing ? 'Cập nhật thông tin HLV' : 'Thêm Huấn luyện viên mới'}
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">
                                    {editing ? 'Chỉnh sửa thông tin huấn luyện viên' : 'Nhập thông tin để tạo hồ sơ huấn luyện viên'}
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
                            {!editing && (
                                <div>
                                    <AppDropdown
                                    label="Chọn HLV"
                                    name="user_id"
                                    value={form.user_id}
                                    onChange={handle}
                                    options={coachOptions}
                                    placeholder='Chọn huấn luyện viên'
                                    loading={loading}
                                    emptyText='Không có hội viên'
                                    required
                                    />
                                </div>
                            )}

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Chức danh hiển thị UI Title *
                                    </label>
                                    <input
                                        name="title"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        placeholder="VD: Senior Bodybuilding Coach"
                                        value={form.title}
                                        onChange={handle}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Chuyên môn chung Specialization
                                    </label>
                                    <input
                                        name="specialization"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        placeholder="VD: Gym, Yoga..."
                                        value={form.specialization}
                                        onChange={handle}
                                    />
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Giá thuê theo giờ VNĐ
                                    </label>
                                    <input
                                        name="hourly_rate"
                                        type="number"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        placeholder="VD: 500000"
                                        value={form.hourly_rate}
                                        onChange={handle}
                                    />
                                </div>
                                <AppDropdown
                                label="Trạng thái công tác"
                                name="employment_status"
                                value={form.employment_status}
                                onChange={handle}
                                options={collabOptions}
                                placeholder='Chọn trạng thái công tác'
                                // loading={loading}
                                emptyText='Không có dữ liệu'
                                required
                                />

                                {/* <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Trạng thái công tác
                                    </label>
                                    <select
                                        name="employment_status"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        value={form.employment_status}
                                        onChange={handle}
                                    >
                                        <option value="HN Fitcore">HN Fitcore (Nội bộ)</option>
                                        <option value="Freelancer">Freelancer (Tự do)</option>
                                    </select>
                                </div> */}

                                <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Cơ sở làm việc
                                    </label>
                                    <input
                                        name="work_address"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        placeholder="VD: Cơ sở 1 - Cầu Giấy"
                                        value={form.work_address}
                                        onChange={handle}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                            Kinh nghiệm Năm
                                        </label>
                                        <input
                                            name="experience_years"
                                            type="number"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                            value={form.experience_years}
                                            onChange={handle}
                                        />
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                            Nhãn nổi bật Badge
                                        </label>
                                        <input
                                            name="badge"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                            placeholder="VD: hot, available..."
                                            value={form.badge}
                                            onChange={handle}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Các trường mảng */}
                            <div>
                                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    Kỹ năng Cách nhau bằng dấu phẩy
                                </label>
                                <input
                                    name="skills"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                    placeholder="VD: Gym, Nutrition, Bulking"
                                    value={form.skills}
                                    onChange={handle}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    Các chứng chỉ Cách nhau bằng dấu phẩy
                                </label>
                                <textarea
                                    name="certifications"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                    rows={2}
                                    placeholder="VD: NASM Certified, Cử nhân thể chất..."
                                    value={form.certifications}
                                    onChange={handle}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    Môn giảng dạy Cách nhau bằng dấu phẩy
                                </label>
                                <textarea
                                    name="teaching"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                    rows={2}
                                    placeholder="VD: Bodybuilding Advanced, Strength Training..."
                                    value={form.teaching}
                                    onChange={handle}
                                />
                            </div>

                            <div>
                                <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                    Tiểu sử & Giới thiệu
                                </label>
                                <textarea
                                    name="bio"
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                    rows={3}
                                    placeholder="Mô tả triết lý huấn luyện..."
                                    value={form.bio}
                                    onChange={handle}
                                />
                            </div>

                            {editing && (
                                <div>
                                    <label className="mb-1.5 block text-[10px] font-black uppercase tracking-wider text-slate-500">
                                        Cập nhật ảnh đại diện
                                    </label>
                                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="cursor-pointer text-xs text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-red-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-red-600 hover:file:bg-red-100"
                                            onChange={e => setFile(e.target.files[0])}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="mt-6 flex justify-end gap-3 border-t border-slate-200 pt-5">
                                <button
                                    type="button"
                                    onClick={() => setModal(false)}
                                    className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                                >
                                    Hủy
                                </button>

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="rounded-xl bg-red-600 px-8 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving ? 'Đang lưu...' : (editing ? 'Lưu thay đổi' : 'Thêm huấn luyện viên')}
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