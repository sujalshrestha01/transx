import { useState } from "react";

const SettingsTab = ({
  org,
  members,
  files,
  categories,
  currentUserId,
  allowAllUploads,
  roleSuccess,
  updatingRole,
  selectedMembers,
  bulkRole,
  getRoleBadge,
  onToggleUploadAccess,
  onRoleChange,
  onRemoveMember,
  onBulkRole,
  onSelectAll,
  onDeselectAll,
  onToggleMember,
  onBulkRoleChange,
  onUpdateOrgName,
  isAdmin,
  onLeaveOrg,
  onDeleteOrg,
}) => {
  const [editingName, setEditingName] = useState(false);
  const [newOrgName, setNewOrgName] = useState(org?.name || "");

  return (
    <div className="space-y-4 max-w-3xl">

      {/* ── Upload Access Toggle ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6">
        <div className="flex items-start sm:items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-white font-semibold text-base sm:text-lg leading-snug">
              Allow All Members to Upload
            </h3>
            <p className="text-gray-500 text-sm mt-1 leading-relaxed">
              When enabled, all members can upload and share files regardless of their role.
            </p>
          </div>
          <button
            onClick={() => onToggleUploadAccess(!allowAllUploads)}
            aria-label="Toggle upload access"
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900
              ${allowAllUploads ? "bg-blue-600" : "bg-gray-700"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200
                ${allowAllUploads ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>

        {allowAllUploads && (
          <div className="mt-4 flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 px-4 py-2.5 rounded-xl text-sm">
            <span className="shrink-0">✅</span>
            <span>All members can currently upload files</span>
          </div>
        )}
      </div>

      {/* ── Member Roles ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6">
        <div className="mb-5">
          <h3 className="text-white font-semibold text-base sm:text-lg">Member Roles</h3>
          <p className="text-gray-500 text-sm mt-1">Control what each member can do.</p>
        </div>

        {roleSuccess && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-xl mb-5 text-sm">
            <span className="shrink-0">✅</span>
            <span>{roleSuccess}</span>
          </div>
        )}

        {/* Role Legend */}
        <div className="grid grid-cols-1 xs:grid-cols-3 gap-2 mb-5">
          {[
            { role: "member", desc: "View shared files only" },
            { role: "uploader", desc: "Upload and share files" },
            { role: "admin", desc: "Full access and control" },
          ].map(({ role, desc }) => (
            <div key={role} className="flex items-center gap-2 bg-gray-800/60 border border-gray-700/40 px-3 py-2.5 rounded-xl">
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-semibold shrink-0 ${getRoleBadge(role)}`}>
                {role}
              </span>
              <span className="text-gray-400 text-xs leading-snug">{desc}</span>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4 mb-4">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">Bulk Role Change</p>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={onSelectAll}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition font-medium"
            >Select All</button>
            <button
              onClick={onDeselectAll}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition font-medium"
            >Deselect All</button>
            <select
              value={bulkRole}
              onChange={(e) => onBulkRoleChange(e.target.value)}
              className="bg-gray-700 border border-gray-600/50 text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/70 cursor-pointer"
            >
              <option value="member">member</option>
              <option value="uploader">uploader</option>
              <option value="admin">admin</option>
            </select>
            <button
              onClick={onBulkRole}
              disabled={selectedMembers.length === 0}
              className="text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-lg transition font-medium"
            >
              Apply to {selectedMembers.length} selected
            </button>
          </div>
        </div>

        {/* Member List */}
        <div className="space-y-2">
          {members.map((member) => {
            const isCurrentUser = member.user._id.toString() === currentUserId?.toString();
            const isSelected =
              selectedMembers.includes(member.user._id) ||
              selectedMembers.includes(member.user._id?.toString());

            return (
              <div
                key={member._id}
                className={`flex flex-col xs:flex-row xs:items-center justify-between gap-3 rounded-xl px-4 py-3 transition-all duration-150
                  ${isSelected
                    ? "bg-blue-600/10 border border-blue-500/40 shadow-sm shadow-blue-500/10"
                    : "bg-gray-800/50 border border-transparent hover:border-gray-700/50"
                  }`}
              >
                {/* Left: checkbox + avatar + info */}
                <div className="flex items-center gap-3 min-w-0">
                  {!isCurrentUser && (
                    <div
                      onClick={() => onToggleMember(member.user._id)}
                      role="checkbox"
                      aria-checked={isSelected}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === " " && onToggleMember(member.user._id)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer shrink-0 transition-colors
                        ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-600 hover:border-gray-400"}`}
                    >
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  )}

                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm uppercase shrink-0">
                    {member.user?.name?.charAt(0)}
                  </div>

                  <div className="min-w-0">
                    <p className="text-white text-sm font-medium leading-snug truncate">
                      {member.user?.name}
                      {isCurrentUser && <span className="text-gray-500 text-xs font-normal ml-1">(you)</span>}
                    </p>
                    <p className="text-gray-500 text-xs truncate">{member.user?.email}</p>
                  </div>
                </div>

                {/* Right: role badge or controls */}
                {isCurrentUser ? (
                  <span className={`text-xs px-3 py-1 rounded-full capitalize font-semibold self-start xs:self-auto shrink-0 ${getRoleBadge(member.role)}`}>
                    {member.role}
                  </span>
                ) : (
                  <div className="flex items-center gap-2 self-end xs:self-auto shrink-0">
                    <select
                      value={member.role}
                      onChange={(e) => onRoleChange(member.user._id, e.target.value)}
                      disabled={updatingRole === member.user._id}
                      className="bg-gray-700 border border-gray-600/50 text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/70 cursor-pointer disabled:opacity-50 disabled:cursor-wait transition"
                    >
                      <option value="member">member</option>
                      <option value="uploader">uploader</option>
                      <option value="admin">admin</option>
                    </select>
                    <button
                      onClick={() => onRemoveMember(member.user._id)}
                      className="text-xs bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white px-3 py-1.5 rounded-lg transition font-medium whitespace-nowrap"
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

      {/* ── Organization Info ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 sm:p-6">
        <h3 className="text-white font-semibold text-base sm:text-lg mb-5">Organization Info</h3>

        <div className="divide-y divide-gray-800">
          {/* Editable Name */}
          <div className="flex items-center justify-between py-3 gap-4 first:pt-0">
            <span className="text-gray-500 text-sm shrink-0">Name</span>
            {editingName ? (
              <div className="flex items-center gap-2 flex-wrap justify-end">
                <input
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { onUpdateOrgName(newOrgName); setEditingName(false); }
                    if (e.key === "Escape") { setEditingName(false); setNewOrgName(org?.name); }
                  }}
                  className="bg-gray-800 border border-gray-700/50 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500/70 w-40 transition"
                  autoFocus
                />
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => { onUpdateOrgName(newOrgName); setEditingName(false); }}
                    className="text-xs bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg transition font-medium"
                  >Save</button>
                  <button
                    onClick={() => { setEditingName(false); setNewOrgName(org?.name); }}
                    className="text-xs text-gray-400 hover:text-white px-2 py-1.5 transition"
                  >Cancel</button>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-white text-sm font-medium truncate">{org?.name}</span>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-gray-600 hover:text-blue-400 transition text-sm shrink-0"
                  aria-label="Edit organization name"
                >✏️</button>
              </div>
            )}
          </div>

          {/* Static info rows */}
          {[
            { label: "Join Code", value: org?.joinCode, mono: true, highlight: true },
            { label: "Total Members", value: members.length },
            { label: "Total Files", value: files.length },
            { label: "Total Categories", value: categories.length },
          ].map(({ label, value, mono, highlight }) => (
            <div key={label} className="flex items-center justify-between py-3 gap-4 last:pb-0">
              <span className="text-gray-500 text-sm">{label}</span>
              <span className={`text-sm font-medium ${highlight ? "text-blue-400" : "text-white"} ${mono ? "font-mono tracking-wide" : ""}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Danger Zone ── */}
      <div className="bg-gray-900 border border-red-900/40 rounded-2xl p-5 sm:p-6">
        <h3 className="text-red-400 font-semibold text-base sm:text-lg mb-1">Danger Zone</h3>
        {isAdmin ? (
          <>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              Permanently delete this organization and all its files. This cannot be undone.
            </p>
            <button
              onClick={onDeleteOrg}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white rounded-xl transition duration-150"
            >
              <span>🗑️</span> Delete Organization
            </button>
          </>
        ) : (
          <>
            <p className="text-gray-500 text-sm mb-5 leading-relaxed">
              Leave this organization. You will lose access to all its files and categories. You can rejoin later with the join code.
            </p>
            <button
              onClick={onLeaveOrg}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium bg-red-600/15 hover:bg-red-600 text-red-400 hover:text-white rounded-xl transition duration-150"
            >
              <span>🚪</span> Leave Organization
            </button>
          </>
        )}
      </div>

    </div>
  );
};

export default SettingsTab;