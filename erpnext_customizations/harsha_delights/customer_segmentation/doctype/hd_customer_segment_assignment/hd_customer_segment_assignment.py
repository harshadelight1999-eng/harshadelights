# Copyright (c) 2024, Harsha Delights and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt, getdate, nowdate, add_days

class HDCustomerSegmentAssignment(Document):
    def validate(self):
        """Validate customer segment assignment"""
        self.set_names()
        self.validate_dates()
        self.validate_primary_segment()
        self.set_effective_dates()
        self.capture_assignment_metrics()
        
    def set_names(self):
        """Set customer and segment names"""
        if self.customer:
            self.customer_name = frappe.db.get_value("Customer", self.customer, "customer_name")
            
        if self.customer_segment:
            self.segment_name = frappe.db.get_value("HD Customer Segment", self.customer_segment, "segment_name")
            
    def validate_dates(self):
        """Validate assignment dates"""
        if self.effective_from and self.effective_to:
            if getdate(self.effective_to) <= getdate(self.effective_from):
                frappe.throw("Effective To date must be after Effective From date")
                
        if self.assignment_date and self.effective_from:
            if getdate(self.effective_from) < getdate(self.assignment_date):
                frappe.throw("Effective From date cannot be before Assignment Date")
                
    def validate_primary_segment(self):
        """Validate primary segment assignment"""
        if self.is_primary and self.status == "Active":
            # Check if customer already has another primary segment
            existing_primary = frappe.db.exists("HD Customer Segment Assignment", {
                "customer": self.customer,
                "is_primary": 1,
                "status": "Active",
                "name": ["!=", self.name]
            })
            
            if existing_primary:
                # Deactivate the previous primary segment
                frappe.db.set_value("HD Customer Segment Assignment", 
                    existing_primary, "is_primary", 0)
                    
    def set_effective_dates(self):
        """Set default effective dates"""
        if not self.effective_from:
            self.effective_from = self.assignment_date
            
        if not self.review_date:
            # Get review frequency from segment
            segment_doc = frappe.get_doc("HD Customer Segment", self.customer_segment)
            review_days = segment_doc.review_frequency_days or 90  # Default 90 days
            self.review_date = add_days(self.assignment_date, review_days)
            
    def capture_assignment_metrics(self):
        """Capture customer metrics at the time of assignment"""
        if self.is_new():
            self.annual_purchase_at_assignment = self.get_customer_annual_purchase()
            self.order_frequency_at_assignment = self.get_customer_order_frequency()
            self.credit_limit_at_assignment = self.get_customer_credit_limit()
            
    def get_customer_annual_purchase(self):
        """Get customer's annual purchase amount"""
        result = frappe.db.sql("""
            SELECT COALESCE(SUM(grand_total), 0) as annual_purchase
            FROM `tabSales Invoice` 
            WHERE customer = %s 
            AND posting_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            AND docstatus = 1
        """, [self.customer])
        
        return result[0][0] if result else 0
        
    def get_customer_order_frequency(self):
        """Get customer's order frequency (orders per month)"""
        result = frappe.db.sql("""
            SELECT COUNT(*) as order_count
            FROM `tabSales Order` 
            WHERE customer = %s 
            AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            AND docstatus = 1
        """, [self.customer])
        
        return (result[0][0] / 12) if result else 0
        
    def get_customer_credit_limit(self):
        """Get customer's current credit limit"""
        return frappe.db.get_value("Customer", self.customer, "credit_limit") or 0
        
    def on_update(self):
        """Execute after document update"""
        self.update_customer_segment_benefits()
        self.create_pricing_rules()
        
    def update_customer_segment_benefits(self):
        """Update customer with segment benefits"""
        if self.status == "Active" and self.is_primary:
            segment_doc = frappe.get_doc("HD Customer Segment", self.customer_segment)
            customer_doc = frappe.get_doc("Customer", self.customer)
            
            # Update credit limit
            if segment_doc.credit_limit_multiplier:
                base_credit_limit = self.credit_limit_at_assignment or 100000  # Default base limit
                new_credit_limit = base_credit_limit * flt(segment_doc.credit_limit_multiplier)
                customer_doc.db_set("credit_limit", new_credit_limit)
                
            # Update payment terms
            if segment_doc.payment_terms:
                customer_doc.db_set("payment_terms", segment_doc.payment_terms)
                
            # Update default discount
            if segment_doc.discount_percentage:
                self.discount_percentage_applied = segment_doc.discount_percentage
                
            # Mark special pricing
            if segment_doc.special_pricing_enabled:
                self.special_pricing_applied = 1
                
    def create_pricing_rules(self):
        """Create pricing rules for the customer segment"""
        if self.status == "Active":
            segment_doc = frappe.get_doc("HD Customer Segment", self.customer_segment)
            
            # Create pricing rule if segment has discount
            if segment_doc.discount_percentage:
                pricing_rule_name = f"Segment_{segment_doc.segment_code}_{self.customer}"
                
                # Check if pricing rule already exists
                existing_rule = frappe.db.exists("Pricing Rule", pricing_rule_name)
                
                if not existing_rule:
                    pricing_rule = frappe.get_doc({
                        "doctype": "Pricing Rule",
                        "name": pricing_rule_name,
                        "title": f"{segment_doc.segment_name} - {self.customer_name}",
                        "apply_on": "Customer",
                        "customer": self.customer,
                        "rate_or_discount": "Discount Percentage",
                        "discount_percentage": segment_doc.discount_percentage,
                        "valid_from": self.effective_from,
                        "valid_upto": self.effective_to,
                        "priority": segment_doc.priority or 1,
                        "disable": 0
                    })
                    pricing_rule.insert(ignore_permissions=True)
                    
    @frappe.whitelist()
    def review_assignment(self, review_notes=None):
        """Review the customer segment assignment"""
        segment_doc = frappe.get_doc("HD Customer Segment", self.customer_segment)
        
        # Check if customer still qualifies
        if segment_doc.customer_qualifies_for_segment(self.customer):
            # Customer still qualifies, extend review date
            review_days = segment_doc.review_frequency_days or 90
            self.review_date = add_days(nowdate(), review_days)
            self.status = "Active"
            
            if review_notes:
                self.review_notes = (self.review_notes or "") + f"\n{nowdate()}: {review_notes}"
                
        else:
            # Customer no longer qualifies
            self.status = "Pending Review"
            if review_notes:
                self.review_notes = (self.review_notes or "") + f"\n{nowdate()}: Customer no longer qualifies. {review_notes}"
                
        self.save()
        
        return {
            "success": True,
            "status": self.status,
            "message": f"Assignment review completed. Status: {self.status}"
        }
        
    @frappe.whitelist()
    def deactivate_assignment(self, reason=None):
        """Deactivate the customer segment assignment"""
        self.status = "Inactive"
        self.effective_to = nowdate()
        
        if reason:
            self.review_notes = (self.review_notes or "") + f"\n{nowdate()}: Deactivated - {reason}"
            
        # Disable related pricing rules
        pricing_rule_name = f"Segment_{self.customer_segment}_{self.customer}"
        if frappe.db.exists("Pricing Rule", pricing_rule_name):
            frappe.db.set_value("Pricing Rule", pricing_rule_name, "disable", 1)
            
        self.save()
        
        return {
            "success": True,
            "message": "Customer segment assignment deactivated successfully"
        }
        
    @frappe.whitelist()
    def get_assignment_analytics(self):
        """Get analytics for this assignment"""
        analytics = {}
        
        # Revenue since assignment
        revenue_data = frappe.db.sql("""
            SELECT 
                COALESCE(SUM(grand_total), 0) as total_revenue,
                COALESCE(AVG(grand_total), 0) as avg_order_value,
                COUNT(*) as order_count
            FROM `tabSales Invoice`
            WHERE customer = %s
            AND posting_date >= %s
            AND docstatus = 1
        """, [self.customer, self.assignment_date], as_dict=True)
        
        if revenue_data:
            analytics.update(revenue_data[0])
        else:
            analytics.update({"total_revenue": 0, "avg_order_value": 0, "order_count": 0})
            
        # Calculate growth metrics
        if self.annual_purchase_at_assignment > 0:
            current_annual_purchase = self.get_customer_annual_purchase()
            analytics["revenue_growth_percent"] = ((current_annual_purchase - self.annual_purchase_at_assignment) / self.annual_purchase_at_assignment) * 100
        else:
            analytics["revenue_growth_percent"] = 0
            
        # Order frequency comparison
        current_order_frequency = self.get_customer_order_frequency()
        if self.order_frequency_at_assignment > 0:
            analytics["frequency_growth_percent"] = ((current_order_frequency - self.order_frequency_at_assignment) / self.order_frequency_at_assignment) * 100
        else:
            analytics["frequency_growth_percent"] = 0
            
        # Days in segment
        analytics["days_in_segment"] = (getdate(nowdate()) - getdate(self.assignment_date)).days
        
        return analytics
        
    def on_cancel(self):
        """Execute when assignment is cancelled"""
        self.deactivate_assignment("Assignment cancelled")