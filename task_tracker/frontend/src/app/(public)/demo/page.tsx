

export default function DemoPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center py-20 px-6"
    style={{ backgroundImage: "url('/demoPage.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <h1 className="text-4xl font-bold text-white mb-6 text-center">
        Task Forge Demo
      </h1>

      <p className="text-lg text-white max-w-2xl text-center mb-10">
        Watch a quick walkthrough of the Task Forge platform, showcasing task
        creation, project management, and real-time updates powered by FastAPI
        and Next.js.
      </p>

      <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-lg border border-gray-900">
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
          title="Task Forge Demo Video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    </main>
  );
}
