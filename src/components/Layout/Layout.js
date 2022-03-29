import React from "react";
import { Outlet } from "react-router-dom";

import Header from './Header';
import Footer from './Footer';

export default function Layout ({
  ...props
}) {
  return (
      <>
        <Header {...props} />
        
        <main className="wrapper">
          <Outlet />
        </main>
        <Footer />
      </>
  );
}