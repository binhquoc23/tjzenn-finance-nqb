"use client";

import { useState, useEffect, useRef } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Bold from "@tiptap/extension-bold";
import Italic from "@tiptap/extension-italic";
import Underline from "@tiptap/extension-underline";
import TextStyle from "@tiptap/extension-text-style";
import Heading from "@tiptap/extension-heading";
import Color from "@tiptap/extension-color";
import BulletList from "@tiptap/extension-bullet-list";
import OrderedList from "@tiptap/extension-ordered-list";
import ListItem from "@tiptap/extension-list-item";
import Paragraph from "@tiptap/extension-paragraph";
import { Link } from "@tiptap/extension-link";
import { Palette, Link as Link2, Image as Image2 } from "lucide-react";
import ImageBox from "@/components/image/ImageBox";

interface EditorProps {
  onContentChange: (content: string) => void;
  initialContent?: string;
  folder: string;
}

const Editor = ({
  onContentChange,
  initialContent = "",
  folder,
}: EditorProps) => {
  const [isColorPickerOpen, setColorPickerOpen] = useState(false);
  const [showImageServer, setShowImageServer] = useState(false);
  const colorPickerRef = useRef(null);
  const colorButtonRef = useRef(null);

  const [showHeadingMenu, setShowHeadingMenu] = useState(false);
  const [showTextStyleMenu, setShowTextStyleMenu] = useState(false);

  const headingMenuRef = useRef<HTMLDivElement | null>(null);
  const textStyleMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;

      if (headingMenuRef.current && !headingMenuRef.current.contains(target)) {
        setShowHeadingMenu(false);
      }

      if (
        textStyleMenuRef.current &&
        !textStyleMenuRef.current.contains(target)
      ) {
        setShowTextStyleMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (
        colorPickerRef.current &&
        !(colorPickerRef.current as HTMLElement).contains(e.target) &&
        colorButtonRef.current &&
        !(colorButtonRef.current as HTMLElement).contains(e.target)
      ) {
        setColorPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const CustomLink = Link.extend({
    renderHTML({ HTMLAttributes }) {
      const href = HTMLAttributes.href || "";
      const isExternal =
        href.startsWith("http") && !href.includes(process.env.NEXT_PUBLIC_URL!);
      return [
        "a",
        {
          ...HTMLAttributes,
          class: "text-blue-600 no-underline hover:underline cursor-pointer",
          target: isExternal ? "_blank" : null,
          rel: isExternal ? "noopener noreferrer" : null,
        },
        0,
      ];
    },
  });

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false }),
      Image.configure({ HTMLAttributes: { class: "my-4" } }),
      Bold,
      Italic,
      Underline,
      TextStyle,
      Color,
      Heading.configure({
        levels: [1, 2, 3],
        HTMLAttributes: { class: "font-bold my-4 text-2xl" },
      }),
      BulletList.configure({ HTMLAttributes: { class: "list-disc ml-6" } }),
      OrderedList.configure({ HTMLAttributes: { class: "list-decimal ml-6" } }),
      ListItem,
      CustomLink.configure({
        openOnClick: true,
        autolink: true,
        linkOnPaste: true,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => onContentChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: "min-h-[400px] p-2 border border-gray-600",
      },
    },
  });

  const handleImageSelect = (url: string) => {
    const fullImageUrl = url;
    const fileNameWithExt = fullImageUrl.split("/").pop() || "";
    const altText = fileNameWithExt.replace(/\.[^/.]+$/, "");
    editor?.chain().focus().setImage({ src: fullImageUrl, alt: altText }).run();
    setShowImageServer(false);
  };

  const handleTextColorChange = (color: string) => {
    editor?.chain().focus().setMark("textStyle", { color }).run();
    setColorPickerOpen(false);
  };

  const handleAddLink = () => {
    const url = prompt("Nhập URL:");
    if (!url) return;
    const text = prompt("Nhập văn bản hiển thị:");
    if (!text) return;
    editor
      ?.chain()
      .focus()
      .extendMarkRange("link")
      .insertContent(`<a href="${url}" target="_blank">${text}</a>`)
      .run();
  };

  return (
    <div className=" rounded-lg overflow-auto h-[50vh] flex flex-col">
      {/* Toolbar Sticky */}
      <div className="bg-black p-2 shadow-md sticky top-0 z-10 flex space-x-4 items-center border-b border-gray-600">
        <button
          type="button"
          className="bg-white text-black px-2 py-1 rounded hover:bg-gray-200"
          onClick={() => setShowImageServer(true)}
        >
          <Image2 />
        </button>

        <div className="relative" ref={headingMenuRef}>
          <button
            type="button"
            className="bg-white text-black px-2 py-1 rounded hover:bg-gray-200"
            onClick={() => {
              setShowHeadingMenu(!showHeadingMenu);
              setShowTextStyleMenu(false);
            }}
          >
            ¶
          </button>
          {showHeadingMenu && (
            <div className="absolute bg-white text-black rounded shadow mt-1 z-10 min-w-[140px]">
              {[1, 2, 3].map((level) => (
                <button
                  type="button"
                  key={level}
                  className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                  onClick={() => {
                    editor?.chain().focus().toggleHeading({ level }).run();
                    setShowHeadingMenu(false);
                  }}
                >
                  <span className="font-bold text-lg">H{level}</span> — Heading{" "}
                  {level}
                </button>
              ))}
              <button
                type="button"
                className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                onClick={() => {
                  editor?.chain().focus().setParagraph().run();
                  setShowHeadingMenu(false);
                }}
              >
                <span className="text-base">P</span> — Paragraph
              </button>
            </div>
          )}
        </div>

        <div className="relative" ref={textStyleMenuRef}>
          <button
            type="button"
            className="bg-white text-black px-2 py-1 rounded hover:bg-gray-200"
            onClick={() => {
              setShowTextStyleMenu(!showTextStyleMenu);
              setShowHeadingMenu(false);
            }}
          >
            Aa
          </button>
          {showTextStyleMenu && (
            <div className="absolute bg-white text-black rounded shadow mt-1 z-10 min-w-[140px]">
              <button
                type="button"
                className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                onClick={() => {
                  editor?.chain().focus().toggleBold().run();
                  setShowTextStyleMenu(false);
                }}
              >
                <span className="font-bold">B</span> — In đậm
              </button>
              <button
                type="button"
                className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                onClick={() => {
                  editor?.chain().focus().toggleItalic().run();
                  setShowTextStyleMenu(false);
                }}
              >
                <span className="italic">I</span> — Nghiêng
              </button>
              <button
                type="button"
                className="block px-4 py-2 hover:bg-gray-100 w-full text-left"
                onClick={() => {
                  editor?.chain().focus().toggleUnderline().run();
                  setShowTextStyleMenu(false);
                }}
              >
                <span className="underline">U</span> — Gạch dưới
              </button>
            </div>
          )}
        </div>

        <button
          type="button"
          className="bg-white text-black px-2 py-1 rounded hover:bg-gray-200"
          onClick={handleAddLink}
        >
          <Link2 />
        </button>

        <div className="relative">
          <button
            type="button"
            className="bg-white text-black px-2 py-1 rounded hover:bg-gray-200"
            ref={colorButtonRef}
            onClick={(e) => {
              e.stopPropagation();
              setColorPickerOpen(!isColorPickerOpen);
            }}
          >
            <Palette />
          </button>
          {isColorPickerOpen && (
            <div
              ref={colorPickerRef}
              className="absolute left-0 mt-2 border p-2 flex space-x-2 rounded shadow bg-white z-20"
            >
              {["#FFFFFF", "#008000", "red", "#2563EB"].map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => handleTextColorChange(color)}
                  style={{ backgroundColor: color }}
                  className="w-6 h-6 rounded border"
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <EditorContent editor={editor} />

      <ImageBox
        open={showImageServer}
        onClose={() => setShowImageServer(false)}
        folder={folder}
        handleImageSelect={handleImageSelect}
      />
    </div>
  );
};

export default Editor;
