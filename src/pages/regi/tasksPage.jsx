import React, {useEffect, useState} from "react";
import TasksTable from "../../components/regi/Tasks/TasksTable";
import TaskModal from "../../components/regi/Tasks/TaskModal";
import {useTasks} from "../../hooks/useTasks";

const TasksPage = () => {
    const [tasks, setTasks] = useState([]);
    const [selected, setSelected] = useState(null);

    // TODO: get user from auth context
    const currentUser = "Ola Nordmann";

    const {
        query,
        setQuery,
        filter,
        setFilter,
        category,
        setCategory,
        currentPage,
        paginatedTasks,
        totalPages,
        nextPage,
        prevPage,
        categories,
        filteredTasks,
    } = useTasks(tasks);

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
            description: "Dette er en eksempeloppgave for å demonstrere oppgavesystemet. Her står det diverse " +
                " informasjon om oppgaver som skal utføres av en person.",
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
        }, {
            id: "3",
            taskName: "Vaske kopper",
            category: "Kjøkken",
            description: "Ta ut av og inn i oppvaskmaskinen.",
            contactPerson: "Kjøkkensjefen",
            deadline: "Hver dag",
            hourEstimate: "0.5",
            takenBy: "Ola Nordmann",
            completed: false,
        }]);
    }, []);

    return (
        <div className="flex justify-center min-h-screen bg-gray-100 overflow-x-hidden">
            <div className="bg-white p-8 rounded-md shadow-md w-full mx-4 my-4 space-y-2 max-w-[80rem] min-w-0">
                <div className="space-y-1">
                    <h1 className="font-bold text-2xl">Oppgaver</h1>
                    <p className="text-gray-600 text-sm">
                        Her kan du se tilgjengelige oppgaver og reservere dem.
                    </p>
                </div>

                {/* Filter bar */}
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-4">
                        <input
                            type="text"
                            placeholder="Søk etter noe..."
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            className="flex-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
                        />
                        <select
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
                        >
                            {categories.map(c => (
                                <option key={c} value={c}>
                                    {c === "all" ? "Alle kategorier" : c}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="filter"
                                value="available"
                                checked={filter === "available"}
                                onChange={e => setFilter(e.target.value)}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2 text-sm text-gray-700">Ledige</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="filter"
                                value="myTasks"
                                checked={filter === "myTasks"}
                                onChange={e => setFilter(e.target.value)}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2 text-sm text-gray-700">Mine</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                name="filter"
                                value="all"
                                checked={filter === "all"}
                                onChange={e => setFilter(e.target.value)}
                                className="form-radio h-4 w-4 text-blue-600"
                            />
                            <span className="ml-2 text-sm text-gray-700">Alle</span>
                        </label>
                    </div>
                </div>


                <div className="overflow-x-auto text-sm">
                    <TasksTable
                        tasks={paginatedTasks}
                        onRowClick={task => setSelected(task)}
                        // onTakeTask={/* Insert logic call here */}
                    />
                    <div className="py-2 flex justify-between items-center">
                        <div>
                            <p className="text-gray-500 text-sm">
                                Viser {paginatedTasks.length} av {filteredTasks.length} oppgaver
                            </p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                            >
                                Forrige
                            </button>
                            <span className="text-gray-600">
                                Side {currentPage} av {totalPages}
                            </span>
                            <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
                            >
                                Neste
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            {selected && (<TaskModal
                task={selected}
                onClose={() => setSelected(null)}
                currentUser={currentUser}
            />)}
        </div>);
};

export default TasksPage;