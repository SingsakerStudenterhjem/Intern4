import React from "react";

const TasksTable = () => {
    return (
        <table className="min-w-full">
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
                    Tatt av
                </th>
            </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
            <tr>
                <td className="px-4 py-2">Eksempeloppgave</td>
                <td className="px-4 py-2">Generelt</td>
                <td className="px-4 py-2">Ola Nordmann</td>
                <td className="px-4 py-2">
                    <button className="bg-gray-100 rounded p-1 hover:bg-gray-200">
                        Ta oppgave
                    </button>
                </td>
            </tr>
            <tr>
                <td className="px-4 py-2">Eksempeloppgave 2</td>
                <td className="px-4 py-2">Generelt</td>
                <td className="px-4 py-2">Ola Nordmann</td>
                <td className="px-4 py-2">
                    Tatt av Kari Nordmann
                </td>
            </tr>

            </tbody>
        </table>
    )
}

export default TasksTable;