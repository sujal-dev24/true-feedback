"use client";

import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { Key, useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AcceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { Message } from '@/model/User';
import { useToast } from '@/hooks/use-toast';
import { ApiResponse } from '@/types/ApiResponse';
import { MessageCard } from '@/components/MessageCard';

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { toast } = useToast();
  const { data: session } = useSession();

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch('acceptMessages');

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/accept-messages');
      setValue('acceptMessages', response.data.isAcceptingMessages ?? false);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch message settings',
        variant: 'destructive',
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(async (refresh: boolean = false) => {
    setIsLoading(true);
    try {
      const response = await axios.get<ApiResponse>('/api/get-messages');
      if (response.data.messages) {
        setMessages(response.data.messages);
      } else {
        toast({
          title: 'Error',
          description: 'No messages found for the user',
          variant: 'destructive',
        });
      }
      if (refresh) {
        toast({
          title: 'Refreshed Messages',
          description: 'Showing latest messages',
        });
      }
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to fetch messages',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (!session || !session.user) return;
    console.log("Session Data:", session); // Debug session data
    fetchMessages();
    fetchAcceptMessages();
  }, [session, fetchAcceptMessages, fetchMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>('/api/accept-messages', {
        acceptMessages: !acceptMessages,
      });
      setValue('acceptMessages', !acceptMessages);
      toast({
        title: response.data.message,
        variant: 'default',
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: 'Error',
        description: axiosError.response?.data.message ?? 'Failed to update message settings',
        variant: 'destructive',
      });
    }
  };

  if (!session || !session.user) {
    return <div>Please log in to access the dashboard.</div>;
  }

  const { username } = session.user as User;
  const profileUrl = `${window.location.protocol}//${window.location.host}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: 'URL Copied!',
      description: 'Profile URL has been copied to clipboard.',
    });
  };

  return (
    <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl shadow-lg hover:transition transform hover:scale-105">
      <h1 className="text-4xl font-bold mb-4 text-center">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>
        <div className="flex items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mr-2 border-2 border-gray-300 rounded hover:border-blue-600 hover:transition"
          />
          <Button className="bg-blue-500 text-white hover:bg-blue-600 transition duration-200" onClick={copyToClipboard}>Copy</Button>
        </div>
      </div>
      <div className="mb-4">
        <Switch
          {...register('acceptMessages')}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2">Accept Messages: {acceptMessages ? 'On' : 'Off'}</span>
      </div>
      <Separator />
      <Button
        className="mt-4 bg-green-500 text-white hover:bg-green-600 transition duration-200"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
      </Button>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p>Loading messages...</p>
          </div>
        ) : messages.length > 0 ? (
          messages.map((message) => (
            <div className="bg-gray-100 p-4 rounded shadow-md" key={message._id as Key}>
              <MessageCard
                message={message}
                onMessageDelete={(id) => setMessages(messages.filter(m => m._id !== id))}
              />
            </div>
          ))
        ) : (
          <p>No messages to display.</p>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;


