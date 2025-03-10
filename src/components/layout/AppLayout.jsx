import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ThemeToggle from "../theme/ThemeToggle";

const AppLayout = () => {
  return (
    <>
      <Navbar />
      <Outlet />
      <ThemeToggle />
      <Footer />
    </>
  );
};

export default AppLayout;
