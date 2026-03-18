const FileCard = ({ file, currentUser, myRole, onDownload, onDelete }) => {
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

  return (
    <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 flex items-center justify-between gap-4 transition">

      {/* Left — file info */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="text-2xl flex-shrink-0">
          {getFileIcon(file.mimeType)}
        </div>
        <div className="min-w-0">
          <p className="text-white text-sm font-medium truncate">
            {file.originalName}
          </p>
          <p className="text-gray-500 text-xs mt-0.5">
            {formatSize(file.size)} · Uploaded by {file.uploadedBy?.name}
          </p>
          {/* Show who has access — admin only */}
          {isAdmin && file.allowedUsers && (
            <p className="text-gray-600 text-xs mt-0.5">
              Access: {file.allowedUsers.length} member{file.allowedUsers.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
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
  );
};

export default FileCard;