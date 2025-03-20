'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { signUp } from '@/app/(auth)/actions/auth';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(event.currentTarget);

    const result = await signUp(formData);

    setIsLoading(false);
    if (result.status === 'success') {
      router.push('/login');
    } else {
      setError(result.status || 'An error occurred during registration');
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href={'/'}>
            <div className="relative h-48 w-auto overflow-hidden">
              <Image src="/images/logo-lg.png" alt="logo" fill className="object-contain" />
            </div>
          </Link>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Register your vessel
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Already registered?{' '}
            <Link href="/login" className="font-medium text-[#0099ff] hover:text-[#0088ee]">
              Sign in
            </Link>
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-4 py-8 shadow sm:rounded-lg sm:px-10">
            {error && (
              <div className="mb-4 border-l-4 border-red-500 bg-red-50 p-3 text-red-700">
                <p>{error}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <h3 className="font-medium">Captain Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" name="first-name" required />
                  </div>
                  <div>
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" name="last-name" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" name="email" type="email" autoComplete="email" required />
                </div>

                <div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input id="password" name="password" type="password" required />
                  </div>
                </div>

                <div>
                  <Label htmlFor="preferred-language">Preferred language</Label>
                  <select
                    id="preferred-language"
                    name="preferred-language"
                    className="border-input bg-background w-full rounded-md border px-3 py-2"
                    required
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="zh">中文 (Chinese)</option>
                  </select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="font-medium">Vessel Information</h3>
                <div>
                  <Label htmlFor="vessel-name">Vessel name</Label>
                  <Input id="vessel-name" name="vessel-name" required />
                </div>

                <div>
                  <Label htmlFor="shipping-company">Shipping company (optional)</Label>
                  <Input id="shipping-company" name="shipping-company" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0099ff] text-white hover:bg-[#0088ee] disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="mr-2 -ml-1 h-4 w-4 animate-spin text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Registering...
                  </>
                ) : (
                  'Register'
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
