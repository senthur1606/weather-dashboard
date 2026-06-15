import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";

const OPENWEATHER_API_KEY = process.env.REACT_APP_OPENWEATHER_API_KEY;

const MAP_LAYERS = [
  {
    id: "temp",
    label: "Temperature",
    icon: "🌡️",
    owmLayer: "temp_new",
    color: "#f97316",
    description: "Surface temperature",
  },
  {
    id: "rain",
    label: "Rain Radar",
    icon: "🌧️",
    owmLayer: "precipitation_new",
    color: "#3b82f6",
    description: "Precipitation intensity",
  },
  {
    id: "wind",
    label: "Wind Speed",
    icon: "💨",
    owmLayer: "wind_new",
    color: "#8b5cf6",
    description: "Wind speed at surface",
  },
  {
    id: "cloud",
    label: "Cloud Cover",
    icon: "☁️",
    owmLayer: "clouds_new",
    color: "#64748b",
    description: "Cloud coverage",
  },
];

export default function WeatherMap() {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layerRefs = useRef({});
  const markerRef = useRef(null);
  const [activeLayer, setActiveLayer] = useState("temp");
  const [mapReady, setMapReady] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);

  const { current } = useSelector((state) => state.weather);

  // Determine center from current weather or default to India
  const center =
  current?.lat && current?.lon
    ? [current.lat, current.lon]
    : [20.5937, 78.9629];

  const cityName = current?.city || "India";

  // Load Leaflet CSS + JS dynamically
  useEffect(() => {
    if (window.L) {
      setLeafletLoaded(true);
      return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(link);

    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    script.onload = () => setLeafletLoaded(true);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  // Initialize map once Leaflet is loaded
  useEffect(() => {
    if (!leafletLoaded || !mapRef.current || mapInstanceRef.current) return;

    const L = window.L;

    const map = L.map(mapRef.current, {
      center,
      zoom: 6,
      zoomControl: true,
      attributionControl: true,
    });

    // Base tile layer — OpenStreetMap dark-ish style via CartoDB
    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://carto.com/">CARTO</a> | Weather data &copy; <a href="https://openweathermap.org/">OpenWeatherMap</a>',
        subdomains: "abcd",
        maxZoom: 19,
      }
    ).addTo(map);

    // Add all weather layers (hidden initially)
    MAP_LAYERS.forEach(({ id, owmLayer }) => {
      const layer = L.tileLayer(
        `https://tile.openweathermap.org/map/${owmLayer}/{z}/{x}/{y}.png?appid=${OPENWEATHER_API_KEY}`,
        { opacity: 0.75, maxZoom: 19 }
      );
      layerRefs.current[id] = layer;
    });

    // Show default layer
    layerRefs.current["temp"].addTo(map);

    // City marker
    if (current?.lat && current?.lon) {
      const customIcon = L.divIcon({
        className: "",
        html: `<div style="
               background:#0ea5e9;
               color:white;
               padding:6px 12px;
               border-radius:25px;
               font-size:13px;
               font-weight:700;
               border:2px solid white;
               box-shadow:0 4px 12px rgba(0,0,0,.3);">
📍 ${current.city}
<br/>
🌡️ ${Math.round(current.temperature)}°C
</div>
`,
        iconAnchor: [40, 10],
      });
      markerRef.current = L.marker(center,
  { icon: customIcon }
).addTo(map);
    }

    mapInstanceRef.current = map;
    setTimeout(()=>{
      map.invalidateSize();
    },200);

    setMapReady(true);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [leafletLoaded]);

  // Switch layers when activeLayer changes
  useEffect(() => {
    if (!mapReady || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    MAP_LAYERS.forEach(({ id }) => {
      const layer = layerRefs.current[id];
      if (!layer) return;
      if (id === activeLayer) {
        if (!map.hasLayer(layer)) layer.addTo(map);
      } else {
        if (map.hasLayer(layer)) map.removeLayer(layer);
      }
    });
  }, [activeLayer, mapReady]);

  // Pan map when city changes
 useEffect(() => {
  if (
    !mapReady ||
    !mapInstanceRef.current ||
    !current?.lat ||
    !current?.lon
  ) return;

  const L = window.L;
  const map = mapInstanceRef.current;

  const newCenter = [
    Number(current.lat),
    Number(current.lon)
  ];

  map.flyTo(newCenter, 10, {
    duration: 1.5
  });

  if (markerRef.current) {
    map.removeLayer(markerRef.current);
  }

  const customIcon = L.divIcon({
    className: "",
    html: `
      <div style="
        background:#f97316;
        color:white;
        padding:4px 10px;
        border-radius:20px;
        font-size:12px;
        font-weight:700;
        white-space:nowrap;
        border:2px solid white;
      ">
        ${current.city}
        ${current.temperature
          ? Math.round(current.temperature) + "°C"
          : ""}
      </div>
    `,
    iconAnchor: [40, 10],
  });

  markerRef.current = L.marker(
  newCenter,
  { icon: customIcon }
).addTo(map);

markerRef.current.bindPopup(`
  <div style="
    min-width:220px;
    font-family:Arial,sans-serif;
  ">
    <h3 style="
      margin-bottom:10px;
      color:#0ea5e9;
    ">
      📍 ${current.city}
    </h3>

    <div style="
      font-size:28px;
      font-weight:bold;
      color:#f97316;
      margin-bottom:10px;
    ">
      🌡️ ${current.temperature ?? "--"}°C
    </div>

    <p>💧 Humidity: ${current.humidity ?? "--"}%</p>
    <p>💨 Wind: ${current.wind_speed ?? "--"} km/h</p>
    <p>🌡️ Pressure: ${current.pressure ?? "--"} hPa</p>
    <p>👁️ Visibility: ${current.visibility ?? "--"} km</p>
    <p>☀️ UV Index: ${current.uv_index ?? "--"}</p>
    <p>🌅 Sunrise: ${current.sunrise ?? "--"}</p>
    <p>🌇 Sunset: ${current.sunset ?? "--"}</p>
  </div>
`);

markerRef.current.on("mouseover", function(){
  this.openPopup();
});

markerRef.current.on("mouseout", function(){
  setTimeout(()=>{
    this.closePopup();
  },1000);
});

}, [current?.lat, current?.lon, mapReady]);

  const activeLayerInfo = MAP_LAYERS.find((l) => l.id === activeLayer);

  return (
    <div style={{
      background: "var(--card-bg, #1e293b)",
      borderRadius: "16px",
      overflow: "hidden",
      border: "1px solid var(--border, rgba(255,255,255,0.08))",
      boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
    }}>
      {/* Header */}
      <div style={{
        padding: "16px 20px 12px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
      }}>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: "16px",
            fontWeight: 700,
            color: "var(--text-primary, #f1f5f9)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}>
            🗺️ Weather Map
            {cityName && (
              <span style={{
                fontSize: "12px",
                fontWeight: 500,
                color: "var(--text-secondary, #94a3b8)",
                background: "rgba(255,255,255,0.06)",
                padding: "2px 8px",
                borderRadius: "10px",
              }}>
                {cityName}
              </span>
            )}
          </h3>
          <p style={{
            margin: "2px 0 0",
            fontSize: "12px",
            color: "var(--text-secondary, #94a3b8)",
          }}>
            {activeLayerInfo?.description}
          </p>
        </div>

        {/* Layer toggle buttons */}
        <div style={{
          display: "flex",
          gap: "6px",
          flexWrap: "wrap",
        }}>
          {MAP_LAYERS.map((layer) => (
            <button
              key={layer.id}
              onClick={() => setActiveLayer(layer.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                padding: "6px 12px",
                borderRadius: "20px",
                border: activeLayer === layer.id
                  ? `1.5px solid ${layer.color}`
                  : "1.5px solid rgba(255,255,255,0.1)",
                background: activeLayer === layer.id
                  ? `${layer.color}22`
                  : "rgba(255,255,255,0.04)",
                color: activeLayer === layer.id
                  ? layer.color
                  : "var(--text-secondary, #94a3b8)",
                fontSize: "12px",
                fontWeight: activeLayer === layer.id ? 700 : 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap",
              }}
            >
              <span>{layer.icon}</span>
              <span>{layer.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Map container */}
      <div style={{ position: "relative" }}>
        {!leafletLoaded && (
          <div style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            zIndex: 10,
            height: "400px",
          }}>
            <div style={{ textAlign: "center", color: "#94a3b8" }}>
              <div style={{ fontSize: "32px", marginBottom: "8px" }}>🗺️</div>
              <div style={{ fontSize: "14px" }}>Loading map...</div>
            </div>
          </div>
        )}

        <div
          ref={mapRef}
          style={{
            height: "400px",
            width: "100%",
            maxWidth:"100%",
            overflow: "hidden",
            position:"relative",
            zIndex: 1,
            background: "#0f172a",
          }}
        />

        {/* Legend overlay */}
        <div style={{
          position: "absolute",
          bottom: "12px",
          left: "12px",
          background: "rgba(15,23,42,0.85)",
          backdropFilter: "blur(8px)",
          borderRadius: "10px",
          padding: "8px 12px",
          zIndex: 1000,
          border: "1px solid rgba(255,255,255,0.1)",
          pointerEvents: "none",
        }}>
          <div style={{
            fontSize: "11px",
            fontWeight: 700,
            color: activeLayerInfo?.color,
            marginBottom: "4px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}>
            {activeLayerInfo?.icon} {activeLayerInfo?.label}
          </div>
          {activeLayer === "temp" && (
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>Cold</span>
              <div style={{
                width: "80px", height: "8px", borderRadius: "4px",
                background: "linear-gradient(to right, #3b82f6, #22c55e, #f97316, #ef4444)",
              }} />
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>Hot</span>
            </div>
          )}
          {activeLayer === "rain" && (
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>Light</span>
              <div style={{
                width: "80px", height: "8px", borderRadius: "4px",
                background: "linear-gradient(to right, #bfdbfe, #3b82f6, #1e3a8a)",
              }} />
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>Heavy</span>
            </div>
          )}
          {activeLayer === "wind" && (
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>Calm</span>
              <div style={{
                width: "80px", height: "8px", borderRadius: "4px",
                background: "linear-gradient(to right, #ede9fe, #8b5cf6, #4c1d95)",
              }} />
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>Strong</span>
            </div>
          )}
          {activeLayer === "cloud" && (
            <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>Clear</span>
              <div style={{
                width: "80px", height: "8px", borderRadius: "4px",
                background: "linear-gradient(to right, transparent, #94a3b8, #334155)",
              }} />
              <span style={{ fontSize: "10px", color: "#94a3b8" }}>Overcast</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
