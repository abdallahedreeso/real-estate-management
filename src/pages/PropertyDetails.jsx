import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "@clerk/clerk-react";
import { FacebookShareButton, TwitterShareButton, WhatsappShareButton } from "react-share";
import { message } from "antd";
import {
  ArrowLeft, ArrowUpRight, Bath, BedDouble, Building2, CalendarDays,
  CarFront, Copy, Heart, House, MapPin, MessageCircle, Ruler, Share2,
} from "lucide-react";
import OptimizedImage from "@/components/common/OptimizedImage";
import ChatBox from "@/components/chat/ChatBox";
import { useHouseStore } from "../store/useHouseStore";
import useSupabaseClient from "../backend/supabase/supabase";
import whatsappIcon from "../assets/img/icons/whatsapp.svg";
import { egyptianWhatsAppNumber } from "../utils/contact";
import { useSaleCopy } from "@/sales/copy";
import { protectedSalesEnabled } from "@/sales/config";
import { useTranslation } from "react-i18next";
import { governorateLabel } from "../constants/governorates";
import PropTypes from "prop-types";

const Map = lazy(() => import("@/components/Home/Map"));

function PropertyMap({ markers }) {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!mapRef.current || visible) return;
    if (!("IntersectionObserver" in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "300px" });
    observer.observe(mapRef.current);
    return () => observer.disconnect();
  }, [visible]);

  if (!markers.some((marker) => marker.lat != null && marker.lng != null)) {
    return <div className="property-map property-map-unavailable"><MapPin size={25} aria-hidden="true" /> {t("propertyDetails.mapUnavailable")}</div>;
  }
  return <div ref={mapRef} className="property-map">{visible && <Suspense fallback={null}><Map markers={markers} center={[Number(markers[0].lat), Number(markers[0].lng)]} /></Suspense>}</div>;
}

PropertyMap.propTypes = { markers: PropTypes.array.isRequired };

