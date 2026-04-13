import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { Dumbbell, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
    const [form, setForm] = useState({ email: '', password: '' })
    const [showPw, setShowPw] = useState(false)
    const [loading, setLoading] = useState(false)
    const { login } = useAuth()
    const navigate = useNavigate()

    const handle = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

    const submit = async e => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data } = await api.post('/auth/login', form)
            login(data.user, data.token)
            toast.success(`Chào mừng, ${data.user.name}!`)
            navigate(data.user.role === 'member' ? '/member' : '/')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Đăng nhập thất bại')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4"
            style={{
                background: 'linear-gradient(135deg, #0a0a0a 0%, #111 50%, #0f0a00 100%)',
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(234,179,8,0.06) 0%, transparent 50%),
                          radial-gradient(circle at 80% 30%, rgba(220,38,38,0.06) 0%, transparent 50%)`
            }}>

            {/* Card */}
            <div className="card w-full max-w-md fade-in" style={{ borderColor: '#2a2a2a' }}>

                {/* Logo */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 rounded-xl flex items-center justify-center mb-4"
                        style={{ background: 'linear-gradient(135deg,#ca8a04,#eab308)', boxShadow: '0 0 32px rgba(234,179,8,0.3)' }}>
                        <Dumbbell size={30} color="#000" />
                    </div>
                    <h1 className="text-2xl font-black text-white tracking-wide">HN FITCORE</h1>
                    <p className="text-sm mt-1" style={{ color: '#eab308' }}>EVOLUTION GYM MANAGEMENT</p>
                </div>

                <form onSubmit={submit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Email</label>
                        <div className="relative">
                            <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                name="email" type="email" required
                                className="input-dark pl-10!"
                                placeholder="admin@fitcore.vn"
                                value={form.email} onChange={handle}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1.5 uppercase tracking-wider">Mật khẩu</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                            <input
                                name="password" type={showPw ? 'text' : 'password'} required
                                className="input-dark pl-10! pr-10!"
                                placeholder="••••••••"
                                value={form.password} onChange={handle}
                            />
                            <button type="button" onClick={() => setShowPw(p => !p)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300">
                                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" disabled={loading} className="btn-gold w-full mt-2 py-3 text-sm">
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                {/* Demo credentials */}
                <div className="mt-6 p-3 rounded-lg text-xs space-y-1" style={{ background: '#0f0f0f', border: '1px solid #222' }}>
                    <div className="font-semibold text-gray-500 mb-2">Tài khoản demo:</div>
                    <div className="text-gray-400">Admin: <span className="text-yellow-400">admin@fitcore.vn</span></div>
                    <div className="text-gray-400">Staff: <span className="text-yellow-400">staff@fitcore.vn</span></div>
                    <div className="text-gray-400">Member: <span className="text-yellow-400">mai@gmail.com</span></div>
                    <div className="text-gray-400">Mật khẩu: <span className="text-yellow-400">password</span></div>
                </div>
            </div>
        </div>
    )
}
