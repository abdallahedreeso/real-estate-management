import { create } from "zustand";

const isDefault = (str) => !str || str.toLowerCase().includes("(any)");

export const useHouseStore = create((set, get) => ({
  // Core state fields
  houses: [], // Raw database records
  country: "Location (any)",
  property: "Property type (any)",
  price: "Price range (any)",
  searchAddress: "",
  loading: false,
  realtimeChannel: null,

  // Setters
  setCountry: (country) => set({ country }),
  setProperty: (property) => set({ property }),
  setPrice: (price) => set({ price }),
  handleClick: (searchAddress) => set({ searchAddress: searchAddress || "" }),

  // Actions
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
    
    // Fetch initial list
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
}));

// Derived selector: computes the filtered list dynamically
export const selectFilteredHouses = (state) => {
  const { houses, country, property, price, searchAddress } = state;

  return houses.filter((house) => {
    // Country filter
    if (!isDefault(country) && house.country !== country) {
      return false;
    }

    // Property type filter
    if (!isDefault(property) && house.property_type !== property) {
      return false;
    }

    // Search Address filter
    if (searchAddress) {
      const houseAddress = house.address || "";
      const addressMatch = houseAddress.toLowerCase().includes(searchAddress.toLowerCase());
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

    return true;
  });
};
