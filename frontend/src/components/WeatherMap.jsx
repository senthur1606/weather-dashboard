import React, { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default marker icons
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

function ChangeView({ center }) {
  const map = useMap();

  useEffect(() => {
    if (center) {
      map.flyTo(center, map.getZoom(), {
        animate: true,
        duration:1.5,
      });
    }
  }, [center, map]);

  return null;
}

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);

    },
  });

  return null;
}
const WeatherMap = ({ lat, lon, city, onMapClick }) => {
  if (lat == null || lon == null) {
  return (
    <div className="glass-card rounded-3xl p-6 text-center text-gray-300">
      Loading map...
    </div>
  );
}

  const position = [lat, lon];

  return (
    <div className="glass-card rounded-3xl p-4 overflow-hidden">
      <h2 className="text-white text-lg font-semibold mb-4">
        Weather Map
      </h2>

      <div className="rounded-2xl overflow-hidden">
        <MapContainer
          center={position}
          zoom={12}
          scrollWheelZoom={true}
          style={{
            height: "400px",
            width: "100%",
          }}
        >
          <MapClickHandler onMapClick={onMapClick} />
          <ChangeView center={position} />

          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <Marker position={position}>
            <Popup>
             <div className="text-center">
  <strong>{city}</strong>
  <br />
  📍 Current Location
  <br />
  Lat: {lat.toFixed(4)}
  <br />
  Lon: {lon.toFixed(4)}
</div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
    </div>
  );
};

export default WeatherMap;