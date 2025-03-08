import "./App.css";
import { RouterProvider, createBrowserRouter, BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}
export default App;
