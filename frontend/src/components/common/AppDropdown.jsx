// src/components/common/AppDropdown.jsx

import { useEffect, useMemo, useRef, useState } from "react";

function normalizeOption(option) {
  if (typeof option === "string" || typeof option === "number") {
    return {
      value: String(option),
      label: String(option),
    };
  }

  return {
    value: String(option.value),
    label: option.label,
    disabled: option.disabled || false,
  };
}

export default function AppDropdown({
  label,
  name,
  value,
  onChange,
  options = [],
  placeholder = "-- Chọn --",
  required = false,
  disabled = false,
  loading = false,
  emptyText = "Không có dữ liệu",
}) {
  const dropdownRef = useRef(null);
  const menuRef = useRef(null);

  const [open, setOpen] = useState(false);
  const [dropDirection, setDropDirection] = useState("bottom");

  const normalizedOptions = useMemo(
    () => options.map(normalizeOption),
    [options],
  );

  const selectedOption = normalizedOptions.find(
    (option) => String(option.value) === String(value),
  );

  const displayLabel = selectedOption?.label || placeholder;

  const updateDropdownPosition = () => {
    if (!dropdownRef.current) return;

    const rect = dropdownRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const menuHeight = menuRef.current?.offsetHeight || 280;
    const gap = 10;

    const spaceBelow = viewportHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;

    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      setDropDirection("top");
    } else {
      setDropDirection("bottom");
    }
  };

  const handleSelect = (selectedValue) => {
    onChange?.({
      target: {
        name,
        value: selectedValue,
        type: "select-one",
      },
    });

    setOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
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
    if (!open) return;

    const timer = setTimeout(updateDropdownPosition, 0);

    window.addEventListener("resize", updateDropdownPosition);
    window.addEventListener("scroll", updateDropdownPosition, true);

    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", updateDropdownPosition);
      window.removeEventListener("scroll", updateDropdownPosition, true);
    };
  }, [open, options]);

  return (
    <div ref={dropdownRef} className="relative overflow-visible">
      <style>
        {`
          @keyframes appDropdownFadeInBottom {
            from {
              opacity: 0;
              transform: translateY(-8px) scale(0.97);
            }

            to {
              opacity: 1;
              transform: translateY(0) scale(1);
            }
          }

          @keyframes appDropdownFadeInTop {
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

      <input
        name={name}
        value={value || ""}
        readOnly
        required={required}
        hidden
      />

      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled || loading}
        onClick={() => setOpen((prev) => !prev)}
        className={`group flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
          open
            ? "border-red-500 bg-white ring-1 ring-red-500/40"
            : "border-slate-200 bg-slate-50 hover:border-red-500/70 hover:bg-red-50"
        }`}
      >
        <span
          className={`block text-sm font-semibold ${
            selectedOption ? "text-slate-900" : "text-slate-500"
          }`}
        >
          {loading ? "Đang tải..." : displayLabel}
        </span>

        <svg
          viewBox="0 0 24 24"
          className={`h-5 w-5 text-slate-500 transition-transform duration-200 ${
            open ? "rotate-180 text-red-500" : ""
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

      {open && (
        <div
          ref={menuRef}
          className={`absolute left-0 right-0 z-[9999] overflow-hidden rounded-xl border border-slate-200 bg-white p-2 shadow-2xl shadow-black/20 ${
            dropDirection === "top"
              ? "bottom-[calc(100%+0.5rem)]"
              : "top-[calc(100%+0.5rem)]"
          }`}
          style={{
            animation:
              dropDirection === "top"
                ? "appDropdownFadeInTop 0.18s ease-out"
                : "appDropdownFadeInBottom 0.18s ease-out",
            transformOrigin:
              dropDirection === "top" ? "bottom left" : "top left",
          }}
        >
          <ul role="listbox" className="max-h-72 overflow-auto">
            {normalizedOptions.length === 0 ? (
              <li className="px-3 py-3 text-sm font-semibold text-slate-400">
                {emptyText}
              </li>
            ) : (
              normalizedOptions.map((option) => {
                const selected = String(value) === String(option.value);

                return (
                  <li key={option.value} role="option" aria-selected={selected}>
                    <button
                      type="button"
                      disabled={option.disabled}
                      onClick={() => handleSelect(option.value)}
                      className={`flex w-full items-center justify-between rounded-lg px-3.5 py-2.5 text-left text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 ${
                        selected
                          ? "bg-red-600 text-white shadow-lg shadow-red-600/20"
                          : "text-slate-700 hover:bg-red-50 hover:text-red-600"
                      }`}
                    >
                      <span>{option.label}</span>

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
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
