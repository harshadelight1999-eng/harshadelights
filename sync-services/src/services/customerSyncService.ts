import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';
import { messageBroker, SyncEvent } from './MessageBroker';
import { config } from '../config';
import { ConflictResolver } from './ConflictResolver';

export interface CustomerData {
  // Common fields
  id?: string;
  name: string;
  email: string;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    country: string;
    postalCode: string;
  };

  // ERPNext specific
  erpnext?: {
    customer_name: string;
    customer_type: 'Company' | 'Individual';
    customer_group: string;
    territory: string;
    credit_limit: number;
    payment_terms?: string;
    sales_person?: string;
    tax_id?: string;
    is_frozen: boolean;
    disabled: boolean;
  };

  // EspoCRM specific
  espocrm?: {
    accountType: 'Customer' | 'Partner' | 'Investor' | 'Reseller';
    industry?: string;
    billingAddress?: any;
    shippingAddress?: any;
    assignedUser?: string;
    teams?: string[];
    description?: string;
    website?: string;
  };

  // Sync metadata
  lastSyncedAt?: Date;
  version?: number;
  conflictResolved?: boolean;
}

export class CustomerSyncService {
  private erpnextClient: AxiosInstance;
  private espocrmClient: AxiosInstance;
  private conflictResolver: ConflictResolver;

