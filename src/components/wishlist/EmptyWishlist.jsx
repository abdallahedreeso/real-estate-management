import { Button, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import "../../assets/style/components/wishlist.css";

const EmptyWishlist = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <div 
      className={`flex flex-col items-center justify-center py-16 px-4 ${isDarkMode ? 'bg-gray-900' : ''}`}
      style={{ marginTop: "60px"}}
    >
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={{ height: 120 }}
        className={isDarkMode ? 'dark-empty' : ''}
        description={
          <div className="text-center">
            <h3 className={`text-xl font-semibold ${isDarkMode ? 'text-gray-200' : 'text-gray-800'} mb-2`}>Your wishlist is empty</h3>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} mb-6`}>
              Start exploring properties and add your favorites to the wishlist
            </p>
          </div>
        }
      >
        <Button 
          type="primary" 
          icon={<Home size={18} />}
          onClick={() => navigate("/")}
          className={`${isDarkMode ? 'bg-violet-600 hover:bg-violet-500' : 'bg-violet-700 hover:bg-violet-600'} flex items-center gap-2 mx-auto`}
          size="large"
        >
          Explore Properties
        </Button>
      </Empty>
    </div>
  );
};

export default EmptyWishlist;