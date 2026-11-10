'use client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import messages from '@/message.json';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Clock } from "lucide-react";

export default function Home() {


  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col justify-between">
      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Hero Section */}
        <section className="text-center max-w-2xl mx-auto mb-10 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
            Mystery Messages & Feedback
          </h1>
          <p className="text-base sm:text-lg text-gray-600 leading-relaxed">
            Explore real-time feedback and anonymous messages shared across the community.
          </p>
        </section>

        {/* Carousel Section */}
        <div className="w-full max-w-sm sm:max-w-md md:max-w-lg px-8 relative">
          <Carousel
            plugins={[Autoplay({ delay: 4000, stopOnInteraction: false })]}
            className="w-full"
          >
            <CarouselContent>
              {messages.map((msg, index) => (
                <CarouselItem key={index}>
                  <div className="p-2">
                    <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <CardHeader className="pb-3 border-b border-gray-100">
                        <CardTitle className="flex items-center gap-2 text-base font-semibold text-gray-900">
                          <Mail className="w-4 h-4 text-gray-500 shrink-0" />
                          <span className="truncate">{msg.title}</span>
                        </CardTitle>
                      </CardHeader>

                      <CardContent className="pt-4 min-h-[100px] flex items-center">
                        <p className="text-gray-700 text-sm sm:text-base italic">
                          "{msg.content}"
                        </p>
                      </CardContent>

                      <CardFooter className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-gray-400" />
                          {msg.received_in}
                        </span>
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 border border-gray-200 text-[10px] font-medium uppercase tracking-wider">
                          Received
                        </span>
                      </CardFooter>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden sm:flex -left-10 text-gray-600 border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900" />
            <CarouselNext className="hidden sm:flex -right-10 text-gray-600 border-gray-300 bg-white hover:bg-gray-100 hover:text-gray-900" />
          </Carousel>
        </div>
      </main>

      {/* Footer Section */}
      <footer className="w-full border-t border-gray-100 py-6 text-center text-xs text-gray-500">
        <p>© 2026 Mystery Message. All rights reserved.</p>
      </footer>
    </div>
  );
}