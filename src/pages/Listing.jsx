import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@clerk/clerk-react";
import { Button, message, Popconfirm, Spin, Switch } from "antd";
import { ArrowRight, Building2, MapPin, Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import useSupabaseClient from "../backend/supabase/supabase";
import { ownedImagePaths } from "@/api/propertyImages";
import ListingAnalytics from "@/components/dashboard/ListingAnalytics";
import OptimizedImage from "@/components/common/OptimizedImage";
import "@/assets/style/pages/listing.css";

const PAGE_SIZE = 8;

export default function Listing() {
  const { t, i18n } = useTranslation();
  const { userId } = useAuth();
  const supabase = useSupabaseClient();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!supabase || !userId) return;
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(false);
      const { data, error: fetchError } = await supabase
        .from("properties")
        .select("property_id,title,price,state,property_type,address,is_available,images")
        .eq("seller_id", userId);
      if (!active) return;
      if (fetchError) {
        setError(true);
      } else {
        setProperties((data || []).map((item) => ({ ...item, key: item.property_id })));
      }
      setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [supabase, userId]);

  const filtered = useMemo(() => properties.filter((item) => {
    const matchesStatus = filter === "all" || (filter === "available" ? item.is_available : !item.is_available);
    const searchText = `${item.title || ""} ${item.address || ""} ${item.state || ""}`.toLocaleLowerCase();
    return matchesStatus && searchText.includes(query.trim().toLocaleLowerCase());
  }), [properties, filter, query]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const availableCount = properties.filter((item) => item.is_available).length;
  const priceFormatter = new Intl.NumberFormat(i18n.language.startsWith("ar") ? "ar-EG" : "en-EG", {
    style: "currency", currency: "EGP", maximumFractionDigits: 0,
  });

  const chooseFilter = (nextFilter) => { setFilter(nextFilter); setPage(1); };
  const changeQuery = (event) => { setQuery(event.target.value); setPage(1); };

  const removeProperty = async (property) => {
    if (!userId) return;
    setDeletingId(property.key);
    try {
      const { error: deleteError } = await supabase.from("properties").delete()
        .eq("property_id", property.key).eq("seller_id", userId);
      if (deleteError) throw deleteError;
      setProperties((current) => current.filter((item) => item.key !== property.key));
      setPage((current) => Math.max(1, Math.min(current, Math.ceil((filtered.length - 1) / PAGE_SIZE))));
      const paths = ownedImagePaths(property.images, userId);
      if (paths.length) {
        const { error: cleanupError } = await supabase.storage.from("images").remove(paths);
        if (cleanupError) console.warn("Could not clean up property photos:", cleanupError);
      }
      message.success(t("listings.deleteSuccess"));
    } catch (deleteError) {
      console.error("Could not delete property:", deleteError);
      message.error(t("listings.deleteFailed"));
    } finally {
      setDeletingId(null);
    }
  };

  const toggleAvailability = async (property) => {
    if (!userId) return;
    setUpdatingId(property.key);
    try {
      const nextValue = !property.is_available;
      const { error: updateError } = await supabase.from("properties")
        .update({ is_available: nextValue })
        .eq("property_id", property.key).eq("seller_id", userId);
      if (updateError) throw updateError;
      setProperties((current) => current.map((item) => item.key === property.key ? { ...item, is_available: nextValue } : item));
      message.success(t("listings.updateSuccess"));
    } catch (updateError) {
      console.error("Could not update availability:", updateError);
      message.error(t("listings.updateFailed"));
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="my-listings-page">
      <header className="my-listings-hero">
        <div className="site-container my-listings-hero-inner">
          <div>
            <span className="my-listings-hero-kicker">{t("listings.ownerSpace")}</span>
            <h1>{t("listings.myProperties")}</h1>
            <p>{t("listings.intro")}</p>
          </div>
          <Link className="my-listings-add" to="/AddProperty"><Plus size={18} aria-hidden="true" />{t("listings.addProperty")}</Link>
        </div>
      </header>
      <main className="site-container my-listings-content">
        {loading ? (
          <div className="my-listings-state" role="status"><Spin size="large" /><p>{t("listings.loading")}</p></div>
        ) : error ? (
          <div className="my-listings-state"><Building2 size={34} aria-hidden="true" /><h2>{t("listings.loadFailed")}</h2><Button onClick={() => window.location.reload()}>{t("listings.retry")}</Button></div>
        ) : (
          <>
            <ListingAnalytics properties={properties} />
            {properties.length === 0 ? (
              <section className="my-listings-empty">
                <Building2 size={38} aria-hidden="true" />
                <h2>{t("listings.emptyTitle")}</h2>
                <p>{t("listings.emptyIntro")}</p>
                <Link className="my-listings-add" to="/AddProperty"><Plus size={18} aria-hidden="true" />{t("listings.addProperty")}</Link>
              </section>
            ) : (
              <section className="my-listings-collection" aria-labelledby="my-listings-collection-title">
                <div className="my-listings-section-heading">
                  <div><span className="my-listings-eyebrow">{t("listings.manageLabel")}</span><h2 id="my-listings-collection-title">{t("listings.yourListings")}</h2></div>
                  <p>{t("listings.manageIntro")}</p>
                </div>
                <div className="my-listings-toolbar">
                  <div className="my-listings-filters" role="group" aria-label={t("listings.filterLabel")}>
                    {[["all", properties.length], ["available", availableCount], ["paused", properties.length - availableCount]].map(([value, count]) => (
                      <button type="button" key={value} aria-pressed={filter === value} onClick={() => chooseFilter(value)}>
                        {t(`listings.filter_${value}`)} <span>{count}</span>
                      </button>
                    ))}
                  </div>
                  <label className="my-listings-search"><Search size={18} aria-hidden="true" /><span className="sr-only">{t("listings.searchLabel")}</span><input type="search" value={query} onChange={changeQuery} placeholder={t("listings.searchPlaceholder")} /></label>
                </div>
                {visible.length === 0 ? (
                  <div className="my-listings-no-results">{t("listings.noResults")}</div>
                ) : (
                  <div className="my-listings-cards">
                    {visible.map((property) => {
                      const cover = Array.isArray(property.images) ? property.images[0] : null;
                      const purpose = String(property.property_type || "").toLowerCase().includes("rent") ? "rent" : "sale";
                      return (
                        <article className="my-listings-card" key={property.key}>
                          <Link className="my-listings-card-image" to={`/property/${property.key}`} aria-label={`${t("listings.view")}: ${property.title}`}>
                            {cover ? <OptimizedImage src={cover} alt="" className="my-listings-cover" /> : <Building2 size={38} aria-hidden="true" />}
                          </Link>
                          <div className="my-listings-card-details">
                            <span className="my-listings-card-type">{t(`listings.${purpose}`)}</span>
                            <h3><Link to={`/property/${property.key}`}>{property.title}</Link></h3>
                            <p><MapPin size={15} aria-hidden="true" />{[property.address, property.state].filter(Boolean).join(", ")}</p>
                          </div>
                          <div className="my-listings-card-price"><span>{t("listings.askingPrice")}</span><strong dir="ltr">{priceFormatter.format(Number(property.price) || 0)}</strong></div>
                          <div className="my-listings-card-manage">
                            <label className="my-listings-availability"><Switch checked={!!property.is_available} loading={updatingId === property.key} disabled={updatingId === property.key || deletingId === property.key} onChange={() => toggleAvailability(property)} aria-label={`${t("listings.isAvailable")}: ${property.title}`} /><span>{t(property.is_available ? "listings.available" : "listings.paused")}</span></label>
                            <div className="my-listings-actions">
                              <Link to={`/MyProperty/edit/${property.key}`}>{t("listings.edit")}</Link>
                              <Popconfirm title={t("listings.deleteConfirm")} description={t("listings.deleteWarning")} onConfirm={() => removeProperty(property)} okText={t("listings.yes")} cancelText={t("listings.no")} okButtonProps={{ danger: true }}>
                                <Button type="text" danger loading={deletingId === property.key}>{t("listings.delete")}</Button>
                              </Popconfirm>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                )}
                {pageCount > 1 && <div className="my-listings-pagination"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>{t("listings.previous")}</button><span>{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>{t("listings.next")} <ArrowRight size={15} aria-hidden="true" /></button></div>}
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
