# ERPNext Customizations for Harsha Delights Confectionery Business System

## Overview
This document provides comprehensive technical specifications for ERPNext customizations to support Harsha Delights' confectionery business operations. The customizations are designed to handle batch/lot tracking, expiry management, customer segmentation, dynamic pricing, and multi-channel order processing.

---

## 1. CUSTOM DOCTYPES

### 1.1 Customer Segmentation

#### HD Customer Segment
```python
{
    "doctype": "HD Customer Segment",
    "fields": [
        {"fieldname": "segment_name", "fieldtype": "Data", "label": "Segment Name", "reqd": 1},
        {"fieldname": "segment_type", "fieldtype": "Select", "label": "Segment Type",
         "options": "B2B\nB2C\nGeographic", "reqd": 1},
        {"fieldname": "segment_category", "fieldtype": "Select", "label": "Category",
         "options": "Shops/Retailers\nWholesalers\nMiddlemen\nEvent Planners\nDealers\nVendors\nIndividual Consumers\nBulk Orders\nSubscription\nInternational\nLocal"},
        {"fieldname": "pricing_tier", "fieldtype": "Link", "label": "Pricing Tier", "options": "HD Pricing Tier"},
        {"fieldname": "credit_limit_default", "fieldtype": "Currency", "label": "Default Credit Limit"},
        {"fieldname": "payment_terms_default", "fieldtype": "Link", "label": "Default Payment Terms", "options": "Payment Terms Template"},
        {"fieldname": "is_active", "fieldtype": "Check", "label": "Active", "default": 1}
    ]
}
```

#### HD Customer Profile Extended
```python
{
    "doctype": "HD Customer Profile Extended",
    "fields": [
        {"fieldname": "customer", "fieldtype": "Link", "label": "Customer", "options": "Customer", "reqd": 1},
        {"fieldname": "customer_segment", "fieldtype": "Link", "label": "Customer Segment", "options": "HD Customer Segment"},
        {"fieldname": "language_preference", "fieldtype": "Select", "label": "Language Preference",
         "options": "English\nHindi\nGujarati\nMarathi"},
        {"fieldname": "communication_preference", "fieldtype": "Select", "label": "Communication Preference",
         "options": "Email\nWhatsApp\nSMS\nPhone"},
        {"fieldname": "special_requirements", "fieldtype": "Text", "label": "Special Requirements"},
        {"fieldname": "order_frequency", "fieldtype": "Select", "label": "Order Frequency",
         "options": "Daily\nWeekly\nBi-weekly\nMonthly\nOccasional"},
        {"fieldname": "preferred_delivery_time", "fieldtype": "Select", "label": "Preferred Delivery Time",
         "options": "Morning\nAfternoon\nEvening\nFlexible"},
        {"fieldname": "quality_preferences", "fieldtype": "Text", "label": "Quality Preferences"},
        {"fieldname": "festival_preferences", "fieldtype": "Small Text", "label": "Festival Preferences"}
    ]
}
```

### 1.2 Inventory Management

#### HD Batch Master
```python
{
    "doctype": "HD Batch Master",
    "fields": [
        {"fieldname": "batch_id", "fieldtype": "Data", "label": "Batch ID", "reqd": 1},
        {"fieldname": "item", "fieldtype": "Link", "label": "Item", "options": "Item", "reqd": 1},
        {"fieldname": "manufacturing_date", "fieldtype": "Date", "label": "Manufacturing Date", "reqd": 1},
        {"fieldname": "expiry_date", "fieldtype": "Date", "label": "Expiry Date", "reqd": 1},
        {"fieldname": "shelf_life_days", "fieldtype": "Int", "label": "Shelf Life (Days)"},
        {"fieldname": "production_partner", "fieldtype": "Link", "label": "Production Partner", "options": "Supplier"},
        {"fieldname": "quality_status", "fieldtype": "Select", "label": "Quality Status",
         "options": "Pending\nApproved\nRejected\nOn Hold", "default": "Pending"},
        {"fieldname": "quality_certificate", "fieldtype": "Attach", "label": "Quality Certificate"},
        {"fieldname": "batch_size", "fieldtype": "Float", "label": "Batch Size", "precision": 3},
        {"fieldname": "cost_per_unit", "fieldtype": "Currency", "label": "Cost per Unit"},
        {"fieldname": "is_active", "fieldtype": "Check", "label": "Active", "default": 1},
        {"fieldname": "notes", "fieldtype": "Text", "label": "Notes"}
    ]
}
```

#### HD Stock Movement Tracker
```python
{
    "doctype": "HD Stock Movement Tracker",
    "fields": [
        {"fieldname": "item", "fieldtype": "Link", "label": "Item", "options": "Item", "reqd": 1},
        {"fieldname": "batch", "fieldtype": "Link", "label": "Batch", "options": "HD Batch Master"},
        {"fieldname": "warehouse", "fieldtype": "Link", "label": "Warehouse", "options": "Warehouse", "reqd": 1},
        {"fieldname": "movement_type", "fieldtype": "Select", "label": "Movement Type",
         "options": "Receipt\nIssue\nTransfer\nAdjustment\nProduction\nReturn"},
        {"fieldname": "quantity", "fieldtype": "Float", "label": "Quantity", "precision": 3},
        {"fieldname": "balance_qty", "fieldtype": "Float", "label": "Balance Quantity", "precision": 3},
        {"fieldname": "reference_doc", "fieldtype": "Dynamic Link", "label": "Reference Document"},
        {"fieldname": "reference_doctype", "fieldtype": "Select", "label": "Reference DocType",
         "options": "Purchase Receipt\nSales Invoice\nStock Entry\nDelivery Note"},
        {"fieldname": "movement_date", "fieldtype": "Datetime", "label": "Movement Date", "default": "now"},
        {"fieldname": "user", "fieldtype": "Link", "label": "User", "options": "User", "default": "__user"}
    ]
}
```

