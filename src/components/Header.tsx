"use client";
import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import { FaFacebook, FaTiktok, FaYoutube } from "react-icons/fa";
import { GrGroup } from "react-icons/gr";
import { usePathname } from "next/navigation";
import Link from "next/link";
import config from "@/config";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ChevronDown, Phone, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";

const Header: React.FC = () => {
  const router = useRouter();
  const [isCourseDropdownVisible, setCourseDropdownVisible] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [isDropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const pathname = usePathname();
  const [isCourseSubOpen, setCourseSubOpen] = useState(false);
  const [isServiceSubOpen, setServiceSubOpen] = useState(false);

  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const handleRouteChangeHome = (href: string) => {
    if (pathname === href) {
      setMobileMenuOpen(false);
    } else {
      window.open(href, "_blank");
    }
  };

  const handleRouteChange = (href: string) => {
    if (pathname === href) {
      setMobileMenuOpen(false);
    } else {
      router.push(href);
    }
  };

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isMobileMenuOpen]);

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
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  useLayoutEffect(() => {
    setIsMobile(window.innerWidth <= 860);
    setHasMounted(true);
  }, []);

  useEffect(() => {
    setDropdownVisible(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      setMobileMenuOpen(false);
    }
  }, [pathname]);

  useEffect(() => {
    setCourseDropdownVisible(false);
    setDropdownVisible(false);
  }, [pathname]);

  useEffect(() => {
    const handleResize = () => {
      const isNowMobile = window.innerWidth <= 860;
      setIsMobile(isNowMobile);

      if (!isNowMobile && isMobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !toggleButtonRef.current?.contains(event.target as Node)
      ) {
        setDropdownVisible(false);
      }
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("click", handleClickOutside);

    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between p-4 text-white bg-black">
      <div className="flex items-center space-x-2">
        <Link href="/">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="w-10 h-10 cursor-pointer"
          />
        </Link>
        <Link href="/">
          <div className=" font-black italic text-2xl cursor-pointer">
            TJ Finance
          </div>
        </Link>
      </div>
      {hasMounted && (
        <div
          className={`flex ${
            isMobile ? "ml-auto space-x-2" : "ml-auto space-x-10"
          }`}
        >
          {!isMobile && (
            <>
              <Link
                href="/login"
                className="bg-buttonRoot px-4 py-1 rounded-md "
              >
                Đăng nhập
              </Link>
            </>
          )}
        </div>
      )}

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
          <button
            onClick={() => handleRouteChange("/login")}
            className="text-left"
          >
            Đăng nhập
          </button>

          {/* submenu */}
          <button
            onClick={() => setCourseSubOpen(!isCourseSubOpen)}
            className="flex justify-between items-center w-full text-left"
          >
            <span>TJ Finance</span>
            <span className="text-sm">
              {isCourseSubOpen ? <ChevronDown /> : <ChevronRight />}
            </span>
          </button>

          <AnimatePresence initial={false}>
            {isCourseSubOpen && (
              <motion.div
                key="course-submenu"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden ml-4 flex flex-col text-base font-normal space-y-2 pb-2"
              >
                <button
                  onClick={() => handleRouteChange("/guide")}
                  className="text-left"
                >
                  Hướng dẫn sử dụng
                </button>
                <button
                  onClick={() => handleRouteChange("/faq")}
                  className="text-left"
                >
                  FAQ
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => handleRouteChangeHome("https://tjzenn.com/contact")}
            className="text-left"
          >
            Liên hệ
          </button>

          <button
            onClick={() => handleRouteChangeHome("https://tjzenn.com")}
            className="text-left"
          >
            TJZenn
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
