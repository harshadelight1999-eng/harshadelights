import { BeforeInsert, Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Product as MedusaProduct } from "@medusajs/medusa";
import { generateEntityId } from "@medusajs/medusa/dist/utils";

@Entity()
export class ProductBatch {
  @Column({ type: "varchar", primary: true })
  id: string;

  @ManyToOne(() => MedusaProduct, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: MedusaProduct;

  @Index()
  @Column({ type: "varchar" })
  product_id: string;

  @Index()
  @Column({ type: "varchar", unique: true })
  batch_number: string;

  @Column({ type: "date" })
  manufacturing_date: Date;

  @Column({ type: "date" })
  expiry_date: Date;

  @Column({ type: "integer" })
  initial_quantity: number;

  @Column({ type: "integer" })
  current_quantity: number;

  @Column({ type: "integer", default: 0 })
  reserved_quantity: number;

  @Column({ type: "integer", default: 0 })
  sold_quantity: number;

  @Column({ type: "integer", default: 0 })
  damaged_quantity: number;

  @Column({ type: "varchar", nullable: true })
  supplier_batch_reference: string;

  @Column({ type: "varchar", nullable: true })
  quality_grade: string; // 'A', 'B', 'C', 'Premium', 'Standard'

  @Column({ type: "text", nullable: true })
  quality_notes: string;

  @Column({ type: "varchar", nullable: true })
  storage_location: string;

  @Column({ type: "varchar", nullable: true })
  warehouse: string;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  cost_price_per_unit: number;

  @Column({ type: "varchar", nullable: true })
  supplier_name: string;

  @Column({ type: "varchar", nullable: true })
  supplier_invoice_number: string;

  @Column({ type: "date", nullable: true })
  received_date: Date;

  @Column({ type: "varchar", default: "active" })
  status: string; // 'active', 'expired', 'recalled', 'damaged', 'sold_out'

  @Column({ type: "boolean", default: true })
  is_saleable: boolean;

  @Column({ type: "text", nullable: true })
  testing_certificates: string; // JSON string of test results

  @Column({ type: "varchar", nullable: true })
  packaging_batch: string;

  @Column({ type: "text", nullable: true })
  handling_notes: string;

  @Column({ type: "varchar", nullable: true })
  temperature_log: string; // JSON string of temperature monitoring

  @Column({ type: "boolean", default: false })
  requires_cold_chain: boolean;

  @Column({ type: "text", nullable: true })
  recall_reason: string;

  @Column({ type: "date", nullable: true })
  recall_date: Date;

  @Column({ type: "varchar", nullable: true })
  traceability_code: string;

  @Column({ type: "text", nullable: true })
  origin_details: string; // Farm/source details for traceability

  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

  // Calculated fields (virtual)
  get available_quantity(): number {
    return this.current_quantity - this.reserved_quantity;
  }

  get is_expired(): boolean {
    return new Date() > this.expiry_date;
  }

  get days_until_expiry(): number {
    const now = new Date();
    const diffTime = this.expiry_date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  get is_near_expiry(): boolean {
    return this.days_until_expiry <= 7 && this.days_until_expiry > 0;
  }

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "pb");
    this.current_quantity = this.initial_quantity;
  }
}

export default ProductBatch;