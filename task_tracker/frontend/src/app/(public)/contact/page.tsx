"use client";

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      // TODO: Replace with your FastAPI endpoint
      const res = await fetch("http://localhost:8000/contact/all_questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) throw new Error("Failed to send");

      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch (err) {
      setStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6 py-20"
      style={{ backgroundImage: "url('/contactPage.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="w-full max-w-2xl bg-white shadow-lg rounded-xl p-10 border border-gray-200">
        <h1 className="text-3xl font-semibold text-gray-900 mb-6">Contact Us</h1>
        <p className="text-gray-600 mb-10">
          Have a question or want to work together? Send us a message.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message
            </label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={5}
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="How can we help?"
              required
            />
          </div>

          <div className="w-full flex items-center justify-center">
            <button
              type="submit"
              disabled={status === "loading"}
              className="w-2/5 bg-blue-600 text-white font-medium py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {status === "loading" ? "Sending..." : "Send Message"}
            </button>
          </div>

          {status === "success" && (
            <p className="text-green-600 text-sm mt-2">Message sent successfully.</p>
          )}
          {status === "error" && (
            <p className="text-red-600 text-sm mt-2">Something went wrong.</p>
          )}
        </form>
      </div>
    </div>
  );
}
