import React from "react";
import { FaYoutube, FaFacebook, FaTiktok, FaInstagram } from "react-icons/fa";
import config from "@/config";
import Link from "next/link";
import { GrGroup } from "react-icons/gr";
import { Earth } from "lucide-react";
const Footer = () => {
  return (
    <footer className="bg-black text-white py-8 px-4 w-full border-t border-gray-700">
      <div className="text-center mt-6 text-sm text-white">
        <p>
          &copy; 2025 Bản quyền ©{" "}
          <span className="font-black">{config.companyName}</span> | Bảo lưu mọi
          quyền
        </p>
      </div>
    </footer>
  );
};

export default Footer;
