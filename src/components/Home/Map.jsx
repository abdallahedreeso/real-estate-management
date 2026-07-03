import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import * as Sentry from "@sentry/react";
import "leaflet/dist/leaflet.css";
import { useTheme } from "../../context/ThemeContext";

function Map({ markers }) {
  const { isDarkMode } = useTheme();

  // Optimized Tile Layer URL and Attribution depending on Light / Dark Mode
  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution = isDarkMode
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <MapContainer
      center={[30.143055439268853, 31.394735395877987]}
      zoom={13}
      scrollWheelZoom={false}
      className="w-full h-full rounded z-10"
    >
      <TileLayer
        url={tileUrl}
        attribution={attribution}
        eventHandlers={{
          tileerror: (error) => {
            Sentry.captureException(
              new Error(`Leaflet Tile Loading Failure: ${error.message || "Unknown network error"}`),
              {
                tags: { component: "Map" },
                extra: { tileUrl: error.tile?.src },
              }
            );
          },
        }}
      />
      {markers.map((marker) => {
        // Ensure latitude and longitude are present
        if (marker.lat && marker.lng) {
          return (
            <Marker
              key={marker.property_id}
              position={[marker.lat, marker.lng]}
            >
              <Popup>
                <div className={isDarkMode ? "text-gray-900" : ""}>
                  <h3 className="font-semibold">{marker.address}</h3>
                  <p>Price: ${marker.price?.toLocaleString()}</p>
                  <p>Bedrooms: {marker.bedrooms}</p>
                  <p>Bathrooms: {marker.bathrooms}</p>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null; // Return null if lat/lng are invalid
      })}
    </MapContainer>
  );
}

export default Map;
