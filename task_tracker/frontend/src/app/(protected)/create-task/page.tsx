"use client";
import { useState } from "react";

export default function CreateTask() {
    const [task, setTask] = useState("");
    const [taskList, setTaskList] = useState<string[]>([]);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);

    const addTask = () => {
        if (!task.trim()) return;
        setTaskList((prev) => [...prev, task]);
        setTask("");
    };

    const removeTask = () => {
        if (selectedIndex === null) return;
        setTaskList(prev => prev.filter((_, i) => i !== selectedIndex));
        setSelectedIndex(null);
    };

    const analyzeTasks = async () => {
        setLoading(true);
        try {
            const response = await fetch("http://localhost:8000/query_builder/analyze_tasks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tasks: taskList }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("Analysis:", data);

                const entry = {
                    timestamp: Date.now(),
                    readable: new Date().toLocaleString(),
                    tasks: taskList,
                    analysis: data
                };

                const previous = JSON.parse(localStorage.getItem("analysis_history") || "[]");
                previous.push(entry);

                localStorage.setItem("analysis_history", JSON.stringify(previous));

                setShowModal(true);
                return;
            }

        } catch (err) {
            console.error(err);
            alert("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center gap-10 pt-10 bg-[#0b0c10] h-[calc(100%-4rem)]">

            {loading && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
                        <p className="text-gray-700 font-semibold">Analyzing tasks...</p>
                    </div>
                </div>
            )}

            <h1 className="text-4xl font-bold text-[#66fcf1]">Create Task</h1>

            <div className="flex flex-col">
                <label className="font-bold mb-2">
                    Add Task:
                </label>
                <input
                    name="task"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    className="border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                />

                <div className="w-full flex justify-center align-center gap-3">
                    <button
                        type="button"
                        className="mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600 w-1/2"
                        onClick={addTask}
                    >
                        Add Task
                    </button>
                    <button
                        type="button"
                        className={`mt-4 py-2 px-1 rounded-md w-1/2 
                            ${selectedIndex !== null ? "bg-red-500 text-white hover:bg-red-600" : "bg-gray-400 text-gray-200 cursor-not-allowed"}`}
                        onClick={removeTask}
                        disabled={selectedIndex === null}
                    >
                        Remove Task
                    </button>
                </div>

                <div id="task-list" className="mt-4">
                    {taskList.map((t, i) => (
                        <div
                            key={i}
                            onClick={() => setSelectedIndex(i === selectedIndex ? null : i)}
                            className={`p-2 border-b border-gray-300 cursor-pointer ${
                                selectedIndex === i ? "bg-blue-100 text-black" : ""
                            }`}
                        >
                            {t}
                        </div>
                    ))}
                </div>

                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
                        <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
                            <h2 className="text-xl font-bold mb-4 text-black">What would you like to do?</h2>

                            <div className="flex flex-col gap-3 items-center justify-center">
                                <button
                                    className="bg-blue-900 text-white py-2 rounded-md hover:bg-blue-500 w-3/4"
                                    onClick={() => window.location.href = "/task-management"}
                                >
                                    Continue
                                </button>

                                <button
                                    className="bg-gray-900 py-2 rounded-md hover:bg-gray-500 w-3/4"
                                    onClick={() => setShowModal(false)}
                                >
                                    Add More Tasks
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mb-10">
                <button
                    type="button"
                    id="analyze"
                    disabled={loading}
                    className="mt-4 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600"
                    onClick={analyzeTasks}
                >
                    {loading ? "Analyzing..." : "Analyze"}
                </button>
            </div>
        </div>
    );
}