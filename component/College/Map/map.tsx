"use client";

import React, { useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import { Tooltip } from "react-tooltip";
import { useRouter } from "next/navigation"; // Next.js router
import "./map.css";

const geoUrl =
  "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

interface CountrySelectorProps {
  counterieslist: string[];
  setcounterieslist: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function CountrySelector({
  counterieslist,
  setcounterieslist,
}: CountrySelectorProps) {
  const [hoveredCountry, setHoveredCountry] = useState("");
  const router = useRouter(); // Next.js router

  const handleSelect = (countryName: string) => {
    setcounterieslist((prev) =>
      prev.includes(countryName)
        ? prev.filter((c) => c !== countryName)
        : [...prev, countryName]
    );
  };

  const removeCountry = (name: string) => {
    setcounterieslist((prev) => prev.filter((c) => c !== name));
  };

  // Example navigation usage
  const goToNextPage = () => {
    router.push("/nextpage"); // navigate to /nextpage
  };

  return (
    <div className="country-selector-wrapper">
      <h1 className="cs-title">🌍 Choose Your Preferred Countries</h1>

      {/* Map */}
      <div className="map-container">
        <ComposableMap>
          <ZoomableGroup zoom={1} minZoom={0.7} maxZoom={5} translateExtent={[[-1000, -500], [1000, 500]]}>
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const name = geo.properties.name;
                  const isSelected = counterieslist.includes(name);
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => setHoveredCountry(name)}
                      onMouseLeave={() => setHoveredCountry("")}
                      onClick={() => handleSelect(name)}
                      data-tooltip-id="country-tooltip"
                      data-tooltip-content={name}
                      style={{
                        default: {
                          fill: isSelected ? "#7B1FA2" : "#E0E0E0",
                          stroke: "#FFFFFF",
                          strokeWidth: 0.5,
                          outline: "none",
                          transition: "fill 0.3s ease, transform 0.3s ease",
                        },
                        hover: {
                          fill: "#2196F3",
                          cursor: "pointer",
                        },
                        pressed: {
                          fill: "#5E35B1",
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ZoomableGroup>
        </ComposableMap>
        <Tooltip id="country-tooltip" place="top" />
      </div>

      {/* Selected countries */}
      <div className="selected-panel">
        <h3>Selected Countries ({counterieslist.length})</h3>
        <div className="chips-container">
          {counterieslist.length === 0 && (
            <p className="empty-text">No countries selected yet.</p>
          )}
          {counterieslist.map((country) => (
            <div key={country} className="country-chip">
              {country}
              <button className="remove-btn" onClick={() => removeCountry(country)}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Example navigation button */}
      <button onClick={goToNextPage} className="next-btn">
        Continue
      </button>
    </div>
  );
}
