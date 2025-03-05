'use client';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { verifySchema } from '@/schemas/verifySchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

export default function VerifyAccount() {
  const router = useRouter();
  const params = useParams<{ username: string }>();
  const { toast } = useToast();

  // Initialize form with default values
  const form = useForm<z.infer<typeof verifySchema>>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      code: '', // Provide a default value for the code field
    },
  });

  const onSubmit = async (data: z.infer<typeof verifySchema>) => {
    try {
      const response = await axios.post<ApiResponse>(`/api/verify-code`, {
        username: params.username,
        code: data.code,
      });

      toast({
        title: 'Success',
        description: response.data.message,
      });
      router.push('/mainpage');
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Verification Failed',
        description:
          axiosError.response?.data.message ??
          'An error occurred. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-r from-gray-900 to-gray-800">
      <div className="w-full max-w-md p-10 space-y-8 bg-gray-800 rounded-lg shadow-lg border border-gray-700">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight lg:text-6xl mb-8 text-white">
            Verify Your Account
          </h1>
          <p className="mb-6 text-lg text-gray-300">
            Enter the verification code sent to your email
          </p>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              name="code"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold text-gray-300">
                    Verification Code
                  </FormLabel>
                  <Input
                    {...field}
                    className="bg-gray-700 text-white border-gray-600 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                  />
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
            >
              Verify
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}