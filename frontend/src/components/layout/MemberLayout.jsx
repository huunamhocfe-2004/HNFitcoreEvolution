import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { User, TrendingUp, ShoppingBag, CalendarDays, LogOut, Dumbbell, ClipboardList, BookOpen, Settings, Save, X } from 'lucide-react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { useState } from 'react'

const links = [
    { to: '/member', icon: User, label: 'Hồ Sơ', end: true },
    { to: '/member/progress', icon: TrendingUp, label: 'Tiến Độ' },
    { to: '/member/workout-logs', icon: BookOpen, label: 'Nhật Ký' },
    { to: '/member/store', icon: ShoppingBag, label: 'Cửa Hàng' },
    { to: '/member/member-orders', icon: ClipboardList, label: 'Đơn Hàng' },
    { to: '/member/booking', icon: CalendarDays, label: 'Đặt Lịch' },
    { to: '/member/hire-pt', icon: User, label: 'Thuê PT' },
]

export default function MemberLayout() {
    const { user, logout, updateUser } = useAuth()
    const navigate = useNavigate()
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
        } catch (err) {
            toast.error('Lỗi khi cập nhật hồ sơ')
        } finally { setSaving(false) }
    }

    return (
        <div className="flex min-h-screen" style={{ background: '#0a0a0a' }}>
            {/* Mobile top nav / Desktop sidebar */}
            {/* Desktop sidebar */}
            <aside className="hidden md:flex w-64 flex-col shrink-0"
                style={{ background: '#080808', borderRight: '1px solid #111', height: '100vh', position: 'sticky', top: 0 }}>

                <div className="flex items-center gap-3 px-6 py-8">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center shadow-lg shadow-red-900/20"
                        style={{ background: 'linear-gradient(135deg,#b91c1c,#ef4444)' }}>
                        <Dumbbell size={20} color="#fff" />
                    </div>
                    <div>
                        <div className="font-black text-sm text-white tracking-tighter">FITCORE</div>
                        <div className="text-[10px] font-black text-red-500 tracking-[0.2em] -mt-1">EVOLUTION</div>
                    </div>
                </div>

                <nav className="flex-1 py-4 px-3 space-y-1">
                    <div className="px-3 mb-2 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Menu Chính</div>
                    {links.map(({ to, icon: Icon, label, end }) => (
                        <NavLink key={to} to={to} end={end}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-200 group ${isActive ? 'bg-red-500/10 text-red-500 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]' : 'text-zinc-500 hover:text-white hover:bg-zinc-900'
                                }`
                            }>
                            <Icon size={18} className="group-hover:scale-110 transition-transform" /> {label}
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 mt-auto">
                    <div className="rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-4">
                        <div className="flex items-center gap-3 mb-4">
                             <div className="w-10 h-10 rounded-lg flex items-center justify-center font-black text-white shadow-inner overflow-hidden"
                                style={{ background: 'linear-gradient(135deg,#1f1f1f,#0a0a0a)', border: '1px solid #333' }}>
                                {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user?.name?.[0]}
                            </div>
                            <div className="min-w-0">
                                <div className="text-sm font-bold text-white truncate">{user?.name}</div>
                                <div className="text-[10px] font-bold text-red-500/80 uppercase">Hội viên Pro</div>
                            </div>
                            <button onClick={() => { setEditForm({ name: user.name, phone: user.phone }); setProfileModal(true) }} 
                                className="ml-auto p-1.5 rounded-lg text-zinc-600 hover:text-red-500 transition-colors">
                                <Settings size={14} />
                            </button>
                        </div>
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 justify-center text-xs font-bold py-2.5 rounded-lg bg-zinc-950 text-zinc-500 hover:text-red-500 hover:bg-red-500/5 border border-zinc-800 transition-all">
                            <LogOut size={14} /> Đăng xuất
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile bottom nav */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex"
                style={{ background: '#111', borderTop: '1px solid #1f1f1f' }}>
                {links.map(({ to, icon: Icon, label, end }) => (
                    <NavLink key={to} to={to} end={end}
                        className={({ isActive }) =>
                            `flex-1 flex flex-col items-center py-2 text-xs gap-1 transition-colors ${isActive ? 'text-yellow-400' : 'text-gray-500'
                            }`
                        }>
                        <Icon size={18} /> <span>{label}</span>
                    </NavLink>
                ))}
                <button onClick={handleLogout} className="flex-1 flex flex-col items-center py-2 text-xs gap-1 text-gray-500">
                    <LogOut size={18} /> <span>Thoát</span>
                </button>
            </div>

            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
                <div className="p-4 md:p-6 fade-in">
                    <Outlet />
                </div>
            </main>

            {profileModal && (
                <div className="modal-overlay z-[1000]" onClick={e => e.target === e.currentTarget && setProfileModal(false)}>
                    <div className="modal-box p-6 max-w-md bg-[#0a0a0a] border border-zinc-800">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-black text-white uppercase italic tracking-tight">Cập nhật hồ sơ</h2>
                            <button onClick={() => setProfileModal(false)} className="text-zinc-500 hover:text-white"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleUpdate} className="space-y-5">
                            <div className="flex flex-col items-center mb-6">
                                <div className="w-24 h-24 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden mb-3 flex items-center justify-center font-black text-3xl text-red-500">
                                    {file ? (
                                        <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" />
                                    ) : user?.avatar ? (
                                        <img src={user.avatar} className="w-full h-full object-cover" />
                                    ) : (
                                        user?.name?.[0]
                                    )}
                                </div>
                                <label className="cursor-pointer">
                                    <span className="text-[10px] font-black uppercase text-red-500 hover:text-red-400 tracking-widest">Thay đổi ảnh đại diện</span>
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

                            <button type="submit" disabled={saving} className="w-full btn-red py-3 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest">
                                {saving ? 'ĐANG LƯU...' : <><Save size={16} /> LƯU THAY ĐỔI</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
