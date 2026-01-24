'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { ServiceWithBusiness } from './use-services';
import { supabase, isSupabaseReady } from '@/lib/supabase';
import { useAuth } from '@/contexts/auth-context';

const FAVORITES_STORAGE_KEY = 'cleanly-favorites';
const FAVORITE_IDS_STORAGE_KEY = 'cleanly-favorite-ids';

export interface UseFavoritesReturn {
  favorites: ServiceWithBusiness[];
  favoriteIds: Set<string>;
  isFavorite: (serviceId: string) => boolean;
  addToFavorites: (service: ServiceWithBusiness) => void;
  removeFromFavorites: (serviceId: string) => void;
  toggleFavorite: (service: ServiceWithBusiness) => void;
  clearFavorites: () => void;
  isLoading: boolean;
  error: string | null;
}

// Helper to get localStorage favorites (service IDs only)
function getLocalStorageFavoriteIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(FAVORITE_IDS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Helper to get localStorage favorites (full service objects for fallback)
function getLocalStorageFavorites(): ServiceWithBusiness[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

// Helper to save favorites to localStorage
function saveToLocalStorage(favorites: ServiceWithBusiness[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
    localStorage.setItem(
      FAVORITE_IDS_STORAGE_KEY,
      JSON.stringify(favorites.map((f) => f.id))
    );
  } catch (error) {
    console.error('Error saving favorites to localStorage:', error);
  }
}

// Helper to clear localStorage favorites after sync
function clearLocalStorageFavorites() {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    localStorage.removeItem(FAVORITE_IDS_STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing localStorage favorites:', error);
  }
}

export function useFavorites(): UseFavoritesReturn {
  const { user, isLoading: authLoading } = useAuth();
  const [favorites, setFavorites] = useState<ServiceWithBusiness[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileId, setProfileId] = useState<string | null>(null);
  const hasSynced = useRef(false);

  // Fetch user's profile ID when authenticated
  useEffect(() => {
    const fetchProfileId = async () => {
      if (!user || !isSupabaseReady()) {
        setProfileId(null);
        return;
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          setProfileId(null);
          return;
        }

        setProfileId(profile?.id || null);
      } catch (err) {
        console.error('Error fetching profile:', err);
        setProfileId(null);
      }
    };

    fetchProfileId();
  }, [user]);

  // Sync localStorage favorites to database when user logs in
  const syncLocalFavoritesToDatabase = useCallback(async () => {
    if (!profileId || hasSynced.current) return;

    const localFavoriteIds = getLocalStorageFavoriteIds();
    if (localFavoriteIds.length === 0) return;

    hasSynced.current = true;

    try {
      // Get existing favorites from database to avoid duplicates
      const { data: existingFavorites } = await supabase
        .from('favorites')
        .select('service_id')
        .eq('user_id', profileId);

      const existingIds = new Set(
        existingFavorites?.map((f) => f.service_id) || []
      );

      // Filter out already existing favorites
      const newFavoriteIds = localFavoriteIds.filter(
        (id) => !existingIds.has(id)
      );

      if (newFavoriteIds.length > 0) {
        // Insert new favorites
        const { error: insertError } = await supabase.from('favorites').insert(
          newFavoriteIds.map((serviceId) => ({
            user_id: profileId,
            service_id: serviceId,
          }))
        );

        if (insertError) {
          console.error('Error syncing favorites:', insertError);
        } else {
          console.log(
            `Synced ${newFavoriteIds.length} favorites from localStorage to database`
          );
          // Clear localStorage after successful sync
          clearLocalStorageFavorites();
        }
      } else {
        // No new favorites to sync, just clear localStorage
        clearLocalStorageFavorites();
      }
    } catch (err) {
      console.error('Error syncing favorites:', err);
    }
  }, [profileId]);

  // Load favorites from Supabase or localStorage
  const loadFavorites = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // If user is authenticated and has a profile, use Supabase
      if (user && profileId && isSupabaseReady()) {
        // First sync any local favorites
        await syncLocalFavoritesToDatabase();

        // Then fetch all favorites from database
        const { data: dbFavorites, error: fetchError } = await supabase
          .from('favorites')
          .select(
            `
            service_id,
            services (
              id,
              name,
              description,
              price,
              pricing_type,
              duration,
              category,
              businesses (
                id,
                name,
                rating,
                service_category,
                profiles (
                  full_name,
                  postcode
                )
              )
            )
          `
          )
          .eq('user_id', profileId);

        if (fetchError) {
          console.error('Error fetching favorites:', fetchError);
          setError('Failed to load favorites');
          // Fall back to localStorage
          const localFavorites = getLocalStorageFavorites();
          setFavorites(localFavorites);
          setFavoriteIds(new Set(localFavorites.map((f) => f.id)));
          return;
        }

        // Transform database response to ServiceWithBusiness format
        const transformedFavorites: ServiceWithBusiness[] = (dbFavorites || [])
          .filter((fav: any) => fav.services) // Filter out any favorites where service was deleted
          .map((fav: any) => {
            const service = fav.services;
            return {
              id: service.id,
              name: service.name,
              description: service.description || '',
              price: service.price,
              pricingType: service.pricing_type,
              duration: service.duration || '2-4 hours',
              category: service.category,
              business: {
                id: service.businesses?.id || '',
                name: service.businesses?.name || 'Unknown Business',
                rating: service.businesses?.rating || 0,
                serviceCategory:
                  service.businesses?.service_category || service.category,
                profile: service.businesses?.profiles
                  ? {
                      fullName: service.businesses.profiles.full_name || '',
                      postcode: service.businesses.profiles.postcode || '',
                    }
                  : null,
              },
            };
          });

        setFavorites(transformedFavorites);
        setFavoriteIds(new Set(transformedFavorites.map((f) => f.id)));
      } else {
        // Fall back to localStorage for unauthenticated users
        const localFavorites = getLocalStorageFavorites();
        setFavorites(localFavorites);
        setFavoriteIds(new Set(localFavorites.map((f) => f.id)));
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError('Failed to load favorites');
      // Fall back to localStorage on error
      const localFavorites = getLocalStorageFavorites();
      setFavorites(localFavorites);
      setFavoriteIds(new Set(localFavorites.map((f) => f.id)));
    } finally {
      setIsLoading(false);
    }
  }, [user, profileId, syncLocalFavoritesToDatabase]);

  // Load favorites when auth state or profile changes
  useEffect(() => {
    if (!authLoading) {
      loadFavorites();
    }
  }, [authLoading, loadFavorites]);

  // Reset sync flag when user changes
  useEffect(() => {
    hasSynced.current = false;
  }, [user?.id]);

  const isFavorite = useCallback(
    (serviceId: string): boolean => {
      return favoriteIds.has(serviceId);
    },
    [favoriteIds]
  );

  const addToFavorites = useCallback(
    async (service: ServiceWithBusiness) => {
      if (isFavorite(service.id)) return;

      // Optimistically update UI
      setFavorites((prev) => [...prev, service]);
      setFavoriteIds((prev) => new Set([...prev, service.id]));

      try {
        if (user && profileId && isSupabaseReady()) {
          // Add to database
          const { error: insertError } = await supabase
            .from('favorites')
            .insert({
              user_id: profileId,
              service_id: service.id,
            });

          if (insertError) {
            console.error('Error adding favorite:', insertError);
            setError('Failed to add favorite');
            // Rollback on error
            setFavorites((prev) => prev.filter((f) => f.id !== service.id));
            setFavoriteIds((prev) => {
              const newSet = new Set(prev);
              newSet.delete(service.id);
              return newSet;
            });
          }
        } else {
          // Save to localStorage for unauthenticated users
          const updatedFavorites = [...favorites, service];
          saveToLocalStorage(updatedFavorites);
        }
      } catch (err) {
        console.error('Error adding favorite:', err);
        setError('Failed to add favorite');
        // Rollback on error
        setFavorites((prev) => prev.filter((f) => f.id !== service.id));
        setFavoriteIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(service.id);
          return newSet;
        });
      }
    },
    [user, profileId, isFavorite, favorites]
  );

  const removeFromFavorites = useCallback(
    async (serviceId: string) => {
      const previousFavorites = favorites;
      const previousIds = favoriteIds;

      // Optimistically update UI
      setFavorites((prev) => prev.filter((f) => f.id !== serviceId));
      setFavoriteIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(serviceId);
        return newSet;
      });

      try {
        if (user && profileId && isSupabaseReady()) {
          // Remove from database
          const { error: deleteError } = await supabase
            .from('favorites')
            .delete()
            .eq('user_id', profileId)
            .eq('service_id', serviceId);

          if (deleteError) {
            console.error('Error removing favorite:', deleteError);
            setError('Failed to remove favorite');
            // Rollback on error
            setFavorites(previousFavorites);
            setFavoriteIds(previousIds);
          }
        } else {
          // Save to localStorage for unauthenticated users
          const updatedFavorites = favorites.filter((f) => f.id !== serviceId);
          saveToLocalStorage(updatedFavorites);
        }
      } catch (err) {
        console.error('Error removing favorite:', err);
        setError('Failed to remove favorite');
        // Rollback on error
        setFavorites(previousFavorites);
        setFavoriteIds(previousIds);
      }
    },
    [user, profileId, favorites, favoriteIds]
  );

  const toggleFavorite = useCallback(
    (service: ServiceWithBusiness) => {
      if (isFavorite(service.id)) {
        removeFromFavorites(service.id);
      } else {
        addToFavorites(service);
      }
    },
    [isFavorite, addToFavorites, removeFromFavorites]
  );

  const clearFavorites = useCallback(async () => {
    const previousFavorites = favorites;
    const previousIds = favoriteIds;

    // Optimistically update UI
    setFavorites([]);
    setFavoriteIds(new Set());

    try {
      if (user && profileId && isSupabaseReady()) {
        // Remove all favorites from database
        const { error: deleteError } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', profileId);

        if (deleteError) {
          console.error('Error clearing favorites:', deleteError);
          setError('Failed to clear favorites');
          // Rollback on error
          setFavorites(previousFavorites);
          setFavoriteIds(previousIds);
        }
      } else {
        // Clear localStorage for unauthenticated users
        clearLocalStorageFavorites();
      }
    } catch (err) {
      console.error('Error clearing favorites:', err);
      setError('Failed to clear favorites');
      // Rollback on error
      setFavorites(previousFavorites);
      setFavoriteIds(previousIds);
    }
  }, [user, profileId, favorites, favoriteIds]);

  return {
    favorites,
    favoriteIds,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    clearFavorites,
    isLoading: isLoading || authLoading,
    error,
  };
}
