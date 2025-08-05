import React from "react";
import TasksTable from "../../components/regi/Tasks/TasksTable";

const TasksPage = () => {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-md shadow-md w-full m-4 space-y-2">
                <div className="space-y-1">
                    <h1 className="font-bold text-2xl">Oppgaver</h1>
                    <p className="text-gray-600 mb-6 text-sm">
                        Her kan du se tilgjengelige oppgaver og reservere dem.
                    </p>
                </div>
                <div className="overflow-x-auto">
                    <TasksTable/>
                </div>
            </div>
        </div>
    );
};

export default TasksPage;