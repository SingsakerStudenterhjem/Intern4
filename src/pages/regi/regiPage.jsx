import React from 'react';

const RegiPage = () => {
  return (
    <div className="flex justify-center min-h-screen bg-gray-100 overflow-x-hidden">
      <div className="bg-white p-8 rounded-md shadow-md w-full mx-4 my-4 space-y-2 max-w-[80rem] min-w-0">
        <div className="space-y-1">
          <h1 className="font-bold text-2xl">Min regi</h1>
          <p className="text-gray-600 text-sm">Her kan du registrere arbeid du har utført.</p>
        </div>

        {/* Log regi form */}
        <form></form>
      </div>
    </div>
  );
};

export default RegiPage;
