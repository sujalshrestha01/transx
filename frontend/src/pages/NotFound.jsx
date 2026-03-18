import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center text-center px-4">
      <div>
        <h1 className="text-7xl font-bold text-blue-500 mb-4">404</h1>
        <p className="text-white text-2xl font-semibold mb-2">Page Not Found</p>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <Link to="/dashboard" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
