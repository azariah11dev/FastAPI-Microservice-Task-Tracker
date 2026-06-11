export default function FeaturesPage() {
  const features = [
    {
      title: "Fast & Modern",
      description:
        "Built with Next.js 16 and optimized for performance, scalability, and seamless user experience.",
    },
    {
      title: "API-Ready",
      description:
        "Designed to integrate cleanly with FastAPI, enabling fast, reliable backend communication.",
    },
    {
      title: "Responsive Design",
      description:
        "Fully responsive layouts that look great on desktops, tablets, and mobile devices.",
    },
    {
      title: "Clean Architecture",
      description:
        "A modular, maintainable structure that makes it easy to expand and evolve your project.",
    },
    {
      title: "Reusable Components",
      description:
        "UI elements are built to be reused across pages, reducing duplication and improving consistency.",
    },
    {
      title: "Developer-Friendly",
      description:
        "Readable code, predictable patterns, and a structure that supports rapid iteration.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-20"
    style={{ backgroundImage: "url('/featurePage.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="w-full max-w-4xl bg-transparent shadow-lg rounded-xl p-10">
        <h1 className="text-4xl font-semibold text-white text-center mb-6">Features</h1>
        <p className="text-white text-center mb-10 leading-relaxed">
          Explore the core features that make this project fast, scalable, and
          enjoyable to build on.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50 hover:shadow-md transition"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {feature.title}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
