import { Suspense, lazy } from "react";
import { Outlet } from "react-router-dom";
import Footer from "./Footer";

const Navbar = lazy(() => import("./Navbar"));

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Suspense fallback={<div aria-hidden="true" className="min-h-[180px] md:min-h-[132px]" />}>
        <Navbar />
      </Suspense>
      <div className="flex-1">
        <div className="app-shell">
          <Outlet />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Layout;
