'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Shield, Zap, Users, Layers } from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, checkAuth, loading } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated && !loading) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, loading, router]);

  const features = [
    {
      icon: <Layers className="w-6 h-6" />,
      title: 'Bulk Management',
      description: 'Select and manage multiple subreddits at once with ease',
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: 'Fast & Efficient',
      description: 'Optimized API calls with smart rate limiting',
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: 'Custom Feeds',
      description: 'Create, edit, and organize your Reddit multireddits',
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: 'Secure OAuth',
      description: 'Industry-standard PKCE flow for secure authentication',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-reddit-gray-100 to-reddit-gray-200 dark:from-reddit-gray-900 dark:to-reddit-gray-800">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-reddit-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-reddit-gray-100 to-reddit-gray-200 dark:from-reddit-gray-900 dark:to-reddit-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Reddit Custom Feed Manager
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
              Organize your Reddit experience with powerful custom feed management
            </p>
            <a href="/api/auth/login">
              <Button
                size="lg"
                className="bg-reddit-orange hover:bg-orange-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Login with Reddit
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </a>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-shadow duration-200 bg-white dark:bg-reddit-gray-800 border-reddit-gray-300 dark:border-reddit-gray-700"
              >
                <div className="text-reddit-orange mb-4">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </Card>
            ))}
          </div>

          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
              How It Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="w-12 h-12 bg-reddit-orange text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Connect Your Account
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Securely login with your Reddit account using OAuth 2.0
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-reddit-orange text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Select Subreddits
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Browse and select multiple subreddits from your subscriptions
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-reddit-orange text-white rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">
                  Create Custom Feeds
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Organize selected subreddits into custom feeds instantly
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}