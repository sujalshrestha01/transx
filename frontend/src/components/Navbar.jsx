import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link to="/dashboard" className="text-2xl font-bold text-white">
          Trans<span className="text-blue-500">X</span>
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-white text-sm font-medium">{user?.name}</p>
            <p className="text-gray-500 text-xs">{user?.email}</p>
          </div>

          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm uppercase">
            {user?.name?.charAt(0)}
          </div>

          <button
            onClick={handleLogout}
            className="text-sm text-gray-400 hover:text-red-400 transition font-medium"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;