import { notFound } from 'next/navigation'
import { ProductForm } from '@/components/admin/ProductForm'
import { createClient } from '@/lib/supabase/server'

// Disable caching for this page to always show fresh data
export const dynamic = 'force-dynamic'

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const supabase = await createClient()
  const resolvedParams = await params
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()

  if (error || !product) {
    console.error('Error fetching product:', error)
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Edit Product</h1>
        <p className="text-gray-600">Update product information and settings</p>
      </div>
      <ProductForm product={product} />
    </div>
  )
}

