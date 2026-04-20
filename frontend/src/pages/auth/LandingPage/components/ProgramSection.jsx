export default function ProgramSection({ programRef, programVisible, programs }) {
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
              programVisible ? "translate-x-0 opacity-100" : "-translate-x-20 opacity-0"
            }`}
          >
            Chương trình tốt nhất <br /> Chúng tôi cung cấp cho bạn
          </h2>
        </div>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {programs.map((item, index) => (
          <div
            key={item.title}
            className={`flex flex-col rounded-[22px] p-6 transition-all duration-700 ${
              item.active
                ? "bg-red-600 shadow-xl shadow-red-950/30"
                : "bg-[#5a5555] hover:bg-[#655f5f]"
            } ${
              programVisible ? "translate-y-0 opacity-100" : "translate-y-16 opacity-0"
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
            <button className="mr-auto mt-auto cursor-pointer pt-6 text-sm font-semibold underline underline-offset-4">
              Learn more →
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}