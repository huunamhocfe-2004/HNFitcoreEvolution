import { useState } from "react";

export default function ProgramSection({
  programRef,
  programVisible,
  programs,
}) {
  const [openItems, setOpenItems] = useState([]);

  const toggleAccordion = (title) => {
    setOpenItems((prev) => (prev.includes(title) ? [] : [title]));
  };

  return (
    <section
      ref={programRef}
      id="program"
      className="mx-auto max-w-7xl px-6 py-16 lg:px-10"
    >
      <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <h2
            className={`text-4xl font-extrabold leading-tight transition-all duration-700 ${
              programVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-20 opacity-0"
            }`}
          >
            Chương trình tốt nhất <br /> Chúng tôi cung cấp cho bạn
          </h2>
        </div>
      </div>

      <div className="mt-10 grid items-start gap-5 md:grid-cols-2 xl:grid-cols-4">
        {programs.map((item, index) => {
          const isOpen = openItems.includes(item.title);
          return (
            <div
              key={item.title}
              className={`flex flex-col rounded-[22px] p-6 transition-all duration-700 ${
                item.active
                  ? "bg-red-600 shadow-xl shadow-red-950/30"
                  : "bg-[#5a5555] hover:bg-[#655f5f]"
              } ${
                programVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-16 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 350}ms` }}
            >
              <div className="mb-5 text-3xl">{item.icon}</div>
              <h3 className="text-xl font-bold">{item.title}</h3>
              <p
                className={`mt-4 text-sm leading-7 ${
                  item.active ? "text-white/90" : "text-slate-200"
                }`}
              >
                {item.desc}
              </p>
              <button
                onClick={() => toggleAccordion(item.title)}
                className="mr-auto mt-auto pt-6 inline-flex items-center gap-2 text-sm font-semibold cursor-pointer"
                aria-expanded={isOpen}
              >
                {isOpen ? "Thu gọn" : "Xem thêm"}
                <span
                  className={`transition-transform duration-300 ${
                    isOpen ? "rotate-180" : "rotate-0"
                  }`}
                >
                  ↓
                </span>
              </button>
              <div
                className={`grid transition-all duration-500 ease-in-out ${
                  isOpen
                    ? "mt-5 grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <div className="space-y-3 border-t border-white/15 pt-5 text-sm leading-6 text-white">
                    {(item.details || []).map((detail) => (
                      <div
                        key={detail}
                        className="rounded-xl bg-black/10 px-4 py-3 backdrop-blur-sm"
                      >
                        {detail}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
