import { useEffect, useState } from 'react'
import { Check, Minus, Save, ShieldCheck, UserCog } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../../api/axios'

const actions = [
    { key: 'view', label: 'Xem' },
    { key: 'create', label: 'Thêm' },
    { key: 'edit', label: 'Sửa' },
    { key: 'delete', label: 'Xóa' },
    { key: 'assign', label: 'Phân công' },
]

const ToggleCell = ({ enabled, onClick }) => (
    <td className="text-center">
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                enabled
                    ? 'bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20'
                    : 'bg-zinc-900 text-zinc-700 border-zinc-800 hover:text-zinc-300 hover:border-zinc-700'
            }`}
            title={enabled ? 'Bấm để bỏ tích' : 'Bấm để tích'}
        >
            {enabled ? <Check size={14} /> : <Minus size={14} />}
        </button>
    </td>
)

export default function PermissionsAdmin() {
    const [permissions, setPermissions] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        api.get('/permissions')
            .then(res => setPermissions(res.data))
            .catch(() => toast.error('Không tải được phân quyền'))
            .finally(() => setLoading(false))
    }, [])

    const togglePermission = (areaId, role, actionKey) => {
        setPermissions(items => items.map(area => area.id === areaId ? {
            ...area,
            roles: {
                ...area.roles,
                [role]: {
                    ...area.roles[role],
                    [actionKey]: !area.roles[role]?.[actionKey],
                },
            },
        } : area))
    }

    const savePermissions = async () => {
        setSaving(true)
        try {
            const res = await api.put('/permissions', { permissions })
            setPermissions(res.data.permissions)
            toast.success('Đã lưu phân quyền')
        } catch (err) {
            toast.error(err.response?.data?.message || 'Không lưu được phân quyền')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-white">Phân quyền</h1>
                    <p className="text-sm text-zinc-500 mt-1">Tích hoặc bỏ tích quyền thao tác theo từng vai trò</p>
                </div>
                <button
                    type="button"
                    onClick={savePermissions}
                    disabled={saving || loading}
                    className="btn-gold px-5 py-3 text-xs font-black uppercase tracking-widest inline-flex items-center gap-2"
                >
                    <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu phân quyền'}
                </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <UserCog size={18} className="text-yellow-500" />
                        <h2 className="font-black text-white uppercase text-sm tracking-widest">Admin</h2>
                    </div>
                    <p className="text-sm text-zinc-400">Mặc định được xem, thêm, sửa, xóa và phân công nhân viên trên các nghiệp vụ quản trị.</p>
                </div>
                <div className="card p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <ShieldCheck size={18} className="text-yellow-500" />
                        <h2 className="font-black text-white uppercase text-sm tracking-widest">Staff</h2>
                    </div>
                    <p className="text-sm text-zinc-400">Mặc định được xem, sửa và phân công. Có thể điều chỉnh trực tiếp bằng các ô tích bên dưới.</p>
                </div>
            </div>

            <div className="card p-0 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="tbl">
                        <thead>
                            <tr>
                                <th>Phạm vi</th>
                                {actions.map(action => <th key={`admin-${action.key}`} className="text-center">Admin: {action.label}</th>)}
                                {actions.map(action => <th key={`staff-${action.key}`} className="text-center">Staff: {action.label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? [...Array(4)].map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={11}><div className="skeleton h-5 w-full" /></td>
                                </tr>
                            )) : permissions.map(row => (
                                <tr key={row.id}>
                                    <td className="font-bold text-white">{row.label}</td>
                                    {actions.map(action => (
                                        <ToggleCell
                                            key={`a-${row.id}-${action.key}`}
                                            enabled={Boolean(row.roles.admin?.[action.key])}
                                            onClick={() => togglePermission(row.id, 'admin', action.key)}
                                        />
                                    ))}
                                    {actions.map(action => (
                                        <ToggleCell
                                            key={`s-${row.id}-${action.key}`}
                                            enabled={Boolean(row.roles.staff?.[action.key])}
                                            onClick={() => togglePermission(row.id, 'staff', action.key)}
                                        />
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
