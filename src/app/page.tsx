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

  const handleCountyHover = (county: string | null) => {
    setHoveredCounty(county);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <CountySidebar
        selectedCounty={selectedCounty}
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
