import { useTranslation } from "react-i18next";
import { useHouseStore } from "@/store/useHouseStore";

const NetworkStatusBar = () => {
  const { t } = useTranslation();
  const isOnline = useHouseStore((state) => state.isOnline);

  if (isOnline) return null;

  return (
    <div 
      className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-2 font-semibold text-sm z-[9999] shadow-md flex items-center justify-center gap-2 transition-all duration-300"
    >
      <span className="w-2 h-2 rounded-full bg-white animate-ping" />
      <span>{t("network.offline")}</span>
    </div>
  );
};

export default NetworkStatusBar;
