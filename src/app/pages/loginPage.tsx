import React from 'react';
import LoginForm from '../components/(auth)/loginForm';

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-navy-900">
      <div className="bg-white p-8 border-t-4 border-navy-500 w-full max-w-md">
        <div>
          <h2 className="text-2xl font-bold mb-2 text-navy-900">Singsaker Studenterhjem</h2>
          <p className="text-gray-600 mb-6">Logg inn på internsiden</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
