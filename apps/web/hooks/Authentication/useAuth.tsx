import { useContext } from 'react';
import {
  AuthContext,
  AuthContextType,
} from '../../context/Authentication/AuthContext';

const useAuth = (): AuthContextType => {
  // Use the useContext hook to consume the AuthContext
  const context = useContext(AuthContext);
  // Ensure the context is used within a valid provider
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;
