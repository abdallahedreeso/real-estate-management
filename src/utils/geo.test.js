import { describe, expect, it } from "vitest";
import { distanceKm, validPoint } from "./geo";
import { selectFilteredHouses, useHouseStore } from "@/store/useHouseStore";

const baseState = {
  country: "Location (any)", property: "Property type (any)", price: "Price range (any)",
  searchAddress: "", city: "", proximityPoint: null, radiusKm: 25,
};

describe("nearby property filtering", () => {
  it("accepts zero coordinates and measures real distance", () => {
    expect(validPoint(0, 0)).toBe(true);
    expect(distanceKm([30, 31], [30, 31])).toBe(0);
    expect(distanceKm([30, 31], [31, 31])).toBeGreaterThan(100);
  });

  it("keeps homes inside the radius and sorts nearest first", () => {
    const houses = [
      { property_id: "far", latitude: 30.2, longitude: 31 },
      { property_id: "near", latitude: 30.01, longitude: 31 },
      { property_id: "missing", latitude: null, longitude: null },
      { property_id: "middle", latitude: 30.1, longitude: 31 },
    ];
    expect(selectFilteredHouses({ ...baseState, houses, proximityPoint: [30, 31] }).map((home) => home.property_id))
      .toEqual(["near", "middle", "far"]);
    expect(selectFilteredHouses({ ...baseState, houses, proximityPoint: [30, 31], radiusKm: 5 }).map((home) => home.property_id))
      .toEqual(["near"]);
  });

  it("filters exact city names without discarding address search", () => {
    const houses = [
      { property_id: "cairo", city: "Cairo", address: "Garden Street" },
      { property_id: "giza", city: "Giza", address: "Garden Street" },
    ];
    expect(selectFilteredHouses({ ...baseState, houses, city: "cairo", searchAddress: "garden" }).map((home) => home.property_id))
      .toEqual(["cairo"]);
  });

  it("keeps the city and map location controls in sync", () => {
    const store = useHouseStore.getState();
    store.setCity("Cairo");
    store.setProximityPoint([30.04, 31.23], "map");
    expect(useHouseStore.getState()).toMatchObject({ city: "", proximityPoint: [30.04, 31.23], proximitySource: "map" });
    store.setCity("Giza");
    expect(useHouseStore.getState()).toMatchObject({ city: "Giza", proximityPoint: null, proximitySource: null });
    store.setCity("");
  });
});
