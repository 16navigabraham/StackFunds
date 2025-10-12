# StackFund: Decentralized Crowdfunding on Stacks

**Fund Ideas. Empower Innovation with Bitcoin.**

StackFund is a modern web application that demonstrates a seamless and secure platform for decentralized crowdfunding, built on the Stacks blockchain. It leverages passwordless authentication and embedded wallets powered by [Turnkey](https://turnkey.com) to provide a user-friendly Web3 experience, even for users new to crypto.

## Core Technologies

This project is built with a modern, robust, and scalable tech stack:

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [ShadCN UI](https://ui.shadcn.com/)
- **Wallet & Auth**: [Turnkey](https://turnkey.com) for Embedded Wallets and Passkey (WebAuthn) Authentication
- **Blockchain**: [Stacks](https://www.stacks.co/) for sBTC payments (on Testnet4)
- **Deployment**: Ready for deployment on platforms like Firebase App Hosting or Vercel.

## Key Features

### 1. Passwordless Authentication with Passkeys

- **Secure & Simple**: Users sign up and log in using their device's built-in biometrics (Face ID, fingerprint) or screen lock. No passwords to remember or lose.
- **Sub-Organization Model**: Each user is provisioned into their own secure "sub-organization" within Turnkey, isolating their credentials and assets.

### 2. Embedded Wallets

- **Instant Wallet Creation**: A non-custodial Stacks wallet is automatically and securely generated for every user upon signup.
- **No Extensions Needed**: Users can receive funds without needing to install a browser extension like Metamask or Hiro Wallet. The wallet is embedded directly into their account.
- **Full Control**: While embedded, the wallet's keys are managed by the user through their passkey, ensuring self-custody.

### 3. Crowdfunding & Payment Links

- **Create Campaigns**: Authenticated users can create "payment links" (crowdfunding campaigns) with a title, description, funding goal, and duration.
- **Explore Projects**: A public-facing gallery allows anyone to view and explore active campaigns.
- **Fund with sBTC**: Users can fund projects directly. (Note: The transaction logic in the UI is currently a simulation).

### 4. User Wallet Dashboard

- **Account Overview**: A dedicated dashboard for logged-in users to view their account details, such as their unique user ID and organization ID from Turnkey.
- **Wallet Address**: Easily view and copy the primary Stacks wallet address.
- **Message Signing**: A demonstration of signing raw messages using the embedded wallet, a core function for many Web3 interactions.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Environment Variables

Before running the application, you need to set up your Turnkey environment variables.

1.  Sign up for a [Turnkey account](https://www.turnkey.com/).
2.  Create API keys (a public/private key pair).
3.  Copy your Organization ID.
4.  Create a `.env.local` file in the root of the project and add the following variables:

```env
# .env.local

# --- Turnkey Configuration ---
# Your main parent organization ID from the Turnkey Dashboard.
NEXT_PUBLIC_TURNKEY_ORGANIZATION_ID=your-parent-org-id-here

# The base URL for the Turnkey API.
NEXT_PUBLIC_TURNKEY_API_BASE_URL=https://api.turnkey.com

# --- Server-side only (NOT prefixed with NEXT_PUBLIC) ---
# Your Turnkey API private key. Keep this secret!
TURNKEY_API_PRIVATE_KEY="your-api-private-key-here"

# Your Turnkey API public key.
TURNKEY_API_PUBLIC_KEY=your-api-public-key-here
```

### Installation

Clone the repository and install the dependencies:

```bash
git clone <repository-url>
cd <repository-name>
npm install
```

### Running the Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:9002`.

---

## Core Authentication Flow Explained

The authentication system is the heart of this application. Here’s how it works:

1.  **User Visits Signup**: A new user navigates to `/auth/signup`.
2.  **Account Creation Request**: The user enters their email. The frontend calls our backend API at `/api/auth/create-user`.
3.  **Sub-Organization Creation (Backend)**:
    - The backend API receives the request.
    - It uses the server-side Turnkey SDK to create a new **sub-organization** for the user. This is a critical security step that isolates the user's data.
    - It then immediately creates a new private key within that sub-organization, configured for Bitcoin testnet addresses (`ADDRESS_FORMAT_BITCOIN_TESTNET_P2WPKH`) which are compatible with Stacks testnet4 and sBTC.
    - The API returns the new `subOrgId` to the frontend.
4.  **Passkey Creation (Frontend)**:
    - The frontend receives the `subOrgId`.
    - It now prompts the user to create a passkey, specifying that this passkey should be associated with the `subOrgId`.
    - The user interacts with their browser/OS to create the passkey (e.g., using their fingerprint).
5.  **Storing the `subOrgId`**: Once the passkey is created, its corresponding `subOrgId` is saved in the browser's `localStorage`.
6.  **Login**:
    - When the user returns to log in, the app retrieves the `subOrgId` from `localStorage`.
    - It initiates the passkey login flow, telling Turnkey to authenticate the user **within their specific sub-organization**.
    - This ensures the `credential ID` of the passkey is found in the correct organization, preventing the "Organization not found" error.
7.  **Session Management**: Turnkey's `useTurnkey` hook manages the user's session state throughout the application.

This robust flow ensures that each user has a securely isolated environment for their credentials and assets, all without the complexity of traditional seed phrases or passwords.
