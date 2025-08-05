import React from 'react';
import {BrowserRouter} from 'react-router-dom';
import {AuthProvider} from './contexts/authContext';
import AppRouter from './components/common/appRouter';
import Navbar from './components/common/Navbar';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Navbar/>
                <AppRouter/>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
