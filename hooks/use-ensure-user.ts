import { useEffect, useRef } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useAuth } from '@clerk/clerk-expo';

export function useEnsureUser() {
  const { isSignedIn } = useAuth();
  const ensureUser = useMutation(api.notes.ensureUser);
  const hasRun = useRef(false);

  useEffect(() => {
    if (isSignedIn && !hasRun.current) {
      hasRun.current = true;
      ensureUser().catch((error) => {
        console.error('Error ensuring user exists:', error);
        hasRun.current = false; // Reset on error to retry
      });
    }
  }, [isSignedIn, ensureUser]);
}
