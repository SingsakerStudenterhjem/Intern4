import React from "react";

const TasksTable = ({tasks}) => {

    const takeTask = (taskId) => {
        // Logic to take the task, e.g., update the task in the database
        console.log(`Task ${taskId} taken`);
    }

    return (
        <table className="min-w-full bg-white">
            <thead className="border-b border-gray-300">
            <tr>
                <th className="px-4 py-2 text-left font-boldtext-gray-700">
                    Hva
                </th>
                <th className="px-4 py-2 text-left font-bold text-gray-700">
                    Kategori
                </th>
                <th className="px-4 py-2 text-left font-bold text-gray-700">
                    Kontaktperson
                </th>
                <th className="px-4 py-2 text-left font-bold text-gray-700">
                    Frist
                </th>
                <th className="px-4 py-2 text-left font-bold text-gray-700">
                    Tatt av
                </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            {tasks.map(task => (
                <tr key={task.id}>
                    <td className="px-4 py-2">{task.hva}</td>
                    <td className="px-4 py-2">{task.kategori}</td>
                    <td className="px-4 py-2">{task.kontaktperson}</td>
                    <td className="px-4 py-2">{task.frist || "Ingen frist"}</td>
                    <td className="px-4 py-2">{task.tattAv ||
                        <button onClick={() => takeTask(task.id)}
                                className="bg-gray-100 rounded py-1 px-2 hover:bg-gray-200">
                            Ta oppgave
                        </button>}
                    </td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default TasksTable;