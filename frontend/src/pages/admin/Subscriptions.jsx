import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Plus, CheckCircle } from 'lucide-react'

const EMPTY = { member_id: '', package_id: '', start_date: '', is_paid: false }

export default function Subscriptions() {
    const [subs, setSubs] = useState([])
    const [members, setMembers] = useState([])
    const [packages, setPackages] = useState([])
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [loading, setLoading] = useState(true)

    const load = () => {
        setLoading(true)
        Promise.all([
            api.get('/subscriptions'),
            api.get('/members'),
            api.get('/packages'),
        ]).then(([s, m, p]) => { setSubs(s.data); setMembers(m.data); setPackages(p.data) })
            .finally(() => setLoading(false))
    }
    useEffect(() => { load() }, [])

    const handle = e => {
        const { name, value, type, checked } = e.target
        setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }))
    }


    const submit = async e => {
        e.preventDefault()
        try {
            const res = await api.post('/subscriptions', form)
            toast.success(`Đã đăng ký! Hết hạn: ${new Date(res.data.end_date).toLocaleDateString('vi-VN')}`)
            setModal(false); setForm(EMPTY); load()
        } catch (err) { toast.error(err.response?.data?.message || 'Lỗi đăng ký') }
    }

    const markPaid = async id => {
        await api.put(`/subscriptions/${id}/paid`); toast.success('Đã cập nhật'); load()
    }

    const selectedPkg = packages.find(p => p.id == form.package_id)

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white">Quản lý Đăng Ký</h1>
                    <p className="text-sm text-gray-500 mt-1">{subs.length} giao dịch gói tập</p>
                </div>
                <button onClick={() => setModal(true)} className="btn-gold flex items-center gap-2 text-sm">
                    <Plus size={15} /> Đăng ký gói tập
                </button>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="tbl">
                        <thead>
                            <tr><th>Hội viên</th><th>Gói tập</th><th>Bắt đầu</th><th>Kết thúc</th><th>DT còn lại</th><th>Thanh toán</th><th>Số tiền</th><th></th></tr>
                        </thead>
                        <tbody>
                            {loading ? [...Array(5)].map((_, i) => (
                                <tr key={i}><td colSpan={8}><div className="skeleton h-4 w-full" /></td></tr>
                            )) : subs.map(s => {
                                const daysLeft = Math.ceil((new Date(s.end_date) - new Date()) / 86400000)
                                return (
                                    <tr key={s.id}>
                                        <td className="font-medium text-white">{s.member_name}</td>
                                        <td className="text-gray-300 text-sm">{s.package_title}</td>
                                        <td className="text-gray-400 text-sm">{new Date(s.start_date).toLocaleDateString('vi-VN')}</td>
                                        <td className="text-gray-400 text-sm">{new Date(s.end_date).toLocaleDateString('vi-VN')}</td>
                                        <td>
                                            <span className={`badge ${daysLeft < 0 ? 'badge-red' : daysLeft < 7 ? 'badge-yellow' : 'badge-green'}`}>
                                                {daysLeft < 0 ? 'Hết hạn' : `${daysLeft} ngày`}
                                            </span>
                                        </td>
                                        <td>
                                            {s.is_paid
                                                ? <span className="badge badge-green">Đã trả</span>
                                                : <span className="badge badge-red">Chưa trả</span>}
                                        </td>
                                        <td className="text-yellow-400 font-semibold">{Number(s.amount_paid).toLocaleString('vi-VN')}₫</td>
                                        <td>
                                            {!s.is_paid && (
                                                <button onClick={() => markPaid(s.id)}
                                                    className="p-1.5 rounded hover:bg-green-900/20 text-gray-400 hover:text-green-400 transition-colors">
                                                    <CheckCircle size={15} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="modal-box p-6">
                        <h2 className="text-lg font-bold text-white mb-4">Đăng Ký Gói Tập</h2>
                        <form onSubmit={submit} className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Hội viên *</label>
                                <select name="member_id" required className="input-dark text-sm" value={form.member_id} onChange={handle}>
                                    <option value="">-- Chọn hội viên --</option>
                                    {members.map(m => <option key={m.id} value={m.id}>{m.name} ({m.phone})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Gói tập *</label>
                                <select name="package_id" required className="input-dark text-sm" value={form.package_id} onChange={handle}>
                                    <option value="">-- Chọn gói tập --</option>
                                    {packages.map(p => <option key={p.id} value={p.id}>{p.title} – {Number(p.price).toLocaleString('vi-VN')}₫ ({p.duration_days} ngày)</option>)}
                                </select>
                            </div>
                            {selectedPkg && (
                                <div className="p-3 rounded-lg text-sm" style={{ background: '#0f0f0f', border: '1px solid #1a1a1a' }}>
                                    <div className="text-gray-400">Giá: <span className="text-yellow-400 font-semibold">{Number(selectedPkg.price).toLocaleString('vi-VN')}₫</span></div>
                                </div>
                            )}
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Ngày bắt đầu</label>
                                <input name="start_date" type="date" className="input-dark text-sm" value={form.start_date} onChange={handle} />
                            </div>
                            <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                                <input name="is_paid" type="checkbox" checked={form.is_paid} onChange={handle} className="accent-yellow-500" />
                                Đã thanh toán
                            </label>
                             <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => { setModal(false) }} className="btn-ghost text-sm">Hủy</button>
                                <button type="submit" className="btn-gold text-sm">Xác nhận đăng ký</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
