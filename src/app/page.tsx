"use client";

import React, { useState } from "react";
import CountyMap from "../components/CountyMap";
import CountySidebar from "../components/CountySidebar";

const CountyApp: React.FC = () => {
  const [selectedCounty, setSelectedCounty] = useState<string | null>(null);
  const [hoveredCounty, setHoveredCounty] = useState<string | null>(null);

  const handleCountySelect = (county: string | null) => {
    setSelectedCounty(county);
  };

  const handleCountyHover = (hoveredCounty: string | null) => {
    setHoveredCounty(hoveredCounty);
  };

  console.log("Hovered County:", hoveredCounty);

  // Display the most recent interaction - hover takes priority when present
  const displayedCounty = hoveredCounty || selectedCounty;

  return (
    <div className="flex bg-gray-50">
      <CountySidebar
        selectedCounty={selectedCounty}
        hoveredCounty={hoveredCounty}
        displayedCounty={displayedCounty}
        onCountySelect={handleCountySelect}
        onCountyHover={handleCountyHover}
      />
      <div className="flex-1">
        <CountyMap
          selectedCounty={selectedCounty}
          onCountySelect={handleCountySelect}
          onCountyHover={handleCountyHover}
        />
      </div>
    </div>
  );
};

export default CountyApp;
