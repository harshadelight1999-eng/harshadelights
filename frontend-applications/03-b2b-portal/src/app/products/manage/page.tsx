'use client'

import { useState, useEffect } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AdminTextInput, AdminNumberInput } from '@/components/admin/bridge/AdminInput'
import { AdminSelectInput } from '@/components/admin/bridge/AdminSelect'
import { AdminArrayInput } from '@/components/admin/bridge/AdminArrayInput'
import { AdminDataGrid } from '@/components/admin/bridge/AdminDataGrid'
import { Plus, Package, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

// Product schema with validation
const productSchema = z.object({
  title: z.string().min(1, 'Product title is required'),
  handle: z.string().min(1, 'Product handle is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  status: z.enum(['active', 'inactive', 'draft']),
  is_featured: z.boolean(),
  variants: z.array(z.object({
    title: z.string().min(1, 'Variant title is required'),
    price: z.number().min(0, 'Price must be positive'),
    inventory_quantity: z.number().min(0, 'Stock must be non-negative'),
    sku: z.string().optional(),
    weight: z.number().min(0, 'Weight must be positive').optional(),
    weight_unit: z.enum(['g', 'kg', 'lb', 'oz']),
    compare_at_price: z.number().min(0).optional(),
  })).min(1, 'At least one variant is required'),
  categories: z.array(z.string()).optional(),
})

type ProductFormData = z.infer<typeof productSchema>

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

// API Functions
const productAPI = {
  async getProducts(page = 1, limit = 10) {
    const response = await fetch(`${API_BASE_URL}/api/v1/products?page=${page}&limit=${limit}`)
    if (!response.ok) throw new Error('Failed to fetch products')
    return response.json()
  },

  async getCategories() {
    const response = await fetch(`${API_BASE_URL}/api/v1/categories`)
    if (!response.ok) throw new Error('Failed to fetch categories')
    return response.json()
  },

  async createProduct(productData: any, images?: FileList) {
    const formData = new FormData()
    
    // Add product data
    Object.keys(productData).forEach(key => {
      if (key === 'variants' || key === 'categories') {
        formData.append(key, JSON.stringify(productData[key]))
      } else {
        formData.append(key, productData[key])
      }
    })

    // Add images
    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i])
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/products`, {
      method: 'POST',
      body: formData,
    })
    
    if (!response.ok) throw new Error('Failed to create product')
    return response.json()
  },

  async updateProduct(id: string, productData: any, images?: FileList) {
    const formData = new FormData()
    
    // Add product data
    Object.keys(productData).forEach(key => {
      if (key === 'variants' || key === 'categories') {
        formData.append(key, JSON.stringify(productData[key]))
      } else {
        formData.append(key, productData[key])
      }
    })

    // Add images
    if (images) {
      for (let i = 0; i < images.length; i++) {
        formData.append('images', images[i])
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
      method: 'PUT',
      body: formData,
    })
    
    if (!response.ok) throw new Error('Failed to update product')
    return response.json()
  },

  async deleteProduct(id: string) {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) throw new Error('Failed to delete product')
    return response.json()
  }
}

// Initial state - will be replaced by API data
const initialProducts: any[] = []
const initialCategories: any[] = []

const productColumns = [
  {
    key: 'title',
    label: 'Product Name',
    sortable: true,
    width: '300px',
  },
  {
    key: 'handle',
    label: 'Handle',
    sortable: true,
    render: (value: string) => <span className="font-mono text-sm">{value}</span>,
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
    render: (value: any, row: any) => {
      const category = row.categories?.[0]?.name || 'Uncategorized'
      return <span>{category}</span>
    },
  },
  {
    key: 'basePrice',
    label: 'Base Price',
    type: 'number' as const,
    sortable: true,
    render: (value: any, row: any) => {
      const price = row.variants?.[0]?.price || 0
      return <span className="font-semibold">₹{price}</span>
    },
  },
  {
    key: 'stock',
    label: 'Stock',
    type: 'number' as const,
    sortable: true,
    render: (value: any, row: any) => {
      const stock = row.variants?.[0]?.inventory_quantity || 0
      return (
        <span className={stock === 0 ? 'text-red-600' : stock < 10 ? 'text-yellow-600' : 'text-green-600'}>
          {stock}
        </span>
      )
    },
  },
  {
    key: 'status',
    label: 'Status',
    type: 'badge' as const,
    render: (value: string) => (
      <div className="flex items-center space-x-2">
        {value === 'active' ? (
          <CheckCircle className="h-4 w-4 text-green-600" />
        ) : (
          <AlertCircle className="h-4 w-4 text-red-600" />
        )}
        <span className="capitalize">{value.replace('_', ' ')}</span>
      </div>
    ),
  },
  {
    key: 'actions',
    label: 'Actions',
    type: 'actions' as const,
  },
]

export default function ProductManagePage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [products, setProducts] = useState<any[]>(initialProducts)
  const [categories, setCategories] = useState<any[]>(initialCategories)
  const [loading, setLoading] = useState(true)
  const [selectedImages, setSelectedImages] = useState<FileList | null>(null)
  const { toast } = useToast()

  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      variants: [{ title: 'Default', price: 0, inventory_quantity: 0, weight_unit: 'g' }],
      categories: [],
      status: 'draft',
      is_featured: false,
    },
  })

  const { handleSubmit, reset, formState: { isSubmitting } } = methods

  // Load data on component mount
  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const [productsResponse, categoriesResponse] = await Promise.all([
        productAPI.getProducts(1, 100),
        productAPI.getCategories()
      ])
      
      setProducts(productsResponse.products || [])
      setCategories(categoriesResponse.categories || [])
    } catch (error) {
      console.error('Failed to load data:', error)
      toast({
        title: "Error",
        description: "Failed to load products and categories",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Convert categories for select input
  const categoryOptions = categories.map(cat => ({
    value: cat.id,
    label: cat.name
  }))

  const onSubmit = async (data: ProductFormData) => {
    try {
      if (selectedProduct) {
        // Update existing product
        await productAPI.updateProduct(selectedProduct.id, data, selectedImages || undefined)
        toast({
          title: "Product updated successfully",
          description: "The product has been updated in your catalog.",
        })
      } else {
        // Create new product
        await productAPI.createProduct(data, selectedImages || undefined)
        toast({
          title: "Product created successfully",
          description: "The product has been added to your catalog.",
        })
      }

      // Reload products
      await loadInitialData()
      
      setIsCreateDialogOpen(false)
      setSelectedProduct(null)
      setSelectedImages(null)
      reset()
    } catch (error) {
      console.error('Save product error:', error)
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product: any) => {
    setSelectedProduct(product)
    
    // Transform product data for form
    const formData = {
      title: product.title,
      handle: product.handle,
      description: product.description,
      status: product.status,
      is_featured: product.is_featured,
      category: product.categories?.[0]?.id || '',
      variants: product.variants || [{ title: 'Default', price: 0, inventory_quantity: 0, weight_unit: 'g' }],
      categories: product.categories?.map((cat: any) => cat.id) || [],
    }
    
    reset(formData)
    setIsCreateDialogOpen(true)
  }

  const handleDelete = async (product: any) => {
    if (window.confirm(`Are you sure you want to delete "${product.title}"?`)) {
      try {
        await productAPI.deleteProduct(product.id)
        await loadInitialData()
        toast({
          title: "Product deleted",
          description: `${product.title} has been removed from your catalog.`,
        })
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleView = (product: any) => {
    toast({
      title: "View Product",
      description: `Opening details for ${product.title}`,
    })
  }

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedImages(event.target.files)
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Product Management</h1>
          <p className="text-muted-foreground">
            Manage your product catalog with advanced bulk operations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedProduct ? 'Edit Product' : 'Create New Product'}
              </DialogTitle>
              <DialogDescription>
                Fill in the product details below. Use the variants section for different sizes or options.
              </DialogDescription>
            </DialogHeader>

            <FormProvider {...methods}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <Tabs defaultValue="basic" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="basic">Basic Info</TabsTrigger>
                    <TabsTrigger value="variants">Variants</TabsTrigger>
                    <TabsTrigger value="pricing">Bulk Pricing</TabsTrigger>
                  </TabsList>

                  <TabsContent value="basic" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <AdminTextInput
                        name="title"
                        label="Product Title"
                        placeholder="Enter product title"
                        required
                        control={methods.control}
                      />
                      <AdminTextInput
                        name="handle"
                        label="Product Handle (URL)"
                        placeholder="product-handle"
                        required
                        control={methods.control}
                      />
                    </div>

                    <AdminSelectInput
                      name="category"
                      label="Category"
                      options={categoryOptions}
                      required
                      control={methods.control}
                    />

                    <AdminTextInput
                      name="description"
                      label="Description"
                      placeholder="Product description..."
                      required
                      control={methods.control}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <AdminSelectInput
                        name="status"
                        label="Status"
                        options={[
                          { value: 'draft', label: 'Draft' },
                          { value: 'active', label: 'Active' },
                          { value: 'inactive', label: 'Inactive' }
                        ]}
                        control={methods.control}
                      />
                      <div className="flex items-center space-x-2 pt-7">
                        <input
                          type="checkbox"
                          id="is_featured"
                          {...methods.register('is_featured')}
                          className="rounded"
                        />
                        <label htmlFor="is_featured" className="text-sm font-medium">
                          Featured Product
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Product Images</label>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500">
                        Upload up to 10 images (max 5MB each)
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="variants" className="space-y-4">
                    <AdminArrayInput
                      name="variants"
                      label="Product Variants"
                      addLabel="Add Variant"
                      helperText="Add different sizes, flavors, or packaging options"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <AdminTextInput
                          name="title"
                          label="Variant Title"
                          placeholder="e.g., 500g Box"
                          required
                          control={methods.control}
                        />
                        <AdminTextInput
                          name="sku"
                          label="Variant SKU"
                          placeholder="HD-XXX-001-500g"
                          control={methods.control}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <AdminNumberInput
                          name="price"
                          label="Price (₹)"
                          placeholder="0.00"
                          min={0}
                          step={0.01}
                          required
                          control={methods.control}
                        />
                        <AdminNumberInput
                          name="inventory_quantity"
                          label="Stock Quantity"
                          placeholder="0"
                          min={0}
                          required
                          control={methods.control}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <AdminNumberInput
                          name="weight"
                          label="Weight"
                          placeholder="250"
                          min={0}
                          control={methods.control}
                        />
                        <AdminSelectInput
                          name="weight_unit"
                          label="Weight Unit"
                          options={[
                            { value: 'g', label: 'Grams' },
                            { value: 'kg', label: 'Kilograms' },
                            { value: 'lb', label: 'Pounds' },
                            { value: 'oz', label: 'Ounces' }
                          ]}
                          control={methods.control}
                        />
                      </div>
                      <AdminNumberInput
                        name="compare_at_price"
                        label="Compare at Price (₹) - Optional"
                        placeholder="0.00"
                        min={0}
                        step={0.01}
                        control={methods.control}
                      />
                    </AdminArrayInput>
                  </TabsContent>

                  <TabsContent value="pricing" className="space-y-4">
                    <AdminArrayInput
                      name="bulkPricing"
                      label="Bulk Pricing Tiers"
                      addLabel="Add Price Tier"
                      helperText="Set different prices for bulk quantities"
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <AdminNumberInput
                          name="minQuantity"
                          label="Minimum Quantity"
                          placeholder="10"
                          min={1}
                          required
                          control={methods.control}
                        />
                        <AdminNumberInput
                          name="maxQuantity"
                          label="Maximum Quantity"
                          placeholder="Leave empty for unlimited"
                          min={1}
                          control={methods.control}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <AdminNumberInput
                          name="price"
                          label="Price per Unit (₹)"
                          placeholder="0.00"
                          min={0}
                          step={0.01}
                          required
                          control={methods.control}
                        />
                        <AdminNumberInput
                          name="discount"
                          label="Discount (%)"
                          placeholder="5"
                          min={0}
                          max={100}
                          control={methods.control}
                        />
                      </div>
                    </AdminArrayInput>
                  </TabsContent>
                </Tabs>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : selectedProduct ? 'Update Product' : 'Create Product'}
                  </Button>
                </div>
              </form>
            </FormProvider>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Products</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,186</div>
            <p className="text-xs text-muted-foreground">
              96% of total catalog
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              Requires attention
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Impact</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹2.4M</div>
            <p className="text-xs text-muted-foreground">
              +8.2% from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Product Data Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Product Catalog</CardTitle>
          <CardDescription>
            Manage your complete product inventory with advanced filtering and bulk operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading products...</p>
              </div>
            </div>
          ) : (
            <AdminDataGrid
              data={products}
              columns={productColumns}
              selectable
              searchable
              filterable
              exportable
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              pagination={{
                page: 1,
                pageSize: 10,
                total: products.length,
                onPageChange: (page) => console.log('Page change:', page),
                onPageSizeChange: (pageSize) => console.log('Page size change:', pageSize),
              }}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}