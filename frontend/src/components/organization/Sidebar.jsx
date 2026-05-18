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
    <aside className=" w-64   shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col ">

      {/* Nav Items */}
      <nav className="flex-1 p-4 space-y-1 pt-6">
        <p className="text-gray-600 text-xs uppercase tracking-widest font-semibold px-3 mb-3">
          Workspace
        </p>
        {navItems.map(({ id, icon, label, count }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition
              ${activeTab === id
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
          >
            <span className="flex items-center gap-3">
              <span className="text-base">{icon}</span>
              {label}
            </span>
            {count !== undefined && (
              <span className={`text-xs px-2 py-0.5 rounded-full
                ${activeTab === id ? 'bg-white/20 text-white' : 'bg-gray-800 text-gray-500'}`}>
                {count}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 space-y-4 border-t border-gray-800">

        {/* Storage */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-xs font-medium">💾 Storage</p>
            <p className="text-gray-500 text-xs">{formatStorage(storageUsed)} / 500 MB</p>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full transition-all ${storagePercent > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
              style={{ width: `${storagePercent}%` }}
            />
          </div>
          {storagePercent > 80 && (
            <p className="text-red-400 text-xs mt-1">Storage almost full!</p>
          )}
        </div>

        {/* Join Code */}
        <div
          onClick={copyJoinCode}
          className="flex items-center justify-between bg-gray-800 hover:bg-gray-700 px-3 py-2.5 rounded-xl cursor-pointer transition group"
        >
          <div>
            <p className="text-gray-500 text-xs">Join Code</p>
            <p className="text-blue-400 font-mono text-sm font-semibold">{org?.joinCode}</p>
          </div>
          <span className="text-gray-600 group-hover:text-gray-400 text-xs transition">
            📋 Copy
          </span>
        </div>

      </div>
    </aside>
  );
};

export default Sidebar;