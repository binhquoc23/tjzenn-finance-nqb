"use client";
import React, { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { RiVipCrownLine } from "react-icons/ri";
import dayjs from "dayjs";
import Image from "next/image";

interface Lesson {
  id: number;
  title: string;
  code: string;
  content: string;
  videoUrl: string;
  price: number;
  isHide: boolean;
  created_at: string;
}

interface CourseContentProps {
  lessons: Lesson[];
  course: {
    id: number;
    title: string;
    url: string;
  };
}

const CourseContent: React.FC<CourseContentProps> = ({ lessons, course }) => {
  const [selectedLesson, setSelectedLesson] = useState<Lesson>(lessons[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (isSidebarOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isSidebarOpen]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const extractYouTubeId = (url: string) => {
    const regExp =
      /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regExp);
    return match ? match[1] : "";
  };

  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 1024px)");

    const handleResize = () => {
      if (mediaQuery.matches) {
        setIsSidebarOpen(false);
      }
    };

    mediaQuery.addEventListener("change", handleResize);

    if (mediaQuery.matches) {
      setIsSidebarOpen(false);
    }

    return () => {
      mediaQuery.removeEventListener("change", handleResize);
    };
  }, []);

  return (
    <div className=" bg-[#1a1a1f] flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col basis-[30%] max-w-[480px] min-w-[300px] bg-[#1a1a1f] text-white p-4 h-screen sticky top-0">
        <h1 className="text-xl font-bold mb-4 flex-shrink-0">{course.title}</h1>

        <div className="overflow-y-auto flex-1 space-y-2 pr-1">
          {lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className={`w-full p-3 rounded-lg text-left transition-all ${
                selectedLesson?.id === lesson.id
                  ? "bg-blue-100 text-blue-600"
                  : "hover:bg-gray-100 hover:text-black"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="bg-black flex-shrink-0 w-6 h-6 rounded-full overflow-hidden">
                  <Image
                    src="/images/logo.png"
                    alt="Anh Bin"
                    width={24}
                    height={24}
                    className="object-cover"
                  />
                </div>
                <h2 className="font-medium flex-1 truncate">{lesson.title}</h2>
              </div>
            </button>
          ))}
        </div>
      </aside>

      {/* Sidebar mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        >
          <div className="w-80 bg-[#1a1a1f] text-white h-full flex flex-col pt-20 p-4">
            <h1 className="text-xl font-bold mb-4 flex-shrink-0 pt-14">
              {course.title}
            </h1>

            <div className="overflow-y-auto flex-1 space-y-2 pr-1">
              {lessons.map((lesson) => (
                <button
                  key={lesson.id}
                  onClick={() => {
                    setSelectedLesson(lesson);
                    setIsSidebarOpen(false);
                  }}
                  className={`w-full p-3 rounded-lg text-left transition-all ${
                    selectedLesson?.id === lesson.id
                      ? "bg-blue-100 text-blue-600"
                      : "hover:bg-gray-100 hover:text-black"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-white w-6 h-6 rounded-full bg-black flex items-center justify-center text-sm">
                      <Image
                        src="/images/logo.png"
                        alt="Anh Bin"
                        width={24}
                        height={24}
                        className="object-cover"
                      />
                    </div>
                    <h2 className="font-medium truncate max-w-[200px] whitespace-nowrap">
                      {lesson.title}
                    </h2>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toggle button (mobile only) */}
      <button
        className="lg:hidden fixed top-20 left-4 z-50 p-1 rounded-md bg-white text-black shadow-lg"
        onClick={toggleSidebar}
      >
        {isSidebarOpen ? <X /> : <Menu />}
      </button>

      {/* Main content */}
      <main className="flex-1 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full pb-[56.25%] rounded-lg overflow-hidden bg-black mb-6">
            <iframe
              src={`https://www.youtube.com/embed/${extractYouTubeId(
                selectedLesson.videoUrl
              )}`}
              className="absolute top-0 left-0 w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>

          <div className="bg-[#1a1a1f] text-white rounded-lg pt-8">
            <p className="text-2xl font-black mb-4">{selectedLesson.title}</p>
            <p className="text-white/70 italic mb-4">
              {new Date(selectedLesson.created_at).toLocaleDateString("vi-VN")}
            </p>
            <div className="text-white overflow-x-auto">
              <div
                className="prose prose-invert max-w-none break-words"
                dangerouslySetInnerHTML={{
                  __html: selectedLesson.content || "",
                }}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CourseContent;
