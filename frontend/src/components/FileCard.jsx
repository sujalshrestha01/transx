import { useState } from 'react';
import axios from '../api/axios';

const FileCard = ({ file, currentUser, myRole, members, categories, onDownload, onDelete, onRefresh }) => {
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [accessError, setAccessError] = useState('');

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.includes('image')) return '🖼️';
    if (mimeType.includes('pdf')) return '📄';
    if (mimeType.includes('video')) return '🎥';
    if (mimeType.includes('audio')) return '🎵';
    if (mimeType.includes('zip') || mimeType.includes('rar')) return '🗜️';
    if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
    if (mimeType.includes('sheet') || mimeType.includes('excel')) return '📊';
    return '📁';
  };

  const isAdmin = myRole === 'admin';
  const isUploader =
    file.uploadedBy?._id === currentUser?.id ||
    file.uploadedBy?._id?.toString() === currentUser?.id;
  const canDelete = isAdmin || isUploader;
  const canEditAccess = isAdmin || isUploader;

  // Build compact access summary
  const getAccessSummary = () => {
    const parts = [];

    if (file.sharedWithCategories?.length > 0) {
      const names = file.sharedWithCategories
        .map(cat => typeof cat === 'object' ? cat.name : null)
        .filter(Boolean);
      names.forEach(name => parts.push(`📂 ${name}`));
    }

    // Count individuals excluding uploader
    const individuals = (file.allowedUsers || []).filter(u => {
      const uid = typeof u === 'object' ? u._id?.toString() : u?.toString();
      return uid !== file.uploadedBy?._id?.toString();
    });

    if (individuals.length > 0) {
      parts.push(`👤 ${individuals.length} individual${individuals.length !== 1 ? 's' : ''}`);
    }

    return parts.length > 0 ? parts.join(' + ') : 'No access assigned';
  };

  // Open access modal with current values
  const openAccessModal = () => {
    const currentCategoryIds = (file.sharedWithCategories || [])
      .map(c => typeof c === 'object' ? c._id : c);
    const currentUserIds = (file.allowedUsers || [])
      .map(u => typeof u === 'object' ? u._id : u);

    setSelectedCategories(currentCategoryIds);
    setSelectedUsers(currentUserIds);
    setAccessError('');
    setShowAccessModal(true);
  };

  const toggleCategory = (catId) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const toggleUser = (userId) => {
    // Uploader cannot be removed
    const uploaderId = file.uploadedBy?._id?.toString();
    if (userId?.toString() === uploaderId) return;
    setSelectedUsers(prev =>
      prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
    );
  };

  const handleSaveAccess = async () => {
    setSaving(true);
    setAccessError('');
    try {
      await axios.put(`/files/access/${file._id}`, {
        sharedWithCategories: selectedCategories,
        allowedUsers: selectedUsers
      });
      setShowAccessModal(false);
      onRefresh();
    } catch (err) {
      setAccessError(err.response?.data?.message || 'Failed to update access');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition">
        <div className="flex items-center justify-between gap-4">

          {/* Left */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="text-2xl flex-shrink-0">{getFileIcon(file.mimeType)}</div>
            <div className="min-w-0">
              <p className="text-white text-sm font-medium truncate">{file.originalName}</p>
              <p className="text-gray-500 text-xs mt-0.5">
                {formatSize(file.size)} · Uploaded by {file.uploadedBy?.name}
              </p>
              {/* Access summary — admin and uploader only */}
              {canEditAccess && (
                <p className="text-gray-600 text-xs mt-0.5">
                  {getAccessSummary()}
                </p>
              )}
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {canEditAccess && (
              <button
                onClick={openAccessModal}
                className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition"
              >
                ✏️ Access
              </button>
            )}
            <button
              onClick={() => onDownload(file._id, file.originalName)}
              className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
            >
              Download
            </button>
            {canDelete && (
              <button
                onClick={() => onDelete(file._id)}
                className="px-3 py-1.5 text-xs bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Access Edit Modal */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

            <h3 className="text-white font-semibold text-lg mb-1">Edit Access</h3>
            <p className="text-gray-500 text-sm mb-5">
              Who can view <span className="text-blue-400 font-medium">"{file.originalName}"</span>
            </p>

            {accessError && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
                {accessError}
              </div>
            )}

            {/* Categories */}
            {categories?.length > 0 && (
              <div className="mb-5">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                  📂 Categories
                </p>
                <div className="space-y-2">
                  {categories.map((cat) => {
                    const catId = cat._id;
                    const isSelected = selectedCategories.includes(catId) ||
                      selectedCategories.includes(catId?.toString());
                    return (
                      <div
                        key={catId}
                        onClick={() => toggleCategory(catId)}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition
                          ${isSelected
                            ? 'bg-purple-600/20 border border-purple-500'
                            : 'bg-gray-800 border border-transparent hover:border-gray-600'
                          }`}
                      >
                        <div>
                          <p className="text-white text-sm font-medium">{cat.name}</p>
                          <p className="text-gray-500 text-xs">{cat.members?.length} members</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-600'}`}
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
              </div>
            )}

            {/* Individual Members */}
            <div className="mb-5">
              <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
                👤 Individual Members
              </p>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {members?.map((member) => {
                  const memberId = member.user._id;
                  const isSelected = selectedUsers.includes(memberId) ||
                    selectedUsers.includes(memberId?.toString());
                  const isFileUploader =
                    memberId?.toString() === file.uploadedBy?._id?.toString();

                  return (
                    <div
                      key={memberId}
                      onClick={() => toggleUser(memberId)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition
                        ${isFileUploader ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}
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
                            {isFileUploader && <span className="text-gray-500 ml-1">(uploader)</span>}
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
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowAccessModal(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveAccess}
                disabled={saving}
                className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Access'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileCard;