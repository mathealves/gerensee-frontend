'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '@/hooks/useAuthStore';
import { useOrganization } from '@/features/organizations/hooks/useOrganization';
import { updateOrganization } from '@/api/organizations';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const settingsSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
});
type SettingsForm = z.infer<typeof settingsSchema>;

export function OrgSettingsPage() {
  const currentOrg = useAuthStore((s) => s.currentOrg);
  const { data: org } = useOrganization();
  const queryClient = useQueryClient();
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    values: { name: org?.name ?? '' },
  });

  async function onSubmit(values: SettingsForm) {
    if (!currentOrg) return;
    setApiError(null);
    setSuccess(false);
    try {
      await updateOrganization(currentOrg.id, values);
      queryClient.invalidateQueries({ queryKey: ['organization', currentOrg.id] });
      setSuccess(true);
    } catch {
      setApiError('Failed to update organization. Please try again.');
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Organization Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your organization details</p>
      </div>

      <div className="max-w-md rounded-lg border p-6">
        <h2 className="mb-4 text-lg font-semibold">General</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organization name</FormLabel>
                  <FormControl>
                    <Input placeholder="Acme Inc." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {success && <p className="text-sm text-green-600">Organization name updated!</p>}
            {apiError && <p className="text-sm text-destructive">{apiError}</p>}

            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
