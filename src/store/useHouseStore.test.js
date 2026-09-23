import { describe, expect, it } from "vitest";
import { selectFilteredHouses } from "./useHouseStore";

const houses = [
  { property_id: "a", property_category: "apartment", property_type: "rent", price: 100000 },
  { property_id: "b", property_category: "house", property_type: "sale", price: 200000 },
  { property_id: "c", property_category: null, property_type: "For Rent", price: 150000 },
];

const filters = {
  houses,
  country: "Location (any)",
  property: "Property type (any)",
  listingPurpose: "any",
  price: "Price range (any)",
  city: "",
  proximityPoint: null,
  radiusKm: 25,
  searchAddress: "",
};

describe("home listing filters", () => {
  it("keeps legacy uncategorized listings in the all-types view and filters rent separately", () => {
    expect(selectFilteredHouses({ ...filters, listingPurpose: "rent" }).map((house) => house.property_id)).toEqual(["a", "c"]);
    expect(selectFilteredHouses({ ...filters, property: "Apartment", listingPurpose: "rent" }).map((house) => house.property_id)).toEqual(["a"]);
    expect(selectFilteredHouses({ ...filters, property: "House", listingPurpose: "rent" })).toEqual([]);
  });
});
