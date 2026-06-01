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
    <td className="px-4 py-4 text-center">
        <button
            type="button"
            onClick={onClick}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                enabled
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-600 hover:bg-emerald-100'
                    : 'border-slate-200 bg-slate-50 text-slate-400 hover:border-slate-300 hover:bg-slate-100 hover:text-slate-600'
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
        <div className="space-y-6 text-slate-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        Phân quyền
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        Quản lý quyền truy cập của Admin và Staff theo từng nghiệp vụ
                    </p>
                </div>

                <button
                    type="button"
                    onClick={savePermissions}
                    disabled={saving || loading}
                    className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-200 transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <Save size={16} /> {saving ? 'Đang lưu...' : 'Lưu phân quyền'}
                </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50">
                            <UserCog size={18} className="text-red-600" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
                            Admin
                        </h2>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">
                        Mặc định được xem, thêm, sửa, xóa và phân công nhân viên trên các nghiệp vụ quản trị.
                    </p>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm shadow-slate-200/70">
                    <div className="mb-3 flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-200 bg-red-50">
                            <ShieldCheck size={18} className="text-red-600" />
                        </div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-slate-900">
                            Staff
                        </h2>
                    </div>
                    <p className="text-sm leading-6 text-slate-600">
                        Mặc định được xem, sửa và phân công theo phạm vi được cấp quyền.
                    </p>
                </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Phạm vi
                                </th>

                                {actions.map(action => (
                                    <th
                                        key={`admin-${action.key}`}
                                        className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500"
                                    >
                                        Admin: {action.label}
                                    </th>
                                ))}

                                {actions.map(action => (
                                    <th
                                        key={`staff-${action.key}`}
                                        className="px-4 py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-500"
                                    >
                                        Staff: {action.label}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading ? [...Array(4)].map((_, i) => (
                                <tr key={i}>
                                    <td colSpan={11} className="px-6 py-4">
                                        <div className="h-5 w-full animate-pulse rounded bg-slate-200" />
                                    </td>
                                </tr>
                            )) : permissions.map(row => (
                                <tr
                                    key={row.id}
                                    className="transition-colors hover:bg-red-50/40"
                                >
                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">
                                        {row.label}
                                    </td>

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

                            {!loading && permissions.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={11}
                                        className="px-6 py-12 text-center text-slate-500"
                                    >
                                        Chưa có dữ liệu phân quyền
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}