import { useState, useMemo } from "react";
import axios from "../api/axios";
import AccessSelector from "./organization/AccessSelector";

const FileCard = ({
  file,
  currentUser,
  myRole,
  members,
  categories,
  onDownload,
  onDelete,
  onRefresh,
}) => {
  const [showAccessModal, setShowAccessModal] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [saving, setSaving] = useState(false);
  const [accessError, setAccessError] = useState("");

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const getFileIcon = (mimeType) => {
    if (!mimeType) return "📁";
    if (mimeType.includes("image")) return "🖼️";
    if (mimeType.includes("pdf")) return "📄";
    if (mimeType.includes("video")) return "🎥";
    if (mimeType.includes("audio")) return "🎵";
    if (mimeType.includes("zip") || mimeType.includes("rar")) return "🗜️";
    if (mimeType.includes("word") || mimeType.includes("document")) return "📝";
    if (mimeType.includes("sheet") || mimeType.includes("excel")) return "📊";
    return "📁";
  };

  const isAdmin = myRole === "admin";
  const isUploader =
    file.uploadedBy?._id === currentUser?.id ||
    file.uploadedBy?._id?.toString() === currentUser?.id;
  const canDelete = isAdmin || isUploader;
  const canEditAccess = isAdmin || isUploader;
  const uploaderId = file.uploadedBy?._id?.toString();

  // Access summary shown on file card
  const getAccessSummary = () => {
    const parts = [];
    if (file.sharedWithCategories?.length > 0) {
      const names = file.sharedWithCategories
        .map((cat) => (typeof cat === "object" ? cat.name : null))
        .filter(Boolean);
      names.forEach((name) => parts.push(`📂 ${name}`));
    }
    const individuals = (file.allowedUsers || []).filter((u) => {
      const uid = typeof u === "object" ? u._id?.toString() : u?.toString();
      return uid !== uploaderId;
    });
    if (individuals.length > 0) {
      parts.push(
        `👤 ${individuals.length} individual${individuals.length !== 1 ? "s" : ""}`,
      );
    }
    return parts.length > 0 ? parts.join(" + ") : "No access assigned";
  };

  const openAccessModal = () => {
    const currentCategoryIds = (file.sharedWithCategories || []).map((c) =>
      typeof c === "object" ? c._id : c,
    );
    const currentUserIds = (file.allowedUsers || []).map((u) =>
      typeof u === "object" ? u._id : u,
    );
    setSelectedCategories(currentCategoryIds);
    setSelectedUsers(currentUserIds);
    setAccessError("");
    setShowAccessModal(true);
  };

  const toggleCategory = (catId) => {
    setSelectedCategories((prev) =>
      prev.includes(catId) || prev.includes(catId?.toString())
        ? prev.filter((id) => id !== catId && id !== catId?.toString())
        : [...prev, catId],
    );
  };

  const toggleUser = (userId) => {
    if (userId?.toString() === uploaderId) return;
    setSelectedUsers((prev) =>
      prev.includes(userId) || prev.includes(userId?.toString())
        ? prev.filter((id) => id !== userId && id !== userId?.toString())
        : [...prev, userId],
    );
  };

  // Total recipients for footer
  const categoryMemberIds = useMemo(() => {
    const ids = new Set();
    categories?.forEach((cat) => {
      const isSelected =
        selectedCategories.includes(cat._id) ||
        selectedCategories.includes(cat._id?.toString());
      if (isSelected) {
        cat.members?.forEach((m) => {
          const id = m._id || m;
          ids.add(id?.toString());
        });
      }
    });
    return ids;
  }, [selectedCategories, categories]);

  const totalSelected = useMemo(() => {
    const direct = new Set(
      selectedUsers
        .filter((id) => id?.toString() !== uploaderId)
        .map((id) => id?.toString()),
    );
    categoryMemberIds.forEach((id) => {
      if (id !== uploaderId) direct.add(id);
    });
    return direct.size;
  }, [selectedUsers, categoryMemberIds, uploaderId]);

  const handleSaveAccess = async () => {
    setSaving(true);
    setAccessError("");
    try {
      await axios.put(`/files/access/${file._id}`, {
        sharedWithCategories: selectedCategories,
        allowedUsers: selectedUsers,
      });
      setShowAccessModal(false);
      onRefresh();
    } catch (err) {
      setAccessError(err.response?.data?.message || "Failed to update access");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl p-4 transition">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* File Info */}
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="text-2xl shrink-0 mt-0.5 sm:mt-0">
              {getFileIcon(file.mimeType)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-white text-sm font-medium truncate max-w-full">
                  {file.originalName}
                </p>
                {file.isRecovered && (
                  <span className="text-[10px] sm:text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full border border-green-500/30 shrink-0">
                    Restored : admin
                  </span>
                )}
              </div>
              <p className="text-gray-500 text-xs mt-0.5 truncate">
                {formatSize(file.size)} · Uploaded by {file.uploadedBy?.name}
              </p>
              {canEditAccess && (
                <p className="text-gray-600 text-xs mt-0.5 truncate">
                  {getAccessSummary()}
                </p>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:shrink-0 w-full sm:w-auto justify-end">
            {canEditAccess && (
              <button
                onClick={openAccessModal}
                className="px-3 py-1.5 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition flex-1 sm:flex-none text-center"
              >
                ✏️ Access
              </button>
            )}
            <button
              onClick={() => onDownload(file._id, file.originalName)}
              className="px-3 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition flex-1 sm:flex-none text-center"
            >
              Download
            </button>
            {canDelete && (
              <button
                onClick={() => onDelete(file._id)}
                className="px-3 py-1.5 text-xs bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition flex-1 sm:flex-none text-center"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── EDIT ACCESS MODAL ── */}
      {showAccessModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-800 flex flex-col max-h-[90vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-800">
              <div>
                <h3 className="text-white font-semibold text-base sm:text-lg">
                  Edit Access
                </h3>
                <p className="text-gray-500 text-xs mt-0.5">
                  Control who can view this file
                </p>
              </div>
              <button
                onClick={() => setShowAccessModal(false)}
                className="w-8 h-8 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white flex items-center justify-center transition text-lg"
              >
                ✕
              </button>
            </div>

            {/* File Preview */}
            <div className="mx-4 sm:mx-6 mt-4 sm:mt-5 bg-gray-800 rounded-xl px-4 py-3 flex items-center gap-3 border border-gray-700 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-gray-700 flex items-center justify-center text-xl shrink-0">
                {getFileIcon(file.mimeType)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-white text-sm font-medium truncate">
                  {file.originalName}
                </p>
                <p className="text-gray-500 text-xs mt-0.5">
                  {formatSize(file.size)}
                </p>
              </div>
              <div className="ml-auto shrink-0 pl-1">
                <span className="text-[10px] sm:text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded-full whitespace-nowrap">
                  {totalSelected} recipient{totalSelected !== 1 ? "s" : ""}
                </span>
              </div>
            </div>

            {/* Error */}
            {accessError && (
              <div className="mx-4 sm:mx-6 mt-3 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <span>⚠️</span> {accessError}
              </div>
            )}

            {/* Access Selector */}
            <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
              <AccessSelector
                categories={categories}
                members={members}
                selectedCategories={selectedCategories}
                selectedUsers={selectedUsers}
                currentUserId={currentUser?.id}
                uploaderId={uploaderId}
                onToggleCategory={toggleCategory}
                onToggleUser={toggleUser}
              />
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-4 border-t border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-gray-500 text-xs order-2 sm:order-1 text-center sm:text-left">
                {totalSelected > 0
                  ? `${totalSelected} recipient${totalSelected !== 1 ? "s" : ""} will have access`
                  : "No recipients selected"}
              </p>
              <div className="flex gap-3 order-1 sm:order-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowAccessModal(false)}
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition flex-1 sm:flex-none text-center"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAccess}
                  disabled={saving}
                  className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition disabled:opacity-50 font-medium flex-1 sm:flex-none text-center flex justify-center items-center"
                >
                  {saving ? (
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
                      Saving...
                    </span>
                  ) : (
                    "Save Access →"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FileCard;