#### HD Expiry Alert
```python
{
    "doctype": "HD Expiry Alert",
    "fields": [
        {"fieldname": "item", "fieldtype": "Link", "label": "Item", "options": "Item", "reqd": 1},
        {"fieldname": "batch", "fieldtype": "Link", "label": "Batch", "options": "HD Batch Master", "reqd": 1},
        {"fieldname": "warehouse", "fieldtype": "Link", "label": "Warehouse", "options": "Warehouse"},
        {"fieldname": "expiry_date", "fieldtype": "Date", "label": "Expiry Date"},
        {"fieldname": "days_to_expiry", "fieldtype": "Int", "label": "Days to Expiry"},
        {"fieldname": "current_stock", "fieldtype": "Float", "label": "Current Stock", "precision": 3},
        {"fieldname": "alert_level", "fieldtype": "Select", "label": "Alert Level",
         "options": "Green\nYellow\nOrange\nRed", "default": "Green"},
        {"fieldname": "action_taken", "fieldtype": "Select", "label": "Action Taken",
         "options": "None\nDiscount Applied\nPromotional Sale\nReturn to Supplier\nDisposed"},
        {"fieldname": "alert_date", "fieldtype": "Date", "label": "Alert Date", "default": "today"}
    ]
}
```

### 1.3 Dynamic Pricing

#### HD Pricing Tier
```python
{
    "doctype": "HD Pricing Tier",
    "fields": [
        {"fieldname": "tier_name", "fieldtype": "Data", "label": "Tier Name", "reqd": 1},
        {"fieldname": "tier_code", "fieldtype": "Data", "label": "Tier Code", "reqd": 1},
        {"fieldname": "base_multiplier", "fieldtype": "Float", "label": "Base Multiplier", "precision": 4, "default": 1.0},
        {"fieldname": "minimum_order_value", "fieldtype": "Currency", "label": "Minimum Order Value"},
        {"fieldname": "credit_limit_multiplier", "fieldtype": "Float", "label": "Credit Limit Multiplier", "precision": 2, "default": 1.0},
        {"fieldname": "payment_terms", "fieldtype": "Link", "label": "Payment Terms", "options": "Payment Terms Template"},
        {"fieldname": "is_active", "fieldtype": "Check", "label": "Active", "default": 1}
    ]
}
```

#### HD Dynamic Pricing Rule
```python
{
    "doctype": "HD Dynamic Pricing Rule",
    "fields": [
        {"fieldname": "rule_name", "fieldtype": "Data", "label": "Rule Name", "reqd": 1},
        {"fieldname": "priority", "fieldtype": "Int", "label": "Priority", "default": 1},
        {"fieldname": "item_group", "fieldtype": "Link", "label": "Item Group", "options": "Item Group"},
        {"fieldname": "item", "fieldtype": "Link", "label": "Item", "options": "Item"},
        {"fieldname": "customer_segment", "fieldtype": "Link", "label": "Customer Segment", "options": "HD Customer Segment"},
        {"fieldname": "pricing_tier", "fieldtype": "Link", "label": "Pricing Tier", "options": "HD Pricing Tier"},
        {"fieldname": "territory", "fieldtype": "Link", "label": "Territory", "options": "Territory"},
        {"fieldname": "currency", "fieldtype": "Link", "label": "Currency", "options": "Currency"},
        {"fieldname": "valid_from", "fieldtype": "Date", "label": "Valid From", "reqd": 1},
        {"fieldname": "valid_upto", "fieldtype": "Date", "label": "Valid Upto"},
        {"fieldname": "min_qty", "fieldtype": "Float", "label": "Min Quantity", "precision": 3},
        {"fieldname": "max_qty", "fieldtype": "Float", "label": "Max Quantity", "precision": 3},
        {"fieldname": "rate_or_discount", "fieldtype": "Select", "label": "Rate or Discount",
         "options": "Rate\nDiscount Percentage\nDiscount Amount"},
        {"fieldname": "rate", "fieldtype": "Currency", "label": "Rate"},
        {"fieldname": "discount_percentage", "fieldtype": "Percent", "label": "Discount %"},
        {"fieldname": "discount_amount", "fieldtype": "Currency", "label": "Discount Amount"},
        {"fieldname": "is_seasonal", "fieldtype": "Check", "label": "Seasonal Rule"},
        {"fieldname": "season_start", "fieldtype": "Date", "label": "Season Start"},
        {"fieldname": "season_end", "fieldtype": "Date", "label": "Season End"},
        {"fieldname": "is_active", "fieldtype": "Check", "label": "Active", "default": 1}
    ]
}
```

### 1.4 Order Management

#### HD Order Channel
```python
{
    "doctype": "HD Order Channel",
    "fields": [
        {"fieldname": "channel_name", "fieldtype": "Data", "label": "Channel Name", "reqd": 1},
        {"fieldname": "channel_type", "fieldtype": "Select", "label": "Channel Type",
         "options": "Phone\nWeb\nMobile App\nAPI\nWhatsApp\nEmail\nWalk-in"},
        {"fieldname": "default_warehouse", "fieldtype": "Link", "label": "Default Warehouse", "options": "Warehouse"},
        {"fieldname": "commission_rate", "fieldtype": "Percent", "label": "Commission Rate"},
        {"fieldname": "integration_settings", "fieldtype": "JSON", "label": "Integration Settings"},
        {"fieldname": "is_active", "fieldtype": "Check", "label": "Active", "default": 1}
    ]
}
```

#### HD Credit Limit Tracker
```python
{
    "doctype": "HD Credit Limit Tracker",
    "fields": [
        {"fieldname": "customer", "fieldtype": "Link", "label": "Customer", "options": "Customer", "reqd": 1},
        {"fieldname": "credit_limit", "fieldtype": "Currency", "label": "Credit Limit", "reqd": 1},
        {"fieldname": "outstanding_amount", "fieldtype": "Currency", "label": "Outstanding Amount"},
        {"fieldname": "available_credit", "fieldtype": "Currency", "label": "Available Credit"},
        {"fieldname": "temporary_limit", "fieldtype": "Currency", "label": "Temporary Credit Limit"},
        {"fieldname": "temporary_limit_expiry", "fieldtype": "Date", "label": "Temporary Limit Expiry"},
        {"fieldname": "last_credit_review", "fieldtype": "Date", "label": "Last Credit Review"},
        {"fieldname": "credit_status", "fieldtype": "Select", "label": "Credit Status",
         "options": "Good\nWatch\nHold\nBlocked", "default": "Good"},
        {"fieldname": "auto_approve_limit", "fieldtype": "Currency", "label": "Auto Approve Limit"},
        {"fieldname": "notes", "fieldtype": "Text", "label": "Notes"}
    ]
}
```