export default function PropertyDetails() {
  const { id } = useParams();
  const { userId } = useAuth();
  const { t, i18n } = useTranslation();
  const saleCopy = useSaleCopy();
  const supabase = useSupabaseClient();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportReason, setReportReason] = useState("fraud");
  const [reportDetails, setReportDetails] = useState("");
  const [reportError, setReportError] = useState("");
  const incrementWishlist = useHouseStore((state) => state.incrementWishlist);
  const decrementWishlist = useHouseStore((state) => state.decrementWishlist);
  const isOnline = useHouseStore((state) => state.isOnline);
  const queueOfflineAction = useHouseStore((state) => state.queueOfflineAction);

  const markers = useMemo(() => house ? [{
    property_id: house.property_id,
    lat: house.latitude || house.lat,
    lng: house.longitude || house.lng,
    address: house.address,
    price: house.price,
    bedrooms: house.Bedrooms,
    bathrooms: house.Bathrooms,
  }] : [], [house]);

  useEffect(() => {
    if (!supabase || !id) { setLoading(false); setFetchError(true); return; }
    let active = true;
    const fetchHouse = async () => {
      setLoading(true);
      setFetchError(false);
      try {
        const { data, error } = await supabase.from("properties")
          .select("property_id, title, seller_id, address, price, property_type, property_category, country, state, seller_phone, is_available, Bedrooms, Bathrooms, surface_area, zip_code, created_at, description, latitude, longitude, ParkingSpaces, images")
          .eq("property_id", id).single();
        if (error) throw error;
        if (active) setHouse(data);
      } catch (error) {
        console.error("Error fetching property data:", error);
        if (active) { setHouse(null); setFetchError(true); }
      } finally {
        if (active) setLoading(false);
      }
    };
    const fetchWishlist = async () => {
      if (!userId) return;
      const { data, error } = await supabase.from("wishlist").select("id")
        .eq("property_id", id).eq("user_id", userId);
      if (error) console.error("Error fetching wishlist status:", error);
      else if (active) setIsInWishlist(Boolean(data?.length));
    };
    fetchHouse();
    fetchWishlist();
    return () => { active = false; };
  }, [id, supabase, userId]);

  if (loading) return <div className="property-state site-container" role="status"><div className="property-state-image" /><div className="property-state-lines"><span /><span /><span /></div><span className="sr-only">{t("propertyDetails.loading")}</span></div>;
  if (!house) return <div className="property-state property-state-error site-container"><h1>{t(fetchError ? "propertyDetails.unavailable" : "propertyDetails.notFound")}</h1><Link to="/#explore">{t("propertyDetails.back")} <ArrowUpRight size={18} /></Link></div>;

  const shareUrl = new URL(`/property/${id}`, window.location.origin).href;
  const address = [house.address, governorateLabel(house.state, i18n.language), house.zip_code].filter(Boolean).join(", ");
  const price = new Intl.NumberFormat(i18n.language.startsWith("ar") ? "ar-EG" : "en-EG", { style: "currency", currency: "EGP", maximumFractionDigits: 0 }).format(Number(house.price) || 0);
  const listedDate = house.created_at ? new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(new Date(house.created_at)) : null;
  const imageUrl = house.images?.[0];
  const facts = [
    { icon: House, label: t("form.propertyType"), value: house.property_type ? t(`redesign.purpose_${house.property_type}`, { defaultValue: house.property_type }) : null },
    { icon: House, label: t("form.propertyCategory"), value: house.property_category ? t(`redesign.type_${house.property_category}`, { defaultValue: house.property_category }) : null },
    { icon: Ruler, label: t("propertyDetails.area"), value: house.surface_area != null ? `${house.surface_area} m²` : null },
    { icon: BedDouble, label: t("propertyDetails.bedrooms"), value: house.Bedrooms },
    { icon: Bath, label: t("propertyDetails.bathrooms"), value: house.Bathrooms },
    { icon: CarFront, label: t("propertyDetails.parking"), value: house.ParkingSpaces },
    { icon: CalendarDays, label: t("propertyDetails.listed"), value: listedDate },
  ];

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      message.success(t("propertyDetails.copied"));
      setDropdownOpen(false);
    } catch {
      message.error(t("propertyDetails.copyFailed"));
    }
  };

  const toggleWishlist = async () => {
    const nextValue = !isInWishlist;
    if (!isOnline) {
      setIsInWishlist(nextValue);
      if (nextValue) incrementWishlist(); else decrementWishlist();
      queueOfflineAction({ propertyId: id, operation: nextValue ? "ADD" : "REMOVE" });
      message.info(t("propertyDetails.savedOffline"));
      return;
    }
    try {
      if (nextValue) {
        const { error } = await supabase.from("wishlist").insert({ property_id: id, user_id: userId });
        if (error) throw error;
        incrementWishlist();
      } else {
        const { error } = await supabase.from("wishlist").delete().eq("property_id", id).eq("user_id", userId);
        if (error) throw error;
        decrementWishlist();
      }
      setIsInWishlist(nextValue);
      message.success(t(nextValue ? "propertyDetails.saved" : "propertyDetails.removed"));
    } catch (error) {
      console.error("Wishlist update failed:", error);
      message.error(t("propertyDetails.saveFailed"));
    }
  };

  const handleWhatsAppClick = () => {
    const phone = egyptianWhatsAppNumber(house.seller_phone);
    if (phone) {
      const text = t("inquiries.whatsAppIntro", { property: house.title || house.address, url: shareUrl });
      window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, "_blank", "noopener,noreferrer");
    }
    else message.error(t("propertyDetails.noPhone"));
  };

  const submitReport = async (event) => {
    event.preventDefault(); setReportError("");
    const { error } = await supabase.from("listing_reports").insert({ property_id: id, reporter_id: userId, reason: reportReason, details: reportDetails.trim() });
    if (error) setReportError(error.message);
    else { setReportOpen(false); setReportDetails(""); message.success(saleCopy.reportSent); }
  };

  return (
    <main className="property-detail">
      <div className="site-container">
        <Link to="/#explore" className="property-back"><ArrowLeft size={17} aria-hidden="true" /> {t("propertyDetails.back")}</Link>
        <div className="property-hero">
          <div className="property-hero-image">
            {imageUrl ? <OptimizedImage src={imageUrl} alt={house.title || address} className="property-main-image" loading="eager" fetchPriority="high" /> : <div className="property-main-placeholder"><Building2 size={58} strokeWidth={1.2} aria-hidden="true" /><span>{t("redesign.imageUnavailable")}</span></div>}
          </div>
          <div className="property-hero-copy">
            {house.property_type && <span className="property-hero-type">{t(`redesign.purpose_${house.property_type}`, { defaultValue: house.property_type })}</span>}
            <h1>{house.title || house.address}</h1>
            <p className="property-hero-address"><MapPin size={19} aria-hidden="true" /> {address}</p>
            <div className="property-hero-price"><span>{t("propertyDetails.price")}</span><strong dir="ltr">{price}</strong></div>
            <div className="property-hero-actions">
              {userId && <button type="button" className={`property-action${isInWishlist ? " is-active" : ""}`} onClick={toggleWishlist} aria-pressed={isInWishlist}><Heart size={19} fill={isInWishlist ? "currentColor" : "none"} aria-hidden="true" /> {t(isInWishlist ? "propertyDetails.savedAction" : "propertyDetails.save")}</button>}
              <div className="property-share-wrap">
                <button type="button" className="property-action" onClick={() => setDropdownOpen((open) => !open)} aria-expanded={dropdownOpen} aria-controls="property-share-menu"><Share2 size={19} aria-hidden="true" /> {t("propertyDetails.share")}</button>
                {dropdownOpen && <div id="property-share-menu" className="property-share-menu"><button type="button" onClick={handleCopyLink}><Copy size={17} /> {t("propertyDetails.copyLink")}</button><FacebookShareButton url={shareUrl} onClick={() => setDropdownOpen(false)}>{t("propertyDetails.facebook")}</FacebookShareButton><TwitterShareButton url={shareUrl} onClick={() => setDropdownOpen(false)}>{t("propertyDetails.twitter")}</TwitterShareButton><WhatsappShareButton url={shareUrl} onClick={() => setDropdownOpen(false)}>{t("propertyDetails.whatsapp")}</WhatsappShareButton></div>}
              </div>
            </div>
          </div>
        </div>

        <div className="property-body-grid">
          <div className="property-body-main">
            <section className="property-facts" aria-labelledby="property-facts-title"><h2 id="property-facts-title">{t("propertyDetails.features")}</h2><dl>{facts.map(({ icon: Icon, label, value }) => <div key={label}><Icon size={25} strokeWidth={1.5} aria-hidden="true" /><dt>{label}</dt><dd>{value ?? "—"}</dd></div>)}</dl></section>
            {house.description && <section className="property-description" aria-labelledby="property-description-title"><h2 id="property-description-title">{t("propertyDetails.description")}</h2><p>{house.description}</p></section>}
            <section className="property-location" aria-labelledby="property-location-title"><h2 id="property-location-title">{t("propertyDetails.location")}</h2><p><MapPin size={18} aria-hidden="true" /> {address}</p><PropertyMap markers={markers} /></section>
          </div>
          <aside className="property-contact-panel">
            <h2>{t("propertyDetails.contactTitle")}</h2>
            <p>{t("propertyDetails.contactIntro")}</p>
            {!house.is_available && userId !== house.seller_id ? <p>{t("inquiries.unavailable")}</p> : !userId ? <Link to="/?sign-in=true" className="property-contact-button"><MessageCircle size={19} aria-hidden="true" /> {t("propertyDetails.signIn")}</Link> : userId === house.seller_id ? <Link to="/Messages" className="property-contact-button"><MessageCircle size={19} aria-hidden="true" /> {t("inquiries.openInbox")}</Link> : <>
              {house.property_type !== "sale" && <button type="button" className="property-contact-button" onClick={handleWhatsAppClick}><img src={whatsappIcon} alt="" width="20" height="20" /> {t("propertyDetails.messageWhatsapp")}</button>}
              <div className="property-chat"><h3>{t("propertyDetails.liveChat")}</h3><ChatBox propertyId={String(house.property_id)} sellerId={house.seller_id} propertyTitle={house.title || house.address} /></div>
            </>}
            {protectedSalesEnabled && house.property_type === "sale" && userId && userId !== house.seller_id && <div className="sale-report"><button type="button" onClick={() => setReportOpen((open) => !open)}>{saleCopy.report}</button>{reportOpen && <form onSubmit={submitReport} className="sale-form"><label>{saleCopy.reportReason}<select value={reportReason} onChange={(event) => setReportReason(event.target.value)}>{["fraud","duplicate","wrong_details","other"].map((reason) => <option key={reason} value={reason}>{saleCopy[reason]}</option>)}</select></label><label>{saleCopy.reportDetails}<textarea minLength={10} maxLength={2000} required value={reportDetails} onChange={(event) => setReportDetails(event.target.value)} /></label><button type="submit">{saleCopy.report}</button>{reportError && <p role="alert">{reportError}</p>}</form>}</div>}
          </aside>
        </div>
      </div>
    </main>
  );
}
