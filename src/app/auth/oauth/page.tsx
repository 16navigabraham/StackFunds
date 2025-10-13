"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OAuthPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the proper signup flow
    router.push('/auth/signup');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Redirecting to signup...</p>
    </div>
  );
}