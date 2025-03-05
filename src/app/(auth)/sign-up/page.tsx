'use client';

import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { signUpSchema } from '@/schemas/signUpSchema';
import { useDebounceCallback } from 'usehooks-ts';

export default function SignUpForm() {
  const [username, setUsername] = useState('');
  const [usernameMessage, setUsernameMessage] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signUpSchema>>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
    },
  });

  // Debounced username check
  const checkUsernameUnique = useDebounceCallback(async (username: string) => {
    if (username) {
      setIsCheckingUsername(true);
      setUsernameMessage('');
      try {
        const response = await axios.get<ApiResponse>(
          `/api/check-username-unique?username=${username}`
        );
        setUsernameMessage(response.data.message);
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        setUsernameMessage(
          axiosError.response?.data.message ?? 'Error checking username'
        );
      } finally {
        setIsCheckingUsername(false);
      }
    }
  }, 300);

  useEffect(() => {
    if (username) {
      checkUsernameUnique(username);
    }
  }, [username]);

  const onSubmit = async (data: z.infer<typeof signUpSchema>) => {
    setIsSubmitting(true);
    try {
      const response = await axios.post<ApiResponse>('/api/sign-up', data);

      toast({
        title: 'Success',
        description: response.data.message,
      });

      router.replace(`/verify/${username}`);
    } catch (error) {
      console.error('Error during sign-up:', error);

      const axiosError = error as AxiosError<ApiResponse>;
      const errorMessage =
        axiosError.response?.data.message ||
        'There was a problem with your sign-up. Please try again.';

      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900">
      <div className="w-full max-w-md p-10 space-y-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-8 text-white">
            Join True Feedback
          </h1>
          <p className="mb-6 text-lg text-gray-300">
            Sign up to start your anonymous adventure
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="username"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Username</FormLabel>
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      setUsername(e.target.value);
                    }}
                    className="bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {isCheckingUsername && <Loader2 className="animate-spin text-blue-500" />}
                  {!isCheckingUsername && usernameMessage && (
                    <p
                      className={`text-sm ${
                        usernameMessage === 'Username is unique'
                          ? 'text-green-500'
                          : 'text-red-500'
                      }`}
                    >
                      {usernameMessage}
                    </p>
                  )}
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-gray-300">Email</FormLabel>
                  <Input
                    {...field}
                    name="email"
                    className="bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <p className="text-muted text-gray-400 text-sm">
                    We will send you a verification code
                  </p>
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
                    name="password"
                    className="bg-gray-700 text-white border-gray-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition duration-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                'Sign Up'
              )}
            </Button>
          </form>
        </Form>
        <div className="text-center mt-4">
          <p className="text-gray-300">
            Already a member?{' '}
            <Link
              href="/sign-in"
              className="text-blue-400 hover:text-blue-300 underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}