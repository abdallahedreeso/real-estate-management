import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { HomeIcon } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Result
        status="404"
        title={<span className="text-4xl text-violet-700 font-bold">404</span>}
        subTitle={
          <div className="text-lg text-gray-600 mt-4">
            <p>Oops! The page you're looking for doesn't exist.</p>
            <p>It might have been moved or deleted.</p>
          </div>
        }
        extra={
          <Button
            type="primary"
            size="large"
            icon={<HomeIcon size={18} />}
            onClick={() => navigate("/")}
            className="mt-6 bg-violet-700 hover:bg-violet-600 flex items-center gap-2"
          >
            Back to Home
          </Button>
        }
        className="shadow-xl rounded-xl border border-gray-200 p-8"
      />
    </div>
  );
};

export default NotFound;