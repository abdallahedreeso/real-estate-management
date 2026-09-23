import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import { divIcon } from "leaflet";
import "leaflet/dist/leaflet.css";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

const CAIRO = [30.0444, 31.2357];
const formatPoint = ([latitude, longitude]) => `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
const pinIcon = divIcon({
  className: "property-location-pin",
  html: '<span aria-hidden="true"></span>',
  iconSize: [26, 26],
  iconAnchor: [13, 26],
});

function MapInteraction({ position, onChange }) {
  const map = useMapEvents({
    click(event) {
      onChange([event.latlng.lat, event.latlng.lng]);
    },
  });
  useEffect(() => {
    if (position) map.flyTo(position, Math.max(map.getZoom(), 15), { duration: 0.5 });
  }, [map, position]);
  return position ? (
    <Marker position={position} icon={pinIcon} draggable eventHandlers={{ dragend: (event) => {
      const point = event.target.getLatLng();
      onChange([point.lat, point.lng]);
    } }} />
  ) : null;
}

MapInteraction.propTypes = { position: PropTypes.array, onChange: PropTypes.func.isRequired };

export default function PropertyLocationPicker({ position, onChange, error }) {
  const { t } = useTranslation();
  const [gpsError, setGpsError] = useState("");
  const [coordinateError, setCoordinateError] = useState(false);
  const [locating, setLocating] = useState(false);
  const [manualPoint, setManualPoint] = useState("");

  useEffect(() => {
    setManualPoint(position ? formatPoint(position) : "");
    if (position) {
      setGpsError("");
      setCoordinateError(false);
    }
  }, [position]);

  const useCurrentLocation = () => {
    setGpsError("");
    if (!window.isSecureContext) {
      setGpsError(t("propertyForm.gpsSecureContext"));
      return;
    }
    if (!navigator.geolocation) {
      setGpsError(t("propertyForm.gpsUnavailable"));
      return;
    }
    setLocating(true);
    const onSuccess = ({ coords }) => {
      if (!Number.isFinite(coords.latitude) || !Number.isFinite(coords.longitude)) {
        setGpsError(t("propertyForm.gpsFailed"));
      } else {
        onChange([coords.latitude, coords.longitude]);
      }
      setLocating(false);
    };
    const onFallbackError = (error) => {
      setGpsError(t(error.code === 1 ? "propertyForm.gpsDenied" : "propertyForm.gpsFailed"));
      setLocating(false);
    };
    navigator.geolocation.getCurrentPosition(onSuccess, (error) => {
      if (error.code === 1) {
        onFallbackError(error);
        return;
      }
      navigator.geolocation.getCurrentPosition(onSuccess, onFallbackError, {
        enableHighAccuracy: true,
        timeout: 12000,
        maximumAge: 60000,
      });
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  };

  const applyManualPoint = () => {
    const values = manualPoint.split(",").map((value) => value.trim());
    const parts = values.map(Number);
    if (values.length !== 2 || values.some((value) => !value) || parts.some((value) => !Number.isFinite(value)) || Math.abs(parts[0]) > 90 || Math.abs(parts[1]) > 180) {
      setGpsError(t("propertyForm.coordinatesInvalid"));
      setCoordinateError(true);
      return;
    }
    setGpsError("");
    setCoordinateError(false);
    onChange(parts);
  };

  return (
    <section id="property-location" className="property-location-section" aria-labelledby="property-location-title">
      <div className="property-section-heading">
        <div><span className="property-step">{t("propertyForm.locationStep")}</span><h3 id="property-location-title">{t("propertyForm.locationTitle")}</h3></div>
        <button type="button" onClick={useCurrentLocation} disabled={locating} className="property-gps-button">
          {locating ? t("propertyForm.locating") : t("propertyForm.useGps")}
        </button>
      </div>
      <p className="property-section-help">{t("propertyForm.locationHelp")}</p>
      <div className="property-coordinate-entry">
        <label htmlFor="property-coordinates">{t("propertyForm.coordinatesLabel")}</label>
        <div><input id="property-coordinates" type="text" inputMode="decimal" placeholder="30.0444, 31.2357" value={manualPoint} onChange={(event) => { setManualPoint(event.target.value); setCoordinateError(false); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); applyManualPoint(); } }} aria-invalid={coordinateError} aria-describedby={coordinateError ? "property-coordinate-error" : undefined} /><button type="button" onClick={applyManualPoint}>{t("propertyForm.setPin")}</button></div>
      </div>
      <div className="property-location-map" dir="ltr">
        <MapContainer center={position || CAIRO} zoom={position ? 15 : 11} scrollWheelZoom={false} className="property-location-map-canvas">
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <MapInteraction position={position} onChange={onChange} />
        </MapContainer>
        <span className="property-map-hint" aria-hidden="true">{position ? t("propertyForm.pinPlaced") : t("propertyForm.tapMap")}</span>
      </div>
      {position && <button type="button" className="property-pin-clear" onClick={() => onChange(null)}>{t("propertyForm.removePin")}</button>}
      <span className="sr-only" aria-live="polite">{position ? t("propertyForm.pinPlaced") : ""}</span>
      {(error || gpsError) && <p id="property-coordinate-error" role="alert" className="property-field-error">{error || gpsError}</p>}
    </section>
  );
}

PropertyLocationPicker.propTypes = { position: PropTypes.array, onChange: PropTypes.func.isRequired, error: PropTypes.string };
