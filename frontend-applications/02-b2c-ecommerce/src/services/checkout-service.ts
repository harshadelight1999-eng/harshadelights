import axios from 'axios';

export interface CheckoutData {
  customerId?: string;
  sessionId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'card' | 'upi' | 'cod';
  paymentDetails?: {
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cvv?: string;
    upiId?: string;
  };
}

export interface CheckoutResult {
  orderId: string;
  status: 'pending' | 'confirmed' | 'failed';
  paymentStatus: 'pending' | 'completed' | 'failed';
  total: number;
  message: string;
}

export class CheckoutService {
  private apiClient = axios.create({
    baseURL: '/api',
    timeout: 30000,
  });

  async processCheckout(checkoutData: CheckoutData): Promise<CheckoutResult> {
    try {
      // Validate inventory before processing
      await this.validateInventory(checkoutData.items);

      // Calculate totals
      const totals = this.calculateTotals(checkoutData.items);

      // Process payment
      const paymentResult = await this.processPayment(checkoutData, totals.total);

      if (paymentResult.status === 'failed') {
        return {
          orderId: '',
          status: 'failed',
          paymentStatus: 'failed',
          total: totals.total,
          message: paymentResult.message,
        };
      }

      // Create order
      const orderResult = await this.createOrder({
        ...checkoutData,
        ...totals,
        paymentId: paymentResult.paymentId,
      });

      // Reserve inventory
      await this.reserveInventory(checkoutData.items, orderResult.orderId);

      // Send confirmation
      await this.sendOrderConfirmation(orderResult.orderId, checkoutData.customerId);

      return {
        orderId: orderResult.orderId,
        status: 'confirmed',
        paymentStatus: paymentResult.status,
        total: totals.total,
        message: 'Order placed successfully',
      };

    } catch (error) {
      console.error('Checkout process failed:', error);
      return {
        orderId: '',
        status: 'failed',
        paymentStatus: 'failed',
        total: 0,
        message: error instanceof Error ? error.message : 'Checkout failed',
      };
    }
  }

  private async validateInventory(items: CheckoutData['items']): Promise<void> {
    const response = await this.apiClient.post('/inventory/validate', { items });
    
    if (!response.data.available) {
      throw new Error(`Insufficient stock for: ${response.data.unavailableItems.join(', ')}`);
    }
  }

  private calculateTotals(items: CheckoutData['items']) {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = subtotal * 0.18; // 18% GST
    const shipping = subtotal > 500 ? 0 : 50; // Free shipping above ₹500
    const total = subtotal + tax + shipping;

    return { subtotal, tax, shipping, total };
  }

  private async processPayment(checkoutData: CheckoutData, amount: number) {
    if (checkoutData.paymentMethod === 'cod') {
      return {
        status: 'pending' as const,
        paymentId: `cod_${Date.now()}`,
        message: 'Cash on delivery order confirmed',
      };
    }

    if (checkoutData.paymentMethod === 'upi') {
      return await this.processUPIPayment(checkoutData.paymentDetails?.upiId!, amount);
    }

    if (checkoutData.paymentMethod === 'card') {
      return await this.processCardPayment(checkoutData.paymentDetails!, amount);
    }

    throw new Error('Invalid payment method');
  }

  private async processUPIPayment(upiId: string, amount: number) {
    // Simulate UPI payment processing
    const response = await this.apiClient.post('/payments/upi', {
      upiId,
      amount,
    });

    return {
      status: response.data.success ? 'completed' as const : 'failed' as const,
      paymentId: response.data.paymentId,
      message: response.data.message,
    };
  }

  private async processCardPayment(paymentDetails: NonNullable<CheckoutData['paymentDetails']>, amount: number) {
    // Integrate with Stripe or Razorpay
    const response = await this.apiClient.post('/payments/card', {
      cardNumber: paymentDetails.cardNumber,
      expiryMonth: paymentDetails.expiryMonth,
      expiryYear: paymentDetails.expiryYear,
      cvv: paymentDetails.cvv,
      amount,
    });

    return {
      status: response.data.success ? 'completed' as const : 'failed' as const,
      paymentId: response.data.paymentId,
      message: response.data.message,
    };
  }

  private async createOrder(orderData: any) {
    const response = await this.apiClient.post('/orders', orderData);
    return response.data;
  }

  private async reserveInventory(items: CheckoutData['items'], orderId: string) {
    await this.apiClient.post('/inventory/reserve', {
      items,
      orderId,
    });
  }

  private async sendOrderConfirmation(orderId: string, customerId?: string) {
    await this.apiClient.post('/notifications/order-confirmation', {
      orderId,
      customerId,
    });
  }

  async getOrderStatus(orderId: string) {
    const response = await this.apiClient.get(`/orders/${orderId}/status`);
    return response.data;
  }

  async cancelOrder(orderId: string, reason: string) {
    const response = await this.apiClient.post(`/orders/${orderId}/cancel`, {
      reason,
    });
    return response.data;
  }
}

export default CheckoutService;
