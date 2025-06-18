// Simple in-memory cache for user preferences
const userPreferencesCache = new Map<
  string,
  { preferences: any; timestamp: number }
>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Function to get user preferences with caching
export async function getUserPreferences(
  userId: string,
  db: any,
  userInfo: any,
  eq: any
) {
  const now = Date.now();
  const cached = userPreferencesCache.get(userId);

  // Return cached data if it's still valid
  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.preferences;
  }

  try {
    const [preferences] = await db
      .select()
      .from(userInfo)
      .where(eq(userInfo.userId, userId))
      .limit(1);

    if (preferences) {
      // Cache the preferences
      userPreferencesCache.set(userId, { preferences, timestamp: now });
      return preferences;
    }
  } catch (error) {
    console.log(
      "No user preferences found or error fetching preferences:",
      error
    );
  }

  return null;
}

// Function to invalidate cache when preferences are updated
export function invalidateUserPreferencesCache(userId: string) {
  userPreferencesCache.delete(userId);
}
