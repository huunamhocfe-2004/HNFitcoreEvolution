import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  CalendarDays,
  CheckSquare,
  Phone,
  RefreshCw,
  Target,
  UserRound,
  XCircle,
} from "lucide-react";
import api from "../../api/axios";

const statusBadge = (status) =>
  ({
    pending: <span className="badge badge-yellow">Chờ duyệt</span>,
    approved: <span className="badge badge-green">Đã duyệt</span>,
    cancelled: <span className="badge badge-red">Đã hủy</span>,
  })[status] || <span className="badge badge-gray">{status}</span>;

const tabs = [
  { key: "pending", label: "Chờ duyệt" },
  { key: "all", label: "Tất cả" },
  { key: "approved", label: "Đã duyệt" },
  { key: "cancelled", label: "Đã hủy" },
];

export default function TrialRequestsAdmin() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("pending");
  const [updatingId, setUpdatingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await api.get("/trial-requests");
      setRows(res.data);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không tải được yêu cầu tập thử");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filteredRows = useMemo(() => {
    if (tab === "all") return rows;
    return rows.filter((row) => row.status === tab);
  }, [rows, tab]);

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.patch(`/trial-requests/${id}/status`, { status });
      toast.success(status === "approved" ? "Đã duyệt yêu cầu" : "Đã hủy yêu cầu");
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-white">Yêu cầu tập thử</h1>
          <p className="mt-1 text-sm text-gray-500">
            {rows.filter((row) => row.status === "pending").length} yêu cầu đang chờ duyệt
          </p>
        </div>
        <button
          onClick={load}
          className="btn-ghost flex w-fit items-center gap-2 text-sm"
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      <div
        className="mb-4 flex w-fit gap-1 rounded-lg p-1"
        style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
      >
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === item.key
                ? "bg-yellow-500 text-black"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead>
              <tr>
                <th>Khách</th>
                <th>Số điện thoại</th>
                <th>Mục tiêu</th>
                <th>Ngày muốn tập</th>
                <th>Gửi lúc</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7}>
                        <div className="skeleton h-4 w-full" />
                      </td>
                    </tr>
                  ))
                : filteredRows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className="flex items-center gap-2 font-medium text-white">
                          <UserRound size={15} className="text-yellow-500" />
                          {row.name}
                        </div>
                      </td>
                      <td className="text-sm text-gray-300">
                        <span className="inline-flex items-center gap-2">
                          <Phone size={14} className="text-gray-500" />
                          {row.phone}
                        </span>
                      </td>
                      <td className="text-sm text-gray-300">
                        <span className="inline-flex items-center gap-2">
                          <Target size={14} className="text-gray-500" />
                          {row.goal}
                        </span>
                      </td>
                      <td className="text-sm text-gray-400">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays size={14} className="text-gray-500" />
                          {new Date(row.desired_date).toLocaleDateString("vi-VN")}
                        </span>
                      </td>
                      <td className="text-sm text-gray-500">
                        {new Date(row.created_at).toLocaleString("vi-VN")}
                      </td>
                      <td>{statusBadge(row.status)}</td>
                      <td>
                        {row.status === "pending" ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateStatus(row.id, "approved")}
                              disabled={updatingId === row.id}
                              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-green-900/20 hover:text-green-400"
                              title="Duyệt"
                            >
                              <CheckSquare size={15} />
                            </button>
                            <button
                              onClick={() => updateStatus(row.id, "cancelled")}
                              disabled={updatingId === row.id}
                              className="rounded p-1.5 text-gray-400 transition-colors hover:bg-red-900/20 hover:text-red-400"
                              title="Hủy"
                            >
                              <XCircle size={15} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-600">Đã xử lý</span>
                        )}
                      </td>
                    </tr>
                  ))}
              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-600">
                    Không có yêu cầu phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