### 1.5 Quality Control

#### HD Quality Check
```python
{
    "doctype": "HD Quality Check",
    "fields": [
        {"fieldname": "batch", "fieldtype": "Link", "label": "Batch", "options": "HD Batch Master", "reqd": 1},
        {"fieldname": "item", "fieldtype": "Link", "label": "Item", "options": "Item", "reqd": 1},
        {"fieldname": "check_date", "fieldtype": "Date", "label": "Check Date", "default": "today"},
        {"fieldname": "checked_by", "fieldtype": "Link", "label": "Checked By", "options": "User"},
        {"fieldname": "check_type", "fieldtype": "Select", "label": "Check Type",
         "options": "Incoming\nProduction\nPre-dispatch\nRandom"},
        {"fieldname": "overall_status", "fieldtype": "Select", "label": "Overall Status",
         "options": "Pass\nFail\nConditional Pass\nPending"},
        {"fieldname": "taste_score", "fieldtype": "Rating", "label": "Taste Score"},
        {"fieldname": "texture_score", "fieldtype": "Rating", "label": "Texture Score"},
        {"fieldname": "appearance_score", "fieldtype": "Rating", "label": "Appearance Score"},
        {"fieldname": "packaging_score", "fieldtype": "Rating", "label": "Packaging Score"},
        {"fieldname": "shelf_life_test", "fieldtype": "Check", "label": "Shelf Life Test Passed"},
        {"fieldname": "moisture_content", "fieldtype": "Float", "label": "Moisture Content %", "precision": 2},
        {"fieldname": "sugar_content", "fieldtype": "Float", "label": "Sugar Content %", "precision": 2},
        {"fieldname": "weight_accuracy", "fieldtype": "Check", "label": "Weight Accuracy"},
        {"fieldname": "defects_found", "fieldtype": "Text", "label": "Defects Found"},
        {"fieldname": "corrective_action", "fieldtype": "Text", "label": "Corrective Action"},
        {"fieldname": "certificate_number", "fieldtype": "Data", "label": "Certificate Number"},
        {"fieldname": "attachments", "fieldtype": "Table", "label": "Attachments", "options": "File"}
    ]
}
```

---

## 2. DATABASE SCHEMA MODIFICATIONS

### 2.1 Customer Table Extensions
```sql
-- Add custom fields to Customer doctype
ALTER TABLE `tabCustomer`
ADD COLUMN `customer_segment` VARCHAR(140) DEFAULT NULL,
ADD COLUMN `language_preference` VARCHAR(50) DEFAULT 'English',
ADD COLUMN `communication_preference` VARCHAR(50) DEFAULT 'Email',
ADD COLUMN `order_frequency` VARCHAR(50) DEFAULT NULL,
ADD COLUMN `quality_preferences` TEXT DEFAULT NULL,
ADD COLUMN `special_requirements` TEXT DEFAULT NULL,
ADD COLUMN `last_order_date` DATE DEFAULT NULL,
ADD COLUMN `average_order_value` DECIMAL(18,6) DEFAULT 0.0,
ADD COLUMN `loyalty_points` INT DEFAULT 0;

-- Add indexes
CREATE INDEX idx_customer_segment ON `tabCustomer` (`customer_segment`);
CREATE INDEX idx_language_preference ON `tabCustomer` (`language_preference`);
CREATE INDEX idx_last_order_date ON `tabCustomer` (`last_order_date`);
```

### 2.2 Item Table Extensions
```sql
-- Add custom fields to Item doctype
ALTER TABLE `tabItem`
ADD COLUMN `shelf_life_days` INT DEFAULT NULL,
ADD COLUMN `storage_temperature` VARCHAR(50) DEFAULT NULL,
ADD COLUMN `humidity_requirement` VARCHAR(50) DEFAULT NULL,
ADD COLUMN `allergen_info` TEXT DEFAULT NULL,
ADD COLUMN `nutritional_info` JSON DEFAULT NULL,
ADD COLUMN `festive_item` TINYINT(1) DEFAULT 0,
ADD COLUMN `seasonal_item` TINYINT(1) DEFAULT 0,
ADD COLUMN `peak_season_start` DATE DEFAULT NULL,
ADD COLUMN `peak_season_end` DATE DEFAULT NULL,
ADD COLUMN `min_order_qty` DECIMAL(18,6) DEFAULT 1.0,
ADD COLUMN `bulk_order_qty` DECIMAL(18,6) DEFAULT NULL;

-- Add indexes
CREATE INDEX idx_shelf_life ON `tabItem` (`shelf_life_days`);
CREATE INDEX idx_festive_item ON `tabItem` (`festive_item`);
CREATE INDEX idx_seasonal_item ON `tabItem` (`seasonal_item`);
```

### 2.3 Sales Order Table Extensions
```sql
-- Add custom fields to Sales Order doctype
ALTER TABLE `tabSales Order`
ADD COLUMN `order_channel` VARCHAR(140) DEFAULT NULL,
ADD COLUMN `customer_segment` VARCHAR(140) DEFAULT NULL,
ADD COLUMN `pricing_tier` VARCHAR(140) DEFAULT NULL,
ADD COLUMN `credit_approved` TINYINT(1) DEFAULT 0,
ADD COLUMN `credit_approved_by` VARCHAR(140) DEFAULT NULL,
ADD COLUMN `credit_approval_date` DATETIME DEFAULT NULL,
ADD COLUMN `production_priority` VARCHAR(50) DEFAULT 'Normal',
ADD COLUMN `delivery_urgency` VARCHAR(50) DEFAULT 'Standard',
ADD COLUMN `special_instructions` TEXT DEFAULT NULL,
ADD COLUMN `festival_order` TINYINT(1) DEFAULT 0,
ADD COLUMN `bulk_discount_applied` DECIMAL(18,6) DEFAULT 0.0;

-- Add indexes
CREATE INDEX idx_order_channel ON `tabSales Order` (`order_channel`);
CREATE INDEX idx_customer_segment_so ON `tabSales Order` (`customer_segment`);
CREATE INDEX idx_production_priority ON `tabSales Order` (`production_priority`);
```

