import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/api-auth';

// Initialize Supabase admin client with service role key for admin operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Check if Supabase is properly configured
function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
      supabaseUrl !== 'https://placeholder.supabase.co' &&
      supabaseServiceKey &&
      supabaseServiceKey !== 'placeholder-key'
  );
}

/**
 * GET /api/admin/stats
 * Get platform statistics for admin dashboard
 * Requires admin authentication
 *
 * Returns:
 * - totalRevenue, netRevenue, platformFee (15%)
 * - completedCount, pendingCount, acceptedCount, declinedCount
 * - monthlyRevenue, growth (vs last month)
 * - uniqueBusinesses, uniqueCustomers
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using shared helper
    const { user, isAdmin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    // If Supabase is not configured, return demo data
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured - returning demo stats');
      return NextResponse.json({
        success: true,
        stats: {
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
        },
        bookings: [],
      });
    }

    // Fetch all booking requests with payment info
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('booking_requests')
      .select(
        `
        id,
        customer_id,
        customer_name,
        customer_email,
        business_id,
        business_name,
        service_id,
        service_name,
        requested_date,
        requested_time,
        total_cost,
        platform_fee,
        status,
        created_at,
        payment:payments(*)
      `
      )
      .order('created_at', { ascending: false });

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return NextResponse.json(
        {
          error: 'Failed to fetch booking stats',
          details: bookingsError.message,
        },
        { status: 500 }
      );
    }

    // Calculate booking counts by status
    const completedBookings =
      bookings?.filter((b) => b.status === 'completed') || [];
    const pendingBookings =
      bookings?.filter((b) => b.status === 'pending') || [];
    const acceptedBookings =
      bookings?.filter((b) => b.status === 'accepted') || [];
    const declinedBookings =
      bookings?.filter((b) => b.status === 'declined') || [];

    // Calculate revenue from completed bookings
    const totalRevenue = completedBookings.reduce(
      (sum, b) => sum + (b.total_cost || 0),
      0
    );
    const platformFee = totalRevenue * 0.15;
    const netRevenue = totalRevenue - platformFee;

    // Calculate unique businesses and customers
    const uniqueBusinessIds = new Set(
      bookings?.map((b) => b.business_id).filter(Boolean) || []
    );
    const uniqueCustomerIds = new Set(
      bookings?.map((b) => b.customer_id).filter(Boolean) || []
    );

    // Also count from actual tables for more accuracy
    const { count: businessCount } = await supabaseAdmin
      .from('businesses')
      .select('*', { count: 'exact', head: true });

    const { count: profileCount } = await supabaseAdmin
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    // Calculate monthly revenue and growth
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const isInMonth = (dateStr: string, month: number, year: number) => {
      const d = new Date(dateStr);
      return d.getMonth() === month && d.getFullYear() === year;
    };

    const currentMonthCompleted = completedBookings.filter((b) =>
      isInMonth(b.requested_date || b.created_at, currentMonth, currentYear)
    );
    const lastMonthCompleted = completedBookings.filter((b) =>
      isInMonth(b.requested_date || b.created_at, lastMonth, lastMonthYear)
    );

    const monthlyRevenue = currentMonthCompleted.reduce(
      (sum, b) => sum + (b.total_cost || 0),
      0
    );
    const lastMonthRevenue = lastMonthCompleted.reduce(
      (sum, b) => sum + (b.total_cost || 0),
      0
    );

    // Calculate growth percentage
    const growth =
      lastMonthRevenue > 0
        ? ((monthlyRevenue - lastMonthRevenue) / lastMonthRevenue) * 100
        : monthlyRevenue > 0
          ? 100
          : 0;

    // Transform bookings for the frontend (recent bookings for admin view)
    const recentBookings = (bookings || []).slice(0, 20).map((b) => ({
      id: b.id,
      customerId: b.customer_id,
      customerName: b.customer_name,
      customerEmail: b.customer_email,
      businessId: b.business_id,
      businessName: b.business_name,
      serviceId: b.service_id,
      serviceName: b.service_name,
      requestedDate: b.requested_date,
      requestedTime: b.requested_time,
      totalCost: b.total_cost,
      status: b.status,
      createdAt: b.created_at,
      payment: b.payment,
    }));

    return NextResponse.json({
      success: true,
      stats: {
        totalRevenue,
        netRevenue,
        platformFee,
        completedCount: completedBookings.length,
        pendingCount: pendingBookings.length,
        acceptedCount: acceptedBookings.length,
        declinedCount: declinedBookings.length,
        monthlyRevenue,
        growth,
        uniqueBusinesses: businessCount || uniqueBusinessIds.size,
        uniqueCustomers: profileCount || uniqueCustomerIds.size,
      },
      bookings: recentBookings,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
