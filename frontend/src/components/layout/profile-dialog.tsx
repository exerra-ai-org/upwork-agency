'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useAuthContext } from '@/components/auth-provider';
import { useUpdateProfile, useChangePassword } from '@/hooks/use-profile';
import {
  useUpworkAccounts,
  useCreateUpworkAccount,
  useDeleteUpworkAccount,
  useSetDefaultUpworkAccount,
} from '@/hooks/use-upwork-accounts';
import { Trash2 } from 'lucide-react';

interface ProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileDialog({ open, onOpenChange }: ProfileDialogProps) {
  const { fullUser, refreshMe } = useAuthContext();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  // Upwork accounts
  const { data: upworkAccounts } = useUpworkAccounts();
  const createUpworkAccount = useCreateUpworkAccount();
  const deleteUpworkAccount = useDeleteUpworkAccount();
  const setDefaultAccount = useSetDefaultUpworkAccount();
  const [newAccountName, setNewAccountName] = useState('');
  const [newAccountUrl, setNewAccountUrl] = useState('');

  useEffect(() => {
    if (open && fullUser) {
      setFirstName(fullUser.firstName ?? '');
      setLastName(fullUser.lastName ?? '');
    }
  }, [open, fullUser]);

  function handleProfileSave() {
    updateProfile.mutate(
      { firstName: firstName || undefined, lastName: lastName || undefined },
      {
        onSuccess: () => {
          refreshMe();
          onOpenChange(false);
        },
      },
    );
  }

  function handlePasswordSave() {
    setPasswordError('');
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      return;
    }
    changePassword.mutate(
      { currentPassword, newPassword },
      {
        onSuccess: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          onOpenChange(false);
        },
      },
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
          <DialogDescription>Update your display name or change your password.</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="profile" className="mt-2">
          <TabsList className="w-full">
            <TabsTrigger value="profile" className="flex-1">
              Edit Profile
            </TabsTrigger>
            <TabsTrigger value="password" className="flex-1">
              Password
            </TabsTrigger>
            <TabsTrigger value="upwork" className="flex-1">
              Upwork
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="First name"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Last name"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={fullUser?.email ?? ''} disabled className="text-muted-foreground" />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleProfileSave} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="password" className="space-y-4 pt-4">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter current password"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min 6 characters"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
              />
            </div>
            {passwordError && <p className="text-sm text-destructive">{passwordError}</p>}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button
                onClick={handlePasswordSave}
                disabled={changePassword.isPending || !currentPassword || !newPassword}
              >
                {changePassword.isPending ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="upwork" className="space-y-4 pt-4">
            <p className="text-sm text-muted-foreground">
              Link your Upwork accounts. These appear as options when setting bid details on
              projects.
            </p>

            {/* Existing accounts */}
            {upworkAccounts && upworkAccounts.length > 0 ? (
              <div className="space-y-2">
                {upworkAccounts.map((acc) => (
                  <div
                    key={acc.id}
                    className="flex items-center justify-between rounded-md border px-3 py-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{acc.accountName}</span>
                      {acc.isDefault && (
                        <Badge variant="secondary" className="text-[10px]">
                          Default
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {!acc.isDefault && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs"
                          onClick={() => setDefaultAccount.mutate(acc.id)}
                        >
                          Set Default
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => deleteUpworkAccount.mutate(acc.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No Upwork accounts linked yet.</p>
            )}

            {/* Add new account */}
            <div className="space-y-2 rounded-md border p-3">
              <Label className="text-xs font-semibold">Link New Account</Label>
              <Input
                placeholder="Account name (e.g. AOP_Main)"
                value={newAccountName}
                onChange={(e) => setNewAccountName(e.target.value)}
              />
              <Input
                placeholder="Profile URL (optional)"
                value={newAccountUrl}
                onChange={(e) => setNewAccountUrl(e.target.value)}
              />
              <Button
                size="sm"
                disabled={!newAccountName || createUpworkAccount.isPending}
                onClick={() => {
                  createUpworkAccount.mutate(
                    {
                      accountName: newAccountName,
                      profileUrl: newAccountUrl || undefined,
                    },
                    {
                      onSuccess: () => {
                        setNewAccountName('');
                        setNewAccountUrl('');
                      },
                    },
                  );
                }}
              >
                {createUpworkAccount.isPending ? 'Linking...' : 'Link Account'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
