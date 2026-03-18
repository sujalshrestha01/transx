import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import FileCard from '../components/FileCard';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';

const Organization = () => {
  const { orgId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [files, setFiles] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('files');
  const [myRole, setMyRole] = useState('member');

  // Upload state
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  // Role management state
  const [updatingRole, setUpdatingRole] = useState(null);
  const [roleSuccess, setRoleSuccess] = useState('');

  const [showUploadModal, setShowUploadModal] = useState(false);
const [selectedFile, setSelectedFile] = useState(null);
const [selectedUsers, setSelectedUsers] = useState([]);

const fetchAll = async () => {
  try {
    setLoading(true);
    setError('');

    const [orgsRes, filesRes, membersRes] = await Promise.all([
      axios.get('/org/my'),
      axios.get(`/files/org/${orgId}`),
      axios.get(`/org/${orgId}/members`)
    ]);

    const currentOrg = orgsRes.data.organizations.find(
      (o) => o._id.toString() === orgId.toString()
    );

    if (!currentOrg) {
      setError('Organization not found or you are not a member');
      return;
    }

    setOrg(currentOrg);
    setFiles(filesRes.data.files);
    setMembers(membersRes.data.members);

    // Fix: get user from localStorage directly in case context not loaded yet
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const currentUserId = user?.id || storedUser?.id;

    const myMember = membersRes.data.members.find(
      (m) => m.user._id.toString() === currentUserId?.toString()
    );
    if (myMember) setMyRole(myMember.role);

  } catch (err) {
    console.error('fetchAll error:', err);
    setError(err.response?.data?.message || 'Failed to load organization data');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
  if (orgId) fetchAll();
}, [orgId]);

  // Upload file
// Step 1 — open modal when file is selected
const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  setSelectedFile(file);
  setSelectedUsers([user.id]); // uploader always selected
  setUploadError('');
  setShowUploadModal(true);
  if (fileInputRef.current) fileInputRef.current.value = '';
};

// Step 2 — toggle member selection in modal
const toggleUserSelection = (memberId) => {
  if (memberId === user.id) return; // uploader cannot deselect themselves
  setSelectedUsers((prev) =>
    prev.includes(memberId)
      ? prev.filter((id) => id !== memberId)
      : [...prev, memberId]
  );
};

// Step 3 — actual upload with selected users
const handleUpload = async () => {
  if (!selectedFile) return;
  setUploadError('');
  setUploadSuccess('');
  setUploading(true);

  const formData = new FormData();
  formData.append('file', selectedFile);
  formData.append('allowedUsers', JSON.stringify(selectedUsers));

  try {
    await axios.post(`/files/upload/${orgId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    setUploadSuccess(`"${selectedFile.name}" uploaded successfully!`);
    setShowUploadModal(false);
    setSelectedFile(null);
    setSelectedUsers([]);
    fetchAll();
  } catch (err) {
    setUploadError(err.response?.data?.message || 'Upload failed');
  } finally {
    setUploading(false);
  }
};

  // Download file
  const handleDownload = async (fileId, fileName) => {
    try {
      const res = await axios.get(`/files/download/${fileId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Download failed');
    }
  };

  // Delete file
  const handleDelete = async (fileId) => {
    if (!confirm('Are you sure you want to delete this file?')) return;
    try {
      await axios.delete(`/files/delete/${fileId}`);
      setFiles(files.filter(f => f._id !== fileId));
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  // Update member role
  const handleRoleChange = async (userId, newRole) => {
    setUpdatingRole(userId);
    setRoleSuccess('');
    try {
      await axios.put(`/org/${orgId}/role`, { userId, role: newRole });
      setRoleSuccess('Role updated successfully!');
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    } finally {
      setUpdatingRole(null);
    }
  };

  // Remove member
  const handleRemoveMember = async (userId) => {
    if (!confirm('Remove this member from the organization?')) return;
    try {
      await axios.delete(`/org/${orgId}/remove/${userId}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const isAdminUser = myRole === 'admin';
  const canUpload = ['admin', 'uploader'].includes(myRole);

  const getRoleBadge = (role) => {
    const styles = {
      admin: 'bg-blue-600/20 text-blue-400',
      uploader: 'bg-green-600/20 text-green-400',
      member: 'bg-gray-800 text-gray-400'
    };
    return styles[role] || styles.member;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex items-center justify-center py-32 text-gray-500">
          Loading...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Navbar />
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="text-sm text-blue-500 hover:underline"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Tabs available based on role
  const tabs = ['files', 'members', ...(isAdminUser ? ['settings'] : [])];

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-500 hover:text-white text-sm transition mb-2 flex items-center gap-1"
            >
              ← Dashboard
            </button>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white">{org?.name}</h2>
              <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${getRoleBadge(myRole)}`}>
                {myRole}
              </span>
            </div>
            <p className="text-gray-500 text-xs mt-1 font-mono">
              Join Code: <span className="text-blue-400">{org?.joinCode}</span>
            </p>
          </div>

          {/* Upload Button — only for admin and uploader */}
          {canUpload && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className={`px-5 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition
                  ${uploading
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
              >
                {uploading ? 'Uploading...' : '+ Upload File'}
              </label>
            </div>
          )}
        </div>

        {/* Upload feedback */}
        {uploadSuccess && (
          <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-3 rounded-lg mb-5 text-sm">
            ✅ {uploadSuccess}
          </div>
        )}
        {uploadError && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-5 text-sm">
            ❌ {uploadError}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-900 p-1 rounded-xl mb-6 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-sm font-medium rounded-lg transition capitalize
                ${activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
                }`}
            >
              {tab === 'files' && `Files (${files.length})`}
              {tab === 'members' && `Members (${members.length})`}
              {tab === 'settings' && '⚙️ Settings'}
            </button>
          ))}
        </div>

        {/* ── FILES TAB ── */}
        {activeTab === 'files' && (
          <div className="space-y-3">
            {!canUpload && (
              <div className="bg-yellow-500/10 border border-yellow-600 text-yellow-400 px-4 py-3 rounded-lg text-sm mb-4">
                ⚠️ You have <strong>member</strong> role. Ask your admin to grant you uploader access to upload files.
              </div>
            )}
            {files.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-5xl mb-4">🔒</div>
                <p className="text-gray-400 font-medium">No files yet</p>
                <p className="text-gray-600 text-sm mt-1">
                  {canUpload ? 'Upload a file to get started' : 'No files have been shared with you yet'}
                </p>
              </div>
            ) : (
              files.map((file) => (
                <FileCard
                  key={file._id}
                  file={file}
                  currentUser={user}
                  myRole={myRole}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))
            )}
          </div>
        )}

        {/* ── MEMBERS TAB ── */}
        {activeTab === 'members' && (
          <div className="space-y-3">
            {members.map((member) => (
              <div
                key={member._id}
                className="bg-gray-900 border border-gray-800 rounded-xl px-5 py-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm uppercase">
                    {member.user?.name?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{member.user?.name}</p>
                    <p className="text-gray-500 text-xs">{member.user?.email}</p>
                  </div>
                </div>
                <span className={`text-xs px-3 py-1 rounded-full capitalize font-medium ${getRoleBadge(member.role)}`}>
                  {member.role}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* ── SETTINGS TAB (Admin only) ── */}
        {activeTab === 'settings' && isAdminUser && (
          <div className="space-y-4">

            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold text-lg mb-1">Member Roles</h3>
              <p className="text-gray-500 text-sm mb-6">
                Manage what each member can do inside this organization.
              </p>

              {roleSuccess && (
                <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-2 rounded-lg mb-5 text-sm">
                  ✅ {roleSuccess}
                </div>
              )}

              {/* Role legend */}
              <div className="flex gap-3 flex-wrap mb-6">
                {[
                  { role: 'member', desc: 'Can only view files shared with them' },
                  { role: 'uploader', desc: 'Can upload and share files' },
                  { role: 'admin', desc: 'Full access and control' }
                ].map(({ role, desc }) => (
                  <div key={role} className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
                    <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${getRoleBadge(role)}`}>
                      {role}
                    </span>
                    <span className="text-gray-400 text-xs">{desc}</span>
                  </div>
                ))}
              </div>

              {/* Member list with role controls */}
              <div className="space-y-3">
                {members.map((member) => {
                  const isCurrentUser = member.user._id === user.id ||
                    member.user._id.toString() === user.id;

                  return (
                    <div
                      key={member._id}
                      className="flex items-center justify-between bg-gray-800 rounded-xl px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm uppercase">
                          {member.user?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white text-sm font-medium">
                            {member.user?.name}
                            {isCurrentUser && <span className="text-gray-500 ml-1">(you)</span>}
                          </p>
                          <p className="text-gray-500 text-xs">{member.user?.email}</p>
                        </div>
                      </div>

                      {isCurrentUser ? (
                        <span className={`text-xs px-3 py-1 rounded-full capitalize font-medium ${getRoleBadge(member.role)}`}>
                          {member.role}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          {/* Role selector */}
                          <select
                            value={member.role}
                            onChange={(e) => handleRoleChange(member.user._id, e.target.value)}
                            disabled={updatingRole === member.user._id}
                            className="bg-gray-700 text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                          >
                            <option value="member">member</option>
                            <option value="uploader">uploader</option>
                            <option value="admin">admin</option>
                          </select>

                          {/* Remove button */}
                          <button
                            onClick={() => handleRemoveMember(member.user._id)}
                            className="text-xs bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg transition"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Org Info */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Organization Info</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Organization Name</span>
                  <span className="text-white font-medium">{org?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Join Code</span>
                  <span className="text-blue-400 font-mono font-medium">{org?.joinCode}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Members</span>
                  <span className="text-white font-medium">{members.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Files</span>
                  <span className="text-white font-medium">{files.length}</span>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* Upload Modal */}
{showUploadModal && (
  <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
    <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">

      <h3 className="text-white font-semibold text-lg mb-1">Upload File</h3>
      <p className="text-gray-500 text-sm mb-5">
        Select members who can view{' '}
        <span className="text-blue-400 font-medium">"{selectedFile?.name}"</span>
      </p>

      {uploadError && (
        <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
          {uploadError}
        </div>
      )}

      {/* Member list */}
      <div className="space-y-2 max-h-60 overflow-y-auto mb-5">
        {members.map((member) => {
          const memberId = member.user._id;
          const isSelected = selectedUsers.includes(memberId);
          const isCurrentUser = memberId === user.id || memberId?.toString() === user.id;

          return (
            <div
              key={memberId}
              onClick={() => toggleUserSelection(memberId)}
              className={`flex items-center justify-between px-4 py-3 rounded-xl transition
                ${isCurrentUser ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
                ${isSelected
                  ? 'bg-blue-600/20 border border-blue-500'
                  : 'bg-gray-800 border border-transparent hover:border-gray-600'
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                  {member.user?.name?.charAt(0)}
                </div>
                <div>
                  <p className="text-white text-sm font-medium">
                    {member.user?.name}
                    {isCurrentUser && <span className="text-gray-500 ml-1">(you)</span>}
                  </p>
                  <p className="text-gray-500 text-xs">{member.user?.email}</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                ${isSelected ? 'bg-blue-500 border-blue-500' : 'border-gray-600'}`}
              >
                {isSelected && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-gray-600 text-xs mb-4">
        {selectedUsers.length} member{selectedUsers.length !== 1 ? 's' : ''} selected
      </p>

      <div className="flex gap-3 justify-end">
        <button
          onClick={() => { setShowUploadModal(false); setSelectedFile(null); }}
          className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={uploading}
          className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
        >
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default Organization;