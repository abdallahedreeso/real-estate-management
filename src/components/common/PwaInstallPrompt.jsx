import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "antd";
import { Download } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const PwaInstallPrompt = () => {
  const { t } = useTranslation();
  const { isDarkMode } = useTheme();
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
      // Show the install promotion bar
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // We've used the prompt, and can't use it again, discard it
    setDeferredPrompt(null);
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex flex-col gap-3 max-w-sm border transition-all duration-300 ${
        isDarkMode 
          ? "bg-gray-800 border-gray-700 text-gray-100" 
          : "bg-white border-gray-200 text-gray-800"
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-violet-100 text-violet-700">
          <Download size={20} />
        </div>
        <div>
          <h4 className="font-bold text-sm">Real Estate App</h4>
          <p className="text-xs text-gray-400">
            {t("pwa.installDesc")}
          </p>
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        <Button size="small" type="text" onClick={handleDismiss} className={isDarkMode ? "text-gray-400 hover:text-white" : ""}>
          {t("pwa.dismiss")}
        </Button>
        <Button size="small" type="primary" onClick={handleInstallClick} className="bg-violet-700 hover:bg-violet-600 border-none">
          {t("pwa.install")}
        </Button>
      </div>
    </div>
  );
};

export default PwaInstallPrompt;
