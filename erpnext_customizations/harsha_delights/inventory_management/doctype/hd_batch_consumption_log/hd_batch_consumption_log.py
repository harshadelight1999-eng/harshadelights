# Copyright (c) 2024, Harsha Delights and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt, nowdate

class HDBatchConsumptionLog(Document):
    def validate(self):
        """Validate batch consumption log"""
        self.set_batch_details()
        self.calculate_total_value()
        self.validate_consumption_qty()
        
    def set_batch_details(self):
        """Set batch-related details"""
        if self.batch_id:
            batch_doc = frappe.get_doc("HD Batch Master", self.batch_id)
            self.item_code = batch_doc.item
            self.item_name = batch_doc.item_name
            self.warehouse = batch_doc.warehouse
            self.batch_expiry_date = batch_doc.expiry_date
            self.unit_rate = batch_doc.unit_cost
            
    def calculate_total_value(self):
        """Calculate total consumption value"""
        self.total_value = flt(self.qty_consumed) * flt(self.unit_rate)
        
    def validate_consumption_qty(self):
        """Validate consumption quantity against available quantity"""
        if self.batch_id:
            batch_doc = frappe.get_doc("HD Batch Master", self.batch_id)
            if flt(self.qty_consumed) > flt(batch_doc.available_qty):
                frappe.throw(f"Cannot consume {self.qty_consumed}. Only {batch_doc.available_qty} available in batch {self.batch_id}")
                
    def on_submit(self):
        """Execute after document submission"""
        self.update_batch_quantity()
        self.create_stock_ledger_entry()
        
    def update_batch_quantity(self):
        """Update batch available quantity"""
        if self.batch_id:
            batch_doc = frappe.get_doc("HD Batch Master", self.batch_id)
            new_qty = flt(batch_doc.available_qty) - flt(self.qty_consumed)
            batch_doc.available_qty = new_qty
            
            # Update remaining quantity in log
            self.remaining_qty = new_qty
            
            # Update batch status if fully consumed
            if new_qty <= 0:
                batch_doc.status = "Consumed"
                
            batch_doc.save()
            
    def create_stock_ledger_entry(self):
        """Create stock ledger entry for consumption"""
        try:
            # This would typically create a stock ledger entry
            # For now, we'll log the consumption
            frappe.log_error(
                f"Batch consumption: {self.batch_id} - {self.qty_consumed} consumed for {self.consumption_type}",
                "Batch Consumption Tracking"
            )
            
        except Exception as e:
            frappe.log_error(f"Error creating stock ledger entry: {str(e)}")
            
    def on_cancel(self):
        """Execute when document is cancelled"""
        self.reverse_batch_quantity()
        
    def reverse_batch_quantity(self):
        """Reverse batch quantity update"""
        if self.batch_id:
            batch_doc = frappe.get_doc("HD Batch Master", self.batch_id)
            new_qty = flt(batch_doc.available_qty) + flt(self.qty_consumed)
            batch_doc.available_qty = new_qty
            
            # Reactivate batch if it was consumed
            if batch_doc.status == "Consumed" and new_qty > 0:
                batch_doc.status = "Active"
                
            batch_doc.save()