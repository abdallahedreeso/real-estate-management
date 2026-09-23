import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { governorateLabel } from "../constants/governorates";
import { useAuth } from "@clerk/clerk-react";
import { message, Spin } from "antd";
import { ArrowRight, ArrowUpRight, Bath, BedDouble, Building2, Heart, MapPin, Ruler, X } from "lucide-react";
import { Link } from "react-router-dom";
import useSupabaseClient from "@/backend/supabase/supabase";
import OptimizedImage from "@/components/common/OptimizedImage";
import { useHouseStore } from "@/store/useHouseStore";
import emptyState from "../assets/img/properties-empty.webp";
import "@/assets/style/pages/wishlist.css";

const PAGE_SIZE = 6;

export default function Wishlist() {
  const { t, i18n } = useTranslation();
  const { userId, isLoaded } = useAuth();
  const supabase = useSupabaseClient();
  const isOnline = useHouseStore((state) => state.isOnline);
  const queueOfflineAction = useHouseStore((state) => state.queueOfflineAction);
  const decrementWishlist = useHouseStore((state) => state.decrementWishlist);
  const [savedHomes, setSavedHomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [removingId, setRemovingId] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!isLoaded || !supabase) return;
    if (!userId) { setLoading(false); return; }
    let active = true;
    const load = async () => {
      setLoading(true);
      setError(false);
      try {
        const { data, error: fetchError } = await supabase.from("wishlist")
          .select("id,property_id,properties(property_id,title,price,state,property_type,address,Bedrooms,Bathrooms,surface_area,images,is_available)")
          .eq("user_id", userId);
        if (fetchError) throw fetchError;
        if (active) setSavedHomes((data || []).filter((item) => item.properties));
      } catch (fetchError) {
        console.error("Could not load saved properties:", fetchError);
        if (active) setError(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [supabase, userId, isLoaded]);

  const removeSavedHome = async (item) => {
    if (!userId || removingId) return;
    setRemovingId(item.id);
    try {
      if (isOnline) {
        const { error: removeError } = await supabase.from("wishlist").delete()
          .eq("id", item.id).eq("user_id", userId);
        if (removeError) throw removeError;
      } else {
        queueOfflineAction({ propertyId: item.property_id, operation: "REMOVE" });
      }
      setSavedHomes((current) => current.filter((saved) => saved.id !== item.id));
      setPage((current) => Math.max(1, Math.min(current, Math.ceil((savedHomes.length - 1) / PAGE_SIZE))));
      decrementWishlist();
      message.success(t(isOnline ? "wishlist.removed" : "propertyDetails.savedOffline"));
    } catch (removeError) {
      console.error("Could not remove saved property:", removeError);
      message.error(t("wishlist.removeFailed"));
    } finally {
      setRemovingId(null);
    }
  };

  const visible = savedHomes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageCount = Math.ceil(savedHomes.length / PAGE_SIZE);
  const priceFormatter = new Intl.NumberFormat(i18n.language.startsWith("ar") ? "ar-EG" : "en-EG", {
    style: "currency", currency: "EGP", maximumFractionDigits: 0,
  });

  return (
    <div className="wishlist-page">
      <header className="wishlist-hero">
        <div className="site-container wishlist-hero-inner">
          <div>
            <span className="wishlist-kicker">{t("wishlist.kicker")}</span>
            <h1>{t("wishlist.myWishlist")}</h1>
            <p>{t("wishlist.intro")}</p>
          </div>
          <div className="wishlist-hero-symbol" aria-hidden="true"><Heart size={130} strokeWidth={.8} /></div>
        </div>
      </header>
      <main className="site-container wishlist-content">
        <div className="wishlist-toolbar">
          <div className="wishlist-count"><Heart size={20} fill="currentColor" aria-hidden="true" /><strong>{savedHomes.length}</strong><span>{t(savedHomes.length === 1 ? "wishlist.savedSingle" : "wishlist.savedCount")}</span></div>
          <Link to="/#explore" className="wishlist-explore-link">{t("wishlist.explore")} <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>

        {!isLoaded || loading ? (
          <div className="wishlist-state" role="status"><Spin size="large" /><p>{t("wishlist.loading")}</p></div>
        ) : error ? (
          <div className="wishlist-state"><Building2 size={35} aria-hidden="true" /><h2>{t("wishlist.errorTitle")}</h2><button type="button" onClick={() => window.location.reload()}>{t("wishlist.retry")}</button></div>
        ) : savedHomes.length === 0 ? (
          <section className="wishlist-empty">
            <div className="wishlist-empty-image"><img src={emptyState} alt="" loading="lazy" /></div>
            <div><span className="wishlist-kicker">{t("wishlist.kicker")}</span><h2>{t("wishlist.empty")}</h2><p>{t("wishlist.emptySub")}</p><Link to="/#explore">{t("wishlist.explore")} <ArrowRight size={18} aria-hidden="true" /></Link></div>
          </section>
        ) : (
          <section className="wishlist-collection" aria-labelledby="wishlist-collection-title">
            <div className="wishlist-section-heading"><div><span className="wishlist-section-kicker">{t("wishlist.savedPlaces")}</span><h2 id="wishlist-collection-title">{t("wishlist.shortlist")}</h2></div><p>{t("wishlist.collectionIntro")}</p></div>
            <div className="wishlist-grid">
              {visible.map((item) => {
                const home = item.properties;
                const image = Array.isArray(home.images) ? home.images[0] : null;
                const isRent = String(home.property_type || "").toLowerCase().includes("rent");
                return (
                  <article className="wishlist-card" key={item.id}>
                    <div className="wishlist-card-media">
                      <Link to={`/property/${item.property_id}`} aria-label={`${t("wishlist.view")}: ${home.title || home.address}`}>
                        {image ? <OptimizedImage src={image} alt="" className="wishlist-card-photo" /> : <span className="wishlist-card-placeholder"><Building2 size={36} aria-hidden="true" /></span>}
                      </Link>
                      <span className="wishlist-card-type">{t(isRent ? "wishlist.rent" : "wishlist.sale")}</span>
                      <button type="button" className="wishlist-remove" aria-label={`${t("wishlist.remove")}: ${home.title || home.address}`} title={t("wishlist.remove")} disabled={removingId === item.id} onClick={() => removeSavedHome(item)}><X size={18} aria-hidden="true" /></button>
                    </div>
                    <div className="wishlist-card-body">
                      <span className={`wishlist-availability ${home.is_available ? "is-available" : ""}`}>{t(home.is_available ? "wishlist.available" : "wishlist.unavailable")}</span>
                      <h3><Link to={`/property/${item.property_id}`}>{home.title || home.address}</Link></h3>
                      <p className="wishlist-card-address"><MapPin size={16} aria-hidden="true" />{[home.address, governorateLabel(home.state, i18n.language)].filter(Boolean).join(", ")}</p>
                      <div className="wishlist-card-features">
                        <span><BedDouble size={16} aria-hidden="true" />{home.Bedrooms ?? "—"} {t("wishlist.beds")}</span>
                        <span><Bath size={16} aria-hidden="true" />{home.Bathrooms ?? "—"} {t("wishlist.baths")}</span>
                        <span><Ruler size={16} aria-hidden="true" />{home.surface_area ?? "—"} m²</span>
                      </div>
                      <div className="wishlist-card-footer"><div><small>{t("wishlist.askingPrice")}</small><strong dir="ltr">{priceFormatter.format(Number(home.price) || 0)}</strong></div><Link to={`/property/${item.property_id}`} aria-label={`${t("wishlist.view")}: ${home.title || home.address}`}><ArrowUpRight size={19} aria-hidden="true" /></Link></div>
                    </div>
                  </article>
                );
              })}
            </div>
            {pageCount > 1 && <div className="wishlist-pagination"><button type="button" disabled={page === 1} onClick={() => setPage((current) => current - 1)}>{t("wishlist.previous")}</button><span>{page} / {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage((current) => current + 1)}>{t("wishlist.next")}</button></div>}
          </section>
        )}
      </main>
    </div>
  );
}
