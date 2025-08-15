"use client";
import React, {useRef, useState, useEffect } from "react";

interface Option {
  label: string;
  value: string;
}

interface MultiselectProps {
  placeholder?: string;
  onSelectionChange?: (selected: string[]) => void;
}

export default function Multiselect({
  placeholder = "Select timezones...",
  onSelectionChange,
}: MultiselectProps) {
  const [options, setOptions] = useState<Option[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchTimezones = async () => {
      try {
        const res = await fetch("https://timeapi.io/api/timezone/availabletimezones");
        if (!res.ok) throw new Error("Failed to fetch timezones");
        const data: string[] = await res.json();
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
  const handleClickOutside = (event: MouseEvent) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
      setIsOpen(false);
      setSearch("");
    }
  };

  document.addEventListener("mousedown", handleClickOutside);

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, []);

  const toggleOption = (value: string) => {
    let newSelected: string[];
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
    <div  ref={dropdownRef} className="relative w-100">
      <div
        className="shadow shadow-gray-500 rounded p-2 cursor-pointer bg-white"
        onClick={() => setIsOpen(!isOpen)}
      >
        {selected.length === 0 ? placeholder : selected.join(", ")}
      </div>

      {isOpen && (
        <div className="absolute  mt-1 w-full bg-white rounded shadow shadow-gray-300 z-10">
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full p-1 focus:bg-gray-200 transition-colors duration-200 
            focus:outline-none focus:ring-0
            active:outline-none active:ring-0"
          />
          {filteredOptions.map(opt => (
            <div
              key={opt.value}
              className={`p-2 cursor-pointer hover:bg-gray-100 ${selected.includes(opt.value) ? "bg-blue-100" : ""}`}
              onClick={() => {toggleOption(opt.value);setSearch("")}}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}

      {selected.length > 0 && (
        <button
          onClick={clearAll}
          className="mt-2 text-sm text-red-500 hover:underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
