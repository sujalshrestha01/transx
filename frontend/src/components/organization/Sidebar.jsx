const Sidebar = ({
  activeTab,
  onTabChange,
  filesCount,
  categoriesCount,
  membersCount,
  myRole,
  org,
  storageUsed
}) => {

  const isAdmin = myRole === 'admin';

  const navItems = [
    { id: 'files', icon: '📁', label: 'Files', count: filesCount },
    { id: 'categories', icon: '🗂️', label: 'Categories', count: categoriesCount },
    { id: 'members', icon: '👥', label: 'Members', count: membersCount },
    { id: 'recent', icon: '🕐', label: 'Recent Downloads' },
    ...(isAdmin ? [{ id: 'activity', icon: '📊', label: 'Activity Log' }] : []),
    ...(isAdmin ? [{ id: 'trash', icon: '🗑️', label: 'Bin' }] : []),
    { id: 'settings', icon: '⚙️', label: 'Settings' }
  ];

  const formatStorage = (bytes) => {
    if (!bytes) return '0 MB';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const storagePercent = Math.min((storageUsed / (500 * 1024 * 1024)) * 100, 100);

  const copyJoinCode = () => {
    navigator.clipboard.writeText(org?.joinCode || '');
    alert('Join code copied!');
  };

  return (
    <aside className="h-full w-60 xl:w-64 shrink-0 bg-gray-950 border-r border-gray-800/60 flex flex-col overflow-hidden">

      {/* Org name pill at top of sidebar — visible on mobile drawer */}
      <div className="px-4 pt-5 pb-2 lg:hidden">
        <p className="text-white font-semibold text-sm truncate">{org?.name}</p>
        <p className="text-gray-600 text-xs mt-0.5 capitalize">{myRole}</p>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="text-gray-600 text-[10px] uppercase tracking-widest font-semibold px-3 mb-3">
          Workspace
        </p>
        {navItems.map(({ id, icon, label, count }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
              ${activeTab === id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/80'
              }`}
          >
            <span className="flex items-center gap-3 min-w-0">
              <span className="text-base shrink-0">{icon}</span>
              <span className="truncate">{label}</span>
            </span>
            {count !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ml-1 tabular-nums
                ${activeTab === id
                  ? 'bg-white/20 text-white'
                  : 'bg-gray-800 text-gray-500'
                }`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="px-3 py-4 space-y-3 border-t border-gray-800/60 shrink-0">

        {/* Storage */}
        <div className="px-1">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs font-medium flex items-center gap-1.5">
              <span>💾</span> Storage
            </p>
            <p className="text-gray-500 text-xs tabular-nums">
              {formatStorage(storageUsed)} <span className="text-gray-700">/</span> 500 MB
            </p>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1">
            <div
              className={`h-1 rounded-full transition-all duration-500 ${storagePercent > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          {storagePercent > 80 && (
            <p className="text-red-400 text-xs mt-1.5 flex items-center gap-1">
              <span>⚠️</span> Storage almost full!
            </p>
          )}
        </div>

        {/* Join Code */}
        <button
          onClick={copyJoinCode}
          className="w-full flex items-center justify-between bg-gray-800/60 hover:bg-gray-800 border border-gray-700/40 hover:border-gray-600/60 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 group text-left"
        >
          <div className="min-w-0">
            <p className="text-gray-500 text-xs mb-0.5">Join Code</p>
            <p className="text-blue-400 font-mono text-sm font-semibold truncate">
              {org?.joinCode}
            </p>
          </div>
          <span className="text-gray-600 group-hover:text-gray-300 text-xs transition-colors shrink-0 ml-2">
            📋
          </span>
        </button>

      </div>
    </aside>
  );
};

export default Sidebar;