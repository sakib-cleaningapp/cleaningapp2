import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for service operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/business/services - Get all services for a business
 * Query params:
 *   - businessId: string (required) - The business ID to fetch services for
 *
 * Note: Business portal uses localStorage auth, not Supabase auth,
 * so we accept businessId directly from query params.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const businessId = searchParams.get('businessId');

    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId is required' },
        { status: 400 }
      );
    }

    // Fetch all services for this business
    const { data: services, error: servicesError } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('business_id', businessId)
      .order('created_at', { ascending: false });

    if (servicesError) {
      console.error('Error fetching services:', servicesError);
      return NextResponse.json(
        { error: servicesError.message },
        { status: 500 }
      );
    }

    // Transform snake_case to camelCase for frontend
    const transformedServices = (services || []).map((service) => ({
      id: service.id,
      businessId: service.business_id,
      name: service.name,
      description: service.description,
      price: service.price,
      pricingType: service.pricing_type || 'fixed',
      isActive: service.is_active,
      createdAt: service.created_at,
      updatedAt: service.updated_at,
    }));

    return NextResponse.json({ success: true, services: transformedServices });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/business/services - Create a new service
 * Body: { businessId, name, description, price, pricingType, isActive }
 *
 * Note: Business portal uses localStorage auth, not Supabase auth,
 * so we don't require auth for this endpoint.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      businessId,
      name,
      description,
      price,
      pricingType = 'fixed',
      isActive = true,
    } = body;

    // Validate required fields
    if (!businessId) {
      return NextResponse.json(
        { error: 'businessId is required' },
        { status: 400 }
      );
    }

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Service name is required' },
        { status: 400 }
      );
    }

    // Validate pricing type
    const validPricingTypes = ['fixed', 'hourly', 'quote'];
    if (!validPricingTypes.includes(pricingType)) {
      return NextResponse.json(
        { error: 'Invalid pricing type. Must be one of: fixed, hourly, quote' },
        { status: 400 }
      );
    }

    // Validate price for non-quote pricing types
    if (
      pricingType !== 'quote' &&
      (price === undefined || price === null || price < 0)
    ) {
      return NextResponse.json(
        { error: 'A valid price is required for fixed or hourly pricing' },
        { status: 400 }
      );
    }

    // Create the service
    const serviceData = {
      business_id: businessId,
      name: name.trim(),
      description: description?.trim() || '',
      price: pricingType === 'quote' ? null : Number(price),
      pricing_type: pricingType,
      is_active: isActive,
    };

    const { data: service, error: createError } = await supabaseAdmin
      .from('services')
      .insert([serviceData])
      .select()
      .single();

    if (createError) {
      console.error('Error creating service:', createError);
      return NextResponse.json({ error: createError.message }, { status: 500 });
    }

    // Transform to camelCase for frontend
    const transformedService = {
      id: service.id,
      businessId: service.business_id,
      name: service.name,
      description: service.description,
      price: service.price,
      pricingType: service.pricing_type,
      isActive: service.is_active,
      createdAt: service.created_at,
      updatedAt: service.updated_at,
    };

    return NextResponse.json({
      success: true,
      service: transformedService,
    });
  } catch (error: any) {
    console.error('Error creating service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create service' },
      { status: 500 }
    );
  }
}
