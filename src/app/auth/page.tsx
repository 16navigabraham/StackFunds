"use client";

import { Auth } from "@turnkey/sdk-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthPage() {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const handleAuthSuccess = async () => {
    console.log("Authentication successful!");
    router.push("/wallet");
  };

  const handleError = (error: Error) => {
    console.error("Auth error:", error);
    setErrorMessage(error.message);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Welcome</h2>
          <p className="mt-2 text-gray-600">
            Sign in or create your account
          </p>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {errorMessage}
          </div>
        )}

        <Auth
          config={{
            email: {
              enabled: true,
            },
            passkey: {
              enabled: true,
            },
            oauth: {
              google: {
                enabled: true,
                // You must configure your Google OAuth client ID in the Turnkey dashboard
              },
              apple: {
                enabled: true,
                // You must configure your Apple OAuth settings in the Turnkey dashboard
              }
            }
          }}
          onSuccess={handleAuthSuccess}
          onError={handleError}
        />
      </div>
    </div>
  );
}
