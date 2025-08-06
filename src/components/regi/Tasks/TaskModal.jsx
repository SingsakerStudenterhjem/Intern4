import React, { useState } from 'react';

const TaskModal = ({ task, onClose, currentUser }) => {
  const [isCompleting, setIsCompleting] = useState(false);
  const [hours, setHours] = useState('');

  if (!task) return null;

  const handleUnassign = () => {
    console.log(`Unassign task ${task.id}`);
    // TODO: update Firestore to set takenBy: ""
    onClose();
  };

  const startComplete = () => {
    setIsCompleting(true);
  };

  const cancelComplete = () => {
    setIsCompleting(false);
    setHours('');
  };

  const confirmComplete = () => {
    console.log(`Task ${task.id} completed in ${hours}h`);
    // TODO: update Firestore: set completed=true and hoursSpent=hours, completedAt=current datetime and maybe
    //  completedBy=user who presse the complete button
    onClose();
  };

  const isAssignedToCurrentUser = task.takenBy === currentUser;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-md shadow-lg w-full max-w-full md:max-w-[50rem] min-h-96 p-6 flex flex-col mx-2 md:mx-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col md:flex-row h-full">
          <div className="w-full">
            <h2 className="text-2xl font-semibold mb-4">{task.taskName}</h2>
            <p>
              <strong>Beskrivelse:</strong>
            </p>
            <p>{task.description}</p>
          </div>
          <div className="border-t md:border-t-0 md:border-l px-2 border-gray-200 my-4 md:my-0" />
          <div className="w-52">
            <strong>Kategori:</strong>
            <p>{task.category || 'Udefinert'}</p>
            <strong>Kontaktperson:</strong>
            {/* TODO: maybe make this a hyperlink to the persons info page if we add that? */}
            <p>{task.contactPerson || 'Ikke definert'}</p>
            <strong>Frist:</strong>
            <p>{task.deadline || 'Ingen frist'}</p>
            <strong>Time anslag:</strong>
            <p>{task.hourEstimate || 'Ukjent'}</p>
            <strong>Tatt av:</strong>
            <p>{task.takenBy || 'Ingen'}</p>
          </div>
        </div>

        {/* bottom area */}
        <div className="mt-4 md:mt-auto">
          {isCompleting ? (
            <div className="space-y-3">
              <label className="block">
                <span className="font-medium">Antall timer brukt:</span>
                <input
                  type="number"
                  min="0"
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="mt-1 w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring"
                  placeholder="F.eks. 2"
                />
              </label>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={cancelComplete}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
                >
                  Avbryt
                </button>
                <button
                  onClick={confirmComplete}
                  disabled={!hours}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  Bekreft
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
              >
                Lukk
              </button>
              <div className="flex gap-2">
                {isAssignedToCurrentUser && !task.completed && (
                  <>
                    <button
                      onClick={startComplete}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Marker fullført
                    </button>
                    <button
                      onClick={handleUnassign}
                      className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      Gi vekk
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskModal;
