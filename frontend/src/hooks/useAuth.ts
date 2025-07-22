import { useState, useEffect, createContext, useContext } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: 'candidate' | 'hr' | 'admin') => Promise<boolean>;
  signup: (name: string, email: string, phone: string, password: string, role: 'candidate' | 'hr' | 'admin', company?: string, hrId?: string) => Promise<{ success: boolean; needsVerification?: boolean; message?: string }>;
  verifyOTP: (email: string, otp: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  sendOTP: (email: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('ai-interviewer-user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const sendOTP = async (email: string): Promise<boolean> => {
    try {
      // Simulate OTP sending
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Store OTP in localStorage for demo (in production, this would be sent via SMS/Email)
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      localStorage.setItem(`otp-${email}`, otp);
      localStorage.setItem(`otp-${email}-expires`, (Date.now() + 5 * 60 * 1000).toString());
      
      console.log(`OTP for ${email}: ${otp}`); // For demo purposes
      alert(`Demo OTP for ${email}: ${otp}`); // For demo purposes
      
      return true;
    } catch (error) {
      console.error('Send OTP error:', error);
      return false;
    }
  };

  const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const storedOTP = localStorage.getItem(`otp-${email}`);
      const expiresAt = localStorage.getItem(`otp-${email}-expires`);
      
      if (!storedOTP || !expiresAt) {
        return false;
      }
      
      if (Date.now() > parseInt(expiresAt)) {
        localStorage.removeItem(`otp-${email}`);
        localStorage.removeItem(`otp-${email}-expires`);
        return false;
      }
      
      if (storedOTP === otp) {
        // Mark user as verified
        const pendingUser = localStorage.getItem(`pending-user-${email}`);
        if (pendingUser) {
          const userData = JSON.parse(pendingUser);
          userData.isVerified = true;
          
          // Store in users database (mock)
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          users.push(userData);
          localStorage.setItem('users', JSON.stringify(users));
          
          // Clean up
          localStorage.removeItem(`pending-user-${email}`);
          localStorage.removeItem(`otp-${email}`);
          localStorage.removeItem(`otp-${email}-expires`);
          
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Verify OTP error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string, role: 'candidate' | 'hr' | 'admin'): Promise<boolean> => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check in mock database
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const user = users.find((u: User) => u.email === email && u.role === role);
      
      if (user && user.isVerified) {
        setUser(user);
        localStorage.setItem('ai-interviewer-user', JSON.stringify(user));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    name: string, 
    email: string, 
    phone: string, 
    password: string, 
    role: 'candidate' | 'hr' | 'admin',
    company?: string,
    hrId?: string
  ): Promise<{ success: boolean; needsVerification?: boolean; message?: string }> => {
    try {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if user already exists
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const existingUser = users.find((u: User) => u.email === email);
      
      if (existingUser) {
        return { success: false, message: 'User already exists with this email' };
      }
      
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name,
        phone,
        role,
        company,
        hrId,
        createdAt: new Date().toISOString(),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        isVerified: false
      };
      
      // Store as pending user
      localStorage.setItem(`pending-user-${email}`, JSON.stringify(newUser));
      
      // Send OTP
      await sendOTP(email);
      
      return { success: true, needsVerification: true };
    } catch (error) {
      console.error('Signup error:', error);
      return { success: false, message: 'Signup failed. Please try again.' };
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    try {
      if (!user) return false;
      
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedUser = { ...user, ...updates };
      
      // Update in users database
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === user.id);
      
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
        
        // Update current session
        setUser(updatedUser);
        localStorage.setItem('ai-interviewer-user', JSON.stringify(updatedUser));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ai-interviewer-user');
    // Don't remove studentInfo for candidates - keep it for future interviews
    localStorage.removeItem('jobDescription');
    localStorage.removeItem('interviewResult');
  };

  return {
    user,
    login,
    signup,
    verifyOTP,
    logout,
    isLoading,
    sendOTP,
    updateProfile,
  };
};

export { AuthContext };