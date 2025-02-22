import { useState, useEffect } from 'react';
import { RiSearch2Line } from "react-icons/ri";
import House from './House'; // Import the House component
import useSupabaseClient from '../../backend/supabase/supabase';
import { Pagination, Spin } from 'antd';
import PropTypes from 'prop-types';
import '@/assets/style/pages/search.css';


const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const Search = ({ houses }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(true);
    const itemsPerPage = 6;
    const [input, setInput] = useState("");
    const [filteredHouses, setFilteredHouses] = useState(houses);
    const supabase = useSupabaseClient();

    useEffect(() => {
        fetchData(input);
    }, []);

    const fetchData = async (value) => {
        if (value && value.length > 0) {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('properties')
                    .select('*')
                    .ilike('address', `%${value}%`);

                if (error) throw error;

                // Filter out houses that are not available
                const formattedData = data
                    .filter(property => property.is_available) // Filter available properties
                    .map((property) => ({
                        image: property.images ? property.images[0] : 'https://via.placeholder.com/400x250',
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

                setFilteredHouses(formattedData);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        } else {
            // Reset to all available houses when input is empty
            setFilteredHouses(houses);
            setLoading(false);
        }
    };

    const handleChange = (value) => {
        setInput(value);
        fetchData(value);
    };

    const handleSearchClick = () => {
        fetchData(input);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const indexOfLastHouse = currentPage * itemsPerPage;
    const indexOfFirstHouse = indexOfLastHouse - itemsPerPage;
    const currentHouses = filteredHouses.slice(indexOfFirstHouse, indexOfLastHouse);

    if (loading) {
        return (
            <div className='py-10 px-5 min-w-full'>
                <div className='flex flex-col w-full justify-center items-center mt-2 mb-10'>
                    <div className='search-box bg-white shadow-2xl rounded-lg p-6 flex flex-col lg:flex-row gap-4 w-full max-w-[600px] transition-all duration-300 ease-in-out hover:shadow-xl border border-gray-300'>
                        <input
                            placeholder="Type to search..."
                            value={input}
                            onChange={(e) => handleChange(e.target.value)}
                            className='p-4 border border-gray-300 rounded-lg w-full lg:max-w-[400px] focus:outline-none focus:ring-2 focus:ring-violet-700 transition duration-300'
                        />
                        <button 
                            onClick={handleSearchClick} 
                            className='bg-violet-700 hover:bg-violet-800 transition w-full lg:max-w-[162px] h-14 rounded-lg flex justify-center items-center text-white text-lg font-semibold'
                        >
                            <RiSearch2Line size={24} />
                        </button>
                    </div>
                
                    <Spin size="large" className="flex my-48 justify-center" />
                </div>
            </div>
        );
    }

    return (
        <div className='search-container py-10 px-5'>
            <div className='flex flex-col lg:flex-row w-full justify-center items-center mt-2 mb-10'>
                <div className='search-box bg-white shadow-2xl rounded-lg p-6 flex flex-col lg:flex-row gap-4 max-w-[600px] transition-all duration-300 ease-in-out hover:shadow-xl border border-gray-300'>
                    <input
                        placeholder="Type to search..."
                        value={input}
                        onChange={(e) => handleChange(e.target.value)}
                        className='p-4 border border-gray-300 rounded-lg w-full lg:max-w-[400px] focus:outline-none focus:ring-2 focus:ring-violet-700 transition duration-300'
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
            <img src="/src/assets/img/properties-empty.webp" alt="No properties available" className="w-80 h-80 rounded-md" />
            <p className="text-gray-500 mt-4">No properties found. Try adjusting your search criteria.</p>
        </div>
    )}
    
    {currentHouses.length > 0 && (
        <div className="flex justify-center mt-4">
            <Pagination
                current={currentPage}
                pageSize={itemsPerPage}
                total={filteredHouses.length}
                onChange={handlePageChange}
                showSizeChanger={false}
            />
        </div>
    )}
</div>

        </div>
    );
};

Search.propTypes = {
    houses: PropTypes.array.isRequired,
};

export default Search;