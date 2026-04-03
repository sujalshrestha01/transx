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

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <h3 className="text-white font-semibold text-lg mb-1">Upload File</h3>
        <p className="text-gray-500 text-sm mb-5">
          Share{" "}
          <span className="text-blue-400 font-medium">
            "{selectedFile?.name}"
          </span>{" "}
          with categories or individual members
        </p>

        {uploadError && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
            {uploadError}
          </div>
        )}

        {/* Categories */}
        {categories.length > 0 && (
          <div className="mb-5">
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
              📂 Share with Categories
            </p>
            <div className="space-y-2">
              {categories.map((cat) => {
                const isSelected = selectedCategories.includes(cat._id);
                return (
                  <div
                    key={cat._id}
                    onClick={() => onToggleCategory(cat._id)}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition
                      ${isSelected
                        ? "bg-purple-600/20 border border-purple-500"
                        : "bg-gray-800 border border-transparent hover:border-gray-600"
                      }`}
                  >
                    <div>
                      <p className="text-white text-sm font-medium">{cat.name}</p>
                      <p className="text-gray-500 text-xs">{cat.members.length} members</p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                        ${isSelected ? "bg-purple-500 border-purple-500" : "border-gray-600"}`}
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
            👤 Share with Individual Members
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {members.map((member) => {
              const memberId = member.user._id;
              const isSelected = selectedUsers.includes(memberId);
              const isCurrentUser =
                memberId === currentUserId ||
                memberId?.toString() === currentUserId?.toString();

              return (
                <div
                  key={memberId}
                  onClick={() => onToggleUser(memberId)}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition
                    ${isCurrentUser ? "cursor-not-allowed opacity-60" : "cursor-pointer"}
                    ${isSelected
                      ? "bg-blue-600/20 border border-blue-500"
                      : "bg-gray-800 border border-transparent hover:border-gray-600"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase">
                      {member.user?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">
                        {member.user?.name}
                        {isCurrentUser && (
                          <span className="text-gray-500 ml-1">(you)</span>
                        )}
                      </p>
                      <p className="text-gray-500 text-xs">{member.user?.email}</p>
                    </div>
                  </div>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0
                      ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-600"}`}
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
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={onUpload}
            disabled={uploading}
            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;
