import React from "react";

const TaskModal = ({ task, onClose }) => {
    if (!task) return null;

    const handleUnassign = () => {
        console.log(`Unassign task ${task.id}`);
        // TODO: update Firestore to set takenBy: ""
        onClose();
    };

    const handleComplete = () => {
        console.log(`Mark task ${task.id} as completed`);
        // TODO: show new popup where the user can write how many hours they spent
    };

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-md shadow-lg max-w-[50rem] min-h-96 w-full p-6 flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex h-full">
                    <div className="w-full">
                        <h2 className="text-2xl font-semibold mb-4">{task.taskName}</h2>
                        <p><strong>Beskrivelse:</strong></p>
                        <p>{task.description}</p>
                    </div>
                    <div className="border-l px-2 border-gray-200"/>
                    <div className="w-52">
                        <strong>Kategori:</strong>
                        <p>{task.category || "Udefinert"}</p>
                        <strong>Kontaktperson:</strong>
                        {/* TODO: maybe make this a hyperlink to the persons info page if we add that? */}
                        <p>{task.contactPerson || "Ikke definert"}</p>
                        <strong>Frist:</strong>
                        <p>{task.deadline || "Ingen frist"}</p>
                        <strong>Time anslag:</strong>
                        <p>{task.hourEstimate || "Ukjent"}</p>
                        <strong>Tatt av:</strong>
                        <p>{task.takenBy || "Ingen"}</p>
                    </div>
                </div>

                <div className="mt-auto flex justify-between items-center">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                    >
                        Lukk
                    </button>

                    <div className="flex space-x-2">
                        <button
                            onClick={handleComplete}
                            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                        >
                            Marker fullført
                        </button>
                        {/* FIXME: show only if user is currently assigned to the displayed task */}
                        <button
                            onClick={handleUnassign}
                            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                            Gi ifra
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskModal;