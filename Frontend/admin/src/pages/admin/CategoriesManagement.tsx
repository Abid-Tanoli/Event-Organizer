import React, { useEffect, useState } from 'react';
import { categoriesAPI } from '@/api/categories';
import { Category } from '@/types';
import Button from '@/components/common/Button';
import Modal from '@/components/common/Modal';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, Tags } from 'lucide-react';

const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response);
    } catch {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      await categoriesAPI.create({ name: newName.trim() });
      toast.success('Category created successfully');
      setShowCreateModal(false);
      setNewName('');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  };

  const handleUpdate = async () => {
    if (!editingCategory || !newName.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      await categoriesAPI.update(editingCategory._id, { name: newName.trim() });
      toast.success('Category updated successfully');
      setShowEditModal(false);
      setEditingCategory(null);
      setNewName('');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      await categoriesAPI.delete(id);
      toast.success('Category deleted successfully');
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setNewName(category.name);
    setShowEditModal(true);
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Categories Management</h1>
          <Button
            variant="primary"
            onClick={() => {
              setNewName('');
              setShowCreateModal(true);
            }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading categories...</p>
          </div>
        ) : categories.length === 0 ? (
          <div className="bg-card rounded-xl shadow-lg p-12 text-center">
            <Tags className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No categories yet</p>
            <p className="text-muted-foreground mt-2">Create your first category to get started</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-muted/60">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Created At
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {categories.map((cat) => (
                  <tr key={cat._id} className="hover:bg-muted/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Tags className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{cat.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => openEditModal(cat)}
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() => handleDelete(cat._id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Category Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Category"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Category Name
            </label>
            <input
              type="text"
              placeholder="Enter category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleCreate} className="flex-1">
              Create Category
            </Button>
            <Button
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCategory(null);
          setNewName('');
        }}
        title="Edit Category"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-2">
              Category Name
            </label>
            <input
              type="text"
              placeholder="Enter category name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
              onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="primary" onClick={handleUpdate} className="flex-1">
              Update Category
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                setEditingCategory(null);
                setNewName('');
              }}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CategoriesManagement;
