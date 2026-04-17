'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface InviteDetails {
  email: string;
  organization: { name: string };
  role: { name: string };
  team?: { name: string } | null;
}

export default function InvitePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') || '';

  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchInvite = async () => {
      try {
        const { data } = await api.get(`/users/invites/${token}`);
        setInvite(data);
      } catch (error) {
        toast.error('Invite is invalid or expired');
      } finally {
        setLoading(false);
      }
    };

    fetchInvite();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/users/invites/${token}/accept`, {
        firstName,
        lastName,
        password,
      });
      toast.success('Account created. Please log in.');
      router.push('/login');
    } catch (error) {
      toast.error('Failed to accept invite');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Loading invite…</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!token || !invite) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Invite unavailable</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>This invite link is invalid or has expired.</p>
            <Button onClick={() => router.push('/login')}>Back to login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Accept invite</CardTitle>
          <p className="text-sm text-muted-foreground">
            Join {invite.organization.name} as {invite.role.name.replace(/_/g, ' ')}
            {invite.team?.name ? ` · ${invite.team.name}` : ''}
          </p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input value={invite.email} disabled />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label>First name</Label>
                <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label>Last name</Label>
                <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Confirm password</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
