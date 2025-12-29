import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/admin/auth'
import { slugify } from '@/lib/utils/format'

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    
    const supabase = await createClient()
    const slug = body.slug || slugify(body.name)

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name: body.name,
        slug,
        description: body.description,
        price: body.price,
        category: body.category,
        pet_type: body.pet_type,
        stock: body.stock,
        status: body.status,
        supplier_link: body.supplier_link,
        video_url: body.video_url,
        images: body.images || [],
        sizes: body.sizes || [],
        colors: body.colors || [],
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      return NextResponse.json(
        { error: 'Failed to create product' },
        { status: 500 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    if (updates.name && !updates.slug) {
      updates.slug = slugify(updates.name)
    }

    // Ensure sizes and colors are properly formatted as arrays
    if (updates.sizes !== undefined) {
      updates.sizes = Array.isArray(updates.sizes) ? updates.sizes : []
    }
    if (updates.colors !== undefined) {
      updates.colors = Array.isArray(updates.colors) ? updates.colors : []
    }

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      return NextResponse.json(
        { error: 'Failed to update product' },
        { status: 500 }
      )
    }

    return NextResponse.json({ product })
  } catch (error) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  }
}

