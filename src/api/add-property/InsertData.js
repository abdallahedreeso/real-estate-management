export default async function InserthData(supabase, propertyData, userId) {
  if (!userId) throw new Error("Seller ID is required");

  const { error } = await supabase.from("properties").insert({
    seller_id: userId,
    title: propertyData.title,
    price: propertyData.price,
    property_type: propertyData.property_type,
    description: propertyData.description,
    country: propertyData.country,
    city: propertyData.city,
    state: propertyData.state,
    zip_code: propertyData.zip_code,
    Bedrooms: propertyData.Bedrooms,
    Bathrooms: propertyData.Bathrooms,
    ParkingSpaces: propertyData.ParkingSpaces,
    surface_area: propertyData.surface_area,
    seller_phone: propertyData.seller_phone,
    images: propertyData.images,
    file_list: propertyData.file_list,
    address: propertyData.address,
    latitude: propertyData.latitude,
    longitude: propertyData.longitude
  });

  if (error) throw error;
  return "ok";
}
