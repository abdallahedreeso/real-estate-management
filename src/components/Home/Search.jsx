import { useEffect, useState } from 'react';
import { RiSearch2Line } from "react-icons/ri";
import House from './House'; // Import the House component
import { Pagination } from 'antd';
import { Building2 } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useShallow } from 'zustand/react/shallow';
import { useHouseStore, selectFilteredHouses } from '../../store/useHouseStore';
import { useTranslation } from 'react-i18next';
import { distanceKm, validPoint } from '@/utils/geo';
import { governorateLabel } from '../../constants/governorates';

const capitalizeFirstLetter = (string) => {
    if (!string) return "";
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
};

const Search = () => {
    const { t, i18n } = useTranslation();
    const [currentPage, setCurrentPage] = useState(1);
    const searchAddress = useHouseStore((state) => state.searchAddress);
    const [input, setInput] = useState(searchAddress);
    const { isDarkMode } = useTheme();

    const filteredHouses = useHouseStore(useShallow(selectFilteredHouses));
    const handleClick = useHouseStore((state) => state.handleClick);
    const proximityPoint = useHouseStore((state) => state.proximityPoint);
    const city = useHouseStore((state) => state.city);
    const radiusKm = useHouseStore((state) => state.radiusKm);
    const property = useHouseStore((state) => state.property);
    const listingPurpose = useHouseStore((state) => state.listingPurpose);
    const price = useHouseStore((state) => state.price);

    useEffect(() => { setCurrentPage(1); }, [proximityPoint, city, radiusKm, property, listingPurpose, price]);
    useEffect(() => { setInput(searchAddress); setCurrentPage(1); }, [searchAddress]);

    // Format houses for child House component compatibility
    const formattedHouses = filteredHouses
        .filter(property => property.is_available)
        .map((property) => ({
            image: property.images && property.images.length > 0 ? property.images[0] : null,
            type: capitalizeFirstLetter(property.property_type),
            country: capitalizeFirstLetter(property.country),
            address: property.address,
            state: governorateLabel(property.state, i18n.language),
            bedrooms: property.Bedrooms,
            bathrooms: property.Bathrooms,
            surface: property.surface_area,
            price: property.price,
            propertyId: property.property_id,
            lat: property.latitude,
            lng: property.longitude,
            parking: property.ParkingSpaces,
            distanceKm: proximityPoint && validPoint(property.latitude ?? property.lat, property.longitude ?? property.lng)
                ? distanceKm(proximityPoint, [Number(property.latitude ?? property.lat), Number(property.longitude ?? property.lng)]) : null
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
    const displayedPage = Math.min(currentPage, Math.max(1, Math.ceil(formattedHouses.length / itemsPerPage)));
    const indexOfLastHouse = displayedPage * itemsPerPage;
    const indexOfFirstHouse = indexOfLastHouse - itemsPerPage;
    const currentHouses = formattedHouses.slice(indexOfFirstHouse, indexOfLastHouse);

    return (
        <div className='search-container'>
            <div className='search-bar-wrap'>
                <div className="search-box">
                    <input
                        aria-label={t("redesign.searchPlaceholder")}
                        placeholder={t("redesign.searchPlaceholder")}
                        value={input}
                        onChange={(e) => handleChange(e.target.value)}
                        className="search-input"
                    />
                    <button 
                        onClick={handleSearchClick} 
                        className='search-submit'
                        aria-label={t("redesign.searchAction")}
                    >
                        <RiSearch2Line size={24} />
                    </button>
                </div>
            </div>

            {/* Render house cards */}
            <div>
                {proximityPoint && <p className="home-nearest-label" role="status">{t("redesign.nearestFirst", { count: formattedHouses.length })}</p>}
                {currentHouses.length > 0 ? (
                    <div className="property-grid">
                        {currentHouses.map((house) => (
                            <House key={house.propertyId} house={house} />
                        ))}
                    </div>
                ) : (
                    <div className="empty-results">
                        <Building2 size={54} strokeWidth={1.2} aria-hidden="true" />
                        <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-500'} mt-4`}>{t("redesign.noResults")}</p>
                    </div>
                )}
                
                {currentHouses.length > 0 && (
                    <div className="pagination-wrap">
                        <Pagination
                            current={displayedPage}
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