### 2.4 Stock Entry Table Extensions
```sql
-- Add custom fields to Stock Entry doctype
ALTER TABLE `tabStock Entry`
ADD COLUMN `batch_master` VARCHAR(140) DEFAULT NULL,
ADD COLUMN `quality_status` VARCHAR(50) DEFAULT 'Pending',
ADD COLUMN `expiry_alert_sent` TINYINT(1) DEFAULT 0,
ADD COLUMN `production_partner` VARCHAR(140) DEFAULT NULL,
ADD COLUMN `temperature_maintained` TINYINT(1) DEFAULT 1,
ADD COLUMN `transport_conditions` TEXT DEFAULT NULL;

-- Add indexes
CREATE INDEX idx_batch_master ON `tabStock Entry` (`batch_master`);
CREATE INDEX idx_quality_status ON `tabStock Entry` (`quality_status`);
CREATE INDEX idx_production_partner ON `tabStock Entry` (`production_partner`);
```

---

## 3. WORKFLOW CUSTOMIZATIONS

### 3.1 Sales Order Workflow
```python
# Custom Sales Order Workflow
{
    "workflow_name": "HD Sales Order Workflow",
    "document_type": "Sales Order",
    "is_active": 1,
    "states": [
        {"state": "Draft", "doc_status": 0, "allow_edit": 1},
        {"state": "Credit Check", "doc_status": 0, "allow_edit": 1},
        {"state": "Credit Approved", "doc_status": 0, "allow_edit": 1},
        {"state": "Credit Hold", "doc_status": 0, "allow_edit": 1},
        {"state": "Inventory Check", "doc_status": 0, "allow_edit": 1},
        {"state": "Production Planning", "doc_status": 0, "allow_edit": 1},
        {"state": "To Deliver", "doc_status": 1, "allow_edit": 0},
        {"state": "Quality Check", "doc_status": 1, "allow_edit": 0},
        {"state": "Completed", "doc_status": 1, "allow_edit": 0},
        {"state": "Cancelled", "doc_status": 2, "allow_edit": 0}
    ],
    "transitions": [
        {"state": "Draft", "action": "Submit for Credit Check", "next_state": "Credit Check", "allowed": "Sales User"},
        {"state": "Credit Check", "action": "Approve Credit", "next_state": "Credit Approved", "allowed": "Credit Manager"},
        {"state": "Credit Check", "action": "Credit Hold", "next_state": "Credit Hold", "allowed": "Credit Manager"},
        {"state": "Credit Approved", "action": "Check Inventory", "next_state": "Inventory Check", "allowed": "Stock User"},
        {"state": "Inventory Check", "action": "Plan Production", "next_state": "Production Planning", "allowed": "Production Manager"},
        {"state": "Production Planning", "action": "Submit", "next_state": "To Deliver", "allowed": "Sales Manager"},
        {"state": "To Deliver", "action": "Quality Check", "next_state": "Quality Check", "allowed": "Quality Controller"},
        {"state": "Quality Check", "action": "Complete", "next_state": "Completed", "allowed": "Delivery Manager"}
    ]
}
```

### 3.2 Batch Quality Workflow
```python
# HD Batch Quality Workflow
{
    "workflow_name": "HD Batch Quality Workflow",
    "document_type": "HD Batch Master",
    "is_active": 1,
    "states": [
        {"state": "Created", "doc_status": 0, "allow_edit": 1},
        {"state": "Quality Testing", "doc_status": 0, "allow_edit": 1},
        {"state": "Approved", "doc_status": 1, "allow_edit": 0},
        {"state": "Rejected", "doc_status": 1, "allow_edit": 0},
        {"state": "On Hold", "doc_status": 0, "allow_edit": 1},
        {"state": "Expired", "doc_status": 2, "allow_edit": 0}
    ],
    "transitions": [
        {"state": "Created", "action": "Start Quality Testing", "next_state": "Quality Testing", "allowed": "Quality Controller"},
        {"state": "Quality Testing", "action": "Approve", "next_state": "Approved", "allowed": "Quality Manager"},
        {"state": "Quality Testing", "action": "Reject", "next_state": "Rejected", "allowed": "Quality Manager"},
        {"state": "Quality Testing", "action": "Hold", "next_state": "On Hold", "allowed": "Quality Controller"},
        {"state": "On Hold", "action": "Resume Testing", "next_state": "Quality Testing", "allowed": "Quality Manager"},
        {"state": "Approved", "action": "Mark Expired", "next_state": "Expired", "allowed": "System Manager"}
    ]
}
```

---

## 4. API ENDPOINTS

### 4.1 Customer Management APIs

#### Get Customer Segments
```python
@frappe.whitelist(allow_guest=False)
def get_customer_segments():
    """Get all active customer segments"""
    segments = frappe.get_all("HD Customer Segment",
        filters={"is_active": 1},
        fields=["name", "segment_name", "segment_type", "segment_category", "pricing_tier"])
    return segments

@frappe.whitelist(allow_guest=False)
def get_customer_profile(customer):
    """Get extended customer profile"""
    profile = frappe.get_doc("Customer", customer)
    extended = frappe.get_value("HD Customer Profile Extended",
        {"customer": customer},
        ["customer_segment", "language_preference", "communication_preference",
         "special_requirements", "order_frequency"], as_dict=True)

    return {
        "customer": profile.as_dict(),
        "extended_profile": extended
    }
```

#### Update Customer Segment
```python
@frappe.whitelist(allow_guest=False)
def update_customer_segment(customer, segment):
    """Update customer segment and related settings"""
    # Update customer segment
    frappe.db.set_value("Customer", customer, "customer_segment", segment)

    # Get segment details and update pricing tier
    segment_doc = frappe.get_doc("HD Customer Segment", segment)
    if segment_doc.pricing_tier:
        frappe.db.set_value("Customer", customer, "default_price_list", segment_doc.pricing_tier)

    frappe.db.commit()
    return {"status": "success", "message": "Customer segment updated"}
```

### 4.2 Inventory Management APIs

