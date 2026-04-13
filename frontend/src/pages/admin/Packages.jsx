import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {createPortal} from 'react-dom'
import { Plus, Edit2, Trash2, Package } from 'lucide-react'

const EMPTY = { title: '', description: '', duration_days: 30, price: '', package_type: 'standard' }

export default function Packages() {
    const [packages, setPackages] = useState([])
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editing, setEditing] = useState(null)

    const load = () => api.get('/packages').then(r => setPackages(r.data))
    useEffect(() => { load() }, [])

    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

    const openEdit = pkg => { setEditing(pkg.id); setForm({ ...pkg }); setModal(true) }
    const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }

    const submit = async e => {
        e.preventDefault()
        try {
            if (editing) { await api.put(`/packages/${editing}`, form); toast.success('Đã cập nhật gói tập') }
            else { await api.post('/packages', form); toast.success('Đã thêm gói tập') }
            setModal(false); load()
        } catch { toast.error('Có lỗi xảy ra') }
    }

    const del = async id => {
        if (!confirm('Ẩn gói tập này?')) return
        await api.delete(`/packages/${id}`); toast.success('Đã ẩn gói tập'); load()
    }

    const typeLabels = { standard: 'Tiêu chuẩn', vip: 'VIP' }
    const typeBadge = t => ({ standard: 'badge-blue', vip: 'badge-yellow' }[t] || 'badge-gray')

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Gói Tập & Dịch Vụ</h1>
                    <p className="text-sm text-gray-500 mt-1">{packages.length} gói tập đang hoạt động</p>
                </div>
                <button onClick={openAdd} className="btn-gold flex items-center gap-2 text-sm">
                    <Plus size={15} /> Thêm gói tập
                </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {packages.map(p => (
                    <div key={p.id} className="card hover:border-yellow-600/40 transition-colors group">
                        <div className="flex items-start justify-between mb-3">
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.2)' }}>
                                <Package size={18} color="#eab308" />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-white/10 text-gray-500 hover:text-white">
                                    <Edit2 size={13} />
                                </button>
                                <button onClick={() => del(p.id)} className="p-1.5 rounded hover:bg-red-900/20 text-gray-500 hover:text-red-400">
                                    <Trash2 size={13} />
                                </button>
                            </div>
                        </div>
                        <div className="font-bold text-white mb-1">{p.title}</div>
                        <div className="text-xs text-gray-500 mb-3 line-clamp-2">{p.description}</div>
                        <div className="flex items-end justify-between">
                            <div>
                                <div className="text-2xl font-bold text-yellow-400">{Number(p.price).toLocaleString('vi-VN')}₫</div>
                                <div className="text-xs text-gray-600">{p.duration_days} ngày</div>
                            </div>
                            <span className={`badge ${typeBadge(p.package_type)}`}>{typeLabels[p.package_type]}</span>
                        </div>
                    </div>
                ))}
            </div>

            {modal && createPortal(
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="modal-box p-6">
                        <h2 className="text-lg font-bold text-white mb-4">{editing ? 'Cập nhật gói tập' : 'Thêm gói tập mới'}</h2>
                        <form onSubmit={submit} className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Tên gói *</label>
                                <input name="title" required className="input-dark text-sm" value={form.title} onChange={handle} />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Mô tả</label>
                                <textarea name="description" className="input-dark text-sm" rows={2} value={form.description} onChange={handle} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Thời hạn (ngày) *</label>
                                    <input name="duration_days" type="number" required min={1} className="input-dark text-sm" value={form.duration_days} onChange={handle} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Giá (₫) *</label>
                                    <input name="price" type="number" required min={0} className="input-dark text-sm" value={form.price} onChange={handle} />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Loại gói</label>
                                <select name="package_type" className="input-dark text-sm" value={form.package_type} onChange={handle}>
                                    <option value="standard">Tiêu chuẩn</option>
                                    <option value="vip">VIP</option>
                                </select>
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setModal(false)} className="btn-ghost text-sm">Hủy</button>
                                <button type="submit" className="btn-gold text-sm">{editing ? 'Lưu thay đổi' : 'Thêm gói'}</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
