import React, {useEffect, useState} from "react";
import TasksTable from "../../components/regi/Tasks/TasksTable";

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [query, setQuery] = useState("");

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
                hva: "Eksempeloppgave",
                kategori: "Generelt",
                kontaktperson: "Ola Nordmann",
                tattAv: ""
            },
            {
                id: "2",
                hva: "Eksempeloppgave 2",
                kategori: "Dataarbeid",
                kontaktperson: "Kari Nordmann",
                tattAv: "Kari Nordmann"
            }
        ]);
    }, []);

    const filtered = tasks.filter(t => {
        const q = query.toLowerCase();
        return ['hva', 'kategori', 'kontaktperson', 'tattAv']
            .some(key => String(t[key] || '')
                .toLowerCase()
                .includes(q)
            );
    });

    return (
        <div className="flex min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-md shadow-md w-full m-4 space-y-2">
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

                <div className="overflow-x-auto">
                    <TasksTable tasks={filtered}/>
                </div>
            </div>
        </div>
    );
};

export default TasksPage;