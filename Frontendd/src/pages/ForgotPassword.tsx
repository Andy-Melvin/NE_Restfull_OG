
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import AuthLayout from '@/components/auth/AuthLayout';
import { toast } from "@/components/ui/sonner";

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateEmail = (email: string): boolean => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!email.trim()) {
      setError('Email is required');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // This would be replaced with an actual API call in a real app
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
      
      setIsSubmitted(true);
      toast.success("Reset instructions sent!");
    } catch (err) {
      console.error('Password reset error:', err);
      setError('Failed to send reset instructions. Please try again.');
      toast.error("Failed to send reset instructions");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Forgot password</h1>
        <p className="text-gray-500 mt-2">
          {isSubmitted 
            ? "We've sent you an email with instructions to reset your password." 
            : "Enter your email address and we'll send you instructions to reset your password."}
        </p>
      </div>
      
      {!isSubmitted ? (
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
                className={error ? 'border-red-500' : ''}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-hover" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send reset instructions'}
            </Button>
            
            <div className="text-center">
              <Link to="/login" className="text-primary hover:text-primary-hover text-sm font-medium">
                Back to login
              </Link>
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-blue-700 text-sm">
              If an account with that email exists, we've sent instructions to reset your password. 
              Please check your inbox and spam folder. Click the reset password link in the email to set a new password.
            </p>
          </div>
          
          <Button 
            className="w-full" 
            variant="outline" 
            onClick={() => setIsSubmitted(false)}
          >
            Try another email
          </Button>
          
          <div className="text-center">
            <Link to="/login" className="text-primary hover:text-primary-hover text-sm font-medium">
              Back to login
            </Link>
          </div>
        </div>
      )}
    </AuthLayout>
  );
};

export default ForgotPassword;
