import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { distanceKm, validPoint } from "@/utils/geo";

const isDefault = (str) => !str || str.toLowerCase().includes("(any)");

export const useHouseStore = create(
  persist(
    (set, get) => ({
      // Core state fields
      houses: [], // Raw database records
      country: "Location (any)",
      property: "Property type (any)",
      listingPurpose: "any",
      price: "Price range (any)",
      city: "",
      proximityPoint: null,
      proximitySource: null,
      radiusKm: 25,
      searchAddress: "",
      loading: false,
      realtimeChannel: null,
      wishlistCount: 0,
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
      offlineOutbox: [], // Array for pending mutations

      // Setters
      setCountry: (country) => set({ country }),
      setProperty: (property) => set({ property }),
      setListingPurpose: (listingPurpose) => set({ listingPurpose }),
      setPrice: (price) => set({ price }),
      setCity: (city) => set({ city, proximityPoint: null, proximitySource: null }),
      setProximityPoint: (point, source) => set({ proximityPoint: point, proximitySource: source, city: "" }),
      clearProximity: () => set({ proximityPoint: null, proximitySource: null }),
      setRadiusKm: (radiusKm) => set({ radiusKm }),
      handleClick: (searchAddress) => set({ searchAddress: searchAddress || "" }),
      resetFilters: () => set({ country: "Location (any)", property: "Property type (any)", listingPurpose: "any", price: "Price range (any)", city: "", proximityPoint: null, proximitySource: null, radiusKm: 25, searchAddress: "" }),
      setNetworkStatus: (status) => set({ isOnline: status }),

      // Outbox sync actions
      queueOfflineAction: (actionPayload) => set((state) => ({
        offlineOutbox: [...state.offlineOutbox, actionPayload]
      })),

      processOfflineOutbox: async (supabase, userId) => {
        if (!supabase || !userId) return;
        const { offlineOutbox } = get();
        if (offlineOutbox.length === 0) return;

        console.log(`Processing offline outbox: ${offlineOutbox.length} actions pending.`);
        
        for (const action of offlineOutbox) {
          const { propertyId, operation } = action;
          try {
            if (operation === "ADD") {
              await supabase.from("wishlist").insert({
                property_id: propertyId,
                user_id: userId,
              });
            } else if (operation === "REMOVE") {
              await supabase
                .from("wishlist")
                .delete()
                .eq("property_id", propertyId)
                .eq("user_id", userId);
            }
          } catch (err) {
            console.error("Failed to process offline action:", action, err);
          }
        }

        // Clear outbox after syncing
        set({ offlineOutbox: [] });
        get().fetchWishlistCount(supabase, userId);
      },

      // Actions
      fetchWishlistCount: async (supabase, userId) => {
        if (!supabase || !userId) return;
        try {
          const { count, error } = await supabase
            .from("wishlist")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId);

          if (error) {
            console.error("Error fetching wishlist count inside Zustand:", error);
          } else {
            set({ wishlistCount: count || 0 });
          }
        } catch (err) {
          console.error("Error fetching wishlist count inside Zustand:", err);
        }
      },

      incrementWishlist: () => set((state) => ({ wishlistCount: state.wishlistCount + 1 })),
      decrementWishlist: () => set((state) => ({ wishlistCount: Math.max(0, state.wishlistCount - 1) })),

      fetchHouses: async (supabase) => {
        if (!supabase) return;
        set({ loading: true });
        try {
          const { data, error } = await supabase
            .from("properties")
            .select("*");

          if (error) {
            console.error("Error fetching houses inside Zustand:", error);
          } else {
            set({ houses: data || [] });
          }
        } catch (err) {
          console.error("Error fetching houses inside Zustand:", err);
        } finally {
          set({ loading: false });
        }
      },

      // Setup Realtime Sync Subscription Channel
      initRealtimeSubscription: (supabase) => {
        if (!supabase) return;
        
        // Fetch fresh houses in background to revalidate cache (Stale-While-Revalidate)
        get().fetchHouses(supabase);

        // If a channel is already active, remove it to avoid leaks
        const existingChannel = get().realtimeChannel;
        if (existingChannel) {
          supabase.removeChannel(existingChannel);
        }

        const channel = supabase
          .channel("properties-realtime-zustand")
          .on(
            "postgres_changes",
            {
              event: "*",
              schema: "public",
              table: "properties",
            },
            (payload) => {
              const { eventType, new: newRecord, old: oldRecord } = payload;
              const { houses } = get();

              switch (eventType) {
                case "INSERT":
                  set({ houses: [...houses, newRecord] });
                  break;
                case "UPDATE":
                  set({
                    houses: houses.map((house) =>
                      house.property_id === newRecord.property_id ? newRecord : house
                    ),
                  });
                  break;
                case "DELETE":
                  set({
                    houses: houses.filter((house) => house.property_id !== oldRecord.property_id),
                  });
                  break;
                default:
                  break;
              }
            }
          )
          .subscribe();

        set({ realtimeChannel: channel });

        // Return unsubscriber function for component lifecycle cleanups
        return () => {
          supabase.removeChannel(channel);
          set({ realtimeChannel: null });
        };
      },
    }),
    {
      name: "real-estate-cache",
      storage: createJSONStorage(() => localStorage),
      // Cache list heavy attributes including the offline outbox queue
      partialize: (state) => ({
        houses: state.houses,
        wishlistCount: state.wishlistCount,
        country: state.country,
        property: state.property,
        listingPurpose: state.listingPurpose,
        price: state.price,
        city: state.city,
        radiusKm: state.radiusKm,
        offlineOutbox: state.offlineOutbox,
      }),
    }
  )
);

