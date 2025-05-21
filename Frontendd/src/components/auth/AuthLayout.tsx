import React, { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex w-full">
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex items-center mb-8">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center mr-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L20.2161 7V17L12 22L3.78394 17V7L12 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-2xl font-bold text-gray-800">XWYZ company</span>
          </div>
          {children}
        </div>
      </div>
      <div 
        className="hidden lg:block lg:w-1/2 bg-cover bg-center" 
        style={{ backgroundImage: "url('/wave-bg.svg')" }}
      >
      </div>
    </div>
  );
};

export default AuthLayout;
