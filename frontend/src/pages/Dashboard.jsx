import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import axios from '../api/axios';

const Dashboard = () => {
  const navigate = useNavigate();

  const [orgs, setOrgs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [modalError, setModalError] = useState('');
  const [modalLoading, setModalLoading] = useState(false);

  const fetchOrgs = async () => {
    try {
      const res = await axios.get('/org/my');
      setOrgs(res.data.organizations);
    } catch (err) {
      setError('Failed to load organizations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);
    try {
      await axios.post('/org/create', { name: orgName });
      setOrgName('');
      setShowCreateModal(false);
      fetchOrgs();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to create');
    } finally {
      setModalLoading(false);
    }
  };

  const handleJoin = async (e) => {
    e.preventDefault();
    setModalError('');
    setModalLoading(true);
    try {
      await axios.post('/org/join', { joinCode });
      setJoinCode('');
      setShowJoinModal(false);
      fetchOrgs();
    } catch (err) {
      setModalError(err.response?.data?.message || 'Failed to join');
    } finally {
      setModalLoading(false);
    }
  };

  const handleOrgClick = async (org) => {
    // Mark as read then navigate
    if (org.unreadCount > 0) {
      try {
        await axios.post(`/org/${org._id}/read`);
      } catch (_) {}
    }
    navigate(`/org/${org._id}`);
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-6xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white">My Organizations</h2>
            <p className="text-gray-500 text-sm mt-1">Select an organization to manage files</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setShowJoinModal(true); setModalError(''); }}
              className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition"
            >
              Join Org
            </button>
            <button
              onClick={() => { setShowCreateModal(true); setModalError(''); }}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              + Create Org
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Org Cards */}
        {loading ? (
          <div className="text-gray-500 text-center py-20">Loading...</div>
        ) : orgs.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">📂</div>
            <p className="text-gray-400 text-lg font-medium">No organizations yet</p>
            <p className="text-gray-600 text-sm mt-1">Create or join one to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {orgs.map((org) => (
              <div
                key={org._id}
                onClick={() => handleOrgClick(org)}
                className={`relative bg-gray-900 border rounded-2xl p-6 cursor-pointer transition group
                  ${org.unreadCount > 0
                    ? 'border-blue-500/60 shadow-lg shadow-blue-500/10'
                    : 'border-gray-800 hover:border-blue-500'
                  }`}
              >
                {/* Unread badge */}
                {org.unreadCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold min-w-6 h-6 px-1.5 rounded-full flex items-center justify-center shadow-lg">
                    {org.unreadCount > 99 ? '99+' : org.unreadCount}
                  </span>
                )}

                {/* Icon */}
                <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center text-2xl mb-4">
                  🏢
                </div>

                <h3 className="text-white font-semibold text-lg group-hover:text-blue-400 transition">
                  {org.name}
                </h3>

                <p className="text-gray-500 text-xs mt-1">
                  Admin: {org.admin?.name}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    {org.members?.length} member{org.members?.length !== 1 ? 's' : ''}
                  </span>
                  <span className="text-xs bg-gray-800 text-gray-400 px-2 py-1 rounded font-mono">
                    {org.joinCode}
                  </span>
                </div>

                {/* New files indicator */}
                {org.unreadCount > 0 && (
                  <div className="mt-3 text-xs text-blue-400 font-medium">
                    {org.unreadCount} new file{org.unreadCount !== 1 ? 's' : ''} 🔵
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Org Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-4">Create Organization</h3>
            {modalError && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
                {modalError}
              </div>
            )}
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                type="text"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                required
                placeholder="Organization name"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
              />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">Cancel</button>
                <button type="submit" disabled={modalLoading} className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50">
                  {modalLoading ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Org Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="text-white font-semibold text-lg mb-4">Join Organization</h3>
            {modalError && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
                {modalError}
              </div>
            )}
            <form onSubmit={handleJoin} className="space-y-4">
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                required
                placeholder="Enter join code (e.g. AB12CD34)"
                className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600 font-mono"
              />
              <div className="flex gap-3 justify-end">
                <button type="button" onClick={() => setShowJoinModal(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">Cancel</button>
                <button type="submit" disabled={modalLoading} className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50">
                  {modalLoading ? 'Joining...' : 'Join'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;