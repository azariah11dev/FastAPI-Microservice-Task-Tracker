export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-20"
    style={{ backgroundImage: "url('/aboutPage.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="w-full max-w-3xl bg-white shadow-lg rounded-xl p-10 border border-gray-200">
        <h1 className="text-4xl font-semibold text-gray-900 mb-6">About Us</h1>

        <p className="text-gray-700 leading-relaxed mb-6">
          We build tools that simplify workflows, enhance productivity, and
          empower individuals and teams to focus on what matters most. Our
          mission is to create intuitive, efficient, and scalable solutions that
          help people work smarter, not harder.
        </p>

        <p className="text-gray-700 leading-relaxed mb-6">
          Our team is passionate about clean design, thoughtful engineering, and
          delivering real value. Whether it's through automation, intelligent
          systems, or beautifully crafted interfaces, we aim to make technology
          feel effortless.
        </p>

        <p className="text-gray-700 leading-relaxed">
          This project is built with modern web technologies including Next.js,
          Tailwind CSS, and FastAPI — ensuring performance, reliability, and a
          seamless user experience.
        </p>
      </div>
    </div>
  );
}
