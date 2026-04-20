import { db } from '@/db/client';
import { activitiesTable, categoriesTable, tripsTable } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

// escape a value so it doesnt break the csv format
// if it has a comma/quote/newline in it wrap it in quotes and double up any existing quotes
const csvEscape = (val: string | number | null | undefined): string => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
};

// builds a csv of every activity the user has and opens the share sheet
// returns false if theres nothing to export
export async function exportUserActivitiesToCSV(userId: number): Promise<boolean> {
  // grab the user's trips first
  const userTrips = await db
    .select()
    .from(tripsTable)
    .where(eq(tripsTable.userId, userId));

  if (userTrips.length === 0) return false;

  // tripMap lets us look up trip info by id without a second db call
  const tripIds = userTrips.map((t) => t.id);
  const tripMap = new Map(userTrips.map((t) => [t.id, t]));

  // now get activities that belong to any of those trips
  const activities = await db
    .select()
    .from(activitiesTable)
    .where(inArray(activitiesTable.tripId, tripIds));

  if (activities.length === 0) return false;

  // and categories, can show the name in the csv instead of just an id
  const categories = await db.select().from(categoriesTable);
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  // csv header row
  const header = [
    'Trip',
    'Destination',
    'Activity',
    'Date',
    'Duration (hours)',
    'Category',
  ].join(',');

  // one csv row per activity, pulling trip + category info from the maps
  const rows = activities.map((a) => {
    const trip = tripMap.get(a.tripId);
    const category = categoryMap.get(a.categoryId);
    return [
      csvEscape(trip?.title),
      csvEscape(trip?.destination),
      csvEscape(a.title),
      csvEscape(a.date),
      csvEscape(a.duration),
      csvEscape(category?.name),
    ].join(',');
  });

  const csvContent = [header, ...rows].join('\n');

  // write the csv to a temp file in the cache directory
  // filename includes today's date so exports dont overwrite each other
const timestamp = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
const filename = `tripup-activities-${timestamp}.csv`;
const file = new File(Paths.cache, filename);
file.create();
file.write(csvContent);
const fileUri = file.uri;

// open the native share sheet so user can save it to files, email it, whatsapp it, etc
if (await Sharing.isAvailableAsync()) {
  await Sharing.shareAsync(fileUri, {
    mimeType: 'text/csv',
    dialogTitle: 'Export Activities',
    UTI: 'public.comma-separated-values-text',
  });
}

  return true;
}