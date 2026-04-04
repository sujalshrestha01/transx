import { useState, useMemo } from 'react';

const AccessSelector = ({
  categories,
  members,
  selectedCategories,
  selectedUsers,
  currentUserId,
  uploaderId,
  onToggleCategory,
  onToggleUser,
}) => {
  const [categorySearch, setCategorySearch] = useState('');
  const [memberSearch, setMemberSearch] = useState('');

  // Get member IDs auto-selected via categories
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

  // Filtered lists
  const filteredCategories = useMemo(() => {
    if (!categorySearch.trim()) return categories || [];
    return (categories || []).filter(
      (cat) =>
        cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
        cat.description?.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members || [];
    return (members || []).filter(
      (m) =>
        m.user?.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
        m.user?.email?.toLowerCase().includes(memberSearch.toLowerCase())
    );
  }, [members, memberSearch]);

  return (
    <div className="space-y-5">

      {/* ── CATEGORIES ── */}
      {(categories?.length > 0) && (
        <div>
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider shrink-0">
              Categories
            </span>
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-gray-600 text-xs shrink-0">
              {selectedCategories.length} selected
            </span>
          </div>

          {/* Category Search */}
          <div className="relative mb-3">
            <input
              type="text"
              value={categorySearch}
              onChange={(e) => setCategorySearch(e.target.value)}
              placeholder="Search categories..."
              className="w-full bg-gray-800/50 text-gray-300 text-xs rounded-lg px-3 py-2 pl-7 outline-none focus:ring-1 focus:ring-gray-600 placeholder-gray-700 border border-gray-800 focus:border-gray-600 transition"
            />
            <span className="absolute left-2.5 top-2 text-gray-600 text-xs">🔍</span>
            {categorySearch && (
              <button
                onClick={() => setCategorySearch('')}
                className="absolute right-2.5 top-2 text-gray-600 hover:text-gray-400 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category List */}
          <div className="space-y-2">
            {filteredCategories.map((cat) => {
              const catId = cat._id;
              const isSelected =
                selectedCategories.includes(catId) ||
                selectedCategories.includes(catId?.toString());

              return (
                <div
                  key={catId}
                  onClick={() => onToggleCategory(catId)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition border
                    ${isSelected
                      ? 'bg-purple-600/10 border-purple-500/60'
                      : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600'
                    }`}
                >
                  {/* Checkbox */}
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition
                    ${isSelected ? 'bg-purple-500 border-purple-500' : 'border-gray-600'}`}
                  >
                    {isSelected && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>

                  {/* Icon */}
                  <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center text-sm shrink-0">
                    🗂️
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium">{cat.name}</p>
                    {cat.description && (
                      <p className="text-gray-500 text-xs truncate">{cat.description}</p>
                    )}
                  </div>

                  {/* Member count */}
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0
                    ${isSelected
                      ? 'bg-purple-500/20 text-purple-300'
                      : 'bg-gray-700 text-gray-400'
                    }`}
                  >
                    {cat.members?.length || 0} members
                  </span>
                </div>
              );
            })}

            {filteredCategories.length === 0 && categorySearch && (
              <p className="text-gray-600 text-xs py-2 text-center">
                No categories matching "{categorySearch}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── INDIVIDUAL MEMBERS ── */}
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-gray-400 text-xs font-semibold uppercase tracking-wider shrink-0">
            Members
          </span>
          <div className="flex-1 h-px bg-gray-800" />
          <span className="text-gray-600 text-xs shrink-0">
            {(selectedUsers || []).filter(
              (id) =>
                id !== currentUserId &&
                id?.toString() !== currentUserId?.toString() &&
                id?.toString() !== uploaderId?.toString()
            ).length} selected
          </span>
        </div>

        {/* Member Search */}
        <div className="relative mb-3">
          <input
            type="text"
            value={memberSearch}
            onChange={(e) => setMemberSearch(e.target.value)}
            placeholder="Search members..."
            className="w-full bg-gray-800/50 text-gray-300 text-xs rounded-lg px-3 py-2 pl-7 outline-none focus:ring-1 focus:ring-gray-600 placeholder-gray-700 border border-gray-800 focus:border-gray-600 transition"
          />
          <span className="absolute left-2.5 top-2 text-gray-600 text-xs">🔍</span>
          {memberSearch && (
            <button
              onClick={() => setMemberSearch('')}
              className="absolute right-2.5 top-2 text-gray-600 hover:text-gray-400 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Member List */}
        <div className="space-y-2">
          {filteredMembers.map((member) => {
            const memberId = member.user._id;
            const memberIdStr = memberId?.toString();
            const isFileUploader = memberIdStr === uploaderId?.toString();
            const isCurrentUser =
              memberId === currentUserId ||
              memberIdStr === currentUserId?.toString();
            const isSelected =
              (selectedUsers || []).includes(memberId) ||
              (selectedUsers || []).includes(memberIdStr);
            const isViaCategory = categoryMemberIds.has(memberIdStr);
            const isLocked = isFileUploader;

            return (
              <div
                key={memberId}
                onClick={() => !isLocked && onToggleUser(memberId)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition border
                  ${isLocked
                    ? 'opacity-50 cursor-not-allowed bg-gray-800/30 border-gray-800'
                    : isViaCategory
                      ? 'bg-green-600/10 border-green-500/40 cursor-pointer'
                      : isSelected
                        ? 'bg-blue-600/10 border-blue-500/60 cursor-pointer'
                        : 'bg-gray-800/50 border-gray-700/50 hover:border-gray-600 cursor-pointer'
                  }`}
              >
                {/* Checkbox */}
                {!isLocked && (
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition
                    ${isViaCategory
                      ? 'bg-green-500 border-green-500'
                      : isSelected
                        ? 'bg-blue-500 border-blue-500'
                        : 'border-gray-600'
                    }`}
                  >
                    {(isSelected || isViaCategory) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )}

                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
                  {member.user?.name?.charAt(0)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium">
                    {member.user?.name}
                    {isCurrentUser && !isFileUploader && (
                      <span className="text-gray-500 text-xs ml-1">(you)</span>
                    )}
                    {isFileUploader && (
                      <span className="text-gray-500 text-xs ml-1">(uploader)</span>
                    )}
                  </p>
                  <p className="text-gray-500 text-xs truncate">{member.user?.email}</p>
                </div>

                {/* Via category badge */}
                {isViaCategory && (
                  <span className="text-xs bg-green-600/20 text-green-400 px-2 py-0.5 rounded-full shrink-0 border border-green-500/30">
                    via category
                  </span>
                )}

                {/* Role badge */}
                <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full capitalize shrink-0">
                  {member.role}
                </span>
              </div>
            );
          })}

          {filteredMembers.length === 0 && memberSearch && (
            <p className="text-gray-600 text-xs py-2 text-center">
              No members matching "{memberSearch}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccessSelector;