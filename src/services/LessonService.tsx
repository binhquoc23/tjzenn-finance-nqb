import { supabase } from "@/lib/supabaseClient";

export const getLessonsByCourseUrl = async (courseUrl: string) => {
  //1: get course by url
  const { data: course, error: courseError } = await supabase
    .from("courses")
    .select("id, title, url, shortDescription,image")
    .eq("url", courseUrl)
    .eq("isHide", false)
    .single();

  if (courseError || !course) {
    throw new Error(`Không tìm thấy khóa học có url: ${courseUrl}`);
  }

  // 2: get lessons by course.id
  const { data: lessons, error: lessonError } = await supabase
    .from("lessons")
    .select("id, title, videoUrl, content, created_at")
    .eq("course", course.id) // lesson in course.id
    .order("created_at", { ascending: true });

  if (lessonError) {
    throw new Error(`Không lấy được bài học: ${lessonError.message}`);
  }

  return {
    course,
    lessons,
  };
};
