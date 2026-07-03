import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button, Drawer, Badge } from "antd";
import {
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
  useAuth,
} from "@clerk/clerk-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Store, Globe } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import useSupabaseClient from "@/backend/supabase/supabase";
import { useHouseStore } from "@/store/useHouseStore";
import logo from "../../assets/Logo2.svg";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const location = useLocation();
  const { isSignedIn } = useUser();
  const { userId } = useAuth();
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();

  const supabase = useSupabaseClient();
  const wishlistCount = useHouseStore((state) => state.wishlistCount);
  const fetchWishlistCount = useHouseStore((state) => state.fetchWishlistCount);

  // Fetch wishlist count when user logs in or supabase context initializes
  useEffect(() => {
    if (supabase && userId) {
      fetchWishlistCount(supabase, userId);
    }
  }, [supabase, userId]);

  const toggleLanguage = () => {
    const nextLang = i18n.language.startsWith("ar") ? "en" : "ar";
    i18n.changeLanguage(nextLang);
  };

  const showDrawer = () => setOpen(true);
  const onClose = () => setOpen(false);

  const drawerSignIn = () => {
    setOpen(false);
    setShowSignIn(true);
  };
  const drawerSignUp = () => {
    setOpen(false);
    setShowSignUp(true);
  };

  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) {
      setShowSignIn(false);
      setShowSignUp(false);
    }
  };

  const handleOpenMyProp = () => navigate("/MyProperty");
  const handleOpenWishlist = () => navigate("/Wishlist");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("sign-in") === "true") {
      setShowSignIn(true);
    }
    if (isSignedIn) {
      setShowSignUp(false);
      setShowSignIn(false);
    }
  }, [location.search, isSignedIn]);

  return (
    <>
      <div className="shadow-md mb-10 lg:mb-0">
        <nav className="flex items-center justify-between mx-4 py-2 border-none">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <img src={logo} alt="Company Logo" width={150} />
            </Link>
          </div>

          {/* Drawer Menu (Mobile) */}
          <Drawer onClose={onClose} closable={false} width="60%" open={open}>
            <Link to="/" onClick={onClose}>
              <img src={logo} alt="Company Logo" width={160} className="mx-auto mb-4" />
            </Link>

            <div className="flex flex-col items-center justify-center gap-3">
              <Link to="/" className="text-gray-600 hover:text-white hover:bg-violet-500 w-full text-center p-2 rounded font-bold" onClick={onClose}>
                {t("navbar.home")}
              </Link>
              <Link to="/About" className="text-gray-600 hover:text-white hover:bg-violet-500 w-full text-center p-2 rounded font-bold" onClick={onClose}>
                {t("navbar.about")}
              </Link>
              <Link to="/ContactUs" className="text-gray-600 hover:text-white hover:bg-violet-500 w-full text-center p-2 rounded font-bold" onClick={onClose}>
                {t("navbar.contact")}
              </Link>
              <Button type="default" onClick={toggleLanguage} className="w-full flex items-center justify-center gap-2 font-bold">
                <Globe size={16} />
                {i18n.language.startsWith("ar") ? "English" : "العربية"}
              </Button>
              <SignedIn>
                <Link to="/AddProperty" onClick={onClose}>
                  <Button type="dashed" className="font-semibold shadow text-white rounded-full w-24 h-9 bg-violet-700 hover:bg-violet-500" style={{ fontSize: "11px" }}>
                    {t("navbar.addProperty")}
                  </Button>
                </Link>
              </SignedIn>
              <SignedOut>
                <Button variant="outline" className="font-semibold shadow rounded-full w-28 h-9" onClick={drawerSignUp}>
                  {t("navbar.signUp")}
                </Button>
                <Button type="dashed" className="font-semibold shadow text-white rounded-full w-28 h-9 bg-violet-700 hover:bg-violet-500" onClick={drawerSignIn}>
                  {t("navbar.signIn")}
                </Button>
              </SignedOut>
            </div>
          </Drawer>

          {/* Links (Desktop) */}
          <div className="hidden md:flex items-center">
            <ul className="flex space-x-10 rtl:space-x-reverse">
              <li>
                <Link to="/" className={`${isDarkMode ? 'text-gray-100' : 'text-gray-600'} font-bold hover:text-white hover:bg-violet-700 rounded py-2 px-6`}>
                  {t("navbar.home")}
                </Link>
              </li>
              <li>
                <Link to="/About" className={`${isDarkMode ? 'text-gray-100' : 'text-gray-600'} font-bold hover:text-white hover:bg-violet-700 rounded py-2 px-6`}>
                  {t("navbar.about")}
                </Link>
              </li>
              <li>
                <Link to="/ContactUs" className={`${isDarkMode ? 'text-gray-100' : 'text-gray-600'} font-bold hover:text-white hover:bg-violet-700 rounded py-2 px-6`}>
                  {t("navbar.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Buttons and Actions */}
          <div className="flex gap-4 items-center">
            {/* Desktop Language Switcher */}
            <Button onClick={toggleLanguage} className="hidden md:flex items-center gap-1 font-bold border-violet-700 text-violet-700 hover:bg-violet-700 hover:text-white rounded-full transition">
              <Globe size={15} />
              {i18n.language.startsWith("ar") ? "EN" : "عربي"}
            </Button>

            <SignedOut>
              <Button variant="outline" className="font-semibold shadow rounded-full w-28 h-9 hidden md:block" onClick={() => setShowSignUp(true)}>
                {t("navbar.signUp")}
              </Button>
              <Button type="dashed" className="font-semibold shadow text-white rounded-full w-28 h-9 bg-violet-700 hover:bg-violet-500 hidden md:block" onClick={() => setShowSignIn(true)}>
                {t("navbar.signIn")}
              </Button>
            </SignedOut>

            <SignedIn>
              <Link to="/AddProperty" className="hidden md:block">
                <Button type="dashed" className="font-semibold shadow text-white rounded-full w-28 h-9 bg-violet-700 hover:bg-violet-500" style={{ fontSize: "11px" }}>
                  {t("navbar.addProperty")}
                </Button>
              </Link>
              <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }}>
                <UserButton.MenuItems>
                  <UserButton.Action label="My Properties" labelIcon={<Store size={15} />} onClick={handleOpenMyProp} />
                  <UserButton.Action
                    label="Wishlist"
                    labelIcon={
                      <Badge count={wishlistCount} size="small" offset={[10, -5]}>
                        <Heart size={15} />
                      </Badge>
                    }
                    onClick={handleOpenWishlist}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>

            {/* Hamburger (Mobile) */}
            <div className="md:hidden flex flex-col cursor-pointer" onClick={showDrawer}>
              <div className="w-8 h-1 bg-violet-600 mb-1"></div>
              <div className="w-8 h-1 bg-violet-600 mb-1"></div>
              <div className="w-8 h-1 bg-violet-600"></div>
            </div>
          </div>
        </nav>
      </div>

      {showSignUp && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={handleOverlay}>
          <SignUp />
        </div>
      )}
      {showSignIn && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={handleOverlay}>
          <SignIn />
        </div>
      )}
    </>
  );
};

export default Navbar;
