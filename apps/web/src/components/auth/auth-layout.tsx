import { ReactNode } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
  showBackToHome?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showBackToHome = true,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.03),transparent_70%)]" />

      <div className="relative min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Branding */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-xl bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center mb-4 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-4xl font-black tracking-tight mb-2">
              <span className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-600 bg-clip-text text-transparent">
                Cle
              </span>
              <span className="bg-gradient-to-r from-sky-400 via-sky-500 to-sky-400 bg-clip-text text-transparent">
                anly
              </span>
            </h1>
            <p className="text-sm text-gray-600">
              Premium cleaning services in South Wales
            </p>
          </div>

          {/* Main Auth Card */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Card Header */}
            <div className="px-8 py-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900 text-center">
                {title}
              </h2>
              <p className="text-sm text-gray-600 text-center mt-1">
                {subtitle}
              </p>
            </div>

            {/* Card Content */}
            <div className="px-8 py-6">{children}</div>
          </div>

          {/* Footer Links */}
          <div className="text-center space-y-4">
            {showBackToHome && (
              <Link
                href="/"
                className="inline-flex items-center text-sm text-gray-600 hover:text-sky-600 transition-colors"
              >
                ← Back to home
              </Link>
            )}

            <div className="flex justify-center space-x-6 text-xs text-gray-500">
              <Link
                href="/privacy"
                className="hover:text-gray-700 transition-colors"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="hover:text-gray-700 transition-colors"
              >
                Terms of Service
              </Link>
              <Link
                href="/help"
                className="hover:text-gray-700 transition-colors"
              >
                Help
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
