"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: "easeOut",
    },
  },
};

const faqItems = [
  {
    question:
      "Cần cung cấp gì để tiến hành thiết kế website cũng như phần mềm tại TJZenn?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          Để bắt đầu thiết kế một website hoặc phần mềm tại{" "}
          <strong>TJZenn</strong>, bạn chỉ cần cung cấp cho tụi mình những thông
          tin cơ bản sau:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Mục tiêu & mục đích sử dụng:</strong> Bạn làm web/phần mềm
            để kinh doanh, giới thiệu dịch vụ, quản lý nội bộ hay phục vụ khách
            hàng?
          </li>
          <li>
            <strong>Yêu cầu tính năng cụ thể:</strong> Ví dụ: cần form liên hệ,
            giỏ hàng, đăng nhập, quản lý nhân sự, thống kê, CRM,...
          </li>
          <li>
            <strong>Phong cách thiết kế mong muốn:</strong> Giao diện hiện đại,
            tối giản, màu sắc chủ đạo, hoặc bạn có thể gửi mẫu tham khảo.
          </li>
          <li>
            <strong>Thông tin nội dung (nếu có):</strong> Logo, hình ảnh, nội
            dung text, tên miền,... càng có sớm thì tiến độ càng nhanh.
          </li>
          <li>
            <strong>Thời gian dự kiến muốn hoàn thành:</strong> Để tụi mình lên
            timeline và báo giá hợp lý.
          </li>
        </ul>
        <p>
          Nếu bạn chưa rõ mình cần gì, đừng lo —{" "}
          <strong>TJZenn sẽ tư vấn miễn phí</strong>, giúp bạn gỡ rối và đề xuất
          giải pháp phù hợp với ngân sách.
        </p>
        <p className="text-green-600 font-semibold">
          Chỉ cần bạn có ý tưởng, tụi mình sẽ giúp biến nó thành sản phẩm thật –
          từ A đến Z.
        </p>
      </div>
    ),
    important: true,
  },
  {
    question: "Chi phí thiết kế website hoặc phần mềm tại TJZenn là bao nhiêu?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          Tại <strong>TJZenn</strong>, chi phí thiết kế website hoặc phần mềm{" "}
          <strong>phụ thuộc vào mức độ phức tạp của dự án</strong> và các tính
          năng mà bạn yêu cầu.
        </p>
        <p>
          Tụi mình <strong>không áp dụng bảng giá cố định</strong>, vì mỗi khách
          hàng có nhu cầu khác nhau: có người cần web giới thiệu đơn giản, có
          người cần hệ thống phần mềm có quản lý, phân quyền, báo cáo...
        </p>
        <p>Sau khi trao đổi và nắm rõ yêu cầu, tụi mình sẽ gửi bạn:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li> Bảng báo giá chi tiết theo từng tính năng</li>
          <li> Tư vấn các phương án phù hợp với ngân sách</li>
          <li>
            {" "}
            Cam kết không phát sinh thêm chi phí nếu không thay đổi yêu cầu
          </li>
        </ul>
        <p>
          Tụi mình cũng{" "}
          <strong>
            linh hoạt với ngân sách của startup, cá nhân và doanh nghiệp nhỏ
          </strong>
          . Nếu bạn có kinh phí giới hạn, cứ chia sẻ – tụi mình sẽ tối ưu tính
          năng để vẫn có sản phẩm chất lượng, phù hợp mục tiêu.
        </p>
      </div>
    ),
    important: true,
  },
  {
    question: "Thiết kế website và phần mềm tại TJZenn có hợp đồng không?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          Có! Tại <strong>TJZenn</strong>, tất cả các dự án thiết kế website
          hoặc phần mềm đều <strong>có hợp đồng rõ ràng</strong> để đảm bảo
          quyền lợi cho cả hai bên.
        </p>
        <p>Hợp đồng sẽ thể hiện:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li> Phạm vi công việc và tính năng sẽ triển khai</li>
          <li> Tổng chi phí & tiến độ thanh toán theo từng giai đoạn</li>
          <li> Thời gian bàn giao dự kiến và điều khoản bảo hành</li>
          <li> Cam kết bảo mật thông tin & quyền sở hữu mã nguồn</li>
        </ul>
        <p>
          Với khách hàng cá nhân hoặc startup nhỏ, nếu không tiện ký hợp đồng
          giấy, tụi mình sẽ{" "}
          <strong>kí hợp đồng điện tử hoặc thỏa thuận qua email</strong> – vẫn
          đảm bảo đầy đủ tính pháp lý và cam kết.
        </p>
        <p className="text-green-600 font-semibold">
          Tụi mình làm việc chuyên nghiệp, rõ ràng từ đầu để tránh hiểu lầm, và
          đồng hành lâu dài nếu bạn cần nâng cấp sau này
        </p>
      </div>
    ),
    important: true,
  },
  {
    question:
      "Quy trình thực hiện thiết kế website và phần mềm tại TJZenn như thế nào?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          Tại <strong>TJZenn</strong>, tụi mình làm việc theo quy trình chuyên
          nghiệp và minh bạch gồm 5 bước sau:
        </p>
        <ul className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Tiếp nhận yêu cầu & tư vấn:</strong> Lắng nghe mong muốn, đề
            xuất tính năng, định hướng giải pháp phù hợp với ngân sách.
          </li>
          <li>
            <strong> Báo giá & ký hợp đồng:</strong> Gửi báo giá chi tiết, thống
            nhất lộ trình và ký hợp đồng (giấy hoặc online).
          </li>
          <li>
            <strong>Thiết kế giao diện:</strong> Thiết kế layout UI/UX
            (web/app), chỉnh sửa theo góp ý đến khi chốt final.
          </li>
          <li>
            <strong> Lập trình & triển khai:</strong> Phát triển tính năng theo
            đúng mô tả đã thống nhất, test kỹ trước khi bàn giao.
          </li>
          <li>
            <strong>Bàn giao & bảo hành:</strong> Bàn giao source code, hướng
            dẫn sử dụng và bảo hành theo cam kết.
          </li>
        </ul>
        <p>
          Trong suốt quá trình,{" "}
          <strong>khách hàng được cập nhật tiến độ thường xuyên</strong>, có
          quyền phản hồi và điều chỉnh trong phạm vi hợp đồng.
        </p>
        <p className="text-green-600 font-semibold">
          Làm một lần cho ngon, không chạy deadline ẩu – đó là cách TJZenn làm
          sản phẩm!
        </p>
      </div>
    ),
    important: true,
  },
  {
    question: "Sản phẩm của TJZenn có được bảo hành trọn đời không?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          <strong>
            Có! Tất cả sản phẩm do TJZenn thực hiện đều được bảo hành trọn đời
          </strong>{" "}
          – với điều kiện là mã nguồn{" "}
          <strong>chưa bị bên thứ 3 chỉnh sửa hoặc can thiệp</strong>.
        </p>
        <p>
          Trong thời gian sử dụng, nếu có lỗi kỹ thuật phát sinh do phía tụi
          mình, và bạn vẫn giữ nguyên mã nguồn ban đầu (không thuê nơi khác
          chỉnh sửa), thì tụi mình sẽ{" "}
          <strong>sửa miễn phí không giới hạn thời gian</strong>.
        </p>
        <p>
          Trường hợp bạn cần{" "}
          <strong>thêm tính năng mới hoặc thay đổi thiết kế</strong> thì không
          nằm trong phạm vi bảo hành, nhưng tụi mình sẽ{" "}
          <strong>tính chi phí rõ ràng dựa theo độ phức tạp</strong> – không
          phát sinh linh tinh.
        </p>
        <p className="text-green-600 font-semibold">
          Tóm lại: <strong>bảo hành trọn đời thật, không chiêu trò</strong> –
          miễn là sản phẩm chưa bị bên khác đụng vào mã nguồn.
        </p>
      </div>
    ),
    important: false,
  },
  {
    question: "Dịch vụ tại TJZenn nổi bật gì hơn so với những nơi khác?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          Tụi mình không so sánh để dìm chỗ khác, nhưng nếu nói về{" "}
          <strong>điểm khác biệt nổi bật tại TJZenn</strong> thì có thể tóm gọn
          như sau:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Hiểu mục tiêu thật của khách hàng:</strong> Tụi mình không
            chỉ làm “cho đẹp”, mà làm để web/app hoạt động hiệu quả đúng với mục
            đích (bán hàng, giới thiệu, quản lý...).
          </li>
          <li>
            <strong>Tư duy dev thực chiến:</strong> Sản phẩm được làm bởi những
            người đang làm thật trong ngành phần mềm – không dùng template tràn
            lan hay làm theo kiểu “miễn chạy là được”.
          </li>
          <li>
            <strong>Thiết kế gọn – hiện đại – tối ưu trải nghiệm:</strong> Mỗi
            giao diện đều được làm chỉn chu từ đầu chứ không bê nguyên mẫu cũ
            dán lại.
          </li>
          <li>
            <strong>Bảo hành & hỗ trợ lâu dài:</strong> Sau khi bàn giao, vẫn
            đồng hành cùng khách. Có lỗi sửa, có nhu cầu nâng cấp thì hỗ trợ rõ
            ràng.
          </li>
          <li>
            <strong>Không làm đại trà, không ôm số lượng:</strong> Tụi mình chọn
            lọc dự án để đảm bảo chất lượng từng sản phẩm – làm ít nhưng làm cho
            đáng.
          </li>
        </ul>
        <p>
          <strong>
            TJZenn không cố gắng nhận thật nhiều dự án để chạy doanh thu
          </strong>
          , tụi mình làm vì muốn khách hàng nhận được đúng thứ họ cần – và sẵn
          sàng gắn bó lâu dài nếu bạn cũng nghiêm túc đầu tư vào sản phẩm.
        </p>
        <p className="text-green-600 font-semibold">
          Làm việc với TJZenn là làm với team nhỏ nhưng kỹ, tử tế và hiểu nghề –
          không nhanh, ẩu
        </p>
      </div>
    ),
    important: false,
  },
  {
    question: "TJZenn sử dụng công nghệ gì để xây dựng website và phần mềm?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          Tại <strong>TJZenn</strong>, tụi mình sử dụng các công nghệ hiện đại,
          phổ biến và dễ mở rộng – để đảm bảo sản phẩm chạy mượt, bảo mật, dễ
          bảo trì và nâng cấp trong tương lai.
        </p>
        <p>Cụ thể:</p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            {" "}
            <strong>Frontend:</strong> ReactJS, Next.js, TailwindCSS, shadcn/ui
            – giúp website mượt, responsive và tối ưu SEO.
          </li>
          <li>
            {" "}
            <strong>Backend:</strong> Node.js (NestJS), Express, hoặc Laravel –
            tùy vào yêu cầu và tính chất dự án.
          </li>
          <li>
            {" "}
            <strong>Database:</strong> MongoDB, PostgreSQL, MySQL – lựa chọn
            linh hoạt theo mô hình dữ liệu.
          </li>
          <li>
            {" "}
            <strong>Bảo mật & xác thực:</strong> JWT, OAuth2, NextAuth, bảo mật
            chuẩn REST/API.
          </li>
          <li>
            {" "}
            <strong>DevOps & triển khai:</strong> Vercel, Docker, PM2, VPS,
            CI/CD với GitHub Actions.
          </li>
        </ul>
        <p>
          Ngoài ra, nếu dự án yêu cầu đặc biệt (realtime, AI, blockchain,
          IoT...), tụi mình cũng có kinh nghiệm tích hợp các nền tảng phù hợp.
        </p>
        <p className="text-green-600 font-semibold">
          Tóm lại: Tụi mình chọn tech-stack phù hợp với dự án – hiện đại, phổ
          biến, không xài công nghệ “độc quyền khó sửa”, dễ bàn giao và phát
          triển về sau.
        </p>
      </div>
    ),
    important: false,
  },
];

export default function FaqService() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggle = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <motion.section
      className="w-full bg-[#1a1a1f] text-white py-20 px-4"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="max-w-full mx-auto text-left mb-12">
          <h2 className="text-3xl sm:text-3xl font-bold">
            Các câu hỏi thường gặp về{" "}
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              dịch vụ
            </span>
          </h2>
        </div>
        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openIndexes.includes(index);
            return (
              <div
                key={index}
                className="border border-white/10 rounded-lg overflow-hidden"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full flex justify-between items-center px-4 py-3 text-left bg-gray-600 transition"
                >
                  <span className="font-medium">
                    {item.question}
                    {item.important && (
                      <span className="text-red-500 font-semibold ml-1">*</span>
                    )}
                  </span>
                  <span className="text-xl">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="px-4 py-4 bg-[#1a1a1f] border-t border-white/10">
                    {item.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </motion.section>
  );
}
