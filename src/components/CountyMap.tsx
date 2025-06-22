"use client";

import React, { useState, useEffect, useRef } from "react";
import { counties } from "../data/counties";

interface NCCountyMapProps {
  selectedCounty?: string | null;
  onCountySelect?: (county: string | null) => void;
  onCountyHover?: (county: string | null) => void;
}

const NCCountyMap: React.FC<NCCountyMapProps> = ({
  selectedCounty,
  onCountySelect,
  onCountyHover,
}) => {
  const [svgContent, setSvgContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [countyMapping, setCountyMapping] = useState<Map<string, string>>(
    new Map(),
  );
  const [reverseMapping, setReverseMapping] = useState<Map<string, string>>(
    new Map(),
  );
  const svgRef = useRef<HTMLDivElement>(null);

  const createCountyMapping = (
    paths: NodeListOf<Element>,
  ): {
    mapping: Map<string, string>;
    reverse: Map<string, string>;
  } => {
    const mapping = new Map<string, string>();
    const reverse = new Map<string, string>();
    paths.forEach((path, index) => {
      const pathId = path.id || `county-${index}`;
      const countyName = counties[index];
      mapping.set(pathId, countyName);
      reverse.set(countyName, pathId);
    });
    return { mapping, reverse };
  };

  useEffect(() => {
    const loadSvg = async () => {
      try {
        const res = await fetch("/NCmap.svg");
        const svgText = await res.text();
        const parser = new DOMParser();
        const svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        const svgEl = svgDoc.querySelector("svg");
        const paths = svgDoc.querySelectorAll("path");

        if (svgEl) {
          svgEl.setAttribute("width", "100%");
          svgEl.setAttribute("height", "100%");
          svgEl.style.maxWidth = "100%";
          svgEl.style.height = "auto";
        }

        paths.forEach((path, index) => {
          if (!path.id) path.id = `county-${index}`;
        });

        const { mapping, reverse } = createCountyMapping(paths);
        setCountyMapping(mapping);
        setReverseMapping(reverse);

        const serializer = new XMLSerializer();
        setSvgContent(serializer.serializeToString(svgDoc));
        setLoading(false);
      } catch (err) {
        console.error(err);
        setSvgContent(`
          <svg viewBox="0 0 400 200" width="100%" height="auto">
            <text x="200" y="100" text-anchor="middle" fill="#ef4444" font-size="16">
              Failed to load map.
            </text>
          </svg>
        `);
        setLoading(false);
      }
    };

    loadSvg();
  }, []);

  // Handle click on county path
  const handleSvgClick = (e: Event) => {
    const target = e.target;
    if (target instanceof SVGPathElement) {
      const pathId = target.id;
      const countyName = countyMapping.get(pathId);
      if (!countyName) return;

      const newSelection = selectedCounty === countyName ? null : countyName;
      onCountySelect?.(newSelection);
      e.stopPropagation(); // prevent white space deselect
    }
  };

  // Handle white space click
  const handleWhiteSpaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const svgElem = svgRef.current?.querySelector("svg");
    if (!svgElem || !e.target) return;

    // If user clicked directly on the background div or on the svg (but not path)
    const isBackground =
      e.target === e.currentTarget || // clicked on outer container
      (e.target instanceof SVGElement && e.target.tagName !== "path");

    if (isBackground) {
      onCountySelect?.(null);
    }
  };

  useEffect(() => {
    if (!svgContent || loading || !svgRef.current) return;
    const container = svgRef.current;

    const setupSvg = () => {
      const paths = container.querySelectorAll("path");

      paths.forEach((path: Element) => {
        const pathEl = path as SVGPathElement;
        const pathId = path.id;

        if (countyMapping.has(pathId)) {
          pathEl.style.cursor = "pointer";
          pathEl.style.transition = "fill 0.2s ease";
          pathEl.style.stroke = "#374151";
          pathEl.style.strokeWidth = "1";
          pathEl.style.fill = "#e5e7eb";
          pathEl.setAttribute("title", countyMapping.get(pathId) || "");

          // Remove previous listener if any
          pathEl.onclick = null;

          // Attach click handler here
          pathEl.onclick = (e: MouseEvent) => {
            e.stopPropagation(); // prevent bubbling to background
            const countyName = countyMapping.get(pathEl.id);
            if (!countyName) return;

            const newSelection =
              selectedCounty === countyName ? null : countyName;
            onCountySelect?.(newSelection);
          };
        }
      });
    };

    const timeoutId = setTimeout(setupSvg, 100);
    return () => {
      clearTimeout(timeoutId);
      container.removeEventListener("click", handleSvgClick);
    };
  }, [svgContent, loading, countyMapping]);

  useEffect(() => {
    if (!svgRef.current || loading) return;
    const paths = svgRef.current.querySelectorAll("path");

    paths.forEach((path) => {
      const pathEl = path as SVGPathElement;
      const pathId = path.id;

      if (countyMapping.has(pathId)) {
        const countyName = countyMapping.get(pathId);
        const isSelected = selectedCounty === countyName;

        pathEl.style.fill = isSelected ? "#3b82f6" : "#e5e7eb";

        pathEl.onmouseenter = () => {
          if (!isSelected) pathEl.style.fill = "#bfdbfe";
          onCountyHover?.(countyName ?? null);
        };

        pathEl.onmouseleave = () => {
          pathEl.style.fill = isSelected ? "#3b82f6" : "#e5e7eb";
          onCountyHover?.(null);
        };
      }
    });
  }, [selectedCounty, loading, countyMapping, onCountyHover]);

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-6xl p-4">
        <div className="rounded-xl border-2 border-gray-200 bg-white p-12 shadow-lg">
          <div className="flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
            <span className="ml-4 font-medium text-gray-600">
              Loading NC County Map...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="mx-auto w-full max-w-6xl p-4"
      onClick={handleWhiteSpaceClick}
    >
      <h2 className="mb-6 text-center text-3xl font-bold text-gray-800">
        North Carolina Counties
      </h2>

      <div
        className="mb-6 cursor-pointer rounded-r-lg border-l-4 border-blue-500 bg-blue-100 p-4"
        onClick={handleWhiteSpaceClick}
      >
        <p className="text-lg font-semibold text-blue-800">
          Selected County: {selectedCounty ?? "N/A"}
        </p>
      </div>

      <div
        className="h-[70vh] overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 shadow-lg"
        onClick={handleWhiteSpaceClick}
      >
        <div
          ref={svgRef}
          dangerouslySetInnerHTML={{ __html: svgContent }}
          className="flex h-auto w-full max-w-full items-center justify-center select-none"
          style={{
            maxHeight: "100%",
            aspectRatio: "auto",
            overflow: "hidden",
          }}
        />
      </div>
    </div>
  );
};

export default NCCountyMap;
