'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/hooks/useAuthStore';
import { apiClient } from '@/api/client';
import type { OrganizationWithRole } from '@/types';
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

const onboardingSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
});

type OnboardingForm = z.infer<typeof onboardingSchema>;

export function OnboardingPage() {
  const router = useRouter();
  const { setAuth, user, accessToken } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);

  const form = useForm<OnboardingForm>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { name: '' },
  });

  async function onSubmit(values: OnboardingForm) {
    setApiError(null);
    try {
      const { data } = await apiClient.post<OrganizationWithRole>('/organizations', values);
      if (user && accessToken) {
        setAuth({ user, accessToken, currentOrg: data });
      }
      router.push('/dashboard');
    } catch {
      setApiError('Failed to create organization. Please try again.');
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm space-y-6 rounded-lg border p-8 shadow-sm">
        <div>
          <h1 className="text-2xl font-semibold">Create your organization</h1>
          <p className="mt-1 text-sm text-muted-foreground">Set up your workspace to get started</p>
        </div>

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

            {apiError && <p className="text-sm text-destructive">{apiError}</p>}

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Creating…' : 'Create organization'}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
