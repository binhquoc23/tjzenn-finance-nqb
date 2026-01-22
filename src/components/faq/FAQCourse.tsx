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
    question: "Mục đích các khóa học của TJZenn là gì?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          Tại <strong>TJZenn</strong>, mục tiêu của tụi mình không chỉ là{" "}
          <em>dạy cho xong</em>, mà là{" "}
          <strong>đồng hành cùng bạn phát triển kỹ năng thực chiến</strong>.
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Tập trung vào thực hành:</strong> Kiến thức lý thuyết được
            cô đọng, dễ hiểu và áp dụng liền vào các dự án thực tế.
          </li>
          <li>
            <strong>Chuẩn hóa theo doanh nghiệp:</strong> Giáo trình được thiết
            kế theo quy trình làm việc chuẩn của các công ty công nghệ hiện nay.
          </li>
          <li>
            <strong>Chuẩn bị sẵn sàng cho công việc:</strong> Bạn không chỉ học
            code, mà còn học cách tư duy, giải quyết vấn đề và làm việc nhóm –
            những kỹ năng cực kỳ cần thiết trong môi trường chuyên nghiệp.
          </li>
          <li>
            <strong>Tạo cảm hứng học tập:</strong> Không áp lực, không khô khan
            – học mà vui, học mà thấy mình tiến bộ từng ngày chính là tinh thần
            mà team TJZenn hướng đến.
          </li>
        </ul>
        <p>
          <em>
            Mình tin rằng bạn không cần học tất cả mọi thứ, chỉ cần học đúng cái
            mình cần – và đó là những gì TJZenn mang lại.
          </em>
        </p>
      </div>
    ),
    important: true,
  },
  {
    question: "Nên có nền tảng kiến thức nào để học các khóa học của TJZenn?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          Các khóa học tại <strong>TJZenn</strong> được thiết kế cho những bạn{" "}
          <strong>đã biết một chút về JavaScript</strong>, kể cả tự học hay học
          từ trường lớp.
        </p>
        <p>
          Không cần giỏi, chỉ cần bạn từng viết vài dòng JS cơ bản như khai báo
          biến, vòng lặp, hoặc viết function là hoàn toàn có thể bắt đầu học.
        </p>
        <p>
          Vì khóa học đi theo hướng <strong>thực hành nhiều</strong> và{" "}
          <strong>sát với thực tế công việc</strong>, nên có nền tảng JS cơ bản
          sẽ giúp bạn bắt nhịp tốt hơn.
        </p>
        <p className="text-red-500">
          Nếu bạn chưa biết gì về JavaScript, nên học một khóa nhập môn JS trước
          rồi hãy học tiếp tại TJZenn để tránh bị choáng.
        </p>
      </div>
    ),
    important: true,
  },
  {
    question: "Hình thức đăng ký khóa học trả phí tại TJZenn như thế nào?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          Để đăng ký khóa học tại <strong>TJZenn</strong>, bạn chỉ cần làm theo
          3 bước đơn giản:
        </p>
        <ul className="list-decimal pl-5 space-y-2">
          <li>
            <strong>Liên hệ với TJZenn</strong> (điền form liên hệ, fanpage hoặc
            Zalo) để được tư vấn kỹ xem khóa học có phù hợp với mục tiêu học tập
            và nền tảng hiện tại của bạn hay không.
          </li>
          <li>
            <strong>Chuyển khoản học phí</strong> theo thông tin thanh toán được
            cung cấp sau khi tư vấn xong.
          </li>
          <li>
            Sau khi xác nhận thanh toán, bạn sẽ được{" "}
            <strong>thêm vào thư mục Google Drive riêng</strong> chứa toàn bộ
            nội dung khóa học (video bài giảng, bài tập, tài liệu, hướng
            dẫn...).
          </li>
        </ul>
        <p>
          Việc học qua <strong>Google Drive</strong> là hình thức tụi mình chủ
          động lựa chọn vì nhiều lý do:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Tiết kiệm thời gian:</strong> Không cần đăng nhập web, chỉ
            cần mở Drive là học được ngay.
          </li>
          <li>
            <strong>Có thể tải video về tùy thích:</strong> Học offline dễ dàng,
            không sợ mất kết nối.
          </li>
          <li>
            <strong>Tốc độ tải nhanh:</strong> Video không bị lag, giật, load
            mượt trên cả điện thoại và máy tính.
          </li>
          <li>
            <strong>Truy cập trọn đời:</strong> Sau khi thanh toán, bạn sẽ được
            quyền học vĩnh viễn – không giới hạn thời gian hay lượt xem.
          </li>
          <li>
            <strong>Tập trung vào nội dung:</strong> Không bị phân tán bởi giao
            diện hay chức năng dư thừa – học là vào học luôn.
          </li>
        </ul>
        <p>
          Sau khi học xong, nếu có thắc mắc, bạn luôn được{" "}
          <strong>hỗ trợ trực tiếp 1-1</strong> để đảm bảo hiểu bài và áp dụng
          được.
        </p>
      </div>
    ),
    important: true,
  },

  {
    question: "Học xong khóa học của TJZenn thì có đi làm được chưa?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          Nếu bạn học nghiêm túc, thực hành đầy đủ và hoàn thành toàn bộ nội
          dung trong khóa học của <strong>TJZenn</strong>, thì{" "}
          <strong>
            hoàn toàn có thể tự tin ứng tuyển thực tập hoặc fresher tại các công
            ty IT
          </strong>
          .
        </p>
        <p>
          Tuy nhiên, việc <strong>có đi làm được hay không</strong> còn phụ
          thuộc vào:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            {" "}
            Mức độ chăm chỉ và chủ động học hỏi của bạn trong quá trình học.
          </li>
          <li>
            {" "}
            Khả năng áp dụng kiến thức vào thực tế (cái này trong khóa có hướng
            dẫn rõ).
          </li>
          <li> Cách bạn xây dựng CV, portfolio và kỹ năng phỏng vấn.</li>
        </ul>
        <p>
          Tụi mình không hứa hẹn "xong là có việc ngay", nhưng{" "}
          <strong>sẽ chỉ đúng đường, hỗ trợ hết mình</strong> để bạn đủ năng lực
          bước vào môi trường doanh nghiệp.
        </p>
        <p className="text-green-600 font-semibold">
          Rất nhiều học viên TJZenn đã đi thực tập, đi làm tại công ty lớn nhỏ
          sau khi học xong – bạn cũng có thể làm được, miễn là thật sự quyết
          tâm.
        </p>
      </div>
    ),
    important: false,
  },

  {
    question:
      "Học sinh, sinh viên có ít kinh phí thì học các khóa học TJZenn như thế nào?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          Tụi mình hiểu rõ cảm giác{" "}
          <strong>muốn học nhưng tài chính còn hạn chế</strong> – đặc biệt là
          với học sinh, sinh viên đang trong giai đoạn bắt đầu.
        </p>
        <p>
          Vì vậy, <strong>TJZenn có chính sách hỗ trợ riêng</strong> dành cho
          bạn nào thật sự có tinh thần cầu tiến nhưng gặp khó khăn về kinh phí:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Giảm học phí cho sinh viên:</strong> Nếu bạn là sinh
            viên/học sinh, chỉ cần liên hệ tụi mình và chia sẻ thật – mình sẽ hỗ
            trợ phần học phí phù hợp nhất có thể.
          </li>
          <li>
            <strong>Cho phép chia nhỏ thanh toán:</strong> Một số khóa học có
            thể thanh toán theo đợt để giảm áp lực tài chính.
          </li>
          <li>
            <strong>Học thử một phần miễn phí:</strong> Một số nội dung mở miễn
            phí để bạn trải nghiệm trước khi quyết định đầu tư.
          </li>
        </ul>
        <p>
          Tụi mình không muốn ai bị bỏ lại phía sau chỉ vì điều kiện chưa đủ
          tốt. Nếu bạn thực sự nghiêm túc và muốn học, hãy{" "}
          <strong>chủ động nhắn tin cho team TJZenn</strong> – tụi mình luôn
          lắng nghe và tìm cách hỗ trợ.
        </p>
        <p className="text-green-600 font-semibold">
          Đôi khi, điều bạn cần không phải là nhiều tiền – mà là một thái độ học
          tập đúng đắn và dám bắt đầu
        </p>
      </div>
    ),
    important: false,
  },
  {
    question: "Tại sao dù có AI rồi mà TJZenn vẫn làm khóa học?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          AI là một công cụ cực kỳ mạnh, nhưng{" "}
          <strong>
            nó không thể thay thế được vai trò của một người hướng dẫn có tâm
          </strong>
          . Đặc biệt là với người mới – khi bạn chưa biết hỏi gì, chưa biết bắt
          đầu từ đâu, và chưa có tư duy lập trình rõ ràng.
        </p>
        <p>
          Các khóa học tại <strong>TJZenn</strong> được làm ra không phải để
          cung cấp lý thuyết lan man, mà để:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Định hướng rõ ràng:</strong> Học gì trước, học gì sau, học
            bao nhiêu là đủ – AI không thể tự lên lộ trình cá nhân hóa cho bạn.
          </li>
          <li>
            <strong>Giải thích tận gốc:</strong> Có những chỗ AI trả lời đúng –
            nhưng bạn không hiểu vì sao đúng. Khóa học sẽ chỉ cho bạn bản chất.
          </li>
          <li>
            <strong>Rèn tư duy:</strong> Học lập trình không phải là copy code.
            Tụi mình giúp bạn biết suy nghĩ như một dev thật sự.
          </li>
          <li>
            <strong>Có người đồng hành:</strong> Khi bạn gặp lỗi, hoang mang
            hoặc muốn định hướng, có người chỉ bạn cụ thể – điều mà AI không thể
            làm 1-1 theo tiến độ của bạn.
          </li>
        </ul>
        <p>
          <strong>AI là trợ lý – còn TJZenn là người dẫn đường.</strong> Kết hợp
          cả hai thì bạn sẽ đi nhanh và vững hơn rất nhiều.
        </p>
        <p>
          Một điều quan trọng:{" "}
          <strong>
            Khóa học không phải là nguồn thu nhập chính của TJZenn
          </strong>
          . Tụi mình đã có lượng khách hàng doanh nghiệp ổn định trong mảng
          thiết kế website, phát triển phần mềm và giải pháp blockchain.
        </p>
        <p>
          Việc mở khóa học là{" "}
          <strong>
            mong muốn cá nhân của tụi mình – để chia sẻ lại những gì đã học, đã
            làm, đã trải nghiệm
          </strong>
          , đặc biệt cho những bạn đang chật vật tìm đường vào ngành.
        </p>
        <p>
          <strong>Học phí chỉ mang tính cam kết</strong> – để những người học
          thật sự nghiêm túc mới tham gia. Tụi mình không làm giáo dục đại trà,
          và cũng không sống nhờ vào số lượng học viên.
        </p>
        <p className="text-green-600 font-semibold">
          Vậy nên nếu bạn thực sự muốn học, muốn tiến bộ, và cần người dẫn đường
          tử tế – thì TJZenn sẽ là nơi phù hợp để bắt đầu.
        </p>
      </div>
    ),
    important: false,
  },
  {
    question: "Học xong khóa học có được làm việc tại TJZenn không?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          <strong>TJZenn không cam kết tuyển dụng sau khi học</strong>, nhưng
          nếu bạn học nghiêm túc, làm bài đầy đủ và thể hiện được năng lực – tụi
          mình{" "}
          <strong>hoàn toàn có thể mời bạn cộng tác ở các dự án thật</strong>{" "}
          như website, phần mềm, blockchain hoặc sản phẩm nội bộ.
        </p>
        <p>
          Tính đến thời điểm hiện tại,{" "}
          <strong>trong hơn 1.200 học viên đã học tại TJZenn</strong>, thì{" "}
          <strong>đã có 3 người trở thành cộng sự chính thức</strong> của team.
          Đây đều là những bạn học rất chăm chỉ, có tư duy tốt và chủ động kết
          nối với tụi mình sau khóa học.
        </p>
        <p>
          Tụi mình luôn ưu tiên những bạn đã học tại TJZenn vì{" "}
          <strong>
            họ hiểu văn hoá làm việc, cách tư duy và tiêu chuẩn code mà team
            hướng tới
          </strong>
          .
        </p>
        <p>
          Nếu bạn mong muốn được thử sức, có thể gửi CV hoặc nhắn trực tiếp sau
          khi hoàn thành khóa học – tụi mình rất sẵn lòng trao cơ hội nếu thấy
          phù hợp.
        </p>
        <p className="text-green-600 font-semibold">
          Không hứa suông, nhưng cơ hội là có thật. Và nếu bạn đủ giỏi,{" "}
          <strong>TJZenn sẽ không bỏ qua bạn đâu</strong>
        </p>
      </div>
    ),
    important: false,
  },
  {
    question: "TJZenn có dạy 1-1 online hoặc trực tiếp không?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          Hiện tại, <strong>TJZenn đã hỗ trợ hình thức học 1-1 online</strong>{" "}
          cho những bạn cần kèm riêng hoặc muốn giải đáp sâu hơn theo tốc độ cá
          nhân. Việc học sẽ được thực hiện qua <strong>Google Meet</strong> hoặc
          nền tảng gọi video phù hợp.
        </p>
        <p>
          Để học 1-1, bạn chỉ cần{" "}
          <strong>liên hệ trực tiếp với tụi mình</strong> để trao đổi về:
        </p>
        <ul className="list-disc pl-5 space-y-2">
          <li> Mục tiêu học cụ thể và trình độ hiện tại</li>
          <li> Lịch học phù hợp với bạn và mentor</li>
          <li> Mức chi phí tương xứng với nội dung và thời lượng mong muốn</li>
        </ul>
        <p>
          Về hình thức <strong>dạy trực tiếp (offline)</strong>, tụi mình cũng
          đang có kế hoạch mở các buổi học nhỏ trong thời gian tới, đặc biệt tại
          TP.HCM. Sẽ có thông báo chính thức trên fanpage khi sẵn sàng triển
          khai.
        </p>
        <p className="text-green-600 font-semibold">
          Tụi mình tin rằng học 1-1 chỉ thật sự hiệu quả khi người dạy phù hợp,
          người học nghiêm túc, và cả hai cùng cam kết đi đến kết quả – nên nếu
          bạn quan tâm, cứ inbox trao đổi trước nha!
        </p>
      </div>
    ),
    important: false,
  },
  {
    question: "Đội ngũ TJZenn là ai mà tự tin mở khóa học?",
    answer: (
      <div className="text-left space-y-4">
        <p>
          TJZenn được xây dựng bởi{" "}
          <strong>những người đã và đang làm thật trong ngành IT</strong> –
          không phải chỉ đứng lớp cho có.
        </p>
        <p>
          Tụi mình từng <strong>khởi nghiệp nhiều lần</strong>, từng làm cả sản
          phẩm lẫn dịch vụ. Từng hợp tác với{" "}
          <strong>các công ty lớn nhỏ</strong> ở nhiều mô hình khác nhau. Và
          cũng đã <strong>thất bại không ít lần</strong>.
        </p>
        <p>
          Chính vì từng trải qua nhiều va vấp, nên tụi mình hiểu rõ:{" "}
          <strong>
            người mới cần gì để đi nhanh hơn và không tốn thời gian như tụi mình
            từng tốn
          </strong>
          .
        </p>
        <p>
          Các khóa học tại TJZenn được đúc kết từ những gì tụi mình đã học – đã
          làm – đã sai – và đã rút ra bài học thật. Không giáo trình copy, không
          lý thuyết suông.
        </p>
        <p>
          <strong>
            Tụi mình dạy không phải vì nghĩ mình giỏi nhất, mà vì muốn chia sẻ
            lại những gì thật sự giá trị
          </strong>{" "}
          cho những bạn đang tìm đường vào ngành công nghệ.
        </p>
        <p className="text-green-600 font-semibold">
          Nếu bạn cần sự thật – không màu mè – không hứa suông, thì TJZenn sẽ là
          nơi bạn học được cách làm nghề đúng nghĩa.
        </p>
      </div>
    ),
    important: false,
  },
];

export default function FaqCourse() {
  const [openIndexes, setOpenIndexes] = useState<number[]>([]);

  const toggle = (index: number) => {
    setOpenIndexes((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <motion.section
      className="w-full  text-white py-20 px-4"
      variants={fadeInUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="max-w-full mx-auto text-left mb-12">
          <h2 className="text-3xl sm:text-3xl font-bold">
            Các câu hỏi thường gặp
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
                  className="w-full flex justify-between items-center px-4 py-3 text-left bg-[#101010] transition"
                >
                  <span className=" font-medium">
                    {item.question}
                    {item.important && (
                      <span className="text-red-500 font-semibold ml-1">*</span>
                    )}
                  </span>
                  <span className="text-xl">{isOpen ? "−" : "+"}</span>
                </button>
                {isOpen && (
                  <div className="px-4 py-4 bg-[#101010] border-t border-white/10">
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
