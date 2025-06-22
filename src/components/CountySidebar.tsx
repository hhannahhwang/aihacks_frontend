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
  selectedCounty 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCounties = northCarolinaCounties.filter(county =>
    county.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCountyClick = (county: string) => {
    onCountySelect?.(county);
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="flex h-[90vh] pt-15">
      <div className="w-64 bg-white rounded-xl border-gray-200 shadow-lg h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">ai.hack</h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col p-4">
          {/* Dropdown */}
          <div className="relative mb-4">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex justify-between items-center px-3 py-2 text-sm border border-gray-300 rounded-lg shadow-sm hover:border-gray-400"
            >
              {selectedCounty || "Search County"}
              <Search className="w-4 h-4 ml-2" />
            </button>

            {isOpen && (
              <div className="absolute z-10 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-md max-h-64 overflow-y-auto custom-scrollbar">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border-b border-gray-200 text-sm focus:outline-none"
                />
                <div className="max-h-48 overflow-y-auto">
                  {filteredCounties.map((county) => (
                    <button
                      key={county}
                      onClick={() => handleCountyClick(county)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                    >
                      {county}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Visible County List */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
            {northCarolinaCounties.map((county: string) => (
              <button
                key={county}
                onClick={() => handleCountyClick(county)}
                className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-colors ${
                  selectedCounty === county 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'text-gray-600 hover:bg-gray-100'
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
