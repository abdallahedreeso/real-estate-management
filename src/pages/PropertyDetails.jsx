import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import OptimizedImage from "@/components/common/OptimizedImage";
import { useHouseStore } from "../store/useHouseStore";
import ChatBox from "@/components/chat/ChatBox";
import { BiBed, BiBath } from "react-icons/bi";
import { MdLocationOn } from "react-icons/md";
import { MdHome } from "react-icons/md";
import { FaShare, FaClipboard, FaParking, FaHeart } from "react-icons/fa";
import { AiOutlineCalendar } from "react-icons/ai";
import { FaRulerCombined } from "react-icons/fa";
import {
  FacebookShareButton,
  TwitterShareButton,
  WhatsappShareButton,
} from "react-share";
import Swal from "sweetalert2";
import Map from "@/components/Home/Map";
import useSupabaseClient from "../backend/supabase/supabase";
import { SignedIn, SignedOut, useAuth } from "@clerk/clerk-react";
import JoinUsCard from "@/components/JoinUs";
import whatsappIcon from "../assets/img/icons/whatsapp.svg";
import { message } from "antd";
import { useTheme } from "../context/ThemeContext";

const PropertyDetails = () => {
  const { id } = useParams();
  const { userId } = useAuth();
  const [house, setHouse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const supabase = useSupabaseClient();
  const { isDarkMode } = useTheme();

  const incrementWishlist = useHouseStore((state) => state.incrementWishlist);
  const decrementWishlist = useHouseStore((state) => state.decrementWishlist);
  const isOnline = useHouseStore((state) => state.isOnline);
  const queueOfflineAction = useHouseStore((state) => state.queueOfflineAction);

  const markers = useMemo(() => {
    if (!house) return [];
    return [
      {
        property_id: house.property_id,
        lat: house.latitude,
        lng: house.longitude,
        address: house.address,
        price: house.price,
        bedrooms: house.Bedrooms,
        bathrooms: house.Bathrooms,
      },
    ];
  }, [house]);

  useEffect(() => {
    const fetchHouseData = async () => {
      try {
        const { data, error } = await supabase
          .from("properties")
          .select(
            `property_id, address, price, property_type, country, state, seller_phone, Bedrooms, Bathrooms, surface_area, zip_code, created_at, description, latitude, longitude, ParkingSpaces, images`
          )
          .eq("property_id", id)
          .single();

        if (error) {
          console.error("Error fetching property data:", error);
          return;
        }
        setHouse(data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data from Supabase:", err);
      }
    };

    const fetchWishlistStatus = async () => {
      const propertyId = id;

      const { data, error } = await supabase
        .from("wishlist")
        .select("id")
        .eq("property_id", propertyId)
        .eq("user_id", userId);
      if (error && error.code !== "PGRST116") {
        console.error("Error fetching wishlist status", error);
      } else if (data && data.length) {
        setIsInWishlist(true);
      }
    };

    if (supabase && id) {
      fetchHouseData();
      if (userId) {
        fetchWishlistStatus();
      }
    }
  }, [id, supabase, userId]);

  if (loading) {
    return (
      <div className="text-center text-xl font-semibold py-10">
        Loading property details...
      </div>
    );
  }

  if (!house) {
    return (
      <div className="text-center text-xl font-semibold py-10">
        No property found.
      </div>
    );
  }

  const shareUrl = window.location.href;

  const handleCopyLink = () => {
    navigator.clipboard
      .writeText(shareUrl)
      .then(() => {
        Swal.fire({
          icon: "success",
          title: "Link Copied!",
          text: "The property link has been copied to your clipboard.",
          showConfirmButton: false,
          timer: 1500,
          toast: true,
          position: "top-end",
        });
      })
      .catch(() => {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Failed to copy the link. Please try again.",
        });
      });
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const toggleWishlist = async () => {
    const propertyId = id;

    if (!isOnline) {
      if (isInWishlist) {
        setIsInWishlist(false);
        decrementWishlist();
        queueOfflineAction({ propertyId, operation: "REMOVE" });
        message.info("Wishlist updated offline. Synchronizing changes soon...");
      } else {
        setIsInWishlist(true);
        incrementWishlist();
        queueOfflineAction({ propertyId, operation: "ADD" });
        message.info("Wishlist updated offline. Synchronizing changes soon...");
      }
      return;
    }

    if (isInWishlist) {
      // Remove from wishlist
      try {
        const { error } = await supabase
          .from("wishlist")
          .delete()
          .eq("property_id", propertyId)
          .eq("user_id", userId);

        if (error) throw error;
        console.log("Property deleted from wishlist successfully");
        message.success("Property deleted from wishlist successfully");
        decrementWishlist();
      } catch (err) {
        console.error("Error deleting property from wishlist:", err.message);
      } finally {
        setIsInWishlist(false);
      }
    } else {
      // Add to wishlist
      const { error } = await supabase.from("wishlist").insert({
        property_id: propertyId,
        user_id: userId,
      });
      if (error) {
        console.error("Error adding to wishlist", error);
      } else {
        message.success("Property Added to your wishlist successfully");
        setIsInWishlist(true);
        incrementWishlist();
        return "ok";
      }
    }
  };

  const handleWhatsAppClick = () => {
    const phoneNumber = house.seller_phone;

    if (phoneNumber) {
      const whatsappUrl = `https://wa.me/${phoneNumber}`;
      window.open(whatsappUrl, "_blank"); // Open WhatsApp in a new tab
    } else {
      Swal.fire({
        icon: "error",
        title: "No Phone Number",
        text: "This property does not have a valid seller phone number.",
      });
    }
  };

  const imageUrl =
    house.images && house.images.length > 0
      ? house.images[0]
      : "https://via.placeholder.com/768x432";

  return (
    <section className={isDarkMode ? "bg-gray-900 text-gray-100" : ""}>
      <div className={`container mx-auto min-h-[800px] mb-1 ${isDarkMode ? "text-gray-100" : ""}`}>
        <div className="max-w-3xl mx-auto my-3 mt-5 h-[400px] overflow-hidden rounded-2xl shadow-lg">
          <OptimizedImage
            src={imageUrl}
            alt="Property"
            className="w-full h-full object-cover transition-transform transform hover:scale-105 duration-300"
          />
        </div>
        <div className="my-6 flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <div>
              <h2 className={`font-bold text-3xl pb-3 ${isDarkMode ? "text-violet-400" : "text-violet-700"}`}>
                ${house.price.toLocaleString()}
              </h2>
              <h2 className={`text-lg flex pb-4 w-44 md:w-full ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                <MdLocationOn className={`mr-1 ${isDarkMode ? "text-violet-400" : "text-violet-600"}`} />
                {house.address}, {house.state}, {house.zip_code}
              </h2>
            </div>

            <div className="flex gap-6">
              {/* Wishlist Icon */}
              <SignedIn>
                <button onClick={toggleWishlist}>
                  <FaHeart
                    className={`text-3xl transition ${
                      isInWishlist ? "text-red-500" : isDarkMode ? "text-gray-500" : "text-gray-400"
                    } hover:scale-110`}
                  />
                </button>
              </SignedIn>
              <div className="relative">
                <button
                  onClick={toggleDropdown}
                  className={`flex gap-2 ${isDarkMode ? "bg-violet-800" : "bg-violet-700"} text-white rounded p-2 shadow hover:bg-violet-600 transition`}
                >
                  <FaShare /> Share
                </button>
                {dropdownOpen && (
                  <div className={`absolute right-0 mt-2 ${isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border"} rounded shadow-lg z-10`}>
                    <div className="p-2">
                      <button
                        onClick={handleCopyLink}
                        className={`flex items-center gap-2 ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"} w-full text-left p-2 rounded my-2`}
                      >
                        <FaClipboard /> Copy Link
                      </button>
                      <FacebookShareButton
                        url={shareUrl}
                        className={`flex items-center gap-2 ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-200"} w-full text-left p-2 rounded my-2`}
                      >
                        <FaShare /> Share on Facebook
                      </FacebookShareButton>
                      <TwitterShareButton
                        url={shareUrl}
                        className={`flex items-center gap-2 ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"} w-full text-left p-2 rounded my-2`}
                      >
                        <FaShare /> Share on Twitter
                      </TwitterShareButton>
                      <WhatsappShareButton
                        url={shareUrl}
                        className={`flex items-center gap-2 ${isDarkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-700 hover:bg-gray-100"} w-full text-left p-2 rounded my-2`}
                      >
                        <FaShare /> Share on WhatsApp
                      </WhatsappShareButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <hr className={isDarkMode ? "border-gray-700" : "border-gray-300"} />
          <div className="mt-4 flex flex-col gap-3 mb-4">
            <h2 className={`font-bold text-2xl ${isDarkMode ? "text-gray-100" : ""}`}>Key Features</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <h2 className={`flex gap-2 items-center ${isDarkMode ? "bg-gray-800 text-violet-400" : "bg-purple-100 text-violet-700"} rounded-lg p-3 justify-center shadow-md`}>
                <MdHome /> {house.property_type}
              </h2>
              <h2 className={`flex gap-2 items-center ${isDarkMode ? "bg-gray-800 text-violet-400" : "bg-purple-100 text-violet-700"} rounded-lg p-3 justify-center shadow-md`}>
                <AiOutlineCalendar />{" "}
                {new Date(house.created_at).toLocaleDateString()}
              </h2>
              <h2 className={`flex gap-2 items-center ${isDarkMode ? "bg-gray-800 text-violet-400" : "bg-purple-100 text-violet-700"} rounded-lg p-3 justify-center shadow-md`}>
                <FaRulerCombined /> {house.surface_area} sq ft
              </h2>
              <h2 className={`flex gap-2 items-center ${isDarkMode ? "bg-gray-800 text-violet-400" : "bg-purple-100 text-violet-700"} rounded-lg p-3 justify-center shadow-md`}>
                <BiBed /> {house.Bedrooms} Bedrooms
              </h2>
              <h2 className={`flex gap-2 items-center ${isDarkMode ? "bg-gray-800 text-violet-400" : "bg-purple-100 text-violet-700"} rounded-lg p-3 justify-center shadow-md`}>
                <BiBath /> {house.Bathrooms} Bathrooms
              </h2>
              <h2 className={`flex gap-2 items-center ${isDarkMode ? "bg-gray-800 text-violet-400" : "bg-purple-100 text-violet-700"} rounded-lg p-3 justify-center shadow-md`}>
                <FaParking /> {house.ParkingSpaces} Parking Lots
              </h2>
            </div>
          </div>
          {/* Whatsapp message */}
          <SignedOut>
            <JoinUsCard />
            <div className="mt-4 p-4 rounded-xl border border-dashed border-violet-500 bg-violet-50 dark:bg-gray-800 text-center">
              <p className={`text-sm ${isDarkMode ? "text-violet-300" : "text-violet-700"}`}>
                Want to chat live? Please sign in to initiate a direct peer-to-peer real-time conversation.
              </p>
            </div>
          </SignedOut>
          <SignedIn>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleWhatsAppClick}
                className={`${isDarkMode ? "bg-violet-800" : "bg-violet-700"} text-white p-3 rounded-md shadow hover:bg-violet-600 transition`}
              >
                <div className="flex flex-wrap items-center justify-center ">
                  Message Seller on
                  <div className="flex ">
                    <img
                      src={whatsappIcon}
                      alt="Whatsapp icon"
                      width="20px"
                      className="mx-1"
                    />
                    WhatsApp: {house.seller_phone}
                  </div>
                </div>
              </button>

              {/* Instant Peer-to-Peer Realtime Chat Box */}
              <div className="mt-2">
                <h3 className={`font-bold text-xl mb-3 ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>
                  Live Chat with Agent
                </h3>
                <ChatBox 
                  propertyId={house.property_id.toString()} 
                  sellerId={house.seller_id} 
                  propertyTitle={house.title} 
                />
              </div>
            </div>
          </SignedIn>

          {house.description && (
            <>
              <h2 className={`font-bold text-2xl mt-6 ${isDarkMode ? "text-gray-100" : ""}`}>Description</h2>
              <p className={isDarkMode ? "text-gray-300" : "text-gray-700"}>{house.description}</p>
            </>
          )}
        </div>
        <div className="flex flex-col mt-8">
          <h2 className={`font-bold text-3xl mb-4 ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>Location</h2>
          <div className="h-96 w-full bg-gray-200 rounded-3xl shadow-lg overflow-hidden">
            <Map markers={markers} className="z-40" />
          </div>
          <div className={`mt-4 p-5 rounded-lg shadow-md border ${
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-300"
          }`}>
            <h3 className={`font-semibold text-lg ${isDarkMode ? "text-gray-100" : "text-gray-800"}`}>
              Property Address
            </h3>
            <p className={isDarkMode ? "text-gray-300 text-base" : "text-gray-600 text-base"}>
              {house.address}, {house.state}, {house.zip_code}
            </p>
            <p className={`text-base mt-2 ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              This property is located in a vibrant area with easy access to
              local amenities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PropertyDetails;