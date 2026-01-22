import { supabase } from "@/lib/supabaseClient";

export const getHomeBlogs = async () => {
  const { data, error } = await supabase
    .from("blogs")
    .select(
      "title, image, url, shortDescription, category, author(id, name), isHide, created_at"
    )
    .eq("isHide", false)
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) {
    throw new Error(`Failed to fetch home blog: ${error.message}`);
  }

  return data;
};

export const getAllBlogs = async () => {
  const { data, error } = await supabase
    .from("blogs")
    .select(
      "title, image, url, shortDescription, category, author(id, name), isHide, created_at"
    )
    .eq("isHide", false)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch all blog: ${error.message}`);
  }

  return data;
};

export const getBlogByUrl = async (url: string) => {
  const { data, error } = await supabase
    .from("blogs")
    .select("* , author(id, name)")
    .eq("url", url)
    .eq("isHide", false)
    .single();

  if (error) {
    throw new Error(`Failed to fetch blog by url: ${error.message}`);
  }

  return data;
};

export const getAllBlogSlugs = async () => {
  const { data, error } = await supabase
    .from("blogs")
    .select("url")
    .eq("isHide", false);

  if (error) {
    throw new Error(`Failed to fetch blog slugs: ${error.message}`);
  }

  return data;
};
