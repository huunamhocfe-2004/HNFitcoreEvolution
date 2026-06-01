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
    pending: (
      <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
        Chờ duyệt
      </span>
    ),
    approved: (
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
        Đã duyệt
      </span>
    ),
    cancelled: (
      <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
        Đã hủy
      </span>
    ),
  })[status] || (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
      {status}
    </span>
  );

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
      toast.error(
        err.response?.data?.message || "Không tải được yêu cầu tập thử",
      );
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
      toast.success(
        status === "approved" ? "Đã duyệt yêu cầu" : "Đã hủy yêu cầu",
      );
      await load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Cập nhật thất bại");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900">
            Yêu cầu tập thử
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {rows.filter((row) => row.status === "pending").length} yêu cầu đang
            chờ duyệt
          </p>
        </div>

        <button
          onClick={load}
          className="flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 shadow-sm transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Làm mới
        </button>
      </div>

      <div className="flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {tabs.map((item) => (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-colors ${
              tab === item.key
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Khách
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Số điện thoại
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Mục tiêu
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Ngày muốn tập
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Gửi lúc
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                  Hành động
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading
                ? [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={7} className="px-6 py-4">
                        <div className="h-4 w-full animate-pulse rounded bg-slate-200" />
                      </td>
                    </tr>
                  ))
                : filteredRows.map((row) => (
                    <tr
                      key={row.id}
                      className="transition-colors hover:bg-red-50/40"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                          <UserRound size={15} className="text-red-600" />
                          {row.name}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <Phone size={14} className="text-slate-400" />
                          {row.phone}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <Target size={14} className="text-slate-400" />
                          {row.goal}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-600">
                        <span className="inline-flex items-center gap-2">
                          <CalendarDays size={14} className="text-slate-400" />
                          {new Date(row.desired_date).toLocaleDateString(
                            "vi-VN",
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {new Date(row.created_at).toLocaleString("vi-VN")}
                      </td>

                      <td className="px-6 py-4">{statusBadge(row.status)}</td>

                      <td className="px-6 py-4">
                        {row.status === "pending" ? (
                          <div className="flex gap-1">
                            <button
                              onClick={() => updateStatus(row.id, "approved")}
                              disabled={updatingId === row.id}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Duyệt"
                            >
                              <CheckSquare size={15} />
                            </button>

                            <button
                              onClick={() => updateStatus(row.id, "cancelled")}
                              disabled={updatingId === row.id}
                              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Hủy"
                            >
                              <XCircle size={15} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            Đã xử lý
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}

              {!loading && filteredRows.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-6 py-12 text-center text-slate-500"
                  >
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