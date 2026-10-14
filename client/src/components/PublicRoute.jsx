import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Loader } from './Loader';

export default function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <Loader label="Checking your session" />;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
}