  constructor() {
    this.erpnextClient = axios.create({
      baseURL: config.erpnext.baseUrl,
      headers: {
        'Authorization': `token ${config.erpnext.apiKey}:${config.erpnext.apiSecret}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.espocrmClient = axios.create({
      baseURL: config.espocrm.baseUrl,
      headers: {
        'X-Api-Key': config.espocrm.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    this.conflictResolver = new ConflictResolver();
    this.setupSyncListeners();
  }

  private setupSyncListeners() {
    // Subscribe to customer sync events
    messageBroker.subscribeTo('customer-sync', this.processCustomerSync.bind(this));
  }

  private async processCustomerSync(message: any): Promise<any> {
    const { event }: { event: SyncEvent } = message.payload;

    try {
      logger.info(`Processing customer sync: ${event.operation} from ${event.source} to ${event.target}`);

      switch (event.operation) {
        case 'create':
          return await this.handleCustomerCreate(event);
        case 'update':
          return await this.handleCustomerUpdate(event);
        case 'delete':
          return await this.handleCustomerDelete(event);
        default:
          throw new Error(`Unknown operation: ${event.operation}`);
      }
    } catch (error) {
      logger.error('Customer sync processing failed:', error);
      throw error;
    }
  }

  private async handleCustomerCreate(event: SyncEvent): Promise<any> {
    const customerData: CustomerData = event.data;

    if (event.target === 'all' || event.target === 'erpnext') {
      await this.createCustomerInERPNext(customerData);
    }

    if (event.target === 'all' || event.target === 'espocrm') {
      await this.createCustomerInEspoCRM(customerData);
    }

    return { success: true, message: 'Customer created successfully' };
  }

  private async handleCustomerUpdate(event: SyncEvent): Promise<any> {
    const customerData: CustomerData = event.data;
    const conflicts: any[] = [];

    // Check for conflicts before updating
    if (event.target === 'all') {
      const erpnextCustomer = await this.getCustomerFromERPNext(customerData.id!);
      const espocrmCustomer = await this.getCustomerFromEspoCRM(customerData.id!);

      const conflictResult = await this.conflictResolver.resolveCustomerConflicts(
        customerData,
        erpnextCustomer,
        espocrmCustomer
      );

      if (conflictResult.hasConflicts) {
        conflicts.push(...conflictResult.conflicts);
        customerData.conflictResolved = conflictResult.resolved;
      }
    }

    if (event.target === 'all' || event.target === 'erpnext') {
      await this.updateCustomerInERPNext(customerData);
    }

    if (event.target === 'all' || event.target === 'espocrm') {
      await this.updateCustomerInEspoCRM(customerData);
    }

    return {
      success: true,
      message: 'Customer updated successfully',
      conflicts: conflicts.length > 0 ? conflicts : undefined
    };
  }

  private async handleCustomerDelete(event: SyncEvent): Promise<any> {
    const customerId = event.data.id;

    if (event.target === 'all' || event.target === 'erpnext') {
      await this.deleteCustomerInERPNext(customerId);
    }

    if (event.target === 'all' || event.target === 'espocrm') {
      await this.deleteCustomerInEspoCRM(customerId);
    }

    return { success: true, message: 'Customer deleted successfully' };
  }

  // ERPNext operations
  private async createCustomerInERPNext(customerData: CustomerData): Promise<any> {
    try {
      const erpnextData = {
        doctype: 'Customer',
        customer_name: customerData.name,
        customer_type: customerData.erpnext?.customer_type || 'Individual',
        customer_group: customerData.erpnext?.customer_group || 'All Customer Groups',
        territory: customerData.erpnext?.territory || 'All Territories',
        email_id: customerData.email,
        mobile_no: customerData.phone,
        credit_limit: customerData.erpnext?.credit_limit || 0,
        payment_terms: customerData.erpnext?.payment_terms,
        default_sales_partner: customerData.erpnext?.sales_person,
        tax_id: customerData.erpnext?.tax_id,
        is_frozen: customerData.erpnext?.is_frozen || 0,
        disabled: customerData.erpnext?.disabled || 0,
      };

      // Add address if provided
      if (customerData.address) {
        erpnextData['customer_primary_address'] = await this.createAddressInERPNext(
          customerData.address,
          customerData.name
        );
      }

      const response = await this.erpnextClient.post('/api/resource/Customer', erpnextData);

      logger.info(`Customer created in ERPNext: ${response.data.data.name}`);
      return response.data.data;
    } catch (error) {
      logger.error('Failed to create customer in ERPNext:', error);
      throw new Error(`ERPNext customer creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async updateCustomerInERPNext(customerData: CustomerData): Promise<any> {
    try {
      const erpnextData = {
        customer_name: customerData.name,
        email_id: customerData.email,
        mobile_no: customerData.phone,
        credit_limit: customerData.erpnext?.credit_limit,
        payment_terms: customerData.erpnext?.payment_terms,
        default_sales_partner: customerData.erpnext?.sales_person,
        tax_id: customerData.erpnext?.tax_id,
        is_frozen: customerData.erpnext?.is_frozen || 0,
        disabled: customerData.erpnext?.disabled || 0,
      };

      const response = await this.erpnextClient.put(
        `/api/resource/Customer/${customerData.id}`,
        erpnextData
      );

      logger.info(`Customer updated in ERPNext: ${customerData.id}`);
      return response.data.data;
    } catch (error) {
      logger.error('Failed to update customer in ERPNext:', error);
      throw new Error(`ERPNext customer update failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async deleteCustomerInERPNext(customerId: string): Promise<void> {
    try {
      await this.erpnextClient.delete(`/api/resource/Customer/${customerId}`);
      logger.info(`Customer deleted in ERPNext: ${customerId}`);
    } catch (error) {
      logger.error('Failed to delete customer in ERPNext:', error);
      throw new Error(`ERPNext customer deletion failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async getCustomerFromERPNext(customerId: string): Promise<CustomerData | null> {
    try {
      const response = await this.erpnextClient.get(`/api/resource/Customer/${customerId}`);
      const data = response.data.data;

      return this.mapERPNextToCustomerData(data);
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      logger.error('Failed to get customer from ERPNext:', error);
      throw error;
    }
  }

  // EspoCRM operations
  private async createCustomerInEspoCRM(customerData: CustomerData): Promise<any> {
    try {
      const espocrmData = {
        name: customerData.name,
        emailAddress: customerData.email,
        phoneNumber: customerData.phone,
        accountType: customerData.espocrm?.accountType || 'Customer',
        industry: customerData.espocrm?.industry,
        billingAddressStreet: customerData.address?.street,
        billingAddressCity: customerData.address?.city,
        billingAddressState: customerData.address?.state,
        billingAddressCountry: customerData.address?.country,
        billingAddressPostalCode: customerData.address?.postalCode,
        assignedUserId: customerData.espocrm?.assignedUser,
        teamsIds: customerData.espocrm?.teams,
        description: customerData.espocrm?.description,
        website: customerData.espocrm?.website,
      };

      const response = await this.espocrmClient.post('/api/v1/Account', espocrmData);

      logger.info(`Customer created in EspoCRM: ${response.data.id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to create customer in EspoCRM:', error);
      throw new Error(`EspoCRM customer creation failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async updateCustomerInEspoCRM(customerData: CustomerData): Promise<any> {
    try {
      const espocrmData = {
        name: customerData.name,
        emailAddress: customerData.email,
        phoneNumber: customerData.phone,
        industry: customerData.espocrm?.industry,
        billingAddressStreet: customerData.address?.street,
        billingAddressCity: customerData.address?.city,
        billingAddressState: customerData.address?.state,
        billingAddressCountry: customerData.address?.country,
        billingAddressPostalCode: customerData.address?.postalCode,
        assignedUserId: customerData.espocrm?.assignedUser,
        description: customerData.espocrm?.description,
        website: customerData.espocrm?.website,
      };

      const response = await this.espocrmClient.put(
        `/api/v1/Account/${customerData.id}`,
        espocrmData
      );

      logger.info(`Customer updated in EspoCRM: ${customerData.id}`);
      return response.data;
    } catch (error) {
      logger.error('Failed to update customer in EspoCRM:', error);
      throw new Error(`EspoCRM customer update failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async deleteCustomerInEspoCRM(customerId: string): Promise<void> {
    try {
      await this.espocrmClient.delete(`/api/v1/Account/${customerId}`);
      logger.info(`Customer deleted in EspoCRM: ${customerId}`);
    } catch (error) {
      logger.error('Failed to delete customer in EspoCRM:', error);
      throw new Error(`EspoCRM customer deletion failed: ${error.response?.data?.message || error.message}`);
    }
  }

  private async getCustomerFromEspoCRM(customerId: string): Promise<CustomerData | null> {
    try {
      const response = await this.espocrmClient.get(`/api/v1/Account/${customerId}`);
      return this.mapEspoCRMToCustomerData(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        return null;
      }
      logger.error('Failed to get customer from EspoCRM:', error);
      throw error;
    }
  }

  // Helper methods
  private async createAddressInERPNext(address: any, customerName: string): Promise<string> {
    try {
      const addressData = {
        doctype: 'Address',
        address_title: `${customerName} - Primary`,
        address_type: 'Billing',
        address_line1: address.street,
        city: address.city,
        state: address.state,
        country: address.country,
        pincode: address.postalCode,
        links: [{
          link_doctype: 'Customer',
          link_name: customerName,
        }],
      };

      const response = await this.erpnextClient.post('/api/resource/Address', addressData);
      return response.data.data.name;
    } catch (error) {
      logger.error('Failed to create address in ERPNext:', error);
      throw error;
    }
  }

  private mapERPNextToCustomerData(erpnextData: any): CustomerData {
    return {
      id: erpnextData.name,
      name: erpnextData.customer_name,
      email: erpnextData.email_id,
      phone: erpnextData.mobile_no,
      erpnext: {
        customer_name: erpnextData.customer_name,
        customer_type: erpnextData.customer_type,
        customer_group: erpnextData.customer_group,
        territory: erpnextData.territory,
        credit_limit: erpnextData.credit_limit || 0,
        payment_terms: erpnextData.payment_terms,
        sales_person: erpnextData.default_sales_partner,
        tax_id: erpnextData.tax_id,
        is_frozen: erpnextData.is_frozen === 1,
        disabled: erpnextData.disabled === 1,
      },
      lastSyncedAt: new Date(),
      version: 1,
    };
  }

  private mapEspoCRMToCustomerData(espocrmData: any): CustomerData {
    return {
      id: espocrmData.id,
      name: espocrmData.name,
      email: espocrmData.emailAddress,
      phone: espocrmData.phoneNumber,
      address: {
        street: espocrmData.billingAddressStreet,
        city: espocrmData.billingAddressCity,
        state: espocrmData.billingAddressState,
        country: espocrmData.billingAddressCountry,
        postalCode: espocrmData.billingAddressPostalCode,
      },
      espocrm: {
        accountType: espocrmData.accountType,
        industry: espocrmData.industry,
        assignedUser: espocrmData.assignedUserId,
        teams: espocrmData.teamsIds,
        description: espocrmData.description,
        website: espocrmData.website,
      },
      lastSyncedAt: new Date(),
      version: 1,
    };
  }

  // Public API methods
  public async syncCustomer(customerData: CustomerData, source: 'erpnext' | 'espocrm', target: 'erpnext' | 'espocrm' | 'all'): Promise<string> {
    const event: SyncEvent = {
      entityType: 'customer',
      operation: customerData.id ? 'update' : 'create',
      source,
      target,
      data: customerData,
      metadata: {
        timestamp: new Date().toISOString(),
        correlationId: `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      },
    };

    return await messageBroker.publishSyncEvent(event);
  }

  public async syncAllCustomers(source: 'erpnext' | 'espocrm'): Promise<void> {
    logger.info(`Starting full customer sync from ${source}`);

    try {
      let customers: CustomerData[] = [];

      if (source === 'erpnext') {
        customers = await this.getAllCustomersFromERPNext();
      } else {
        customers = await this.getAllCustomersFromEspoCRM();
      }

      const events: SyncEvent[] = customers.map(customer => ({
        entityType: 'customer',
        operation: 'update',
        source,
        target: source === 'erpnext' ? 'espocrm' : 'erpnext',
        data: customer,
        metadata: {
          timestamp: new Date().toISOString(),
          correlationId: `bulk_customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        },
      }));

      await messageBroker.publishBatch(events);
      logger.info(`Queued ${customers.length} customers for sync`);
    } catch (error) {
      logger.error('Full customer sync failed:', error);
      throw error;
    }
  }

  private async getAllCustomersFromERPNext(): Promise<CustomerData[]> {
    try {
      const response = await this.erpnextClient.get('/api/resource/Customer?fields=["*"]');
      return response.data.data.map(this.mapERPNextToCustomerData);
    } catch (error) {
      logger.error('Failed to get all customers from ERPNext:', error);
      throw error;
    }
  }

  private async getAllCustomersFromEspoCRM(): Promise<CustomerData[]> {
    try {
      const response = await this.espocrmClient.get('/api/v1/Account');
      return response.data.list.map(this.mapEspoCRMToCustomerData);
    } catch (error) {
      logger.error('Failed to get all customers from EspoCRM:', error);
      throw error;
    }
  }
}

export const customerSyncService = new CustomerSyncService();