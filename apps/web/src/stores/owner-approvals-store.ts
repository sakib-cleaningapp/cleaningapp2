'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ApprovalStatus = 'pending' | 'approved' | 'denied';

// Local storage format (legacy - for backward compatibility)
export interface SignupApproval {
  id: string;
  email: string;
  fullName: string;
  postcode?: string;
  createdAt: string;
  status: ApprovalStatus;
  note?: string;
}

// Database format (from Supabase user_approvals table)
export interface DatabaseApproval {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  user_type: 'customer' | 'business';
  status: ApprovalStatus;
  reviewed_by: string | null;
  reviewed_at: string | null;
  denial_reason: string | null;
  created_at: string;
}

interface OwnerApprovalsState {
  // Local approvals (localStorage - legacy support)
  approvals: SignupApproval[];

  // Database approvals (fetched from API)
  dbApprovals: DatabaseApproval[];
  isLoadingDb: boolean;
  dbError: string | null;

  // Local-only operations (legacy)
  enqueueApproval: (
    data: Omit<SignupApproval, 'id' | 'createdAt' | 'status'>
  ) => string;
  approve: (id: string, note?: string) => void;
  deny: (id: string, note?: string) => void;

  // Database sync operations
  enqueueApprovalToDb: (
    data: {
      email: string;
      fullName: string;
      userId?: string;
      userType?: 'customer' | 'business';
    },
    authToken: string
  ) => Promise<{ success: boolean; error?: string; approvalId?: string }>;
  approveInDb: (
    id: string,
    authToken: string
  ) => Promise<{ success: boolean; error?: string }>;
  denyInDb: (
    id: string,
    reason: string,
    authToken: string
  ) => Promise<{ success: boolean; error?: string }>;
  fetchDbApprovals: (
    authToken: string,
    status?: 'pending' | 'approved' | 'denied' | 'all'
  ) => Promise<void>;

  // Combined getter
  getAllApprovals: () => SignupApproval[];
}

