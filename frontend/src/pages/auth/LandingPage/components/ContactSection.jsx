import { useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import api from "../../../../api/axios";

const goalOptions = [
  "Giảm mỡ",
  "Tăng cơ",
  "Cải thiện sức khỏe",
  "Tập luyện cùng PT",
  "Làm quen phòng tập",
];

const weekDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
const monthNames = [
  "Tháng 1",
  "Tháng 2",
  "Tháng 3",
  "Tháng 4",
  "Tháng 5",
  "Tháng 6",
  "Tháng 7",
  "Tháng 8",
  "Tháng 9",
  "Tháng 10",
  "Tháng 11",
  "Tháng 12",
];

const padDatePart = (value) => String(value).padStart(2, "0");

const toDateValue = (date) => {
  const year = date.getFullYear();
  const month = padDatePart(date.getMonth() + 1);
  const day = padDatePart(date.getDate());
  return `${year}-${month}-${day}`;
};

const parseDateValue = (value) => {
  if (!value) return null;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;

  return new Date(year, month - 1, day);
};

const formatDisplayDate = (value) => {
  if (!value) return "Chọn ngày tập thử";

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

const getCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const mondayBasedStartIndex = (firstDayOfMonth.getDay() + 6) % 7;
  const totalCells = Math.ceil((mondayBasedStartIndex + lastDayOfMonth.getDate()) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - mondayBasedStartIndex + 1;
    const date = new Date(year, month, dayNumber);

    return {
      date,
      value: toDateValue(date),
      isCurrentMonth: date.getMonth() === month,
    };
  });
};

