import { Button } from "antd";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useTranslation } from "react-i18next";

const ThemeToggle = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <Button
      type="primary"
      shape="circle"
      size="large"
      onClick={toggleTheme}
      className="theme-toggle"
      icon={isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
      aria-label={t(isDarkMode ? "redesign.switchToLight" : "redesign.switchToDark")}
    />
  );
};

export default ThemeToggle;
