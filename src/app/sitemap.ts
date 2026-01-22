import { getAllBlogs } from "@/services/BlogService";
import { getAllCourses } from "@/services/CourseService";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let courseUrls: MetadataRoute.Sitemap = [];
  let blogUrls: MetadataRoute.Sitemap = [];
  try {
    const courseRes = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/courses`);
    const courses = await courseRes.json();

    courseUrls = courses.map(
      (course: { url: string; isFree: boolean; created_at: string }) => ({
        url: `${process.env.NEXT_PUBLIC_URL}/${
          course.isFree ? "course" : "coursePremium"
        }/${course.url}`,
        lastModified: new Date(course.created_at),
        changeFrequency: "weekly",
        priority: 0.8,
      })
    );

    const blogRes = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/blogs`);
    const blogs = await blogRes.json();

    blogUrls = blogs.map((blog: { url: string; created_at: string }) => ({
      url: `${process.env.NEXT_PUBLIC_URL}/blog/${blog.url}`,
      lastModified: new Date(blog.created_at),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
  } catch (error) {
    console.error("Lỗi lấy danh sách khóa học:", error);
  }
  return [
    {
      url: `${process.env.NEXT_PUBLIC_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${process.env.NEXT_PUBLIC_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${process.env.NEXT_PUBLIC_URL}/website`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${process.env.NEXT_PUBLIC_URL}/software`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${process.env.NEXT_PUBLIC_URL}/faq-service`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${process.env.NEXT_PUBLIC_URL}/course`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${process.env.NEXT_PUBLIC_URL}/student-reviews`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${process.env.NEXT_PUBLIC_URL}/faq-course`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${process.env.NEXT_PUBLIC_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${process.env.NEXT_PUBLIC_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...courseUrls,
    ...blogUrls,
  ];
}
