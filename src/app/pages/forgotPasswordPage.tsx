import React from 'react';
import ForgotPasswordForm from '../components/(auth)/forgotPasswordForm';

const ForgotPasswordPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-navy-900">
      <div className="bg-white p-8 border-t-4 border-navy-500 w-full max-w-md">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-navy-900">Glemt passord</h2>
          <p className="text-gray-600 mb-6">
            Skriv inn e-postadressen din for å motta en tilbakestillingslenke.
          </p>
        </div>
        <ForgotPasswordForm />
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
