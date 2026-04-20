import { getColors } from '@/constants/theme';
import { ThemeContext, ThemeProvider } from '@/contexts/ThemeContext';
import { db } from '@/db/client';
import { tripsTable } from '@/db/schema';
import { seedDatabaseIfEmpty } from '@/db/seed';
import { eq } from 'drizzle-orm';
import { Stack } from 'expo-router';
import * as SplashScreenLib from 'expo-splash-screen';
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';

SplashScreenLib.preventAutoHideAsync();

export type Trip = {
  id: number;
  userId: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string | null;
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

function RootLayoutContent() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const themeContext = useContext(ThemeContext);

  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);

useEffect(() => {
  const bootstrapAsync = async () => {
    try {
      await seedDatabaseIfEmpty();
      
      // Only load trips if user is logged in
      if (currentUser) {
        const tripRows = await db
          .select()
          .from(tripsTable)
          .where(eq(tripsTable.userId, currentUser.id));  // ← Filter by user
        setTrips(tripRows);
      } else {
        setTrips([]); // Empty trips if no user logged in
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
    } finally {
      setIsLoading(false);
      await SplashScreenLib.hideAsync();
    }
  };

  bootstrapAsync();
}, [currentUser]); // ← Also add currentUser to dependency array

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
  }}
>
  {currentUser ? (
    <>
      <Stack.Screen
        name="(tabs)"
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="trip/[id]"
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
      <Stack.Screen
        name="add"
        options={{
          title: 'Add Trip',
          headerBackTitle: 'Back',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="modal"
        options={{
          title: 'Modal',
          presentation: 'modal',
        }}
      />
    </>
  ) : (
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

export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}