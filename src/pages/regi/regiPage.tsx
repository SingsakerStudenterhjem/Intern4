import React, { useState } from 'react';

const RegiPage = () => {
  const [formData, setFormData] = useState({
    category: '',
    dateCompleted: '',
    timeSpent: '',
    comment: '',
    pictures: [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(formData);
  };

  return (
    <div className="flex justify-center min-h-screen bg-gray-100 overflow-x-hidden">
      <div className="bg-white p-8 rounded-md shadow-md w-full mx-4 my-4 space-y-2 max-w-[80rem] min-w-0">
        <div className="space-y-1">
          <h1 className="font-bold text-2xl">Min regi</h1>
          <p className="text-gray-600 text-sm">Her kan du registrere arbeid du har utført.</p>
        </div>

        <div className="w-full flex">
          <div className="w-2/3">
            <h2 className="font-medium text-xl">Registrer regi</h2>
            <form onSubmit={handleSubmit}>
              <div>
                <button
                  type="submit"
                  className="px-2 py-1 rounded bg-blue-600 text-white disabled:opacity-50"
                >
                  Registrer
                </button>
              </div>
            </form>
          </div>
          <div className="w-1/3">
            {/* Regi overview */}
            <h2 className="font-medium text-xl">Oversikt over min regi</h2>
          </div>
        </div>
        <div className="w-full flex">
          {/* Regi log */}
          <h2 className="font-medium text-xl">Regi logg</h2>
        </div>
      </div>
    </div>
  );
};

export default RegiPage;
