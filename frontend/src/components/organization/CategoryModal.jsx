const CategoryModal = ({ show, editing, form, loading, error, onChange, onSave, onClose }) => {
  if (!show) return null;

  // Safety check — if form is undefined use empty defaults
  const safeForm = form || { name: '', description: '' };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-white font-semibold text-lg mb-5">
          {editing ? 'Edit Category' : 'New Category'}
        </h3>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-2 rounded-lg mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Category Name</label>
            <input
              type="text"
              value={safeForm.name}
              onChange={(e) => onChange({ ...safeForm, name: e.target.value })}
              placeholder="e.g. Engineering, Design, Sales"
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Description (optional)</label>
            <input
              type="text"
              value={safeForm.description}
              onChange={(e) => onChange({ ...safeForm, description: e.target.value })}
              placeholder="Brief description"
              className="w-full bg-gray-800 text-white rounded-lg px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-600"
            />
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-400 hover:text-white transition"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={loading}
            className="px-5 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : editing ? 'Save Changes' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;