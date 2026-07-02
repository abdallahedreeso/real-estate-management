import { useState, useEffect } from "react";
import { Spin, Alert, Pagination } from "antd";
import useSupabaseClient from "@/backend/supabase/supabase";
import { Link } from "react-router-dom";
import { MapPin } from "lucide-react";
import { BiArea, BiBath, BiBed } from "react-icons/bi";
import { FaParking } from "react-icons/fa";
import EmptyWishlist from "@/components/wishlist/EmptyWishlist";
import { useTheme } from "@/context/ThemeContext";
import { useAuth } from "@clerk/clerk-react";

const Wishlist = () => {
  const [houseData, setHouseData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const supabase = useSupabaseClient();
  const { userId, isLoaded } = useAuth();
  const { isDarkMode } = useTheme();

  // Fetch wishlist data with associated property details
  const fetchHouseData = async () => {
    if (!userId) return;
    try {
      const { data, error } = await supabase
        .from("wishlist")
        .select(`
          id,
          user_id,
          property_id,
          properties (
            property_id,
            price,
            country,
            state,
            property_type,
            Bedrooms,
            Bathrooms,
            address,
            surface_area,
            latitude,
            longitude,
            ParkingSpaces,
            images,
            is_available
          )
        `)
        .eq("user_id", userId);

      if (error) {
        throw new Error(error.message);
      }

      // Map and filter to include necessary property data
      const formattedData = data
        .filter((wishlistItem) => wishlistItem.properties.is_available)
        .map((wishlistItem) => ({
          id: wishlistItem.id, // Wishlist ID
          user_id: wishlistItem.user_id, // Clerk User ID
          property_id: wishlistItem.property_id, // Property ID
          price: wishlistItem.properties.price, // Property price
          property_type: wishlistItem.properties.property_type,
          state: wishlistItem.properties.state,
          address: wishlistItem.properties.address, // Property address
          bedrooms: wishlistItem.properties.Bedrooms, // Number of bedrooms
          bathrooms: wishlistItem.properties.Bathrooms, // Number of bathrooms
          parking: wishlistItem.properties.ParkingSpaces, // Number of parking spaces
          surface_area: wishlistItem.properties.surface_area, // Surface area
          image: wishlistItem.properties.images
            ? wishlistItem.properties.images[0]
            : "https://via.placeholder.com/400x250", // Fallback image
        }));

      setHouseData(formattedData);
      setLoading(false);
    } catch (err) {
      setErrorMessage(err.message);
      setLoading(false);
    }
  };

  // Fetch data when component mounts or auth/session resolves
  useEffect(() => {
    if (supabase && isLoaded) {
      if (userId) {
        fetchHouseData();
      } else {
        setLoading(false);
      }
    }
  }, [supabase, userId, isLoaded]);

  // Pagination handling
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Determine which properties to show on the current page
  const indexOfLastHouse = currentPage * itemsPerPage;
  const indexOfFirstHouse = indexOfLastHouse - itemsPerPage;
  const currentHouses = houseData.slice(indexOfFirstHouse, indexOfLastHouse);

  if (!isLoaded || loading) {
    return <Spin size="large" className="flex my-48 justify-center" />;
  }

  if (errorMessage) {
    return (
      <Alert message="Error" description={errorMessage} type="error" showIcon />
    );
  }

  // Show empty state if no wishlist items
  if (houseData.length === 0) {
    return <EmptyWishlist />;
  }

  return (
    <div className="mt-10 px-10 md:px-20 lg:px-40">
      <div className="wishlist__title ">
        <h1 className="font-extrabold text-3xl text-center text-white bg-violet-700 rounded-lg px-16 py-5 mb-10">
          My Wishlist
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Render the current page of properties */}
        {currentHouses.map((house) => (
          <Link key={house.property_id} to={`/property/${house.property_id}`}>
            <div className={`${isDarkMode ? 'bg-gray-800 hover:shadow-gray-700' : 'bg-white hover:shadow-gray-300'} shadow-lg p-6 w-full max-w-[400px] mx-auto mb-12 cursor-pointer hover:shadow-2xl transition rounded-lg hover:scale-105`}>
              <img
                className="rounded-md mb-6 w-full h-[250px] object-cover transition-transform duration-300 transform hover:scale-110"
                src={house.image}
                alt="house"
              />
              <div className="mb-4 flex gap-x-2 text-sm">
                <div className="bg-green-600 rounded-full text-white font-medium px-3 py-1 shadow">
                  {house.property_type}
                </div>
                <div className="bg-violet-600 rounded-full text-white font-medium px-3 py-1 shadow">
                  {house.state}
                </div>
              </div>
              <div className={`flex text-lg font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} max-w-[260px]`}>
              <MapPin className={`mr-2 ${isDarkMode ? 'text-violet-400' : 'text-violet-700'}`} />
                <span>{house.address}</span>
              </div>
              <div className="flex gap-x-4 my-4">
              <div className={`flex md:w-24 w-5/12 gap-2 text-sm ${isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-600 bg-slate-200 hover:bg-slate-300'} rounded-md p-2 justify-center items-center transition duration-300`}>
              <BiBed className="text-[20px]" />
                  <span>{house.bedrooms}</span>
                </div>
                <div className={`flex md:w-24 w-5/12 gap-2 text-sm ${isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-600 bg-slate-200 hover:bg-slate-300'} rounded-md p-2 justify-center items-center transition duration-300`}>
                <BiBath className="text-[20px]" />
                  <span>{house.bathrooms}</span>
                </div>
                <div className={`flex md:w-24 w-5/12 gap-2 text-sm ${isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-600 bg-slate-200 hover:bg-slate-300'} rounded-md p-2 justify-center items-center transition duration-300`}>
                <FaParking className="text-[20px]" />
                  <span>{house.parking}</span>
                </div>
                <div className={`flex md:w-24 w-5/12 gap-2 text-sm ${isDarkMode ? 'text-gray-300 bg-gray-700 hover:bg-gray-600' : 'text-gray-600 bg-slate-200 hover:bg-slate-300'} rounded-md p-2 justify-center items-center transition duration-300`}>
                <BiArea className="text-[20px]" />
                  <span>{house.surface_area}</span>
                </div>
              </div>
              <div className={`text-xl font-semibold ${isDarkMode ? 'text-violet-400' : 'text-violet-600'} mb-2`}>
              ${house.price}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {houseData.length > itemsPerPage && (
        <div className="flex justify-center mt-8 mb-10">
          <Pagination
            current={currentPage}
            onChange={handlePageChange}
            total={houseData.length}
            pageSize={itemsPerPage}
            showSizeChanger={false}
            className={isDarkMode ? 'dark-pagination' : ''}
          />
        </div>
      )}
    </div>
  );
};

export default Wishlist;
