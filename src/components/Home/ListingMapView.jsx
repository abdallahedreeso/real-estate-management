import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import useSupabaseClient from "../../backend/supabase/supabase";
import Search from "./Search";
import FilterDropdown from "./FilterDropdown";
import { useHouseStore, selectFilteredHouses } from "../../store/useHouseStore";
import { useShallow } from "zustand/react/shallow";
import { useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import { validPoint } from "@/utils/geo";

const Map = lazy(() => import("./Map"));

function DeferredMap({ markers, center, selectedPoint, onPickLocation }) {
  const markerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!markerRef.current || visible) return;
    if (!('IntersectionObserver' in window)) { setVisible(true); return; }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "300px" });
    observer.observe(markerRef.current);
    return () => observer.disconnect();
  }, [visible]);

  return <div ref={markerRef} className="h-full w-full">{visible && <Suspense fallback={<div className="map-loading">Loading map…</div>}><Map markers={markers} center={center} selectedPoint={selectedPoint} onPickLocation={onPickLocation} /></Suspense>}</div>;
}

DeferredMap.propTypes = { markers: PropTypes.array.isRequired, center: PropTypes.array.isRequired, selectedPoint: PropTypes.array, onPickLocation: PropTypes.func.isRequired };

function ListingMapView() {
  const { t } = useTranslation();
  const supabase = useSupabaseClient();
  const loading = useHouseStore((state) => state.loading);
  const initRealtimeSubscription = useHouseStore((state) => state.initRealtimeSubscription);
  const filteredHouses = useHouseStore(useShallow(selectFilteredHouses));
  const proximityPoint = useHouseStore((state) => state.proximityPoint);
  const setProximityPoint = useHouseStore((state) => state.setProximityPoint);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const mapRef = useRef(null);
  const resultsRef = useRef(null);

  const useCurrentLocation = () => {
    setLocationError("");
    if (!window.isSecureContext || !navigator.geolocation) {
      setLocationError(t("redesign.locationUnavailable"));
      return;
    }
    setLocating(true);
    const onSuccess = ({ coords }) => {
      setProximityPoint([coords.latitude, coords.longitude], "device");
      setLocating(false);
    };
    const onFailure = (error) => {
      setLocationError(t(error.code === 1 ? "redesign.locationDenied" : "redesign.locationFailed"));
      setLocating(false);
    };
    navigator.geolocation.getCurrentPosition(onSuccess, (error) => {
      if (error.code === 1) { onFailure(error); return; }
      navigator.geolocation.getCurrentPosition(onSuccess, onFailure, { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 });
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 });
  };

  const pickOnMap = (point) => {
    setProximityPoint(point, "map");
    setLocationError("");
  };

  useEffect(() => {
    if (supabase) {
      const unsubscribe = initRealtimeSubscription(supabase);
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [supabase, initRealtimeSubscription]);

  // Format houses to markers format expected by Map component
  const markers = filteredHouses
    .filter((house) => house.is_available)
    .map((house) => ({
      property_id: house.property_id,
      lat: house.latitude ?? house.lat,
      lng: house.longitude ?? house.lng,
      address: house.address,
      price: house.price,
      bedrooms: house.Bedrooms,
      bathrooms: house.Bathrooms,
    }));
  const center = useMemo(() => {
    if (proximityPoint) return proximityPoint;
    const firstMappedProperty = filteredHouses.find((house) => validPoint(house.latitude ?? house.lat, house.longitude ?? house.lng));
    return firstMappedProperty
      ? [Number(firstMappedProperty.latitude ?? firstMappedProperty.lat), Number(firstMappedProperty.longitude ?? firstMappedProperty.lng)]
      : [30.0444, 31.2357];
  }, [filteredHouses, proximityPoint]);

  return (
    <section id="explore" className="listing-section">
      <div className="site-container">
        <div className="section-heading">
          <div><span className="eyebrow">{t("redesign.curated")}</span><h2>{t("redesign.listingTitle")}</h2></div>
          <p>{t("redesign.listingIntro")}</p>
        </div>
        <div className="filter-shell">
          <FilterDropdown onUseLocation={useCurrentLocation} onChooseOnMap={() => mapRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })} onDismissLocationError={() => setLocationError("")} locating={locating} locationError={locationError} />
        </div>
        <div className="listing-layout" aria-busy={loading}>
          <div ref={resultsRef} className="listing-results">
            {loading ? (
              <div className="listing-loading" role="status" aria-label={t("redesign.loadingHomes")}>
                <div className="listing-loading-search"><span>{t("redesign.loadingHomes")}</span></div>
                <div className="property-grid">{Array.from({ length: 4 }, (_, index) => <div className="property-skeleton" key={index}><div /><span /><span /><span /></div>)}</div>
                <span className="sr-only">{t("redesign.loadingHomes")}</span>
              </div>
            ) : <Search />}
          </div>
          <div ref={mapRef} className={`listing-map${loading ? " listing-map-loading" : ""}`}>
            {loading ? <span className="sr-only">{t("redesign.loadingMap")}</span> : <><DeferredMap markers={markers} center={center} selectedPoint={proximityPoint} onPickLocation={pickOnMap} /><div className="home-map-pick-hint">{t(proximityPoint ? "redesign.mapPinHint" : "redesign.mapPickHint")}</div>{proximityPoint && <button type="button" className="home-map-view-results" onClick={() => resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}>{t("redesign.viewNearbyResults", { count: markers.length })}</button>}</>}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ListingMapView;

