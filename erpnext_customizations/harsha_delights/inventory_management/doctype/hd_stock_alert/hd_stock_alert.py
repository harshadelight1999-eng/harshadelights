# Copyright (c) 2024, Harsha Delights and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt, cint, nowdate, getdate, now, add_days

class HDStockAlert(Document):
    def validate(self):
        """Validate stock alert data"""
        self.set_item_name()
        self.set_alert_message()
        self.calculate_suggested_actions()
        self.set_alert_level()
        
    def set_item_name(self):
        """Set item name from item master"""
        if self.item_code:
            self.item_name = frappe.db.get_value("Item", self.item_code, "item_name")
            
    def set_alert_message(self):
        """Generate appropriate alert message"""
        messages = {
            "Low Stock": f"Stock level for {self.item_name} is below minimum threshold. Current: {self.current_stock}, Minimum: {self.minimum_stock}",
            "High Stock": f"Stock level for {self.item_name} is above maximum threshold. Current: {self.current_stock}, Maximum: {self.maximum_stock}",
            "Expiry Warning": f"Batch {self.batch_id} for {self.item_name} is expiring in {self.days_to_expiry} days",
            "Expired Stock": f"Batch {self.batch_id} for {self.item_name} has expired on {self.expiry_date}",
            "Zero Stock": f"Stock for {self.item_name} has reached zero",
            "Negative Stock": f"Stock for {self.item_name} is negative: {self.current_stock}",
            "Quality Alert": f"Quality issue detected for {self.item_name} in batch {self.batch_id}"
        }
        
        self.alert_message = messages.get(self.alert_type, f"Alert for {self.item_name}")
        
    def calculate_suggested_actions(self):
        """Calculate suggested actions based on alert type"""
        if self.alert_type == "Low Stock" or self.alert_type == "Zero Stock":
            self.suggested_action = "Purchase Order"
            if self.reorder_level and self.current_stock <= self.reorder_level:
                # Calculate reorder quantity
                self.reorder_qty = max(
                    flt(self.minimum_stock) - flt(self.current_stock),
                    flt(self.minimum_stock) * 0.5  # Safety buffer
                )
                
        elif self.alert_type == "High Stock":
            self.suggested_action = "Discount Sale"
            
        elif self.alert_type == "Expiry Warning":
            if self.days_to_expiry <= 3:
                self.suggested_action = "Discount Sale"
            elif self.days_to_expiry <= 7:
                self.suggested_action = "Stock Transfer"
            else:
                self.suggested_action = "Quality Check"
                
        elif self.alert_type == "Expired Stock":
            self.suggested_action = "Write Off"
            
        elif self.alert_type == "Quality Alert":
            self.suggested_action = "Quality Check"
            
    def set_alert_level(self):
        """Set alert level based on severity"""
        if not self.alert_level:
            level_mapping = {
                "Expired Stock": "Urgent",
                "Negative Stock": "Critical",
                "Zero Stock": "Critical", 
                "Quality Alert": "Critical",
                "Expiry Warning": "Warning" if self.days_to_expiry > 3 else "Critical",
                "Low Stock": "Warning",
                "High Stock": "Info"
            }
            self.alert_level = level_mapping.get(self.alert_type, "Info")
            
    def on_update(self):
        """Execute after document update"""
        if self.status == "Open" and not self.acknowledged_by:
            self.notify_stakeholders()
            
    def notify_stakeholders(self):
        """Send notifications to relevant stakeholders"""
        # Determine who to notify based on alert type
        roles_to_notify = []
        
        if self.alert_type in ["Low Stock", "Zero Stock", "High Stock"]:
            roles_to_notify = ["Stock Manager", "Purchase Manager"]
        elif self.alert_type in ["Expiry Warning", "Expired Stock"]:
            roles_to_notify = ["Stock Manager", "Quality Manager"]
        elif self.alert_type == "Quality Alert":
            roles_to_notify = ["Quality Manager", "Production Manager"]
        elif self.alert_type == "Negative Stock":
            roles_to_notify = ["Stock Manager", "Accounts Manager"]
            
        # Get users with these roles
        users_to_notify = []
        for role in roles_to_notify:
            role_users = frappe.get_all("Has Role", 
                filters={"role": role},
                pluck="parent"
            )
            users_to_notify.extend(role_users)
            
        # Remove duplicates
        users_to_notify = list(set(users_to_notify))
        
        # Create notifications
        for user in users_to_notify:
            self.create_notification(user)
            
            # Create ToDo for critical/urgent alerts
            if self.alert_level in ["Critical", "Urgent"]:
                self.create_todo(user)
                
    def create_notification(self, user):
        """Create notification for user"""
        try:
            frappe.share.add("HD Stock Alert", self.name, user, notify=1)
            
            # Create notification log
            frappe.get_doc({
                "doctype": "Notification Log",
                "subject": f"Stock Alert: {self.alert_type} - {self.item_name}",
                "email_content": self.alert_message,
                "for_user": user,
                "type": "Alert",
                "document_type": "HD Stock Alert",
                "document_name": self.name
            }).insert(ignore_permissions=True)
            
        except Exception as e:
            frappe.log_error(f"Error creating notification: {str(e)}", "Stock Alert Notification")
            
    def create_todo(self, user):
        """Create ToDo for urgent actions"""
        try:
            priority_map = {
                "Urgent": "High",
                "Critical": "High", 
                "Warning": "Medium",
                "Info": "Low"
            }
            
            todo = frappe.get_doc({
                "doctype": "ToDo",
                "description": self.alert_message,
                "priority": priority_map.get(self.alert_level, "Medium"),
                "status": "Open",
                "allocated_to": user,
                "reference_type": "HD Stock Alert",
                "reference_name": self.name,
                "date": nowdate(),
                "role": "Stock Manager"  # Default role
            })
            todo.insert(ignore_permissions=True)
            
        except Exception as e:
            frappe.log_error(f"Error creating ToDo: {str(e)}", "Stock Alert ToDo")
            
    @frappe.whitelist()
    def acknowledge_alert(self, notes=None):
        """Acknowledge the stock alert"""
        self.status = "Acknowledged"
        self.acknowledged_by = frappe.session.user
        self.acknowledged_date = now()
        
        if notes:
            self.action_taken = (self.action_taken or "") + f"\n{nowdate()}: {notes}"
            
        self.save()
        
        return {
            "success": True,
            "message": "Alert acknowledged successfully"
        }
        
    @frappe.whitelist()
    def resolve_alert(self, resolution_notes, action_taken=None):
        """Resolve the stock alert"""
        self.status = "Resolved"
        self.resolution_notes = resolution_notes
        
        if action_taken:
            self.action_taken = (self.action_taken or "") + f"\n{nowdate()}: {action_taken}"
            
        self.save()
        
        # Close related ToDos
        todos = frappe.get_all("ToDo", 
            filters={
                "reference_type": "HD Stock Alert",
                "reference_name": self.name,
                "status": "Open"
            }
        )
        
        for todo in todos:
            frappe.db.set_value("ToDo", todo.name, "status", "Closed")
            
        return {
            "success": True,
            "message": "Alert resolved successfully"
        }
        
    @frappe.whitelist()
    def create_purchase_order(self, supplier=None, delivery_date=None):
        """Create purchase order from stock alert"""
        if self.suggested_action != "Purchase Order":
            frappe.throw("Purchase order can only be created for Low Stock or Zero Stock alerts")
            
        if not supplier:
            # Get default supplier for the item
            supplier = frappe.db.get_value("Item Default", 
                {"item_code": self.item_code}, "default_supplier")
                
            if not supplier:
                frappe.throw("Please specify supplier or set default supplier for the item")
                
        # Create Purchase Order
        po = frappe.get_doc({
            "doctype": "Purchase Order",
            "supplier": supplier,
            "schedule_date": delivery_date or add_days(nowdate(), 7),
            "items": [{
                "item_code": self.item_code,
                "qty": self.reorder_qty or self.minimum_stock,
                "warehouse": self.warehouse,
                "rate": self.last_purchase_rate or 0,
                "schedule_date": delivery_date or add_days(nowdate(), 7)
            }]
        })
        
        po.insert()
        
        # Update alert with action taken
        self.action_taken = (self.action_taken or "") + f"\n{nowdate()}: Purchase Order {po.name} created"
        self.status = "In Progress"
        self.save()
        
        return {
            "success": True,
            "purchase_order": po.name,
            "message": f"Purchase Order {po.name} created successfully"
        }
        
    @frappe.whitelist()
    def create_stock_transfer(self, target_warehouse, transfer_qty=None):
        """Create stock transfer from alert"""
        if self.current_stock <= 0:
            frappe.throw("Cannot transfer stock - no stock available")
            
        transfer_qty = transfer_qty or self.current_stock
        
        # Create Stock Entry
        se = frappe.get_doc({
            "doctype": "Stock Entry",
            "stock_entry_type": "Material Transfer",
            "from_warehouse": self.warehouse,
            "to_warehouse": target_warehouse,
            "items": [{
                "item_code": self.item_code,
                "qty": transfer_qty,
                "s_warehouse": self.warehouse,
                "t_warehouse": target_warehouse,
                "batch_no": self.batch_id if self.batch_id else None
            }]
        })
        
        se.insert()
        se.submit()
        
        # Update alert
        self.action_taken = (self.action_taken or "") + f"\n{nowdate()}: Stock Entry {se.name} created for transfer"
        self.status = "In Progress"
        self.save()
        
        return {
            "success": True,
            "stock_entry": se.name,
            "message": f"Stock transfer {se.name} created successfully"
        }
        
    @staticmethod
    def create_stock_alerts():
        """Static method to create stock alerts - called by scheduler"""
        # Check for low stock alerts
        HDStockAlert.check_low_stock_levels()
        
        # Check for expiry alerts  
        HDStockAlert.check_expiring_batches()
        
        # Check for negative stock
        HDStockAlert.check_negative_stock()
        
        # Check for high stock
        HDStockAlert.check_high_stock_levels()
        
    @staticmethod
    def check_low_stock_levels():
        """Check for items with low stock levels"""
        items_with_reorder = frappe.db.sql("""
            SELECT 
                b.item_code,
                b.warehouse,
                b.actual_qty,
                ir.warehouse_reorder_level,
                ir.warehouse_reorder_qty,
                i.item_name
            FROM `tabBin` b
            INNER JOIN `tabItem Reorder` ir ON ir.parent = b.item_code AND ir.warehouse = b.warehouse
            INNER JOIN `tabItem` i ON i.name = b.item_code
            WHERE b.actual_qty <= ir.warehouse_reorder_level
            AND ir.warehouse_reorder_level > 0
        """, as_dict=True)
        
        for item in items_with_reorder:
            # Check if alert already exists
            existing_alert = frappe.db.exists("HD Stock Alert", {
                "item_code": item.item_code,
                "warehouse": item.warehouse,
                "alert_type": "Low Stock",
                "status": ["in", ["Open", "Acknowledged", "In Progress"]]
            })
            
            if not existing_alert:
                HDStockAlert.create_alert({
                    "alert_type": "Low Stock",
                    "item_code": item.item_code,
                    "warehouse": item.warehouse,
                    "current_stock": item.actual_qty,
                    "minimum_stock": item.warehouse_reorder_level,
                    "reorder_qty": item.warehouse_reorder_qty,
                    "alert_date": now(),
                    "status": "Open"
                })
                
    @staticmethod
    def check_expiring_batches():
        """Check for expiring batches"""
        expiring_batches = frappe.db.sql("""
            SELECT 
                bm.batch_id,
                bm.item,
                bm.warehouse,
                bm.expiry_date,
                bm.available_qty,
                bm.unit_cost,
                DATEDIFF(bm.expiry_date, CURDATE()) as days_to_expiry
            FROM `tabHD Batch Master` bm
            WHERE bm.status = 'Active'
            AND bm.available_qty > 0
            AND bm.expiry_date IS NOT NULL
            AND DATEDIFF(bm.expiry_date, CURDATE()) <= 30
        """, as_dict=True)
        
        for batch in expiring_batches:
            alert_type = "Expired Stock" if batch.days_to_expiry <= 0 else "Expiry Warning"
            
            # Check if alert already exists
            existing_alert = frappe.db.exists("HD Stock Alert", {
                "item_code": batch.item,
                "warehouse": batch.warehouse,
                "batch_id": batch.batch_id,
                "alert_type": ["in", ["Expiry Warning", "Expired Stock"]],
                "status": ["in", ["Open", "Acknowledged", "In Progress"]]
            })
            
            if not existing_alert:
                HDStockAlert.create_alert({
                    "alert_type": alert_type,
                    "item_code": batch.item,
                    "warehouse": batch.warehouse,
                    "batch_id": batch.batch_id,
                    "current_stock": batch.available_qty,
                    "expiry_date": batch.expiry_date,
                    "days_to_expiry": batch.days_to_expiry,
                    "potential_loss_value": flt(batch.available_qty) * flt(batch.unit_cost),
                    "alert_date": now(),
                    "status": "Open"
                })
                
    @staticmethod
    def check_negative_stock():
        """Check for negative stock"""
        negative_stock_items = frappe.db.sql("""
            SELECT item_code, warehouse, actual_qty
            FROM `tabBin`
            WHERE actual_qty < 0
        """, as_dict=True)
        
        for item in negative_stock_items:
            # Check if alert already exists
            existing_alert = frappe.db.exists("HD Stock Alert", {
                "item_code": item.item_code,
                "warehouse": item.warehouse,
                "alert_type": "Negative Stock",
                "status": ["in", ["Open", "Acknowledged", "In Progress"]]
            })
            
            if not existing_alert:
                HDStockAlert.create_alert({
                    "alert_type": "Negative Stock",
                    "item_code": item.item_code,
                    "warehouse": item.warehouse,
                    "current_stock": item.actual_qty,
                    "alert_date": now(),
                    "status": "Open"
                })
                
    @staticmethod
    def check_high_stock_levels():
        """Check for items with high stock levels"""
        # This would typically be based on maximum stock levels or slow-moving analysis
        # Implementation depends on specific business requirements
        pass
        
    @staticmethod
    def create_alert(alert_data):
        """Create stock alert with given data"""
        try:
            alert = frappe.get_doc(dict(alert_data, doctype="HD Stock Alert"))
            alert.insert(ignore_permissions=True)
            return alert
        except Exception as e:
            frappe.log_error(f"Error creating stock alert: {str(e)}", "Stock Alert Creation")