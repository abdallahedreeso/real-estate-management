import { Button, Empty } from "antd";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";

const EmptyWishlist = () => {
  const navigate = useNavigate();

  return (
    <div 
    className="flex flex-col items-center justify-center py-16 px-4"
    style={{ marginTop: "66px", marginBottom: "65px" }}
    >
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        imageStyle={{ height: 120 }}
        description={
          <div className="text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">
              Start exploring properties and add your favorites to the wishlist
            </p>
          </div>
        }
      >
        <Button 
          type="primary" 
          icon={<Home size={18} />}
          onClick={() => navigate("/")}
          className="bg-violet-700 hover:bg-violet-600 flex items-center gap-2"
          size="large"
        >
          Explore Properties
        </Button>
      </Empty>
    </div>
  );
};

export default EmptyWishlist;