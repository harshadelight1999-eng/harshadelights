import { Customer, Product, Order, SalesMetrics, PriceListItem, Territory } from '../types/business-entities';

export class DataMapper {
  // B2C E-commerce Data Mapping Methods
  static mapB2CCustomerToUnified(b2cData: any): Customer {
    return {
      id: b2cData.id,
      name: b2cData.name || `${b2cData.firstName} ${b2cData.lastName}`,
      email: b2cData.email,
      phone: b2cData.phone || '',
      address: {
        street: b2cData.address?.street || '',
        city: b2cData.address?.city || '',
        state: b2cData.address?.state || '',
        zipCode: b2cData.address?.zipCode || '',
        country: b2cData.address?.country || 'India'
      },
      tier: 'basic',
      status: b2cData.status || 'active',
      creditLimit: b2cData.creditLimit || 0,
      outstandingBalance: b2cData.outstandingBalance || 0,
      territory: b2cData.territory,
      salesRep: b2cData.salesRep,
      createdAt: b2cData.createdAt,
      updatedAt: b2cData.updatedAt
    };
  }

  static mapUnifiedCustomerToB2C(customer: Customer): any {
    const nameParts = customer.name.split(' ');
    return {
      id: customer.id,
      firstName: nameParts[0] || '',
      lastName: nameParts.slice(1).join(' ') || '',
      email: customer.email,
      phone: customer.phone,
      address: {
        street: customer.address.street,
        city: customer.address.city,
        state: customer.address.state,
        zipCode: customer.address.zipCode,
        country: customer.address.country
      },
      status: customer.status
    };
  }

