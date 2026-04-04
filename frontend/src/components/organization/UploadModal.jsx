import AccessSelector from './AccessSelector';

const UploadModal = ({
  show,
  selectedFile,
  categories,
  members,
  selectedCategories,
  selectedUsers,
  uploadError,
  uploading,
  currentUserId,
  onToggleCategory,
  onToggleUser,
  onUpload,
  onClose,
}) => {
  if (!show || !selectedFile) return null;

  const getFileIcon = (name) => {
    const ext = name?.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '🖼️';
    if (ext === 'pdf') return '📄';
    if (['mp4', 'mov', 'avi'].includes(ext)) return '🎥';
    if (['mp3', 'wav'].includes(ext)) return '🎵';
    if (['zip', 'rar'].includes(ext)) return '🗜️';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx', 'ppt', 'pptx'].includes(ext)) return '📊';
    return '📁';
  };

  const formatSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Count total unique recipients
  const categoryMemberIds = new Set();
  categories?.forEach((cat) => {
    if (
      selectedCategories.includes(cat._id) ||
      selectedCategories.includes(cat._id?.toString())
    ) {
      cat.members?.forEach((m) => {
        const id = m._id || m;
        categoryMemberIds.add(id?.toString());
      });
    }
  });

  const totalSelected = (() => {
    const direct = new Set(
      (selectedUsers || [])
        .filter(
          (id) =>
            id !== currentUserId &&
            id?.toString() !== currentUserId?.toString()
        )
        .map((id) => id?.toString())
    );
    categoryMemberIds.forEach((id) => direct.add(id));
    return direct.size;
  })();

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-800 flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-800">
          <div>
            <h3 className="text-white font-semibold text-lg">Share File</h3>
            <p className="text-gray-500 text-xs mt-0.5">
              Select who can access this file
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition text-lg"
          >
            ✕
          </button>
        </div>

        {/* File Preview */}
        <div className="mx-6 mt-5 bg-gray-800 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-700">
          <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-xl shrink-0">
            {getFileIcon(selectedFile?.name)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">{selectedFile?.name}</p>
            <p className="text-gray-500 text-xs mt-0.5">{formatSize(selectedFile?.size)}</p>
          </div>
          <div className="ml-auto shrink-0">
            <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-1 rounded-full border border-blue-500/30">
              Ready to upload
            </span>
          </div>
        </div>

        {/* Error */}
        {uploadError && (
          <div className="mx-6 mt-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
            <span>⚠️</span> {uploadError}
          </div>
        )}

        {/* Access Selector */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <AccessSelector
            categories={categories}
            members={members}
            selectedCategories={selectedCategories}
            selectedUsers={selectedUsers}
            currentUserId={currentUserId}
            uploaderId={currentUserId}
            onToggleCategory={onToggleCategory}
            onToggleUser={onToggleUser}
          />
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            {totalSelected > 0
              ? `Sharing with ${totalSelected} recipient${totalSelected !== 1 ? 's' : ''}`
              : 'No recipients selected yet'
            }
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={onUpload}
              disabled={uploading || totalSelected === 0}
              className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload & Share →'
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default UploadModal;