
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import AuthLayout from '@/components/auth/AuthLayout';
import PasswordInput from '@/components/auth/PasswordInput';
import { useAuth } from '@/contexts/AuthContext';

type FormErrors = {
  email?: string;
  password?: string;
};

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        await login({ email, password });
        navigate('/dashboard');
      } catch (err) {
        console.error('Login failed:', err);
      }
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Sign in</h1>
        <p className="text-gray-500 mt-2">Please login to continue to your account.</p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className={errors.email ? 'border-red-500' : ''}
            />
            {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Checkbox 
                id="remember-me" 
                checked={rememberMe} 
                onCheckedChange={(checked) => setRememberMe(checked as boolean)} 
              />
              <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
                Keep me logged in
              </label>
            </div>
            <div className="text-sm">
              <Link to="/forgot-password" className="text-primary hover:text-primary-hover">
                Forgot password?
              </Link>
            </div>
          </div>
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-hover" 
            disabled={isLoading}
          >
            {isLoading ? 'Signing in...' : 'Sign in'}
          </Button>
        </div>
      </form>
      
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Need an account?{' '}
          <Link to="/signup" className="text-primary hover:text-primary-hover font-medium">
            Create one
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Login;
