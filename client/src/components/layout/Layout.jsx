import { Outlet } from "react-router-dom";
import Footer from "./Footer";
import Navbar from "./Navbar";

const Layout = () => {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
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
