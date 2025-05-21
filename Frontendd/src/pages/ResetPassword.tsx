
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import AuthLayout from '@/components/auth/AuthLayout';
import PasswordInput from '@/components/auth/PasswordInput';
import { toast } from "@/components/ui/sonner";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  useEffect(() => {
    if (!token) {
      toast.error("Invalid or missing reset token");
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const validatePasswords = (): boolean => {
    if (!password) {
      setError('Password is required');
      return false;
    }
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!validatePasswords()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This would be replaced with an actual API call in a real app
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      toast.success("Password reset successfully!");
      navigate('/login');
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to reset password. Please try again.');
      toast.error("Failed to reset password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Reset password</h1>
        <p className="text-gray-500 mt-2">
          Enter your new password below
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <PasswordInput
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>
            <PasswordInput
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
            />
          </div>
          
          {error && (
            <div className="bg-red-50 p-4 rounded-md">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
          
          <Button 
            type="submit" 
            className="w-full bg-primary hover:bg-primary-hover" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Resetting password...' : 'Reset password'}
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
};

export default ResetPassword;
