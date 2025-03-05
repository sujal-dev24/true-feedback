'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Mail } from 'lucide-react'; // Assuming you have an icon for messages
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Autoplay from 'embla-carousel-autoplay';
import messages from '@/messages.json';

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function Home() {
  return (
    <>
      {/* Main content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 md:px-24 py-12 bg-gradient-to-b from-gray-900 to-gray-800 text-white">
        <section className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Dive into the World of Anonymous Feedback
          </h1>
          <p className="mt-4 md:mt-6 text-lg md:text-xl text-gray-300">
            True Feedback - Where your identity remains a secret.
          </p>
          <div className="mt-6">
            <Link href="/sign-up">
              <Button className="bg-blue-600 text-white hover:bg-blue-700 transition duration-200 transform hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>
        </section>

        {/* Carousel for Messages */}
        <Carousel
          plugins={[Autoplay({ delay: 2000 })]}
          className="w-full max-w-lg md:max-w-xl"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index} className="p-4">
                <Card className="bg-gray-800 border-gray-700 hover:border-blue-500 transition duration-200 transform hover:scale-105">
                  <CardHeader>
                    <CardTitle className="text-xl text-blue-400">
                      {message.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                    <Mail className="flex-shrink-0 text-blue-400" />
                    <div>
                      <p className="text-gray-300">{message.content}</p>
                      <p className="text-xs text-gray-400">
                        {message.received}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="text-white hover:text-blue-500" />
          <CarouselNext className="text-white hover:text-blue-500" />
        </Carousel>
      </main>

      {/* Footer */}
      <footer className="text-center p-4 md:p-6 bg-gray-900 text-white border-t border-gray-800">
        © 2023 True Feedback. All rights reserved.
      </footer>
    </>
  );
}

