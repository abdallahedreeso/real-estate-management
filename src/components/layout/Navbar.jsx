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
import { ArrowUpRight, Heart, Store, Globe, Menu, Building2, Plus, X, MessageCircle, Handshake } from "lucide-react";
import { useSaleCopy } from "@/sales/copy";
import { protectedSalesEnabled } from "@/sales/config";
import useSupabaseClient from "@/backend/supabase/supabase";
import NotificationBell from "@/components/notifications/NotificationBell";
import { useHouseStore } from "@/store/useHouseStore";
import "@/assets/style/components/mobile-drawer.css";

const Navbar = () => {
  const { t, i18n } = useTranslation();
  const saleCopy = useSaleCopy();
  const [open, setOpen] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const [saleStaff, setSaleStaff] = useState(false);
  const location = useLocation();
  const { isSignedIn } = useUser();
  const { userId } = useAuth();
  const navigate = useNavigate();

  const supabase = useSupabaseClient();
  const wishlistCount = useHouseStore((state) => state.wishlistCount);
  const fetchWishlistCount = useHouseStore((state) => state.fetchWishlistCount);
  const isOnline = useHouseStore((state) => state.isOnline);
  const processOfflineOutbox = useHouseStore((state) => state.processOfflineOutbox);

  useEffect(() => {
    if (!protectedSalesEnabled || !supabase || !userId) { setSaleStaff(false); return; }
    let active = true;
    supabase.from("sale_staff").select("user_id").eq("user_id", userId).eq("active", true).maybeSingle()
      .then(({ data }) => { if (active) setSaleStaff(Boolean(data)); });
    return () => { active = false; };
  }, [supabase, userId]);

  // Fetch wishlist count and sync offline outbox queue when user is online
  useEffect(() => {
    if (supabase && userId) {
      fetchWishlistCount(supabase, userId);
      if (isOnline) {
        processOfflineOutbox(supabase, userId);
      }
    }
  }, [supabase, userId, isOnline, fetchWishlistCount, processOfflineOutbox]);

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
  const handleOpenMessages = () => navigate("/Messages");
  const handleOpenDeals = () => navigate("/Deals");

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
      <div className="site-header">
        <nav className="site-container nav-inner" aria-label={t("navbar.primaryNavigation")}>
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <span className="brand-mark"><Building2 size={27} strokeWidth={1.7} /><span>REAL<span>ESTATE</span></span></span>
            </Link>
          </div>

          {/* Drawer Menu (Mobile) */}
          <Drawer onClose={onClose} width="min(100vw, 390px)" placement={i18n.language.startsWith("ar") ? "left" : "right"} open={open} title={null} closable={false} rootClassName="site-mobile-drawer">
            <div className="mobile-drawer-shell" dir={i18n.language.startsWith("ar") ? "rtl" : "ltr"}>
              <div className="mobile-drawer-top">
                <Link to="/" onClick={onClose} aria-label={t("navbar.home")} className="mobile-drawer-brand"><Building2 size={27} strokeWidth={1.7} aria-hidden="true" /><span>REAL<span>ESTATE</span></span></Link>
                <button type="button" className="mobile-drawer-close" onClick={onClose} aria-label={t("navbar.closeMenu")}><X size={21} aria-hidden="true" /></button>
              </div>
              <div className="mobile-drawer-intro"><span>{t("navbar.menuEyebrow")}</span><p>{t("navbar.menuIntro")}</p></div>
              <nav className="mobile-drawer-nav" aria-label={t("navbar.menuLabel")}>
                {[["/", "home"], ["/About", "about"], ["/ContactUs", "contact"]].map(([path, key], index) => (
                  <Link key={path} to={path} onClick={onClose} aria-current={location.pathname === path ? "page" : undefined}>
                    <span className="mobile-drawer-number">0{index + 1}</span><span>{t(`navbar.${key}`)}</span><ArrowUpRight size={18} aria-hidden="true" />
                  </Link>
                ))}
              </nav>
              <div className="mobile-drawer-account">
                <span className="mobile-drawer-label">{t("navbar.accountLabel")}</span>
                <SignedIn>
                  <Link to="/AddProperty" className="mobile-drawer-primary" onClick={onClose}><Plus size={18} aria-hidden="true" />{t("navbar.addProperty")}<ArrowUpRight size={17} aria-hidden="true" /></Link>
                  <div className="mobile-drawer-shortcuts">
                    <Link to="/MyProperty" onClick={onClose} aria-current={location.pathname === "/MyProperty" ? "page" : undefined}><Store size={18} aria-hidden="true" />{t("navbar.myProperties")}</Link>
                    <Link to="/Wishlist" onClick={onClose} aria-current={location.pathname === "/Wishlist" ? "page" : undefined}><Heart size={18} aria-hidden="true" />{t("navbar.wishlist")}<span>{wishlistCount}</span></Link>
                    <Link to="/Messages" onClick={onClose} aria-current={location.pathname === "/Messages" ? "page" : undefined}><MessageCircle size={18} aria-hidden="true" />{t("inquiries.title")}</Link>
                    {protectedSalesEnabled && <Link to="/Deals" onClick={onClose} aria-current={location.pathname === "/Deals" ? "page" : undefined}><Handshake size={18} aria-hidden="true" />{saleCopy.deals}</Link>}
                    {saleStaff && <Link to="/SalesReview" onClick={onClose} aria-current={location.pathname === "/SalesReview" ? "page" : undefined}><Handshake size={18} aria-hidden="true" />{saleCopy.review}</Link>}
                  </div>
                </SignedIn>
                <SignedOut>
                  <button type="button" className="mobile-drawer-primary" onClick={drawerSignIn}>{t("navbar.signIn")}<ArrowUpRight size={17} aria-hidden="true" /></button>
                  <button type="button" className="mobile-drawer-secondary" onClick={drawerSignUp}>{t("navbar.signUp")}</button>
                </SignedOut>
              </div>
              <div className="mobile-drawer-bottom">
                <span>{t("navbar.language")}</span>
                <button type="button" onClick={toggleLanguage} aria-label={t("navbar.switchLanguage")}><Globe size={18} aria-hidden="true" />{i18n.language.startsWith("ar") ? "English" : "العربية"}<ArrowUpRight size={15} aria-hidden="true" /></button>
              </div>
            </div>
          </Drawer>

          {/* Links (Desktop) */}
          <div className="hidden md:flex items-center">
            <ul className="nav-links">
              <li>
                <Link to="/" className={location.pathname === "/" ? "active" : ""}>
                  {t("navbar.home")}
                </Link>
              </li>
              <li>
                <Link to="/About" className={location.pathname === "/About" ? "active" : ""}>
                  {t("navbar.about")}
                </Link>
              </li>
              <li>
                <Link to="/ContactUs" className={location.pathname === "/ContactUs" ? "active" : ""}>
                  {t("navbar.contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Buttons and Actions */}
          <div className="nav-actions">
            {/* Desktop Language Switcher */}
            <Button onClick={toggleLanguage} className="hidden md:flex nav-language" aria-label={t("navbar.switchLanguage")}>
              <Globe size={15} />
              {i18n.language.startsWith("ar") ? "EN" : "عربي"}
            </Button>

            <SignedOut>
              <Button variant="outline" className="nav-signup hidden md:block" onClick={() => setShowSignUp(true)}>
                {t("navbar.signUp")}
              </Button>
              <Button type="primary" className="nav-signin hidden md:block" onClick={() => setShowSignIn(true)}>
                {t("navbar.signIn")}
              </Button>
            </SignedOut>

            <SignedIn>
              <NotificationBell />
              <Link to="/AddProperty" className="hidden md:block">
                <Button className="nav-add-property">
                  {t("navbar.addProperty")}
                </Button>
              </Link>
              <UserButton appearance={{ elements: { avatarBox: "w-10 h-10" } }}>
                <UserButton.MenuItems>
                  <UserButton.Action label={t("navbar.myProperties")} labelIcon={<Store size={15} />} onClick={handleOpenMyProp} />
                  <UserButton.Action
                    label={t("navbar.wishlist")}
                    labelIcon={
                      <Badge count={wishlistCount} size="small" offset={[10, -5]}>
                        <Heart size={15} />
                      </Badge>
                    }
                    onClick={handleOpenWishlist}
                  />
                  <UserButton.Action label={t("inquiries.title")} labelIcon={<MessageCircle size={15} />} onClick={handleOpenMessages} />
                  {protectedSalesEnabled && <UserButton.Action label={saleCopy.deals} labelIcon={<Handshake size={15} />} onClick={handleOpenDeals} />}
                  {saleStaff && <UserButton.Action label={saleCopy.review} labelIcon={<Handshake size={15} />} onClick={() => navigate("/SalesReview")} />}
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>

            {/* Hamburger (Mobile) */}
            <button type="button" className="mobile-menu-button md:hidden" onClick={showDrawer} aria-label={t("navbar.openMenu")}><Menu size={23} /></button>
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
