'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Users,
  DollarSign,
  CheckCircle2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Building2,
  LogOut,
  RefreshCw,
  Loader2,
  XCircle,
  RotateCcw,
  CreditCard,
} from 'lucide-react';
import { useRequireOwner, useAuth } from '@/contexts/auth-context';
import { useOwnerAuthStore } from '@/stores/owner-auth-store';
import Link from 'next/link';

// Types for database approvals
interface UserApproval {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  user_type: 'customer' | 'business';
  status: 'pending' | 'approved' | 'denied';
  reviewed_by: string | null;
  reviewed_at: string | null;
  denial_reason: string | null;
  created_at: string;
}

interface ApprovalsMeta {
  total: number;
  pending: number;
  approved: number;
  denied: number;
}

// Types for admin stats
interface AdminStats {
  totalRevenue: number;
  netRevenue: number;
  platformFee: number;
  completedCount: number;
  pendingCount: number;
  acceptedCount: number;
  declinedCount: number;
  monthlyRevenue: number;
  growth: number;
  uniqueBusinesses: number;
  uniqueCustomers: number;
}

interface BookingData {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  businessId: string;
  businessName: string;
  serviceId: string;
  serviceName: string;
  requestedDate: string;
  requestedTime: string;
  totalCost: number;
  status: string;
  createdAt: string;
  payment?: any;
}

