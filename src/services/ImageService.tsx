// import { checkAdmin, checkModOrAdmin } from "@/lib/checkRole";
import { supabase } from "@/lib/supabaseClient";

export interface Image {
  id?: number;
  url: string;
  type: string;
  name: string;
}

/** conver image to webp */
async function convertToWebP(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("Không thể tạo context");

      ctx.drawImage(img, 0, 0);
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const webpFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, ".webp"),
              {
                type: "image/webp",
              }
            );
            resolve(webpFile);
          } else {
            reject("Không thể convert sang WebP");
          }
        },
        "image/webp",
        0.9
      );
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

export async function uploadImage(file: File, type: string = "default") {
  //   await checkModOrAdmin();
  // 1. Convert to WebP
  const webpFile = await convertToWebP(file);
  const fileExt = "webp";
  const baseName = webpFile.name.replace(/\.[^/.]+$/, "");

  let finalName = baseName;
  let attempt = 0;
  let filePath = `${type}/${finalName}.${fileExt}`;

  // 2. Check name is exists
  while (true) {
    const { data: existing } = await supabase
      .from("images")
      .select("id")
      .eq("name", `${finalName}.${fileExt}`)
      .maybeSingle();

    if (!existing) break;

    attempt += 1;
    finalName = `${baseName}-${attempt}`;
    filePath = `${type}/${finalName}.${fileExt}`;
  }

  const fullName = `${finalName}.${fileExt}`;

  // 3. Upload to storage supabase
  const { error: uploadError } = await supabase.storage
    .from("images-storage")
    .upload(filePath, webpFile);

  if (uploadError) {
    throw new Error(" Upload thất bại: " + uploadError.message);
  }

  // 4. get Url
  const { data: publicURLData } = supabase.storage
    .from("images-storage")
    .getPublicUrl(filePath);

  const publicUrl = publicURLData?.publicUrl;
  if (!publicUrl) {
    throw new Error(" Không lấy được URL ảnh!");
  }

  // 5. Insert to db
  const { data, error: insertError } = await supabase
    .from("images")
    .insert([
      {
        url: publicUrl,
        type,
        name: fullName,
      },
    ])
    .select()
    .single();

  if (insertError) {
    throw new Error(" Lỗi khi thêm vào bảng images: " + insertError.message);
  }

  return data;
}

export async function getAllImage(
  page: number = 1,
  limit: number = 20,
  search: string = "",
  filter: { type?: string } = {}
) {
  //   await checkModOrAdmin();
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from("images")
    .select("*", { count: "exact" })
    .range(from, to)
    .order("created_at", { ascending: false });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  if (filter.type) {
    query = query.eq("type", filter.type);
  }

  const { data, count, error } = await query;

  if (error) {
    throw new Error(" Lỗi khi lấy danh sách ảnh: " + error.message);
  }

  return {
    images: data,
    total: count || 0,
    currentPage: page,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

export async function deleteImage(image: { name: string; type: string }) {
  //   await checkAdmin();
  const filePath = `${image.type}/${image.name}`;

  // 1. Xoá ảnh khỏi Supabase Storage
  const { error: storageError } = await supabase.storage
    .from("images-storage")
    .remove([filePath]);

  if (storageError) {
    throw new Error(" Lỗi khi xoá ảnh khỏi storage: " + storageError.message);
  }

  // 2. Xoá ảnh khỏi bảng images trong DB
  const { error: dbError } = await supabase
    .from("images")
    .delete()
    .eq("name", image.name)
    .eq("type", image.type);

  if (dbError) {
    throw new Error(" Lỗi khi xoá ảnh trong database: " + dbError.message);
  }

  return true;
}
