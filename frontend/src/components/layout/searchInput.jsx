import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

const SearchInput = ({ onSearch }) => {
  const [value, setValue] = useState("");
  const [debounced, setDebounced] = useState("");

  // debounce 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, 400);

    return () => clearTimeout(timer);
  }, [value]);

  // trigger search
  useEffect(() => {
    if (onSearch) onSearch(debounced);
  }, [debounced, onSearch]);

  return (
    <div className="relative w-full max-w-sm">
      {/* Icon search */}
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

      {/* Input */}
      <input
        type="text" 
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tìm theo tên, SĐT, email..."
        className="
          w-full rounded-xl
          bg-black text-white
          placeholder:text-gray-200
          pl-10 pr-10 py-2.5 text-sm
          border border-gray-700
          outline-none
          transition-all duration-200
          focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30
        "
      />

      {/* Clear button */}
      {value && (
        <button
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-gray-700 transition"
        >
          <X size={14} className="text-gray-400" />
        </button>
      )}
    </div>
  );
};

export default SearchInput;