import React from 'react';
import { Button, Dropdown, Space } from 'antd';
import { useHouseStore } from '../../store/useHouseStore';
import { useTheme } from '../../context/ThemeContext';

const typeItems = [
    { key: 'any', label: 'Property type (any)' },
    { key: 'house', label: 'House' },
    { key: 'apartment', label: 'Apartment' },
    { key: 'condo', label: 'Condo' },
    { key: 'townhouse', label: 'Townhouse' },
];

const priceItems = [
    { key: 'any', label: 'Price range (any)' },
    { key: '1', label: '0 - 100000' },
    { key: '2', label: '100000 - 300000' },
    { key: '3', label: '300000 - 500000' },
    { key: '4', label: '500000 - 99999999' },
];

function FilterDropdown() {
    const { isDarkMode } = useTheme();
    const property = useHouseStore((state) => state.property);
    const setProperty = useHouseStore((state) => state.setProperty);
    const price = useHouseStore((state) => state.price);
    const setPrice = useHouseStore((state) => state.setPrice);

    const handleTypeClick = ({ key }) => {
        const selected = typeItems.find(item => item.key === key);
        if (selected) setProperty(selected.label);
    };

    const handlePriceClick = ({ key }) => {
        const selected = priceItems.find(item => item.key === key);
        if (selected) setPrice(selected.label);
    };

    return (
        <Space direction="vertical" className="mb-4">
            <Space wrap>
                <Dropdown
                    menu={{ 
                        items: typeItems.map(item => ({ key: item.key, label: item.label })),
                        onClick: handleTypeClick
                    }}
                    placement="bottomLeft"
                >
                    <Button className={`rounded-full shadow-md font-semibold ${isDarkMode ? 'bg-gray-800 text-white border-gray-700 hover:text-violet-400' : 'bg-white border-gray-300 text-gray-700 hover:text-violet-700'}`}>
                        {property.includes('(any)') ? 'House Type' : property}
                    </Button>
                </Dropdown>
                <Dropdown
                    menu={{ 
                        items: priceItems.map(item => ({ key: item.key, label: item.label })),
                        onClick: handlePriceClick
                    }}
                    placement="bottom"
                >
                    <Button className={`rounded-full shadow-md font-semibold ${isDarkMode ? 'bg-gray-800 text-white border-gray-700 hover:text-violet-400' : 'bg-white border-gray-300 text-gray-700 hover:text-violet-700'}`}>
                        {price.includes('(any)') ? 'Price Range' : price}
                    </Button>
                </Dropdown>
            </Space>
        </Space>
    );
}

export default FilterDropdown;
