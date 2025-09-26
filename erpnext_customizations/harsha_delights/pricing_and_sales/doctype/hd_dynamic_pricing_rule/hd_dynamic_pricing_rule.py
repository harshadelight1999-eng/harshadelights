# Copyright (c) 2024, Harsha Delights and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt, cint, nowdate, getdate, now_datetime, get_time
import json
from datetime import datetime, time

class HDDynamicPricingRule(Document):
    def autoname(self):
        """Generate rule code automatically"""
        if not self.rule_code:
            # Generate rule code: RULE_TYPE-YYYYMMDD-sequence
            rule_type_code = self.rule_type.replace(" ", "").upper()[:4] if self.rule_type else "RULE"
            date_str = nowdate().replace("-", "")
            
            # Get sequence number for the day
            existing_rules = frappe.db.count("HD Dynamic Pricing Rule", {
                "creation": [">=", nowdate()],
                "rule_type": self.rule_type
            })
            
            sequence = str(existing_rules + 1).zfill(3)
            self.rule_code = f"{rule_type_code}-{date_str}-{sequence}"
        
        self.name = self.rule_code

    def validate(self):
        """Validate dynamic pricing rule"""
        self.validate_dates()
        self.validate_conditions()
        self.validate_pricing()
        self.validate_coupon()
        self.set_defaults()
        self.validate_rule_condition()
        
    def validate_dates(self):
        """Validate validity dates"""
        if self.valid_to and self.valid_from:
            if getdate(self.valid_to) < getdate(self.valid_from):
                frappe.throw("Valid To date cannot be before Valid From date")
                
        if self.time_based and self.start_time and self.end_time:
            if get_time(self.start_time) >= get_time(self.end_time):
                frappe.throw("End time must be after start time")
                
    def validate_conditions(self):
        """Validate rule conditions"""
        if self.min_qty and self.max_qty:
            if flt(self.max_qty) <= flt(self.min_qty):
                frappe.throw("Max quantity must be greater than min quantity")
                
        if self.min_amount and self.max_amount:
            if flt(self.max_amount) <= flt(self.min_amount):
                frappe.throw("Max amount must be greater than min amount")
                
    def validate_pricing(self):
        """Validate pricing settings"""
        if self.rate_or_discount == "Rate" and not self.rate:
            frappe.throw("Rate is required when Rate or Discount is set to Rate")
            
        if self.rate_or_discount == "Discount Percentage" and not self.discount_percentage:
            frappe.throw("Discount Percentage is required when Rate or Discount is set to Discount Percentage")
            
        if self.rate_or_discount == "Discount Amount" and not self.discount_amount:
            frappe.throw("Discount Amount is required when Rate or Discount is set to Discount Amount")
            
        if self.discount_percentage and flt(self.discount_percentage) > 100:
            frappe.throw("Discount percentage cannot exceed 100%")
            
    def validate_coupon(self):
        """Validate coupon settings"""
        if self.requires_coupon:
            if not self.coupon_code:
                frappe.throw("Coupon code is required when 'Requires Coupon' is checked")
                
            # Check if coupon code is unique
            existing_rule = frappe.db.exists("HD Dynamic Pricing Rule", {
                "coupon_code": self.coupon_code,
                "name": ["!=", self.name],
                "is_active": 1
            })
            
            if existing_rule:
                frappe.throw(f"Coupon code {self.coupon_code} is already in use")
                
            if self.usage_limit and self.used_count and self.used_count >= self.usage_limit:
                self.is_active = 0
                frappe.msgprint(f"Coupon {self.coupon_code} has reached its usage limit and has been deactivated")
                
    def set_defaults(self):
        """Set default values"""
        if not self.priority:
            self.priority = 1
            
        if not self.created_by:
            self.created_by = frappe.session.user
            
        if self.status == "Draft" and not self.is_new():
            if self.is_active and self.valid_from <= nowdate():
                self.status = "Active"
            elif self.valid_to and getdate(self.valid_to) < getdate(nowdate()):
                self.status = "Expired"
                self.is_active = 0
                
    def validate_rule_condition(self):
        """Validate advanced rule condition"""
        if self.rule_condition:
            try:
                # Test the rule condition with sample data
                test_context = {
                    'customer': 'Test Customer',
                    'item_code': 'Test Item',
                    'qty': 10,
                    'amount': 1000,
                    'customer_group': 'Test Group',
                    'territory': 'Test Territory'
                }
                
                # Safely evaluate the condition
                result = self.evaluate_rule_condition(test_context)
                if not isinstance(result, bool):
                    frappe.throw("Rule condition must return a boolean value")
                    
            except Exception as e:
                frappe.throw(f"Invalid rule condition: {str(e)}")
                
    def evaluate_rule_condition(self, context):
        """Evaluate rule condition with given context"""
        if not self.rule_condition:
            return True
            
        try:
            # Create a safe evaluation environment
            safe_globals = {
                "__builtins__": {},
                "abs": abs,
                "min": min,
                "max": max,
                "round": round,
                "len": len,
                "str": str,
                "int": int,
                "float": float,
                "bool": bool
            }
            
            # Add context variables
            safe_globals.update(context)
            
            # Evaluate the condition
            result = eval(self.rule_condition, safe_globals, {})
            return bool(result)
            
        except Exception as e:
            frappe.log_error(f"Error evaluating rule condition: {str(e)}")
            return False
            
    def on_update(self):
        """Execute after document update"""
        self.update_status()
        self.sync_with_standard_pricing_rules()
        
    def update_status(self):
        """Update rule status based on dates and conditions"""
        current_date = getdate(nowdate())
        
        if self.valid_to and getdate(self.valid_to) < current_date:
            self.db_set("status", "Expired")
            self.db_set("is_active", 0)
        elif self.valid_from and getdate(self.valid_from) > current_date:
            self.db_set("status", "Draft")
        elif self.is_active:
            self.db_set("status", "Active")
        else:
            self.db_set("status", "Inactive")
            
    def sync_with_standard_pricing_rules(self):
        """Sync with ERPNext standard pricing rules"""
        if self.is_active and self.status == "Active":
            self.create_or_update_standard_pricing_rule()
        else:
            self.disable_standard_pricing_rule()
            
    def create_or_update_standard_pricing_rule(self):
        """Create or update standard ERPNext pricing rule"""
        try:
            # Check if standard pricing rule exists
            standard_rule_name = f"HD_{self.rule_code}"
            existing_rule = frappe.db.exists("Pricing Rule", standard_rule_name)
            
            rule_data = {
                "doctype": "Pricing Rule",
                "title": self.rule_name,
                "apply_on": self.apply_on,
                "applicable_for": self.applicable_for,
                "rate_or_discount": self.rate_or_discount,
                "priority": self.priority,
                "valid_from": self.valid_from,
                "valid_upto": self.valid_to,
                "disable": not self.is_active
            }
            
            # Set pricing values
            if self.rate_or_discount == "Rate":
                rule_data["rate"] = self.rate
            elif self.rate_or_discount == "Discount Percentage":
                rule_data["discount_percentage"] = self.discount_percentage
            elif self.rate_or_discount == "Discount Amount":
                rule_data["discount_amount"] = self.discount_amount
                
            # Set applicability
            if self.applicable_for == "Customer Group" and self.customer_group:
                rule_data["customer_group"] = self.customer_group
            elif self.applicable_for == "Territory" and self.territory:
                rule_data["territory"] = self.territory
            elif self.applicable_for == "Item Group" and self.item_group:
                rule_data["item_group"] = self.item_group
                
            # Set conditions
            if self.min_qty:
                rule_data["min_qty"] = self.min_qty
            if self.max_qty:
                rule_data["max_qty"] = self.max_qty
            if self.min_amount:
                rule_data["min_amt"] = self.min_amount
            if self.max_amount:
                rule_data["max_amt"] = self.max_amount
                
            if existing_rule:
                # Update existing rule
                pricing_rule = frappe.get_doc("Pricing Rule", existing_rule)
                pricing_rule.update(rule_data)
                pricing_rule.save()
            else:
                # Create new rule
                rule_data["name"] = standard_rule_name
                pricing_rule = frappe.get_doc(rule_data)
                pricing_rule.insert()
                
        except Exception as e:
            frappe.log_error(f"Error syncing pricing rule: {str(e)}")
            
    def disable_standard_pricing_rule(self):
        """Disable corresponding standard pricing rule"""
        try:
            standard_rule_name = f"HD_{self.rule_code}"
            if frappe.db.exists("Pricing Rule", standard_rule_name):
                frappe.db.set_value("Pricing Rule", standard_rule_name, "disable", 1)
        except Exception as e:
            frappe.log_error(f"Error disabling pricing rule: {str(e)}")
            
    @frappe.whitelist()
    def apply_rule(self, customer, item_code, qty, amount, context=None):
        """Apply pricing rule and return calculated price"""
        if not self.is_rule_applicable(customer, item_code, qty, amount, context):
            return {
                "applicable": False,
                "message": "Rule not applicable"
            }
            
        # Calculate discount/rate
        result = self.calculate_pricing(customer, item_code, qty, amount, context)
        
        # Track usage
        if self.track_usage:
            self.track_rule_usage(customer, item_code, qty, amount, result)
            
        # Update coupon usage if applicable
        if self.requires_coupon:
            self.increment_coupon_usage()
            
        return result
        
    def is_rule_applicable(self, customer, item_code, qty, amount, context=None):
        """Check if rule is applicable for given parameters"""
        # Check active status
        if not self.is_active or self.status != "Active":
            return False
            
        # Check date validity
        current_date = getdate(nowdate())
        if self.valid_from and getdate(self.valid_from) > current_date:
            return False
        if self.valid_to and getdate(self.valid_to) < current_date:
            return False
            
        # Check time validity
        if self.time_based:
            current_time = datetime.now().time()
            start_time = get_time(self.start_time) if self.start_time else time.min
            end_time = get_time(self.end_time) if self.end_time else time.max
            
            if not (start_time <= current_time <= end_time):
                return False
                
        # Check quantity conditions
        if self.min_qty and flt(qty) < flt(self.min_qty):
            return False
        if self.max_qty and flt(qty) > flt(self.max_qty):
            return False
            
        # Check amount conditions
        if self.min_amount and flt(amount) < flt(self.min_amount):
            return False
        if self.max_amount and flt(amount) > flt(self.max_amount):
            return False
            
        # Check applicability
        if not self.check_applicability(customer, item_code):
            return False
            
        # Check advanced rule condition
        if self.rule_condition:
            rule_context = {
                "customer": customer,
                "item_code": item_code,
                "qty": flt(qty),
                "amount": flt(amount)
            }
            
            if context:
                rule_context.update(context)
                
            if not self.evaluate_rule_condition(rule_context):
                return False
                
        # Check coupon validity
        if self.requires_coupon:
            if not context or not context.get("coupon_code"):
                return False
            if context["coupon_code"] != self.coupon_code:
                return False
            if self.usage_limit and self.used_count >= self.usage_limit:
                return False
                
        return True
        
    def check_applicability(self, customer, item_code):
        """Check if rule applies to customer/item combination"""
        if self.applicable_for == "All Customers":
            return True
            
        if self.applicable_for == "Customer":
            return customer == self.apply_on_value
            
        if self.applicable_for == "Customer Group":
            customer_group = frappe.db.get_value("Customer", customer, "customer_group")
            return customer_group == self.customer_group
            
        if self.applicable_for == "Customer Segment":
            # Check if customer belongs to the segment
            segment_assignment = frappe.db.exists("HD Customer Segment Assignment", {
                "customer": customer,
                "customer_segment": self.customer_segment,
                "status": "Active"
            })
            return bool(segment_assignment)
            
        if self.applicable_for == "Territory":
            territory = frappe.db.get_value("Customer", customer, "territory")
            return territory == self.territory
            
        if self.applicable_for == "Item Code":
            return item_code == self.apply_on_value
            
        if self.applicable_for == "Item Group":
            item_group = frappe.db.get_value("Item", item_code, "item_group")
            return item_group == self.item_group
            
        return False
        
    def calculate_pricing(self, customer, item_code, qty, amount, context=None):
        """Calculate final pricing after applying rule"""
        base_rate = self.get_base_rate(item_code, customer)
        
        result = {
            "applicable": True,
            "rule_code": self.rule_code,
            "rule_name": self.rule_name,
            "base_rate": base_rate,
            "quantity": qty,
            "base_amount": base_rate * flt(qty)
        }
        
        # Check for volume discounts first
        if self.volume_discount_enabled and self.volume_slabs:
            volume_discount = self.get_volume_discount(qty)
            if volume_discount:
                result.update(volume_discount)
                return result
        
        # Apply standard pricing
        if self.rate_or_discount == "Rate":
            result["final_rate"] = flt(self.rate)
            result["discount_amount"] = (base_rate - flt(self.rate)) * flt(qty)
            result["discount_percentage"] = ((base_rate - flt(self.rate)) / base_rate) * 100 if base_rate > 0 else 0
            
        elif self.rate_or_discount == "Discount Percentage":
            discount_rate = base_rate * (flt(self.discount_percentage) / 100)
            result["final_rate"] = base_rate - discount_rate
            result["discount_amount"] = discount_rate * flt(qty)
            result["discount_percentage"] = flt(self.discount_percentage)
            
        elif self.rate_or_discount == "Discount Amount":
            result["final_rate"] = max(0, base_rate - flt(self.discount_amount))
            result["discount_amount"] = min(flt(self.discount_amount), base_rate) * flt(qty)
            result["discount_percentage"] = (min(flt(self.discount_amount), base_rate) / base_rate) * 100 if base_rate > 0 else 0
            
        # Apply maximum discount limit
        if self.max_discount_amount and result.get("discount_amount", 0) > self.max_discount_amount:
            result["discount_amount"] = self.max_discount_amount
            result["final_rate"] = base_rate - (self.max_discount_amount / flt(qty))
            result["discount_percentage"] = (self.max_discount_amount / flt(qty) / base_rate) * 100 if base_rate > 0 else 0
            
        # Round if specified
        if self.round_to_nearest and result.get("final_rate"):
            result["final_rate"] = round(result["final_rate"] / self.round_to_nearest) * self.round_to_nearest
            
        result["final_amount"] = result.get("final_rate", base_rate) * flt(qty)
        result["savings"] = result["base_amount"] - result["final_amount"]
        
        return result
        
    def get_volume_discount(self, qty):
        """Get applicable volume discount based on quantity"""
        if not self.volume_slabs:
            return None
            
        applicable_slab = None
        for slab in sorted(self.volume_slabs, key=lambda x: x.min_quantity, reverse=True):
            if flt(qty) >= flt(slab.min_quantity):
                applicable_slab = slab
                break
                
        if not applicable_slab:
            return None
            
        return {
            "volume_slab": applicable_slab.slab_name,
            "discount_percentage": applicable_slab.discount_percentage,
            "discount_amount": applicable_slab.discount_amount,
            "final_rate": applicable_slab.discounted_rate,
            "volume_discount_applied": True
        }
        
    def get_base_rate(self, item_code, customer):
        """Get base rate for item"""
        try:
            # Get from price list
            customer_price_list = frappe.db.get_value("Customer", customer, "default_price_list") or "Standard Selling"
            
            price_list_rate = frappe.db.get_value("Item Price", {
                "item_code": item_code,
                "price_list": customer_price_list,
                "valid_from": ["<=", nowdate()]
            }, "price_list_rate")
            
            if price_list_rate:
                return flt(price_list_rate)
                
            # Fallback to item standard rate
            standard_rate = frappe.db.get_value("Item", item_code, "standard_rate")
            return flt(standard_rate) if standard_rate else 0
            
        except:
            return 0
            
    def track_rule_usage(self, customer, item_code, qty, amount, result):
        """Track rule usage for analytics"""
        try:
            usage_data = {
                "timestamp": now_datetime(),
                "customer": customer,
                "item_code": item_code,
                "quantity": qty,
                "amount": amount,
                "discount_given": result.get("savings", 0),
                "final_amount": result.get("final_amount", amount)
            }
            
            # Update analytics
            current_analytics = json.loads(self.usage_analytics or "[]")
            current_analytics.append(usage_data)
            
            # Keep only last 100 records
            if len(current_analytics) > 100:
                current_analytics = current_analytics[-100:]
                
            self.db_set("usage_analytics", json.dumps(current_analytics))
            
            # Update revenue impact
            current_impact = flt(self.revenue_impact or 0)
            impact_change = result.get("final_amount", amount) - amount  # Negative for discounts
            self.db_set("revenue_impact", current_impact + impact_change)
            
        except Exception as e:
            frappe.log_error(f"Error tracking rule usage: {str(e)}")
            
    def increment_coupon_usage(self):
        """Increment coupon usage count"""
        if self.requires_coupon:
            self.db_set("used_count", (self.used_count or 0) + 1)
            
            # Deactivate if limit reached
            if self.usage_limit and self.used_count >= self.usage_limit:
                self.db_set("is_active", 0)
                self.db_set("status", "Expired")
                
    @frappe.whitelist()
    def get_rule_analytics(self):
        """Get comprehensive rule analytics"""
        analytics = {
            "basic_info": {
                "rule_code": self.rule_code,
                "rule_name": self.rule_name,
                "rule_type": self.rule_type,
                "status": self.status,
                "is_active": self.is_active
            }
        }
        
        # Usage analytics
        if self.usage_analytics:
            usage_data = json.loads(self.usage_analytics)
            analytics["usage_stats"] = {
                "total_uses": len(usage_data),
                "total_savings_given": sum(record.get("discount_given", 0) for record in usage_data),
                "average_discount": sum(record.get("discount_given", 0) for record in usage_data) / len(usage_data) if usage_data else 0,
                "revenue_impact": self.revenue_impact or 0
            }
            
            # Customer breakdown
            customers = {}
            for record in usage_data:
                customer = record["customer"]
                if customer not in customers:
                    customers[customer] = {"uses": 0, "savings": 0}
                customers[customer]["uses"] += 1
                customers[customer]["savings"] += record.get("discount_given", 0)
                
            analytics["top_customers"] = sorted(customers.items(), key=lambda x: x[1]["uses"], reverse=True)[:10]
            
        # Coupon analytics
        if self.requires_coupon:
            analytics["coupon_stats"] = {
                "coupon_code": self.coupon_code,
                "usage_limit": self.usage_limit,
                "used_count": self.used_count,
                "remaining_uses": (self.usage_limit - (self.used_count or 0)) if self.usage_limit else "Unlimited"
            }
            
        return analytics