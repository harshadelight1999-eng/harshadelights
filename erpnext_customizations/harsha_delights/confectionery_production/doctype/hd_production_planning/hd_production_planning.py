# Copyright (c) 2024, Harsha Delights and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt, cint, time_diff_in_hours, get_time, nowdate, add_days
from datetime import datetime, timedelta

class HDProductionPlanning(Document):
    def validate(self):
        """Validate production planning data"""
        self.validate_dates()
        self.validate_times()
        self.calculate_totals()
        self.validate_capacity()
        self.check_resource_availability()
        
    def validate_dates(self):
        """Validate planning dates"""
        if self.planned_for_date < self.planning_date:
            frappe.throw("Planned for date cannot be before planning date")
            
    def validate_times(self):
        """Validate start and end times"""
        if self.start_time and self.end_time:
            if get_time(self.start_time) >= get_time(self.end_time):
                frappe.throw("End time must be after start time")
                
    def calculate_totals(self):
        """Calculate total quantities and hours"""
        total_qty = 0
        total_hours = 0
        
        for item in self.planned_items:
            total_qty += flt(item.planned_quantity)
            
            # Get recipe to calculate time
            if item.recipe:
                recipe_doc = frappe.get_doc("HD Recipe Master", item.recipe)
                item_hours = (flt(recipe_doc.total_time_minutes) / 60) * flt(item.planned_quantity) / flt(recipe_doc.yield_quantity)
                item.estimated_hours = item_hours
                total_hours += item_hours
                
        self.total_planned_qty = total_qty
        self.total_planned_hours = total_hours
        
        # Calculate capacity utilization
        if self.start_time and self.end_time and self.line_capacity_per_hour:
            available_hours = time_diff_in_hours(self.end_time, self.start_time)
            if self.break_time_minutes:
                available_hours -= (flt(self.break_time_minutes) / 60)
                
            if available_hours > 0:
                self.capacity_utilization_percent = (total_hours / available_hours) * 100
                
    def validate_capacity(self):
        """Validate production line capacity"""
        if self.capacity_utilization_percent > 100:
            frappe.msgprint(
                f"Warning: Capacity utilization is {self.capacity_utilization_percent:.1f}%. "
                f"This may cause delays in production.",
                alert=True,
                indicator="orange"
            )
            
        if self.capacity_utilization_percent > 120:
            frappe.throw(
                f"Capacity utilization of {self.capacity_utilization_percent:.1f}% is too high. "
                "Please reduce planned quantity or extend production time."
            )
            
    def check_resource_availability(self):
        """Check if required resources are available"""
        unavailable_resources = []
        
        for resource in self.required_resources:
            # Check if resource is available on planned date
            if not self.is_resource_available(resource.resource_type, resource.resource_name, self.planned_for_date):
                unavailable_resources.append(f"{resource.resource_type}: {resource.resource_name}")
                
        if unavailable_resources:
            frappe.msgprint(
                f"Warning: Following resources may not be available on {self.planned_for_date}:\n" + 
                "\n".join(unavailable_resources),
                alert=True,
                indicator="yellow"
            )
            
    def is_resource_available(self, resource_type, resource_name, date):
        """Check if specific resource is available on given date"""
        # Check for maintenance schedules, other bookings, etc.
        # This is a simplified check - can be enhanced based on requirements
        
        if resource_type == "Employee":
            # Check for employee availability
            leave_exists = frappe.db.exists("Leave Application", {
                "employee": resource_name,
                "from_date": ["<=", date],
                "to_date": [">=", date],
                "status": "Approved"
            })
            return not leave_exists
            
        elif resource_type == "Equipment":
            # Check for equipment maintenance
            maintenance_exists = frappe.db.exists("Asset Maintenance", {
                "asset": resource_name,
                "maintenance_date": date,
                "maintenance_status": ["in", ["Planned", "In Progress"]]
            })
            return not maintenance_exists
            
        return True
        
    def on_submit(self):
        """Execute when production plan is submitted"""
        self.status = "Scheduled"
        self.create_work_orders()
        self.book_resources()
        
    def create_work_orders(self):
        """Create work orders from production plan"""
        for item in self.planned_items:
            if item.auto_create_work_order:
                work_order = frappe.get_doc({
                    "doctype": "Work Order",
                    "production_item": item.item_code,
                    "qty": item.planned_quantity,
                    "planned_start_date": self.planned_for_date,
                    "production_planning": self.name,
                    "priority": self.priority,
                    "source_warehouse": item.source_warehouse,
                    "wip_warehouse": item.wip_warehouse,
                    "fg_warehouse": item.target_warehouse
                })
                
                if item.recipe:
                    work_order.recipe_master = item.recipe
                    
                work_order.insert()
                
                # Update item with work order reference
                item.work_order = work_order.name
                
    def book_resources(self):
        """Book required resources for the production plan"""
        for resource in self.required_resources:
            # Create resource booking entry
            booking = frappe.get_doc({
                "doctype": "HD Resource Booking",
                "production_planning": self.name,
                "resource_type": resource.resource_type,
                "resource_name": resource.resource_name,
                "booking_date": self.planned_for_date,
                "start_time": self.start_time,
                "end_time": self.end_time,
                "status": "Booked"
            })
            booking.insert(ignore_permissions=True)
            
    @frappe.whitelist()
    def optimize_production_sequence(self):
        """Optimize the sequence of items based on changeover times"""
        if not self.planned_items:
            return
            
        # Sort items by setup time and changeover complexity
        items = []
        for item in self.planned_items:
            changeover_time = self.get_changeover_time(item.item_code)
            items.append((item, changeover_time))
            
        # Sort by changeover time (ascending)
        items.sort(key=lambda x: x[1])
        
        # Reorder items in the table
        self.planned_items = []
        sequence = 1
        for item, _ in items:
            item.sequence = sequence
            self.planned_items.append(item)
            sequence += 1
            
        self.save()
        
        return {
            "success": True,
            "message": "Production sequence optimized successfully"
        }
        
    def get_changeover_time(self, item_code):
        """Get estimated changeover time for item"""
        # This would typically come from a setup/changeover master
        # For now, return default values based on item group
        
        try:
            item_group = frappe.db.get_value("Item", item_code, "item_group")
            
            changeover_times = {
                "Sweets & Desserts": 30,  # 30 minutes
                "Chocolates": 45,
                "Baked Items": 60,
                "Namkeens": 20
            }
            
            return changeover_times.get(item_group, 30)
            
        except:
            return 30
            
    @frappe.whitelist()
    def get_material_requirements(self):
        """Get consolidated material requirements for all planned items"""
        material_requirements = {}
        
        for item in self.planned_items:
            if item.recipe:
                recipe_doc = frappe.get_doc("HD Recipe Master", item.recipe)
                scale_factor = flt(item.planned_quantity) / flt(recipe_doc.yield_quantity)
                
                for ingredient in recipe_doc.ingredients:
                    required_qty = flt(ingredient.quantity) * scale_factor
                    
                    if ingredient.ingredient_item in material_requirements:
                        material_requirements[ingredient.ingredient_item]["quantity"] += required_qty
                    else:
                        material_requirements[ingredient.ingredient_item] = {
                            "item_name": ingredient.ingredient_name,
                            "quantity": required_qty,
                            "uom": ingredient.uom,
                            "source_warehouse": ingredient.source_warehouse
                        }
                        
        return material_requirements
        
    @frappe.whitelist()
    def check_material_availability(self):
        """Check if required materials are available"""
        material_requirements = self.get_material_requirements()
        shortage_items = []
        
        for item_code, requirement in material_requirements.items():
            available_qty = frappe.db.sql("""
                SELECT SUM(actual_qty) 
                FROM `tabBin` 
                WHERE item_code = %s AND warehouse = %s
            """, [item_code, requirement["source_warehouse"]])[0][0] or 0
            
            if available_qty < requirement["quantity"]:
                shortage_items.append({
                    "item_code": item_code,
                    "item_name": requirement["item_name"],
                    "required_qty": requirement["quantity"],
                    "available_qty": available_qty,
                    "shortage_qty": requirement["quantity"] - available_qty,
                    "uom": requirement["uom"]
                })
                
        return {
            "has_shortage": len(shortage_items) > 0,
            "shortage_items": shortage_items,
            "total_requirements": material_requirements
        }
        
    @frappe.whitelist()
    def update_production_status(self, status, notes=None):
        """Update production planning status"""
        allowed_statuses = ["Draft", "Scheduled", "In Progress", "Completed", "Cancelled"]
        
        if status not in allowed_statuses:
            frappe.throw(f"Invalid status. Allowed statuses: {', '.join(allowed_statuses)}")
            
        self.status = status
        
        if notes:
            self.production_notes = (self.production_notes or "") + f"\n{nowdate()}: {notes}"
            
        self.save()
        
        return {
            "success": True,
            "message": f"Production planning status updated to {status}"
        }