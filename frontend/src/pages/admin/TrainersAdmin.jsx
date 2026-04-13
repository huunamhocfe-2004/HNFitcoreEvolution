import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Plus, User, Edit2, Trash2, Award, BookOpen } from 'lucide-react'

const EMPTY = { user_id: '', specialization: '', bio: '', experience_years: 0 }

export default function TrainersAdmin() {
    const [trainers, setTrainers] = useState([])
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editing, setEditing] = useState(null)
    const [saving, setSaving] = useState(false)
    const [file, setFile] = useState(null)

    const load = async () => {
        setLoading(true)
        try {
            const [tRes, uRes] = await Promise.all([
                api.get('/trainers'),
                api.get('/members') // Reusing /members to get all users or we might need a dedicated user list
            ])
            setTrainers(tRes.data)
            // Filter users who are not already trainers if not editing
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
            experience_years: t.experience_years || 0
        })
        setModal(true)
    }

    const submit = async e => {
        e.preventDefault(); setSaving(true)
        const data = new FormData()
        Object.keys(form).forEach(k => data.append(k, form[k]))
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
                        <div key={t.id} className="card group relative overflow-hidden">
                            <div className="flex items-start gap-4">
                                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 flex-shrink-0">
                                    {t.avatar ? <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" /> : 
                                    <div className="w-full h-full flex items-center justify-center text-zinc-700 bg-zinc-900"><User size={24} /></div>}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-white truncate">{t.name}</h3>
                                    <p className="text-xs text-yellow-500 font-semibold">{t.specialization}</p>
                                    <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
                                        <Award size={12} className="text-zinc-600" /> {t.experience_years} năm kinh nghiệm
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 text-xs text-zinc-500 line-clamp-3 italic">
                                "{t.bio || 'Chưa có tiểu sử...'}"
                            </div>
                            <div className="flex gap-2 mt-4 pt-4 border-t border-zinc-800/50">
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

            {modal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="modal-box max-w-lg p-6">
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
                                            <option key={u.user_id} value={u.user_id}>{u.name} ({u.email})</option>
                                        ))}
                                    </select>
                                    <p className="text-[10px] text-zinc-500 mt-1 italic">* Phải có tài khoản người dùng trước khi phân vai trò PT</p>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Chuyên môn (Ví dụ: Body Building, Yoga, Boxing...)</label>
                                <input name="specialization" required className="input-dark text-sm w-full" placeholder="Nhập chuyên môn chính" value={form.specialization} onChange={handle} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Số năm kinh nghiệm</label>
                                    <input name="experience_years" type="number" className="input-dark text-sm w-full" value={form.experience_years} onChange={handle} />
                                </div>
                            </div>
                             <div>
                                <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Tiểu sử & Giới thiệu</label>
                                <textarea name="bio" className="input-dark text-sm w-full" rows={4} placeholder="Mô tả kỹ năng, thành tích hoặc triết lý huấn luyện..." value={form.bio} onChange={handle} />
                            </div>
                            {editing && (
                                <div>
                                    <label className="block text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider text-[10px]">Cập nhật ảnh đại diện</label>
                                    <input type="file" accept="image/*" className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                                        onChange={e => setFile(e.target.files[0])}
                                    />
                                </div>
                            )}
                            <div className="flex gap-3 justify-end pt-4">
                                <button type="button" onClick={() => setModal(false)} className="btn-ghost text-sm px-6">Hủy</button>
                                <button type="submit" disabled={saving} className="btn-gold text-sm px-8">
                                    {saving ? 'Đang lưu...' : (editing ? 'Lưu thay đổi' : 'Thêm huấn luyện viên')}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
