import { useState } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@/context/ThemeContext";

const OptimizedImage = ({ src, alt, className, ...props }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { isDarkMode } = useTheme();

  // Custom Base64 SVG fallbacks optimized for Light and Dark modes
  const fallbackSvg = isDarkMode
    ? "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='100%' height='100%' fill='%231e293b'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%2364748b'>No Property Image</text></svg>"
    : "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><rect width='100%' height='100%' fill='%23f1f5f9'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='%2394a3b8'>No Property Image</text></svg>";

  const handleImageLoad = () => {
    setLoading(false);
  };

  const handleImageError = () => {
    setError(true);
    setLoading(false);
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Animated Tailwind CSS Skeleton Loader */}
      {loading && (
        <div
          className={`absolute inset-0 w-full h-full animate-pulse rounded-md ${
            isDarkMode ? "bg-gray-800" : "bg-gray-200"
          }`}
          style={{ zIndex: 2 }}
        />
      )}

      {/* Actual Image Element */}
      <img
        src={error ? fallbackSvg : src}
        alt={alt || "Property"}
        className={`${className} ${loading ? "invisible" : "visible"}`}
        onLoad={handleImageLoad}
        onError={handleImageError}
        {...props}
      />
    </div>
  );
};

OptimizedImage.propTypes = {
  src: PropTypes.string,
  alt: PropTypes.string,
  className: PropTypes.string,
};

export default OptimizedImage;
