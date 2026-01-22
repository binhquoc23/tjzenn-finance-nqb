"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { FaFacebook, FaTiktok, FaYoutube } from "react-icons/fa";
import { GrGroup } from "react-icons/gr";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import config from "@/config";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Phone, Mail } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

type DesktopDropdownKey = "income" | "expense" | "invest" | "admin" | null;

type DesktopMenuItem =
  | {
      type: "link";
      label: string;
      href: string;
      external?: boolean;
    }
  | {
      type: "dropdown";
      key: Exclude<DesktopDropdownKey, null>;
      label: string;
      widthClass?: string;
      items: { label: string; href: string }[];
    };

const Header: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();

  const { data: session } = useSession();
  const user = session?.user as any;
  const isAdmin = user?.role === "admin";

  const [hasMounted, setHasMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Desktop dropdown open key
  const [openDesktopDropdown, setOpenDesktopDropdown] =
    useState<DesktopDropdownKey>(null);
  const desktopNavRef = useRef<HTMLDivElement | null>(null);

  // Mobile side menu
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  // Mobile submenus
  const [isIncomeSubOpen, setIncomeSubOpen] = useState(false);
  const [isExpenseSubOpen, setExpenseSubOpen] = useState(false);
  const [isInvestSubOpen, setInvestSubOpen] = useState(false);
  const [isAdminSubOpen, setAdminSubOpen] = useState(false);

  const handleRouteChangeHome = (href: string) => {
    if (!href) return;
    if (pathname === href) {
      setMobileMenuOpen(false);
    } else {
      window.open(href, "_blank");
    }
  };

  const handleRouteChange = (href: string) => {
    if (!href) return;
    if (pathname === href) {
      setMobileMenuOpen(false);
    } else {
      router.push(href);
    }
  };

  // Lock scroll when mobile menu open
  useEffect(() => {
    if (isMobileMenuOpen) document.body.classList.add("overflow-hidden");
    else document.body.classList.remove("overflow-hidden");

    return () => document.body.classList.remove("overflow-hidden");
  }, [isMobileMenuOpen]);

  // Close mobile menu when click outside side panel
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMobileMenuOpen &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileMenuOpen]);

  // Detect mobile once mounted
  useLayoutEffect(() => {
    setIsMobile(window.innerWidth <= 860);
    setHasMounted(true);
  }, []);

  // Resize -> update mobile
  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 860;
      setIsMobile(isNowMobile);

      if (!isNowMobile && isMobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, [isMobileMenuOpen]);

  // Close dropdowns / mobile menu on route change
  useEffect(() => {
    setOpenDesktopDropdown(null);
    setIsUserMenuOpen(false);

    setIncomeSubOpen(false);
    setExpenseSubOpen(false);
    setInvestSubOpen(false);
    setAdminSubOpen(false);

    if (isMobileMenuOpen) setMobileMenuOpen(false);
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close desktop dropdown if click outside
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        desktopNavRef.current &&
        !desktopNavRef.current.contains(e.target as Node)
      ) {
        setOpenDesktopDropdown(null);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Close user menu if click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    if (isUserMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isUserMenuOpen]);

  // ====== MENUS (role-based) ======
  const menusDesktop: DesktopMenuItem[] = isAdmin
    ? [
        {
          type: "link",
          label: "Tổng quan",
          href: "/auth/admin/dashboard",
        },
        {
          type: "dropdown",
          key: "admin",
          label: "Quản trị",
          widthClass: "w-56",
          items: [
            { label: "Quản trị người dùng", href: "/auth/admin/users" },
            { label: "Quản trị thu nhập", href: "/auth/admin/income" },
            { label: "Quản trị chi tiêu", href: "/auth/admin/expense" },
            { label: "Quản trị đầu tư", href: "/auth/admin/invest" },
            { label: "Quản trị ngân sách", href: "/auth/admin/budget" },
          ],
        },
      ]
    : [
        // {
        //   type: "link",
        //   label: config.companyName,
        //   href: "https://tjzenn.com",
        //   external: true,
        // },
        { type: "link", label: "Tổng quan", href: "/auth/dashboard" },
        {
          type: "dropdown",
          key: "income",
          label: "Thu nhập",
          widthClass: "w-52",
          items: [
            { label: "Thu nhập hàng tháng", href: "/auth/income" },
            { label: "Danh mục thu nhập", href: "/auth/category-income" },
          ],
        },
        {
          type: "dropdown",
          key: "expense",
          label: "Chi tiêu",
          widthClass: "w-52",
          items: [
            { label: "Chi tiêu hàng tháng", href: "/auth/expenses" },
            { label: "Danh mục chi tiêu", href: "/auth/category-expenses" },
            { label: "Ngân sách", href: "/auth/budget" },
          ],
        },
        {
          type: "dropdown",
          key: "invest",
          label: "Đầu tư",
          widthClass: "w-44",
          items: [
            { label: "Đầu tư hàng tháng", href: "/auth/invest" },
            { label: "Danh mục đầu tư", href: "/auth/category-invest" },
          ],
        },
      ];

  return (
    <header className="sticky top-0 flex items-center justify-between p-4 text-white bg-black z-10">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <Link href="/">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="w-10 h-10 cursor-pointer"
          />
        </Link>
        <Link href="#">
          <div className="font-black italic text-2xl cursor-pointer">
            TJ Finance
          </div>
        </Link>
      </div>

      {/* Desktop nav */}
      {hasMounted && (
        <div
          ref={desktopNavRef}
          className={`flex ${
            isMobile ? "ml-auto space-x-2" : "ml-auto space-x-10"
          }`}
        >
          {!isMobile && (
            <>
              {menusDesktop.map((m) => {
                if (m.type === "link") {
                  return (
                    <Link
                      key={m.href + m.label}
                      href={m.href}
                      target={m.external ? "_blank" : undefined}
                      className="text-white hover:text-[#047857]"
                    >
                      {m.label}
                    </Link>
                  );
                }

                return (
                  <div
                    key={m.key}
                    className="relative"
                    onMouseEnter={() => setOpenDesktopDropdown(m.key)}
                    onMouseLeave={() => setOpenDesktopDropdown(null)}
                  >
                    <Link
                      href="#"
                      scroll={false}
                      className="text-white hover:text-[#047857] flex items-center"
                    >
                      {m.label}
                      <span className="ml-2" style={{ fontSize: "10px" }}>
                        ▼
                      </span>
                    </Link>

                    {openDesktopDropdown === m.key && (
                      <div
                        className={`absolute mt-2 left-0 bg-[#101010] text-white text-sm rounded-md shadow-lg z-10 flex-col ${
                          m.widthClass ?? "w-52"
                        }`}
                      >
                        {m.items.map((it) => (
                          <Link
                            key={it.href}
                            href={it.href}
                            className="block px-6 py-3 hover:bg-[#047857] transition-colors duration-300"
                          >
                            {it.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* User menu desktop */}
              {user && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center space-x-2 bg-buttonRoot text-white px-4 py-1 rounded-full font-medium shadow transition duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5.121 17.804A13.937 13.937 0 0112 15c2.21 0 4.29.537 6.121 1.486M15 10a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                    <span className="max-w-[140px] truncate">
                      {user?.name}
                      {isAdmin ? " (Admin)" : ""}
                    </span>
                  </button>

                  {isUserMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#101010] border border-gray-600 rounded-lg shadow-lg py-2 z-50">
                      <Link
                        href="/auth/changePassword"
                        className="block w-full text-left px-4 py-2 text-white hover:bg-[#2c2c33]"
                      >
                        Đổi mật khẩu
                      </Link>
                      <button
                        onClick={() => signOut()}
                        className="block w-full text-left px-4 py-2 text-white hover:bg-[#2c2c33]"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Mobile hamburger */}
      <div className="flex items-center space-x-4">
        {isMobile && (
          <button
            className="text-white text-2xl"
            onClick={() => setMobileMenuOpen(true)}
          >
            ☰
          </button>
        )}
      </div>

      {/* Auth modal (giữ nguyên nếu anh dùng) */}
      {isAuthOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 relative">
            <button
              onClick={() => setIsAuthOpen(false)}
              className="absolute top-3 right-4 text-gray-600 hover:text-red-500"
            >
              ✕
            </button>
            <div className="w-full"></div>
          </div>
        </div>
      )}

      {/* overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 transition-opacity"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Side menu */}
      <div
        ref={mobileMenuRef}
        className={`fixed top-0 right-0 h-full w-[80%] max-w-xs bg-black text-white shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-600">
          <div className="flex items-center space-x-2">
            <img src="/images/logo.png" alt="TJZenn" className="h-10 w-auto" />
            <div className="flex flex-col leading-tight">
              <span className="text-2xl tracking-wide font-black italic">
                TJ Finance
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="text-white text-2xl"
          >
            ✕
          </button>
        </div>

        <nav className="flex flex-col px-4 py-6 text-lg font-semibold space-y-2">
          {user && (
            <div className="flex items-center space-x-3 px-4 py-2 bg-[#2c2c33] rounded-xl mt-2 text-white shadow-inner">
              <div className="bg-[#047857] text-white rounded-full h-8 w-8 flex items-center justify-center font-semibold uppercase">
                {(user?.name?.[0] ?? "U").toUpperCase()}
              </div>
              <div className="text-base font-medium truncate">
                <span className="text-[#79d4f6]">
                  {user?.name}
                  {isAdmin ? " (Admin)" : ""}
                </span>
              </div>
            </div>
          )}

          {/* Admin menu (mobile) */}
          {isAdmin && (
            <>
              <button
                onClick={() => handleRouteChange("/auth/admin/dashboard")}
                className="text-left"
              >
                Admin Dashboard
              </button>

              <button
                onClick={() => setAdminSubOpen(!isAdminSubOpen)}
                className="flex justify-between items-center w-full text-left"
              >
                <span>Quản trị</span>
                <span className="text-sm">
                  {isAdminSubOpen ? <ChevronDown /> : <ChevronRight />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isAdminSubOpen && (
                  <motion.div
                    key="admin-submenu"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden ml-4 flex flex-col text-base font-normal space-y-2 pb-2"
                  >
                    <button
                      onClick={() => handleRouteChange("/auth/admin/users")}
                      className="text-left"
                    >
                      Quản lý người dùng
                    </button>
                    <button
                      onClick={() =>
                        handleRouteChange("/auth/admin/categories")
                      }
                      className="text-left"
                    >
                      Quản lý danh mục
                    </button>
                    <button
                      onClick={() => handleRouteChange("/auth/admin/reports")}
                      className="text-left"
                    >
                      Báo cáo hệ thống
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          {/* Tổng quan (user) */}
          {!isAdmin && (
            <button
              onClick={() => handleRouteChange("/auth/dashboard")}
              className="text-left"
            >
              Tổng quan
            </button>
          )}

          {/* Thu nhập */}
          <button
            onClick={() => setIncomeSubOpen(!isIncomeSubOpen)}
            className="flex justify-between items-center w-full text-left"
          >
            <span>Thu nhập</span>
            <span className="text-sm">
              {isIncomeSubOpen ? <ChevronDown /> : <ChevronRight />}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {isIncomeSubOpen && (
              <motion.div
                key="income-submenu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden ml-4 flex flex-col text-base font-normal space-y-2 pb-2"
              >
                <button
                  onClick={() => handleRouteChange("/auth/income")}
                  className="text-left"
                >
                  Thu nhập hàng tháng
                </button>
                <button
                  onClick={() => handleRouteChange("/auth/category-income")}
                  className="text-left"
                >
                  Danh mục thu nhập
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Chi tiêu + Đầu tư (chỉ user) */}
          {!isAdmin && (
            <>
              <button
                onClick={() => setExpenseSubOpen(!isExpenseSubOpen)}
                className="flex justify-between items-center w-full text-left"
              >
                <span>Chi tiêu</span>
                <span className="text-sm">
                  {isExpenseSubOpen ? <ChevronDown /> : <ChevronRight />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isExpenseSubOpen && (
                  <motion.div
                    key="expense-submenu"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden ml-4 flex flex-col text-base font-normal space-y-2 pb-2"
                  >
                    <button
                      onClick={() => handleRouteChange("/auth/expenses")}
                      className="text-left"
                    >
                      Chi tiêu hàng tháng
                    </button>
                    <button
                      onClick={() =>
                        handleRouteChange("/auth/category-expenses")
                      }
                      className="text-left"
                    >
                      Danh mục chi tiêu
                    </button>
                    <button
                      onClick={() => handleRouteChange("/auth/budget")}
                      className="text-left"
                    >
                      Ngân sách
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={() => setInvestSubOpen(!isInvestSubOpen)}
                className="flex justify-between items-center w-full text-left"
              >
                <span>Đầu tư</span>
                <span className="text-sm">
                  {isInvestSubOpen ? <ChevronDown /> : <ChevronRight />}
                </span>
              </button>

              <AnimatePresence initial={false}>
                {isInvestSubOpen && (
                  <motion.div
                    key="invest-submenu"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden ml-4 flex flex-col text-base font-normal space-y-2 pb-2"
                  >
                    <button
                      onClick={() => handleRouteChange("/auth/invest")}
                      className="text-left"
                    >
                      Đầu tư hàng tháng
                    </button>
                    <button
                      onClick={() => handleRouteChange("/auth/category-invest")}
                      className="text-left"
                    >
                      Danh mục đầu tư
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}

          <button
            onClick={() => handleRouteChangeHome("https://tjzenn.com/contact")}
            className="text-left"
          >
            Liên hệ
          </button>

          <button
            onClick={() => handleRouteChange("/auth/changePassword")}
            className="text-left"
          >
            Đổi mật khẩu
          </button>

          {/* <button
            onClick={() => handleRouteChangeHome("https://tjzenn.com")}
            className="text-left"
          >
            TJZenn
          </button> */}

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              signOut();
            }}
            className="text-left text-red-400"
          >
            Đăng xuất
          </button>
        </nav>

        <div className="px-4 py-4 text-[16px] border-t border-gray-600 space-y-2">
          <p className="flex items-center space-x-2">
            <Phone /> <span>{config.companyPhone}</span>
          </p>
          <p className="flex items-center space-x-2">
            <Mail /> <span>{config.companyEmail}</span>
          </p>

          <div className="flex items-center space-x-4 pt-2">
            <a
              href={config.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#047857] hover:text-[#047857]"
            >
              <FaYoutube className="w-6 h-6" />
            </a>
            <a
              href={config.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#047857] hover:text-[#047857]"
            >
              <FaFacebook className="w-6 h-6" />
            </a>
            <a
              href={config.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#047857] hover:text-[#047857]"
            >
              <FaTiktok className="w-6 h-6" />
            </a>
            <a
              href={config.group}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#047857] hover:text-[#047857]"
            >
              <GrGroup className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
