"use client";
import React, { useRef, useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/20/solid";

export default function Multiselect({
  placeholder = "Select timezones...",
  onSelectionChange,
}) {
  const [options, setOptions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        const res = await fetch("https://timeapi.io/api/timezone/availabletimezones");
        if (!res.ok) throw new Error("Failed to fetch timezones");
        const data = await res.json();
        setOptions(data.map((tz) => ({ label: tz, value: tz })));
      } catch (err) {
        console.error("Using fallback timezones:", err);
        setOptions([
          "Africa/Abidjan",
          "America/New_York",
          "Asia/Yerevan",
          "Europe/London",
          "Europe/Moscow",
          "Pacific/Auckland",
        ].map(tz => ({ label: tz, value: tz })));
      }
    };
    fetchTimezones();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleOption = (value) => {
    let newSelected;
    if (selected.includes(value)) {
      newSelected = selected.filter((v) => v !== value);
    } else {
      newSelected = [...selected, value];
    }
    setSelected(newSelected);
    onSelectionChange?.(newSelected);
  };

  const clearAll = () => {
    setSelected([]);
    onSelectionChange?.([]);
    setSearch("");
  };

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-2">
  <div className="p-2 text-l font-bold italic">
    {selected.length > 0 ? selected.join(", ") : ""}
  </div>
  {selected.length > 0 && (
    <button
      onClick={clearAll}
      className="text-l text-red-800 hover:text-white hover:bg-red-800  bg-white rounded-md px-2 py-1"
    >
      Reset
    </button>
  )}

  <div ref={dropdownRef} className="relative">
    <div
      className="p-2  shadow shadow-slate-500 rounded bg-white cursor-pointer flex justify-between items-center"
      onClick={() => setIsOpen(!isOpen)}
    >
      <span>{isOpen ? "Select timezones" : "Select timezones"}</span>
      <span>{isOpen ? "▲" : "▼"}</span>
    </div>

    {isOpen && (
      <div className="absolute mt-1 w-full bg-white rounded shadow shadow-slate-500 z-10">
        <div className="relative">
          <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400">
          <MagnifyingGlassIcon className="w-5 h-5 absolute left-0 top-1/2 transform -translate-y-1/2 text-gray-600" />
          </span>
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search timezones..."
            className="w-full pl-8 p-2 outline-none rounded shadow hover:shadow-slate-500"
          />
        </div>

        <div className="max-h-60 overflow-auto">
          {filteredOptions.map((opt) => (
            <div
              key={opt.value}
              onClick={() => {
                toggleOption(opt.value);
                setSearch("");
              }}
              className={`p-2  cursor-pointer hover:bg-gray-100 rounded shadow hover:shadow-slate-500 ${
                selected.includes(opt.value) ? "bg-slate-200" : ""
              }`}
            >
              {opt.label}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
</div>

  );
}