export const useOwnerApprovalsStore = create<OwnerApprovalsState>()(
  persist(
    (set, get) => ({
      // Local storage state
      approvals: [],

      // Database state
      dbApprovals: [],
      isLoadingDb: false,
      dbError: null,

      // ==========================================
      // LOCAL STORAGE OPERATIONS (Legacy Support)
      // ==========================================

      enqueueApproval: (data) => {
        const id = `approval-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}`;
        const newApproval: SignupApproval = {
          id,
          ...data,
          createdAt: new Date().toISOString(),
          status: 'pending',
        };
        set((state) => ({ approvals: [newApproval, ...state.approvals] }));
        return id;
      },

      approve: (id, note) => {
        set((state) => ({
          approvals: state.approvals.map((approval) =>
            approval.id === id
              ? { ...approval, status: 'approved' as ApprovalStatus, note }
              : approval
          ),
        }));
      },

      deny: (id, note) => {
        set((state) => ({
          approvals: state.approvals.map((approval) =>
            approval.id === id
              ? { ...approval, status: 'denied' as ApprovalStatus, note }
              : approval
          ),
        }));
      },

      // ==========================================
      // DATABASE OPERATIONS (New - Supabase)
      // ==========================================

      /**
       * Create a new approval request in the database
       * Called during signup to add user to approval queue
       */
      enqueueApprovalToDb: async (data, authToken) => {
        try {
          const response = await fetch('/api/admin/approvals', {
            method: 'PUT',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: data.email,
              full_name: data.fullName,
              user_id: data.userId || null,
              user_type: data.userType || 'customer',
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            return {
              success: false,
              error: errorData.error || 'Failed to create approval request',
            };
          }

          const result = await response.json();
          return {
            success: true,
            approvalId: result.approval?.id,
          };
        } catch (error) {
          console.error('Error creating approval in DB:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
          };
        }
      },

      /**
       * Approve a user in the database
       */
      approveInDb: async (id, authToken) => {
        try {
          const response = await fetch('/api/admin/approvals', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id,
              action: 'approve',
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            return {
              success: false,
              error: errorData.error || 'Failed to approve user',
            };
          }

          // Refresh the database approvals
          await get().fetchDbApprovals(authToken, 'pending');

          return { success: true };
        } catch (error) {
          console.error('Error approving user in DB:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
          };
        }
      },

      /**
       * Deny a user in the database
       */
      denyInDb: async (id, reason, authToken) => {
        try {
          const response = await fetch('/api/admin/approvals', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${authToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              id,
              action: 'deny',
              reason,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            return {
              success: false,
              error: errorData.error || 'Failed to deny user',
            };
          }

          // Refresh the database approvals
          await get().fetchDbApprovals(authToken, 'pending');

          return { success: true };
        } catch (error) {
          console.error('Error denying user in DB:', error);
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Network error',
          };
        }
      },

      /**
       * Fetch approvals from the database
       */
      fetchDbApprovals: async (authToken, status = 'pending') => {
        set({ isLoadingDb: true, dbError: null });

        try {
          const response = await fetch(
            `/api/admin/approvals?status=${status}`,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
                'Content-Type': 'application/json',
              },
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch approvals');
          }

          const data = await response.json();
          set({
            dbApprovals: data.approvals || [],
            isLoadingDb: false,
          });
        } catch (error) {
          console.error('Error fetching approvals from DB:', error);
          set({
            dbError:
              error instanceof Error
                ? error.message
                : 'Failed to fetch approvals',
            isLoadingDb: false,
            dbApprovals: [],
          });
        }
      },

      // ==========================================
      // COMBINED GETTERS
      // ==========================================

      /**
       * Get all approvals combining local and database sources
       * Database approvals take precedence if available
       */
      getAllApprovals: () => {
        const state = get();
        const dbConverted: SignupApproval[] = state.dbApprovals.map((db) => ({
          id: db.id,
          email: db.email,
          fullName: db.full_name,
          createdAt: db.created_at,
          status: db.status,
          note: db.denial_reason || undefined,
        }));

        // Merge: DB approvals take precedence based on email
        const emailMap = new Map<string, SignupApproval>();

        // Add local approvals first
        state.approvals.forEach((approval) => {
          emailMap.set(approval.email.toLowerCase(), approval);
        });

        // Override with DB approvals
        dbConverted.forEach((approval) => {
          emailMap.set(approval.email.toLowerCase(), approval);
        });

        return Array.from(emailMap.values()).sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      },
    }),
    {
      name: 'owner-approvals-storage',
      partialize: (state) => ({
        approvals: state.approvals,
        // Note: dbApprovals are NOT persisted - they're fetched fresh from API
      }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<OwnerApprovalsState>;
        const mergedIds = new Map<string, SignupApproval>();
        (currentState.approvals || []).forEach((item) =>
          mergedIds.set(item.id, item)
        );
        (persisted.approvals || []).forEach((item) =>
          mergedIds.set(item.id, item)
        );
        return {
          ...currentState,
          approvals: Array.from(mergedIds.values()),
        };
      },
    }
  )
);

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Get pending approvals from local storage (legacy)
 */
export const getPendingApprovals = () =>
  useOwnerApprovalsStore
    .getState()
    .approvals.filter((approval) => approval.status === 'pending');

/**
 * Check approval status for a given email
 * Checks both local and database approvals
 */
export const getApprovalStatusByEmail = (
  email: string
): ApprovalStatus | null => {
  const state = useOwnerApprovalsStore.getState();
  const lowerEmail = email.toLowerCase();

  // Check database approvals first (more authoritative)
  const dbApproval = state.dbApprovals.find(
    (a) => a.email.toLowerCase() === lowerEmail
  );
  if (dbApproval) {
    return dbApproval.status;
  }

  // Fall back to local approvals
  const localApproval = state.approvals.find(
    (a) => a.email.toLowerCase() === lowerEmail
  );
  if (localApproval) {
    return localApproval.status;
  }

  return null;
};

/**
 * Create an approval request (dual-write to both local and database)
 * This ensures backward compatibility while transitioning to database
 */
export const createApprovalRequest = async (
  data: { email: string; fullName: string; postcode?: string; userId?: string },
  authToken?: string
): Promise<{ success: boolean; error?: string }> => {
  const store = useOwnerApprovalsStore.getState();

  // Always write to local storage for backward compatibility
  store.enqueueApproval({
    email: data.email,
    fullName: data.fullName,
    postcode: data.postcode,
  });

  // Also write to database if auth token is available
  if (authToken) {
    try {
      const result = await store.enqueueApprovalToDb(
        {
          email: data.email,
          fullName: data.fullName,
          userId: data.userId,
          userType: 'customer',
        },
        authToken
      );

      if (!result.success) {
        console.warn('Failed to write approval to database:', result.error);
        // Don't fail - local storage write succeeded
      }
    } catch (error) {
      console.warn('Error writing approval to database:', error);
      // Don't fail - local storage write succeeded
    }
  }

  return { success: true };
};
