export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col"
    style={{ backgroundImage: "url('/landingPage.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center px-6 py-32">
        <h1 className="text-5xl font-bold text-white mb-6">
          Build Faster. Work Smarter.
        </h1>

        <p className="text-lg text-gray-300 max-w-2xl leading-relaxed mb-10">
          A modern platform designed to streamline your workflow, boost
          productivity, and help you focus on what matters most.
        </p>

        <div className="flex gap-4">
          <a
            href="/demo"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-900 transition"
          >
            View Demo
          </a>

          <a
            href="/signup"
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-lg font-medium hover:bg-gray-400 transition"
          >
            Get Started
          </a>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="px-6 py-24 flex justify-center">
        <div className="w-full max-w-5xl">
          <h2 className="text-3xl font-semibold text-white text-center mb-12">
            Why Choose Us
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Fast Setup
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Get started in minutes with a clean, modern architecture.
              </p>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Modern Stack
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Powered by Next.js 16, Tailwind v4, and FastAPI for maximum
                performance.
              </p>
            </div>

            <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Scalable Design
              </h3>
              <p className="text-gray-700 leading-relaxed">
                Built with modular components that grow with your project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 text-center text-white">
        © {new Date().getFullYear()} Your Project Name. All rights reserved.
      </footer>
    </div>
  );
}