// Derived selector: computes the filtered list dynamically
export const selectFilteredHouses = (state) => {
  const { houses, country, property, listingPurpose, price, city, proximityPoint, radiusKm, searchAddress } = state;

  const results = houses.filter((house) => {
    // Country filter
    if (!isDefault(country) && house.country !== country) {
      return false;
    }

    if (city && String(house.city || "").toLocaleLowerCase() !== city.toLocaleLowerCase()) {
      return false;
    }

    // Property type filter
    if (!isDefault(property) && String(house.property_category || "").toLowerCase() !== property.toLowerCase()) {
      return false;
    }

    if (listingPurpose && listingPurpose !== "any" && !String(house.property_type || "").toLowerCase().includes(listingPurpose)) return false;

    // Search Address filter
    if (searchAddress) {
      const houseAddress = [house.address, house.city, house.state].filter(Boolean).join(" ");
      const addressMatch = houseAddress.toLocaleLowerCase().includes(searchAddress.toLocaleLowerCase());
      if (!addressMatch) return false;
    }

    // Price filter with fallback
    if (!isDefault(price)) {
      const parts = price.split(" ");
      const minPrice = parseInt(parts[0]) || 0;
      const maxPrice = parseInt(parts[2]) || Infinity;
      const housePrice = parseInt(house.price) || 0;

      if (housePrice < minPrice || housePrice > maxPrice) {
        return false;
      }
    }

    if (proximityPoint) {
      const latitude = house.latitude ?? house.lat;
      const longitude = house.longitude ?? house.lng;
      if (!validPoint(latitude, longitude)) return false;
      if (radiusKm != null && distanceKm(proximityPoint, [Number(latitude), Number(longitude)]) > radiusKm) return false;
    }

    return true;
  });

  if (!proximityPoint) return results;
  return results.sort((a, b) => {
    const aPoint = [Number(a.latitude ?? a.lat), Number(a.longitude ?? a.lng)];
    const bPoint = [Number(b.latitude ?? b.lat), Number(b.longitude ?? b.lng)];
    return distanceKm(proximityPoint, aPoint) - distanceKm(proximityPoint, bPoint);
  });
};

// Global Connection Listeners initialization
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    useHouseStore.getState().setNetworkStatus(true);
  });
  window.addEventListener("offline", () => {
    useHouseStore.getState().setNetworkStatus(false);
  });
}
