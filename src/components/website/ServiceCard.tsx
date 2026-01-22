import React from "react";
import Link from "next/link";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  link: string;
}

const ServiceCard: React.FC<ServiceCardProps> = ({
  icon,
  title,
  description,
  link,
}) => {
  return (
    <Link href={link} className="block">
      <div className="bg-black rounded-lg shadow-lg p-6 text-center hover:shadow-xl hover:scale-105 transition-all duration-300">
        <div className="flex justify-center items-center text-4xl text-[#168bb9] mb-4">
          {icon}
        </div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-sm text-white">{description}</p>
      </div>
    </Link>
  );
};

export default ServiceCard;