export default function ContactSection({ contactRef, contactVisible }) {
  const dropdownRef = useRef(null);
  const datePickerRef = useRef(null);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    goal: goalOptions[0],
    desired_date: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [goalOpen, setGoalOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const calendarDays = useMemo(() => getCalendarDays(visibleMonth), [visibleMonth]);
  const todayValue = useMemo(() => toDateValue(new Date()), []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleGoalSelect = (goal) => {
    setForm((prev) => ({ ...prev, goal }));
    setGoalOpen(false);
  };

  const handleDateSelect = (value) => {
    setForm((prev) => ({ ...prev, desired_date: value }));
    setDateOpen(false);
  };

  const goToPreviousMonth = () => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1));
  };

  const openDateDropdown = () => {
    const selectedDate = parseDateValue(form.desired_date);

    if (selectedDate) {
      setVisibleMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    }

    setDateOpen((prev) => !prev);
    setGoalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setGoalOpen(false);
      }

      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setDateOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setGoalOpen(false);
        setDateOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const submitTrialRequest = async (e) => {
    e.preventDefault();

    if (!form.desired_date) {
      toast.error("Vui lòng chọn ngày tập thử");
      return;
    }

    setSubmitting(true);
    try {
      await api.post("/trial-requests", form);
      toast.success("Đã gửi yêu cầu tập thử");
      setForm({
        name: "",
        phone: "",
        goal: goalOptions[0],
        desired_date: "",
      });
    } catch (err) {
      toast.error(err.response?.data?.message || "Không gửi được yêu cầu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      ref={contactRef}
      id="contact"
      className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-10"
    >
      <div
        className={`relative overflow-visible rounded-4xl border border-white/10 bg-linear-to-br from-[#4a4545] to-[#2d2a2a] p-8 shadow-2xl transition-all duration-700 sm:p-10 lg:grid lg:grid-cols-2 lg:gap-16 lg:p-14 ${
          contactVisible
            ? "translate-y-0 scale-100 opacity-100"
            : "translate-y-20 scale-0 opacity-0"
        }`}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-red-600/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-black/40 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center">
          <div className="inline-flex items-center gap-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <p className="text-sm font-bold uppercase tracking-[0.24em] text-red-400">
              Tập thử tại HN Fitcore
            </p>
          </div>

          <h2 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Đăng ký một buổi tập thử cùng{" "}
            <span className="bg-linear-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
              đội ngũ Fitcore
            </span>
          </h2>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-300 italic sm:text-lg">
            Khách vãng lai để lại thông tin, admin hoặc staff sẽ duyệt yêu cầu
            và liên hệ theo số điện thoại đã đăng ký.
          </p>

          <div className="mt-8 flex flex-wrap gap-6 text-sm font-medium text-slate-400">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Tư vấn mục tiêu
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Chọn ngày tập linh hoạt
            </span>
          </div>
        </div>

        <div className="relative z-20 mt-12 flex items-center lg:mt-0">
          <div className="w-full rounded-3xl border border-white/5 bg-black/20 p-6 backdrop-blur-md sm:p-8">
            <form onSubmit={submitTrialRequest} className="flex flex-col gap-5">
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                placeholder="Họ và tên"
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white transition-all placeholder:text-slate-400 focus:border-red-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-red-500"
              />

              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                placeholder="Số điện thoại"
                required
                className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3.5 text-white transition-all placeholder:text-slate-400 focus:border-red-500 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-red-500"
              />

              <div ref={dropdownRef} className="relative">
                <input type="hidden" name="goal" value={form.goal} readOnly />
                <button
                  type="button"
                  aria-haspopup="listbox"
                  aria-expanded={goalOpen}
                  onClick={() => {
                    setGoalOpen((prev) => !prev);
                    setDateOpen(false);
                  }}
                  className={`group flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-white transition-all ${
                    goalOpen
                      ? "border-red-500 bg-[#1f1b1b] ring-1 ring-red-500"
                      : "border-white/10 bg-white/5 hover:border-red-500/70 hover:bg-white/10"
                  }`}
                >
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Mục tiêu
                    </span>
                    <span className="mt-0.5 block font-semibold text-white">
                      {form.goal}
                    </span>
                  </span>
                  <svg
                    viewBox="0 0 24 24"
                    className={`h-5 w-5 text-slate-300 transition-transform duration-200 ${
                      goalOpen ? "rotate-180 text-red-400" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {goalOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-50 overflow-hidden rounded-2xl border border-white/10 bg-[#1f1b1b]/95 p-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
                    <ul role="listbox" className="max-h-72 overflow-auto">
                      {goalOptions.map((goal) => {
                        const selected = form.goal === goal;

                        return (
                          <li key={goal} role="option" aria-selected={selected}>
                            <button
                              type="button"
                              onClick={() => handleGoalSelect(goal)}
                              className={`flex w-full items-center justify-between rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition-all ${
                                selected
                                  ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                                  : "text-slate-200 hover:bg-white/10 hover:text-white"
                              }`}
                            >
                              <span>{goal}</span>
                              {selected && (
                                <svg
                                  viewBox="0 0 24 24"
                                  className="h-[18px] w-[18px]"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M20 6 9 17l-5-5" />
                                </svg>
                              )}
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>

              <div ref={datePickerRef} className="relative">
                <input type="hidden" name="desired_date" value={form.desired_date} readOnly />

                <button
                  type="button"
                  aria-haspopup="dialog"
                  aria-expanded={dateOpen}
                  onClick={openDateDropdown}
                  className={`group flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-left text-white transition-all ${
                    dateOpen
                      ? "border-red-500 bg-[#1f1b1b] ring-1 ring-red-500"
                      : "border-white/10 bg-white/5 hover:border-red-500/70 hover:bg-white/10"
                  } focus:border-red-500 focus:bg-[#1f1b1b] focus:outline-none focus:ring-1 focus:ring-red-500`}
                >
                  <span>
                    <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                      Ngày tập thử
                    </span>
                    <span
                      className={`mt-0.5 block font-semibold ${
                        form.desired_date ? "text-white" : "text-slate-400"
                      }`}
                    >
                      {formatDisplayDate(form.desired_date)}
                    </span>
                  </span>

                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-black/20 text-red-400 transition group-hover:border-red-500/40 group-hover:bg-red-600/10">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 2v4" />
                      <path d="M16 2v4" />
                      <rect width="18" height="18" x="3" y="4" rx="2" />
                      <path d="M3 10h18" />
                    </svg>
                  </span>
                </button>

                {dateOpen && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.6rem)] z-50 rounded-2xl border border-white/10 bg-[#1f1b1b]/95 p-4 shadow-2xl shadow-black/50 backdrop-blur-xl">
                    <div className="mb-4 flex items-center justify-between">
                      <button
                        type="button"
                        onClick={goToPreviousMonth}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-red-500/50 hover:bg-red-600/10 hover:text-white"
                        aria-label="Tháng trước"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m15 18-6-6 6-6" />
                        </svg>
                      </button>

                      <div className="text-center">
                        <p className="text-sm font-bold text-white">
                          {monthNames[visibleMonth.getMonth()]} {visibleMonth.getFullYear()}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          Chọn ngày bạn muốn tập thử
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={goToNextMonth}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-slate-200 transition hover:border-red-500/50 hover:bg-red-600/10 hover:text-white"
                        aria-label="Tháng sau"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          className="h-5 w-5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      {weekDays.map((day) => (
                        <span key={day}>{day}</span>
                      ))}
                    </div>

                    <div className="mt-2 grid grid-cols-7 gap-1.5">
                      {calendarDays.map(({ date, value, isCurrentMonth }) => {
                        const selected = form.desired_date === value;
                        const today = value === todayValue;

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleDateSelect(value)}
                            className={`aspect-square rounded-xl text-sm font-semibold transition-all ${
                              selected
                                ? "bg-red-600 text-white shadow-lg shadow-red-600/25"
                                : isCurrentMonth
                                  ? "bg-white/5 text-slate-100 hover:bg-red-600/15 hover:text-white"
                                  : "text-slate-600 hover:bg-white/5 hover:text-slate-400"
                            } ${today && !selected ? "ring-1 ring-red-500/50" : ""}`}
                          >
                            {date.getDate()}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
                      <button
                        type="button"
                        onClick={() => handleDateSelect(todayValue)}
                        className="rounded-xl px-3 py-2 text-xs font-bold text-red-400 transition hover:bg-red-600/10 hover:text-red-300"
                      >
                        Hôm nay
                      </button>
                      <button
                        type="button"
                        onClick={() => setDateOpen(false)}
                        className="rounded-xl px-3 py-2 text-xs font-bold text-slate-300 transition hover:bg-white/10 hover:text-white"
                      >
                        Đóng
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-4 text-base font-semibold text-white transition-all duration-200 hover:bg-red-500 hover:shadow-lg hover:shadow-red-600/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Đang gửi..." : "Gửi yêu cầu tập thử"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
