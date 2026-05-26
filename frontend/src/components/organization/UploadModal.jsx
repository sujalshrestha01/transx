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
    /* Backdrop */
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:px-4 sm:py-6"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Sheet — slides up from bottom on mobile, centered card on sm+ */}
      <div className="
        bg-gray-900 border border-gray-800 shadow-2xl flex flex-col
        w-full rounded-t-3xl sm:rounded-2xl
        max-h-[92vh] sm:max-h-[88vh]
        sm:w-full sm:max-w-lg
      ">

        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden shrink-0">
          <div className="w-10 h-1 bg-gray-700 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-800 shrink-0">
          <div>
            <h3 className="text-white font-semibold text-base sm:text-lg leading-snug">Share File</h3>
            <p className="text-gray-500 text-xs mt-0.5">Select who can access this file</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition shrink-0 ml-4"
          >
            ✕
          </button>
        </div>

        {/* File Preview */}
        <div className="mx-5 sm:mx-6 mt-4 sm:mt-5 bg-gray-800/60 border border-gray-700/50 rounded-xl px-4 py-3 flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-xl shrink-0">
            {getFileIcon(selectedFile?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-sm font-medium truncate leading-snug">{selectedFile?.name}</p>
            {formatSize(selectedFile?.size) && (
              <p className="text-gray-500 text-xs mt-0.5">{formatSize(selectedFile?.size)}</p>
            )}
          </div>
          <span className="text-xs bg-blue-600/20 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/30 font-medium shrink-0 whitespace-nowrap">
            Ready
          </span>
        </div>

        {/* Error */}
        {uploadError && (
          <div className="mx-5 sm:mx-6 mt-3 bg-red-500/10 border border-red-500/40 text-red-400 px-4 py-3 rounded-xl text-sm flex items-start gap-2 shrink-0">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <span className="leading-snug">{uploadError}</span>
          </div>
        )}

        {/* Access Selector — scrollable */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 min-h-0">
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
        <div className="px-5 sm:px-6 py-4 border-t border-gray-800 flex items-center justify-between gap-3 shrink-0">
          <p className="text-gray-500 text-xs leading-snug min-w-0">
            {totalSelected > 0 ? (
              <>
                Sharing with{' '}
                <span className="text-gray-300 font-medium">{totalSelected}</span>{' '}
                recipient{totalSelected !== 1 ? 's' : ''}
              </>
            ) : (
              'No recipients selected yet'
            )}
          </p>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-400 hover:text-white transition rounded-lg hover:bg-gray-800 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={onUpload}
              disabled={uploading || totalSelected === 0}
              className="px-4 sm:px-5 py-2 text-sm bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white rounded-xl transition disabled:opacity-40 disabled:cursor-not-allowed font-semibold shadow-lg shadow-blue-600/20 whitespace-nowrap"
            >
              {uploading ? (
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 animate-spin shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Uploading…
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