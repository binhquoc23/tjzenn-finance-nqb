import React from "react";
import styles from "../styles/TechCarousel.module.css";
import Image from "next/image";

const TechCarousel = ({ images }: { images: string[] }) => {
  const loopedImages = [...images, ...images];

  return (
    <div className={styles.carouselWrapper}>
      <div className={styles.carouselTrack}>
        {loopedImages.map((src, index) => (
          <Image
            key={index}
            src={src}
            alt={`Logo ${
              src.split("/").pop()?.split("-")[0]?.toUpperCase() || "Tech"
            }`}
            title={`${
              src.split("/").pop()?.split("-")[0]?.toUpperCase() || ""
            }`}
            className={styles.techImage}
            width={150}
            height={100}
            quality={100}
          />
        ))}
      </div>
    </div>
  );
};

export default TechCarousel;
