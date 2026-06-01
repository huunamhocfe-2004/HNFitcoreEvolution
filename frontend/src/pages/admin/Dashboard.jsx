import { useEffect, useState } from 'react'
import api from '../../api/axios'
import {
    Users, UserCheck, UserX, TrendingUp, ShoppingCart, ScanLine, Package, AlertTriangle
} from 'lucide-react'
import {
    Chart as ChartJS, CategoryScale, LinearScale, BarElement,
    LineElement, PointElement, ArcElement, Tooltip, Legend, Filler
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Tooltip, Legend, Filler)

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 transition-all duration-300 group hover:-translate-y-1 hover:border-red-200 hover:shadow-lg">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon size={48} color={color} />
        </div>

        <div className="relative z-10 flex flex-col h-full">
            <div
                className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{
                    background: `${color}15`,
                    border: `1px solid ${color}30`,
                }}
            >
                <Icon size={18} color={color} />
            </div>

            <div className="text-3xl font-bold text-slate-900 tracking-tighter mb-1">
                {value ?? '—'}
            </div>

            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                {label}
            </div>

            {sub && (
                <div
                    className="text-[10px] mt-2 font-bold px-2 py-0.5 rounded-full bg-slate-50 border border-slate-200 w-fit"
                    style={{ color }}
                >
                    {sub}
                </div>
            )}
        </div>
    </div>
)

export default function Dashboard() {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        api.get('/dashboard/stats').then(r => setStats(r.data)).finally(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="space-y-6">
            <div className="h-8 w-48 rounded-xl bg-slate-200 animate-pulse" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                    <div
                        key={i}
                        className="h-32 rounded-2xl bg-slate-200 animate-pulse"
                    />
                ))}
            </div>
        </div>
    )

    const revenueData = {
        labels: stats?.monthlyRevenue?.map(r => r.month) || [],
        datasets: [{
            label: 'Doanh thu',
            data: stats?.monthlyRevenue?.map(r => r.revenue) || [],
            backgroundColor: 'rgba(239,68,68,0.12)',
            borderColor: '#ef4444',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#ef4444',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
        }]
    }

    const packageData = {
        labels: stats?.packageDist?.map(p => p.title) || [],
        datasets: [{
            data: stats?.packageDist?.map(p => p.count) || [],
            backgroundColor: ['#ef4444', '#f97316', '#3b82f6', '#22c55e', '#a855f7'],
            borderWidth: 2,
            borderColor: '#fff',
        }]
    }

    return (
        <div className="space-y-8 pb-10 text-slate-900">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 italic tracking-tighter uppercase">
                        Hệ Thống Quản Trị
                    </h1>
                    <p className="text-xs font-bold text-slate-500 tracking-widest uppercase mt-1">
                        Hệ sinh thái HN Fitcore Evolution
                    </p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Tổng hội viên" value={stats?.total_members} color="#ef4444" />
                <StatCard icon={UserCheck} label="Đang hoạt động" value={stats?.active_members} color="#22c55e" />
                <StatCard icon={UserX} label="Hết hạn" value={stats?.expired_members} color="#dc2626" />
                <StatCard icon={TrendingUp} label="DT tháng này" value={stats?.revenue_month ? `${(Number(stats.revenue_month) / 1000000).toFixed(1)}M₫` : '0M₫'} color="#3b82f6" />
                <StatCard icon={Users} label="Hội viên mới" value={stats?.new_members_month} color="#a855f7" sub="TRONG THÁNG" />
                <StatCard icon={ScanLine} label="Check-in hôm nay" value={stats?.checkins_today} color="#f97316" />
                <StatCard icon={ShoppingCart} label="Đơn chờ xử lý" value={stats?.orders_pending} color="#ec4899" />
                <StatCard icon={Package} label="Sản phẩm đang bán" value={stats?.total_products} color="#14b8a6" />
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-3 gap-6">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 lg:col-span-2">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        BIỂU ĐỒ DOANH THU 6 THÁNG
                    </h3>

                    <div className="h-75">
                        <Bar
                            data={revenueData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: { display: false },
                                },
                                scales: {
                                    x: {
                                        grid: { display: false },
                                        ticks: {
                                            color: '#64748b',
                                            font: { size: 10, weight: 'bold' },
                                        },
                                    },
                                    y: {
                                        grid: { color: '#e5e7eb' },
                                        ticks: {
                                            color: '#64748b',
                                            font: { size: 10, weight: 'bold' },
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                        PHÂN BỔ GÓI TẬP
                    </h3>

                    <div className="h-75 flex items-center">
                        <Doughnut
                            data={packageData}
                            options={{
                                maintainAspectRatio: false,
                                plugins: {
                                    legend: {
                                        position: 'bottom',
                                        labels: {
                                            color: '#475569',
                                            font: { size: 10, weight: 'bold' },
                                            padding: 20,
                                            usePointStyle: true,
                                        },
                                    },
                                },
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* Expiring Soon */}
            {stats?.expiringSoon?.length > 0 && (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
                    <div className="p-6 border-b border-slate-200 flex items-center gap-2 text-red-600">
                        <AlertTriangle size={18} />
                        <h3 className="text-xs font-black uppercase tracking-widest">
                            Hội viên sắp hết hạn (7 ngày tới)
                        </h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Hội viên
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Số điện thoại
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Ngày hết hạn
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                                        Thao tác
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100">
                                {stats.expiringSoon.map((m, i) => (
                                    <tr key={i} className="hover:bg-red-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                                            {m.name}
                                        </td>
                                        <td className="px-6 py-4 text-slate-500 font-medium">
                                            {m.phone}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-slate-900 font-bold text-xs">
                                                {new Date(m.end_date).toLocaleDateString('vi-VN')}
                                            </div>
                                            <div className={`text-[10px] font-bold ${m.days_left <= 3 ? 'text-red-500' : 'text-orange-500'}`}>
                                                CÒN {m.days_left} NGÀY
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <button className="text-[10px] font-black text-red-600 hover:text-red-500 transition-colors">
                                                GIA HẠN NGAY
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}