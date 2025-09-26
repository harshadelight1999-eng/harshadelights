# Copyright (c) 2024, Harsha Delights and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt, getdate, nowdate

class HDVolumeDiscountSlab(Document):
    def validate(self):
        """Validate volume discount slab"""
        self.validate_quantity_range()
        self.validate_discount_settings()
        self.validate_dates()
        self.set_defaults()
        
    def validate_quantity_range(self):
        """Validate quantity range"""
        if self.min_quantity <= 0:
            frappe.throw("Minimum quantity must be greater than 0")
            
        if self.max_quantity and flt(self.max_quantity) <= flt(self.min_quantity):
            frappe.throw("Maximum quantity must be greater than minimum quantity")
            
    def validate_discount_settings(self):
        """Validate discount settings based on type"""
        if self.discount_type == "Percentage":
            if not self.discount_percentage:
                frappe.throw("Discount percentage is required for Percentage type")
            if flt(self.discount_percentage) <= 0 or flt(self.discount_percentage) > 100:
                frappe.throw("Discount percentage must be between 0 and 100")
                
        elif self.discount_type == "Fixed Amount":
            if not self.discount_amount:
                frappe.throw("Discount amount is required for Fixed Amount type")
            if flt(self.discount_amount) <= 0:
                frappe.throw("Discount amount must be greater than 0")
                
        elif self.discount_type == "Fixed Rate":
            if not self.discounted_rate:
                frappe.throw("Fixed rate is required for Fixed Rate type")
            if flt(self.discounted_rate) <= 0:
                frappe.throw("Fixed rate must be greater than 0")
                
    def validate_dates(self):
        """Validate effective dates"""
        if self.effective_to and self.effective_from:
            if getdate(self.effective_to) < getdate(self.effective_from):
                frappe.throw("Effective To date cannot be before Effective From date")
                
    def set_defaults(self):
        """Set default values"""
        if not self.sort_order:
            self.sort_order = flt(self.min_quantity)
            
        if not self.slab_name:
            if self.max_quantity:
                self.slab_name = f"{self.min_quantity}-{self.max_quantity} units"
            else:
                self.slab_name = f"{self.min_quantity}+ units"
                
    def is_quantity_applicable(self, qty):
        """Check if given quantity falls within this slab"""
        if not self.is_active:
            return False
            
        # Check date validity
        if self.effective_from and getdate(self.effective_from) > getdate(nowdate()):
            return False
        if self.effective_to and getdate(self.effective_to) < getdate(nowdate()):
            return False
            
        # Check quantity range
        if flt(qty) < flt(self.min_quantity):
            return False
            
        if self.max_quantity and flt(qty) > flt(self.max_quantity):
            return False
            
        return True
        
    def calculate_discount(self, base_rate, qty):
        """Calculate discount for given rate and quantity"""
        if not self.is_quantity_applicable(qty):
            return {
                "applicable": False,
                "discount_amount": 0,
                "discounted_rate": base_rate,
                "total_discount": 0
            }
            
        discount_amount = 0
        discounted_rate = base_rate
        
        if self.discount_type == "Percentage":
            discount_amount = base_rate * (flt(self.discount_percentage) / 100)
            discounted_rate = base_rate - discount_amount
            
        elif self.discount_type == "Fixed Amount":
            discount_amount = min(flt(self.discount_amount), base_rate)
            discounted_rate = base_rate - discount_amount
            
        elif self.discount_type == "Fixed Rate":
            discounted_rate = flt(self.discounted_rate)
            discount_amount = max(0, base_rate - discounted_rate)
            
        total_discount = discount_amount * flt(qty)
        
        return {
            "applicable": True,
            "slab_name": self.slab_name,
            "discount_type": self.discount_type,
            "discount_amount": discount_amount,
            "discounted_rate": max(0, discounted_rate),
            "total_discount": total_discount,
            "savings_per_unit": discount_amount,
            "final_amount": max(0, discounted_rate) * flt(qty)
        }
        
    def get_slab_summary(self):
        """Get summary information about this slab"""
        return {
            "slab_name": self.slab_name,
            "min_quantity": self.min_quantity,
            "max_quantity": self.max_quantity,
            "discount_type": self.discount_type,
            "discount_value": self.discount_percentage or self.discount_amount or self.discounted_rate,
            "is_active": self.is_active,
            "sort_order": self.sort_order
        }