"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import path from "path";
import { FileImage, List } from "lucide-react";
import {
  deleteImage,
  getAllImage,
  uploadImage,
  Image as UploadedImage,
} from "@/services/ImageService";
import SelectCategoryImage from "@/components/image/SelectCategoryImage";
import { toast } from "sonner";

interface ImageBoxProps {
  open: boolean;
  onClose: () => void;
  handleImageSelect: (imageUrl: string) => void;
  folder: string;
}

const ImageBox: React.FC<ImageBoxProps> = ({
  open,
  onClose,
  handleImageSelect,
  folder,
}) => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [viewMode, setViewMode] = useState<"image" | "name">("image");
  const [imageToUpload, setImageToUpload] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>(folder);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loadedImageIds, setLoadedImageIds] = useState<Set<number>>(new Set());

  const itemPerPage = 20;

  useEffect(() => {
    setCategoryFilter(folder);
  }, [folder]);

  const fetchUploadedImages = async (reset = false) => {
    try {
      const currentPage = reset ? 1 : page;
      const data = await getAllImage(currentPage, itemPerPage, searchText, {
        type: categoryFilter,
      });

      const newImages = data.images || [];
      const total = data.total || 0;

      const mergedImages = reset
        ? newImages
        : [...uploadedImages, ...newImages];
      setUploadedImages(mergedImages);

      setHasMore(mergedImages.length < total);

      if (reset) setPage(2);
      else setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Lỗi khi tải danh sách ảnh:", err);
    }
  };

  useEffect(() => {
    if (open) fetchUploadedImages(true);
  }, [open, categoryFilter]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (open) fetchUploadedImages(true);
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchText, open]);

  const handleUpload = async () => {
    if (!imageToUpload) return toast.warning("Vui lòng chọn ảnh");
    try {
      const res = await uploadImage(imageToUpload, categoryFilter);
      //   setUploadedImages((prev) => [
      //     {
      //       id: res.id!,
      //       url: res.url,
      //       type: res.type,
      //       name: res.name,
      //     },
      //     ...prev,
      //   ]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      fetchUploadedImages(true);
      scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
      toast.success("Tải ảnh lên thành công");
    } catch (err) {
      toast.error("Gặp lỗi khi tải ảnh lên");
    }
  };

  const handleDeleteImage = async (img: UploadedImage) => {
    const confirmDelete = confirm("Bạn có chắc chắn muốn xoá ảnh này?");
    if (!confirmDelete) return;

    try {
      await deleteImage(img);
      setUploadedImages((prev) => prev.filter((i) => i.id !== img.id));
      toast.success("Xóa ảnh thành công");
    } catch (err) {
      toast.error("Lỗi khi xóa ảnh");
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-[#2A2A2E] p-4 rounded relative w-[95vw] sm:w-[90vw] md:w-[100vh] max-h-[100vh] overflow-y-auto">
        {/* button close popup */}
        <button
          className="absolute top-2 right-2 text-white bg-red-500 hover:bg-red-600 rounded-full w-8 h-8 flex items-center justify-center text-lg"
          onClick={onClose}
          title="Đóng"
          type="button"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4">Chọn ảnh từ thư viện</h2>

        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setViewMode("image")}
            className={`p-2 rounded ${
              viewMode === "image" ? "bg-buttonRoot text-white" : "border"
            }`}
            type="button"
          >
            <FileImage />
          </button>
          <button
            onClick={() => setViewMode("name")}
            className={`p-2 rounded ${
              viewMode === "name" ? "bg-buttonRoot text-white" : "border"
            }`}
            type="button"
          >
            <List />
          </button>
          <SelectCategoryImage
            value={categoryFilter}
            onChange={setCategoryFilter}
          />
        </div>

        <input
          placeholder="Tìm theo tên ảnh..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="w-full sm:w-[300px] border p-2 rounded text-black"
        />

        <div
          ref={scrollRef}
          className="mt-4"
          style={{ maxHeight: "60vh", overflowY: "auto" }}
        >
          <div
            className={
              viewMode === "image"
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2"
                : "block"
            }
          >
            {uploadedImages.length === 0 ? (
              <p className="text-gray-500">Thư mục trống</p>
            ) : (
              uploadedImages.map((img, idx) => {
                const isLoaded = loadedImageIds.has(img.id!);
                return (
                  <div key={img.id} className="relative group p-1 rounded">
                    {viewMode === "image" ? (
                      <>
                        <button
                          className="absolute top-1 right-1 bg-red-500 text-white text-xs px-2 rounded-full z-10 hover:bg-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(img);
                          }}
                          type="button"
                        >
                          ✕
                        </button>

                        <div
                          onClick={() => handleImageSelect(img.url)}
                          className="cursor-pointer"
                        >
                          <div className="w-full aspect-square border border-gray-700 rounded overflow-hidden relative bg-black/10">
                            {!isLoaded && (
                              <div className="absolute inset-0 flex items-center justify-center z-0">
                                <Image
                                  src="/images/loading.gif"
                                  alt="loading"
                                  width={32}
                                  height={32}
                                />
                              </div>
                            )}

                            <Image
                              src={img.url}
                              alt={img.name}
                              fill
                              unoptimized
                              onLoad={() =>
                                setLoadedImageIds((prev) =>
                                  new Set(prev).add(img.id!)
                                )
                              }
                              className={`object-contain transition-opacity duration-300 ${
                                isLoaded ? "opacity-100" : "opacity-0"
                              }`}
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      // giữ nguyên phần name view
                      <div
                        onClick={() => handleImageSelect(img.name)}
                        className="flex items-center justify-between text-sm py-1 pr-2 cursor-pointer"
                      >
                        <span>• {path.basename(img.name)}</span>
                        <button
                          className="bg-red-500 text-white text-xs px-2 rounded-full hover:bg-red-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteImage(img);
                          }}
                          type="button"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {hasMore && (
            <div className="mt-4 text-center">
              <button
                className="bg-gray-200 text-black hover:bg-gray-300 px-4 py-2 rounded"
                onClick={() => fetchUploadedImages(false)}
                type="button"
              >
                Xem thêm
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-3">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                setImageToUpload(e.target.files[0]);
              }
            }}
            className="border p-2 rounded"
          />
          <button
            className="bg-buttonRoot text-white px-4 py-2 rounded "
            onClick={handleUpload}
            type="button"
          >
            Tải ảnh lên
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageBox;
