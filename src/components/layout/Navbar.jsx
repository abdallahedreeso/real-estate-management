import { useState, useEffect } from "react";
import logo from "../../assets/Logo2.svg";
import { Button, Drawer } from "antd";
import {
  SignIn,
  SignUp,
  SignedIn,
  SignedOut,
  UserButton,
  useUser,
} from "@clerk/clerk-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Heart, Store } from "lucide-react";
import { useTheme } from "@/context/ThemeContext";

const Navbar = () => {
  // const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const [showSignIn, setShowSignIn] = useState(false);
  const location = useLocation();
  const { isSignedIn } = useUser();
  const { isDarkMode } = useTheme();

  // handle drawer
  const showDrawer = () => {
    setOpen(true);
  };
  const onClose = () => {
    setOpen(false);
  };
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
  const navigate = useNavigate();

  const handleOpenMyProp = () => {
    navigate("/MyProperty");
  };
  const handleOpenWishlist = () => {
    navigate("/Wishlist");
  };
  useEffect(() => {
    // Check if the current URL has the 'sign-in' query parameter
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
        <nav className="flex items-center justify-between me-4 border-none">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <img src={logo} alt="Company Logo" width={150} />
            </Link>
          </div>

          {/* drawer */}
          <Drawer onClose={onClose} closable={false} width="60%" open={open}>
            <Link to="/" onClick={onClose}>
              <img
                src={logo}
                alt="Company Logo"
                width={160}
                className="mx-auto"
              />
            </Link>

            <div className="flex flex-col items-center justify-center gap-3">
              <Link
                to="/"
                className="text-gray-600 hover:text-white hover:bg-violet-500 w-full text-center p-2 rounded font-bold"
                aria-label="Home"
                onClick={onClose}
              >
                Home
              </Link>
              <Link
                to="/About"
                className="text-gray-600 hover:text-white hover:bg-violet-500 w-full text-center p-2 rounded font-bold"
                aria-label="About"
                onClick={onClose}
              >
                About
              </Link>
              <Link
                to="/ContactUs"
                className="text-gray-600 hover:text-white hover:bg-violet-500 w-full text-center p-2 rounded font-bold"
                aria-label="Contact"
                onClick={onClose}
              >
                Contact Us
              </Link>
              <SignedIn>
                <Link to="/AddProperty">
                  <Button
                    type="Dashed  "
                    className=" font-semibold shadow text-white rounded-full w-24 h-9 bg-violet-700 hover:bg-violet-500 "
                    style={{ fontSize: "11px" }}
                    onClick={onClose}
                  >
                    Add Property
                  </Button>
                </Link>
              </SignedIn>
              <SignedOut>
                <Button
                  variant="outline"
                  className=" font-semibold shadow rounded-full w-28 h-9 "
                  onClick={drawerSignUp}
                >
                  SignUp
                </Button>
                <Button
                  type="Dashed  "
                  className="  font-semibold shadow text-white rounded-full w-28 h-9 bg-violet-700 hover:bg-violet-500 "
                  onClick={drawerSignIn}
                >
                  SignIn
                </Button>
              </SignedOut>
            </div>
          </Drawer>
          {/* Links */}
          <div className={`md:flex absolute md:static  w-full md:w-auto z-10`}>
            <ul className="hidden md:flex space-y-4 md:space-y-0 lg:space-x-10 p-4 md:p-0">
              <li>
                <Link
                  to="/"
                  className={`${isDarkMode? 'text-gray-100' : 'text-gray-600'}  font-bold hover:text-white hover:bg-violet-700 rounded py-2 px-6`}
                  aria-label="Home"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/About"
                  className={`${isDarkMode? 'text-gray-100' : 'text-gray-600'}  font-bold hover:text-white hover:bg-violet-700 rounded py-2 px-6`}
                  aria-label="About"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/ContactUs"
                  className={`${isDarkMode? 'text-gray-100' : 'text-gray-600'}  font-bold hover:text-white hover:bg-violet-700 rounded py-2 px-6`}
                  aria-label="Contact"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Buttons */}
          <div className=" flex gap-5 items-center ">
            <SignedOut>
              <Button
                variant="outline"
                className=" font-semibold shadow rounded-full w-28 h-9 hidden md:block"
                onClick={() => setShowSignUp(true)}
              >
                SignUp
              </Button>
              <Button
                type="Dashed  "
                className="  font-semibold shadow text-white rounded-full w-28 h-9 bg-violet-700 hover:bg-violet-500 hidden md:block"
                onClick={() => setShowSignIn(true)}
              >
                SignIn
              </Button>
            </SignedOut>
            <SignedIn>
              <Link to="/AddProperty" className="hidden md:block">
                <Button
                  type="Dashed  "
                  className=" font-semibold shadow text-white rounded-full w-24 h-9 bg-violet-700 hover:bg-violet-500 "
                  style={{ fontSize: "11px" }}
                >
                  Add Property
                </Button>
              </Link>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="My Properties"
                    labelIcon={<Store size={15} />}
                    onClick={handleOpenMyProp}
                  />
                </UserButton.MenuItems>
                <UserButton.MenuItems>
                  <UserButton.Action
                    label="Wishlist"
                    labelIcon={<Heart size={15} />}
                    onClick={handleOpenWishlist}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </SignedIn>

            {/* Hamburger */}
            <div
              className="md:hidden flex flex-col cursor-pointer"
              onClick={showDrawer}
            >
              <div className="w-8 h-1 bg-violet-600 mb-1"></div>
              <div className="w-8 h-1 bg-violet-600 mb-1"></div>
              <div className="w-8 h-1 bg-violet-600"></div>
            </div>
          </div>
        </nav>
      </div>
      {showSignUp && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={handleOverlay}
        >
          <SignUp />
        </div>
      )}
      {showSignIn && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={handleOverlay}
        >
          <SignIn />
        </div>
      )}
    </>
  );
};

export default Navbar;
