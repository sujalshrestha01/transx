import Category from '../models/Category.js';
import Organization from '../models/Organization.js';

const isAdmin = (org, userId) => {
  return org.admin.toString() === userId.toString();
};

// @route POST /api/categories/create
export const createCategory = async (req, res) => {
  try {
    const { name, description, orgId } = req.body;

    const org = await Organization.findById(orgId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    if (!isAdmin(org, req.user._id)) {
      return res.status(403).json({ message: 'Only admin can create categories' });
    }

    const category = await Category.create({
      name,
      description,
      organization: orgId,
      members: [],
      createdBy: req.user._id
    });

    res.status(201).json({ message: 'Category created successfully', category });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route GET /api/categories/org/:orgId
export const getCategoriesByOrg = async (req, res) => {
  try {
    const org = await Organization.findById(req.params.orgId);
    if (!org) return res.status(404).json({ message: 'Organization not found' });

    const categories = await Category.find({ organization: req.params.orgId })
      .populate('members', 'name email');

    res.status(200).json({ categories });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/categories/:categoryId
export const updateCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const org = await Organization.findById(category.organization);
    if (!isAdmin(org, req.user._id)) {
      return res.status(403).json({ message: 'Only admin can edit categories' });
    }

    category.name = name || category.name;
    category.description = description ?? category.description;
    await category.save();

    res.status(200).json({ message: 'Category updated successfully', category });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route DELETE /api/categories/:categoryId
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const org = await Organization.findById(category.organization);
    if (!isAdmin(org, req.user._id)) {
      return res.status(403).json({ message: 'Only admin can delete categories' });
    }

    await category.deleteOne();
    res.status(200).json({ message: 'Category deleted successfully' });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @route PUT /api/categories/:categoryId/members
export const updateCategoryMembers = async (req, res) => {
  try {
    const { members } = req.body; // array of userIds

    const category = await Category.findById(req.params.categoryId);
    if (!category) return res.status(404).json({ message: 'Category not found' });

    const org = await Organization.findById(category.organization);
    if (!isAdmin(org, req.user._id)) {
      return res.status(403).json({ message: 'Only admin can manage category members' });
    }

    category.members = members;
    await category.save();

    const updated = await Category.findById(category._id)
      .populate('members', 'name email');

    res.status(200).json({
      message: 'Category members updated successfully',
      category: updated
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};