import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number;
}

export function UserRoleDialog({ open, onOpenChange, userId }: UserRoleDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [role, setRole] = useState<'admin' | 'user'>('user');

  // Fetch current user data
  const { data: user, isLoading } = useQuery({
    queryKey: [`/api/admin/users/${userId}`],
    enabled: open && !!userId,
  });
  
  // Update the role when user data is loaded
  useEffect(() => {
    if (user?.role) {
      setRole(user.role);
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: async (newRole: string) => {
      return apiRequest("PUT", `/api/admin/users/${userId}/role`, { role: newRole });
    },
    onSuccess: () => {
      toast({
        title: 'Role updated',
        description: `User role has been updated to ${role}`,
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: [`/api/admin/users/${userId}`] });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to update user role. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async () => {
    mutation.mutate(role);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit User Role</DialogTitle>
          <DialogDescription>
            Change the role for this user. Admins have full access to the system.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {isLoading ? (
            <div className="text-center py-2">Loading user data...</div>
          ) : (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="username" className="text-right">
                  Username
                </Label>
                <div id="username" className="col-span-3">
                  {user?.username}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <div id="email" className="col-span-3">
                  {user?.email}
                </div>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <Select 
                  value={role} 
                  onValueChange={(value: 'admin' | 'user') => setRole(value)}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Roles</SelectLabel>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button
            type="submit" 
            onClick={handleSubmit}
            disabled={isLoading || mutation.isPending}
          >
            {mutation.isPending ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}