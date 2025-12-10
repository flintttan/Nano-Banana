'use client';

import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  AdminUser,
  fetchAdminUsers,
  updateUserStatus,
  adjustUserPoints,
} from '@/lib/api';
import { toast } from 'sonner';
import {
  Search,
  UserCheck,
  UserX,
  Plus,
  Minus,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [adjustingPoints, setAdjustingPoints] = useState<number | null>(null);
  const [pointsDialogOpen, setPointsDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [pointsAmount, setPointsAmount] = useState(0);
  const [pointsReason, setPointsReason] = useState('');
  const [togglingStatus, setTogglingStatus] = useState<number | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusToggle = async (userId: number, currentStatus: boolean) => {
    try {
      setTogglingStatus(userId);
      await updateUserStatus(userId, !currentStatus);
      setUsers(
        users.map((user) =>
          user.id === userId ? { ...user, is_active: !currentStatus } : user
        )
      );
      toast.success(
        `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`
      );
    } catch (error) {
      console.error('Failed to update user status:', error);
      toast.error('Failed to update user status');
    } finally {
      setTogglingStatus(null);
    }
  };

  const handlePointsAdjust = async () => {
    if (!selectedUser || pointsAmount === 0) return;

    try {
      setAdjustingPoints(selectedUser.id);
      await adjustUserPoints(selectedUser.id, pointsAmount, pointsReason);
      toast.success(`Points adjusted successfully`);
      setPointsDialogOpen(false);
      setPointsAmount(0);
      setPointsReason('');
      loadUsers();
    } catch (error) {
      console.error('Failed to adjust points:', error);
      toast.error('Failed to adjust points');
    } finally {
      setAdjustingPoints(null);
    }
  };

  const openPointsDialog = (user: AdminUser) => {
    setSelectedUser(user);
    setPointsAmount(0);
    setPointsReason('');
    setPointsDialogOpen(true);
  };

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Refresh */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-gray-950 border-gray-800 text-white"
          />
        </div>
        <Button
          onClick={loadUsers}
          variant="outline"
          className="border-gray-800 text-gray-300 hover:bg-gray-800"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Users Table */}
      <Card className="bg-gray-950 border-gray-800">
        <CardHeader>
          <CardTitle className="text-white">
            Users ({filteredUsers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-gray-900/50">
                  <TableHead className="text-gray-400">User</TableHead>
                  <TableHead className="text-gray-400">Email</TableHead>
                  <TableHead className="text-gray-400">Points</TableHead>
                  <TableHead className="text-gray-400">Creations</TableHead>
                  <TableHead className="text-gray-400">Check-ins</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Joined</TableHead>
                  <TableHead className="text-gray-400 text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow
                    key={user.id}
                    className="border-gray-800 hover:bg-gray-900/50"
                  >
                    <TableCell className="font-medium text-white">
                      {user.username}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.drawing_points}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.creation_count}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {user.checkin_count}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={user.is_active}
                          onCheckedChange={() =>
                            handleStatusToggle(user.id, user.is_active)
                          }
                          disabled={togglingStatus === user.id}
                        />
                        <Badge
                          variant={user.is_active ? 'default' : 'secondary'}
                          className={
                            user.is_active
                              ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20'
                              : 'bg-gray-500/10 text-gray-400 hover:bg-gray-500/20'
                          }
                        >
                          {user.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(user.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        onClick={() => openPointsDialog(user)}
                        size="sm"
                        variant="outline"
                        className="border-gray-800 text-gray-300 hover:bg-gray-800"
                        disabled={adjustingPoints === user.id}
                      >
                        {adjustingPoints === user.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <>
                            <Plus className="h-4 w-4 mr-1" />
                            Adjust Points
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              No users found
            </div>
          )}
        </CardContent>
      </Card>

      {/* Points Adjustment Dialog */}
      <Dialog open={pointsDialogOpen} onOpenChange={setPointsDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle>Adjust User Points</DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedUser && (
                <>
                  Adjust points for <strong>{selectedUser.username}</strong>
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="points" className="text-gray-300">
                Points Amount
              </Label>
              <Input
                id="points"
                type="number"
                value={pointsAmount}
                onChange={(e) => setPointsAmount(parseInt(e.target.value) || 0)}
                placeholder="Enter positive or negative number"
                className="bg-gray-950 border-gray-800 text-white"
              />
              <p className="text-xs text-gray-400">
                Use negative number to deduct points, positive to add
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason" className="text-gray-300">
                Reason (Optional)
              </Label>
              <Textarea
                id="reason"
                value={pointsReason}
                onChange={(e) => setPointsReason(e.target.value)}
                placeholder="Reason for adjustment"
                className="bg-gray-950 border-gray-800 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPointsDialogOpen(false)}
              className="border-gray-800 text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button
              onClick={handlePointsAdjust}
              disabled={pointsAmount === 0 || adjustingPoints !== null}
              className="bg-primary-500 hover:bg-primary-600"
            >
              {adjustingPoints !== null ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adjusting...
                </>
              ) : (
                'Adjust Points'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
