const MembersModal = ({
  selectedCategory,
  members,
  categoryMembers,
  onToggleMember,
  onSave,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-white font-semibold text-lg mb-1">Manage Members</h3>
        <p className="text-gray-500 text-sm mb-5">
          Category: <span className="text-blue-400">{selectedCategory.name}</span>
        </p>

        <div className="space-y-2 max-h-72 overflow-y-auto mb-5">
          {members.map((member) => {
            const memberId = member.user._id;
            const isSelected =
              categoryMembers.includes(memberId) ||
              categoryMembers.includes(memberId?.toString());

            return (
              <div
                key={memberId}
                onClick={() => onToggleMember(memberId)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition
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
                    <p className="text-white text-sm font-medium">{member.user?.name}</p>
                    <p className="text-gray-500 text-xs">{member.user?.email}</p>
                  </div>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
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

        <p className="text-gray-600 text-xs mb-4">
          {categoryMembers.length} member{categoryMembers.length !== 1 ? "s" : ""} selected
        </p>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
          >
            Save Members
          </button>
        </div>
      </div>
    </div>
  );
};

export default MembersModal;
