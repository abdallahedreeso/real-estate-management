import { Button, Dropdown } from "antd";
import { MapPin, Navigation, X } from "lucide-react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useHouseStore } from "../../store/useHouseStore";

const typeItems = [
  { key: "any", label: "Property type (any)" },
  { key: "house", label: "House" },
  { key: "apartment", label: "Apartment" },
  { key: "condo", label: "Condo" },
  { key: "townhouse", label: "Townhouse" },
];
const priceItems = [
  { key: "any", label: "Price range (any)" },
  { key: "1", label: "0 - 100000" },
  { key: "2", label: "100000 - 300000" },
  { key: "3", label: "300000 - 500000" },
  { key: "4", label: "500000 - 99999999" },
];
const radiusOptions = [5, 10, 25, 50, null];

export default function FilterDropdown({ onUseLocation, onChooseOnMap, onDismissLocationError, locating, locationError }) {
  const { t } = useTranslation();
  const houses = useHouseStore((state) => state.houses);
  const property = useHouseStore((state) => state.property);
  const setProperty = useHouseStore((state) => state.setProperty);
  const price = useHouseStore((state) => state.price);
  const setPrice = useHouseStore((state) => state.setPrice);
  const city = useHouseStore((state) => state.city);
  const setCity = useHouseStore((state) => state.setCity);
  const proximityPoint = useHouseStore((state) => state.proximityPoint);
  const proximitySource = useHouseStore((state) => state.proximitySource);
  const clearProximity = useHouseStore((state) => state.clearProximity);
  const radiusKm = useHouseStore((state) => state.radiusKm);
  const setRadiusKm = useHouseStore((state) => state.setRadiusKm);
  const cityNames = new Map();
  houses.filter((house) => house.is_available).forEach((house) => {
    const name = String(house.city || "").trim();
    if (name && !cityNames.has(name.toLocaleLowerCase())) cityNames.set(name.toLocaleLowerCase(), name);
  });
  const cities = [...cityNames.values()].sort((a, b) => a.localeCompare(b));
  const selectedType = typeItems.find((item) => item.label === property);

  return (
    <div className="home-filter-controls">
      <div className="home-filter-row">
        <Dropdown menu={{ items: typeItems.map((item) => ({ key: item.key, label: item.key === "any" ? t("redesign.anyType") : t(`redesign.type_${item.key}`) })), onClick: ({ key }) => setProperty(typeItems.find((item) => item.key === key)?.label || typeItems[0].label) }} placement="bottomLeft">
          <Button className="home-filter-button">{property.includes("(any)") ? t("redesign.houseType") : selectedType ? t(`redesign.type_${selectedType.key}`) : property}</Button>
        </Dropdown>
        <Dropdown menu={{ items: priceItems.map((item) => ({ key: item.key, label: item.key === "any" ? t("redesign.anyPrice") : item.label })), onClick: ({ key }) => setPrice(priceItems.find((item) => item.key === key)?.label || priceItems[0].label) }} placement="bottomLeft">
          <Button className="home-filter-button">{price.includes("(any)") ? t("redesign.priceRange") : price}</Button>
        </Dropdown>
        <Dropdown menu={{ items: [{ key: "", label: t("redesign.anyCity") }, ...cities.map((name) => ({ key: name, label: name }))], onClick: ({ key }) => { setCity(key); onDismissLocationError(); }, style: { maxHeight: 300, overflowY: "auto" } }} placement="bottomLeft">
          <Button className="home-filter-button">{city || t("redesign.cityFilter")}</Button>
        </Dropdown>
      </div>
      <div className="home-location-row">
        <div className="home-location-copy"><MapPin size={20} aria-hidden="true" /><div><strong>{t("redesign.nearbyTitle")}</strong><span>{t("redesign.nearbyIntro")}</span></div></div>
        <div className="home-location-actions"><button type="button" className="home-location-action" onClick={onUseLocation} disabled={locating}><Navigation size={16} aria-hidden="true" />{t(locating ? "redesign.locating" : "redesign.useLocation")}</button><button type="button" className="home-location-map-action" onClick={onChooseOnMap}>{t("redesign.chooseOnMap")}</button></div>
      </div>
      {proximityPoint && <div className="home-location-active" role="status"><MapPin size={16} aria-hidden="true" /><span>{t(proximitySource === "device" ? "redesign.nearMyLocation" : "redesign.nearMapPin")}</span><Dropdown menu={{ items: radiusOptions.map((radius) => ({ key: radius == null ? "all" : String(radius), label: radius == null ? t("redesign.anyDistance") : t("redesign.withinKm", { count: radius }) })), onClick: ({ key }) => setRadiusKm(key === "all" ? null : Number(key)) }}><button type="button" className="home-radius-button">{radiusKm == null ? t("redesign.anyDistance") : t("redesign.withinKm", { count: radiusKm })}</button></Dropdown><button type="button" className="home-location-clear" onClick={() => { clearProximity(); onDismissLocationError(); }} aria-label={t("redesign.clearLocation")}><X size={16} aria-hidden="true" /></button></div>}
      {locationError && <p className="home-location-error" role="alert">{locationError}</p>}
    </div>
  );
}

FilterDropdown.propTypes = {
  onUseLocation: PropTypes.func.isRequired,
  onChooseOnMap: PropTypes.func.isRequired,
  onDismissLocationError: PropTypes.func.isRequired,
  locating: PropTypes.bool.isRequired,
  locationError: PropTypes.string,
};
