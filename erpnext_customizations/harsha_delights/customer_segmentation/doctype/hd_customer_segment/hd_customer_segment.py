# Copyright (c) 2024, Harsha Delights and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt, cint, nowdate, getdate, add_days
import json

class HDCustomerSegment(Document):
    def validate(self):
        """Validate customer segment data"""
        self.validate_dates()
        self.validate_hierarchy()
        self.validate_auto_assignment_rules()
        self.set_default_priority()
        
    def validate_dates(self):
        """Validate validity dates"""
        if self.validity_from and self.validity_to:
            if getdate(self.validity_to) <= getdate(self.validity_from):
                frappe.throw("Valid To date must be after Valid From date")
                
    def validate_hierarchy(self):
        """Validate segment hierarchy"""
        if self.escalation_segment == self.name:
            frappe.throw("Escalation segment cannot be the same as current segment")
            
        if self.demotion_segment == self.name:
            frappe.throw("Demotion segment cannot be the same as current segment")
            
    def validate_auto_assignment_rules(self):
        """Validate auto assignment rules JSON"""
        if self.auto_assignment_enabled and self.auto_assignment_rules:
            try:
                rules = json.loads(self.auto_assignment_rules)
                self.validate_rule_structure(rules)
            except json.JSONDecodeError:
                frappe.throw("Auto assignment rules must be valid JSON")
                
    def validate_rule_structure(self, rules):
        """Validate the structure of assignment rules"""
        required_fields = ["conditions", "logic"]
        
        if not isinstance(rules, dict):
            frappe.throw("Auto assignment rules must be a JSON object")
            
        for field in required_fields:
            if field not in rules:
                frappe.throw(f"Missing required field '{field}' in auto assignment rules")
                
    def set_default_priority(self):
        """Set default priority if not provided"""
        if not self.priority:
            # Set priority based on segment type
            priority_map = {
                "Volume Based": 80,
                "Value Based": 90,
                "Geographic": 60,
                "Behavioral": 70,
                "Loyalty Based": 85,
                "Custom": 50
            }
            self.priority = priority_map.get(self.segment_type, 50)
            
    @frappe.whitelist()
    def assign_customers(self, customer_list=None):
        """Assign customers to this segment"""
        if not customer_list:
            # Auto-assign based on rules
            customer_list = self.find_eligible_customers()
            
        assignments_created = 0
        for customer in customer_list:
            if self.create_customer_assignment(customer):
                assignments_created += 1
                
        return {
            "success": True,
            "assignments_created": assignments_created,
            "message": f"Successfully assigned {assignments_created} customers to segment {self.segment_name}"
        }
        
    def find_eligible_customers(self):
        """Find customers eligible for this segment based on auto assignment rules"""
        if not self.auto_assignment_enabled or not self.auto_assignment_rules:
            return []
            
        try:
            rules = json.loads(self.auto_assignment_rules)
            return self.evaluate_assignment_rules(rules)
        except Exception as e:
            frappe.log_error(f"Error in finding eligible customers: {str(e)}")
            return []
            
    def evaluate_assignment_rules(self, rules):
        """Evaluate assignment rules and return eligible customers"""
        conditions = rules.get("conditions", [])
        logic = rules.get("logic", "AND")  # AND or OR
        
        base_query = """
            SELECT DISTINCT c.name as customer
            FROM `tabCustomer` c
            LEFT JOIN `tabSales Order` so ON so.customer = c.name
            LEFT JOIN `tabSales Invoice` si ON si.customer = c.name
            WHERE c.disabled = 0
        """
        
        where_conditions = []
        params = []
        
        for condition in conditions:
            condition_sql, condition_params = self.build_condition_sql(condition)
            if condition_sql:
                where_conditions.append(condition_sql)
                params.extend(condition_params)
                
        if where_conditions:
            logic_operator = " OR " if logic.upper() == "OR" else " AND "
            base_query += " AND (" + logic_operator.join(where_conditions) + ")"
            
        # Add segment-specific filters
        if self.min_annual_purchase:
            base_query += """
                AND c.name IN (
                    SELECT customer 
                    FROM `tabSales Invoice` 
                    WHERE posting_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                    AND docstatus = 1
                    GROUP BY customer 
                    HAVING SUM(grand_total) >= %s
                )
            """
            params.append(self.min_annual_purchase)
            
        if self.geographic_restriction:
            base_query += " AND c.territory = %s"
            params.append(self.geographic_restriction)
            
        try:
            result = frappe.db.sql(base_query, params, as_dict=True)
            return [row["customer"] for row in result]
        except Exception as e:
            frappe.log_error(f"Error executing customer query: {str(e)}")
            return []
            
    def build_condition_sql(self, condition):
        """Build SQL condition from rule condition"""
        field = condition.get("field")
        operator = condition.get("operator")
        value = condition.get("value")
        
        if not all([field, operator, value]):
            return "", []
            
        field_mapping = {
            "annual_purchase": """
                (SELECT COALESCE(SUM(grand_total), 0) 
                 FROM `tabSales Invoice` si2 
                 WHERE si2.customer = c.name 
                 AND si2.posting_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                 AND si2.docstatus = 1)
            """,
            "total_orders": """
                (SELECT COUNT(*) 
                 FROM `tabSales Order` so2 
                 WHERE so2.customer = c.name 
                 AND so2.transaction_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
                 AND so2.docstatus = 1)
            """,
            "customer_group": "c.customer_group",
            "territory": "c.territory",
            "creation_date": "c.creation"
        }
        
        if field not in field_mapping:
            return "", []
            
        sql_field = field_mapping[field]
        
        if operator == ">=":
            return f"{sql_field} >= %s", [value]
        elif operator == "<=":
            return f"{sql_field} <= %s", [value]
        elif operator == "=":
            return f"{sql_field} = %s", [value]
        elif operator == "IN":
            placeholders = ",".join(["%s"] * len(value))
            return f"{sql_field} IN ({placeholders})", value
        elif operator == "BETWEEN":
            return f"{sql_field} BETWEEN %s AND %s", [value[0], value[1]]
            
        return "", []
        
    def create_customer_assignment(self, customer):
        """Create customer segment assignment"""
        try:
            # Check if assignment already exists
            existing = frappe.db.exists("HD Customer Segment Assignment", {
                "customer": customer,
                "customer_segment": self.name,
                "status": "Active"
            })
            
            if existing:
                return False
                
            # Create new assignment
            assignment = frappe.get_doc({
                "doctype": "HD Customer Segment Assignment",
                "customer": customer,
                "customer_segment": self.name,
                "assignment_date": nowdate(),
                "assignment_type": "Auto" if self.auto_assignment_enabled else "Manual",
                "is_primary": self.is_primary_segment_for_customer(customer),
                "status": "Active"
            })
            
            assignment.insert(ignore_permissions=True)
            return True
            
        except Exception as e:
            frappe.log_error(f"Error creating assignment for customer {customer}: {str(e)}")
            return False
            
    def is_primary_segment_for_customer(self, customer):
        """Check if this should be the primary segment for the customer"""
        # Check if customer has any existing primary segment
        existing_primary = frappe.db.exists("HD Customer Segment Assignment", {
            "customer": customer,
            "is_primary": 1,
            "status": "Active"
        })
        
        if not existing_primary:
            return True
            
        # If this segment has higher priority, make it primary
        existing_segment = frappe.db.get_value("HD Customer Segment Assignment", {
            "customer": customer,
            "is_primary": 1,
            "status": "Active"
        }, "customer_segment")
        
        if existing_segment:
            existing_priority = frappe.db.get_value("HD Customer Segment", existing_segment, "priority")
            return self.priority > (existing_priority or 0)
            
        return False
        
    @frappe.whitelist()
    def review_customer_assignments(self):
        """Review and update customer assignments based on current criteria"""
        assignments = frappe.get_all("HD Customer Segment Assignment", 
            filters={"customer_segment": self.name, "status": "Active"},
            fields=["name", "customer"]
        )
        
        updated_count = 0
        demoted_count = 0
        
        for assignment in assignments:
            customer = assignment["customer"]
            
            # Check if customer still qualifies
            if self.customer_qualifies_for_segment(customer):
                # Check for escalation
                if self.escalation_segment and self.customer_qualifies_for_escalation(customer):
                    self.escalate_customer(customer)
                    updated_count += 1
            else:
                # Check for demotion
                if self.demotion_segment:
                    self.demote_customer(customer)
                    demoted_count += 1
                else:
                    # Deactivate assignment
                    frappe.db.set_value("HD Customer Segment Assignment", 
                        assignment["name"], "status", "Inactive")
                    demoted_count += 1
                    
        return {
            "success": True,
            "updated_count": updated_count,
            "demoted_count": demoted_count,
            "message": f"Review completed. {updated_count} escalated, {demoted_count} demoted/deactivated"
        }
        
    def customer_qualifies_for_segment(self, customer):
        """Check if customer still qualifies for this segment"""
        # Get customer's current metrics
        annual_purchase = self.get_customer_annual_purchase(customer)
        order_frequency = self.get_customer_order_frequency(customer)
        
        # Check minimum requirements
        if self.min_annual_purchase and annual_purchase < self.min_annual_purchase:
            return False
            
        if self.min_order_frequency and order_frequency < self.min_order_frequency:
            return False
            
        # Check auto assignment rules if available
        if self.auto_assignment_enabled and self.auto_assignment_rules:
            eligible_customers = self.find_eligible_customers()
            return customer in eligible_customers
            
        return True
        
    def customer_qualifies_for_escalation(self, customer):
        """Check if customer qualifies for escalation to higher segment"""
        if not self.escalation_segment:
            return False
            
        escalation_segment_doc = frappe.get_doc("HD Customer Segment", self.escalation_segment)
        return escalation_segment_doc.customer_qualifies_for_segment(customer)
        
    def escalate_customer(self, customer):
        """Escalate customer to higher segment"""
        # Deactivate current assignment
        frappe.db.sql("""
            UPDATE `tabHD Customer Segment Assignment` 
            SET status = 'Inactive', effective_to = %s
            WHERE customer = %s AND customer_segment = %s AND status = 'Active'
        """, [nowdate(), customer, self.name])
        
        # Create new assignment in escalation segment
        escalation_segment_doc = frappe.get_doc("HD Customer Segment", self.escalation_segment)
        escalation_segment_doc.create_customer_assignment(customer)
        
    def demote_customer(self, customer):
        """Demote customer to lower segment"""
        # Deactivate current assignment
        frappe.db.sql("""
            UPDATE `tabHD Customer Segment Assignment` 
            SET status = 'Inactive', effective_to = %s
            WHERE customer = %s AND customer_segment = %s AND status = 'Active'
        """, [nowdate(), customer, self.name])
        
        # Create new assignment in demotion segment
        demotion_segment_doc = frappe.get_doc("HD Customer Segment", self.demotion_segment)
        demotion_segment_doc.create_customer_assignment(customer)
        
    def get_customer_annual_purchase(self, customer):
        """Get customer's annual purchase amount"""
        result = frappe.db.sql("""
            SELECT COALESCE(SUM(grand_total), 0) as annual_purchase
            FROM `tabSales Invoice` 
            WHERE customer = %s 
            AND posting_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            AND docstatus = 1
        """, [customer])
        
        return result[0][0] if result else 0
        
    def get_customer_order_frequency(self, customer):
        """Get customer's order frequency (orders per month)"""
        result = frappe.db.sql("""
            SELECT COUNT(*) as order_count
            FROM `tabSales Order` 
            WHERE customer = %s 
            AND transaction_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            AND docstatus = 1
        """, [customer])
        
        return (result[0][0] / 12) if result else 0
        
    @frappe.whitelist()
    def get_segment_analytics(self):
        """Get analytics data for this segment"""
        analytics = {}
        
        # Get customer count
        analytics["customer_count"] = frappe.db.count("HD Customer Segment Assignment", {
            "customer_segment": self.name,
            "status": "Active"
        })
        
        # Get revenue contribution
        revenue_data = frappe.db.sql("""
            SELECT 
                COALESCE(SUM(si.grand_total), 0) as total_revenue,
                COALESCE(AVG(si.grand_total), 0) as avg_order_value,
                COUNT(DISTINCT si.name) as total_orders
            FROM `tabSales Invoice` si
            INNER JOIN `tabHD Customer Segment Assignment` csa 
                ON csa.customer = si.customer 
                AND csa.customer_segment = %s 
                AND csa.status = 'Active'
            WHERE si.posting_date >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
            AND si.docstatus = 1
        """, [self.name], as_dict=True)
        
        if revenue_data:
            analytics.update(revenue_data[0])
        else:
            analytics.update({
                "total_revenue": 0,
                "avg_order_value": 0,
                "total_orders": 0
            })
            
        # Calculate metrics
        if analytics["customer_count"] > 0:
            analytics["revenue_per_customer"] = analytics["total_revenue"] / analytics["customer_count"]
            analytics["orders_per_customer"] = analytics["total_orders"] / analytics["customer_count"]
        else:
            analytics["revenue_per_customer"] = 0
            analytics["orders_per_customer"] = 0
            
        return analytics