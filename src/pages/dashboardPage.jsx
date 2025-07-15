import React from "react";
import { useAuth } from "../hooks/useAuth";

const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div>
      <div>
        <h1>Dashboard</h1>
      </div>
    </div>
  );
};

export default DashboardPage;
