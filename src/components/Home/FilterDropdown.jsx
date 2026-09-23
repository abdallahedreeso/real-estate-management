import { Button, Dropdown } from "antd";
import { MapPin, Navigation, RotateCcw, X } from "lucide-react";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { useHouseStore } from "../../store/useHouseStore";
import { PROPERTY_CATEGORIES } from "../../constants/propertyCategories";

const typeItems = [
  { key: "any", label: "Property type (any)" },
  ...PROPERTY_CATEGORIES.map((key) => ({ key, label: key[0].toUpperCase() + key.slice(1) })),
];
const purposeItems = ["any", "rent", "sale"];
const priceItems = [
  { key: "any", label: "Price range (any)" },
  { key: "1", label: "0 - 100000" },
  { key: "2", label: "100000 - 300000" },
  { key: "3", label: "300000 - 500000" },
  { key: "4", label: "500000 - 99999999" },
];
const radiusOptions = [5, 10, 25, 50, null];

export default function FilterDropdown({ onUseLocation, onChooseOnMap, onDismissLocationError, locating, locationError }) {
  const { t, i18n } = useTranslation();
  const houses = useHouseStore((state) => state.houses);
  const property = useHouseStore((state) => state.property);
  const setProperty = useHouseStore((state) => state.setProperty);
  const listingPurpose = useHouseStore((state) => state.listingPurpose);
  const setListingPurpose = useHouseStore((state) => state.setListingPurpose);
  const price = useHouseStore((state) => state.price);
  const setPrice = useHouseStore((state) => state.setPrice);
  const city = useHouseStore((state) => state.city);
  const setCity = useHouseStore((state) => state.setCity);
  const proximityPoint = useHouseStore((state) => state.proximityPoint);
  const proximitySource = useHouseStore((state) => state.proximitySource);
  const clearProximity = useHouseStore((state) => state.clearProximity);
  const radiusKm = useHouseStore((state) => state.radiusKm);
  const setRadiusKm = useHouseStore((state) => state.setRadiusKm);
  const searchAddress = useHouseStore((state) => state.searchAddress);
  const country = useHouseStore((state) => state.country);
  const resetFilters = useHouseStore((state) => state.resetFilters);
  const cityNames = new Map();
  houses.filter((house) => house.is_available).forEach((house) => {
    const name = String(house.city || "").trim();
    if (name && !cityNames.has(name.toLocaleLowerCase())) cityNames.set(name.toLocaleLowerCase(), name);
  });
  const cities = [...cityNames.values()].sort((a, b) => a.localeCompare(b));
  const selectedType = typeItems.find((item) => item.label === property);
  const selectedPrice = priceItems.find((item) => item.label === price);
  const hasActiveFilters = !property.includes("(any)") || listingPurpose !== "any" || !price.includes("(any)") || Boolean(city || proximityPoint || searchAddress) || !country.includes("(any)");
  const menuPlacement = i18n.dir() === "rtl" ? "bottomRight" : "bottomLeft";

  return (
    <div className="home-filter-controls">
      <div className="home-filter-row">
        <Dropdown rootClassName="home-filter-menu" menu={{ selectedKeys: [selectedType?.key || "any"], items: typeItems.map((item) => ({ key: item.key, label: item.key === "any" ? t("redesign.anyType") : t(`redesign.type_${item.key}`) })), onClick: ({ key }) => setProperty(typeItems.find((item) => item.key === key)?.label || typeItems[0].label) }} placement={menuPlacement}>
          <Button className="home-filter-button">{property.includes("(any)") ? t("redesign.houseType") : selectedType ? t(`redesign.type_${selectedType.key}`) : property}</Button>
        </Dropdown>
        <Dropdown rootClassName="home-filter-menu" menu={{ selectedKeys: [listingPurpose || "any"], items: purposeItems.map((key) => ({ key, label: t(`redesign.purpose_${key}`) })), onClick: ({ key }) => setListingPurpose(key) }} placement={menuPlacement}>
          <Button className="home-filter-button">{listingPurpose && listingPurpose !== "any" ? t(`redesign.purpose_${listingPurpose}`) : t("redesign.listingPurpose")}</Button>
        </Dropdown>
        <Dropdown rootClassName="home-filter-menu" menu={{ selectedKeys: [selectedPrice?.key || "any"], items: priceItems.map((item) => ({ key: item.key, label: item.key === "any" ? t("redesign.anyPrice") : item.label })), onClick: ({ key }) => setPrice(priceItems.find((item) => item.key === key)?.label || priceItems[0].label) }} placement={menuPlacement}>
          <Button className="home-filter-button">{price.includes("(any)") ? t("redesign.priceRange") : price}</Button>
        </Dropdown>
        <Dropdown rootClassName="home-filter-menu" menu={{ selectedKeys: [city], items: [{ key: "", label: t("redesign.anyCity") }, ...cities.map((name) => ({ key: name, label: name }))], onClick: ({ key }) => { setCity(key); onDismissLocationError(); }, style: { maxHeight: 300, overflowY: "auto" } }} placement={menuPlacement}>
          <Button className="home-filter-button">{city || t("redesign.cityFilter")}</Button>
        </Dropdown>
        <button type="button" className="home-filter-reset" onClick={() => { resetFilters(); onDismissLocationError(); }} disabled={!hasActiveFilters}><RotateCcw size={15} aria-hidden="true" />{t("redesign.resetFilters")}</button>
      </div>
      <div className="home-location-row">
        <div className="home-location-copy"><MapPin size={20} aria-hidden="true" /><div><strong>{t("redesign.nearbyTitle")}</strong><span>{t("redesign.nearbyIntro")}</span></div></div>
        <div className="home-location-actions"><button type="button" className="home-location-action" onClick={onUseLocation} disabled={locating}><Navigation size={16} aria-hidden="true" />{t(locating ? "redesign.locating" : "redesign.useLocation")}</button><button type="button" className="home-location-map-action" onClick={onChooseOnMap}>{t("redesign.chooseOnMap")}</button></div>
      </div>
      {proximityPoint && <div className="home-location-active" role="status"><MapPin size={16} aria-hidden="true" /><span>{t(proximitySource === "device" ? "redesign.nearMyLocation" : "redesign.nearMapPin")}</span><Dropdown rootClassName="home-filter-menu" placement={menuPlacement} menu={{ selectedKeys: [radiusKm == null ? "all" : String(radiusKm)], items: radiusOptions.map((radius) => ({ key: radius == null ? "all" : String(radius), label: radius == null ? t("redesign.anyDistance") : t("redesign.withinKm", { count: radius }) })), onClick: ({ key }) => setRadiusKm(key === "all" ? null : Number(key)) }}><button type="button" className="home-radius-button">{radiusKm == null ? t("redesign.anyDistance") : t("redesign.withinKm", { count: radiusKm })}</button></Dropdown><button type="button" className="home-location-clear" onClick={() => { clearProximity(); onDismissLocationError(); }} aria-label={t("redesign.clearLocation")}><X size={16} aria-hidden="true" /></button></div>}
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
