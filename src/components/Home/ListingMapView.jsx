import React, { useEffect } from "react";
import useSupabaseClient from "../../backend/supabase/supabase";
import { Spin } from "antd";
import Search from "./Search";
import FilterDropdown from "./FilterDropdown";
import Map from "./Map";
import { useHouseStore, selectFilteredHouses } from "../../store/useHouseStore";
import { useShallow } from "zustand/react/shallow";

function ListingMapView() {
  const supabase = useSupabaseClient();
  const loading = useHouseStore((state) => state.loading);
  const initRealtimeSubscription = useHouseStore((state) => state.initRealtimeSubscription);
  const filteredHouses = useHouseStore(useShallow(selectFilteredHouses));

  useEffect(() => {
    if (supabase) {
      const unsubscribe = initRealtimeSubscription(supabase);
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [supabase, initRealtimeSubscription]);

  if (loading) {
    return <Spin size="large" className="flex my-48 justify-center" />;
  }

  // Format houses to markers format expected by Map component
  const markers = filteredHouses
    .filter((house) => house.is_available)
    .map((house) => ({
      property_id: house.property_id,
      lat: house.latitude || house.lat,
      lng: house.longitude || house.lng,
      address: house.address,
      price: house.price,
      bedrooms: house.Bedrooms,
      bathrooms: house.Bathrooms,
    }));

  return (
    <div className="mt-10 max-w-[1400px] mx-auto px-4">
      <div className="flex flex-col items-center gap-2 w-full mb-6">
        <FilterDropdown />
      </div>
      
      {/* Responsive split layout: Stack on mobile, split on large screens */}
      <div className="flex flex-col lg:flex-row gap-6 w-full items-start">
        {/* Left side: Search input and property cards list */}
        <div className="w-full lg:w-1/2 flex-none">
          <Search />
        </div>
        
        {/* Right side: Sticky Map panel for visual geographical listings */}
        <div className="w-full lg:w-1/2 h-[500px] lg:h-[700px] lg:sticky lg:top-24 rounded-3xl overflow-hidden shadow-lg border border-gray-200 z-10">
          <Map markers={markers} />
        </div>
      </div>
    </div>
  );
}

export default ListingMapView;

