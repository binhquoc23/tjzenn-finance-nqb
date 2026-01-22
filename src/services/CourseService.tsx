import { supabase } from "@/lib/supabaseClient";

export const getHomeCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select(
      "title, image, url, shortDescription, category, author(id, name), isHide, isFree, price, created_at"
    )
    .eq("isHide", false)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    throw new Error(`Failed to fetch home courses: ${error.message}`);
  }

  return data;
};

export const getAllCourses = async () => {
  const { data, error } = await supabase
    .from("courses")
    .select(
      "title, image, url, shortDescription, category, author(id, name), isHide, isFree, price, created_at"
    )
    .eq("isHide", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch all courses: ${error.message}`);
  }

  return data;
};

export const getCourseByUrl = async (url: string) => {
  const { data, error } = await supabase
    .from("courses")
    .select(
      `title, image, url, shortDescription, category, author(id, name), isHide,
       isFree, price, goals, includes, accordion, videoDemo, chapterCount,
       lessonCount, hourCount, created_at`
    )
    .eq("url", url)
    .eq("isHide", false)
    .single();

  if (error) {
    throw new Error(`Failed to fetch course by url: ${error.message}`);
  }

  return data;
};
