import { getColors } from '@/constants/theme';
import { ThemeContext, ThemeProvider } from '@/contexts/ThemeContext';
import { db } from '@/db/client';
import { tripsTable } from '@/db/schema';
import { seedDatabaseIfEmpty } from '@/db/seed';
import { eq } from 'drizzle-orm';
import { Stack } from 'expo-router';
import * as SplashScreenLib from 'expo-splash-screen';
import { createContext, Dispatch, SetStateAction, useContext, useEffect, useState } from 'react';

// keep the splash screen up until bootstrapping finishes, prevents a flash of empty content
SplashScreenLib.preventAutoHideAsync();

// shared Trip type- used everywhere a trip is passed around
// endDate is nullable because not every trip has an end date set
export type Trip = {
  id: number;
  userId: number;
  title: string;
  destination: string;
  startDate: string;
  endDate: string | null;
};

// shared User type- password is stored hashed not plaintext
export type User = {
  id: number;
  name: string;
  email: string;
  password: string;
};

// contexts for sharing state across the tree without prop drilling
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

// inner component so it can use ThemeContext (ThemeProvider wraps it below)
function RootLayoutContent() {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const themeContext = useContext(ThemeContext);

  const colors = themeContext ? getColors(themeContext.isDarkMode) : getColors(false);

// runs on app start and whenever the logged-in user changes
// seeds the db if empty, loads that user's trips, hides the splash screen
useEffect(() => {
  const bootstrapAsync = async () => {
    try {
      await seedDatabaseIfEmpty();

      // trips are scoped to the logged-in user, so only load when someone's signed in
      if (currentUser) {
        const tripRows = await db
          .select()
          .from(tripsTable)
          .where(eq(tripsTable.userId, currentUser.id));
        setTrips(tripRows);
      } else {
        setTrips([]);
      }
    } catch (e) {
      console.error('Failed to restore session:', e);
    } finally {
      setIsLoading(false);
      await SplashScreenLib.hideAsync();
    }
  };

  bootstrapAsync();
}, [currentUser]);

  return (
    // auth + trip providers wrap the entire screen tree so any screen can read them
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      <TripContext.Provider value={{ trips, setTrips }}>
        {/* shared Stack styling applied to every screen */}
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
  {/* conditional routing, logged in gets app screens, logged out gets auth screens */}
  {currentUser ? (
    <>
      <Stack.Screen
        name="(tabs)"
        options={{
          // tabs layout handles its own header, so hide the parent stack's one
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
    // signed out- only login and register are accessible
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

// root wraps everything in ThemeProvider so dark/light mode is available to the layout content
export default function RootLayout() {
  return (
    <ThemeProvider>
      <RootLayoutContent />
    </ThemeProvider>
  );
}