import { useEffect, useState } from 'react'
import api from '../../api/axios'
import toast from 'react-hot-toast'
import { createPortal } from 'react-dom'
import { Plus, CheckCircle } from 'lucide-react'

const EMPTY = {
    member_id: '',
    package_id: '',
    start_date: '',
    is_paid: false,
}

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
        ])
            .then(([s, m, p]) => {
                setSubs(s.data)
                setMembers(m.data)
                setPackages(p.data)
            })
            .finally(() => setLoading(false))
    }

    useEffect(() => {
        load()
    }, [])

    const handle = e => {
        const { name, value, type, checked } = e.target
        setForm(p => ({
            ...p,
            [name]: type === 'checkbox' ? checked : value,
        }))
    }

    const submit = async e => {
        e.preventDefault()
        try {
            const res = await api.post('/subscriptions', form)
            toast.success(
                `Đã đăng ký! Hết hạn: ${new Date(res.data.end_date).toLocaleDateString('vi-VN')}`,
            )
            setModal(false)
            setForm(EMPTY)
            load()
        } catch (err) {
            toast.error(err.response?.data?.message || 'Lỗi đăng ký')
        }
    }

    const markPaid = async id => {
        await api.put(`/subscriptions/${id}/paid`)
        toast.success('Đã cập nhật')
        load()
    }

    const selectedPkg = packages.find(p => p.id == form.package_id)

    const daysLeftBadge = daysLeft => {
        if (daysLeft < 0) {
            return (
                <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                    Hết hạn
                </span>
            )
        }

        if (daysLeft < 7) {
            return (
                <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
                    {daysLeft} ngày
                </span>
            )
        }

        return (
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                {daysLeft} ngày
            </span>
        )
    }

    return (
        <div className="space-y-6 text-slate-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-black text-slate-900">
                        Quản lý Đăng Ký
                    </h1>
                    <p className="mt-1 text-sm text-slate-500">
                        {subs.length} giao dịch gói tập
                    </p>
                </div>

                <button
                    onClick={() => setModal(true)}
                    className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
                >
                    <Plus size={15} /> Đăng ký gói tập
                </button>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-slate-200 bg-slate-50">
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Hội viên
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Gói tập
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Bắt đầu
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Kết thúc
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    DT còn lại
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Thanh toán
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                    Số tiền
                                </th>
                                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500"></th>
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {loading
                                ? [...Array(5)].map((_, i) => (
                                      <tr key={i}>
                                          <td colSpan={8} className="px-6 py-4">
                                              <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                                          </td>
                                      </tr>
                                  ))
                                : subs.map(s => {
                                      const daysLeft = Math.ceil(
                                          (new Date(s.end_date) - new Date()) /
                                              86400000,
                                      )

                                      return (
                                          <tr
                                              key={s.id}
                                              className="transition-colors hover:bg-red-50/40"
                                          >
                                              <td className="px-6 py-4 font-bold text-slate-900">
                                                  {s.member_name}
                                              </td>

                                              <td className="px-6 py-4 text-sm text-slate-700">
                                                  {s.package_title}
                                              </td>

                                              <td className="px-6 py-4 text-sm text-slate-600">
                                                  {new Date(
                                                      s.start_date,
                                                  ).toLocaleDateString('vi-VN')}
                                              </td>

                                              <td className="px-6 py-4 text-sm text-slate-600">
                                                  {new Date(
                                                      s.end_date,
                                                  ).toLocaleDateString('vi-VN')}
                                              </td>

                                              <td className="px-6 py-4">
                                                  {daysLeftBadge(daysLeft)}
                                              </td>

                                              <td className="px-6 py-4">
                                                  {s.is_paid ? (
                                                      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                                                          Đã trả
                                                      </span>
                                                  ) : (
                                                      <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                                                          Chưa trả
                                                      </span>
                                                  )}
                                              </td>

                                              <td className="px-6 py-4 font-bold text-red-600">
                                                  {Number(
                                                      s.amount_paid,
                                                  ).toLocaleString('vi-VN')}
                                                  ₫
                                              </td>

                                              <td className="px-6 py-4">
                                                  {!s.is_paid && (
                                                      <button
                                                          onClick={() =>
                                                              markPaid(s.id)
                                                          }
                                                          className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                                          title="Đánh dấu đã thanh toán"
                                                      >
                                                          <CheckCircle
                                                              size={15}
                                                          />
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

            {modal &&
                createPortal(
                    <div
                        className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                        onClick={e =>
                            e.target === e.currentTarget && setModal(false)
                        }
                    >
                        <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl">
                            <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4">
                                <div>
                                    <h2 className="text-xl font-black uppercase tracking-tight text-slate-900">
                                        Đăng Ký Gói Tập
                                    </h2>
                                    <p className="mt-1 text-sm text-slate-500">
                                        Chọn hội viên và gói tập để tạo đăng ký
                                        mới
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setModal(false)}
                                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                >
                                    ×
                                </button>
                            </div>

                            <form onSubmit={submit} className="space-y-4">
                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Hội viên *
                                    </label>
                                    <select
                                        name="member_id"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        value={form.member_id}
                                        onChange={handle}
                                    >
                                        <option value="">
                                            -- Chọn hội viên --
                                        </option>
                                        {members.map(m => (
                                            <option key={m.id} value={m.id}>
                                                {m.name} ({m.phone})
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Gói tập *
                                    </label>
                                    <select
                                        name="package_id"
                                        required
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        value={form.package_id}
                                        onChange={handle}
                                    >
                                        <option value="">
                                            -- Chọn gói tập --
                                        </option>
                                        {packages.map(p => (
                                            <option key={p.id} value={p.id}>
                                                {p.title} –{' '}
                                                {Number(
                                                    p.price,
                                                ).toLocaleString('vi-VN')}
                                                ₫ ({p.duration_days} ngày)
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {selectedPkg && (
                                    <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm">
                                        <div className="text-slate-600">
                                            Giá:{' '}
                                            <span className="font-black text-red-600">
                                                {Number(
                                                    selectedPkg.price,
                                                ).toLocaleString('vi-VN')}
                                                ₫
                                            </span>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
                                        Ngày bắt đầu
                                    </label>
                                    <input
                                        name="start_date"
                                        type="date"
                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-red-500 focus:bg-white focus:ring-1 focus:ring-red-500/30"
                                        value={form.start_date}
                                        onChange={handle}
                                    />
                                </div>

                                <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                                    <input
                                        name="is_paid"
                                        type="checkbox"
                                        checked={form.is_paid}
                                        onChange={handle}
                                        className="accent-red-600"
                                    />
                                    Đã thanh toán
                                </label>

                                <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setModal(false)
                                        }}
                                        className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-bold text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                                    >
                                        Hủy
                                    </button>

                                    <button
                                        type="submit"
                                        className="rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 transition hover:bg-red-500"
                                    >
                                        Xác nhận đăng ký
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>,
                    document.body,
                )}
        </div>
    )
}