import { REVALIDATE_TIME_DETAIL, REVALIDATE_TIME } from "@/constants";

export async function getCoursePremiumDetail(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/course-detail?url=${slug}`,
    {
      next: { revalidate: REVALIDATE_TIME_DETAIL },
    }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function getLessonByCourse(slug: string) {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_URL}/api/lessons-by-course?url=${slug}`,
    {
      next: { revalidate: REVALIDATE_TIME_DETAIL },
    }
  );
  if (!res.ok) return null;
  return res.json();
}

export async function getAllCourse() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/courses`, {
    next: { revalidate: REVALIDATE_TIME },
  });
  if (!res.ok) return null;
  return res.json();
}

export async function getHomeCourse() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/home-courses`, {
    next: { revalidate: REVALIDATE_TIME },
  });
  if (!res.ok) return null;
  return res.json();
}
