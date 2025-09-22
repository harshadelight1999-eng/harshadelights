'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { RadioGroup } from '@headlessui/react'
import { CheckCircleIcon, CreditCardIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/components/ui/use-toast'
import {
  addShippingMethod,
  initiatePaymentSession,
  updateBillingAddress,
  updateShippingAddress,
  getShippingOptions
} from '@/lib/data/cart'

interface CheckoutFormProps {
  cart: any
  onStepChange: (step: string) => void
  currentStep: string
}

export default function CheckoutForm({ cart, onStepChange, currentStep }: CheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [shippingOptions, setShippingOptions] = useState([])
  const [paymentMethods] = useState([
    { id: 'stripe', name: 'Credit Card', icon: CreditCardIcon },
    { id: 'razorpay', name: 'Razorpay', icon: CreditCardIcon },
    { id: 'cod', name: 'Cash on Delivery', icon: CheckCircleIcon }
  ])

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    phone: '',
    sameAsBilling: true,
    billingFirstName: '',
    billingLastName: '',
    billingAddress: '',
    billingCity: '',
    billingState: '',
    billingPostalCode: '',
    selectedShipping: '',
    selectedPayment: 'stripe',
    notes: ''
  })

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (cart?.id) {
      loadShippingOptions()
    }
  }, [cart?.id])

  const loadShippingOptions = async () => {
    try {
      const options = await getShippingOptions(cart.id)
      setShippingOptions(options)
    } catch (error) {
      console.error('Error loading shipping options:', error)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddressStep = async () => {
    if (!formData.firstName || !formData.lastName || !formData.address || !formData.city) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required address fields.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const shippingAddress = {
        first_name: formData.firstName,
        last_name: formData.lastName,
        address_1: formData.address,
        city: formData.city,
        province: formData.state,
        postal_code: formData.postalCode,
        phone: formData.phone,
        country_code: 'IN'
      }

      await updateShippingAddress(cart.id, shippingAddress)

      if (!formData.sameAsBilling) {
        const billingAddress = {
          first_name: formData.billingFirstName,
          last_name: formData.billingLastName,
          address_1: formData.billingAddress,
          city: formData.billingCity,
          province: formData.billingState,
          postal_code: formData.billingPostalCode,
          country_code: 'IN'
        }
        await updateBillingAddress(cart.id, billingAddress)
      } else {
        await updateBillingAddress(cart.id, shippingAddress)
      }

      onStepChange('shipping')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update address. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleShippingStep = async () => {
    if (!formData.selectedShipping) {
      toast({
        title: "Select Shipping",
        description: "Please select a shipping method.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await addShippingMethod(cart.id, formData.selectedShipping)
      onStepChange('payment')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set shipping method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentStep = async () => {
    if (!formData.selectedPayment) {
      toast({
        title: "Select Payment",
        description: "Please select a payment method.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      await initiatePaymentSession(cart, {
        provider_id: formData.selectedPayment,
      })
      onStepChange('review')
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to set payment method. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderAddressStep = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-4">Shipping Address</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="sameAsBilling"
          checked={formData.sameAsBilling}
          onChange={(e) => handleInputChange('sameAsBilling', e.target.checked.toString())}
          className="rounded border-gray-300"
        />
        <Label htmlFor="sameAsBilling">Billing address same as shipping</Label>
      </div>

      {!formData.sameAsBilling && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Billing Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="billingFirstName">First Name</Label>
              <Input
                id="billingFirstName"
                value={formData.billingFirstName}
                onChange={(e) => handleInputChange('billingFirstName', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="billingLastName">Last Name</Label>
              <Input
                id="billingLastName"
                value={formData.billingLastName}
                onChange={(e) => handleInputChange('billingLastName', e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="billingAddress">Address</Label>
              <Input
                id="billingAddress"
                value={formData.billingAddress}
                onChange={(e) => handleInputChange('billingAddress', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="billingCity">City</Label>
              <Input
                id="billingCity"
                value={formData.billingCity}
                onChange={(e) => handleInputChange('billingCity', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="billingState">State</Label>
              <Input
                id="billingState"
                value={formData.billingState}
                onChange={(e) => handleInputChange('billingState', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="billingPostalCode">Postal Code</Label>
              <Input
                id="billingPostalCode"
                value={formData.billingPostalCode}
                onChange={(e) => handleInputChange('billingPostalCode', e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <Button onClick={handleAddressStep} disabled={isLoading} className="w-full">
        {isLoading ? 'Processing...' : 'Continue to Shipping'}
      </Button>
    </div>
  )

  const renderShippingStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Shipping Method</h2>
      <RadioGroup value={formData.selectedShipping} onValueChange={(value) => handleInputChange('selectedShipping', value)}>
        {shippingOptions.map((option: any) => (
          <div key={option.id} className="flex items-center space-x-2 border rounded-lg p-4">
            <RadioGroup.Option value={option.id} className="flex items-center space-x-2">
              <div className="flex items-center">
                <input type="radio" className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-medium">{option.name}</span>
                  <span className="font-semibold">₹{option.amount}</span>
                </div>
                <p className="text-sm text-gray-600">{option.description}</p>
              </div>
            </RadioGroup.Option>
          </div>
        ))}
      </RadioGroup>

      <Button onClick={handleShippingStep} disabled={isLoading || !formData.selectedShipping} className="w-full">
        {isLoading ? 'Processing...' : 'Continue to Payment'}
      </Button>
    </div>
  )

  const renderPaymentStep = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold mb-4">Payment Method</h2>
      <RadioGroup value={formData.selectedPayment} onValueChange={(value) => handleInputChange('selectedPayment', value)}>
        {paymentMethods.map((method) => (
          <div key={method.id} className="flex items-center space-x-2 border rounded-lg p-4">
            <RadioGroup.Option value={method.id} className="flex items-center space-x-2 w-full">
              <div className="flex items-center">
                <input type="radio" className="h-4 w-4 text-orange-600" />
              </div>
              <div className="flex items-center space-x-3 flex-1">
                <method.icon className="h-6 w-6" />
                <span className="font-medium">{method.name}</span>
              </div>
            </RadioGroup.Option>
          </div>
        ))}
      </RadioGroup>

      <div>
        <Label htmlFor="notes">Order Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Any special instructions for your order..."
          rows={3}
        />
      </div>

      <Button onClick={handlePaymentStep} disabled={isLoading} className="w-full">
        {isLoading ? 'Processing...' : 'Review Order'}
      </Button>
    </div>
  )

  switch (currentStep) {
    case 'address':
      return renderAddressStep()
    case 'shipping':
      return renderShippingStep()
    case 'payment':
      return renderPaymentStep()
    default:
      return renderAddressStep()
  }
}