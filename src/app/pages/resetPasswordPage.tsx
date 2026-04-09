import React from 'react';
import ResetPasswordForm from '../components/(auth)/resetPasswordForm';

const ResetPasswordPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-md shadow-md w-full max-w-md">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Nytt passord</h2>
          <p className="text-gray-600 mb-6">Skriv inn ditt nye passord.</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
