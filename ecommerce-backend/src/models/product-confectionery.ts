import { BeforeInsert, Column, Entity, Index, JoinColumn, OneToOne } from "typeorm";
import { Product as MedusaProduct } from "@medusajs/medusa";
import { generateEntityId } from "@medusajs/medusa/dist/utils";

@Entity()
export class ProductConfectionery {
  @Column({ type: "varchar", primary: true })
  id: string;

  @OneToOne(() => MedusaProduct, { onDelete: "CASCADE" })
  @JoinColumn({ name: "product_id" })
  product: MedusaProduct;

  @Index()
  @Column({ type: "varchar" })
  product_id: string;

  // Confectionery-specific attributes
  @Column({ type: "varchar", nullable: true })
  category_type: string; // 'sweets', 'namkeens', 'dry_fruits', 'bakery', 'raw_materials'

  @Column({ type: "varchar", nullable: true })
  subcategory: string; // 'chocolates', 'traditional_sweets', 'chips', 'nuts', etc.

  @Column({ type: "text", nullable: true })
  ingredients: string; // JSON string of ingredients

  @Column({ type: "text", nullable: true })
  nutritional_info: string; // JSON string of nutritional information

  @Column({ type: "text", nullable: true })
  allergen_info: string; // JSON string of allergen information

  @Column({ type: "varchar", nullable: true })
  shelf_life_days: string; // Number of days for shelf life

  @Column({ type: "varchar", nullable: true })
  storage_instructions: string;

  @Column({ type: "varchar", nullable: true })
  packaging_type: string; // 'box', 'bag', 'jar', 'loose', etc.

  @Column({ type: "decimal", precision: 10, scale: 3, nullable: true })
  net_weight_grams: number;

  @Column({ type: "decimal", precision: 10, scale: 3, nullable: true })
  gross_weight_grams: number;

  @Column({ type: "varchar", nullable: true })
  origin_country: string;

  @Column({ type: "varchar", nullable: true })
  brand_name: string;

  @Column({ type: "varchar", nullable: true })
  manufacturer_name: string;

  @Column({ type: "varchar", nullable: true })
  fssai_license: string;

  @Column({ type: "boolean", default: false })
  is_organic: boolean;

  @Column({ type: "boolean", default: false })
  is_vegan: boolean;

  @Column({ type: "boolean", default: false })
  is_gluten_free: boolean;

  @Column({ type: "boolean", default: false })
  is_sugar_free: boolean;

  @Column({ type: "varchar", nullable: true })
  taste_profile: string; // 'sweet', 'salty', 'spicy', 'bitter', 'tangy'

  @Column({ type: "varchar", nullable: true })
  texture: string; // 'crunchy', 'soft', 'chewy', 'hard', 'creamy'

  @Column({ type: "integer", nullable: true })
  minimum_order_quantity: number;

  @Column({ type: "integer", nullable: true })
  maximum_order_quantity: number;

  @Column({ type: "boolean", default: true })
  requires_batch_tracking: boolean;

  @Column({ type: "boolean", default: true })
  requires_expiry_tracking: boolean;

  @Column({ type: "varchar", nullable: true })
  hsn_code: string; // Harmonized System of Nomenclature for tax calculation

  @Column({ type: "decimal", precision: 5, scale: 2, nullable: true })
  gst_rate: number; // GST rate percentage

  @Column({ type: "text", nullable: true })
  special_handling_instructions: string;

  @Column({ type: "varchar", nullable: true })
  temperature_requirements: string; // 'room_temperature', 'refrigerated', 'frozen'

  @Column({ type: "text", nullable: true })
  marketing_description: string;

  @Column({ type: "text", nullable: true })
  serving_suggestions: string;

  @Column({ type: "varchar", nullable: true })
  seasonal_availability: string; // 'year_round', 'winter', 'summer', 'festival_special'

  @Column({ type: "text", nullable: true })
  recipe_notes: string; // For internal use

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  cost_price: number; // Cost price for margin calculation

  @Column({ type: "varchar", nullable: true })
  supplier_code: string;

  @Column({ type: "boolean", default: false })
  is_made_to_order: boolean;

  @Column({ type: "integer", nullable: true })
  preparation_time_hours: number;

  @Column({ type: "text", nullable: true })
  quality_parameters: string; // JSON string of quality check parameters

  @Column({ type: "varchar", nullable: true })
  certification: string; // 'iso', 'haccp', 'halal', 'kosher', etc.

  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  created_at: Date;

  @Column({ type: "timestamp with time zone", default: () => "CURRENT_TIMESTAMP" })
  updated_at: Date;

  @BeforeInsert()
  private beforeInsert(): void {
    this.id = generateEntityId(this.id, "pc");
  }
}

export default ProductConfectionery;