#### Get Batch Information
```python
@frappe.whitelist(allow_guest=False)
def get_batch_info(item=None, warehouse=None, include_expired=False):
    """Get batch information with expiry details"""
    filters = {"is_active": 1}
    if item:
        filters["item"] = item

    batches = frappe.get_all("HD Batch Master",
        filters=filters,
        fields=["name", "batch_id", "item", "manufacturing_date", "expiry_date",
                "quality_status", "production_partner"])

    # Calculate days to expiry and filter if needed
    for batch in batches:
        from datetime import date
        today = date.today()
        expiry = batch.expiry_date
        batch["days_to_expiry"] = (expiry - today).days if expiry else None
        batch["is_expired"] = batch["days_to_expiry"] < 0 if batch["days_to_expiry"] is not None else False

    if not include_expired:
        batches = [b for b in batches if not b.get("is_expired")]

    return batches

@frappe.whitelist(allow_guest=False)
def get_expiry_alerts(days_ahead=30):
    """Get items expiring within specified days"""
    from datetime import date, timedelta

    end_date = date.today() + timedelta(days=days_ahead)

    alerts = frappe.db.sql("""
        SELECT
            b.item,
            b.batch_id,
            b.expiry_date,
            DATEDIFF(b.expiry_date, CURDATE()) as days_to_expiry,
            SUM(s.actual_qty) as current_stock,
            s.warehouse
        FROM `tabHD Batch Master` b
        LEFT JOIN `tabStock Ledger Entry` s ON b.batch_id = s.batch_no
        WHERE b.expiry_date <= %s
        AND b.expiry_date >= CURDATE()
        AND b.is_active = 1
        GROUP BY b.item, b.batch_id, s.warehouse
        HAVING current_stock > 0
        ORDER BY b.expiry_date
    """, (end_date,), as_dict=True)

    return alerts
```

#### FEFO Stock Allocation
```python
@frappe.whitelist(allow_guest=False)
def allocate_stock_fefo(item, warehouse, required_qty):
    """Allocate stock using First Expired, First Out method"""

    # Get available batches sorted by expiry date
    batches = frappe.db.sql("""
        SELECT
            b.batch_id,
            b.expiry_date,
            SUM(s.actual_qty) as available_qty
        FROM `tabHD Batch Master` b
        LEFT JOIN `tabStock Ledger Entry` s ON b.batch_id = s.batch_no
        WHERE b.item = %s
        AND s.warehouse = %s
        AND b.expiry_date > CURDATE()
        AND b.quality_status = 'Approved'
        AND b.is_active = 1
        GROUP BY b.batch_id
        HAVING available_qty > 0
        ORDER BY b.expiry_date ASC
    """, (item, warehouse), as_dict=True)

    allocations = []
    remaining_qty = required_qty

    for batch in batches:
        if remaining_qty <= 0:
            break

        allocated_qty = min(remaining_qty, batch.available_qty)
        allocations.append({
            "batch_id": batch.batch_id,
            "allocated_qty": allocated_qty,
            "expiry_date": batch.expiry_date
        })
        remaining_qty -= allocated_qty

    return {
        "allocations": allocations,
        "total_allocated": required_qty - remaining_qty,
        "shortage": max(0, remaining_qty)
    }
```

### 4.3 Dynamic Pricing APIs

#### Calculate Dynamic Price
```python
@frappe.whitelist(allow_guest=False)
def calculate_dynamic_price(item, customer, qty=1, order_date=None):
    """Calculate dynamic price based on customer segment and quantity"""
    from datetime import date

    if not order_date:
        order_date = date.today()

    # Get customer segment and pricing tier
    customer_doc = frappe.get_doc("Customer", customer)
    customer_segment = frappe.get_value("HD Customer Profile Extended",
        {"customer": customer}, "customer_segment")

    # Get base price
    base_price = frappe.get_value("Item Price",
        {"item_code": item, "price_list": customer_doc.default_price_list},
        "price_list_rate") or 0

    # Find applicable pricing rules
    pricing_rules = frappe.get_all("HD Dynamic Pricing Rule",
        filters={
            "is_active": 1,
            "valid_from": ["<=", order_date],
            "valid_upto": [">=", order_date]
        },
        fields=["*"])

    applicable_rules = []
    for rule in pricing_rules:
        if (not rule.item or rule.item == item) and \
           (not rule.customer_segment or rule.customer_segment == customer_segment) and \
           (not rule.min_qty or qty >= rule.min_qty) and \
           (not rule.max_qty or qty <= rule.max_qty):
            applicable_rules.append(rule)

    # Sort by priority and apply rules
    applicable_rules.sort(key=lambda x: x.priority)

    final_price = base_price
    discounts_applied = []

    for rule in applicable_rules:
        if rule.rate_or_discount == "Rate":
            final_price = rule.rate
        elif rule.rate_or_discount == "Discount Percentage":
            discount_amount = final_price * (rule.discount_percentage / 100)
            final_price -= discount_amount
            discounts_applied.append({
                "rule": rule.rule_name,
                "type": "Percentage",
                "value": rule.discount_percentage,
                "amount": discount_amount
            })
        elif rule.rate_or_discount == "Discount Amount":
            final_price -= rule.discount_amount
            discounts_applied.append({
                "rule": rule.rule_name,
                "type": "Amount",
                "value": rule.discount_amount,
                "amount": rule.discount_amount
            })

    return {
        "base_price": base_price,
        "final_price": max(0, final_price),
        "total_discount": base_price - final_price,
        "discounts_applied": discounts_applied
    }
```

### 4.4 Order Processing APIs

#### Validate Order
```python
@frappe.whitelist(allow_guest=False)
def validate_order(customer, items, order_channel=None):
    """Comprehensive order validation"""
    validation_results = {
        "valid": True,
        "warnings": [],
        "errors": [],
        "credit_status": {},
        "inventory_status": {},
        "pricing_info": {}
    }

    # Credit limit validation
    credit_limit = frappe.get_value("HD Credit Limit Tracker",
        {"customer": customer},
        ["credit_limit", "outstanding_amount", "available_credit", "credit_status"],
        as_dict=True)

    if credit_limit:
        order_value = sum([item['qty'] * item['rate'] for item in items])

        validation_results["credit_status"] = credit_limit
        validation_results["credit_status"]["order_value"] = order_value

        if credit_limit.credit_status == "Blocked":
            validation_results["valid"] = False
            validation_results["errors"].append("Customer credit is blocked")
        elif order_value > credit_limit.available_credit:
            validation_results["valid"] = False
            validation_results["errors"].append(f"Order value exceeds available credit limit")

    # Inventory validation
    for item in items:
        allocation = allocate_stock_fefo(item['item_code'], item.get('warehouse', 'Main - HD'), item['qty'])
        validation_results["inventory_status"][item['item_code']] = allocation

        if allocation['shortage'] > 0:
            validation_results["warnings"].append(
                f"Insufficient stock for {item['item_code']}. Short by {allocation['shortage']} units")

    # Pricing validation
    for item in items:
        pricing = calculate_dynamic_price(item['item_code'], customer, item['qty'])
        validation_results["pricing_info"][item['item_code']] = pricing

    return validation_results
```

