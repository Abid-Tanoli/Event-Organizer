import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { categoriesAPI } from '@/api/categories';
import { Category } from '@/types';
import Modal from '@/components/common/Modal';
import { toast } from 'sonner';
import { Plus, Trash2, Edit2, Tags, MoreHorizontal, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogCancel, AlertDialogAction,
} from '@/components/ui/alert-dialog';
import Pagination from '@/components/common/Pagination';
import Loader from '@/components/common/Loader';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').trim(),
});
type CategoryFormValues = z.infer<typeof categorySchema>;

const ITEMS_PER_PAGE = 10;

const CategoriesManagement: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const createForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

  const editForm = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: '' },
  });

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

  const handleCreate = async (data: CategoryFormValues) => {
    try {
      await categoriesAPI.create({ name: data.name });
      toast.success('Category created successfully');
      setShowCreateModal(false);
      createForm.reset();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create category');
    }
  };

  const handleUpdate = async (data: CategoryFormValues) => {
    if (!editingCategory) return;
    try {
      await categoriesAPI.update(editingCategory._id, { name: data.name });
      toast.success('Category updated successfully');
      setShowEditModal(false);
      setEditingCategory(null);
      editForm.reset();
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update category');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await categoriesAPI.delete(deleteTargetId);
      toast.success('Category deleted successfully');
      setDeleteTargetId(null);
      fetchCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    editForm.setValue('name', category.name);
    setShowEditModal(true);
  };

  const filteredCategories = categories.filter((cat) => {
    return !searchTerm || cat.name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredCategories.length / ITEMS_PER_PAGE);
  const paginatedCategories = filteredCategories.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-background min-h-screen">
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Categories Management</h1>
          <Button
            onClick={() => { createForm.reset(); setShowCreateModal(true); }}
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </div>

        {categories.length > 0 && (
          <div className="mb-6 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                className="pl-9"
              />
            </div>
          </div>
        )}

        {loading ? (
          <Loader />
        ) : categories.length === 0 ? (
          <div className="bg-card rounded-xl shadow-lg p-12 text-center">
            <Tags className="w-16 h-16 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">No categories yet</p>
            <p className="text-muted-foreground mt-2">Create your first category to get started</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl shadow-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCategories.map((cat) => (
                  <TableRow key={cat._id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Tags className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{cat.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(cat)}>
                            <Edit2 className="w-4 h-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => setDeleteTargetId(cat._id)}
                          >
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="pb-4">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          </div>
        )}
      </div>

      {/* Delete AlertDialog */}
      <AlertDialog open={!!deleteTargetId} onOpenChange={(open) => !open && setDeleteTargetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Category Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create Category"
      >
        <form onSubmit={createForm.handleSubmit(handleCreate)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="createCatName">Category Name *</Label>
            <Input
              id="createCatName"
              placeholder="Enter category name"
              {...createForm.register('name')}
              onKeyDown={(e) => e.key === 'Enter' && createForm.handleSubmit(handleCreate)()}
            />
            {createForm.formState.errors.name && (
              <p className="text-xs text-destructive">{createForm.formState.errors.name.message}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Create Category</Button>
            <Button type="button" variant="outline" onClick={() => setShowCreateModal(false)} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setEditingCategory(null); editForm.reset(); }}
        title="Edit Category"
      >
        <form onSubmit={editForm.handleSubmit(handleUpdate)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="editCatName">Category Name *</Label>
            <Input
              id="editCatName"
              placeholder="Enter category name"
              {...editForm.register('name')}
              onKeyDown={(e) => e.key === 'Enter' && editForm.handleSubmit(handleUpdate)()}
            />
            {editForm.formState.errors.name && (
              <p className="text-xs text-destructive">{editForm.formState.errors.name.message}</p>
            )}
          </div>
          <div className="flex gap-2">
            <Button type="submit" className="flex-1">Update Category</Button>
            <Button type="button" variant="outline" onClick={() => {
              setShowEditModal(false);
              setEditingCategory(null);
              editForm.reset();
            }} className="flex-1">Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CategoriesManagement;
