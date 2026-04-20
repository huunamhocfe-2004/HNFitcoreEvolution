import { NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import {createPortal} from 'react-dom'
import api from '../../api/axios'
import {
    LayoutDashboard, Users, Package, CreditCard, CalendarDays,
    ShoppingBag, ClipboardList, ScanLine, LogOut, Dumbbell, Ticket, School, MessageSquare, Award, Settings, User as UserIcon, Save, X
} from 'lucide-react'
import toast from 'react-hot-toast'

const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/members', icon: Users, label: 'Hội Viên' },
    { to: '/admin/packages', icon: Package, label: 'Gói Tập' },
    { to: '/admin/subscriptions', icon: CreditCard, label: 'Đăng Ký' },
    { to: '/admin/bookings', icon: CalendarDays, label: 'Đặt Lịch' },
    { to: '/admin/classes-mgmt', icon: School, label: 'Lớp Học', roles: ['admin'] },
    { to: '/admin/products', icon: ShoppingBag, label: 'Sản Phẩm', roles: ['admin'] },
    { to: '/admin/orders', icon: ClipboardList, label: 'Đơn Hàng' },
    { to: '/admin/trainers', icon: Award, label: 'Huấn Luyện Viên' },
    { to: '/admin/feedback', icon: MessageSquare, label: 'Phản Hồi' },
    { to: '/admin/checkin', icon: ScanLine, label: 'Check-in' },
]

export default function Sidebar() {
    const { user, logout, updateUser } = useAuth()
    const navigate = useNavigate()
    const [imgError, setImgError] = useState(false)
    const [profileModal, setProfileModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [editForm, setEditForm] = useState({ name: user?.name || '', phone: user?.phone || '' })
    const [file, setFile] = useState(null)

    const handleLogout = () => { logout(); navigate('/login') }

    const handleUpdate = async (e) => {
        e.preventDefault(); setSaving(true)
        const data = new FormData()
        data.append('name', editForm.name)
        data.append('phone', editForm.phone)
        if (file) data.append('avatar', file)

        try {
            const res = await api.put('/auth/profile', data, { headers: { 'Content-Type': 'multipart/form-data' } })
            updateUser({ name: editForm.name, phone: editForm.phone, avatar: res.data.avatar || user.avatar })
            toast.success('Cập nhật hồ sơ thành công!')
            setProfileModal(false)
            setImgError(false)
        } catch (err) {
            toast.error('Lỗi khi cập nhật hồ sơ')
        } finally { setSaving(false) }
    }

    const visibleLinks = links.filter(l => !l.roles || l.roles.includes(user?.role))

    return (
        <aside className="w-64 shrink-0 flex flex-col"
            style={{ background: '#080808', borderRight: '1px solid #111', height: '100vh', position: 'sticky', top: 0 }}>

            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-8 border-b border-amber-100">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-yellow-900/20"
                    style={{ background: 'linear-gradient(135deg,#ca8a04,#eab308)' }}>
                    <Dumbbell size={20} color="#000" />
                </div>
                <div>
                    <div className="font-black text-sm text-white tracking-tighter">FITCORE</div>
                    <div className="text-[10px] font-black text-yellow-500 tracking-[0.2em] -mt-1 uppercase">Evolution</div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-2 px-3 space-y-1">
                <div className="px-3 mb-2 text-[10px] font-bold text-white uppercase tracking-widest">Quản Trị Hệ Thống</div>
                {visibleLinks.map(({ to, icon: Icon, label, end }) => (
                    <NavLink
                        key={to} to={to} end={end}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 group ${isActive ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                            }`
                        }
                    >
                        <Icon size={17} className="group-hover:scale-110 transition-transform" />
                        {label}
                    </NavLink>
                ))}
            </nav>

            {/* User info */}
            <div className="p-4 mt-auto">
                <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-black shadow-inner overflow-hidden"
                            style={{ background: 'linear-gradient(135deg,#eab308,#ca8a04)', border: '1px solid #eab308' }}>
                            {user?.avatar && !imgError ? (
                                <img 
                                    src={user.avatar} 
                                    alt={user.name} 
                                    className="w-full h-full object-cover"
                                    onError={() => setImgError(true)}
                                />
                            ) : (
                                user?.name?.[0]
                            )}
                        </div>
                        <div className="min-w-0">
                             <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                            <div className="text-[10px] font-bold text-yellow-500/80 uppercase tracking-widest">{user?.role}</div>
                        </div>
                        <button onClick={() => { setEditForm({ name: user.name, phone: user.phone }); setProfileModal(true) }} 
                            className="ml-auto p-1.5 rounded-lg text-zinc-600 hover:text-yellow-500 transition-colors">
                            <Settings size={14} />
                        </button>
                    </div>
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 justify-center text-xs font-bold py-2.5 rounded-lg bg-zinc-950 text-zinc-500 hover:text-yellow-500 hover:bg-yellow-500/5 border border-zinc-800 transition-all">
                        <LogOut size={14} /> Đăng xuất
                    </button>
                </div>
            </div>

            {profileModal && 
            createPortal(
                <div className="modal-overlay z-1000" onClick={e => e.target === e.currentTarget && setProfileModal(false)}>
                    <div className="modal-box p-6 max-w-md bg-[#0a0a0a] border border-zinc-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Cập nhật hồ sơ</h2>
                            <button onClick={() => setProfileModal(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-5">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden mb-3 flex items-center justify-center font-black text-3xl text-yellow-500">
                                    {file ? (
                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                    ) : user?.avatar ? (
                                        <img src={user.avatar} className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.[0]
                                    )}
                                </div>
                                <label className="cursor-pointer">
                                    <span className="text-[10px] font-black uppercase text-yellow-500 hover:text-yellow-400 tracking-widest">Thay đổi ảnh đại diện</span>
                                    <input type="file" hidden accept="image/*" onChange={e => setFile(e.target.files[0])} />
                                </label>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-zinc-600 uppercase mb-1.5">Họ và tên</label>
                                <input type="text" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))}
                                    className="input-dark text-sm w-full" placeholder="Nguyễn Văn A" required />
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-zinc-600 uppercase mb-1.5">Số điện thoại</label>
                                <input type="text" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))}
                                    className="input-dark text-sm w-full" placeholder="0901xxxxxx" />
                            </div>

                            <button type="submit" disabled={saving} className="w-full btn-gold py-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
                                {saving ? 'ĐANG LƯU...' : <><Save size={16} /> LƯU THAY ĐỔI</>}
                            </button>
                        </form>
                    </div>
                </div>,
                document.body
            )}
        </aside>
    )
}
