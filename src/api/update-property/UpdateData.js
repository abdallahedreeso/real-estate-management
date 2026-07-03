export default async function UpdateData(supabase, propertyData, id, userId, token) {
    if (!userId) {
        console.error("Error updating property: userId is missing.");
        return null;
    }
    
    if (token) {
        await supabase.auth.setSession({
            access_token: token,
            refresh_token: "",
        });
    }

    const { error } = await supabase
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
        .eq('seller_id', userId); // Secure scoping

    if (error) {
        console.error("Error updating data into property table : ", error);
        return null;
    } else {
        console.log('data updated');
        return "ok";
    }
}