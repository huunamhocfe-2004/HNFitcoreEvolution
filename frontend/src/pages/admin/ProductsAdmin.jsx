import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import {createPortal} from 'react-dom'
import { Plus, Edit2, Trash2, Tag } from 'lucide-react'

const EMPTY = { name: '', description: '', category: 'supplement', price: '', stock_qty: '', image_url: '' }
const CATS = ['supplement', 'equipment', 'accessory', 'apparel', 'other']
const CAT_LABELS = { supplement: 'Thực phẩm', equipment: 'Dụng cụ', accessory: 'Phụ kiện', apparel: 'Trang phục', other: 'Khác' }

export default function ProductsAdmin() {
    const [products, setProducts] = useState([])
    const [modal, setModal] = useState(false)
    const [form, setForm] = useState(EMPTY)
    const [editing, setEditing] = useState(null)
    const [cat, setCat] = useState('')
    const [file, setFile] = useState(null)

    const load = () => {
        api.get(`/products${cat ? `?category=${cat}` : ''}`).then(r => setProducts(r.data))
    }
    useEffect(() => { load() }, [cat])

    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))
    const openEdit = p => { setEditing(p.id); setForm({ ...p }); setModal(true) }
    const openAdd = () => { setEditing(null); setForm(EMPTY); setModal(true) }

    const submit = async e => {
        e.preventDefault()
        const data = new FormData()
        Object.keys(form).forEach(k => {
            if (form[k] !== null && form[k] !== undefined) data.append(k, form[k])
        })
        if (file) data.append('image', file)

        try {
            if (editing) {
                await api.put(`/products/${editing}`, data, { headers: { 'Content-Type': 'multipart/form-data' } })
                toast.success('Đã cập nhật sản phẩm')
            } else {
                await api.post('/products', data, { headers: { 'Content-Type': 'multipart/form-data' } })
                toast.success('Đã thêm sản phẩm')
            }
            setModal(false); setFile(null); load()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Có lỗi xảy ra')
        }
    }

    const del = async id => {
        if (!confirm('Ẩn sản phẩm này?')) return
        await api.delete(`/products/${id}`); toast.success('Đã ẩn'); load()
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black text-white">Quản lý Sản Phẩm</h1>
                    <p className="text-sm text-gray-500 mt-1">{products.length} sản phẩm</p>
                </div>
                <button onClick={openAdd} className="btn-gold flex items-center gap-2 text-sm"><Plus size={15} /> Thêm sản phẩm</button>
            </div>

            {/* Category filter */}
            <div className="flex gap-2 mb-4 flex-wrap">
                {['', ...CATS].map(c => (
                    <button key={c} onClick={() => setCat(c)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${cat === c ? 'border-yellow-500 text-yellow-400 bg-yellow-500/10' : 'border-gray-700 text-gray-400 hover:border-gray-500'
                            }`}>
                        {c ? CAT_LABELS[c] : 'Tất cả'}
                    </button>
                ))}
            </div>

            <div className="card w-full p-0 overflow-hidden">
                <div className="max-h-[70vh] overflow-x-auto">
                    <table className="tbl w-full">
                        <thead><tr><th>Sản phẩm</th><th>Danh mục</th><th>Giá</th><th>Tồn kho</th><th>Thao tác</th></tr></thead>
                        <tbody>
                            {products.map(p => (
                                <tr key={p.id}>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center shrink-0 bg-zinc-900 border border-zinc-800">
                                                {p.image_url ? (
                                                    <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.style.display = 'none';
                                                    }} />
                                                ) : (
                                                    <Tag size={18} color="#eab308" />
                                                )}
                                            </div>
                                            <div>
                                                <div className="font-medium text-white text-sm">{p.name}</div>
                                                <div className="text-xs text-gray-600 line-clamp-1">{p.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="badge badge-blue text-xs">{CAT_LABELS[p.category]}</span></td>
                                    <td className="text-yellow-400 font-semibold">{Number(p.price).toLocaleString('vi-VN')}₫</td>
                                    <td>
                                        <span className={`font-medium ${p.stock_qty < 5 ? 'text-red-400' : 'text-green-400'}`}>
                                            {p.stock_qty} cái
                                        </span>
                                    </td>
                                    <td>
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(p)} className="p-1.5 rounded hover:bg-white/5 text-gray-400 hover:text-white"><Edit2 size={14} /></button>
                                            <button onClick={() => del(p.id)} className="p-1.5 rounded hover:bg-red-900/20 text-gray-400 hover:text-red-400"><Trash2 size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {modal && createPortal(
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setModal(false)}>
                    <div className="modal-box p-6">
                        <h2 className="text-lg font-bold text-white mb-4">{editing ? 'Cập nhật sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                        <form onSubmit={submit} className="space-y-3">
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Tên sản phẩm *</label>
                                <input name="name" required className="input-dark text-sm" value={form.name} onChange={handle} />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-500 mb-1">Mô tả</label>
                                <textarea name="description" className="input-dark text-sm" rows={2} value={form.description} onChange={handle} />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Danh mục</label>
                                    <select name="category" className="input-dark text-sm" value={form.category} onChange={handle}>
                                        {CATS.map(c => <option key={c} value={c}>{CAT_LABELS[c]}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Giá (₫) *</label>
                                    <input name="price" type="number" required min={0} className="input-dark text-sm" value={form.price} onChange={handle} />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1">Tồn kho</label>
                                    <input name="stock_qty" type="number" min={0} className="input-dark text-sm" value={form.stock_qty} onChange={handle} />
                                </div>
                                <div>
                                    <label className="block text-xs text-zinc-500 mb-1">Ảnh sản phẩm</label>
                                    <div className="flex flex-col gap-2">
                                        <input type="file" accept="image/*" className="text-xs text-zinc-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                                            onChange={e => setFile(e.target.files[0])}
                                        />
                                        {form.image_url && !file && (
                                            <div className="text-[10px] text-zinc-500 truncate">Hiện tại: {form.image_url}</div>
                                        )}
                                        {file && <div className="text-[10px] text-yellow-500 font-bold">Sẽ thay thế bằng: {file.name}</div>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3 justify-end pt-2">
                                <button type="button" onClick={() => setModal(false)} className="btn-ghost text-sm">Hủy</button>
                                <button type="submit" className="btn-gold text-sm">{editing ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</button>
                            </div>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </div>
    )
}
