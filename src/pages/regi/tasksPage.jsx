import React, {useEffect, useState} from "react";
import TasksTable from "../../components/regi/Tasks/TasksTable";
import TaskModal from "../../components/regi/Tasks/TaskModal";

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [query, setQuery] = useState("");
    const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);
    const [selected, setSelected] = useState(null);

    useEffect(() => {
        /*
                const fetchTasks = async () => {
                    const snapshot = await getDocs(collection(db, "tasks"));
                    setTasks(snapshot.docs.map(doc => ({id: doc.id, ...doc.data()})));
                };
                fetchTasks();
        */
        // Mock data for now.
        setTasks([{
            id: "1",
            taskName: "Eksempeloppgave",
            category: "Generelt",
            description: "Dette er en eksempeloppgave for å demonstrere oppgavesystemet. Her står det diverse informasjon om oppgaver som skal utføres av en person.",
            contactPerson: "Ola Nordmann",
            deadline: "01-10-2025",
            hourEstimate: "3",
            takenBy: "",
            completed: false,
        }, {
            id: "2",
            taskName: "Eksempeloppgave 2",
            category: "Dataarbeid",
            description: "En annen eksempeloppgaved.",
            contactPerson: "Kari Nordmann",
            deadline: "",
            hourEstimate: "",
            takenBy: "Kari Nordmann",
            completed: true,
        }]);
    }, []);

    const filtered = tasks
        .filter(t => {
            const q = query.toLowerCase();
            return ["taskName", "category", "contactPerson", "deadline", "takenBy"]
                .some(key => String(t[key] || "")
                    .toLowerCase()
                    .includes(q));
        })
        .filter(t => showOnlyAvailable ? !t.takenBy && !t.completed : true);

    const availableCount = tasks.filter(t => !t.takenBy && !t.completed).length;

    return (
        <div className="flex min-h-screen bg-gray-100 overflow-x-hidden">
            <div className="bg-white p-8 rounded-md shadow-md w-full mx-4 my-4 space-y-2 max-w-full min-w-0">
                <div className="space-y-1">
                    <h1 className="font-bold text-2xl">Oppgaver</h1>
                    <p className="text-gray-600 text-sm">
                        Her kan du se tilgjengelige oppgaver og reservere dem.
                    </p>
                </div>

                {/* Filter bar */}
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                    <input
                        type="text"
                        placeholder="Søk etter noe..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="flex-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
                    />

                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            checked={showOnlyAvailable}
                            onChange={e => setShowOnlyAvailable(e.target.checked)}
                            className="form-checkbox h-4 w-4 text-blue-600"
                        />
                        <span className="ml-2 text-sm text-gray-700">Vis kun ledige oppgaver</span>
                    </label>
                </div>

                <div className="overflow-x-auto text-sm">
                    <TasksTable
                        tasks={filtered}
                        onRowClick={task => setSelected(task)}
                    />
                    <div className="py-2">
                        <p className="text-gray-500 text-right">Antall ledige oppgaver: {availableCount}</p>
                        <p className="text-gray-500 text-right">Sum antall oppgaver: {tasks.length}</p>
                    </div>
                </div>
            </div>
            {selected && (<TaskModal
                task={selected}
                onClose={() => setSelected(null)}
            />)}
        </div>);
};

export default TasksPage;