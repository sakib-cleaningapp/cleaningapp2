-- Migration: Create user_approvals table for admin approval workflow
-- Created: 2026-01-22
-- Description: Stores pending user registration requests that require admin approval

-- Create the user_approvals table
CREATE TABLE IF NOT EXISTS public.user_approvals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('customer', 'business')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    denial_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.user_approvals IS 'Stores user registration requests pending admin approval';
COMMENT ON COLUMN public.user_approvals.id IS 'Unique identifier for the approval request';
COMMENT ON COLUMN public.user_approvals.user_id IS 'Reference to the auth.users record once created (nullable for pre-registration requests)';
COMMENT ON COLUMN public.user_approvals.email IS 'Email address of the user requesting approval';
COMMENT ON COLUMN public.user_approvals.full_name IS 'Full name of the user requesting approval';
COMMENT ON COLUMN public.user_approvals.user_type IS 'Type of user account: customer or business';
COMMENT ON COLUMN public.user_approvals.status IS 'Approval status: pending, approved, or denied';
COMMENT ON COLUMN public.user_approvals.reviewed_by IS 'Admin user who reviewed this request';
COMMENT ON COLUMN public.user_approvals.reviewed_at IS 'Timestamp when the request was reviewed';
COMMENT ON COLUMN public.user_approvals.denial_reason IS 'Reason provided when a request is denied';
COMMENT ON COLUMN public.user_approvals.created_at IS 'Timestamp when the approval request was created';

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_user_approvals_status ON public.user_approvals(status);
CREATE INDEX IF NOT EXISTS idx_user_approvals_email ON public.user_approvals(email);
CREATE INDEX IF NOT EXISTS idx_user_approvals_user_id ON public.user_approvals(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_user_approvals_user_type ON public.user_approvals(user_type);
CREATE INDEX IF NOT EXISTS idx_user_approvals_created_at ON public.user_approvals(created_at DESC);

-- Composite index for common admin queries (pending requests by type)
CREATE INDEX IF NOT EXISTS idx_user_approvals_status_type ON public.user_approvals(status, user_type);

-- Enable Row Level Security
ALTER TABLE public.user_approvals ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow admins to view all approval requests
-- Note: This assumes admins are identified by a role or admin flag in profiles table
CREATE POLICY "Admins can view all user approvals"
    ON public.user_approvals
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policy: Allow admins to insert approval requests
CREATE POLICY "Admins can insert user approvals"
    ON public.user_approvals
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policy: Allow admins to update approval requests (for reviewing)
CREATE POLICY "Admins can update user approvals"
    ON public.user_approvals
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policy: Allow admins to delete approval requests
CREATE POLICY "Admins can delete user approvals"
    ON public.user_approvals
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policy: Allow service role full access (for backend operations)
CREATE POLICY "Service role has full access to user approvals"
    ON public.user_approvals
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- RLS Policy: Allow users to view their own approval status
CREATE POLICY "Users can view their own approval status"
    ON public.user_approvals
    FOR SELECT
    TO authenticated
    USING (
        user_id = auth.uid()
        OR email = (SELECT email FROM auth.users WHERE id = auth.uid())
    );

-- RLS Policy: Allow anonymous users to insert approval requests (for registration)
CREATE POLICY "Anyone can submit approval requests"
    ON public.user_approvals
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (
        status = 'pending'
        AND reviewed_by IS NULL
        AND reviewed_at IS NULL
    );
