export default async function InserthData(supabase, propertyData, token) {
  if (token) {
    await supabase.auth.setSession({
      access_token: token,
      refresh_token: "",
    });
  }

  const { error } = await supabase.from("properties").insert({
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

  if (error) {
    console.error("Error inserting data into property table : ", error);
    return null;
  } else {
    return "ok";
  }
}
