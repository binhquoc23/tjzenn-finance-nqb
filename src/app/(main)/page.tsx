// idea jenkins
// export const dynamic = "force-dynamic";
import Courses from "@/components/course/CoursesHome";
import Blogs from "@/components/blog/BlogHome";
import HerroBanner from "@/components/home/HerroBanner";
import FeaturesSection from "@/components/home/FeatureSection";
import { Metadata } from "next";
import { baseOpenGraph } from "../shared-metadata";
import AutoSlideBanner from "@/components/home/AutoSlideBanner";
import TechCarousel from "@/components/home/TechCarousel";
import config from "@/config";

const url = process.env.NEXT_PUBLIC_URL;
const urlImage = process.env.NEXT_PUBLIC_URL + "/images/logo.png";

export const metadata: Metadata = {
  openGraph: {
    ...baseOpenGraph,
    url: url,
    siteName: `${config.companyName}`,
    images: [
      {
        url: urlImage,
      },
    ],
  },
  alternates: {
    canonical: url,
  },
};

export default async function Home() {
  return (
    <>
      <div>
        <HerroBanner />
      </div>
    </>
  );
}
