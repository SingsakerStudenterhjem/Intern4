import React, {useEffect, useState} from "react";
import TasksTable from "../../components/regi/Tasks/TasksTable";
import TaskModal from "../../components/regi/Tasks/TaskModal";

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [query, setQuery] = useState("");
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
        setTasks([
            {
                id: "1",
                taskName: "Eksempeloppgave",
                category: "Generelt",
                description: "Dette er en eksempeloppgave for å demonstrere oppgavesystemet. Her står det diverse informasjon om oppgaver som skal utføres av en person.",
                contactPerson: "Ola Nordmann",
                deadline: "01-10-2025",
                hourEstimate: "3",
                takenBy: "",
                completed: false,
            },
            {
                id: "2",
                taskName: "Eksempeloppgave 2",
                category: "Dataarbeid",
                description: "En annen eksempeloppgaved.",
                contactPerson: "Kari Nordmann",
                deadline: "",
                hourEstimate: "",
                takenBy: "Kari Nordmann",
                completed: true,
            }
        ]);
    }, []);

    const filtered = tasks.filter(t => {
        const q = query.toLowerCase();
        return ["taskName", "category", "contactPerson", "deadline", "takenBy"]
            .some(key => String(t[key] || "")
                .toLowerCase()
                .includes(q)
            );
    });

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
                <div>
                    <input
                        type="text"
                        placeholder="Søk etter noe..."
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
                    />
                </div>

                <div className="overflow-x-auto text-sm">
                    <TasksTable
                        tasks={filtered}
                        onRowClick={task => setSelected(task)}
                    />
                    <p className="text-gray-500 py-2 text-right">Antall ledige oppgaver: {availableCount}</p>
                </div>
            </div>
            {selected && (
                <TaskModal
                    task={selected}
                    onClose={() => setSelected(null)}
                />
            )}
        </div>
    );
};

export default TasksPage;