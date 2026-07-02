import React, { useState } from 'react';
import { RiSearch2Line } from "react-icons/ri";
import House from './House'; // Import the House component
import { Pagination } from 'antd';
import '@/assets/style/pages/search.css';
import emptyState from "../../assets/img/properties-empty.webp";
import { useTheme } from '../../context/ThemeContext';
import { useHouseStore, selectFilteredHouses } from '../../store/useHouseStore';

const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const Search = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [input, setInput] = useState("");
    const { isDarkMode } = useTheme();

    const filteredHouses = useHouseStore(selectFilteredHouses);
    const handleClick = useHouseStore((state) => state.handleClick);

    // Format houses for child House component compatibility
    const formattedHouses = filteredHouses
        .filter(property => property.is_available)
        .map((property) => ({
            image: property.images && property.images.length > 0 ? property.images[0] : 'https://via.placeholder.com/400x250',
            type: capitalizeFirstLetter(property.property_type),
            country: capitalizeFirstLetter(property.country),
            address: property.address,
            state: property.state,
            bedrooms: property.Bedrooms,
            bathrooms: property.Bathrooms,
            surface: property.surface_area,
            price: property.price,
            propertyId: property.property_id,
            lat: property.latitude,
            lng: property.longitude,
            parking: property.ParkingSpaces
        }));

    const handleChange = (value) => {
        setInput(value);
        // Automatically trigger search on text change for instant reactivity
        handleClick(value);
        setCurrentPage(1);
    };

    const handleSearchClick = () => {
        handleClick(input);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const itemsPerPage = 6;
    const indexOfLastHouse = currentPage * itemsPerPage;
    const indexOfFirstHouse = indexOfLastHouse - itemsPerPage;
    const currentHouses = formattedHouses.slice(indexOfFirstHouse, indexOfLastHouse);

    return (
        <div className='search-container py-10 px-5 w-full'>
            <div className='flex flex-col lg:flex-row w-full justify-center items-center mt-2 mb-10'>
                <div className={`search-box ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} shadow-2xl rounded-lg p-6 flex flex-col lg:flex-row gap-4 w-full max-w-[600px] transition-all duration-300 ease-in-out hover:shadow-xl`}>
                    <input
                        placeholder="Type to search..."
                        value={input}
                        onChange={(e) => handleChange(e.target.value)}
                        className={`p-4 ${isDarkMode ? 'bg-gray-700 text-white focus:ring-violet-500' : 'bg-white text-gray-800 border border-gray-300 focus:ring-violet-700'} rounded-lg w-full lg:max-w-[400px] focus:outline-none focus:ring-2 transition duration-300`}
                    />
                    <button 
                        onClick={handleSearchClick} 
                        className='bg-violet-700 hover:bg-violet-800 transition w-full lg:max-w-[162px] h-14 rounded-lg flex justify-center items-center text-white text-lg font-semibold'
                    >
                        <RiSearch2Line size={24} />
                    </button>
                </div>
            </div>

            {/* Render house cards */}
            <div>
                {currentHouses.length > 0 ? (
                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-center justify-center min-w-full">
                        {currentHouses.map((house) => (
                            <House key={house.propertyId} house={house} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center mt-10">
                        <img src={emptyState} alt="No properties available" className="w-80 h-80 rounded-md" />
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mt-4`}>No properties found. Try adjusting your search criteria.</p>
                    </div>
                )}
                
                {currentHouses.length > 0 && (
                    <div className="flex justify-center mt-4">
                        <Pagination
                            current={currentPage}
                            pageSize={itemsPerPage}
                            total={formattedHouses.length}
                            onChange={handlePageChange}
                            showSizeChanger={false}
                            className={isDarkMode ? 'dark-pagination' : ''}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Search;