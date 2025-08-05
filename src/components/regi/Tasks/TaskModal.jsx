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
                        <h2 className="text-2xl font-semibold mb-4">{task.hva}</h2>
                        <p><strong>Beskrivelse:</strong></p>
                        <p>{task.beskrivelse}</p>
                    </div>
                    <div className="border-l px-2 border-gray-200"/>
                    <div className="min-w-44">
                        <strong>Kategori:</strong>
                        <p>{task.kategori}</p>
                        <strong>Kontaktperson:</strong>
                        <p>{task.kontaktperson}</p>
                        <strong>Frist:</strong>
                        <p>{task.frist || "Ingen frist"}</p>
                        <strong>Time anslag:</strong>
                        <p>{task.timeAnslag || "Ukjent"}</p>
                        <strong>Tatt av:</strong>
                        <p>{task.tattAv || "Ingen"}</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="mt-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Lukk
                </button>
            </div>
        </div>
    );
};

export default TaskModal;