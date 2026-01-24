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
 * GET /api/admin/approvals
 * List all user approvals, optionally filtered by status
 * Requires admin authentication
 * Query params:
 *   - status: 'pending' | 'approved' | 'denied' | 'all' (default: 'pending')
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using shared helper
    const { user, isAdmin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    // If Supabase is not configured, return empty array for demo
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured - returning empty approvals list');
      return NextResponse.json({
        success: true,
        approvals: [],
        meta: {
          total: 0,
          pending: 0,
          approved: 0,
          denied: 0,
        },
      });
    }

    // Get status filter from query params
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get('status') || 'pending';

    // Build query
    let query = supabaseAdmin
      .from('user_approvals')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply status filter if not 'all'
    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data: approvals, error } = await query;

    if (error) {
      console.error('Error fetching approvals:', error);
      return NextResponse.json(
        { error: 'Failed to fetch approvals', details: error.message },
        { status: 500 }
      );
    }

    // Get counts for meta information
    const { data: allApprovals } = await supabaseAdmin
      .from('user_approvals')
      .select('status');

    const counts = {
      total: allApprovals?.length || 0,
      pending: allApprovals?.filter((a) => a.status === 'pending').length || 0,
      approved:
        allApprovals?.filter((a) => a.status === 'approved').length || 0,
      denied: allApprovals?.filter((a) => a.status === 'denied').length || 0,
    };

    return NextResponse.json({
      success: true,
      approvals: approvals || [],
      meta: counts,
    });
  } catch (error) {
    console.error('Error in GET /api/admin/approvals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/approvals
 * Approve or deny a user approval request
 * Requires admin authentication
 * Body:
 *   - id: string (approval ID)
 *   - action: 'approve' | 'deny'
 *   - reason?: string (required for deny, optional for approve)
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin authentication using shared helper
    const { user, isAdmin, error: authError } = await requireAdmin(request);
    if (authError) return authError;

    const body = await request.json();
    const { id, action, reason } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: 'Missing required field: id' },
        { status: 400 }
      );
    }

    if (!action || !['approve', 'deny'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "deny"' },
        { status: 400 }
      );
    }

    // Require reason for denials
    if (action === 'deny' && !reason) {
      return NextResponse.json(
        { error: 'Reason is required when denying an approval' },
        { status: 400 }
      );
    }

    // If Supabase is not configured, return success for demo
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured - simulating approval action');
      return NextResponse.json({
        success: true,
        message: `User ${action === 'approve' ? 'approved' : 'denied'} successfully (demo mode)`,
        approval: {
          id,
          status: action === 'approve' ? 'approved' : 'denied',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id || 'demo-admin',
          denial_reason: action === 'deny' ? reason : null,
        },
      });
    }

    // Update the approval in the database
    const updateData: Record<string, string | null> = {
      status: action === 'approve' ? 'approved' : 'denied',
      reviewed_at: new Date().toISOString(),
      reviewed_by: user?.id || null,
    };

    if (action === 'deny' && reason) {
      updateData.denial_reason = reason;
    }

    const { data: updatedApproval, error } = await supabaseAdmin
      .from('user_approvals')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating approval:', error);
      return NextResponse.json(
        { error: 'Failed to update approval', details: error.message },
        { status: 500 }
      );
    }

    if (!updatedApproval) {
      return NextResponse.json(
        { error: 'Approval not found' },
        { status: 404 }
      );
    }

    // Note: Approval status is tracked in user_approvals table, not in profiles
    // The profiles table doesn't have an is_approved column
    // The user_approvals.status field is the source of truth for approval status

    return NextResponse.json({
      success: true,
      message: `User ${action === 'approve' ? 'approved' : 'denied'} successfully`,
      approval: updatedApproval,
    });
  } catch (error) {
    console.error('Error in POST /api/admin/approvals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/approvals
 * Create a new approval request (used during signup)
 * Note: This endpoint does NOT require admin auth as it's called during user registration
 * Body:
 *   - user_id?: string (Supabase auth user ID)
 *   - email: string
 *   - full_name: string
 *   - user_type?: 'customer' | 'business' (default: 'customer')
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, email, full_name, user_type = 'customer' } = body;

    // Validate required fields
    if (!email || !full_name) {
      return NextResponse.json(
        { error: 'Missing required fields: email and full_name are required' },
        { status: 400 }
      );
    }

    // If Supabase is not configured, return success for demo
    if (!isSupabaseConfigured()) {
      console.warn('Supabase not configured - simulating approval creation');
      return NextResponse.json({
        success: true,
        message: 'Approval request created (demo mode)',
        approval: {
          id: `demo-${Date.now()}`,
          user_id,
          email,
          full_name,
          user_type,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      });
    }

    // Check if an approval already exists for this email
    const { data: existing } = await supabaseAdmin
      .from('user_approvals')
      .select('id, status')
      .eq('email', email.toLowerCase())
      .single();

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Approval request already exists',
        approval: existing,
        existing: true,
      });
    }

    // Create new approval request
    const { data: newApproval, error } = await supabaseAdmin
      .from('user_approvals')
      .insert([
        {
          user_id: user_id || null,
          email: email.toLowerCase(),
          full_name,
          user_type,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating approval:', error);
      return NextResponse.json(
        { error: 'Failed to create approval request', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Approval request created successfully',
      approval: newApproval,
    });
  } catch (error) {
    console.error('Error in PUT /api/admin/approvals:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
