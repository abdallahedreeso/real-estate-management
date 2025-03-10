import React from "react";
import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Home from "./pages/Home";
import PropertyDetails from "./pages/PropertyDetails";
import AddProperty from "./pages/AddProperty";
import Listing from "./pages/Listing";
import ContactUs from "./pages/ContactUsPage";
import About from "./pages/About";
import EditProperty from "./pages/EditProperty";
import ProtectRoute from "./components/ProtectedRoute/ProtectRoute";
import Wishlist from "./pages/Wishlist";
import NotFound from "./pages/NotFound";
import { ClerkProvider } from "@clerk/clerk-react";
import HouseContextProvider from "./components/Home/HouseContext";
import { dark } from "@clerk/themes";
import { useTheme } from "./context/ThemeContext";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/property/:id",
        element: <PropertyDetails />,
      },
      {
        path: "/AddProperty",
        element: (
          <ProtectRoute>
            <AddProperty />
          </ProtectRoute>
        ),
      },
      {
        path: "/MyProperty",
        element: (
          <ProtectRoute>
            <Listing />
          </ProtectRoute>
        ),
      },
      {
        path: "/MyProperty/edit/:id",
        element: (
          <ProtectRoute>
            <EditProperty />
          </ProtectRoute>
        ),
      },
      {
        path: "/Wishlist",
        element: (
          <ProtectRoute>
            <Wishlist />
          </ProtectRoute>
        ),
      },
      {
        path: "/ContactUs",
        element: <ContactUs />,
      },
      {
        path: "/About",
        element: <About />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

function App() {
  const { isDarkMode } = useTheme();
  return (
    <ClerkProvider
      appearance={isDarkMode ? { baseTheme: dark } : null}
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      <HouseContextProvider>
        <React.StrictMode>
          <RouterProvider router={router} />
        </React.StrictMode>
      </HouseContextProvider>
    </ClerkProvider>
  );
}
export default App;
