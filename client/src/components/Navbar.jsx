import { LogOut, LayoutDashboard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useTasks from '../hooks/useTasks';
import './Navbar.css';

function initials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join('');
}

export default function Navbar() {
  const { user, logout } = useAuth();
  const { resetTasks } = useTasks();
  const navigate = useNavigate();

  const handleLogout = () => {
    resetTasks();
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <div className="navbar__inner">
        <div className="navbar__brand">
          <span className="navbar__mark" aria-hidden="true">
            <LayoutDashboard size={16} />
          </span>
          <span>TaskFlow</span>
        </div>
        <div className="navbar__user">
          <span className="navbar__avatar" aria-hidden="true">
            {initials(user?.name)}
          </span>
          <span className="navbar__name">{user?.name}</span>
          <button type="button" className="navbar__logout" onClick={handleLogout} aria-label="Log out">
            <LogOut size={16} />
            <span>Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}
