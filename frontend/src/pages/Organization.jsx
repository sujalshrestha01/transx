import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/organization/Sidebar.jsx";
import FileCard from "../components/FileCard.jsx";
import UploadModal from "../components/organization/UploadModal.jsx";
import CategoryModal from "../components/organization/CategoryModal.jsx";
import MembersModal from "../components/organization/MembersModal.jsx";
import SettingsTab from "../components/organization/SettingsTab.jsx";
import { useAuth } from "../context/AuthContext";
import axios from "../api/axios";

const Organization = () => {
  const { orgId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [org, setOrg] = useState(null);
  const [files, setFiles] = useState([]);
  const [members, setMembers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentDownloads, setRecentDownloads] = useState([]);
  const [activityLog, setActivityLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("files");
  const [myRole, setMyRole] = useState("member");
  const [storageUsed, setStorageUsed] = useState(0);

  const [trashFiles, setTrashFiles] = useState([]);
  const [trashLoading, setTrashLoading] = useState(false);

  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef(null);

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [categoryError, setCategoryError] = useState("");
  const [categoryLoading, setCategoryLoading] = useState(false);

  const [showMembersModal, setShowMembersModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryMembers, setCategoryMembers] = useState([]);

  const [activityFilter, setActivityFilter] = useState("all");

  const [selectedMembers, setSelectedMembers] = useState([]);
  const [bulkRole, setBulkRole] = useState("uploader");
  const [allowAllUploads, setAllowAllUploads] = useState(false);
  const [updatingRole, setUpdatingRole] = useState(null);
  const [roleSuccess, setRoleSuccess] = useState("");

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterType, setFilterType] = useState("all");
  const [viewMode, setViewMode] = useState("list");

  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user"));
  const currentUserId = user?.id || storedUser?.id;

  const fetchAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [orgsRes, filesRes, membersRes, categoriesRes, recentRes] = await Promise.all([
        axios.get("/org/my"),
        axios.get(`/files/org/${orgId}`),
        axios.get(`/org/${orgId}/members`),
        axios.get(`/categories/org/${orgId}`),
        axios.get(`/files/recent/${orgId}`),
      ]);
      const currentOrg = orgsRes.data.organizations.find(
        (o) => o._id.toString() === orgId.toString()
      );
      if (!currentOrg) { setError("Organization not found or you are not a member"); return; }
      setOrg(currentOrg);
      setAllowAllUploads(currentOrg.allowAllUploads || false);
      setFiles(filesRes.data.files);
      setMembers(membersRes.data.members);
      setCategories(categoriesRes.data.categories);
      setRecentDownloads(recentRes.data.files);
      const totalBytes = filesRes.data.files.reduce((acc, f) => acc + (f.size || 0), 0);
      setStorageUsed(totalBytes);
      const myMember = membersRes.data.members.find(
        (m) => m.user._id.toString() === currentUserId?.toString()
      );
      if (myMember) setMyRole(myMember.role);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to load organization data");
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const res = await axios.get(`/files/activity/${orgId}`);
      setActivityLog(res.data.activity);
    } catch (err) { console.error(err); }
  };

  const fetchTrash = async () => {
    setTrashLoading(true);
    try {
      const res = await axios.get(`/files/trash/${orgId}`);
      setTrashFiles(res.data.files);
    } catch (err) { console.error(err); } finally { setTrashLoading(false); }
  };

  useEffect(() => { if (orgId) fetchAll(); }, [orgId]);

  useEffect(() => {
    if (activeTab === "activity" && myRole === "admin") fetchActivity();
    if (activeTab === "trash" && myRole === "admin") fetchTrash();
    setShowMobileSidebar(false);
  }, [activeTab]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSelectedFile(file);
    setSelectedCategories([]);
    setSelectedUsers([currentUserId]);
    setUploadError("");
    setShowUploadModal(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const toggleCategory = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId) ? prev.filter((id) => id !== categoryId) : [...prev, categoryId]
    );
  };

  const toggleUser = (userId) => {
    if (userId === currentUserId) return;
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    if (selectedCategories.length === 0 && selectedUsers.length <= 1) {
      setUploadError("Please select at least one category or member to share with.");
      return;
    }
    setUploadError("");
    setUploadSuccess("");
    setUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("sharedWithCategories", JSON.stringify(selectedCategories));
    formData.append("allowedUsers", JSON.stringify(selectedUsers));
    try {
      await axios.post(`/files/upload/${orgId}`, formData, { headers: { "Content-Type": "multipart/form-data" } });
      setUploadSuccess(`"${selectedFile.name}" uploaded successfully!`);
      setShowUploadModal(false);
      setSelectedFile(null);
      setSelectedCategories([]);
      setSelectedUsers([]);
      fetchAll();
    } catch (err) {
      setUploadError(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (fileId, fileName) => {
    try {
      const res = await axios.get(`/files/download/${fileId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      fetchAll();
    } catch (err) { alert("Download failed"); }
  };

  const handleDelete = async (fileId) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    try {
      await axios.delete(`/files/delete/${fileId}`);
      setFiles(files.filter((f) => f._id !== fileId));
    } catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  const openCreateCategory = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", description: "" });
    setCategoryError("");
    setShowCategoryModal(true);
  };

  const openEditCategory = (cat) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, description: cat.description });
    setCategoryError("");
    setShowCategoryModal(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim()) { setCategoryError("Name is required"); return; }
    setCategoryLoading(true);
    try {
      if (editingCategory) {
        await axios.put(`/categories/${editingCategory._id}`, categoryForm);
      } else {
        await axios.post("/categories/create", { ...categoryForm, orgId });
      }
      setShowCategoryModal(false);
      fetchAll();
    } catch (err) {
      setCategoryError(err.response?.data?.message || "Failed to save");
    } finally { setCategoryLoading(false); }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!confirm("Delete this category?")) return;
    try {
      await axios.delete(`/categories/${categoryId}`);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || "Failed to delete"); }
  };

  const openManageMembers = (cat) => {
    setSelectedCategory(cat);
    setCategoryMembers(cat.members.map((m) => m._id || m));
    setShowMembersModal(true);
  };

  const toggleCategoryMember = (userId) => {
    setCategoryMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSaveCategoryMembers = async () => {
    try {
      await axios.put(`/categories/${selectedCategory._id}/members`, { members: categoryMembers });
      setShowMembersModal(false);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || "Failed to update members"); }
  };

  const handleRoleChange = async (userId, newRole) => {
    setUpdatingRole(userId);
    try {
      await axios.put(`/org/${orgId}/role`, { userId, role: newRole });
      setRoleSuccess("Role updated!");
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || "Failed"); } finally { setUpdatingRole(null); }
  };

  const handleBulkRole = async () => {
    if (selectedMembers.length === 0) { alert("Select at least one member"); return; }
    if (!confirm(`Change ${selectedMembers.length} member(s) to "${bulkRole}"?`)) return;
    try {
      await axios.put(`/org/${orgId}/bulk-role`, { userIds: selectedMembers, role: bulkRole });
      setSelectedMembers([]);
      setRoleSuccess(`${selectedMembers.length} member(s) updated to "${bulkRole}"`);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm("Remove this member?")) return;
    try {
      await axios.delete(`/org/${orgId}/remove/${userId}`);
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || "Failed"); }
  };

  const handleToggleUploadAccess = async (value) => {
    try {
      await axios.put(`/org/${orgId}/upload-access`, { allowAllUploads: value });
      setAllowAllUploads(value);
    } catch (err) { alert("Failed to update setting"); }
  };

  const handleUpdateOrgName = async (newName) => {
    try {
      await axios.put(`/org/${orgId}`, { name: newName });
      fetchAll();
    } catch (err) { alert(err.response?.data?.message || "Failed to update name"); }
  };

  const handleDeleteOrg = async () => {
    if (!confirm(`Delete "${org.name}"? This will permanently delete all files and categories.`)) return;
    if (!confirm("This is irreversible. Are you absolutely sure?")) return;
    try {
      await axios.delete(`/org/${orgId}`);
      navigate("/dashboard");
    } catch (err) { alert(err.response?.data?.message || "Failed to delete organization"); }
  };

  const handleLeaveOrg = async () => {
    if (!confirm(`Leave "${org.name}"? You will lose access to all files. You can rejoin with the join code.`)) return;
    try {
      await axios.delete(`/org/${orgId}/leave`);
      navigate("/dashboard");
    } catch (err) { alert(err.response?.data?.message || "Failed to leave organization"); }
  };

  const toggleMemberSelection = (userId) => {
    if (userId === currentUserId) return;
    setSelectedMembers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const selectAllMembers = () => {
    const allIds = members
      .map((m) => m.user._id)
      .filter((id) => id !== currentUserId && id?.toString() !== currentUserId?.toString());
    setSelectedMembers(allIds);
  };

  const getFilteredFiles = () => {
    let result = [...files];
    if (search.trim()) {
      result = result.filter((f) => f.originalName.toLowerCase().includes(search.toLowerCase()));
    }
    if (filterType !== "all") {
      result = result.filter((f) => {
        if (filterType === "image") return f.mimeType.includes("image");
        if (filterType === "pdf") return f.mimeType.includes("pdf");
        if (filterType === "video") return f.mimeType.includes("video");
        if (filterType === "document") return f.mimeType.includes("word") || f.mimeType.includes("document");
        return true;
      });
    }
    if (sortBy === "newest") result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortBy === "oldest") result.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortBy === "name") result.sort((a, b) => a.originalName.localeCompare(b.originalName));
    if (sortBy === "size") result.sort((a, b) => b.size - a.size);
    return result;
  };

  const isAdminUser = myRole === "admin";
  const canUpload = ["admin", "uploader"].includes(myRole) || allowAllUploads;

  const timeAgo = (date) => {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
    return new Date(date).toLocaleDateString();
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

  const getRoleBadge = (role) => {
    const styles = {
      admin: "bg-blue-600/20 text-blue-400 ring-1 ring-blue-500/30",
      uploader: "bg-emerald-600/20 text-emerald-400 ring-1 ring-emerald-500/30",
      member: "bg-gray-800 text-gray-400 ring-1 ring-gray-700/50",
    };
    return styles[role] || styles.member;
  };

  if (loading)
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-gray-500">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading workspace…</span>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gray-950 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
          <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-2xl">⚠️</div>
          <p className="text-red-400 font-medium">{error}</p>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-blue-400 hover:text-blue-300 transition flex items-center gap-1.5"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );

  const filteredFiles = getFilteredFiles();

  return (
    <div className="h-screen bg-gray-950 flex flex-col overflow-hidden">
      <Navbar />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar – desktop static, mobile drawer */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0
            transform transition-transform duration-300 ease-in-out
            lg:static lg:translate-x-0 lg:w-60 xl:w-64
            bg-gray-950 border-r border-gray-800/60
            ${showMobileSidebar ? "translate-x-0" : "-translate-x-full"}
          `}
        >
          <Sidebar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            filesCount={files.length}
            categoriesCount={categories.length}
            membersCount={members.length}
            myRole={myRole}
            org={org}
            storageUsed={storageUsed}
          />
        </aside>

        {/* Mobile backdrop */}
        {showMobileSidebar && (
          <div
            onClick={() => setShowMobileSidebar(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
          />
        )}

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden min-w-0">

          {/* ── Sticky header ── */}
          <header className="shrink-0 bg-gray-950/95 backdrop-blur-md border-b border-gray-800/60 px-4 sm:px-6 py-3.5 z-10">
            <div className="flex items-center justify-between gap-3 flex-wrap">

              {/* Left: back + hamburger + org name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-500 hover:text-white hover:bg-gray-800 transition shrink-0"
                  aria-label="Back to dashboard"
                >
                  ←
                </button>

                <button
                  onClick={() => setShowMobileSidebar(true)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition lg:hidden shrink-0"
                  aria-label="Open navigation menu"
                >
                  ☰
                </button>

                <div className="flex items-center gap-2 min-w-0">
                  <h1 className="text-white font-semibold text-base sm:text-lg truncate leading-tight">
                    {org?.name}
                  </h1>
                  <span className={`hidden xs:inline-flex text-[10px] px-2 py-0.5 rounded-full font-semibold capitalize shrink-0 ${getRoleBadge(myRole)}`}>
                    {myRole}
                  </span>
                </div>
              </div>

              {/* Right: search + upload */}
              <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                {activeTab === "files" && (
                  <div className="relative order-2 sm:order-1 w-full sm:w-auto">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none">🔍</span>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search files…"
                      className="bg-gray-800/80 border border-gray-700/50 text-white text-sm rounded-xl px-4 py-2 pl-8 outline-none focus:ring-2 focus:ring-blue-500/70 focus:border-blue-500/50 placeholder-gray-600 w-full sm:w-48 md:w-56 transition"
                    />
                  </div>
                )}

                {canUpload && (
                  <div className="order-1 sm:order-2 shrink-0">
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" id="file-upload" />
                    <label
                      htmlFor="file-upload"
                      className="inline-flex items-center gap-1.5 px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl cursor-pointer transition bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-lg shadow-blue-600/20 whitespace-nowrap select-none"
                    >
                      <span className="text-base leading-none">+</span>
                      <span>Upload File</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* ── Scrollable content ── */}
          <div className="flex-1 overflow-y-auto">
            <div className="px-4 sm:px-6 py-5 max-w-6xl mx-auto w-full">

              {/* Upload feedback banner */}
              {uploadSuccess && (
                <div className="flex items-center justify-between gap-3 bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 px-4 py-3 rounded-xl mb-5 text-sm">
                  <span className="flex items-center gap-2 truncate">
                    <span className="shrink-0">✅</span>
                    <span className="truncate">{uploadSuccess}</span>
                  </span>
                  <button onClick={() => setUploadSuccess("")} className="text-emerald-600 hover:text-emerald-300 shrink-0 transition">✕</button>
                </div>
              )}

              {/* ═══════════════════════════════════════ FILES TAB ═══════════════════════════════════════ */}
              {activeTab === "files" && (
                <div>
                  {/* Toolbar */}
                  <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 mb-5">
                    <p className="text-gray-500 text-sm">
                      <span className="text-gray-300 font-medium">{filteredFiles.length}</span> file{filteredFiles.length !== 1 ? "s" : ""}
                      {search && <span className="text-gray-600"> · matching "{search}"</span>}
                    </p>

                    <div className="flex items-center gap-2 flex-wrap xs:flex-nowrap">
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="bg-gray-800 border border-gray-700/50 text-white text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/70 cursor-pointer flex-1 xs:flex-none min-w-0"
                      >
                        <option value="all">All Types</option>
                        <option value="image">Images</option>
                        <option value="pdf">PDFs</option>
                        <option value="video">Videos</option>
                        <option value="document">Documents</option>
                      </select>

                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-gray-800 border border-gray-700/50 text-white text-xs rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500/70 cursor-pointer flex-1 xs:flex-none min-w-0"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="name">Name A–Z</option>
                        <option value="size">Largest First</option>
                      </select>

                      <div className="flex items-center bg-gray-800 border border-gray-700/50 rounded-lg p-1 shrink-0">
                        <button
                          onClick={() => setViewMode("list")}
                          className={`px-2.5 py-1.5 rounded-md text-xs transition font-medium ${viewMode === "list" ? "bg-gray-700 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}
                          title="List view"
                        >☰</button>
                        <button
                          onClick={() => setViewMode("grid")}
                          className={`px-2.5 py-1.5 rounded-md text-xs transition font-medium ${viewMode === "grid" ? "bg-gray-700 text-white shadow-sm" : "text-gray-500 hover:text-gray-300"}`}
                          title="Grid view"
                        >⊞</button>
                      </div>
                    </div>
                  </div>

                  {!canUpload && (
                    <div className="flex items-start gap-3 bg-amber-500/8 border border-amber-500/30 text-amber-400 px-4 py-3.5 rounded-xl text-sm mb-5">
                      <span className="shrink-0 mt-0.5">⚠️</span>
                      <span>You have <strong>member</strong> role — ask your admin for uploader access.</span>
                    </div>
                  )}

                  {filteredFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-20 h-20 bg-gray-800/50 rounded-3xl flex items-center justify-center text-4xl mb-5">🔒</div>
                      <p className="text-gray-300 font-semibold text-lg">No files found</p>
                      <p className="text-gray-600 text-sm mt-1.5 max-w-xs">
                        {search ? "Try a different search term" : canUpload ? "Upload a file to get started" : "No files have been shared with you yet"}
                      </p>
                    </div>
                  ) : viewMode === "list" ? (
                    <div className="space-y-2.5">
                      {filteredFiles.map((file) => (
                        <FileCard
                          key={file._id}
                          file={file}
                          currentUser={user}
                          myRole={myRole}
                          members={members}
                          categories={categories}
                          onDownload={handleDownload}
                          onDelete={handleDelete}
                          onRefresh={fetchAll}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                      {filteredFiles.map((file) => (
                        <div
                          key={file._id}
                          className="group bg-gray-900 border border-gray-800 hover:border-blue-500/60 rounded-2xl p-4 transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/5 flex flex-col gap-3"
                        >
                          <div className="text-3xl sm:text-4xl">{getFileIcon(file.mimeType)}</div>
                          <div className="min-w-0 flex-1">
                            <p className="text-white text-xs sm:text-sm font-medium truncate leading-snug">{file.originalName}</p>
                            <p className="text-gray-600 text-xs mt-1">{timeAgo(file.createdAt)}</p>
                          </div>
                          <button
                            onClick={() => handleDownload(file._id, file.originalName)}
                            className="w-full py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition mt-auto"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════════════════════════════ CATEGORIES TAB ═══════════════════════════════════════ */}
              {activeTab === "categories" && (
                <div className="space-y-3">
                  {isAdminUser && (
                    <div className="flex justify-end mb-1">
                      <button
                        onClick={openCreateCategory}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition shadow-lg shadow-blue-600/20"
                      >
                        <span>+</span> New Category
                      </button>
                    </div>
                  )}

                  {categories.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-20 h-20 bg-gray-800/50 rounded-3xl flex items-center justify-center text-4xl mb-5">🗂️</div>
                      <p className="text-gray-300 font-semibold text-lg">No categories yet</p>
                      {isAdminUser && <p className="text-gray-600 text-sm mt-1.5">Create a category to organize members</p>}
                    </div>
                  ) : (
                    categories.map((cat) => (
                      <div key={cat._id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-2xl p-5 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                          <div className="min-w-0">
                            <h3 className="text-white font-semibold text-base sm:text-lg truncate">{cat.name}</h3>
                            {cat.description && (
                              <p className="text-gray-500 text-sm mt-1 leading-relaxed break-words">{cat.description}</p>
                            )}
                          </div>

                          {isAdminUser && (
                            <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                              <button
                                onClick={() => openManageMembers(cat)}
                                className="flex-1 sm:flex-none text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition whitespace-nowrap text-center"
                              >👥 Members</button>
                              <button
                                onClick={() => openEditCategory(cat)}
                                className="flex-1 sm:flex-none text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg transition text-center"
                              >✏️ Edit</button>
                              <button
                                onClick={() => handleDeleteCategory(cat._id)}
                                className="flex-1 sm:flex-none text-xs bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg transition text-center"
                              >Delete</button>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2.5 flex-wrap pt-3 border-t border-gray-800">
                          {cat.members.length === 0 ? (
                            <span className="text-gray-600 text-xs">No members yet</span>
                          ) : (
                            <>
                              <div className="flex items-center -space-x-2">
                                {cat.members.slice(0, 6).map((m) => (
                                  <div
                                    key={m._id}
                                    title={m.name}
                                    className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 ring-2 ring-gray-900 flex items-center justify-center text-white text-[10px] font-bold uppercase shrink-0"
                                  >
                                    {m.name?.charAt(0)}
                                  </div>
                                ))}
                              </div>
                              {cat.members.length > 6 && (
                                <span className="text-gray-500 text-xs">+{cat.members.length - 6} more</span>
                              )}
                              <span className="text-gray-600 text-xs">
                                {cat.members.length} member{cat.members.length !== 1 ? "s" : ""}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* ═══════════════════════════════════════ MEMBERS TAB ═══════════════════════════════════════ */}
              {activeTab === "members" && (
                <div className="space-y-2.5">
                  {members.map((member) => (
                    <div
                      key={member._id}
                      className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl px-4 sm:px-5 py-3.5 flex flex-col xs:flex-row xs:items-center justify-between gap-3 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm uppercase shrink-0">
                          {member.user?.name?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white text-sm font-medium truncate">{member.user?.name}</p>
                          <p className="text-gray-500 text-xs truncate">{member.user?.email}</p>
                        </div>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full capitalize font-semibold self-start xs:self-auto shrink-0 ${getRoleBadge(member.role)}`}>
                        {member.role}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* ═══════════════════════════════════════ RECENT DOWNLOADS TAB ═══════════════════════════════════════ */}
              {activeTab === "recent" && (
                <div>
                  <h3 className="text-white font-semibold text-lg mb-4">Your Recent Downloads</h3>
                  {recentDownloads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-20 h-20 bg-gray-800/50 rounded-3xl flex items-center justify-center text-4xl mb-5">🕐</div>
                      <p className="text-gray-300 font-semibold text-lg">No recent downloads</p>
                      <p className="text-gray-600 text-sm mt-1.5">Files you download will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-2.5">
                      {recentDownloads.map((file) => (
                        <div
                          key={file._id}
                          className="bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-xl px-4 sm:px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="text-2xl shrink-0">{getFileIcon(file.mimeType)}</div>
                            <div className="min-w-0">
                              <p className="text-white text-sm font-medium truncate">{file.originalName}</p>
                              <p className="text-gray-500 text-xs mt-0.5">
                                Last downloaded {timeAgo(file.lastDownloadedAt)} · Uploaded by {file.uploadedBy?.name}
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDownload(file._id, file.originalName)}
                            className="px-4 py-1.5 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition w-full sm:w-auto text-center shrink-0"
                          >
                            Download
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════════════════════════════ ACTIVITY LOG TAB ═══════════════════════════════════════ */}
              {activeTab === "activity" && isAdminUser && (
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                    <h3 className="text-white font-semibold text-lg shrink-0">Activity Log</h3>
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none snap-x -mx-1 px-1">
                      {[
                        { value: "all", label: "🗂️ All" },
                        { value: "upload", label: "⬆️ Uploads" },
                        { value: "download", label: "⬇️ Downloads" },
                        { value: "join", label: "👤 Joins" },
                        { value: "delete", label: "🗑️ Deletes" },
                        { value: "role_change", label: "🔑 Role Changes" },
                      ].map(({ value, label }) => (
                        <button
                          key={value}
                          onClick={() => setActivityFilter(value)}
                          className={`px-3 py-1.5 text-xs rounded-lg transition font-medium shrink-0 whitespace-nowrap snap-start
                            ${activityFilter === value
                              ? "bg-blue-600 text-white shadow-md shadow-blue-600/20"
                              : "bg-gray-800 text-gray-400 hover:text-white hover:bg-gray-700"
                            }`}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {activityLog.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-20 h-20 bg-gray-800/50 rounded-3xl flex items-center justify-center text-4xl mb-5">📊</div>
                      <p className="text-gray-300 font-semibold text-lg">No activity yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activityLog
                        .filter((event) => activityFilter === "all" || event.type === activityFilter)
                        .map((event, index) => {
                          const icons = {
                            upload: { icon: "⬆️", color: "bg-emerald-600/20 text-emerald-400", text: "uploaded" },
                            download: { icon: "⬇️", color: "bg-blue-600/20 text-blue-400", text: "downloaded" },
                            join: { icon: "👤", color: "bg-purple-600/20 text-purple-400", text: "joined the organization" },
                            delete: { icon: "🗑️", color: "bg-red-600/20 text-red-400", text: "deleted" },
                            role_change: { icon: "🔑", color: "bg-amber-600/20 text-amber-400", text: "changed role" },
                          };
                          const e = icons[event.type] || icons.upload;
                          return (
                            <div
                              key={index}
                              className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 flex items-center gap-3"
                            >
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${e.color}`}>
                                {e.icon}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-white text-sm leading-snug">
                                  <span className="font-semibold">{event.user?.name || "Unknown"}</span>
                                  <span className="text-gray-400"> {e.text} </span>
                                  {event.fileName && (
                                    <span className="font-medium text-blue-400 break-all">{event.fileName}</span>
                                  )}
                                  {event.meta && <span className="text-gray-500"> — {event.meta}</span>}
                                </p>
                                <p className="text-gray-600 text-xs mt-0.5">{timeAgo(event.at)}</p>
                              </div>
                              {event.fileName && (
                                <div className="text-xl shrink-0 hidden sm:block">
                                  {getFileIcon(event.fileName?.split(".").pop())}
                                </div>
                              )}
                            </div>
                          );
                        })}

                      {activityLog.filter((e) => activityFilter === "all" || e.type === activityFilter).length === 0 && (
                        <div className="text-center py-16">
                          <p className="text-gray-500 text-sm">No {activityFilter} events yet</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════════════════════════════ TRASH TAB ═══════════════════════════════════════ */}
              {activeTab === "trash" && isAdminUser && (
                <div>
                  <div className="mb-5">
                    <h3 className="text-white font-semibold text-lg">Bin</h3>
                    <p className="text-gray-500 text-sm mt-0.5">Last 10 deleted files · Auto-deleted after 30 days</p>
                  </div>

                  {trashLoading ? (
                    <div className="flex items-center justify-center py-16 gap-3 text-gray-500">
                      <div className="w-5 h-5 border-2 border-gray-600 border-t-gray-400 rounded-full animate-spin" />
                      <span className="text-sm">Loading…</span>
                    </div>
                  ) : trashFiles.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                      <div className="w-20 h-20 bg-gray-800/50 rounded-3xl flex items-center justify-center text-4xl mb-5">🗑️</div>
                      <p className="text-gray-300 font-semibold text-lg">Bin is empty</p>
                      <p className="text-gray-600 text-sm mt-1.5">Deleted files will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {trashFiles.map((file) => (
                        <div key={file._id} className="bg-gray-900 border border-gray-800 rounded-xl px-4 sm:px-5 py-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="text-2xl shrink-0 mt-0.5">{getFileIcon(file.mimeType)}</div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="text-white text-sm font-medium truncate max-w-[200px] sm:max-w-xs">{file.originalName}</p>
                                  <span className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full shrink-0 border font-medium
                                    ${file.daysRemaining <= 3
                                      ? "bg-red-600/15 text-red-400 border-red-500/30"
                                      : "bg-gray-800 text-gray-500 border-gray-700/50"
                                    }`}>
                                    {file.daysRemaining <= 3 ? `⚠️ ${file.daysRemaining}d left` : `${file.daysRemaining}d left`}
                                  </span>
                                </div>
                                <p className="text-gray-500 text-xs mt-1">Deleted by {file.deletedBy?.name} · {timeAgo(file.deletedAt)}</p>
                                <p className="text-gray-600 text-xs">Uploaded by {file.uploadedBy?.name}</p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 sm:shrink-0 w-full sm:w-auto">
                              <button
                                onClick={async () => {
                                  try {
                                    await axios.put(`/files/restore/${file._id}`);
                                    fetchTrash();
                                    fetchAll();
                                  } catch (err) { alert(err.response?.data?.message || "Failed to restore"); }
                                }}
                                className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium bg-emerald-600/15 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition text-center"
                              >↩️ Restore</button>
                              <button
                                onClick={async () => {
                                  if (!confirm("Permanently delete this file? This cannot be undone.")) return;
                                  try {
                                    await axios.delete(`/files/permanent/${file._id}`);
                                    fetchTrash();
                                  } catch (err) { alert(err.response?.data?.message || "Failed to delete"); }
                                }}
                                className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white rounded-lg transition text-center"
                              >Delete Forever</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ═══════════════════════════════════════ SETTINGS TAB ═══════════════════════════════════════ */}
              {activeTab === "settings" && (
                <SettingsTab
                  getRoleBadge={getRoleBadge}
                  members={members}
                  categories={categories}
                  files={files}
                  org={org}
                  currentUserId={currentUserId}
                  allowAllUploads={allowAllUploads}
                  selectedMembers={selectedMembers}
                  bulkRole={bulkRole}
                  updatingRole={updatingRole}
                  roleSuccess={roleSuccess}
                  isAdmin={isAdminUser}
                  onLeaveOrg={handleLeaveOrg}
                  onToggleUploadAccess={handleToggleUploadAccess}
                  onRoleChange={handleRoleChange}
                  onBulkRole={handleBulkRole}
                  onRemoveMember={handleRemoveMember}
                  onSelectAll={selectAllMembers}
                  onDeselectAll={() => setSelectedMembers([])}
                  onToggleMember={toggleMemberSelection}
                  onBulkRoleChange={setBulkRole}
                  onDeleteOrg={handleDeleteOrg}
                  onUpdateOrgName={handleUpdateOrgName}
                />
              )}

            </div>
          </div>
        </main>
      </div>

      {/* ── Modals ── */}
      <UploadModal
        show={showUploadModal}
        selectedFile={selectedFile}
        members={members}
        categories={categories}
        selectedCategories={selectedCategories}
        selectedUsers={selectedUsers}
        uploading={uploading}
        uploadError={uploadError}
        currentUserId={currentUserId}
        onToggleCategory={toggleCategory}
        onToggleUser={toggleUser}
        onUpload={handleUpload}
        onClose={() => { setShowUploadModal(false); setSelectedFile(null); }}
      />

      <CategoryModal
        show={showCategoryModal}
        editing={editingCategory}
        form={categoryForm}
        loading={categoryLoading}
        error={categoryError}
        onChange={setCategoryForm}
        onSave={handleSaveCategory}
        onClose={() => setShowCategoryModal(false)}
      />

      <MembersModal
        show={showMembersModal}
        category={selectedCategory}
        members={members}
        categoryMembers={categoryMembers}
        onToggle={toggleCategoryMember}
        onSave={handleSaveCategoryMembers}
        onClose={() => setShowMembersModal(false)}
      />
    </div>
  );
};

export default Organization;