import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth';
import { firebaseConfig } from '@/firebase/config';

export interface CreateFirebaseUserResult {
  success: boolean;
  uid?: string;
  error?: string;
  alreadyExists?: boolean;
}

/**
 * Creates a new user in Firebase Authentication directly from the frontend
 * without logging out the currently logged-in Admin/Manager user.
 */
export async function createFirebaseAuthUser(
  email: string,
  password: string,
  displayName?: string
): Promise<CreateFirebaseUserResult> {
  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  if (!trimmedEmail || !trimmedPassword) {
    return {
      success: false,
      error: 'Email and password are required to create a Firebase account.',
    };
  }

  // Use a unique app name so it does not conflict with the main active Firebase app
  const tempAppName = `crm-user-creator-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  let tempApp;
  let tempAuth: ReturnType<typeof getAuth> | undefined;

  try {
    tempApp = initializeApp(firebaseConfig, tempAppName);
    tempAuth = getAuth(tempApp);

    // 1. Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(tempAuth, trimmedEmail, trimmedPassword);

    // 2. Set the display name if provided
    if (displayName && userCredential.user) {
      try {
        await updateProfile(userCredential.user, { displayName: displayName.trim() });
      } catch (profileErr) {
        console.warn('Could not set displayName on Firebase user:', profileErr);
      }
    }

    const uid = userCredential.user.uid;

    // 3. Immediately sign out the secondary auth instance so it does not persist
    try {
      await signOut(tempAuth);
    } catch (signOutErr) {
      console.warn('Could not sign out temporary auth instance:', signOutErr);
    }

    return {
      success: true,
      uid,
    };
  } catch (err: any) {
    console.error('Firebase user creation error:', err);

    // Handle specific Firebase error codes
    let errorMessage = 'Failed to create user in Firebase Authentication.';
    let alreadyExists = false;

    if (err?.code === 'auth/email-already-in-use') {
      // 1. If currently active user in main app matches this email, recover their UID
      try {
        const defaultAuth = getAuth();
        if (defaultAuth.currentUser && defaultAuth.currentUser.email?.toLowerCase() === trimmedEmail.toLowerCase()) {
          return {
            success: true,
            uid: defaultAuth.currentUser.uid,
            alreadyExists: true,
          };
        }
      } catch {}

      // 2. Attempt to sign in to temporary auth instance with provided credentials
      if (tempAuth) {
        try {
          const signinCred = await signInWithEmailAndPassword(tempAuth, trimmedEmail, trimmedPassword);
          if (signinCred.user?.uid) {
            const uid = signinCred.user.uid;
            if (displayName) {
              try {
                await updateProfile(signinCred.user, { displayName: displayName.trim() });
              } catch {}
            }
            try {
              await signOut(tempAuth);
            } catch {}
            return {
              success: true,
              uid,
              alreadyExists: true,
            };
          }
        } catch {}
      }

      errorMessage = 'This email is already registered in Firebase Authentication.';
      alreadyExists = true;
    } else if (err?.code === 'auth/weak-password') {
      errorMessage = 'The password is too weak. Firebase requires at least 6 characters.';
    } else if (err?.code === 'auth/invalid-email') {
      errorMessage = 'The email address format is invalid.';
    } else if (err?.message) {
      errorMessage = err.message;
    }

    return {
      success: false,
      error: errorMessage,
      alreadyExists,
    };
  } finally {
    // Clean up temporary app instance from memory
    if (tempApp) {
      try {
        await deleteApp(tempApp);
      } catch (delErr) {
        // Non-blocking cleanup
      }
    }
  }
}
