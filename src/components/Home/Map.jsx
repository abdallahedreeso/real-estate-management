import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { divIcon } from "leaflet";
import { useEffect } from "react";
import * as Sentry from "@sentry/react";
import "leaflet/dist/leaflet.css";
import { useTheme } from "../../context/ThemeContext";
import PropTypes from "prop-types";
import { validPoint } from "@/utils/geo";
import { useTranslation } from "react-i18next";

const markerIcon = divIcon({ className: "property-location-pin", html: '<span aria-hidden="true"></span>', iconSize: [26, 26], iconAnchor: [13, 26] });
const searchPinIcon = divIcon({ className: "home-search-pin", html: '<span aria-hidden="true"></span>', iconSize: [32, 32], iconAnchor: [16, 16] });
function CenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (validPoint(center?.[0], center?.[1])) map.setView(center);
  }, [map, center]);
  return null;
}
CenterMap.propTypes = { center: PropTypes.arrayOf(PropTypes.number) };

function PickArea({ onPickLocation }) {
  useMapEvents({ click: (event) => onPickLocation([event.latlng.lat, event.latlng.lng]) });
  return null;
}
PickArea.propTypes = { onPickLocation: PropTypes.func.isRequired };

function Map({ markers, center = [30.143055439268853, 31.394735395877987], selectedPoint, onPickLocation }) {
  const { isDarkMode } = useTheme();
  const { t, i18n } = useTranslation();

  // Optimized Tile Layer URL and Attribution depending on Light / Dark Mode
  const tileUrl = isDarkMode
    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

  const attribution = isDarkMode
    ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
    : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={false}
      className="w-full h-full rounded z-10"
    >
      <CenterMap center={center} />
      {onPickLocation && <PickArea onPickLocation={onPickLocation} />}
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
        if (validPoint(marker.lat, marker.lng)) {
          return (
            <Marker
              key={marker.property_id}
              position={[Number(marker.lat), Number(marker.lng)]}
              icon={markerIcon}
            >
              <Popup>
                <div className={isDarkMode ? "text-gray-900" : ""}>
                  <h3 className="font-semibold">{marker.address}</h3>
                  <p>{Number(marker.price || 0).toLocaleString(i18n.language)} {t("redesign.priceUnit")}</p>
                  <p>{t("redesign.beds")}: {marker.bedrooms}</p>
                  <p>{t("redesign.baths")}: {marker.bathrooms}</p>
                </div>
              </Popup>
            </Marker>
          );
        }
        return null; // Return null if lat/lng are invalid
      })}
      {selectedPoint && <Marker position={selectedPoint} icon={searchPinIcon} />}
    </MapContainer>
  );
}

Map.propTypes = {
  markers: PropTypes.array.isRequired,
  center: PropTypes.arrayOf(PropTypes.number),
  selectedPoint: PropTypes.arrayOf(PropTypes.number),
  onPickLocation: PropTypes.func,
};

export default Map;
