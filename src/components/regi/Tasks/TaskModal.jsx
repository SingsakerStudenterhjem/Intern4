import React from "react";

const TaskModal = ({task, onClose}) => {
    if (!task) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-md shadow-lg max-w-lg w-full p-6"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4">{task.taskName}</h2>
                        <p><strong>Beskrivelse:</strong></p>
                        <p>{task.description}</p>
                    </div>
                    <div className="border-l px-2 border-gray-200"/>
                    <div className="min-w-44">
                        <strong>Kategori:</strong>
                        <p>{task.category}</p>
                        <strong>Kontaktperson:</strong>
                        <p>{task.contactPerson}</p>
                        <strong>Frist:</strong>
                        <p>{task.deadline || "Ingen frist"}</p>
                        <strong>Time anslag:</strong>
                        <p>{task.hourEstimate || "Ukjent"}</p>
                        <strong>Tatt av:</strong>
                        <p>{task.takenBy || "Ingen"}</p>
                    </div>
                </div>
                <div className="mt-6 space-x-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Lukk
                    </button>
                    {/* FIXME: show only if user is currently assigned to the displayed task */}
                    <button className="px-4 py-2 rounded text-white bg-red-500 hover:bg-red-600">
                        Gi ifra
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;