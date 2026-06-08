// src/components/common/AppDatePicker.jsx

import { useEffect, useMemo, useRef, useState } from "react";

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

const formatDisplayDate = (value, placeholder) => {
  if (!value) return placeholder;

  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
};

const getCalendarDays = (monthDate) => {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const mondayBasedStartIndex = (firstDayOfMonth.getDay() + 6) % 7;

  const totalCells =
    Math.ceil((mondayBasedStartIndex + lastDayOfMonth.getDate()) / 7) * 7;

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

const normalizeLimitDate = (value) => {
  if (!value) return "";

  if (value instanceof Date) {
    return toDateValue(value);
  }

  return value;
};

export default function AppDatePicker({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = "Chọn ngày",
  helperText = "Chọn ngày",
  minDate,
  maxDate,
  disabled = false,
}) {
  const datePickerRef = useRef(null);
  const calendarRef = useRef(null);

  const [dateOpen, setDateOpen] = useState(false);
  const [dropDirection, setDropDirection] = useState("bottom");
  const [calendarMaxHeight, setCalendarMaxHeight] = useState(undefined);

  const selectedDate = parseDateValue(value);

  const [visibleMonth, setVisibleMonth] = useState(() => {
    const today = new Date();

    return selectedDate
      ? new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      : new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const calendarDays = useMemo(
    () => getCalendarDays(visibleMonth),
    [visibleMonth]
  );

  const todayValue = useMemo(() => toDateValue(new Date()), []);

  const minValue = normalizeLimitDate(minDate);
  const maxValue = normalizeLimitDate(maxDate);

  const updateDropdownPosition = () => {
    if (!datePickerRef.current) return;

    const rect = datePickerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const gap = 12;

    const calendarHeight = calendarRef.current?.offsetHeight || 420;

    const spaceBelow = viewportHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;

    if (spaceBelow < calendarHeight && spaceAbove > spaceBelow) {
      setDropDirection("top");
      setCalendarMaxHeight(Math.max(spaceAbove, 260));
    } else {
      setDropDirection("bottom");
      setCalendarMaxHeight(Math.max(spaceBelow, 260));
    }
  };

  const openDateDropdown = () => {
    if (disabled) return;

    if (selectedDate) {
      setVisibleMonth(
        new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      );
    }

    setDateOpen((prev) => !prev);
  };

  const handleDateSelect = (dateValue) => {
    onChange?.({
      target: {
        name,
        value: dateValue,
        type: "date",
      },
    });

    setDateOpen(false);
  };

  const goToPreviousMonth = () => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() - 1, 1)
    );
  };

  const goToNextMonth = () => {
    setVisibleMonth(
      (current) => new Date(current.getFullYear(), current.getMonth() + 1, 1)
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(event.target)
      ) {
        setDateOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
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

  useEffect(() => {
    if (!dateOpen) return;

    const handleUpdate = () => {
      updateDropdownPosition();
    };

    const timer = setTimeout(handleUpdate, 0);

    window.addEventListener("resize", handleUpdate);
    window.addEventListener("scroll", handleUpdate, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", handleUpdate);
      window.removeEventListener("scroll", handleUpdate, true);
    };
  }, [dateOpen, visibleMonth]);

  return (
    <div ref={datePickerRef} className="relative overflow-visible">
      <style>
        {`
          @keyframes appDatePickerFadeInBottom {
            from {
              opacity: 0;
              transform: translateY(-8px) scale(0.97);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes appDatePickerFadeInTop {
            from {
              opacity: 0;
              transform: translateY(8px) scale(0.97);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }
        `}
      </style>

      {label && (
        <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-500">
          {label} {required && "*"}
        </label>
      )}

      <input type="hidden" name={name} value={value || ""} readOnly />

      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={dateOpen}
        disabled={disabled}
        onClick={openDateDropdown}
        className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
          dateOpen
            ? "border-red-500 bg-white ring-1 ring-red-500/40"
            : "border-slate-200 bg-slate-50 hover:border-red-500/70 hover:bg-red-50"
        }`}
      >
        <span>
          <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            {label || "Ngày"}
          </span>

          <span
            className={`mt-0.5 block text-sm font-semibold ${
              value ? "text-slate-900" : "text-slate-400"
            }`}
          >
            {formatDisplayDate(value, placeholder)}
          </span>
        </span>

        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-red-500 transition group-hover:border-red-500/40 group-hover:bg-red-50">
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
        <div
          ref={calendarRef}
          role="dialog"
          className={`absolute left-0 right-0 z-[9999] rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl shadow-black/20 backdrop-blur-xl ${
            dropDirection === "top"
              ? "bottom-[calc(100%+0.6rem)]"
              : "top-[calc(100%+0.6rem)]"
          }`}
          style={{
            maxHeight: calendarMaxHeight,
            overflowY: "auto",
            animation:
              dropDirection === "top"
                ? "appDatePickerFadeInTop 0.18s ease-out"
                : "appDatePickerFadeInBottom 0.18s ease-out",
            transformOrigin:
              dropDirection === "top" ? "bottom left" : "top left",
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-500/50 hover:bg-red-50 hover:text-red-600"
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
              <p className="text-sm font-bold text-slate-900">
                {monthNames[visibleMonth.getMonth()]}{" "}
                {visibleMonth.getFullYear()}
              </p>
              <p className="mt-0.5 text-xs text-slate-400">{helperText}</p>
            </div>

            <button
              type="button"
              onClick={goToNextMonth}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:border-red-500/50 hover:bg-red-50 hover:text-red-600"
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
            {calendarDays.map(({ date, value: dateValue, isCurrentMonth }) => {
              const selected = value === dateValue;
              const today = dateValue === todayValue;

              const outOfMin = minValue && dateValue < minValue;
              const outOfMax = maxValue && dateValue > maxValue;
              const dateDisabled = outOfMin || outOfMax;

              return (
                <button
                  key={dateValue}
                  type="button"
                  disabled={dateDisabled}
                  onClick={() => handleDateSelect(dateValue)}
                  className={`aspect-square rounded-xl text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-30 ${
                    selected
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/25"
                      : isCurrentMonth
                        ? "bg-slate-50 text-slate-700 hover:bg-red-50 hover:text-red-600"
                        : "text-slate-300 hover:bg-slate-50 hover:text-slate-500"
                  } ${today && !selected ? "ring-1 ring-red-500/50" : ""}`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
            <button
              type="button"
              onClick={() => handleDateSelect(todayValue)}
              className="rounded-xl px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-50"
            >
              Hôm nay
            </button>

            <button
              type="button"
              onClick={() => setDateOpen(false)}
              className="rounded-xl px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-900 hover:text-white"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
}