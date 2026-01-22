import { REVALIDATE_TIME_DETAIL, REVALIDATE_TIME } from "@/constants";

export async function getBlogDetail(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/blog-detail?url=${slug}`,
    {
      next: { revalidate: REVALIDATE_TIME_DETAIL },
    }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function getAllBlog() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/blogs`, {
    next: { revalidate: REVALIDATE_TIME },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getHomeBlog() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/home-blogs`, {
    next: { revalidate: REVALIDATE_TIME },
  });
  if (!res.ok) return null;
  return res.json();
}
