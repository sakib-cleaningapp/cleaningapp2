import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS for service operations
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/business/services/[id] - Get a single service by ID
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const { data: service, error: fetchError } = await supabaseAdmin
      .from('services')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }
      console.error('Error fetching service:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
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
    };

    return NextResponse.json({ success: true, service: transformedService });
  } catch (error: any) {
    console.error('Error fetching service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/business/services/[id] - Update a service
 * Body: { name?, description?, price?, pricingType?, isActive? }
 *
 * Note: Business portal uses localStorage auth, not Supabase auth,
 * so we don't require auth for this endpoint.
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, pricingType, isActive } = body;

    // Build update object with only provided fields
    const updateData: Record<string, any> = {};

    if (name !== undefined) {
      if (name.trim() === '') {
        return NextResponse.json(
          { error: 'Service name cannot be empty' },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || '';
    }

    if (pricingType !== undefined) {
      const validPricingTypes = ['fixed', 'hourly', 'quote'];
      if (!validPricingTypes.includes(pricingType)) {
        return NextResponse.json(
          {
            error: 'Invalid pricing type. Must be one of: fixed, hourly, quote',
          },
          { status: 400 }
        );
      }
      updateData.pricing_type = pricingType;
    }

    if (price !== undefined) {
      // Get current pricing type if not being updated
      const currentPricingType =
        pricingType || (await getCurrentPricingType(id));
      if (currentPricingType !== 'quote') {
        if (price < 0) {
          return NextResponse.json(
            { error: 'Price cannot be negative' },
            { status: 400 }
          );
        }
        updateData.price = Number(price);
      } else {
        updateData.price = null;
      }
    }

    if (isActive !== undefined) {
      updateData.is_active = Boolean(isActive);
    }

    // If no fields to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // Update the service
    const { data: service, error: updateError } = await supabaseAdmin
      .from('services')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }
      console.error('Error updating service:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
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
    };

    return NextResponse.json({
      success: true,
      service: transformedService,
    });
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update service' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/business/services/[id] - Delete a service
 *
 * Note: Business portal uses localStorage auth, not Supabase auth,
 * so we don't require auth for this endpoint.
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Service ID is required' },
        { status: 400 }
      );
    }

    // Check if service exists first
    const { data: existingService, error: fetchError } = await supabaseAdmin
      .from('services')
      .select('id')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Service not found' },
          { status: 404 }
        );
      }
      console.error('Error checking service:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Delete the service
    const { error: deleteError } = await supabaseAdmin
      .from('services')
      .delete()
      .eq('id', id);

    if (deleteError) {
      console.error('Error deleting service:', deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting service:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to delete service' },
      { status: 500 }
    );
  }
}

// Helper function to get current pricing type for a service
async function getCurrentPricingType(serviceId: string): Promise<string> {
  const { data } = await supabaseAdmin
    .from('services')
    .select('pricing_type')
    .eq('id', serviceId)
    .single();
  return data?.pricing_type || 'fixed';
}
