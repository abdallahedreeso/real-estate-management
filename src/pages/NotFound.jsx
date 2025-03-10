import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
import { HomeIcon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const NotFound = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Result
        status="404"
        title={<span className={`text-4xl ${isDarkMode ? 'text-violet-400' : 'text-violet-700'} font-bold`}>404</span>}
        subTitle={
          <div className={`text-lg ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} mt-4`}>
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
            className={`mt-6 ${isDarkMode ? 'bg-violet-600 hover:bg-violet-500' : 'bg-violet-700 hover:bg-violet-600'} flex items-center gap-2 mx-auto`}
          >
            Back to Home
          </Button>
        }
        className={`shadow-xl rounded-xl border ${isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200'} p-8`}
      />
    </div>
  );
};

export default NotFound;