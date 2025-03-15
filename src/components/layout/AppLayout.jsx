import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ThemeToggle from "../theme/ThemeToggle";

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <ThemeToggle />
      <Footer />
    </div>
  );
};

export default AppLayout;
