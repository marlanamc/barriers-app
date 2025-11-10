"use client";

import Link from "next/link";
import { Heart, AlertCircle, Wrench, RefreshCw } from "lucide-react";
import { AppWordmark } from "@/components/AppWordmark";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning.";
  if (hour < 18) return "Good afternoon.";
  return "Good evening.";
}

function getGreetingEmoji() {
  const hour = new Date().getHours();
  if (hour < 12) return "☀️";
  if (hour < 18) return "🌤️";
  return "🌙";
}

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-100 via-pink-100 to-orange-100">
      {/* Header */}
      <header className="px-4 py-4">
        <AppWordmark className="text-xl font-semibold text-gray-900" />
      </header>

      {/* Main Content */}
      <div className="px-4 pb-8 max-w-2xl mx-auto">
        {/* Greeting Section */}
        <div className="mb-8 space-y-3">
          <p className="text-xl text-gray-900 font-medium leading-relaxed">
            {getGreeting()} <span className="ml-2">{getGreetingEmoji()}</span>
          </p>
          <h2 className="text-3xl font-bold text-gray-900 leading-tight">
            Here's what this app can do for you
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Card 1: Quick Check-ins */}
          <div className="gradient-pink-purple p-5 rounded-2xl shadow-sm">
            <div className="flex justify-center mb-3">
              <Heart className="w-6 h-6 text-gray-800 dark:text-gray-900" strokeWidth={2} />
            </div>
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-900 mb-1">
              Quick Check-ins
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-800 mb-3">
              Select 1-3 barriers
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-pink-200 dark:bg-pink-300 text-gray-800">
                Overwhelmed
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-pink-200 dark:bg-pink-300 text-gray-800">
                Stuck
              </span>
            </div>
          </div>

          {/* Card 2: Track Patterns */}
          <div className="gradient-yellow-green p-5 rounded-2xl shadow-sm">
            <div className="flex justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-gray-800 dark:text-gray-900" strokeWidth={2} />
            </div>
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-900 mb-1">
              Track Patterns
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-800 mb-3">
              See barriers over time
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-200 dark:bg-yellow-300 text-gray-800">
                This Week
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-yellow-200 dark:bg-yellow-300 text-gray-800">
                Trends
              </span>
            </div>
          </div>

          {/* Card 3: Get Support */}
          <div className="gradient-green-blue p-5 rounded-2xl shadow-sm">
            <div className="flex justify-center mb-3">
              <Wrench className="w-6 h-6 text-gray-800 dark:text-gray-900" strokeWidth={2} />
            </div>
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-900 mb-1">
              Get Support
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-800 mb-3">
              Find helpful guidance
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-200 dark:bg-green-300 text-gray-800">
                Strategies
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-200 dark:bg-green-300 text-gray-800">
                Resources
              </span>
            </div>
          </div>

          {/* Card 4: View History */}
          <div className="gradient-blue-purple p-5 rounded-2xl shadow-sm">
            <div className="flex justify-center mb-3">
              <RefreshCw className="w-6 h-6 text-gray-800 dark:text-gray-900" strokeWidth={2} />
            </div>
            <h3 className="font-bold text-base text-gray-900 dark:text-gray-900 mb-1">
              View History
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-800 mb-3">
              Review past check-ins
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-200 dark:bg-blue-300 text-gray-800">
                Calendar
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-200 dark:bg-blue-300 text-gray-800">
                Insights
              </span>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Get Started
          </Link>
        </div>
      </div>
    </main>
  );
}
