import React from "react";

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
    const ext = name?.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) return "🖼️";
    if (ext === "pdf") return "📄";
    if (["mp4", "mov", "avi"].includes(ext)) return "🎥";
    if (["mp3", "wav"].includes(ext)) return "🎵";
    if (["zip", "rar"].includes(ext)) return "🗜️";
    if (["doc", "docx"].includes(ext)) return "📝";
    if (["xls", "xlsx", "ppt", "pptx"].includes(ext)) return "📊";
    return "📁";
  };

  const formatSize = (bytes) => {
    if (!bytes) return "";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getMembersFromSelectedCategories = () => {
    const memberIds = new Set();
    categories?.forEach((cat) => {
      const isCatSelected =
        selectedCategories.includes(cat._id) ||
        selectedCategories.includes(cat._id?.toString());

      if (isCatSelected) {
        cat.members?.forEach((m) => {
          const id = m._id || m;
          memberIds.add(id?.toString());
        });
      }
    });
    return memberIds;
  };

  const categoryMemberIds = getMembersFromSelectedCategories();

  const totalSelected = (() => {
    const directUsers = new Set(
      selectedUsers
        .filter(
          (id) =>
            id !== currentUserId &&
            id?.toString() !== currentUserId?.toString()
        )
        .map((id) => id?.toString())
    );
    categoryMemberIds.forEach((id) => directUsers.add(id));
    return directUsers.size;
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
          <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-xl flex-shrink-0">
            {getFileIcon(selectedFile?.name)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-sm font-medium truncate">
              {selectedFile?.name}
            </p>
            <p className="text-gray-500 text-xs mt-0.5">
              {formatSize(selectedFile?.size)}
            </p>
          </div>
          <div className="ml-auto flex-shrink-0">
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

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-5">
          {/* Categories Section */}
          {categories?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                  Categories
                </span>
                <div className="flex-1 h-px bg-gray-800" />
                <span className="text-gray-600 text-xs">
                  {selectedCategories.length} selected
                </span>
              </div>

              <div className="space-y-2">
                {categories.map((cat) => {
                  const isSelected =
                    selectedCategories.includes(cat._id) ||
                    selectedCategories.includes(cat._id?.toString());
                  return (
                    <div
                      key={cat._id}
                      onClick={() => onToggleCategory(cat._id)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition border ${
                        isSelected
                          ? "bg-purple-600/10 border-purple-500/60"
                          : "bg-gray-800/50 border-gray-700/50 hover:border-gray-600"
                      }`}
                    >
                      {/* Checkbox */}
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${
                          isSelected
                            ? "bg-purple-500 border-purple-500"
                            : "border-gray-600"
                        }`}
                      >
                        {isSelected && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center text-sm flex-shrink-0">
                        🗂️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium">
                          {cat.name}
                        </p>
                        {cat.description && (
                          <p className="text-gray-500 text-xs truncate">
                            {cat.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${
                          isSelected
                            ? "bg-purple-500/20 text-purple-300"
                            : "bg-gray-700 text-gray-400"
                        }`}
                      >
                        {cat.members?.length || 0} members
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Individual Members Section */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider">
                Individual Members
              </span>
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-gray-600 text-xs">
                {
                  selectedUsers.filter(
                    (id) =>
                      id !== currentUserId &&
                      id?.toString() !== currentUserId?.toString()
                  ).length
                }{" "}
                selected
              </span>
            </div>

            <div className="space-y-2">
              {members?.map((member) => {
                const memberId = member.user._id;
                const isSelected =
                  selectedUsers.includes(memberId) ||
                  selectedUsers.includes(memberId?.toString());
                const isCurrentUser =
                  memberId === currentUserId ||
                  memberId?.toString() === currentUserId?.toString();
                const isViaCategory = categoryMemberIds.has(
                  memberId?.toString()
                );

                return (
                  <div
                    key={memberId}
                    onClick={() => !isCurrentUser && onToggleUser(memberId)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition border ${
                      isCurrentUser
                        ? "opacity-50 cursor-not-allowed bg-gray-800/30 border-gray-800"
                        : isViaCategory
                        ? "bg-green-600/10 border-green-500/40 cursor-pointer"
                        : isSelected
                        ? "bg-blue-600/10 border-blue-500/60 cursor-pointer"
                        : "bg-gray-800/50 border-gray-700/50 hover:border-gray-600 cursor-pointer"
                    }`}
                  >
                    {!isCurrentUser && (
                      <div
                        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition ${
                          isViaCategory
                            ? "bg-green-500 border-green-500"
                            : isSelected
                            ? "bg-blue-500 border-blue-500"
                            : "border-gray-600"
                        }`}
                      >
                        {(isSelected || isViaCategory) && (
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    )}
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase flex-shrink-0">
                      {member.user?.name?.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium">
                        {member.user?.name}
                        {isCurrentUser && (
                          <span className="text-gray-500 text-xs ml-1">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {member.user?.email}
                      </p>
                    </div>
                    {isViaCategory && (
                      <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full flex-shrink-0 border border-green-500/30">
                        via category
                      </span>
                    )}
                    <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full capitalize flex-shrink-0">
                      {member.role}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800 flex items-center justify-between gap-4">
          <p className="text-gray-500 text-xs">
            {totalSelected > 0
              ? `Sharing with ${totalSelected} recipient${
                  totalSelected !== 1 ? "s" : ""
                }`
              : "No recipients selected yet"}
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
                  <svg
                    className="w-4 h-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Uploading...
                </span>
              ) : (
                "Upload & Share →"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadModal;