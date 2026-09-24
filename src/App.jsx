import React from "react";
import "./App.css";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import ProtectRoute from "./components/ProtectedRoute/ProtectRoute";

const Home = React.lazy(() => import("./pages/Home"));
const PropertyDetails = React.lazy(() => import("./pages/PropertyDetails"));
const AddProperty = React.lazy(() => import("./pages/AddProperty"));
const Listing = React.lazy(() => import("./pages/Listing"));
const ContactUs = React.lazy(() => import("./pages/ContactUsPage"));
const About = React.lazy(() => import("./pages/About"));
const EditProperty = React.lazy(() => import("./pages/EditProperty"));
const Wishlist = React.lazy(() => import("./pages/Wishlist"));
const Messages = React.lazy(() => import("./pages/Messages"));
const SaleDeals = React.lazy(() => import("./pages/SaleDeals"));
const SaleWorkspace = React.lazy(() => import("./pages/SaleWorkspace"));
const SaleReview = React.lazy(() => import("./pages/SaleReview"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
import { ClerkProvider } from "@clerk/clerk-react";
import { dark } from "@clerk/themes";
import { arSA } from "@clerk/localizations";
import { useTheme } from "./context/ThemeContext";
import { SupabaseProvider } from "./context/SupabaseContext";
import EnvDiagnosticScreen from "./components/diagnostics/EnvDiagnosticScreen";
import { protectedSalesEnabled } from "./sales/config";
import { ConfigProvider, theme as antdTheme } from "antd";
import { useTranslation } from "react-i18next";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const hasMissingKeys = !PUBLISHABLE_KEY || !SUPABASE_URL || !SUPABASE_KEY;

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
        path: "/Messages",
        element: (
          <ProtectRoute>
            <Messages />
          </ProtectRoute>
        ),
      },
      { path: "/Deals", element: protectedSalesEnabled ? <ProtectRoute><SaleDeals /></ProtectRoute> : <NotFound /> },
      { path: "/Deals/:id", element: protectedSalesEnabled ? <ProtectRoute><SaleWorkspace /></ProtectRoute> : <NotFound /> },
      { path: "/SalesReview", element: protectedSalesEnabled ? <ProtectRoute><SaleReview /></ProtectRoute> : <NotFound /> },
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
  const { i18n } = useTranslation();

  if (hasMissingKeys) {
    return <EnvDiagnosticScreen />;
  }

  return (
    <ClerkProvider
      appearance={isDarkMode ? { baseTheme: dark } : null}
      localization={i18n.language.startsWith("ar") ? arSA : undefined}
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      <SupabaseProvider>
        <ConfigProvider direction={i18n.dir()} theme={{ algorithm: isDarkMode ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm, token: { colorPrimary: isDarkMode ? "#69d1c4" : "#0d6e67", fontFamily: i18n.dir() === "rtl" ? "'Noto Sans Arabic', sans-serif" : "'DM Sans', sans-serif" } }}>
          <RouterProvider router={router} />
        </ConfigProvider>
      </SupabaseProvider>
    </ClerkProvider>
  );
}
export default App;
