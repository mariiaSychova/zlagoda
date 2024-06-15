"use client";

import React from "react";
import "./Header.css";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const pathname = usePathname();
  const { isAdmin } = useAuth();

  const menuItems = [
    { href: "/products", name: "Товари" },
    ...(isAdmin ? [{ href: "/categories", name: "Категорії" }] : []),
    { href: "/store_products", name: "Товари в магазині" },
    { href: "/checks", name: "Чеки" },
    { href: "/customer_cards", name: "Карти клієнтів" },
    ...(isAdmin ? [{ href: "/employees", name: "Працівники" }] : []),
  ];

  const redirect = (url: string) => {
    if (pathname === url) return;
    window.open(url, "_parent");
  };

  return (
    <header>
      <div className="logo" onClick={() => redirect("/")}>
        ZLAGODA
      </div>

      <div className="menu">
        {menuItems.map((item) => (
          <div
            key={item.href}
            className={`menu-item ${pathname === item.href ? "active" : ""}`}
            onClick={() => redirect(item.href)}
          >
            {item.name}
          </div>
        ))}
      </div>

      <div className="account" onClick={() => redirect("/account")} />
    </header>
  );
};

export default Header;
