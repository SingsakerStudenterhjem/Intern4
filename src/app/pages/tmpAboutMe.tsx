import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

const AboutMePage = () => {
  const { user, loading } = useAuth();

  if (loading || !user) return null;

  return (
    <div>
      <div>
        <h1>About me</h1>
      </div>
      <h2>My name is {user.name}</h2>
      <h2>My role is {user.role}</h2>
    </div>
  );
};

export default AboutMePage;
