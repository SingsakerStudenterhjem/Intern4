import LoginForm from '../components/LoginForm';

const LoginPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-md shadow-md w-full max-w-md">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Singsaker Studenterhjem</h2>
          <p className="text-gray-600 mb-6">Logg inn på internsiden</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
