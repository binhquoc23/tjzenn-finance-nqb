"use client";
import { useState, useEffect, useRef } from "react";
import { SiZalo } from "react-icons/si";
import Image from "next/image";
import { ChevronUp } from "lucide-react";
import { FaPhoneAlt, FaFacebookMessenger, FaEnvelope } from "react-icons/fa";
import config from "@/config";

interface Contact {
  name: string;
  phone: string;
  zaloLink: string;
  email: string;
  messengerLink: string;
}

export default function ContactBox() {
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement | null>(null);
  const iconRef = useRef<HTMLDivElement | null>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const contact: Contact = {
    name: config.companyName,
    phone: config.companyPhone,
    zaloLink: config.zalo,
    email: config.companyEmail,
    messengerLink: config.mess,
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        !iconRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div>
      <div
        ref={iconRef}
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 bg-white rounded-full p-4 cursor-pointer shadow-lg transition-all animate-shake z-30"
      >
        <div className="relative w-6 h-6">
          <Image
            src="/images/logo.png"
            alt="Logo"
            fill
            className="object-contain scale-150"
          />
        </div>
      </div>
      {showScrollTop && (
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-20 right-4 bg-buttonRoot rounded-full p-4 cursor-pointer shadow-lg transition-all hover:scale-110 z-30"
        >
          <ChevronUp className="text-white font-black" size={20} />
        </div>
      )}
      {isOpen && (
        <div
          ref={popupRef}
          className="fixed bottom-16 right-4 bg-white shadow-lg rounded-lg w-80 p-4 max-h-72 overflow-y-auto z-50"
        >
          <h3 className="text-lg font-semibold text-center text-gray-800 mb-4">
            Liên hệ với TJZenn
          </h3>
          <ul className="space-y-3">
            <li
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() =>
                window.open(contact.zaloLink, "_blank", "noopener,noreferrer")
              }
            >
              <SiZalo className="text-blue-500" size={20} />
              <span className="text-gray-800">{config.companyName}</span>
            </li>
            <li className="flex items-center space-x-3 p-2 hover:bg-gray-100 cursor-pointer">
              <FaPhoneAlt className="text-green-500" size={20} />
              <span className="text-gray-800">{contact.phone}</span>
            </li>
            <li
              className="flex items-center space-x-3 p-2 hover:bg-gray-100 cursor-pointer"
              onClick={() =>
                window.open(
                  contact.messengerLink,
                  "_blank",
                  "noopener,noreferrer"
                )
              }
            >
              <FaFacebookMessenger className="text-blue-600" size={20} />
              <span className="text-gray-800">TJZenn</span>
            </li>

            <li className="flex items-center space-x-3 p-2 hover:bg-gray-100 cursor-pointer">
              <FaEnvelope className="text-red-500" size={20} />
              <span className="text-gray-800">{contact.email}</span>
            </li>
          </ul>

          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            X
          </button>
        </div>
      )}
    </div>
  );
}
