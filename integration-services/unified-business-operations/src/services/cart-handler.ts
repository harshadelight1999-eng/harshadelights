import { EventEmitter } from 'events';
import { Logger } from '../utils/logger';

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Cart {
  sessionId: string;
  customerId?: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export class CartHandler extends EventEmitter {
  private logger: Logger;
  private carts: Map<string, Cart> = new Map();

  constructor() {
    super();
    this.logger = new Logger('CartHandler');
  }

  async getCart(sessionId: string): Promise<Cart | null> {
    return this.carts.get(sessionId) || null;
  }

  async createCart(sessionId: string, customerId?: string): Promise<Cart> {
    const cart: Cart = {
      sessionId,
      customerId,
      items: [],
      subtotal: 0,
      tax: 0,
      total: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.carts.set(sessionId, cart);
    this.emit('cart-created', cart);
    
    return cart;
  }

  async addItem(sessionId: string, productId: string, quantity: number, price: number): Promise<Cart> {
    let cart = this.carts.get(sessionId);
    
    if (!cart) {
      cart = await this.createCart(sessionId);
    }

    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (existingItemIndex >= 0) {
      cart.items[existingItemIndex].quantity += quantity;
      cart.items[existingItemIndex].total = cart.items[existingItemIndex].quantity * price;
    } else {
      cart.items.push({
        productId,
        quantity,
        price,
        total: quantity * price,
      });
    }

    this.updateCartTotals(cart);
    this.carts.set(sessionId, cart);
    
    this.emit('cart-updated', cart);
    
    return cart;
  }

  async updateItem(sessionId: string, productId: string, quantity: number): Promise<Cart> {
    const cart = this.carts.get(sessionId);
    
    if (!cart) {
      throw new Error('Cart not found');
    }

    const itemIndex = cart.items.findIndex(item => item.productId === productId);
    
    if (itemIndex === -1) {
      throw new Error('Item not found in cart');
    }

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
      cart.items[itemIndex].total = quantity * cart.items[itemIndex].price;
    }

    this.updateCartTotals(cart);
    this.carts.set(sessionId, cart);
    
    this.emit('cart-updated', cart);
    
    return cart;
  }

  async removeItem(sessionId: string, productId: string): Promise<Cart> {
    const cart = this.carts.get(sessionId);
    
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = cart.items.filter(item => item.productId !== productId);
    
    this.updateCartTotals(cart);
    this.carts.set(sessionId, cart);
    
    this.emit('cart-updated', cart);
    
    return cart;
  }

  async clearCart(sessionId: string): Promise<Cart> {
    const cart = this.carts.get(sessionId);
    
    if (!cart) {
      throw new Error('Cart not found');
    }

    cart.items = [];
    this.updateCartTotals(cart);
    this.carts.set(sessionId, cart);
    
    this.emit('cart-cleared', cart);
    
    return cart;
  }

  private updateCartTotals(cart: Cart): void {
    cart.subtotal = cart.items.reduce((sum, item) => sum + item.total, 0);
    cart.tax = cart.subtotal * 0.18; // 18% GST
    cart.total = cart.subtotal + cart.tax;
    cart.updatedAt = new Date();
  }

  async handleCartUpdate(data: any, source: string): Promise<void> {
    try {
      this.logger.info(`Handling cart update from ${source}:`, data);
      
      // Broadcast cart update to real-time sync service
      this.emit('notify-sync', {
        type: 'cart.updated',
        data,
        source,
        timestamp: new Date().toISOString(),
      });
      
    } catch (error) {
      this.logger.error('Error handling cart update:', error);
    }
  }
}

export default CartHandler;
