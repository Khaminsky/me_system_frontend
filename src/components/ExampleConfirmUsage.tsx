'use client';

/**
 * Example component demonstrating the useConfirm hook
 * This is a reference implementation - copy this pattern to your pages!
 */

import { useConfirm } from '@/hooks/useConfirm';
import { toast } from 'react-toastify';

export default function ExampleConfirmUsage() {
  // Initialize the hook - that's it!
  const { confirm, ConfirmDialogComponent } = useConfirm();

  // Example 1: Delete with danger variant
  const handleDelete = async (itemId: number, itemName: string) => {
    const confirmed = await confirm({
      title: 'Delete Item',
      message: `Are you sure you want to delete "${itemName}"? This action cannot be undone.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });

    if (!confirmed) {
      toast.info('Delete cancelled');
      return;
    }

    // Proceed with deletion
    try {
      // await apiClient.deleteItem(itemId);
      console.log('Deleting item:', itemId);
      toast.success('Item deleted successfully!');
    } catch (error: any) {
      toast.error('Failed to delete: ' + error.message);
    }
  };

  // Example 2: Warning before discarding changes
  const handleDiscardChanges = async () => {
    const confirmed = await confirm({
      title: 'Discard Changes',
      message: 'You have unsaved changes. Are you sure you want to discard them?',
      confirmText: 'Discard',
      cancelText: 'Keep Editing',
      variant: 'warning'
    });

    if (confirmed) {
      toast.info('Changes discarded');
      // Reset form or navigate away
    }
  };

  // Example 3: Info confirmation
  const handlePublish = async () => {
    const confirmed = await confirm({
      title: 'Publish Changes',
      message: 'This will make your changes visible to all users. Continue?',
      confirmText: 'Publish',
      cancelText: 'Cancel',
      variant: 'info'
    });

    if (confirmed) {
      toast.success('Published successfully!');
      // Publish logic
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">useConfirm Hook Examples</h2>
      
      <div className="space-y-3">
        <button
          onClick={() => handleDelete(1, 'Important Document')}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Delete Item (Danger)
        </button>

        <button
          onClick={handleDiscardChanges}
          className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 ml-2"
        >
          Discard Changes (Warning)
        </button>

        <button
          onClick={handlePublish}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ml-2"
        >
          Publish (Info)
        </button>
      </div>

      {/* That's all you need - one component handles all confirmations! */}
      <ConfirmDialogComponent />
    </div>
  );
}

