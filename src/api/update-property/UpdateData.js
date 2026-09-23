export default async function UpdateData(supabase, propertyData, id, userId) {
    if (!userId) {
        throw new Error("Seller ID is required");
    }
    
    const { data, error } = await supabase
        .from("properties")
        .update({
            title: propertyData.title,
            price: propertyData.price,
            property_type: propertyData.property_type,
            description: propertyData.description,
            country: propertyData.country,
            city: propertyData.city,
            state: propertyData.state,
            zip_code: propertyData.zip_code,
            address: propertyData.address,
            Bedrooms: propertyData.Bedrooms,
            Bathrooms: propertyData.Bathrooms,
            ParkingSpaces: propertyData.ParkingSpaces,
            surface_area: propertyData.surface_area,
            seller_phone: propertyData.seller_phone,
            images: propertyData.images,
            file_list: propertyData.file_list,
            latitude: propertyData.latitude,
            longitude: propertyData.longitude
        })
        .eq('property_id', id)
        .eq('seller_id', userId)
        .select('property_id');

    if (error) throw error;
    if (!data?.length) throw new Error("Property was not updated. Check ownership and access policies.");
    return "ok";
}
