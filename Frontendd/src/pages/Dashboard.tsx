
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center mr-3">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20.2161 7V17L12 22L3.78394 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-800">Your Logo</span>
          </div>
          <Button onClick={handleLogout} variant="ghost">Logout</Button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-800">Welcome!</h2>
            <p className="text-gray-600">
              {user?.firstName ? `Hello, ${user.firstName}! ` : ''}
              You are now logged in with {user?.email}.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-blue-700">
              This is a placeholder dashboard. In a real application, this would be populated with user-specific content and features.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
