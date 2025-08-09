import React from 'react';

const TasksTable = ({ tasks, onRowClick, onTakeTask }) => {
  return (
    <table className="min-w-full bg-white">
      <thead className="border-b border-gray-300">
        <tr>
          <th className="px-4 py-2 text-left font-bold text-gray-700">Hva</th>
          <th className="px-4 py-2 text-left font-bold text-gray-700">Kategori</th>
          <th className="px-4 py-2 text-left font-bold text-gray-700">Kontaktperson</th>
          <th className="px-4 py-2 text-left font-bold text-gray-700">Frist</th>
          <th className="px-4 py-2 text-left font-bold text-gray-700">Tatt av</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {tasks.map((task) => (
          <tr
            key={task.id}
            onClick={() => onRowClick && onRowClick(task)}
            className="cursor-pointer hover:bg-gray-50"
          >
            <td className="px-4 py-2 w-1/3">{task.taskName}</td>
            <td className="px-4 py-2 w-1/6">{task.category}</td>
            <td className="px-4 py-2 w-1/5">{task.contactPerson}</td>
            <td className="px-4 py-2 w-1/10">{task.deadline || 'Ingen frist'}</td>
            <td className="px-4 py-2 w-1/5">
              {task.takenBy ? (
                task.takenBy
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTakeTask(task.id);
                  }}
                  className="bg-gray-100 rounded py-1 px-2 hover:bg-gray-200"
                >
                  Ta oppgave
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default TasksTable;
