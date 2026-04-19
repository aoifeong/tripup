import { colors } from '@/constants/theme';
import { db } from '@/db/client';
import { tripsTable } from '@/db/schema';
import { seedDatabaseIfEmpty } from '@/db/seed';
import { Stack } from 'expo-router';
import * as SplashScreenLib from 'expo-splash-screen'; // ← ADD THIS
import { createContext, Dispatch, SetStateAction, useEffect, useState } from 'react';
import SplashScreen from './splash';

// Keep the splash visible while loading ← ADD THIS
SplashScreenLib.preventAutoHideAsync();

export type Trip = {
  id: number;
  title: string;
  destination: string;
  startDate: string;
  endDate?: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

type TripContextType = {
  trips: Trip[];
  setTrips: Dispatch<SetStateAction<Trip[]>>;
};

type AuthContextType = {
  currentUser: User | null;
  setCurrentUser: Dispatch<SetStateAction<User | null>>;
};

export const TripContext = createContext<TripContextType | null>(null);
export const AuthContext = createContext<AuthContextType | null>(null);

export default function RootLayout() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Initialize database with seed data if empty
        await seedDatabaseIfEmpty();

        // Load trips
        const tripRows = await db.select().from(tripsTable);
        setTrips(tripRows);

        // Note: Auth state is managed separately through the app
        // Users must explicitly login/register
      } catch (e) {
        // If there's an error loading data, app still works
        console.error('Failed to restore session:', e);
      } finally {
        // Hide native splash and show custom splash ← ADD THIS
        await SplashScreenLib.hideAsync();
        setIsLoading(false);
      }
    };

    bootstrapAsync();
  }, []);

  // Show loading screen while initializing
  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      <TripContext.Provider value={{ trips, setTrips }}>
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colors.card,
            },
            headerTintColor: colors.primary,
            headerTitleStyle: {
              fontWeight: '700',
              fontSize: 17,
              color: colors.text,
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: colors.background,
            },
          }}
        >
          {currentUser ? (
            // Authenticated Routes
            <>
              <Stack.Screen
                name="(tabs)"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="trip/[id]/index"
                options={{
                  title: 'Trip Details',
                  headerBackTitle: 'Back',
                }}
              />
              <Stack.Screen
                name="trip/[id]/edit"
                options={{
                  title: 'Edit Trip',
                  headerBackTitle: 'Back',
                  presentation: 'modal',
                }}
              />
              <Stack.Screen
                name="trip/[id]/activities"
                options={{
                  title: 'Activities',
                  headerBackTitle: 'Back',
                }}
              />
              <Stack.Screen
                name="trip/[id]/add-activity"
                options={{
                  title: 'Add Activity',
                  headerBackTitle: 'Back',
                  presentation: 'modal',
                }}
              />
              <Stack.Screen
                name="trip/[id]/edit-activity"
                options={{
                  title: 'Edit Activity',
                  headerBackTitle: 'Back',
                  presentation: 'modal',
                }}
              />
              <Stack.Screen
                name="trip/[id]/targets"
                options={{
                  title: 'Targets',
                  headerBackTitle: 'Back',
                }}
              />
              <Stack.Screen
                name="trip/[id]/insights"
                options={{
                  title: 'Insights',
                  headerBackTitle: 'Back',
                }}
              />
              <Stack.Screen
                name="categories"
                options={{
                  title: 'Categories',
                  headerBackTitle: 'Back',
                }}
              />
            </>
          ) : (
            // Unauthenticated Routes
            <>
              <Stack.Screen
                name="login"
                options={{
                  title: 'Sign In',
                  headerBackTitle: 'Back',
                }}
              />
              <Stack.Screen
                name="register"
                options={{
                  title: 'Create Account',
                  headerBackTitle: 'Back',
                }}
              />
            </>
          )}
        </Stack>
      </TripContext.Provider>
    </AuthContext.Provider>
  );
}