import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// Create a Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, profileData, businessData, services } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Step 1: Check if profile exists
    const { data: existingProfile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    let profileId: string;

    if (existingProfile) {
      // Update existing profile with new business info
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          role: 'BUSINESS_OWNER',
          full_name: profileData.fullName,
          email: profileData.email,
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error('Profile update error:', updateError);
      }
      profileId = existingProfile.id;
    } else {
      // Create new profile
      const { data: newProfile, error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert({
          user_id: userId,
          email: profileData.email,
          full_name: profileData.fullName,
          role: 'BUSINESS_OWNER',
        })
        .select('id')
        .single();

      if (insertError) {
        return NextResponse.json(
          { error: `Profile creation failed: ${insertError.message}` },
          { status: 500 }
        );
      }
      profileId = newProfile.id;
    }

    // Step 2: Create business
    const { data: business, error: businessError } = await supabaseAdmin
      .from('businesses')
      .insert({
        owner_id: profileId,
        business_name: businessData.businessName,
        bio: businessData.bio,
        service_category: businessData.serviceCategory,
      })
      .select()
      .single();

    if (businessError) {
      return NextResponse.json(
        { error: `Business creation failed: ${businessError.message}` },
        { status: 500 }
      );
    }

    // Step 3: Create services
    if (services && services.length > 0) {
      const servicesToInsert = services.map((service: any) => ({
        business_id: business.id,
        name: service.name,
        description: service.description || service.name,
        price: service.price || 50,
        pricing_type: service.pricingType || 'fixed',
        is_active: true,
      }));

      const { error: servicesError } = await supabaseAdmin
        .from('services')
        .insert(servicesToInsert);

      if (servicesError) {
        console.error('Services creation error:', servicesError);
        // Continue anyway, services can be added later
      }
    }

    // Step 4: Create approval record
    const { error: approvalError } = await supabaseAdmin
      .from('user_approvals')
      .insert({
        user_id: userId,
        email: profileData.email.toLowerCase(),
        full_name: profileData.fullName,
        user_type: 'business',
        status: 'pending',
      });

    if (approvalError) {
      console.error('Approval creation error:', approvalError);
      // Continue anyway
    }

    return NextResponse.json({
      success: true,
      business: business,
    });
  } catch (error) {
    console.error('Business registration error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Registration failed' },
      { status: 500 }
    );
  }
}
