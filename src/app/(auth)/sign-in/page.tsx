'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { signIn } from 'next-auth/react';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInSchema } from '@/schemas/signInSchema';
import { useToast } from '@/hooks/use-toast';

export default function SignInForm() {
  const router = useRouter();

  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { toast } = useToast();
  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    const result = await signIn('credentials', {
      redirect: false,
      identifier: data.email,
      password: data.password,
    });

    if (result?.error) {
      if (result.error === 'CredentialsSignin') {
        toast({
          title: 'Login Failed',
          description: 'Incorrect username or password',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description: result.error,
          variant: 'destructive',
        });
      }
    }

    if (result?.url) {
      router.replace('/mainpage');
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-10 space-y-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-8 text-white">
            Welcome Back to True Feedback
          </h1>
          <p className="mb-6 text-lg text-gray-300">
            Sign in to continue your secret conversations
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email/Username</FormLabel>
                  <Input
                    {...field}
                    className="bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Password</FormLabel>
                  <Input
                    type="password"
                    {...field}
                    className="bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition duration-300"
            >
              Sign In
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p className="text-gray-300">
            Not a member yet?{' '}
            <Link
              href="/sign-up"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
} 