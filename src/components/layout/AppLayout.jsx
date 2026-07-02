import React, { Suspense } from "react";
import Footer from "./Footer";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import ThemeToggle from "../theme/ThemeToggle";
import { Spin } from "antd";

const AppLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <Suspense
          fallback={
            <div className="flex items-center justify-center min-h-[60vh] w-full">
              <Spin size="large" />
            </div>
          }
        >
          <Outlet />
        </Suspense>
      </main>
      <ThemeToggle />
      <Footer />
    </div>
  );
};

export default AppLayout;