---

## 5. REPORTS & DASHBOARDS

### 5.1 Inventory Reports

#### Expiry Alert Report
```python
def execute(filters=None):
    columns = [
        {"label": "Item", "fieldname": "item", "fieldtype": "Link", "options": "Item", "width": 150},
        {"label": "Batch ID", "fieldname": "batch_id", "fieldtype": "Data", "width": 120},
        {"label": "Warehouse", "fieldname": "warehouse", "fieldtype": "Link", "options": "Warehouse", "width": 120},
        {"label": "Expiry Date", "fieldname": "expiry_date", "fieldtype": "Date", "width": 100},
        {"label": "Days to Expiry", "fieldname": "days_to_expiry", "fieldtype": "Int", "width": 100},
        {"label": "Current Stock", "fieldname": "current_stock", "fieldtype": "Float", "width": 100},
        {"label": "Alert Level", "fieldname": "alert_level", "fieldtype": "Data", "width": 100},
        {"label": "Suggested Action", "fieldname": "suggested_action", "fieldtype": "Data", "width": 150}
    ]

    data = frappe.db.sql("""
        SELECT
            b.item,
            b.batch_id,
            sle.warehouse,
            b.expiry_date,
            DATEDIFF(b.expiry_date, CURDATE()) as days_to_expiry,
            SUM(sle.actual_qty) as current_stock,
            CASE
                WHEN DATEDIFF(b.expiry_date, CURDATE()) < 0 THEN 'Expired'
                WHEN DATEDIFF(b.expiry_date, CURDATE()) <= 7 THEN 'Critical'
                WHEN DATEDIFF(b.expiry_date, CURDATE()) <= 15 THEN 'Warning'
                WHEN DATEDIFF(b.expiry_date, CURDATE()) <= 30 THEN 'Attention'
                ELSE 'Good'
            END as alert_level,
            CASE
                WHEN DATEDIFF(b.expiry_date, CURDATE()) < 0 THEN 'Return/Dispose'
                WHEN DATEDIFF(b.expiry_date, CURDATE()) <= 7 THEN 'Immediate Sale/Discount'
                WHEN DATEDIFF(b.expiry_date, CURDATE()) <= 15 THEN 'Promotional Sale'
                WHEN DATEDIFF(b.expiry_date, CURDATE()) <= 30 THEN 'Priority Sale'
                ELSE 'Regular Sale'
            END as suggested_action
        FROM `tabHD Batch Master` b
        LEFT JOIN `tabStock Ledger Entry` sle ON b.batch_id = sle.batch_no
        WHERE b.is_active = 1
        AND DATEDIFF(b.expiry_date, CURDATE()) <= %(days_ahead)s
        GROUP BY b.item, b.batch_id, sle.warehouse
        HAVING current_stock > 0
        ORDER BY days_to_expiry ASC
    """, {"days_ahead": filters.get("days_ahead", 60)}, as_dict=True)

    return columns, data
```

#### Batch Movement Report
```python
def execute(filters=None):
    columns = [
        {"label": "Date", "fieldname": "movement_date", "fieldtype": "Datetime", "width": 150},
        {"label": "Item", "fieldname": "item", "fieldtype": "Link", "options": "Item", "width": 150},
        {"label": "Batch ID", "fieldname": "batch", "fieldtype": "Data", "width": 120},
        {"label": "Warehouse", "fieldname": "warehouse", "fieldtype": "Link", "options": "Warehouse", "width": 120},
        {"label": "Movement Type", "fieldname": "movement_type", "fieldtype": "Data", "width": 100},
        {"label": "Quantity", "fieldname": "quantity", "fieldtype": "Float", "width": 100},
        {"label": "Balance", "fieldname": "balance_qty", "fieldtype": "Float", "width": 100},
        {"label": "Reference", "fieldname": "reference_doc", "fieldtype": "Dynamic Link", "width": 150}
    ]

    conditions = []
    if filters.get("item"):
        conditions.append("item = %(item)s")
    if filters.get("warehouse"):
        conditions.append("warehouse = %(warehouse)s")
    if filters.get("from_date"):
        conditions.append("DATE(movement_date) >= %(from_date)s")
    if filters.get("to_date"):
        conditions.append("DATE(movement_date) <= %(to_date)s")

    where_clause = " AND ".join(conditions) if conditions else "1=1"

    data = frappe.db.sql(f"""
        SELECT
            movement_date,
            item,
            batch,
            warehouse,
            movement_type,
            quantity,
            balance_qty,
            reference_doc
        FROM `tabHD Stock Movement Tracker`
        WHERE {where_clause}
        ORDER BY movement_date DESC
    """, filters, as_dict=True)

    return columns, data
```

### 5.2 Customer Analytics Reports

#### Customer Segmentation Analysis
```python
def execute(filters=None):
    columns = [
        {"label": "Customer Segment", "fieldname": "segment_name", "fieldtype": "Data", "width": 150},
        {"label": "Total Customers", "fieldname": "customer_count", "fieldtype": "Int", "width": 120},
        {"label": "Active Customers", "fieldname": "active_count", "fieldtype": "Int", "width": 120},
        {"label": "Total Revenue", "fieldname": "total_revenue", "fieldtype": "Currency", "width": 120},
        {"label": "Avg Order Value", "fieldname": "avg_order_value", "fieldtype": "Currency", "width": 120},
        {"label": "Order Frequency", "fieldname": "avg_frequency", "fieldtype": "Float", "width": 120}
    ]

    data = frappe.db.sql("""
        SELECT
            cs.segment_name,
            COUNT(DISTINCT c.name) as customer_count,
            COUNT(DISTINCT CASE WHEN c.disabled = 0 THEN c.name END) as active_count,
            COALESCE(SUM(so.grand_total), 0) as total_revenue,
            COALESCE(AVG(so.grand_total), 0) as avg_order_value,
            COALESCE(COUNT(so.name) / NULLIF(COUNT(DISTINCT c.name), 0), 0) as avg_frequency
        FROM `tabHD Customer Segment` cs
        LEFT JOIN `tabCustomer` c ON c.customer_segment = cs.name
        LEFT JOIN `tabSales Order` so ON so.customer = c.name
            AND so.docstatus = 1
            AND so.transaction_date >= %(from_date)s
            AND so.transaction_date <= %(to_date)s
        WHERE cs.is_active = 1
        GROUP BY cs.name, cs.segment_name
        ORDER BY total_revenue DESC
    """, {
        "from_date": filters.get("from_date"),
        "to_date": filters.get("to_date")
    }, as_dict=True)

    return columns, data
```

