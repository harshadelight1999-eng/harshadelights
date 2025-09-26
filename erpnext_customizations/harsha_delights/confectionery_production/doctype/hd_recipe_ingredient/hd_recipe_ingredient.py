# Copyright (c) 2024, Harsha Delights and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class HDRecipeIngredient(Document):
    def validate(self):
        """Validate ingredient data"""
        self.set_ingredient_name()
        self.validate_quantity()
        
    def set_ingredient_name(self):
        """Set ingredient name from item master"""
        if self.ingredient_item:
            self.ingredient_name = frappe.db.get_value("Item", self.ingredient_item, "item_name")
            
    def validate_quantity(self):
        """Validate ingredient quantity"""
        if not self.quantity or self.quantity <= 0:
            frappe.throw(f"Quantity for {self.ingredient_item} must be greater than zero")