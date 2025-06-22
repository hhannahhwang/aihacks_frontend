"use client";

import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { counties } from "../data/counties";

interface CountySidebarProps {
  onCountySelect?: (county: string | null) => void;
  onCountyHover?: (county: string | null) => void;
  selectedCounty?: string | null;
  hoveredCounty: string | null;
  displayedCounty: string | null;
}

const CountySidebar: React.FC<CountySidebarProps> = ({
  onCountySelect,
  onCountyHover,
  selectedCounty,
  hoveredCounty,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [analysisCache, setAnalysisCache] = useState<Record<string, string>>(
    {},
  );
  console.log(onCountyHover);

  const currentCounty = hoveredCounty || selectedCounty;
  let currentUpper = currentCounty?.toUpperCase();
  if (currentUpper)
    currentUpper = currentUpper!.toUpperCase().replace(/\s+/g, "");

  const filteredCounties = counties.filter((county) =>
    county.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  useEffect(() => {
    if (!currentUpper || analysisCache[currentUpper]) return;

    const fetchAnalysis = async () => {
      try {
        const res = await fetch(`/data/${currentUpper}_analysis.txt`);
        console.log(currentUpper);
        const text = await res.text();
        console.log(text);
        setAnalysisCache((prev) => ({ ...prev, [currentUpper]: text }));
      } catch (err) {
        console.error(`Error loading analysis for ${currentUpper}:`, err);
        setAnalysisCache((prev) => ({
          ...prev,
          [currentUpper]: "No analysis available.",
        }));
      }
    };

    fetchAnalysis();
  }, [currentUpper, analysisCache]);

  const handleCountyClick = (county: string) => {
    const isAlreadySelected = selectedCounty === county;
    onCountySelect?.(isAlreadySelected ? null : county);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className="flex h-screen w-64 flex-col border-gray-200 bg-white shadow-lg">
      <div className="border-b border-gray-200 p-4">
        <div className="text-lg font-semibold text-gray-800">voter.flw</div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden p-4">
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

        <div className="custom-scrollbar flex-1 space-y-1 overflow-y-auto pr-2">
          {counties.map((county: string) => (
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
  );
};

export default CountySidebar;
