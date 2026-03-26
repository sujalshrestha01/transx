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
}) => {
  return (
    <div className="space-y-4">
      {/* Upload Access Toggle */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold text-lg">
              Allow All Members to Upload
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              When enabled, all members can upload and share files regardless of their role.
            </p>
          </div>
          <button
            onClick={() => onToggleUploadAccess(!allowAllUploads)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-200 flex-shrink-0
              ${allowAllUploads ? "bg-blue-600" : "bg-gray-700"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200
                ${allowAllUploads ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
        </div>
        {allowAllUploads && (
          <div className="mt-3 bg-blue-500/10 border border-blue-500 text-blue-400 px-4 py-2 rounded-lg text-sm">
            ✅ All members can currently upload files
          </div>
        )}
      </div>

      {/* Member Roles */}
      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold text-lg mb-1">Member Roles</h3>
        <p className="text-gray-500 text-sm mb-5">Control what each member can do.</p>

        {roleSuccess && (
          <div className="bg-green-500/10 border border-green-500 text-green-400 px-4 py-2 rounded-lg mb-5 text-sm">
            ✅ {roleSuccess}
          </div>
        )}

        {/* Role Legend */}
        <div className="flex gap-3 flex-wrap mb-5">
          {[
            { role: "member", desc: "Can only view shared files" },
            { role: "uploader", desc: "Can upload and share files" },
            { role: "admin", desc: "Full access and control" },
          ].map(({ role, desc }) => (
            <div key={role} className="flex items-center gap-2 bg-gray-800 px-3 py-2 rounded-lg">
              <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${getRoleBadge(role)}`}>
                {role}
              </span>
              <span className="text-gray-400 text-xs">{desc}</span>
            </div>
          ))}
        </div>

        {/* Bulk Actions */}
        <div className="bg-gray-800 rounded-xl p-4 mb-4">
          <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Bulk Role Change
          </p>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={onSelectAll}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition"
            >
              Select All
            </button>
            <button
              onClick={onDeselectAll}
              className="text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-3 py-1.5 rounded-lg transition"
            >
              Deselect All
            </button>
            <select
              value={bulkRole}
              onChange={(e) => onBulkRoleChange(e.target.value)}
              className="bg-gray-700 text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="member">member</option>
              <option value="uploader">uploader</option>
              <option value="admin">admin</option>
            </select>
            <button
              onClick={onBulkRole}
              disabled={selectedMembers.length === 0}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg transition disabled:opacity-40"
            >
              Apply to {selectedMembers.length} selected
            </button>
          </div>
        </div>

        {/* Member List */}
        <div className="space-y-3">
          {members.map((member) => {
            const isCurrentUser = member.user._id.toString() === currentUserId?.toString();
            const isSelected =
              selectedMembers.includes(member.user._id) ||
              selectedMembers.includes(member.user._id?.toString());

            return (
              <div
                key={member._id}
                className={`flex items-center justify-between rounded-xl px-4 py-3 transition
                  ${isSelected
                    ? "bg-blue-600/10 border border-blue-500/50"
                    : "bg-gray-800 border border-transparent"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {!isCurrentUser && (
                    <div
                      onClick={() => onToggleMember(member.user._id)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center cursor-pointer flex-shrink-0
                        ${isSelected ? "bg-blue-500 border-blue-500" : "border-gray-600"}`}
                    >
                      {isSelected && (
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  )}
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
                    <select
                      value={member.role}
                      onChange={(e) => onRoleChange(member.user._id, e.target.value)}
                      disabled={updatingRole === member.user._id}
                      className="bg-gray-700 text-white text-xs rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                    >
                      <option value="member">member</option>
                      <option value="uploader">uploader</option>
                      <option value="admin">admin</option>
                    </select>
                    <button
                      onClick={() => onRemoveMember(member.user._id)}
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
          {[
            { label: "Name", value: org?.name },
            { label: "Join Code", value: org?.joinCode, mono: true, blue: true },
            { label: "Total Members", value: members.length },
            { label: "Total Files", value: files.length },
            { label: "Total Categories", value: categories.length },
          ].map(({ label, value, mono, blue }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-gray-500">{label}</span>
              <span className={`font-medium ${blue ? "text-blue-400" : "text-white"} ${mono ? "font-mono" : ""}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
