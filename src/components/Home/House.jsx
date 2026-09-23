import OptimizedImage from "../common/OptimizedImage";
import { ArrowUpRight, BedDouble, Bath, MapPin, Ruler, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";

export default function House({ house }) {
  const { t, i18n } = useTranslation();
  const { image, type, state, address, bedrooms, bathrooms, surface, price, propertyId, distanceKm } = house;
  const formattedPrice = new Intl.NumberFormat(i18n.language.startsWith("ar") ? "ar-EG" : "en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(Number(price) || 0);

  return (
    <Link to={`/property/${propertyId}`} className="property-card" aria-label={`View ${address}, ${state}`}>
      <div className="property-photo">
        {image ? <OptimizedImage src={image} alt={`${type} at ${address}`} className="property-photo-img" /> : <div className="property-photo-placeholder"><Building2 size={42} strokeWidth={1.25} aria-hidden="true" /><span>{t("redesign.imageUnavailable")}</span></div>}
        <span className="property-type">{type}</span>
        <span className="property-arrow"><ArrowUpRight size={19} /></span>
      </div>
      <div className="property-content">
        <div className="property-location"><MapPin size={15} /> {state}</div>
        {distanceKm != null && <div className="property-distance">{t("redesign.distanceAway", { distance: distanceKm < 10 ? distanceKm.toFixed(1) : Math.round(distanceKm) })}</div>}
        <h3>{address}</h3>
        <div className="property-features">
          <span><BedDouble size={16} />{bedrooms ?? "—"} beds</span>
          <span><Bath size={16} />{bathrooms ?? "—"} baths</span>
          <span><Ruler size={16} />{surface ?? "—"} m²</span>
        </div>
        <div className="property-price"><strong dir="ltr">{formattedPrice}</strong><span>{t("redesign.viewProperty")} <ArrowUpRight size={15} /></span></div>
      </div>
    </Link>
  );
}

House.propTypes = {
  house: PropTypes.shape({
    image: PropTypes.string,
    type: PropTypes.string,
    state: PropTypes.string,
    address: PropTypes.string,
    bedrooms: PropTypes.number,
    bathrooms: PropTypes.number,
    surface: PropTypes.number,
    price: PropTypes.number,
    propertyId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    distanceKm: PropTypes.number,
  }).isRequired,
};
