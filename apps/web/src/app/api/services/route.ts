import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for public service listing
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/services - Get all active services for customers
 * Query params (optional):
 *   - category: string - Filter by service category
 *   - search: string - Search by name or description
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Build query - fetch active services with business info
    let query = supabaseAdmin
      .from('services')
      .select(
        `
        id,
        name,
        description,
        price,
        pricing_type,
        business_id,
        businesses (
          id,
          business_name,
          rating,
          service_category,
          owner_id,
          profiles!businesses_owner_id_fkey (
            full_name,
            postcode
          )
        )
      `
      )
      .eq('is_active', true);

    // Execute query
    const { data: services, error: queryError } = await query;

    console.log('📦 Services fetched from DB:', services?.length || 0);
    if (services && services.length > 0) {
      console.log('📦 First service:', JSON.stringify(services[0], null, 2));
    }

    if (queryError) {
      console.error('Error fetching services:', queryError);
      return NextResponse.json({ error: queryError.message }, { status: 500 });
    }

    // Transform the data
    let transformedServices = (services || []).map((service: any) => {
      const businessCategory = service.businesses?.service_category || '';
      const profileData = Array.isArray(service.businesses?.profiles)
        ? service.businesses.profiles[0]
        : service.businesses?.profiles;

      return {
        id: service.id,
        name: service.name,
        description: service.description || '',
        price: service.price,
        pricingType: service.pricing_type,
        duration: estimateDuration(service.name),
        category: businessCategory,
        business: {
          id: service.businesses?.id || service.business_id,
          name: service.businesses?.business_name || 'Unknown Business',
          rating: service.businesses?.rating || 0,
          serviceCategory: businessCategory,
          profile: profileData
            ? {
                fullName: profileData.full_name || '',
                postcode: profileData.postcode || '',
              }
            : null,
        },
      };
    });

    // Apply category filter
    if (category) {
      transformedServices = transformedServices.filter(
        (service: any) => service.category === category
      );
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      transformedServices = transformedServices.filter(
        (service: any) =>
          service.name.toLowerCase().includes(searchLower) ||
          service.description.toLowerCase().includes(searchLower) ||
          service.business.name.toLowerCase().includes(searchLower)
      );
    }

    return NextResponse.json({
      success: true,
      services: transformedServices,
    });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch services' },
      { status: 500 }
    );
  }
}

// Helper function to estimate service duration based on name
function estimateDuration(serviceName: string): string {
  const name = serviceName.toLowerCase();
  if (name.includes('deep') || name.includes('move')) return '4-6 hours';
  if (name.includes('office') || name.includes('commercial'))
    return '3-4 hours';
  if (name.includes('regular') || name.includes('weekly')) return '2-3 hours';
  if (name.includes('emergency')) return '1-2 hours';
  if (name.includes('bathroom') || name.includes('installation'))
    return '6-8 hours';
  return '2-4 hours';
}
