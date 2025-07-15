import React from "react";
import LoginForm from "../components/auth/loginForm";

const LoginPage = () => {
  return (
    <div>
      <div>
        <div>
          <h2>Singsaker Studenterhjem</h2>
          <p>Logg inn på internsiden</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
};

export default LoginPage;
