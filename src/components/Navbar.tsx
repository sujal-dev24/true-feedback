'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { User } from 'next-auth';

function Navbar() {
  const { data: session } = useSession();
  const user = session?.user as User;

  return (
    <nav className="p-4 md:p-6 shadow-md bg-gray-900 text-white">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        {/* Brand Logo and Name */}
        <Link href="/" className="flex items-center space-x-2 mb-4 md:mb-0">
          <span className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            True Feedback
          </span>
        </Link>

        {/* User Session and Actions */}
        {session ? (
          <div className="flex items-center space-x-4">
            <span className="text-gray-300">
              Welcome, {user.username || user.email}
            </span>
            <Button
              onClick={() => signOut()}
              className="bg-blue-600 text-white hover:bg-blue-700 transition duration-200 transform hover:scale-105"
              variant="outline"
            >
              Logout
            </Button>
          </div>
        ) : (
          <Link href="/sign-in">
            <Button
              className="bg-blue-600 text-white hover:bg-blue-700 transition duration-200 transform hover:scale-105"
              variant="outline"
            >
              Login
            </Button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;