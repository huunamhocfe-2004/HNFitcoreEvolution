import { useEffect, useRef, useState } from "react";

export default function GenderDropdown({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const options = [
    { value: "male", label: "Nam" },
    { value: "female", label: "Nữ" },
  ];

  const selected = options.find((item) => item.value === value) || options[0];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`group flex w-full items-center justify-between rounded-[22px] border px-4 py-3.5 text-left transition-all duration-300 ${
          open
            ? "border-red-500 bg-white shadow-[0_12px_30px_rgba(239,68,68,0.12)]"
            : "border-slate-200 bg-white hover:border-red-500/60 hover:bg-red-50"
        }`}
      >
        <span className="text-sm font-semibold text-slate-900">
          {selected.label}
        </span>

        <svg
          className={`h-4 w-4 shrink-0 text-slate-400 transition-all duration-300 ${
            open ? "rotate-180 text-violet-300" : "group-hover:text-slate-900"
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.4}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <div
        className={`absolute left-0 right-0 top-[calc(100%+12px)] z-30 origin-top overflow-hidden rounded-3xl border border-slate-200 bg-white text-slate-900 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition-all duration-300 ${
          open
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none -translate-y-2 scale-95 opacity-0"
        }`}
      >
        <div className="p-2">
          {options.map((option) => {
            const active = option.value === value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-[18px] px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                  active
                    ? "bg-red-600 text-slate-900 shadow-[0_10px_25px_rgba(168,85,247,0.35)]"
                    : "text-slate-700 hover:bg-red-50 hover:text-red-600"
                }`}
              >
                <span>{option.label}</span>
                {active ? (
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.4}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
