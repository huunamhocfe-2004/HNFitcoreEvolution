import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AdminLayout() {
    return (
        <div className="flex min-h-screen" style={{ background: '#fff' }}>
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
                <div className="p-6 fade-in">
                    <Outlet />
                </div>
            </main>
        </div>
    )
}
