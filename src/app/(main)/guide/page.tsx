"use client";

export default function GuidePage() {
  return (
    <div className="min-h-screen flex pt-12 justify-center px-4">
      <div className="shadow-lg rounded-lg w-full max-w-4xl p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-10 text-center text-white">
          Hướng dẫn sử dụng
        </h1>

        {/* Video hướng dẫn từ YouTube */}
        <div className="mb-28">
          <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
            <iframe
              className="absolute top-0 left-0 w-full h-full rounded-md"
              src="https://www.youtube.com/embed/dQw4w9WgXcQ"
              title="Hướng dẫn sử dụng"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>

        {/* Phần hướng dẫn 1 */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-2">
            1. Đăng nhập vào hệ thống
          </h2>
          <p className="text-gray-300 mb-4">
            Truy cập vào trang đăng nhập và nhập email + mật khẩu của bạn. Nếu
            chưa có tài khoản, hãy đăng ký trước.
          </p>
          <img
            src="/images/login-guide.png"
            alt="Hướng dẫn đăng nhập"
            className="rounded-md border border-gray-600"
          />
        </section>

        {/* Phần hướng dẫn 2 */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-2">
            2. Thực hiện chức năng chính
          </h2>
          <p className="text-gray-300 mb-4">
            Sau khi đăng nhập, bạn sẽ được đưa đến trang dashboard. Tại đây bạn
            có thể quản lý tài khoản, xem thống kê hoặc thao tác dữ liệu.
          </p>
          <img
            src="/images/dashboard-guide.png"
            alt="Trang dashboard"
            className="rounded-md border border-gray-600"
          />
        </section>

        {/* Phần hướng dẫn 3 */}
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-white mb-2">
            3. Hỗ trợ & liên hệ
          </h2>
          <p className="text-gray-300 mb-4">
            Nếu gặp sự cố, bạn có thể vào mục "Trợ giúp" hoặc liên hệ admin qua
            email hỗ trợ để được giải đáp.
          </p>
          <img
            src="/images/support-guide.png"
            alt="Hỗ trợ"
            className="rounded-md border border-gray-600"
          />
        </section>
      </div>
    </div>
  );
}
