import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { createPortal } from 'react-dom'
import { Plus, User, Edit2, Trash2, Award, BookOpen, Eye, MapPin, DollarSign, Briefcase, CheckCircle2 } from 'lucide-react'

const EMPTY = { 
    user_id: '', specialization: '', bio: '', experience_years: 0,
    title: '', hourly_rate: '', employment_status: 'HN Fitcore', badge: '', 
    work_address: '', skills: '', certifications: '', teaching: ''
}

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
        <div className="animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white">Quản lý Huấn luyện viên (PT)</h1>
                    <p className="text-sm text-zinc-500 mt-1">Danh sách nhân sự PT chịu trách nhiệm chuyên môn</p>
                </div>
                <button onClick={() => { setEditing(null); setForm(EMPTY); setModal(true) }} className="btn-gold flex items-center gap-2 text-sm">
                    <Plus size={16} /> Thêm HLV
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {loading ? [...Array(3)].map((_, i) => <div key={i} className="skeleton h-48 rounded-2xl" />) :
                    trainers.map(t => (
                        <div key={t.id} className="card group relative overflow-hidden flex flex-col justify-between">
                            {/* Card Content */}
                            <div>
                                <div className="flex items-start gap-4">
                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 shrink-0 relative">
                                        {t.avatar ? <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" /> : 
                                        <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-900"><User size={24} /></div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-white truncate">{t.name}</h3>
                                            {t.badge && (
                                                <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-yellow-500/20 text-yellow-500 ml-2 whitespace-nowrap">
                                                    {t.badge}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-yellow-500 font-semibold truncate">{t.title || t.specialization}</p>
                                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[11px] text-zinc-400">
                                            <span className="flex items-center gap-1"><Award size={12} className="text-zinc-500" /> {t.experience_years} năm</span>
                                            <span className="flex items-center gap-1"><Briefcase size={12} className="text-zinc-500" /> {t.employment_status}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 text-xs text-zinc-500 line-clamp-2 italic">
                                    "{t.bio || 'Chưa có tiểu sử...'}"
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800/50">
                                <button onClick={() => setViewing(t)} className="flex-1 btn-ghost py-1.5 text-[11px] font-bold flex items-center justify-center gap-1.5 uppercase tracking-wider text-blue-400 hover:text-blue-300">
                                    <Eye size={12} /> Xem
                                </button>
                                <button onClick={() => openEdit(t)} className="flex-1 btn-ghost py-1.5 text-[11px] font-bold flex items-center justify-center gap-1.5 uppercase tracking-wider">
                                    <Edit2 size={12} /> Sửa
                                </button>
                                <button onClick={() => remove(t.id)} className="flex-1 py-1.5 rounded-lg border border-red-900/20 text-red-500 hover:bg-red-900/10 text-[11px] font-bold flex items-center justify-center gap-1.5 uppercase tracking-wider transition-all">
                                    <Trash2 size={12} /> Xóa
                                </button>
                            </div>
                        </div>
                    ))
                }
            </div>

            {/* POPUP XEM CHI TIẾT HLV */}
            {viewing && createPortal(
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewing(null)}>
                    <div className="modal-box max-w-2xl p-0 overflow-hidden">
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-start bg-zinc-900/50">
                            <div className="flex gap-4 items-center">
                                <img src={viewing.avatar || '/placeholder-user.jpg'} alt="avatar" className="w-20 h-20 rounded-full object-cover border-2 border-yellow-500/20" />
                                <div>
                                    <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                        {viewing.name} 
                                        {viewing.badge && <span className="px-2 py-0.5 text-[10px] uppercase font-bold rounded-full bg-yellow-500 text-black">{viewing.badge}</span>}
                                    </h2>
                                    <p className="text-yellow-500 font-medium">{viewing.title || viewing.specialization}</p>
                                    <div className="flex gap-3 mt-2 text-sm text-zinc-400">
                                        <span className="flex items-center gap-1"><Briefcase size={14}/> {viewing.employment_status}</span>
                                        <span className="flex items-center gap-1"><MapPin size={14}/> {viewing.work_address || 'Chưa cập nhật'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold text-white flex items-center gap-1 justify-end"><DollarSign size={20} className="text-yellow-500"/> {viewing.hourly_rate ? Number(viewing.hourly_rate).toLocaleString('vi-VN') : 0}đ</div>
                                <div className="text-xs text-zinc-500 uppercase tracking-wider">Mỗi giờ</div>
                            </div>
                        </div>

                        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Tiểu sử</h3>
                                <p className="text-sm text-zinc-400 leading-relaxed italic border-l-2 border-zinc-700 pl-4">"{viewing.bio || 'Chưa cập nhật'}"</p>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2"><Award size={16} className="text-yellow-500"/> Chứng chỉ</h3>
                                    <ul className="space-y-2">
                                        {parseArray(viewing.certifications).length > 0 ? parseArray(viewing.certifications).map((item, idx) => (
                                            <li key={idx} className="text-sm text-zinc-400 flex items-start gap-2"><CheckCircle2 size={14} className="text-green-500 shrink-0 mt-0.5"/> {item}</li>
                                        )) : <li className="text-sm text-zinc-600">Chưa cập nhật</li>}
                                    </ul>
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2"><BookOpen size={16} className="text-yellow-500"/> Lĩnh vực giảng dạy</h3>
                                    <ul className="space-y-2">
                                        {parseArray(viewing.teaching).length > 0 ? parseArray(viewing.teaching).map((item, idx) => (
                                            <li key={idx} className="text-sm text-zinc-400 flex items-start gap-2"><CheckCircle2 size={14} className="text-blue-500 shrink-0 mt-0.5"/> {item}</li>
                                        )) : <li className="text-sm text-zinc-600">Chưa cập nhật</li>}
                                    </ul>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Kỹ năng nổi bật</h3>
                                <div className="flex flex-wrap gap-2">
                                    {parseArray(viewing.skills).length > 0 ? parseArray(viewing.skills).map((skill, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-zinc-800 text-zinc-300 text-xs rounded-lg border border-zinc-700">{skill}</span>
                                    )) : <span className="text-sm text-zinc-600">Chưa cập nhật</span>}
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-zinc-800 text-right bg-zinc-900">
                            <button onClick={() => setViewing(null)} className="btn-ghost text-sm px-6">Đóng lại</button>
                        </div>
                    </div>
                </div>,
                document.body
            )}

            {/* POPUP THÊM / SỬA HLV */}
            {modal && createPortal(
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="modal-box max-w-2xl p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <BookOpen className="text-yellow-500" size={20} />
                            {editing ? 'Cập nhật thông tin HLV' : 'Thêm Huấn luyện viên mới'}
                        </h2>
                        <form onSubmit={submit} className="space-y-4">
                            {!editing && (
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Chọn tài khoản người dùng *</label>
                                    <select name="user_id" required className="input-dark text-sm w-full" value={form.user_id} onChange={handle}>
                                        <option value="">-- Chọn thành viên để làm PT --</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Chức danh hiển thị UI (Title) *</label>
                                    <input name="title" required className="input-dark text-sm w-full" placeholder="VD: Senior Bodybuilding Coach" value={form.title} onChange={handle} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Chuyên môn chung (Specialization)</label>
                                    <input name="specialization" required className="input-dark text-sm w-full" placeholder="VD: Gym, Yoga..." value={form.specialization} onChange={handle} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Giá thuê theo giờ (VNĐ)</label>
                                    <input name="hourly_rate" type="number" className="input-dark text-sm w-full" placeholder="VD: 500000" value={form.hourly_rate} onChange={handle} />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Trạng thái công tác</label>
                                    <select name="employment_status" className="input-dark text-sm w-full" value={form.employment_status} onChange={handle}>
                                        <option value="HN Fitcore">HN Fitcore (Nội bộ)</option>
                                        <option value="Freelancer">Freelancer (Tự do)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Cơ sở làm việc</label>
                                    <input name="work_address" className="input-dark text-sm w-full" placeholder="VD: Cơ sở 1 - Cầu Giấy" value={form.work_address} onChange={handle} />
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Kinh nghiệm (Năm)</label>
                                        <input name="experience_years" type="number" className="input-dark text-sm w-full" value={form.experience_years} onChange={handle} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Nhãn nổi bật (Badge)</label>
                                        <input name="badge" className="input-dark text-sm w-full" placeholder="VD: hot, available..." value={form.badge} onChange={handle} />
                                    </div>
                                </div>
                            </div>

                            {/* Các trường mảng */}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Kỹ năng (Cách nhau bằng dấu phẩy)</label>
                                <input name="skills" className="input-dark text-sm w-full" placeholder="VD: Gym, Nutrition, Bulking" value={form.skills} onChange={handle} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Các chứng chỉ (Cách nhau bằng dấu phẩy)</label>
                                <textarea name="certifications" className="input-dark text-sm w-full" rows={2} placeholder="VD: NASM Certified, Cử nhân thể chất..." value={form.certifications} onChange={handle} />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Môn giảng dạy (Cách nhau bằng dấu phẩy)</label>
                                <textarea name="teaching" className="input-dark text-sm w-full" rows={2} placeholder="VD: Bodybuilding Advanced, Strength Training..." value={form.teaching} onChange={handle} />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Tiểu sử & Giới thiệu</label>
                                <textarea name="bio" className="input-dark text-sm w-full" rows={3} placeholder="Mô tả triết lý huấn luyện..." value={form.bio} onChange={handle} />
                            </div>

                            {editing && (
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Cập nhật ảnh đại diện</label>
                                    <input type="file" accept="image/*" className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                                        onChange={e => setFile(e.target.files[0])}
                                    />
                                </div>
                            )}

                            <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800 mt-6">
                                <button type="button" onClick={() => setModal(false)} className="btn-ghost text-sm px-6">Hủy</button>
                                <button type="submit" disabled={saving} className="btn-gold text-sm px-8">
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