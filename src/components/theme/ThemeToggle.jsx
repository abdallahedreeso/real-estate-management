import { Button } from "antd";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <Button
      type="primary"
      shape="circle"
      size="large"
      onClick={toggleTheme}
      className={`fixed bottom-6 right-6 z-50 shadow-lg ${
        isDarkMode 
          ? "bg-gray-800 hover:bg-gray-700" 
          : "bg-violet-700 hover:bg-violet-600"
      }`}
      icon={isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
    />
  );
};

export default ThemeToggle;