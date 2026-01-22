import {
  LucideServerCog,
  LucideShare2,
  LucideGitBranch,
  LayoutGrid,
  Brain,
  HandHeart,
} from "lucide-react";

const features = [
  {
    icon: <LucideGitBranch className="w-6 h-6" />,
    title: "Lộ trình học bài bản & thực chiến",
    description:
      "Các khóa học được thiết kế từ cơ bản đến nâng cao, bám sát nhu cầu tuyển dụng và thực tiễn doanh nghiệp",
  },
  {
    icon: <LayoutGrid className="w-6 h-6" />,
    title: "Học lập trình đa nền tảng",
    description:
      "Nội dung bao gồm Web, Mobile và Blockchain - học viên có thể linh hoạt chọn lĩnh vực phù hợp với định hướng sự nghiệp",
  },
  {
    icon: <LucideServerCog className="w-6 h-6" />,
    title: "Dịch vụ thiết kế theo yêu cầu",
    description:
      "Cung cấp giải pháp phát triển website, app và phần mềm quản lý phù hợp từng mô hình doanh nghiệp",
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "Kho kiến thức chuyên sâu",
    description:
      "Chia sẻ bài viết, hướng dẫn về thuật toán, system design và kinh nghiệm làm dự án thực tế",
  },
  {
    icon: <HandHeart className="w-6 h-6" />,
    title: "Hỗ trợ & đồng hành",
    description:
      "Cộng đồng luôn sẵn sàng hỗ trợ giải đáp, mentoring và cập nhật tài nguyên học tập mới nhất",
  },
  {
    icon: <LucideShare2 className="w-6 h-6" />,
    title: "Mở rộng kỹ năng & tư duy",
    description:
      "Không chỉ học kỹ năng code, mà còn rèn tư duy giải quyết vấn đề, phản biện và thiết kế hệ thống",
  },
];

export default function FeaturesSection() {
  return (
    <section className="bg-[#1a1a1f] py-16 px-6 text-white">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start gap-4">
            <div className="bg-cyan-600 rounded-full p-3 flex items-center justify-center">
              {feature.icon}
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
              <p className="text-lg text-gray-300">{feature.description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
