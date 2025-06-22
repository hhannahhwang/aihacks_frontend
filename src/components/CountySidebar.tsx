"use client";

import React, { useState } from "react";
import { Search } from "lucide-react";
import { northCarolinaCounties } from "../data/counties";

interface CountySidebarProps {
  onCountySelect?: (county: string) => void;
  selectedCounty?: string;
}

const CountySidebar: React.FC<CountySidebarProps> = ({
  onCountySelect,
  selectedCounty,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredCounties = northCarolinaCounties.filter((county) =>
    county.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleCountyClick = (county: string) => {
    onCountySelect?.(county);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="flex h-[90vh] pt-15">
      <div className="flex h-full w-64 flex-col rounded-xl border-gray-200 bg-white shadow-lg">
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <h2 className="text-lg font-semibold text-gray-800">ai.hack</h2>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 flex-col overflow-hidden p-4">
          {/* Dropdown */}
          <div className="relative mb-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex w-full items-center justify-between rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm hover:border-gray-400"
            >
              {selectedCounty || "Search County"}
              <Search className="ml-2 h-4 w-4" />
            </button>

            {isOpen && (
              <div className="custom-scrollbar absolute z-10 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-md">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border-b border-gray-200 px-3 py-2 text-sm focus:outline-none"
                />
                <div className="max-h-48 overflow-y-auto">
                  {filteredCounties.map((county) => (
                    <button
                      key={county}
                      onClick={() => handleCountyClick(county)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                    >
                      {county}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Visible County List */}
          <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto pr-2">
            {northCarolinaCounties.map((county: string) => (
              <button
                key={county}
                onClick={() => handleCountyClick(county)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  selectedCounty === county
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {county}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollbar Styling */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
};

export default CountySidebar;
