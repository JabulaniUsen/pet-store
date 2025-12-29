'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Plus, X } from 'lucide-react'

interface ProductFormProps {
  product?: any
}

// Popular sizes for quick selection
const POPULAR_SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL',
  '2XS', '3XL', '4XL', '5XL',
  'Small', 'Medium', 'Large', 'Extra Large',
  'One Size', 'OS',
  '28', '30', '32', '34', '36', '38', '40', '42', '44', '46',
  'Petite', 'Regular', 'Tall',
]

// Popular colors with hex codes for quick selection
const POPULAR_COLORS = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Blue', hex: '#0000FF' },
  { name: 'Green', hex: '#008000' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Orange', hex: '#FFA500' },
  { name: 'Purple', hex: '#800080' },
  { name: 'Pink', hex: '#FFC0CB' },
  { name: 'Black', hex: '#000000' },
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Gray', hex: '#808080' },
  { name: 'Brown', hex: '#A52A2A' },
  { name: 'Navy', hex: '#000080' },
  { name: 'Teal', hex: '#008080' },
  { name: 'Maroon', hex: '#800000' },
  { name: 'Olive', hex: '#808000' },
  { name: 'Lime', hex: '#00FF00' },
  { name: 'Cyan', hex: '#00FFFF' },
  { name: 'Magenta', hex: '#FF00FF' },
  { name: 'Silver', hex: '#C0C0C0' },
  { name: 'Gold', hex: '#FFD700' },
  { name: 'Beige', hex: '#F5F5DC' },
  { name: 'Coral', hex: '#FF7F50' },
  { name: 'Turquoise', hex: '#40E0D0' },
  { name: 'Lavender', hex: '#E6E6FA' },
]

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [customColorInputs, setCustomColorInputs] = useState<Record<number, boolean>>({})
  const [customSizeInputs, setCustomSizeInputs] = useState<Record<number, boolean>>({})
  
  // Helper function to safely parse JSONB fields
  const parseJsonbField = (value: any): any[] => {
    if (Array.isArray(value)) return value
    if (!value) return []
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }
    return []
  }

  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    category: product?.category || '',
    pet_type: product?.pet_type || 'all',
    stock: product?.stock || 0,
    status: product?.status || 'draft',
    supplier_link: product?.supplier_link || '',
    video_url: product?.video_url || '',
    images: product?.images || [],
    sizes: parseJsonbField(product?.sizes),
    colors: parseJsonbField(product?.colors),
  })

  // Update form data when product prop changes (for editing)
  useEffect(() => {
    if (product) {
      const parsedColors = parseJsonbField(product.colors)
      const parsedSizes = parseJsonbField(product.sizes)
      // Initialize custom color inputs for colors that aren't in popular colors list
      const customColorInputs: Record<number, boolean> = {}
      parsedColors.forEach((color: any, index: number) => {
        if (color.color && !POPULAR_COLORS.find(c => c.name.toLowerCase() === color.color?.toLowerCase())) {
          customColorInputs[index] = true
        }
      })
      // Initialize custom size inputs for sizes that aren't in popular sizes list
      const customSizeInputs: Record<number, boolean> = {}
      parsedSizes.forEach((size: any, index: number) => {
        if (size.size && !POPULAR_SIZES.includes(size.size)) {
          customSizeInputs[index] = true
        }
      })
      setCustomColorInputs(customColorInputs)
      setCustomSizeInputs(customSizeInputs)
      
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price || '',
        category: product.category || '',
        pet_type: product.pet_type || 'all',
        stock: product.stock || 0,
        status: product.status || 'draft',
        supplier_link: product.supplier_link || '',
        video_url: product.video_url || '',
        images: product.images || [],
        sizes: parseJsonbField(product.sizes),
        colors: parsedColors,
      })
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const url = product
        ? '/api/admin/products'
        : '/api/admin/products'
      const method = product ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(product && { id: product.id }),
          ...formData,
          price: parseFloat(formData.price.toString()),
          stock: parseInt(formData.stock.toString()),
          sizes: formData.sizes || [],
          colors: formData.colors || [],
        }),
      })

      if (response.ok) {
        router.push('/admin/products')
        router.refresh()
      }
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const MAX_IMAGES = 10
    const currentImageCount = formData.images.length
    const filesToUpload = Array.from(files)
    const totalAfterUpload = currentImageCount + filesToUpload.length

    if (totalAfterUpload > MAX_IMAGES) {
      const allowed = MAX_IMAGES - currentImageCount
      alert(`You can only upload up to ${MAX_IMAGES} images per product. You currently have ${currentImageCount} images. You can upload ${allowed} more image${allowed !== 1 ? 's' : ''}.`)
      e.target.value = ''
      return
    }

    setUploading(true)
    try {
      // Upload files via API route
      const uploadPromises = filesToUpload.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)

        const response = await fetch('/api/admin/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || `Failed to upload ${file.name}`)
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)

      setFormData({
        ...formData,
        images: [...formData.images, ...uploadedUrls],
      })
    } catch (error: any) {
      console.error('Error uploading image:', error)
      alert(`Failed to upload images: ${error.message || 'Unknown error'}. Please check the browser console for details.`)
    } finally {
      setUploading(false)
      // Reset the input so the same file can be selected again
      e.target.value = ''
    }
  }

  const handleRemoveImage = (indexToRemove: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_: any, index: number) => index !== indexToRemove),
    })
  }

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      const supabase = createClient()
      const fileName = `${Date.now()}-${file.name}`

      const { data, error } = await supabase.storage
        .from('product-videos')
        .upload(fileName, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('product-videos')
        .getPublicUrl(fileName)

      setFormData({
        ...formData,
        video_url: publicUrl,
      })
    } catch (error) {
      console.error('Error uploading video:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div>
        <Label htmlFor="name">Product Name *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={5}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock *</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="category">Category *</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="pet_type">Pet Type *</Label>
          <Select
            value={formData.pet_type}
            onValueChange={(value) => setFormData({ ...formData, pet_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="dog">Dog</SelectItem>
              <SelectItem value="cat">Cat</SelectItem>
              <SelectItem value="both">Both (Cat & Dog)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="supplier_link">Supplier Link</Label>
        <Input
          id="supplier_link"
          type="url"
          value={formData.supplier_link}
          onChange={(e) => setFormData({ ...formData, supplier_link: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="status">Status *</Label>
        <Select
          value={formData.status}
          onValueChange={(value) => setFormData({ ...formData, status: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="active">Active</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label>Product Images</Label>
        <p className="text-sm text-muted-foreground mb-2">
          You can upload up to 10 images per product. Currently: {formData.images.length}/10
        </p>
        <Input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          disabled={uploading || formData.images.length >= 10}
        />
        {formData.images.length >= 10 && (
          <p className="text-sm text-amber-600 mt-2">
            Maximum of 10 images reached. Remove an image to upload more.
          </p>
        )}
        {uploading && (
          <p className="text-sm text-muted-foreground mt-2">
            Uploading images...
          </p>
        )}
        {formData.images.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mt-4">
            {formData.images.map((img: string, idx: number) => (
              <div key={idx} className="relative aspect-square group">
                <img 
                  src={img} 
                  alt={`Product ${idx + 1}`} 
                  className="w-full h-full object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(idx)}
                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <Label>Product Video</Label>
        <Input
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          disabled={uploading}
        />
        {formData.video_url && (
          <div className="mt-2">
            <video src={formData.video_url} controls className="w-full max-w-md rounded" />
          </div>
        )}
      </div>

      <div>
        <Label>Product Sizes (Optional)</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Add different sizes with individual stock levels. If sizes are added, users will be able to select a size when purchasing.
          Leave price empty to use the base product price.
        </p>
        <div className="space-y-3">
          {formData.sizes.map((size: any, index: number) => {
            const isCustomSize = customSizeInputs[index] || (!POPULAR_SIZES.includes(size.size) && size.size)
            
            return (
            <div key={index} className="flex gap-2 items-end p-3 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor={`size-${index}`}>Size</Label>
                <div className="flex gap-2">
                  <Select
                    value={isCustomSize ? 'custom' : (size.size || '')}
                    onValueChange={(value) => {
                      if (value === 'custom') {
                        setCustomSizeInputs({ ...customSizeInputs, [index]: true })
                      } else {
                        const newSizes = [...formData.sizes]
                        newSizes[index] = { ...newSizes[index], size: value }
                        setFormData({ ...formData, sizes: newSizes })
                        setCustomSizeInputs({ ...customSizeInputs, [index]: false })
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_SIZES.map((popSize) => (
                        <SelectItem key={popSize} value={popSize}>
                          {popSize}
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Size</SelectItem>
                    </SelectContent>
                  </Select>
                  {isCustomSize && (
                    <Input
                      id={`size-${index}`}
                      value={size.size || ''}
                      onChange={(e) => {
                        const newSizes = [...formData.sizes]
                        newSizes[index] = { ...newSizes[index], size: e.target.value }
                        setFormData({ ...formData, sizes: newSizes })
                      }}
                      placeholder="Enter size"
                      className="flex-1"
                    />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor={`size-stock-${index}`}>Stock</Label>
                <Input
                  id={`size-stock-${index}`}
                  type="number"
                  value={size.stock || ''}
                  onChange={(e) => {
                    const newSizes = [...formData.sizes]
                    newSizes[index] = { ...newSizes[index], stock: parseInt(e.target.value) || 0 }
                    setFormData({ ...formData, sizes: newSizes })
                  }}
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`size-price-${index}`}>Price (Optional)</Label>
                <Input
                  id={`size-price-${index}`}
                  type="number"
                  step="0.01"
                  value={size.price || ''}
                  onChange={(e) => {
                    const newSizes = [...formData.sizes]
                    newSizes[index] = { ...newSizes[index], price: e.target.value ? parseFloat(e.target.value) : null }
                    setFormData({ ...formData, sizes: newSizes })
                  }}
                  placeholder="Base price"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const newSizes = formData.sizes.filter((_: any, i: number) => i !== index)
                  setFormData({ ...formData, sizes: newSizes })
                  // Clean up custom size input state
                  const newCustomInputs = { ...customSizeInputs }
                  delete newCustomInputs[index]
                  // Reindex remaining custom inputs
                  const reindexed: Record<number, boolean> = {}
                  Object.keys(newCustomInputs).forEach((key) => {
                    const oldIndex = parseInt(key)
                    if (oldIndex > index) {
                      reindexed[oldIndex - 1] = newCustomInputs[oldIndex]
                    } else if (oldIndex < index) {
                      reindexed[oldIndex] = newCustomInputs[oldIndex]
                    }
                  })
                  setCustomSizeInputs(reindexed)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            )
          })}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                ...formData,
                sizes: [...formData.sizes, { size: '', stock: 0, price: null }],
              })
            }}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Size
          </Button>
        </div>
      </div>

      <div>
        <Label>Product Colors (Optional)</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Add different colors with individual stock levels. If colors are added, users will be able to select a color when purchasing.
          Leave price empty to use the base product price. Hex code is optional but helps display the color visually.
        </p>
        <div className="space-y-3">
          {formData.colors.map((color: any, index: number) => {
            const isCustomColor = customColorInputs[index] || (!POPULAR_COLORS.find(c => c.name.toLowerCase() === color.color?.toLowerCase()) && color.color)
            const selectedPopularColor = POPULAR_COLORS.find(c => c.name.toLowerCase() === color.color?.toLowerCase())
            
            return (
              <div key={index} className="flex gap-2 items-end p-3 border rounded-lg">
              <div className="flex-1">
                <Label htmlFor={`color-${index}`}>Color</Label>
                <div className="flex gap-2">
                  <Select
                    value={isCustomColor ? 'custom' : (selectedPopularColor?.name || '')}
                    onValueChange={(value) => {
                      if (value === 'custom') {
                        setCustomColorInputs({ ...customColorInputs, [index]: true })
                      } else {
                        const selectedColor = POPULAR_COLORS.find(c => c.name === value)
                        if (selectedColor) {
                          const newColors = [...formData.colors]
                          newColors[index] = { 
                            ...newColors[index], 
                            color: selectedColor.name,
                            hex: selectedColor.hex
                          }
                          setFormData({ ...formData, colors: newColors })
                          setCustomColorInputs({ ...customColorInputs, [index]: false })
                        }
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select or enter color" />
                    </SelectTrigger>
                    <SelectContent>
                      {POPULAR_COLORS.map((popColor) => (
                        <SelectItem key={popColor.name} value={popColor.name}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded border border-gray-300"
                              style={{ backgroundColor: popColor.hex }}
                            />
                            <span>{popColor.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                      <SelectItem value="custom">Custom Color</SelectItem>
                    </SelectContent>
                  </Select>
                  {isCustomColor && (
                    <Input
                      id={`color-${index}`}
                      value={color.color || ''}
                      onChange={(e) => {
                        const newColors = [...formData.colors]
                        newColors[index] = { ...newColors[index], color: e.target.value }
                        setFormData({ ...formData, colors: newColors })
                      }}
                      placeholder="Color name"
                      className="flex-1"
                    />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor={`color-hex-${index}`}>Hex Code</Label>
                <div className="flex gap-2 items-center">
                  <Input
                    id={`color-hex-${index}`}
                    type="text"
                    value={color.hex || ''}
                    onChange={(e) => {
                      const newColors = [...formData.colors]
                      newColors[index] = { ...newColors[index], hex: e.target.value }
                      setFormData({ ...formData, colors: newColors })
                    }}
                    placeholder="#FF0000"
                    pattern="#[0-9A-Fa-f]{6}"
                    className="flex-1"
                  />
                  {color.hex && (
                    <div 
                      className="w-12 h-10 rounded border-2 border-gray-300 flex-shrink-0"
                      style={{ backgroundColor: color.hex }}
                      title={color.hex}
                    />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <Label htmlFor={`color-stock-${index}`}>Stock</Label>
                <Input
                  id={`color-stock-${index}`}
                  type="number"
                  value={color.stock || ''}
                  onChange={(e) => {
                    const newColors = [...formData.colors]
                    newColors[index] = { ...newColors[index], stock: parseInt(e.target.value) || 0 }
                    setFormData({ ...formData, colors: newColors })
                  }}
                  placeholder="0"
                />
              </div>
              <div className="flex-1">
                <Label htmlFor={`color-price-${index}`}>Price (Optional)</Label>
                <Input
                  id={`color-price-${index}`}
                  type="number"
                  step="0.01"
                  value={color.price || ''}
                  onChange={(e) => {
                    const newColors = [...formData.colors]
                    newColors[index] = { ...newColors[index], price: e.target.value ? parseFloat(e.target.value) : null }
                    setFormData({ ...formData, colors: newColors })
                  }}
                  placeholder="Base price"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => {
                  const newColors = formData.colors.filter((_: any, i: number) => i !== index)
                  setFormData({ ...formData, colors: newColors })
                  // Clean up custom color input state
                  const newCustomInputs = { ...customColorInputs }
                  delete newCustomInputs[index]
                  // Reindex remaining custom inputs
                  const reindexed: Record<number, boolean> = {}
                  Object.keys(newCustomInputs).forEach((key) => {
                    const oldIndex = parseInt(key)
                    if (oldIndex > index) {
                      reindexed[oldIndex - 1] = newCustomInputs[oldIndex]
                    } else if (oldIndex < index) {
                      reindexed[oldIndex] = newCustomInputs[oldIndex]
                    }
                  })
                  setCustomColorInputs(reindexed)
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              </div>
            )
          })}
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({
                ...formData,
                colors: [...formData.colors, { color: '', hex: '', stock: 0, price: null }],
              })
            }}
            className="w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Color
          </Button>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={loading || uploading}>
          {loading || uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {uploading ? 'Uploading...' : 'Saving...'}
            </>
          ) : (
            'Save Product'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

