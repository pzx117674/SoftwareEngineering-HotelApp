import { useState, useRef, useEffect } from "react";

export default function GuestPicker({ adults, children: kids, rooms, onChange, variant = "default" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const update = (field, delta) => {
    const mins = { adults: 1, children: 0, rooms: 1 };
    const maxs = { adults: 10, children: 6, rooms: 5 };
    const current = { adults, children: kids, rooms };
    const val = Math.max(mins[field], Math.min(maxs[field], current[field] + delta));
    onChange({ adults, children: kids, rooms, [field]: val });
  };

  const label = `${adults} adults · ${kids} children · ${rooms} rooms`;
  const isHero = variant === "hero";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={
          isHero
            ? "w-full text-sm text-gray-900 text-left focus:outline-none flex items-center gap-2 cursor-pointer"
            : "w-full border border-gray-300 rounded px-3 py-2 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white flex items-center gap-2 cursor-pointer"
        }
      >
        <svg className="w-4 h-4 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
        <span className="truncate">{label}</span>
        <svg className={`w-3.5 h-3.5 text-gray-400 shrink-0 ml-auto transition-transform ${open ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-5 z-50 min-w-[280px]">
          <CounterRow label="Adults" value={adults} onMinus={() => update("adults", -1)} onPlus={() => update("adults", 1)} />
          <CounterRow label="Children" value={kids} onMinus={() => update("children", -1)} onPlus={() => update("children", 1)} />
          <CounterRow label="Rooms" value={rooms} onMinus={() => update("rooms", -1)} onPlus={() => update("rooms", 1)} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="mt-4 w-full py-2 border border-gray-300 rounded text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}

function CounterRow({ label, value, onMinus, onPlus }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
      <span className="text-sm text-gray-700 font-medium">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMinus}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 cursor-pointer transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="w-6 text-center text-sm font-semibold text-gray-900">{value}</span>
        <button
          type="button"
          onClick={onPlus}
          className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:border-blue-500 hover:text-blue-600 cursor-pointer transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  );
}