### 5.3 Sales Performance Dashboard

#### Sales Dashboard Configuration
```python
{
    "dashboard_name": "HD Sales Performance",
    "charts": [
        {
            "chart_name": "Sales by Customer Segment",
            "chart_type": "pie",
            "source": "HD Customer Segment Sales",
            "filters": {
                "from_date": "30 days ago",
                "to_date": "today"
            }
        },
        {
            "chart_name": "Monthly Sales Trend",
            "chart_type": "line",
            "source": "Monthly Sales Summary",
            "filters": {
                "period": "12 months"
            }
        },
        {
            "chart_name": "Product Category Performance",
            "chart_type": "bar",
            "source": "Product Category Sales",
            "filters": {
                "from_date": "30 days ago",
                "to_date": "today"
            }
        },
        {
            "chart_name": "Order Channel Distribution",
            "chart_type": "donut",
            "source": "Order Channel Analysis",
            "filters": {
                "from_date": "30 days ago",
                "to_date": "today"
            }
        }
    ],
    "number_cards": [
        {
            "label": "Total Sales (This Month)",
            "value": "SUM(grand_total)",
            "source": "Sales Order",
            "filters": {
                "transaction_date": "this month",
                "docstatus": 1
            }
        },
        {
            "label": "Active Customers",
            "value": "COUNT(DISTINCT customer)",
            "source": "Sales Order",
            "filters": {
                "transaction_date": "this month",
                "docstatus": 1
            }
        },
        {
            "label": "Avg Order Value",
            "value": "AVG(grand_total)",
            "source": "Sales Order",
            "filters": {
                "transaction_date": "this month",
                "docstatus": 1
            }
        },
        {
            "label": "Orders This Month",
            "value": "COUNT(*)",
            "source": "Sales Order",
            "filters": {
                "transaction_date": "this month",
                "docstatus": 1
            }
        }
    ]
}
```

---

## 6. MOBILE INTERFACE SPECIFICATIONS

### 6.1 Sales Team Mobile App Requirements

#### Order Entry Form
```javascript
// Mobile-optimized order entry interface
const MobileOrderEntry = {
    fields: [
        {
            fieldname: "customer",
            fieldtype: "Autocomplete",
            label: "Customer",
            options: "searchCustomers",
            required: true,
            mobile_optimized: true
        },
        {
            fieldname: "order_channel",
            fieldtype: "Select",
            label: "Order Channel",
            options: ["Phone", "Field Visit", "WhatsApp"],
            default: "Field Visit"
        },
        {
            fieldname: "items",
            fieldtype: "Table",
            label: "Items",
            mobile_layout: "card",
            fields: [
                {
                    fieldname: "item_code",
                    fieldtype: "Autocomplete",
                    label: "Item",
                    options: "searchItems"
                },
                {
                    fieldname: "qty",
                    fieldtype: "Float",
                    label: "Quantity",
                    input_type: "number",
                    step: 0.001
                },
                {
                    fieldname: "rate",
                    fieldtype: "Currency",
                    label: "Rate",
                    read_only: true
                }
            ]
        },
        {
            fieldname: "delivery_date",
            fieldtype: "Date",
            label: "Delivery Date",
            min_date: "today"
        },
        {
            fieldname: "special_instructions",
            fieldtype: "Textarea",
            label: "Special Instructions",
            rows: 3
        }
    ],
    validation_functions: [
        "validateCustomerCredit",
        "validateInventoryAvailability",
        "calculateDynamicPricing"
    ],
    offline_support: true,
    sync_interval: 300 // 5 minutes
}
```

#### Inventory Check Interface
```javascript
const MobileInventoryCheck = {
    search_interface: {
        type: "barcode_scanner",
        fallback: "text_search",
        fields: ["item_code", "batch_id"]
    },
    display_fields: [
        {
            fieldname: "item_name",
            label: "Item",
            size: "large"
        },
        {
            fieldname: "available_qty",
            label: "Available",
            size: "medium",
            color_coding: {
                red: "< reorder_level",
                yellow: "< 2 * reorder_level",
                green: ">= 2 * reorder_level"
            }
        },
        {
            fieldname: "days_to_expiry",
            label: "Days to Expiry",
            size: "medium",
            color_coding: {
                red: "< 7",
                yellow: "< 30",
                green: ">= 30"
            }
        }
    ],
    quick_actions: [
        "reorder_stock",
        "mark_for_promotion",
        "quality_check"
    ]
}
```

### 6.2 Quality Control Mobile Interface

#### Quality Check Form
```javascript
const MobileQualityCheck = {
    scan_batch: {
        type: "qr_code_scanner",
        auto_populate: ["batch_id", "item", "manufacturing_date", "expiry_date"]
    },
    check_parameters: [
        {
            parameter: "taste_score",
            type: "star_rating",
            max_rating: 5,
            required: true
        },
        {
            parameter: "texture_score",
            type: "star_rating",
            max_rating: 5,
            required: true
        },
        {
            parameter: "appearance_score",
            type: "star_rating",
            max_rating: 5,
            required: true
        },
        {
            parameter: "packaging_score",
            type: "star_rating",
            max_rating: 5,
            required: true
        },
        {
            parameter: "weight_accuracy",
            type: "checkbox",
            label: "Weight matches specification"
        },
        {
            parameter: "photo_capture",
            type: "camera",
            multiple: true,
            max_photos: 5
        },
        {
            parameter: "defects_found",
            type: "textarea",
            placeholder: "Describe any defects found"
        }
    ],
    offline_support: true,
    auto_submit: false
}
```