export default function AdminDashboardPage() {
  const { isOwner } = useRequireOwner();
  const { user } = useAuth();
  const { logoutOwner } = useOwnerAuthStore();

  // Stats state (fetched from API)
  const [stats, setStats] = useState<AdminStats>({
    totalRevenue: 0,
    netRevenue: 0,
    platformFee: 0,
    completedCount: 0,
    pendingCount: 0,
    acceptedCount: 0,
    declinedCount: 0,
    monthlyRevenue: 0,
    growth: 0,
    uniqueBusinesses: 0,
    uniqueCustomers: 0,
  });
  const [bookings, setBookings] = useState<BookingData[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Approvals state (fetched from API)
  const [approvals, setApprovals] = useState<UserApproval[]>([]);
  const [approvalsMeta, setApprovalsMeta] = useState<ApprovalsMeta>({
    total: 0,
    pending: 0,
    approved: 0,
    denied: 0,
  });
  const [isLoadingApprovals, setIsLoadingApprovals] = useState(true);
  const [approvalsError, setApprovalsError] = useState<string | null>(null);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<
    'pending' | 'approved' | 'denied' | 'all'
  >('pending');

  // Denial reason modal state
  const [denialModal, setDenialModal] = useState<{
    open: boolean;
    approvalId: string | null;
  }>({
    open: false,
    approvalId: null,
  });
  const [denialReason, setDenialReason] = useState('');

  // Refund state
  const [refundingIds, setRefundingIds] = useState<Set<string>>(new Set());
  const [refundModal, setRefundModal] = useState<{
    open: boolean;
    booking: any | null;
  }>({ open: false, booking: null });

  // Filter bookings with payments for refund capability
  const paidBookings = bookings.filter((b) => b.status !== 'cancelled');

  // Get auth token for API calls
  const getAuthToken = useCallback(async () => {
    // Try to get the session token from Supabase
    try {
      const { supabase } = await import('@/lib/supabase');
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session?.access_token || 'demo-token';
    } catch {
      return 'demo-token';
    }
  }, []);

  // Fetch stats from API
  const fetchStats = useCallback(async () => {
    setIsLoadingStats(true);
    setStatsError(null);

    try {
      const token = await getAuthToken();
      const response = await fetch('/api/admin/stats', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch stats');
      }

      const data = await response.json();
      if (data.stats) {
        setStats(data.stats);
      }
      if (data.bookings) {
        setBookings(data.bookings);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setStatsError(
        error instanceof Error ? error.message : 'Failed to fetch stats'
      );
    } finally {
      setIsLoadingStats(false);
    }
  }, [getAuthToken]);

  // Fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch approvals from API
  const fetchApprovals = useCallback(async () => {
    setIsLoadingApprovals(true);
    setApprovalsError(null);

    try {
      const token = await getAuthToken();
      const response = await fetch(
        `/api/admin/approvals?status=${statusFilter}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch approvals');
      }

      const data = await response.json();
      setApprovals(data.approvals || []);
      setApprovalsMeta(
        data.meta || { total: 0, pending: 0, approved: 0, denied: 0 }
      );
    } catch (error) {
      console.error('Error fetching approvals:', error);
      setApprovalsError(
        error instanceof Error ? error.message : 'Failed to fetch approvals'
      );
      setApprovals([]);
    } finally {
      setIsLoadingApprovals(false);
    }
  }, [getAuthToken, statusFilter]);

  // Fetch approvals on mount and when filter changes
  useEffect(() => {
    fetchApprovals();
  }, [fetchApprovals]);

  // Handle approve action
  const handleApprove = async (approvalId: string) => {
    setProcessingIds((prev) => new Set(prev).add(approvalId));

    try {
      const token = await getAuthToken();
      const response = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: approvalId,
          action: 'approve',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to approve user');
      }

      // Refresh approvals list
      await fetchApprovals();
    } catch (error) {
      console.error('Error approving user:', error);
      alert(error instanceof Error ? error.message : 'Failed to approve user');
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(approvalId);
        return newSet;
      });
    }
  };

  // Handle deny action (opens modal)
  const openDenialModal = (approvalId: string) => {
    setDenialModal({ open: true, approvalId });
    setDenialReason('');
  };

  // Submit denial
  const submitDenial = async () => {
    if (!denialModal.approvalId || !denialReason.trim()) {
      alert('Please provide a reason for denial');
      return;
    }

    const approvalId = denialModal.approvalId;
    setDenialModal({ open: false, approvalId: null });
    setProcessingIds((prev) => new Set(prev).add(approvalId));

    try {
      const token = await getAuthToken();
      const response = await fetch('/api/admin/approvals', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: approvalId,
          action: 'deny',
          reason: denialReason.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to deny user');
      }

      // Refresh approvals list
      await fetchApprovals();
    } catch (error) {
      console.error('Error denying user:', error);
      alert(error instanceof Error ? error.message : 'Failed to deny user');
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(approvalId);
        return newSet;
      });
      setDenialReason('');
    }
  };

  const handleLogout = () => {
    logoutOwner();
  };

  // Handle refund
  const handleRefund = async (booking: any) => {
    // Need paymentIntentId from the booking's payment record
    // For now, we'll use the booking ID and call the cancel/refund API
    setRefundingIds((prev) => new Set(prev).add(booking.id));

    try {
      const token = await getAuthToken();
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          bookingId: booking.id,
          status: 'cancelled',
          cancelledBy: 'admin',
          cancellationReason: 'Refund issued by platform administrator',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setRefundModal({
          open: true,
          booking: {
            ...booking,
            refundProcessed: result.refund?.success || false,
            refundId: result.refund?.refundId,
          },
        });
      } else {
        alert(result.error || 'Failed to process refund');
      }
    } catch (error) {
      console.error('Refund error:', error);
      alert('Failed to process refund');
    } finally {
      setRefundingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(booking.id);
        return newSet;
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-white/10 bg-slate-900/70 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-sky-100/70">Owner Console</p>
              <h1 className="text-lg font-semibold">Platform Admin</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-sm text-sky-100/80 hover:text-white underline underline-offset-4"
            >
              Back to product
            </Link>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 text-sm text-sky-100/80 hover:text-white px-3 py-2 rounded-lg border border-white/10 hover:border-white/30 transition"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sky-200/80 text-sm">Growth overview</p>
            <h2 className="text-3xl font-bold">Platform metrics</h2>
          </div>
          <div className="flex items-center gap-3">
            {isOwner && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-200 border border-emerald-500/30">
                Owner Verified
              </span>
            )}
            <button
              onClick={fetchStats}
              disabled={isLoadingStats}
              className="p-2 rounded-lg border border-white/10 hover:border-white/30 transition disabled:opacity-50"
              title="Refresh stats"
            >
              <RefreshCw
                className={`w-4 h-4 ${isLoadingStats ? 'animate-spin' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Stats error state */}
        {statsError && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
            <AlertTriangle className="w-4 h-4" />
            {statsError}
          </div>
        )}

        {/* Stats loading state */}
        {isLoadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-white/10" />
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-white/10 rounded" />
                    <div className="h-6 w-24 bg-white/10 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Monthly Revenue"
                value={`£${stats.monthlyRevenue.toFixed(2)}`}
                icon={<TrendingUp className="w-5 h-5 text-emerald-300" />}
                helper={`${stats.growth >= 0 ? '+' : '-'}${Math.abs(stats.growth).toFixed(1)}% vs last month`}
              />
              <StatCard
                title="Total Completed Revenue"
                value={`£${stats.totalRevenue.toFixed(2)}`}
                icon={<DollarSign className="w-5 h-5 text-sky-300" />}
                helper={`Net: £${stats.netRevenue.toFixed(2)} (fees £${stats.platformFee.toFixed(2)})`}
              />
              <StatCard
                title="Bookings"
                value={`${stats.completedCount} completed`}
                icon={<CheckCircle2 className="w-5 h-5 text-amber-300" />}
                helper={`${stats.pendingCount} pending | ${stats.acceptedCount} accepted | ${stats.declinedCount} declined`}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-sky-100/80">Network</p>
                    <h3 className="text-xl font-semibold">Supply & Demand</h3>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <MiniCard
                    label="Active businesses"
                    value={stats.uniqueBusinesses}
                    icon={<Building2 className="w-4 h-4" />}
                  />
                  <MiniCard
                    label="Active customers"
                    value={stats.uniqueCustomers}
                    icon={<Users className="w-4 h-4" />}
                  />
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-sky-100/80">User Approvals</p>
                    <h3 className="text-xl font-semibold">Approval Stats</h3>
                  </div>
                  <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <MiniCard
                    label="Pending"
                    value={approvalsMeta.pending}
                    icon={<Clock className="w-4 h-4 text-amber-300" />}
                  />
                  <MiniCard
                    label="Approved"
                    value={approvalsMeta.approved}
                    icon={<CheckCircle2 className="w-4 h-4 text-emerald-300" />}
                  />
                  <MiniCard
                    label="Denied"
                    value={approvalsMeta.denied}
                    icon={<XCircle className="w-4 h-4 text-red-300" />}
                  />
                </div>
              </div>
            </div>
          </>
        )}

        {/* Signup Approvals Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-sky-100/80">Access control</p>
              <h3 className="text-xl font-semibold">Signup approvals</h3>
            </div>
            <div className="flex items-center gap-3">
              {/* Status filter tabs */}
              <div className="flex rounded-lg border border-white/10 overflow-hidden">
                {(['pending', 'approved', 'denied', 'all'] as const).map(
                  (status) => (
                    <button
                      key={status}
                      onClick={() => setStatusFilter(status)}
                      className={`px-3 py-1.5 text-xs font-medium transition ${
                        statusFilter === status
                          ? 'bg-sky-500/20 text-sky-200'
                          : 'text-sky-100/60 hover:text-sky-100/80 hover:bg-white/5'
                      }`}
                    >
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={fetchApprovals}
                disabled={isLoadingApprovals}
                className="p-2 rounded-lg border border-white/10 hover:border-white/30 transition disabled:opacity-50"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoadingApprovals ? 'animate-spin' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Error state */}
          {approvalsError && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-200 text-sm mb-4">
              <AlertTriangle className="w-4 h-4" />
              {approvalsError}
            </div>
          )}

          {/* Loading state */}
          {isLoadingApprovals ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-sky-300" />
              <span className="ml-2 text-sky-100/70">Loading approvals...</span>
            </div>
          ) : approvals.length === 0 ? (
            <div className="text-sky-100/70 text-sm py-4">
              {statusFilter === 'pending'
                ? 'No pending signups. New customer registrations will appear here for review.'
                : `No ${statusFilter === 'all' ? '' : statusFilter + ' '}approvals found.`}
            </div>
          ) : (
            <div className="space-y-3">
              {approvals.map((approval) => (
                <div
                  key={approval.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">
                        {approval.full_name}{' '}
                        <span className="text-sky-100/70 font-normal">
                          ({approval.email})
                        </span>
                      </p>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          approval.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-200'
                            : approval.status === 'approved'
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : 'bg-red-500/20 text-red-200'
                        }`}
                      >
                        {approval.status}
                      </span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-white/10 text-sky-100/70">
                        {approval.user_type}
                      </span>
                    </div>
                    <p className="text-xs text-sky-100/70 mt-1">
                      Requested{' '}
                      {new Date(approval.created_at).toLocaleDateString(
                        'en-GB',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                      {approval.reviewed_at && (
                        <span>
                          {' '}
                          | Reviewed{' '}
                          {new Date(approval.reviewed_at).toLocaleDateString(
                            'en-GB',
                            {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            }
                          )}
                        </span>
                      )}
                    </p>
                    {approval.denial_reason && (
                      <p className="text-xs text-red-300/80 mt-1">
                        Denial reason: {approval.denial_reason}
                      </p>
                    )}
                  </div>
                  {approval.status === 'pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openDenialModal(approval.id)}
                        disabled={processingIds.has(approval.id)}
                        className="px-3 py-2 rounded-lg text-sm border border-red-400/40 text-red-100 hover:bg-red-500/10 transition disabled:opacity-50"
                      >
                        {processingIds.has(approval.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Deny'
                        )}
                      </button>
                      <button
                        onClick={() => handleApprove(approval.id)}
                        disabled={processingIds.has(approval.id)}
                        className="px-3 py-2 rounded-lg text-sm bg-emerald-500 text-white hover:bg-emerald-600 transition disabled:opacity-50"
                      >
                        {processingIds.has(approval.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Approve'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-emerald-400/60 mt-4 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Connected to Supabase database - approvals are persisted.
          </p>
        </div>

        {/* Bookings Management Section */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-sky-100/80">Booking management</p>
              <h3 className="text-xl font-semibold">
                Recent Bookings & Refunds
              </h3>
            </div>
            <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
          </div>

          {paidBookings.length === 0 ? (
            <div className="text-sky-100/70 text-sm py-4">
              No bookings found. Customer bookings will appear here.
            </div>
          ) : (
            <div className="space-y-3">
              {paidBookings.slice(0, 10).map((booking) => (
                <div
                  key={booking.id}
                  className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{booking.serviceName}</p>
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          booking.status === 'pending'
                            ? 'bg-amber-500/20 text-amber-200'
                            : booking.status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-200'
                              : booking.status === 'completed'
                                ? 'bg-blue-500/20 text-blue-200'
                                : 'bg-red-500/20 text-red-200'
                        }`}
                      >
                        {booking.status}
                      </span>
                    </div>
                    <p className="text-sm text-sky-100/70 mt-1">
                      {booking.customerName} ({booking.customerEmail})
                    </p>
                    <p className="text-xs text-sky-100/50 mt-1">
                      {new Date(booking.requestedDate).toLocaleDateString(
                        'en-GB',
                        {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        }
                      )}{' '}
                      at {booking.requestedTime} | £{booking.totalCost}
                    </p>
                  </div>
                  {booking.status !== 'cancelled' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRefund(booking)}
                        disabled={refundingIds.has(booking.id)}
                        className="px-3 py-2 rounded-lg text-sm border border-amber-400/40 text-amber-100 hover:bg-amber-500/10 transition disabled:opacity-50 flex items-center gap-2"
                      >
                        {refundingIds.has(booking.id) ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RotateCcw className="w-4 h-4" />
                        )}
                        Cancel & Refund
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-sky-100/50 mt-4">
            Showing up to 10 most recent bookings. Cancel & Refund will
            automatically process a refund if payment was collected.
          </p>
        </div>
      </div>

      {/* Denial Reason Modal */}
      {denialModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold mb-2">
              Deny Approval Request
            </h3>
            <p className="text-sm text-sky-100/70 mb-4">
              Please provide a reason for denying this signup request. This will
              be recorded for reference.
            </p>
            <textarea
              value={denialReason}
              onChange={(e) => setDenialReason(e.target.value)}
              placeholder="Enter denial reason..."
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-sky-100/40 focus:outline-none focus:border-sky-500/50 resize-none"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() =>
                  setDenialModal({ open: false, approvalId: null })
                }
                className="px-4 py-2 rounded-lg text-sm border border-white/10 text-sky-100/80 hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitDenial}
                disabled={!denialReason.trim()}
                className="px-4 py-2 rounded-lg text-sm bg-red-500 text-white hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm Denial
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Success Modal */}
      {refundModal.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-emerald-300" />
              </div>
              <h3 className="text-lg font-semibold">Booking Cancelled</h3>
            </div>
            <p className="text-sm text-sky-100/70 mb-4">
              The booking for{' '}
              <strong>{refundModal.booking?.serviceName}</strong> has been
              cancelled.
              {refundModal.booking?.refundProcessed ? (
                <span className="block mt-2 text-emerald-300">
                  Refund processed successfully. Refund ID:{' '}
                  {refundModal.booking?.refundId}
                </span>
              ) : (
                <span className="block mt-2 text-amber-300">
                  No payment was found to refund, or refund could not be
                  processed.
                </span>
              )}
            </p>
            <div className="text-xs text-sky-100/50 mb-4">
              <p>Customer: {refundModal.booking?.customerName}</p>
              <p>Amount: £{refundModal.booking?.totalCost}</p>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setRefundModal({ open: false, booking: null })}
                className="px-4 py-2 rounded-lg text-sm bg-sky-500 text-white hover:bg-sky-600 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  title,
  value,
  helper,
  icon,
}: {
  title: string;
  value: string;
  helper?: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-2">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm text-sky-100/80">{title}</p>
          <h4 className="text-2xl font-semibold">{value}</h4>
        </div>
      </div>
      {helper && <p className="text-xs text-sky-100/70">{helper}</p>}
    </div>
  );
}

function MiniCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-4">
      <div className="flex items-center justify-between mb-1 text-sky-100/80 text-sm">
        <span>{label}</span>
        <span>{icon}</span>
      </div>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}
