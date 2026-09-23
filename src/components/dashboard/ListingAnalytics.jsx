import PropTypes from "prop-types";
import { useTranslation } from "react-i18next";
import { governorateLabel } from "../../constants/governorates";

const listingPurpose = (value) =>
  String(value || "").toLowerCase().includes("rent") || String(value || "").includes("إيجار")
    ? "rent"
    : "sale";

export default function ListingAnalytics({ properties = [] }) {
  const { t, i18n } = useTranslation();
  const total = properties.length;
  const available = properties.filter((item) => item.is_available).length;
  const rent = properties.filter((item) => listingPurpose(item.property_type) === "rent").length;
  const sale = total - rent;
  const regions = Object.entries(properties.reduce((counts, item) => {
    const region = item.state || t("listings.unknownRegion");
    counts[region] = (counts[region] || 0) + 1;
    return counts;
  }, {})).sort((a, b) => b[1] - a[1]);

  const stats = [
    { label: t("listings.totalListings"), value: total, className: "total" },
    { label: t("listings.availableListings"), value: available, className: "available" },
    { label: t("listings.saleListings"), value: sale, className: "sale" },
    { label: t("listings.rentalListings"), value: rent, className: "rent" },
  ];

  return (
    <div className="my-listings-overview">
      <div className="my-listings-stats" aria-label={t("listings.overview")}>
        {stats.map((stat, index) => (
          <div className={`my-listings-stat my-listings-stat-${stat.className}`} key={stat.className}>
            <span className="my-listings-stat-number">0{index + 1} / {stat.label}</span>
            <strong>{stat.value.toLocaleString()}</strong>
          </div>
        ))}
      </div>
      {total > 0 && (
        <div className="my-listings-insights">
          <section className="my-listings-insight my-listings-mix" aria-labelledby="listing-mix-title">
            <span className="my-listings-eyebrow">{t("listings.overview")}</span>
            <h2 id="listing-mix-title">{t("listings.listingMix")}</h2>
            <div className="my-listings-mix-bar" role="img" aria-label={`${t("listings.saleListings")}: ${sale}; ${t("listings.rentalListings")}: ${rent}`}>
              <span style={{ width: `${(sale / total) * 100}%` }} />
            </div>
            <div className="my-listings-mix-legend">
              <span><i className="my-listings-dot-sale" />{t("listings.saleListings")} <strong>{sale}</strong></span>
              <span><i className="my-listings-dot-rent" />{t("listings.rentalListings")} <strong>{rent}</strong></span>
            </div>
          </section>
          <section className="my-listings-insight" aria-labelledby="listing-regions-title">
            <span className="my-listings-eyebrow">{t("listings.overview")}</span>
            <h2 id="listing-regions-title">{t("listings.byRegion")}</h2>
            <div className="my-listings-regions">
              {regions.slice(0, 4).map(([region, count]) => (
                <div className="my-listings-region" key={region}>
                  <span>{governorateLabel(region, i18n.language)}</span>
                  <div aria-hidden="true"><span style={{ width: `${(count / total) * 100}%` }} /></div>
                  <strong>{count}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

ListingAnalytics.propTypes = {
  properties: PropTypes.arrayOf(PropTypes.shape({
    property_type: PropTypes.string,
    state: PropTypes.string,
    is_available: PropTypes.bool,
  })),
};