  static mapB2COrderToUnified(b2cData: any): Order {
    return {
      id: b2cData.id,
      orderNumber: b2cData.orderNumber || b2cData.id,
      customerId: b2cData.customerId,
      customerName: b2cData.customerName || '',
      status: b2cData.status || 'pending',
      items: b2cData.items?.map((item: any) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName || '',
        itemCode: item.itemCode || item.productId,
        quantity: item.quantity,
        unitPrice: item.price,
        totalPrice: item.total,
        discount: item.discount || 0,
        taxRate: item.taxRate || 0
      })) || [],
      subtotal: b2cData.subtotal || 0,
      taxAmount: b2cData.taxAmount || 0,
      discountAmount: b2cData.discountAmount || 0,
      totalAmount: b2cData.total,
      currency: b2cData.currency || 'INR',
      orderDate: new Date(b2cData.orderDate || b2cData.createdAt),
      deliveryDate: b2cData.deliveryDate ? new Date(b2cData.deliveryDate) : undefined,
      shippingAddress: b2cData.shippingAddress || {},
      billingAddress: b2cData.billingAddress || {},
      paymentMethod: b2cData.paymentMethod || '',
      paymentStatus: b2cData.paymentStatus || 'pending',
      notes: b2cData.notes,
      createdAt: b2cData.createdAt,
      updatedAt: b2cData.updatedAt
    };
  }

  static mapUnifiedOrderToB2C(order: Order): any {
    return {
      id: order.id,
      customerId: order.customerId,
      items: order.items.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.unitPrice,
        total: item.totalPrice
      })),
      total: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress
    };
  }

  static mapB2CProductToUnified(b2cData: any): Product {
    return {
      id: b2cData.id,
      itemCode: b2cData.itemCode || b2cData.id,
      name: b2cData.name,
      description: b2cData.description,
      category: b2cData.category,
      price: b2cData.price,
      cost: b2cData.cost || 0,
      stockQuantity: b2cData.stock || 0,
      unit: b2cData.unit || 'piece',
      warehouse: b2cData.warehouse || 'Main Store',
      isActive: b2cData.status === 'active',
      images: b2cData.images || [],
      specifications: b2cData.specifications || {},
      createdAt: b2cData.createdAt,
      updatedAt: b2cData.updatedAt
    };
  }

  static mapB2CAnalyticsToUnified(b2cData: any): any {
    return {
      revenue: b2cData.revenue || 0,
      orders: b2cData.orders || 0,
      customers: b2cData.customers || 0,
      averageOrderValue: b2cData.averageOrderValue || 0,
      topProducts: b2cData.topProducts || [],
      period: b2cData.period
    };
  }
  /**
   * Map ERPNext customer data to standard Customer interface
   */
  static mapERPCustomerToUnified(erpData: any): Customer {
    return {
      id: erpData.name,
      name: erpData.customer_name,
      email: erpData.email_id || '',
      phone: erpData.mobile_no || erpData.phone || '',
      address: {
        street: erpData.customer_primary_address?.address_line1 || '',
        city: erpData.customer_primary_address?.city || '',
        state: erpData.customer_primary_address?.state || '',
        zipCode: erpData.customer_primary_address?.pincode || '',
        country: erpData.customer_primary_address?.country || ''
      },
      tier: this.mapCustomerTier(erpData.customer_group),
      status: erpData.disabled ? 'inactive' : 'active',
      creditLimit: erpData.credit_limit || 0,
      outstandingBalance: erpData.outstanding_amount || 0,
      territory: erpData.territory,
      salesRep: erpData.account_manager,
      createdAt: new Date(erpData.creation),
      updatedAt: new Date(erpData.modified)
    };
  }

  /**
   * Map B2B portal customer data to standard Customer interface
   */
  static mapB2BCustomerToUnified(b2bData: any): Customer {
    return {
      id: b2bData.id,
      name: b2bData.name,
      email: b2bData.email,
      phone: b2bData.phone,
      address: {
        street: b2bData.address?.street || '',
        city: b2bData.address?.city || '',
        state: b2bData.address?.state || '',
        zipCode: b2bData.address?.zipCode || '',
        country: b2bData.address?.country || ''
      },
      tier: b2bData.tier || 'standard',
      status: b2bData.status || 'active',
      creditLimit: b2bData.creditLimit || 0,
      outstandingBalance: b2bData.outstandingBalance || 0,
      territory: b2bData.territory,
      salesRep: b2bData.salesRep,
      createdAt: new Date(b2bData.createdAt),
      updatedAt: new Date(b2bData.updatedAt)
    };
  }

  /**
   * Map ERPNext item data to standard Product interface
   */
  static mapERPProduct(erpData: any): Product {
    return {
      id: erpData.name,
      itemCode: erpData.item_code,
      name: erpData.item_name,
      description: erpData.description || '',
      category: erpData.item_group,
      price: erpData.standard_rate || 0,
      cost: erpData.valuation_rate || 0,
      stockQuantity: erpData.actual_qty || 0,
      unit: erpData.stock_uom,
      warehouse: erpData.warehouse || '',
      isActive: !erpData.disabled,
      images: erpData.image ? [erpData.image] : [],
      specifications: erpData.attributes || {},
      createdAt: new Date(erpData.creation),
      updatedAt: new Date(erpData.modified)
    };
  }

  /**
   * Map ERPNext sales order data to standard Order interface
   */
  static mapERPOrderToUnified(erpData: any): Order {
    return {
      id: erpData.name,
      orderNumber: erpData.name,
      customerId: erpData.customer,
      customerName: erpData.customer_name,
      status: this.mapOrderStatus(erpData.status),
      items: erpData.items?.map((item: any) => ({
        id: item.name,
        productId: item.item_code,
        productName: item.item_name,
        itemCode: item.item_code,
        quantity: item.qty,
        unitPrice: item.rate,
        totalPrice: item.amount,
        discount: item.discount_amount || 0,
        taxRate: item.tax_rate || 0
      })) || [],
      subtotal: erpData.net_total || 0,
      taxAmount: erpData.total_taxes_and_charges || 0,
      discountAmount: erpData.discount_amount || 0,
      totalAmount: erpData.grand_total || 0,
      currency: erpData.currency,
      orderDate: new Date(erpData.transaction_date),
      deliveryDate: erpData.delivery_date ? new Date(erpData.delivery_date) : undefined,
      shippingAddress: {
        street: erpData.shipping_address_name?.address_line1 || '',
        city: erpData.shipping_address_name?.city || '',
        state: erpData.shipping_address_name?.state || '',
        zipCode: erpData.shipping_address_name?.pincode || '',
        country: erpData.shipping_address_name?.country || ''
      },
      billingAddress: {
        street: erpData.customer_address?.address_line1 || '',
        city: erpData.customer_address?.city || '',
        state: erpData.customer_address?.state || '',
        zipCode: erpData.customer_address?.pincode || '',
        country: erpData.customer_address?.country || ''
      },
      paymentMethod: erpData.payment_terms_template || '',
      paymentStatus: this.mapPaymentStatus(erpData.status),
      notes: erpData.remarks,
      createdAt: new Date(erpData.creation),
      updatedAt: new Date(erpData.modified)
    };
  }

  /**
   * Map customer group to tier
   */
  private static mapCustomerTier(customerGroup: string): 'premium' | 'standard' | 'basic' {
    if (!customerGroup) return 'standard';
    
    const group = customerGroup.toLowerCase();
    if (group.includes('premium') || group.includes('vip') || group.includes('gold')) {
      return 'premium';
    } else if (group.includes('basic') || group.includes('bronze')) {
      return 'basic';
    }
    return 'standard';
  }

  /**
   * Map ERP order status to standard status
   */
  private static mapOrderStatus(erpStatus: string): 'draft' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' {
    if (!erpStatus) return 'draft';
    
    const status = erpStatus.toLowerCase();
    switch (status) {
      case 'draft':
        return 'draft';
      case 'to deliver and bill':
      case 'to deliver':
        return 'confirmed';
      case 'to bill':
        return 'shipped';
      case 'completed':
        return 'delivered';
      case 'cancelled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  /**
   * Map ERP status to payment status
   */
  private static mapPaymentStatus(erpStatus: string): 'pending' | 'paid' | 'failed' | 'refunded' {
    if (!erpStatus) return 'pending';
    
    const status = erpStatus.toLowerCase();
    if (status.includes('paid') || status === 'completed') {
      return 'paid';
    } else if (status.includes('cancelled')) {
      return 'failed';
    }
    return 'pending';
  }

  /**
   * Convert standard Customer to ERP format
   */
  static toERPCustomer(customer: Customer): any {
    return {
      customer_name: customer.name,
      email_id: customer.email,
      mobile_no: customer.phone,
      customer_group: this.tierToCustomerGroup(customer.tier),
      territory: customer.territory,
      disabled: customer.status === 'inactive' ? 1 : 0,
      credit_limit: customer.creditLimit
    };
  }

  /**
   * Convert standard Product to ERP format
   */
  static toERPProduct(product: Product): any {
    return {
      item_code: product.itemCode,
      item_name: product.name,
      description: product.description,
      item_group: product.category,
      standard_rate: product.price,
      stock_uom: product.unit,
      disabled: !product.isActive ? 1 : 0
    };
  }

  /**
   * Convert tier to customer group
   */
  private static tierToCustomerGroup(tier: string): string {
    switch (tier) {
      case 'premium':
        return 'Premium Customer';
      case 'basic':
        return 'Basic Customer';
      default:
        return 'Standard Customer';
    }
  }

  // B2B Integration mapping methods

  static mapUnifiedCustomerToB2B(customer: Customer): any {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
      tier: customer.tier,
      status: customer.status,
      creditLimit: customer.creditLimit,
      outstandingBalance: customer.outstandingBalance,
      territory: customer.territory,
      salesRep: customer.salesRep
    };
  }

  static mapB2BOrderToUnified(b2bData: any): Order {
    return {
      id: b2bData.id,
      orderNumber: b2bData.orderNumber,
      customerId: b2bData.customerId,
      customerName: b2bData.customerName,
      status: b2bData.status || 'pending',
      items: b2bData.items || [],
      subtotal: b2bData.subtotal || 0,
      taxAmount: b2bData.taxAmount || 0,
      discountAmount: b2bData.discountAmount || 0,
      totalAmount: b2bData.totalAmount || 0,
      currency: b2bData.currency || 'INR',
      orderDate: new Date(b2bData.orderDate || Date.now()),
      deliveryDate: b2bData.deliveryDate ? new Date(b2bData.deliveryDate) : undefined,
      shippingAddress: b2bData.shippingAddress || {},
      billingAddress: b2bData.billingAddress || {},
      paymentMethod: b2bData.paymentMethod || '',
      paymentStatus: b2bData.paymentStatus || 'pending',
      notes: b2bData.notes,
      createdAt: new Date(b2bData.createdAt || Date.now()),
      updatedAt: new Date(b2bData.updatedAt || Date.now())
    };
  }

  static mapUnifiedOrderToB2B(order: Order): any {
    return {
      id: order.id,
      orderNumber: order.orderNumber,
      customerId: order.customerId,
      customerName: order.customerName,
      status: order.status,
      items: order.items,
      subtotal: order.subtotal,
      taxAmount: order.taxAmount,
      discountAmount: order.discountAmount,
      totalAmount: order.totalAmount,
      currency: order.currency,
      orderDate: order.orderDate.toISOString(),
      deliveryDate: order.deliveryDate?.toISOString(),
      shippingAddress: order.shippingAddress,
      billingAddress: order.billingAddress,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      notes: order.notes
    };
  }

  static mapB2BProductToUnified(b2bData: any): Product {
    return {
      id: b2bData.id,
      itemCode: b2bData.itemCode || b2bData.sku,
      name: b2bData.name,
      description: b2bData.description || '',
      category: b2bData.category || '',
      price: b2bData.price || 0,
      cost: b2bData.cost || 0,
      stockQuantity: b2bData.stockQuantity || 0,
      unit: b2bData.unit || 'pcs',
      warehouse: b2bData.warehouse || 'Main Store',
      isActive: b2bData.isActive !== false,
      images: b2bData.images || [],
      specifications: b2bData.specifications || {},
      createdAt: new Date(b2bData.createdAt || Date.now()),
      updatedAt: new Date(b2bData.updatedAt || Date.now())
    };
  }

  static mapB2BMetricsToUnified(b2bData: any): SalesMetrics {
    return {
      totalRevenue: b2bData.totalRevenue || 0,
      totalOrders: b2bData.totalOrders || 0,
      averageOrderValue: b2bData.averageOrderValue || 0,
      topProducts: b2bData.topProducts || [],
      topCustomers: b2bData.topCustomers || [],
      periodStart: new Date(b2bData.periodStart || Date.now()),
      periodEnd: new Date(b2bData.periodEnd || Date.now())
    };
  }

  // ERP Integration mapping methods

  static mapUnifiedCustomerToERP(customer: Customer): any {
    return DataMapper.toERPCustomer(customer);
  }



  static mapUnifiedOrderToERP(order: Order): any {
    return {
      customer: order.customerId,
      customer_name: order.customerName,
      transaction_date: order.orderDate.toISOString().split('T')[0],
      delivery_date: order.deliveryDate?.toISOString().split('T')[0],
      currency: order.currency,
      items: order.items.map(item => ({
        item_code: item.itemCode,
        item_name: item.productName,
        qty: item.quantity,
        rate: item.unitPrice,
        amount: item.totalPrice
      })),
      net_total: order.subtotal,
      total_taxes_and_charges: order.taxAmount,
      discount_amount: order.discountAmount,
      grand_total: order.totalAmount,
      remarks: order.notes
    };
  }

  static mapERPPriceToUnified(erpData: any): PriceListItem {
    return {
      itemCode: erpData.item_code,
      price: erpData.price_list_rate || erpData.rate,
      minQuantity: erpData.min_qty || 1,
      maxQuantity: erpData.max_qty
    };
  }

  static mapERPTerritoryToUnified(erpData: any): Territory {
    return {
      id: erpData.name,
      name: erpData.territory_name,
      description: erpData.description || '',
      salesRep: erpData.territory_manager,
      customers: [],
      isActive: !erpData.disabled,
      createdAt: new Date(erpData.creation),
      updatedAt: new Date(erpData.modified)
    };
  }
}
