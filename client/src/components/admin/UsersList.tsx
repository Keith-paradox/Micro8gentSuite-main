import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil, Info } from 'lucide-react';
import { format } from 'date-fns';
import { useLocation } from 'wouter';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  business?: {
    businessName: string;
    businessType: string;
  } | null;
  subscription?: {
    plan: string;
    status: string;
  } | null;
}

interface UsersListProps {
  users: User[];
  onEditRole: (userId: number) => void;
}

export function UsersList({ users, onEditRole }: UsersListProps) {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter(
    (user) =>
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.business?.businessName && 
        user.business.businessName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewDetails = (userId: number) => {
    setLocation(`/admin/user/${userId}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>User Management</CardTitle>
          <div className="w-64">
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Subscription</TableHead>
              <TableHead>Signup Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{user.username}</span>
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.business ? (
                      <div className="flex flex-col">
                        <span>{user.business.businessName}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {user.business.businessType.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Not set up</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.subscription ? (
                      <div className="flex flex-col">
                        <Badge variant={user.subscription.plan === 'free' ? 'outline' : 'secondary'}>
                          {user.subscription.plan}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {user.subscription.status}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No subscription</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.createdAt), 'MMM d, yyyy')}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onEditRole(user.id)}
                        title="Edit Role"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline" 
                        size="icon"
                        onClick={() => handleViewDetails(user.id)}
                        title="View Details"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}