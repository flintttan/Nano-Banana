'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  AdminInspiration,
  fetchAdminInspirations,
  createInspiration,
  deleteInspiration,
} from '@/lib/api';
import { toast } from 'sonner';
import {
  Plus,
  Trash2,
  Loader2,
  Lightbulb,
  RefreshCw,
  Calendar,
  Copy,
} from 'lucide-react';

export function Inspirations() {
  const [inspirations, setInspirations] = useState<AdminInspiration[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [prompt, setPrompt] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    loadInspirations();
  }, []);

  const loadInspirations = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminInspirations();
      setInspirations(data);
    } catch (error) {
      console.error('Failed to load inspirations:', error);
      toast.error('Failed to load inspirations');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!title.trim() || !prompt.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      setCreating(true);
      await createInspiration(title, prompt);
      toast.success('Inspiration created successfully');
      setCreateDialogOpen(false);
      setTitle('');
      setPrompt('');
      loadInspirations();
    } catch (error) {
      console.error('Failed to create inspiration:', error);
      toast.error('Failed to create inspiration');
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this inspiration?')) {
      return;
    }

    try {
      setDeleting(id);
      await deleteInspiration(id);
      toast.success('Inspiration deleted successfully');
      loadInspirations();
    } catch (error) {
      console.error('Failed to delete inspiration:', error);
      toast.error('Failed to delete inspiration');
    } finally {
      setDeleting(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">
            Inspiration Prompts
          </h2>
          <p className="text-gray-400">
            Manage creative prompts for image generation
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={loadInspirations}
            variant="outline"
            className="border-gray-800 text-gray-300 hover:bg-gray-800"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => setCreateDialogOpen(true)}
            className="bg-primary-500 hover:bg-primary-600"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Inspiration
          </Button>
        </div>
      </div>

      {/* Inspirations List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inspirations.map((inspiration) => (
          <Card
            key={inspiration.id}
            className="bg-gray-950 border-gray-800 hover:border-gray-700 transition-colors"
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  <CardTitle className="text-white text-lg">
                    {inspiration.title}
                  </CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    onClick={() => copyToClipboard(inspiration.prompt)}
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-primary-400 hover:bg-primary-500/10"
                    title="Copy prompt"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={() => handleDelete(inspiration.id)}
                    size="sm"
                    variant="ghost"
                    className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    disabled={deleting === inspiration.id}
                  >
                    {deleting === inspiration.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-lg p-3 mb-4">
                <p className="text-gray-300 text-sm line-clamp-4">
                  {inspiration.prompt}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="h-3 w-3" />
                  <span>
                    {new Date(inspiration.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <Button
                  onClick={() => copyToClipboard(inspiration.prompt)}
                  size="sm"
                  variant="outline"
                  className="border-gray-800 text-gray-300 hover:bg-gray-800 text-xs"
                >
                  Copy
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {inspirations.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-400">
            <Lightbulb className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No inspirations yet</p>
            <p className="text-sm">Create your first inspiration prompt to get started</p>
          </div>
        )}
      </div>

      {/* Create Inspiration Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Create New Inspiration</DialogTitle>
            <DialogDescription className="text-gray-400">
              Create a new inspiration prompt for image generation
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-gray-300">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter inspiration title"
                className="bg-gray-950 border-gray-800 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prompt" className="text-gray-300">
                Prompt
              </Label>
              <Textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter the creative prompt text"
                rows={6}
                className="bg-gray-950 border-gray-800 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setCreateDialogOpen(false);
                setTitle('');
                setPrompt('');
              }}
              className="border-gray-800 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !title.trim() || !prompt.trim()}
              className="bg-primary-500 hover:bg-primary-600"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Inspiration'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
