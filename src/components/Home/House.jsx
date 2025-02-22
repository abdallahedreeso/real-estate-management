import { MapPin } from "lucide-react";
import PropTypes from 'prop-types';
import { BiBed, BiBath, BiArea } from "react-icons/bi";
import { FaParking } from "react-icons/fa";
import { Link } from "react-router-dom";

const House = ({ house }) => {
  const {
    image,
    type,
    state,
    address,
    bedrooms,
    bathrooms,
    surface,
    price,
    parking,
    propertyId,
  } = house;

  return (
    <Link to={`/property/${propertyId}`}>
      <div className="bg-white shadow-lg p-6 w-full max-w-[400px] mx-auto mb-12 cursor-pointer hover:shadow-2xl transition rounded-lg hover:scale-105">
        <img
          className="rounded-md mb-6 w-full h-[250px] object-cover transition-transform duration-300 transform hover:scale-110"
          src={image}
          alt="house"
        />
        <div className="mb-4 flex gap-x-2 text-sm">
          <div className="bg-green-600 rounded-full text-white font-medium px-3 py-1 shadow">
            {type}
          </div>
          <div className="bg-violet-600 rounded-full text-white font-medium px-3 py-1 shadow">
            {state}
          </div>
        </div>
        <div className="flex text-lg font-semibold text-gray-800 max-w-[260px]">
          <MapPin className="mr-2 text-violet-700" />
          <span>{address}</span>
        </div>
        <div className="flex md:flex-nowrap flex-wrap justify-center gap-4 my-4">
          <div className="flex md:w-24 w-5/12 gap-2 text-sm text-gray-600 bg-slate-200 rounded-md p-2 justify-center items-center transition duration-300 hover:bg-slate-300">
            <BiBed className="text-[20px]" />
            <span>{bedrooms}</span>
          </div>
          <div className="flex md:w-24 w-5/12 gap-2 text-sm text-gray-600 bg-slate-200 rounded-md p-2 justify-center items-center transition duration-300 hover:bg-slate-300">
            <BiBath className="text-[20px]" />
            <span>{bathrooms}</span>
          </div>
          <div className="flex md:w-24 w-5/12 gap-2 text-sm text-gray-600 bg-slate-200 rounded-md p-2 justify-center items-center transition duration-300 hover:bg-slate-300">
            <FaParking className="text-[20px]" />
            <span>{parking}</span>
          </div>
          <div className="flex md:w-24 w-5/12 gap-2 text-sm text-gray-600 bg-slate-200 rounded-md p-2 justify-center items-center transition duration-300 hover:bg-slate-300">
            <BiArea className="text-[20px]" />
            <span>{surface}</span>
          </div>
        </div>
        <div className="text-xl font-semibold text-violet-600 mb-2">
          ${price}
        </div>
      </div>
    </Link>
  );
};
House.propTypes = {
  house: PropTypes.shape({
    image: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    state: PropTypes.string.isRequired,
    address: PropTypes.string.isRequired,
    bedrooms: PropTypes.number.isRequired,
    bathrooms: PropTypes.number.isRequired,
    surface: PropTypes.number.isRequired,
    price: PropTypes.number.isRequired,
    parking: PropTypes.number.isRequired,
    propertyId: PropTypes.string.isRequired,
  }).isRequired,
};

export default House;