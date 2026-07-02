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
const NotFound = React.lazy(() => import("./pages/NotFound"));
import { ClerkProvider } from "@clerk/clerk-react";
import HouseContextProvider from "./components/Home/HouseContext";
import { dark } from "@clerk/themes";
import { useTheme } from "./context/ThemeContext";
import { SupabaseProvider } from "./context/SupabaseContext";
import EnvDiagnosticScreen from "./components/diagnostics/EnvDiagnosticScreen";

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

  if (hasMissingKeys) {
    return <EnvDiagnosticScreen />;
  }

  return (
    <ClerkProvider
      appearance={isDarkMode ? { baseTheme: dark } : null}
      publishableKey={PUBLISHABLE_KEY}
      afterSignOutUrl="/"
    >
      <SupabaseProvider>
        <HouseContextProvider>
          <RouterProvider router={router} />
        </HouseContextProvider>
      </SupabaseProvider>
    </ClerkProvider>
  );
}
export default App;
