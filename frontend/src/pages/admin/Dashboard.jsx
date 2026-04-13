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
    <div className="card relative bg-[#111] border-[#1f1f1f] p-6 group hover:border-yellow-500/30 transition-all duration-300">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
            <Icon size={48} color={color} />
        </div>
        <div className="relative z-10 flex flex-col h-full">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                <Icon size={18} color={color} />
            </div>
            <div className="text-3xl font-bold text-white tracking-tighter mb-1">{value ?? '—'}</div>
            <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</div>
            {sub && <div className="text-[10px] mt-2 font-bold px-2 py-0.5 rounded bg-zinc-950 w-fit" style={{ color }}>{sub}</div>}
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
            <div className="h-8 skeleton w-48" />
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => <div key={i} className="skeleton h-32 rounded-xl" />)}
            </div>
        </div>
    )

    const revenueData = {
        labels: stats?.monthlyRevenue?.map(r => r.month) || [],
        datasets: [{
            label: 'Doanh thu',
            data: stats?.monthlyRevenue?.map(r => r.revenue) || [],
            backgroundColor: 'rgba(234,179,8,0.1)',
            borderColor: '#eab308',
            borderWidth: 3,
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#eab308',
            pointBorderColor: '#000',
            pointBorderWidth: 2,
            pointRadius: 4,
        }]
    }

    const packageData = {
        labels: stats?.packageDist?.map(p => p.title) || [],
        datasets: [{
            data: stats?.packageDist?.map(p => p.count) || [],
            backgroundColor: ['#eab308', '#dc2626', '#3b82f6', '#22c55e', '#a855f7'],
            borderWidth: 2,
            borderColor: '#000',
        }]
    }

    return (
        <div className="space-y-8 pb-10">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white italic tracking-tighter uppercase">Hệ Thống Quản Trị</h1>
                    <p className="text-xs font-bold text-zinc-600 tracking-widest uppercase mt-1">Hệ sinh thái HN Fitcore Evolution</p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} label="Tổng hội viên" value={stats?.total_members} color="#eab308" />
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
                <div className="card lg:col-span-2 bg-[#0d0d0d] border-[#1a1a1a] p-6">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" /> BIỂU ĐỒ DOANH THU 6 THÁNG
                    </h3>
                    <div className="h-[300px]">
                        <Bar data={revenueData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false }, ticks: { color: '#444', font: { size: 10, weight: 'bold' } } }, y: { grid: { color: '#111' }, ticks: { color: '#444', font: { size: 10, weight: 'bold' } } } } }} />
                    </div>
                </div>
                <div className="card bg-[#0d0d0d] border-[#1a1a1a] p-6">
                    <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" /> PHÂN BỔ GÓI TẬP
                    </h3>
                    <div className="h-[300px] flex items-center">
                        <Doughnut data={packageData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#666', font: { size: 10, weight: 'bold' }, padding: 20, usePointStyle: true } } } }} />
                    </div>
                </div>
            </div>

            {/* Expiring Soon */}
            {stats?.expiringSoon?.length > 0 && (
                <div className="card bg-[#0d0d0d] border-[#1a1a1a] p-0 overflow-hidden">
                    <div className="p-6 border-b border-zinc-900 flex items-center gap-2 text-yellow-500">
                        <AlertTriangle size={18} />
                        <h3 className="text-xs font-black uppercase tracking-widest">Hội viên sắp hết hạn (7 ngày tới)</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="tbl">
                            <thead>
                                <tr className="bg-zinc-950/50">
                                    <th className="!text-[10px] font-black uppercase tracking-widest">Hội viên</th>
                                    <th className="!text-[10px] font-black uppercase tracking-widest">Số điện thoại</th>
                                    <th className="!text-[10px] font-black uppercase tracking-widest">Ngày hết hạn</th>
                                    <th className="!text-[10px] font-black uppercase tracking-widest">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.expiringSoon.map((m, i) => (
                                    <tr key={i} className="hover:bg-zinc-900/10">
                                        <td className="font-bold text-white text-sm">{m.name}</td>
                                        <td className="text-zinc-500 font-medium">{m.phone}</td>
                                        <td>
                                            <div className="text-white font-bold text-xs">{new Date(m.end_date).toLocaleDateString('vi-VN')}</div>
                                            <div className={`text-[10px] font-bold ${m.days_left <= 3 ? 'text-red-500' : 'text-yellow-500'}`}>CÒN {m.days_left} NGÀY</div>
                                        </td>
                                        <td>
                                            <button className="text-[10px] font-black text-yellow-500 hover:text-white transition-colors">GIA HẠN NGAY</button>
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
