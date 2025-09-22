import { BeforeInsert, Column, Entity, Index, OneToMany } from "typeorm";
import { generateEntityId } from "@medusajs/medusa/dist/utils";
import { CustomerSegmentAssignment } from "./customer-segment-assignment";

@Entity()
export class CustomerSegment {
  @Column({ type: "varchar", primary: true })
  id: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 20 })
  segment_code: string;

  @Column({ type: "varchar", length: 100 })
  segment_name: string;

  @Column({ type: "text", nullable: true })
  segment_description: string;

  @Column({ type: "varchar", length: 30 })
  segment_type: string; // 'geographic', 'demographic', 'behavioral', 'psychographic'

  @Column({ type: "integer", default: 3 })
  priority_level: number; // 1=High, 2=Medium, 3=Low

  @Column({ type: "boolean", default: true })
  is_active: boolean;

  // Pricing configuration
  @Column({ type: "varchar", nullable: true })
  default_price_list: string;

  @Column({ type: "decimal", precision: 8, scale: 3, default: 0 })
  discount_percentage: number;

  @Column({ type: "decimal", precision: 18, scale: 6, default: 0 })
  minimum_order_amount: number;

  @Column({ type: "decimal", precision: 8, scale: 3, default: 1 })
  credit_limit_multiplier: number;

  // Business rules
  @Column({ type: "varchar", nullable: true })
  payment_terms: string;

  @Column({ type: "varchar", nullable: true })
  default_sales_person: string;

  @Column({ type: "varchar", nullable: true })
  territory: string;

  @Column({ type: "varchar", nullable: true })
  customer_group: string;

  // B2B/B2C specific configurations
  @Column({ type: "varchar", default: "B2C" })
  business_type: string; // 'B2B', 'B2C', 'HYBRID'

  @Column({ type: "boolean", default: false })
  requires_approval: boolean;

  @Column({ type: "boolean", default: false })
  bulk_pricing_enabled: boolean;

  @Column({ type: "integer", nullable: true })
  minimum_bulk_quantity: number;

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  bulk_discount_percentage: number;

  @Column({ type: "boolean", default: false })
  credit_terms_available: boolean;

  @Column({ type: "integer", nullable: true })
  credit_days: number;

  @Column({ type: "boolean", default: false })
  exclusive_products_access: boolean;

  @Column({ type: "text", nullable: true })
  special_terms: string; // JSON string of special terms and conditions

  // Communication preferences
  @Column({ type: "varchar", nullable: true })
  preferred_communication: string; // 'email', 'sms', 'whatsapp', 'phone'

  @Column({ type: "boolean", default: true })
  marketing_emails_enabled: boolean;

  @Column({ type: "boolean", default: true })
  promotional_sms_enabled: boolean;

  // Fulfillment preferences
  @Column({ type: "varchar", nullable: true })
  preferred_shipping_method: string;

  @Column({ type: "boolean", default: false })
  expedited_processing: boolean;

  @Column({ type: "varchar", nullable: true })
  delivery_instructions: string;

  // Analytics and tracking
  @Column({ type: "text", nullable: true })
  tracking_parameters: string; // JSON string for analytics tracking

  @Column({ type: "varchar", nullable: true })
  utm_source: string;

  @Column({ type: "varchar", nullable: true })
  acquisition_channel: string;

  @Column({ type: "text", nullable: true })
  segment_notes: string;

  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

  @OneToMany(() => CustomerSegmentAssignment, assignment => assignment.customer_segment)
  assignments: CustomerSegmentAssignment[];

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "cs");
  }
}

export default CustomerSegment;