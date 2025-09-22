'use client'

import { useState } from 'react'
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
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  category: z.string().min(1, 'Category is required'),
  description: z.string().optional(),
  basePrice: z.number().min(0, 'Price must be positive'),
  weight: z.number().min(0, 'Weight must be positive').optional(),
  variants: z.array(z.object({
    name: z.string().min(1, 'Variant name is required'),
    price: z.number().min(0, 'Price must be positive'),
    stock: z.number().min(0, 'Stock must be non-negative'),
    sku: z.string().min(1, 'Variant SKU is required'),
  })).optional(),
  bulkPricing: z.array(z.object({
    minQuantity: z.number().min(1, 'Minimum quantity required'),
    maxQuantity: z.number().optional(),
    price: z.number().min(0, 'Price must be positive'),
    discount: z.number().min(0).max(100, 'Discount must be between 0-100'),
  })).optional(),
})

type ProductFormData = z.infer<typeof productSchema>

const mockProducts = [
  {
    id: '1',
    name: 'Premium Kaju Katli',
    sku: 'HD-KK-001',
    category: 'Traditional Sweets',
    basePrice: 450,
    stock: 50,
    status: 'active',
    lastUpdated: '2024-01-15',
  },
  {
    id: '2',
    name: 'Royal Gulab Jamun',
    sku: 'HD-GJ-002',
    category: 'Traditional Sweets',
    basePrice: 320,
    stock: 30,
    status: 'active',
    lastUpdated: '2024-01-14',
  },
  {
    id: '3',
    name: 'Chocolate Truffles',
    sku: 'HD-CT-003',
    category: 'Premium Chocolates',
    basePrice: 750,
    stock: 0,
    status: 'out_of_stock',
    lastUpdated: '2024-01-13',
  },
]

const categories = [
  { value: 'traditional-sweets', label: 'Traditional Sweets' },
  { value: 'premium-chocolates', label: 'Premium Chocolates' },
  { value: 'dry-fruits', label: 'Dry Fruits' },
  { value: 'gift-boxes', label: 'Gift Boxes' },
  { value: 'snacks', label: 'Snacks' },
  { value: 'beverages', label: 'Beverages' },
]

const productColumns = [
  {
    key: 'name',
    label: 'Product Name',
    sortable: true,
    width: '300px',
  },
  {
    key: 'sku',
    label: 'SKU',
    sortable: true,
    render: (value: string) => <span className="font-mono text-sm">{value}</span>,
  },
  {
    key: 'category',
    label: 'Category',
    sortable: true,
  },
  {
    key: 'basePrice',
    label: 'Base Price',
    type: 'number' as const,
    sortable: true,
    render: (value: number) => <span className="font-semibold">₹{value}</span>,
  },
  {
    key: 'stock',
    label: 'Stock',
    type: 'number' as const,
    sortable: true,
    render: (value: number) => (
      <span className={value === 0 ? 'text-red-600' : value < 10 ? 'text-yellow-600' : 'text-green-600'}>
        {value}
      </span>
    ),
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
  const { toast } = useToast()

  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      variants: [],
      bulkPricing: [],
    },
  })

  const { handleSubmit, reset, formState: { isSubmitting } } = methods

  const onSubmit = async (data: ProductFormData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      console.log('Product data:', data)

      toast({
        title: "Product saved successfully",
        description: "The product has been added to your catalog.",
      })

      setIsCreateDialogOpen(false)
      reset()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save product. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (product: any) => {
    setSelectedProduct(product)
    reset(product) // Populate form with product data
    setIsCreateDialogOpen(true)
  }

  const handleDelete = (product: any) => {
    toast({
      title: "Product deleted",
      description: `${product.name} has been removed from your catalog.`,
    })
  }

  const handleView = (product: any) => {
    toast({
      title: "View Product",
      description: `Opening details for ${product.name}`,
    })
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
                        name="name"
                        label="Product Name"
                        placeholder="Enter product name"
                        required
                        control={methods.control}
                      />
                      <AdminTextInput
                        name="sku"
                        label="SKU"
                        placeholder="HD-XXX-001"
                        required
                        control={methods.control}
                      />
                    </div>

                    <AdminSelectInput
                      name="category"
                      label="Category"
                      options={categories}
                      required
                      control={methods.control}
                    />

                    <AdminTextInput
                      name="description"
                      label="Description"
                      placeholder="Product description..."
                      control={methods.control}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <AdminNumberInput
                        name="basePrice"
                        label="Base Price (₹)"
                        placeholder="0.00"
                        min={0}
                        step={0.01}
                        required
                        control={methods.control}
                      />
                      <AdminNumberInput
                        name="weight"
                        label="Weight (grams)"
                        placeholder="0"
                        min={0}
                        control={methods.control}
                      />
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
                          name="name"
                          label="Variant Name"
                          placeholder="e.g., 500g Box"
                          required
                          control={methods.control}
                        />
                        <AdminTextInput
                          name="sku"
                          label="Variant SKU"
                          placeholder="HD-XXX-001-500g"
                          required
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
                          name="stock"
                          label="Stock Quantity"
                          placeholder="0"
                          min={0}
                          required
                          control={methods.control}
                        />
                      </div>
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
          <AdminDataGrid
            data={mockProducts}
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
              total: mockProducts.length,
              onPageChange: (page) => console.log('Page change:', page),
              onPageSizeChange: (pageSize) => console.log('Page size change:', pageSize),
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}