---

## 7. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Weeks 1-4)
1. **Database Schema Setup**
   - Create custom doctypes
   - Add custom fields to existing doctypes
   - Set up indexes and constraints

2. **Basic Customizations**
   - Customer segmentation setup
   - Batch master implementation
   - Basic quality control workflow

3. **Core APIs**
   - Customer management APIs
   - Basic inventory APIs
   - Simple pricing calculations

### Phase 2: Advanced Features (Weeks 5-8)
1. **Dynamic Pricing Engine**
   - Implement pricing rules
   - Quantity break calculations
   - Customer tier pricing

2. **Advanced Inventory Management**
   - FEFO stock allocation
   - Expiry alert system
   - Quality control integration

3. **Order Processing Workflow**
   - Credit limit validation
   - Multi-channel order entry
   - Production planning integration

### Phase 3: Reporting & Analytics (Weeks 9-10)
1. **Standard Reports**
   - Expiry alert reports
   - Customer segmentation analysis
   - Sales performance reports

2. **Dashboards**
   - Executive dashboard
   - Operations dashboard
   - Quality control dashboard

### Phase 4: Mobile Interface (Weeks 11-12)
1. **Sales Team App**
   - Order entry interface
   - Customer lookup
   - Inventory check

2. **Quality Control App**
   - Mobile quality checks
   - Photo capture
   - Batch scanning

### Phase 5: Integration & Testing (Weeks 13-14)
1. **API Testing**
   - Load testing
   - Integration testing
   - Security testing

2. **User Training**
   - Admin training
   - Sales team training
   - Quality control training

---

## 8. SECURITY & PERMISSIONS

### Role-Based Access Control
```python
# Define custom roles and permissions
CUSTOM_ROLES = {
    "HD Sales Manager": {
        "permissions": [
            "HD Customer Segment:Read,Write,Create",
            "HD Customer Profile Extended:Read,Write,Create",
            "HD Pricing Tier:Read",
            "HD Dynamic Pricing Rule:Read",
            "Sales Order:Read,Write,Create,Submit"
        ]
    },
    "HD Quality Controller": {
        "permissions": [
            "HD Batch Master:Read,Write",
            "HD Quality Check:Read,Write,Create,Submit",
            "HD Stock Movement Tracker:Read",
            "Stock Entry:Read"
        ]
    },
    "HD Inventory Manager": {
        "permissions": [
            "HD Batch Master:Read,Write,Create",
            "HD Stock Movement Tracker:Read,Write,Create",
            "HD Expiry Alert:Read,Write,Create",
            "Stock Entry:Read,Write,Create,Submit"
        ]
    },
    "HD Credit Manager": {
        "permissions": [
            "HD Credit Limit Tracker:Read,Write,Create",
            "Customer:Read,Write",
            "Sales Order:Read,Submit,Cancel"
        ]
    }
}
```

---

## 9. DATA MIGRATION STRATEGY

### Migration Scripts
```python
def migrate_customer_data():
    """Migrate existing customer data to new segment structure"""

    # Create default customer segments
    default_segments = [
        {"segment_name": "Retail Shops", "segment_type": "B2B", "segment_category": "Shops/Retailers"},
        {"segment_name": "Wholesalers", "segment_type": "B2B", "segment_category": "Wholesalers"},
        {"segment_name": "Individual Consumers", "segment_type": "B2C", "segment_category": "Individual Consumers"}
    ]

    for segment in default_segments:
        if not frappe.db.exists("HD Customer Segment", segment["segment_name"]):
            doc = frappe.get_doc({"doctype": "HD Customer Segment", **segment})
            doc.insert()

    # Migrate existing customers
    customers = frappe.get_all("Customer", fields=["name", "customer_group"])

    for customer in customers:
        # Assign default segment based on customer group
        segment_mapping = {
            "Commercial": "Retail Shops",
            "Individual": "Individual Consumers",
            "Distributor": "Wholesalers"
        }

        segment = segment_mapping.get(customer.customer_group, "Individual Consumers")

        # Create extended profile
        if not frappe.db.exists("HD Customer Profile Extended", {"customer": customer.name}):
            profile = frappe.get_doc({
                "doctype": "HD Customer Profile Extended",
                "customer": customer.name,
                "customer_segment": segment,
                "language_preference": "English",
                "communication_preference": "Email"
            })
            profile.insert()

def migrate_inventory_data():
    """Migrate existing stock to batch system"""

    # Get all items with stock
    items_with_stock = frappe.db.sql("""
        SELECT
            item_code,
            warehouse,
            SUM(actual_qty) as total_qty
        FROM `tabStock Ledger Entry`
        WHERE actual_qty > 0
        GROUP BY item_code, warehouse
        HAVING total_qty > 0
    """, as_dict=True)

    for stock in items_with_stock:
        # Create migration batch
        batch_id = f"MIG-{stock.item_code}-{frappe.utils.now_datetime().strftime('%Y%m%d')}"

        if not frappe.db.exists("HD Batch Master", {"batch_id": batch_id}):
            # Get item details
            item = frappe.get_doc("Item", stock.item_code)
            shelf_life = getattr(item, 'shelf_life_days', 365)

            batch = frappe.get_doc({
                "doctype": "HD Batch Master",
                "batch_id": batch_id,
                "item": stock.item_code,
                "manufacturing_date": frappe.utils.add_days(frappe.utils.today(), -30),
                "expiry_date": frappe.utils.add_days(frappe.utils.today(), shelf_life - 30),
                "quality_status": "Approved",
                "batch_size": stock.total_qty,
                "is_active": 1,
                "notes": "Migration batch - existing stock"
            })
            batch.insert()
```

---

This comprehensive specification provides a complete technical roadmap for implementing ERPNext customizations for Harsha Delights' confectionery business. The design focuses on the critical requirements of batch/expiry tracking, customer segmentation, dynamic pricing, and streamlined order processing while maintaining data integrity and scalability.

The implementation can begin immediately with Phase 1, focusing on the foundational database schema and basic customizations, then progressively adding advanced features, reporting capabilities, and mobile interfaces.