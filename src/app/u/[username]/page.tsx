'use client';

import React, { useState } from 'react';
import axios, { AxiosError } from 'axios';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CardHeader, CardContent, Card } from '@/components/ui/card';
import { useCompletion } from 'ai/react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import * as z from 'zod';
import { ApiResponse } from '@/types/ApiResponse';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { messageSchema } from '@/schemas/messageSchema';
import { toast } from '@/hooks/use-toast';

const specialChar = '||';

const parseStringMessages = (messageString: string): string[] => {
  return messageString.split(specialChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const {
    complete,
    completion,
    isLoading: isSuggestLoading,
    error,
  } = useCompletion({
    api: '/api/suggest-messages',
    initialCompletion: initialMessageString,
  });

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch('content');

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>('/api/send-message', {
        ...data,
        username,
      });

      toast({
        title: response.data.message,
        variant: 'default',
      });
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description:
          axiosError.response?.data.message ?? 'Failed to sent message',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestedMessages = async () => {
    try {
      complete('');
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Handle error appropriately
    }
  };

  return (
    <div className="container mx-auto my-8 p-8 bg-gray-900 rounded-lg shadow-lg max-w-4xl">
      <h1 className="text-4xl font-bold mb-8 text-center text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
        Public Profile Link
      </h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg font-semibold text-gray-300">
                  Send Anonymous Message to @{username}
                </FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Write your anonymous message here"
                    className="resize-none border border-gray-700 rounded-md p-4 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-gray-800 text-white"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />
          <div className="flex justify-center">
            {isLoading ? (
              <Button disabled className="bg-blue-600 text-white flex items-center">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading || !messageContent}
                className="bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
              >
                Send It
              </Button>
            )}
          </div>
        </form>
      </Form>

      <div className="space-y-6 my-8">
        <div className="space-y-2">
          <Button
            onClick={fetchSuggestedMessages}
            className="my-4 bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
            disabled={isSuggestLoading}
          >
            Suggest Messages
          </Button>
          <p className="text-gray-400 text-center">
            Click on any message below to select it.
          </p>
        </div>
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <h3 className="text-xl font-semibold text-blue-400">
              Suggested Messages
            </h3>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            {error ? (
              <p className="text-red-500 text-center">{error.message}</p>
            ) : (
              parseStringMessages(completion).map((message, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="mb-2 border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition duration-200"
                  onClick={() => handleMessageClick(message)}
                >
                  {message}
                </Button>
              ))
            )}
          </CardContent>
        </Card>
      </div>
      <Separator className="my-6 bg-gray-700" />
      <div className="text-center">
        <div className="mb-4 text-lg font-semibold text-gray-300">
          Get Your Message Board
        </div>
        <Link href={'/sign-up'}>
          <Button className="bg-blue-600 text-white hover:bg-blue-700 transition duration-200">
            Create Your Account
          </Button>
        </Link>
      </div>
    </div>
  );
}