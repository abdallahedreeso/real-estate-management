import React, { useState, useEffect, createContext, useMemo } from 'react';
import useSupabaseClient from '../../backend/supabase/supabase';

export const HouseContext = createContext();

const HouseContextProvider = ({ children }) => {
    const [houses, setHouses] = useState([]); // Raw listings from database
    const [country, setCountry] = useState('Location (any)');
    const [property, setProperty] = useState('Property type (any)');
    const [price, setPrice] = useState('Price range (any)');
    const [searchAddress, setSearchAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const supabase = useSupabaseClient();

    // Fetch houses from Supabase
    const fetchHouses = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('properties')
                .select('*');

            if (error) {
                console.error('Error fetching houses:', error);
            } else {
                setHouses(data || []);
            }
        } catch (err) {
            console.error('Error fetching houses:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!supabase) return;

        // Fetch properties on mount
        fetchHouses();

        // Subscribe to real-time changes on the properties table
        const channel = supabase
            .channel('properties-realtime')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'properties'
                },
                (payload) => {
                    const { eventType, new: newRecord, old: oldRecord } = payload;

                    setHouses((prevHouses) => {
                        switch (eventType) {
                            case 'INSERT':
                                return [...prevHouses, newRecord];
                            case 'UPDATE':
                                return prevHouses.map((house) =>
                                    house.property_id === newRecord.property_id ? newRecord : house
                                );
                            case 'DELETE':
                                return prevHouses.filter((house) => house.property_id !== oldRecord.property_id);
                            default:
                                return prevHouses;
                        }
                    });
                }
            )
            .subscribe();

        // Cleanup: remove subscription when unmounting
        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase]);

    const handleClick = (addressInput) => {
        setSearchAddress(addressInput || '');
    };

    // Derived filtering state
    const filteredHouses = useMemo(() => {
        const isDefault = (str) => !str || str.toLowerCase().includes('(any)');

        return houses.filter((house) => {
            // Country filter
            if (!isDefault(country) && house.country !== country) {
                return false;
            }

            // Property type filter
            if (!isDefault(property) && house.property_type !== property) {
                return false;
            }

            // Search Address filter
            if (searchAddress) {
                const houseAddress = house.address || '';
                const addressMatch = houseAddress.toLowerCase().includes(searchAddress.toLowerCase());
                if (!addressMatch) return false;
            }

            // Price filter with fallback
            if (!isDefault(price)) {
                const parts = price.split(' ');
                const minPrice = parseInt(parts[0]) || 0;
                const maxPrice = parseInt(parts[2]) || Infinity;
                const housePrice = parseInt(house.price) || 0;

                if (housePrice < minPrice || housePrice > maxPrice) {
                    return false;
                }
            }

            return true;
        });
    }, [houses, country, property, price, searchAddress]);

    return (
        <HouseContext.Provider
            value={{
                country,
                setCountry,
                property,
                setProperty,
                price,
                setPrice,
                houses: filteredHouses, // Expose derived state as "houses"
                rawHouses: houses,      // Keep raw list accessible
                loading,
                handleClick,
            }}
        >
            {children}
        </HouseContext.Provider>
    );
};

export default HouseContextProvider;

