// Mock for @clerk/nextjs used in component tests
import { vi } from "vitest";

const mockUseAuth = vi.fn(() => ({
  userId: "test-user-id",
  isSignedIn: true,
  isLoaded: true,
}));

const mockUseUser = vi.fn(() => ({
  user: {
    id: "test-user-id",
    primaryEmailAddress: { emailAddress: "test@example.com" },
    fullName: "Test User",
    imageUrl: "https://example.com/avatar.png",
  },
  isLoaded: true,
}));

export const useAuth = mockUseAuth;
export const useUser = mockUseUser;
export const SignOutButton = ({ children }: { children: React.ReactNode }) =>
  children;
export const SignInButton = ({ children }: { children: React.ReactNode }) =>
  children;
export const ClerkProvider = ({ children }: { children: React.ReactNode }) =>
  children;
export const SignedIn = ({ children }: { children: React.ReactNode }) =>
  children;
export const SignedOut = ({ children }: { children: React.ReactNode }) =>
  children;
