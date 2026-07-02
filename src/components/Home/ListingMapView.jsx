import React, { useEffect } from "react";
import useSupabaseClient from "../../backend/supabase/supabase";
import { Spin } from "antd";
import Search from "./Search";
import FilterDropdown from "./FilterDropdown";
import { useHouseStore } from "../../store/useHouseStore";

function ListingMapView() {
  const supabase = useSupabaseClient();
  const loading = useHouseStore((state) => state.loading);
  const initRealtimeSubscription = useHouseStore((state) => state.initRealtimeSubscription);

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

  return (
    <div className="mt-10">
      <div className="flex flex-col items-center gap-2 w-full">
        <FilterDropdown />
        <div className="flex flex-wrap gap-4 justify-center w-full">
          <Search />
        </div>
      </div>
    </div>
  );
}

export default ListingMapView;
