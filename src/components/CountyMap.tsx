"use client";

import React, { useState, useEffect, useRef } from "react";
import { counties } from "../data/counties";
import { riskScores } from "../data/riskScores";

interface NCCountyMapProps {
  selectedCounty?: string | null;
  hoveredCounty?: string | null;
  onCountySelect?: (county: string | null) => void;
  onCountyHover?: (county: string | null) => void;
}

const CountyMap: React.FC<NCCountyMapProps> = ({
  selectedCounty,
  hoveredCounty,
  onCountySelect,
}) => {
  const [svgContent, setSvgContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [countyMapping, setCountyMapping] = useState<Map<string, string>>(
    new Map(),
  );
  const [analysisCache, setAnalysisCache] = useState<Record<string, string>>(
    {},
  );

  const svgRef = useRef<HTMLDivElement>(null);

  const getCountyColor = (
    countyName: string | undefined,
    isHovered: boolean,
  ): string => {
    if (!countyName) return "#e5e7eb";
    const riskScore = riskScores[countyName.toUpperCase()];
    if (riskScore === undefined) return "#e5e7eb";

    if (isHovered) {
      return "#bfdbfe";
    }

    const lightness = 20 + riskScore * 60;
    return `hsl(220, 80%, ${lightness}%)`;
  };

  const createCountyMapping = (paths: NodeListOf<Element>) => {
    const mapping = new Map<string, string>();
    paths.forEach((path, index) => {
      const pathId = path.id || `county-${index}`;
      const countyName = counties[index];
      mapping.set(pathId, countyName);
    });
    return mapping;
  };

  const fetchAnalysis = async (countyName: string) => {
    const upper = countyName.toUpperCase();
    if (analysisCache[upper]) return;

    try {
      const res = await fetch(`/aihacks_frontend/data/${upper}_analysis.txt`);
      const text = await res.text();
      setAnalysisCache((prev) => ({ ...prev, [upper]: text }));
    } catch (err) {
      console.error(`Error loading analysis for ${upper}:`, err);
      setAnalysisCache((prev) => ({
        ...prev,
        [upper]: "No analysis available.",
      }));
    }
  };

  useEffect(() => {
    const preloadAllAnalysis = async () => {
      for (const county of counties) {
        let upper = county.toUpperCase();
        upper = upper.toUpperCase().replace(/\s+/g, "");

        if (analysisCache[upper]) continue;
        try {
          const res = await fetch(
            `/aihacks_frontend/data/${upper}_analysis.txt`,
          );
          if (!res.ok) throw new Error("Not found");
          const text = await res.text();
          setAnalysisCache((prev) => ({ ...prev, [upper]: text }));
        } catch (err) {
          setAnalysisCache((prev) => ({
            ...prev,
            [upper]: "No analysis available.",
          }));
          console.log(err);
        }
      }
    };

    preloadAllAnalysis();
  }, []);

  useEffect(() => {
    const loadSvg = async () => {
      try {
        const res = await fetch("/aihacks_frontend/NCmap.svg");
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

        const mapping = createCountyMapping(paths);
        setCountyMapping(mapping);

        const serializer = new XMLSerializer();
        setSvgContent(serializer.serializeToString(svgDoc));
      } catch (err) {
        console.error(err);
        setSvgContent(`
          <svg viewBox="0 0 400 200" width="100%" height="auto">
            <text x="200" y="100" text-anchor="middle" fill="#ef4444" font-size="16">
              Failed to load map.
            </text>
          </svg>
        `);
      } finally {
        setLoading(false);
      }
    };

    loadSvg();
  }, []);

  useEffect(() => {
    if (!svgRef.current || loading) return;

    const paths = svgRef.current.querySelectorAll("path");

    paths.forEach((path) => {
      const pathEl = path as SVGPathElement;
      const pathId = path.id;

      if (countyMapping.has(pathId)) {
        const countyName = countyMapping.get(pathId);

        const color = getCountyColor(countyName, false);
        pathEl.style.fill = color;
        pathEl.style.cursor = "pointer";

        pathEl.onmouseenter = () => {
          if (countyName) {
            fetchAnalysis(countyName);
          }
          const hoverColor = getCountyColor(countyName, true);
          pathEl.style.fill = hoverColor;
          onCountySelect?.(countyName ?? null);
        };

        pathEl.onmouseleave = () => {
          const defaultColor = getCountyColor(countyName, false);
          pathEl.style.fill = defaultColor;
        };

        pathEl.onclick = (e) => {
          e.stopPropagation();
          onCountySelect?.(countyName ?? null);
        };
      }
    });
  }, [loading, countyMapping, svgContent, analysisCache, onCountySelect]);

  const handleWhiteSpaceClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const svgElem = svgRef.current?.querySelector("svg");
    if (!svgElem || !e.target) return;

    const isBackground =
      e.target === e.currentTarget ||
      (e.target instanceof SVGElement && e.target.tagName !== "path");

    if (isBackground) {
      onCountySelect?.(null);
    }
  };

  const getRiskScore = (
    countyName: string | null | undefined,
  ): number | null => {
    if (!countyName) return null;
    const score = riskScores[countyName.toUpperCase()];
    return score !== undefined ? score : null;
  };

  const currentCounty = (hoveredCounty ?? null) || selectedCounty;
  const currentRiskScore = getRiskScore(currentCounty);
  const currentAnalysis = currentCounty
    ? analysisCache[currentCounty.toUpperCase()]
    : null;

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
      <div className="mb-6 text-center text-3xl font-bold text-gray-800">
        North Carolina Counties Risk Assessment
      </div>

      <div className="mb-4 rounded-lg bg-gray-50 p-4">
        <div className="flex items-center text-sm text-gray-600">
          <span className="flex items-center">
            <div
              className="mr-2 h-4 w-4 rounded px-4"
              style={{ backgroundColor: "hsl(220, 80%, 20%)" }}
            ></div>
            High Risk (0.0)
          </span>
          <span className="flex items-center px-4">
            <div
              className="mr-2 h-4 w-4 rounded px-4"
              style={{ backgroundColor: "hsl(220, 80%, 80%)" }}
            ></div>
            Low Risk (1.0)
          </span>
        </div>
      </div>
      <div className="flex">
        <div
          className="mr-2 mb-6 ml-2 h-[75vh] w-1/3 cursor-pointer rounded-r-lg border-l-4 border-blue-500 bg-blue-100 p-4"
          onClick={() => {
            onCountySelect?.(null);
          }}
        >
          <p className="text-lg font-semibold text-blue-800">
            Current County: {currentCounty || "None"}
          </p>
          {currentCounty && (
            <>
              <p className="text-md font-medium text-blue-700">
                Risk Score:{" "}
                {currentRiskScore !== null
                  ? currentRiskScore.toFixed(3)
                  : "0.000"}
              </p>
              <p className="mt-2 text-sm whitespace-pre-wrap text-gray-600">
                <strong>Analysis:</strong> {currentAnalysis || "Loading..."}
              </p>
            </>
          )}
        </div>

        <div className="ml-2 h-[75vh] w-2/3 overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-6 shadow-lg">
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
    </div>
  );
};

export default CountyMap;
