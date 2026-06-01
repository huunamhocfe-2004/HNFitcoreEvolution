import { useEffect, useState } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";
import { CheckSquare, XCircle, Calendar } from "lucide-react";

const statusBadge = (s) =>
  ({
    pending: (
      <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-600">
        Chờ
      </span>
    ),
    confirmed: (
      <span className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-bold text-blue-600">
        Xác nhận
      </span>
    ),
    cancelled: (
      <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
        Hủy
      </span>
    ),
    completed: (
      <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
        Hoàn thành
      </span>
    ),
  })[s] || (
    <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600">
      {s}
    </span>
  );

export default function BookingsAdmin() {
  const [bookings, setBookings] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("bookings");

  const load = () => {
    setLoading(true);
    Promise.all([api.get("/bookings"), api.get("/bookings/classes")])
      .then(([b, c]) => {
        setBookings(b.data);
        setClasses(c.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await api.patch(`/bookings/${id}/status`, { status });
    toast.success("Đã cập nhật trạng thái");
    load();
  };

  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];

  const typeColors = {
    yoga: "border border-emerald-200 bg-emerald-50 text-emerald-600",
    zumba: "border border-blue-200 bg-blue-50 text-blue-600",
    boxing: "border border-red-200 bg-red-50 text-red-600",
    crossfit: "border border-orange-200 bg-orange-50 text-orange-600",
    cycling: "border border-slate-200 bg-slate-50 text-slate-600",
    other: "border border-slate-200 bg-slate-50 text-slate-600",
  };

  return (
    <div className="space-y-6 text-slate-900">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Đặt Lịch Tập</h1>
        <p className="mt-1 text-sm text-slate-500">
          Quản lý lịch lớp học của hội viên
        </p>
      </div>

      {/* Tabs */}
      <div className="flex w-fit gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
        {["bookings", "classes"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-lg px-4 py-1.5 text-sm font-bold transition-colors ${
              tab === t
                ? "bg-red-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-red-50 hover:text-red-600"
            }`}
          >
            {t === "bookings" ? "Lịch đặt" : "Lịch lớp học"}
          </button>
        ))}
      </div>

      {tab === "bookings" && (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm shadow-slate-200/70">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Hội viên
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Chi tiết lớp
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Ngày
                  </th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    Giờ
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
                  : bookings.map((b) => (
                      <tr
                        key={b.id}
                        className="transition-colors hover:bg-red-50/40"
                      >
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-900">
                            {b.member_name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {b.member_phone}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-700">
                          {b.class_title || "—"}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {new Date(b.booking_date).toLocaleDateString("vi-VN")}
                        </td>

                        <td className="px-6 py-4 text-sm text-slate-600">
                          {b.time_slot || "—"}
                        </td>

                        <td className="px-6 py-4">{statusBadge(b.status)}</td>

                        <td className="px-6 py-4">
                          <div className="flex gap-1">
                            {b.status === "pending" && (
                              <>
                                <button
                                  onClick={() =>
                                    updateStatus(b.id, "confirmed")
                                  }
                                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-emerald-50 hover:text-emerald-600"
                                  title="Xác nhận"
                                >
                                  <CheckSquare size={14} />
                                </button>

                                <button
                                  onClick={() =>
                                    updateStatus(b.id, "cancelled")
                                  }
                                  className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                  title="Hủy"
                                >
                                  <XCircle size={14} />
                                </button>
                              </>
                            )}

                            {b.status === "confirmed" && (
                              <button
                                onClick={() => updateStatus(b.id, "completed")}
                                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600"
                                title="Hoàn thành"
                              >
                                <Calendar size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                {!loading && bookings.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-12 text-center text-slate-500"
                    >
                      Chưa có lịch đặt
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "classes" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/70 transition-all duration-300 hover:-translate-y-1 hover:border-red-200 hover:shadow-lg"
            >
              <div className="mb-3 flex items-center justify-between">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold uppercase ${
                    typeColors[c.class_type] ||
                    "border border-slate-200 bg-slate-50 text-slate-600"
                  }`}
                >
                  {c.class_type}
                </span>

                <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-500">
                  {dayNames[c.day_of_week]}
                </span>
              </div>

              <div className="font-black text-slate-900">{c.title}</div>

              <div className="mt-1 text-sm text-slate-500">
                {c.trainer_name || "Chưa phân công"}
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
                <span>
                  🕐 {c.start_time} ({c.duration_min}p)
                </span>

                <span
                  className={`font-bold ${
                    c.today_bookings >= c.max_capacity
                      ? "text-red-600"
                      : "text-emerald-600"
                  }`}
                >
                  {c.today_bookings}/{c.max_capacity} chỗ
                </span>
              </div>
            </div>
          ))}

          {!loading && classes.length === 0 && (
            <div className="col-span-full rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
              Chưa có lịch lớp học
            </div>
          )}
        </div>
      )}
    </div>
  );
}
