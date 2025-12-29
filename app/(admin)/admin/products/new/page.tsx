import { ProductForm } from '@/components/admin/ProductForm'

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Create New Product</h1>
        <p className="text-gray-600">Add a new product to your catalog</p>
      </div>
      <ProductForm />
    </div>
  )
}

