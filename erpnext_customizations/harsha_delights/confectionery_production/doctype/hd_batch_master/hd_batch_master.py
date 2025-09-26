# Copyright (c) 2024, Harsha Delights and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import cint, flt, getdate, add_days, nowdate
from datetime import datetime, timedelta

class HDBatchMaster(Document):
    def autoname(self):
        """Generate batch ID automatically"""
        if not self.batch_id:
            # Generate batch ID: ITEM_CODE-YYYYMMDD-sequence
            item_code = self.item.replace(" ", "").upper()[:6] if self.item else "BATCH"
            date_str = getdate(self.manufacturing_date).strftime("%Y%m%d")
            
            # Get sequence number for the day
            existing_batches = frappe.db.count("HD Batch Master", {
                "manufacturing_date": self.manufacturing_date,
                "item": self.item
            })
            
            sequence = str(existing_batches + 1).zfill(3)
            self.batch_id = f"{item_code}-{date_str}-{sequence}"
        
        self.name = self.batch_id

    def validate(self):
        """Validate batch master data"""
        self.validate_dates()
        self.calculate_shelf_life()
        self.validate_quantities()
        self.validate_quality_parameters()
        self.set_default_status()
        self.auto_set_next_inspection()
        
    def validate_dates(self):
        """Validate manufacturing and expiry dates"""
        manufacturing_date = getdate(self.manufacturing_date)
        expiry_date = getdate(self.expiry_date)
        
        if manufacturing_date > getdate(nowdate()):
            frappe.throw("Manufacturing date cannot be in the future")
            
        if expiry_date <= manufacturing_date:
            frappe.throw("Expiry date must be after manufacturing date")
            
    def calculate_shelf_life(self):
        """Calculate shelf life in days"""
        if self.manufacturing_date and self.expiry_date:
            manufacturing_date = getdate(self.manufacturing_date)
            expiry_date = getdate(self.expiry_date)
            self.shelf_life_days = (expiry_date - manufacturing_date).days
    
    def validate_quantities(self):
        """Validate batch quantities"""
        if flt(self.available_qty) > flt(self.batch_qty):
            frappe.throw("Available quantity cannot exceed batch quantity")
            
        if flt(self.batch_qty) <= 0:
            frappe.throw("Batch quantity must be greater than zero")
            
    def validate_quality_parameters(self):
        """Validate quality parameters based on item type"""
        # Get item details to check item group
        if self.item:
            item_doc = frappe.get_doc("Item", self.item)
            item_group = item_doc.item_group
            
            # Validate based on confectionery type
            if "Sweets" in item_group or "Desserts" in item_group:
                if self.sugar_content_percentage and (self.sugar_content_percentage < 10 or self.sugar_content_percentage > 80):
                    frappe.throw("Sugar content for sweets should be between 10% and 80%")
                    
            if "Chocolates" in item_group:
                if self.fat_content_percentage and (self.fat_content_percentage < 20 or self.fat_content_percentage > 60):
                    frappe.throw("Fat content for chocolates should be between 20% and 60%")
                    
            # General moisture content validation
            if self.moisture_content_percentage and self.moisture_content_percentage > 25:
                frappe.throw("Moisture content should not exceed 25% for confectionery items")
                
    def set_default_status(self):
        """Set default status based on quality grade and expiry"""
        if not self.status:
            if self.quality_grade in ["A+", "A", "B+"]:
                self.status = "Active"
            elif self.quality_grade == "B":
                self.status = "Quarantine"
            else:
                self.status = "Rejected"
                
        # Auto-expire batches
        if getdate(self.expiry_date) <= getdate(nowdate()):
            self.status = "Expired"
            
    def auto_set_next_inspection(self):
        """Set next inspection date based on item characteristics"""
        if not self.next_inspection_date and self.manufacturing_date:
            # Get item details
            if self.item:
                item_doc = frappe.get_doc("Item", self.item)
                
                # Set inspection frequency based on shelf life
                if self.shelf_life_days:
                    if self.shelf_life_days <= 7:  # Highly perishable
                        inspection_days = 1
                    elif self.shelf_life_days <= 30:  # Moderately perishable
                        inspection_days = 3
                    else:  # Stable products
                        inspection_days = 7
                        
                    self.next_inspection_date = add_days(self.manufacturing_date, inspection_days)
                    
    def on_update(self):
        """Execute after document update"""
        self.update_stock_entries()
        self.create_alerts()
        
    def update_stock_entries(self):
        """Update related stock entries with batch information"""
        # This would typically update Stock Ledger Entry with batch details
        pass
        
    def create_alerts(self):
        """Create alerts for expiring batches or quality issues"""
        # Create expiry alerts
        days_to_expiry = (getdate(self.expiry_date) - getdate(nowdate())).days
        
        if days_to_expiry <= 7 and self.status == "Active":
            self.create_notification(
                subject=f"Batch {self.batch_id} expiring in {days_to_expiry} days",
                message=f"Batch {self.batch_id} for item {self.item_name} is expiring on {self.expiry_date}",
                alert_type="Expiry Warning"
            )
            
        # Create quality alerts
        if self.quality_grade in ["C", "Reject"]:
            self.create_notification(
                subject=f"Quality issue with batch {self.batch_id}",
                message=f"Batch {self.batch_id} has quality grade {self.quality_grade}",
                alert_type="Quality Alert"
            )
            
    def create_notification(self, subject, message, alert_type):
        """Create system notification"""
        try:
            # Create notification for relevant users
            users_to_notify = []
            
            if alert_type == "Expiry Warning":
                users_to_notify = frappe.get_all("Has Role", 
                    filters={"role": ["in", ["Quality Manager", "Stock Manager"]]},
                    pluck="parent"
                )
            elif alert_type == "Quality Alert":
                users_to_notify = frappe.get_all("Has Role", 
                    filters={"role": "Quality Manager"},
                    pluck="parent"
                )
                
            for user in users_to_notify:
                frappe.share.add("HD Batch Master", self.name, user, notify=1)
                
                # Create ToDo for urgent actions
                if days_to_expiry <= 3 or self.quality_grade == "Reject":
                    frappe.get_doc({
                        "doctype": "ToDo",
                        "description": message,
                        "priority": "High" if days_to_expiry <= 1 else "Medium",
                        "status": "Open",
                        "allocated_to": user,
                        "reference_type": "HD Batch Master",
                        "reference_name": self.name
                    }).insert(ignore_permissions=True)
                    
        except Exception as e:
            frappe.log_error(f"Error creating notification: {str(e)}", "Batch Master Notification Error")

    @frappe.whitelist()
    def consume_quantity(self, qty_consumed, consumption_type="Sale"):
        """Consume quantity from batch"""
        qty_consumed = flt(qty_consumed)
        
        if qty_consumed <= 0:
            frappe.throw("Consumption quantity must be greater than zero")
            
        if qty_consumed > self.available_qty:
            frappe.throw(f"Cannot consume {qty_consumed}. Only {self.available_qty} available in batch")
            
        # Update available quantity
        self.available_qty = flt(self.available_qty) - qty_consumed
        
        # Update status if fully consumed
        if self.available_qty <= 0:
            self.status = "Consumed"
            
        self.save()
        
        # Log consumption
        frappe.get_doc({
            "doctype": "HD Batch Consumption Log",
            "batch_id": self.name,
            "consumption_date": nowdate(),
            "qty_consumed": qty_consumed,
            "consumption_type": consumption_type,
            "consumed_by": frappe.session.user
        }).insert(ignore_permissions=True)
        
        return {"success": True, "remaining_qty": self.available_qty}

    @frappe.whitelist()
    def quality_inspection(self, inspection_data):
        """Record quality inspection results"""
        inspection_doc = frappe.get_doc({
            "doctype": "HD Quality Inspection",
            "batch_id": self.name,
            "inspection_date": nowdate(),
            "inspector": frappe.session.user,
            "inspection_type": "Periodic",
            **inspection_data
        })
        
        inspection_doc.insert()
        
        # Update batch with new quality data
        self.last_inspection_date = nowdate()
        self.next_inspection_date = add_days(nowdate(), 7)  # Default 7 days
        
        # Update quality parameters if provided
        if inspection_data.get("quality_grade"):
            self.quality_grade = inspection_data.get("quality_grade")
            
        if inspection_data.get("status"):
            self.status = inspection_data.get("status")
            
        self.save()
        
        return {"success": True, "inspection_id": inspection_doc.name}

    def get_days_to_expiry(self):
        """Get remaining days until expiry"""
        if self.expiry_date:
            return (getdate(self.expiry_date) - getdate(nowdate())).days
        return 0

    def get_consumption_history(self):
        """Get batch consumption history"""
        return frappe.get_all("HD Batch Consumption Log",
            filters={"batch_id": self.name},
            fields=["consumption_date", "qty_consumed", "consumption_type", "consumed_by"],
            order_by="consumption_date desc"
        )