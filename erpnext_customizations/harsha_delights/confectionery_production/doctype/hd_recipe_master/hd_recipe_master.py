# Copyright (c) 2024, Harsha Delights and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt, cint, nowdate

class HDRecipeMaster(Document):
    def autoname(self):
        """Generate recipe code automatically"""
        if not self.recipe_code:
            # Generate recipe code: CATEGORY_ITEM-VERSION
            category_code = self.recipe_category.replace(" ", "").replace("&", "").upper()[:4] if self.recipe_category else "RECP"
            item_code = self.finished_item.replace(" ", "").upper()[:6] if self.finished_item else "ITEM"
            version = self.version or "V1"
            
            self.recipe_code = f"{category_code}_{item_code}_{version}"
        
        self.name = self.recipe_code

    def validate(self):
        """Validate recipe data"""
        self.validate_ingredients()
        self.calculate_total_time()
        self.calculate_cost_per_unit()
        self.set_item_name()
        self.validate_quality_parameters()
        self.validate_version()
        
    def validate_ingredients(self):
        """Validate recipe ingredients"""
        if not self.ingredients:
            frappe.throw("Recipe must have at least one ingredient")
            
        # Check for duplicate ingredients
        ingredient_items = []
        for ingredient in self.ingredients:
            if ingredient.ingredient_item in ingredient_items:
                frappe.throw(f"Ingredient {ingredient.ingredient_item} is duplicated")
            ingredient_items.append(ingredient.ingredient_item)
            
            # Validate quantities
            if flt(ingredient.quantity) <= 0:
                frappe.throw(f"Quantity for {ingredient.ingredient_item} must be greater than zero")
                
    def calculate_total_time(self):
        """Calculate total preparation and cooking time"""
        prep_time = cint(self.preparation_time_minutes) or 0
        cook_time = cint(self.cooking_time_minutes) or 0
        self.total_time_minutes = prep_time + cook_time
        
    def calculate_cost_per_unit(self):
        """Calculate cost per unit based on ingredient costs"""
        total_cost = 0
        
        for ingredient in self.ingredients:
            # Get ingredient cost from Item Price
            ingredient_cost = self.get_ingredient_cost(ingredient.ingredient_item, ingredient.uom)
            ingredient_total = flt(ingredient.quantity) * flt(ingredient_cost)
            total_cost += ingredient_total
            
            # Update ingredient cost in table
            ingredient.rate = ingredient_cost
            ingredient.amount = ingredient_total
            
        if flt(self.yield_quantity) > 0:
            self.cost_per_unit = total_cost / flt(self.yield_quantity)
        else:
            self.cost_per_unit = 0
            
    def get_ingredient_cost(self, item_code, uom):
        """Get ingredient cost from latest purchase price"""
        try:
            # Try to get from Item Price first
            item_price = frappe.db.get_value("Item Price", 
                {"item_code": item_code, "buying": 1}, 
                "price_list_rate"
            )
            
            if item_price:
                return item_price
                
            # Fallback to valuation rate
            valuation_rate = frappe.db.get_value("Item", item_code, "valuation_rate")
            return valuation_rate or 0
            
        except Exception as e:
            frappe.log_error(f"Error getting ingredient cost for {item_code}: {str(e)}")
            return 0
            
    def set_item_name(self):
        """Set finished item name"""
        if self.finished_item:
            self.finished_item_name = frappe.db.get_value("Item", self.finished_item, "item_name")
            
    def validate_quality_parameters(self):
        """Validate quality parameters based on recipe category"""
        if self.recipe_category == "Sweets & Desserts":
            if self.target_sugar_content and (self.target_sugar_content < 15 or self.target_sugar_content > 75):
                frappe.throw("Sugar content for sweets should be between 15% and 75%")
                
        if self.recipe_category == "Chocolates":
            if self.target_fat_content and (self.target_fat_content < 25 or self.target_fat_content > 55):
                frappe.throw("Fat content for chocolates should be between 25% and 55%")
                
        # General moisture validation
        if self.target_moisture_content and self.target_moisture_content > 20:
            frappe.throw("Moisture content should not exceed 20% for most confectionery items")
            
    def validate_version(self):
        """Validate recipe version"""
        if self.is_new():
            # Check if this version already exists for the same item
            existing = frappe.db.exists("HD Recipe Master", {
                "finished_item": self.finished_item,
                "version": self.version,
                "name": ["!=", self.name]
            })
            
            if existing:
                frappe.throw(f"Version {self.version} already exists for item {self.finished_item}")
                
    def on_submit(self):
        """Execute when recipe is submitted"""
        self.status = "Active"
        self.approved_by = frappe.session.user
        self.approved_date = nowdate()
        
        # Deactivate previous versions if this is approved
        self.deactivate_previous_versions()
        
    def deactivate_previous_versions(self):
        """Deactivate previous versions of the same recipe"""
        previous_versions = frappe.get_all("HD Recipe Master", 
            filters={
                "finished_item": self.finished_item,
                "name": ["!=", self.name],
                "status": "Active"
            }
        )
        
        for prev_recipe in previous_versions:
            frappe.db.set_value("HD Recipe Master", prev_recipe.name, "status", "Inactive")
            
    def before_save(self):
        """Execute before saving"""
        self.last_modified_by = frappe.session.user
        
    @frappe.whitelist()
    def create_production_order(self, qty_to_produce, planned_start_date=None):
        """Create Work Order from recipe"""
        if not self.status == "Active":
            frappe.throw("Only active recipes can be used for production")
            
        # Create Work Order
        work_order = frappe.get_doc({
            "doctype": "Work Order",
            "production_item": self.finished_item,
            "qty": flt(qty_to_produce),
            "planned_start_date": planned_start_date or nowdate(),
            "recipe_master": self.name,
            "bom_no": self.get_or_create_bom()
        })
        
        # Add required items from recipe
        for ingredient in self.ingredients:
            required_qty = flt(ingredient.quantity) * flt(qty_to_produce) / flt(self.yield_quantity)
            work_order.append("required_items", {
                "item_code": ingredient.ingredient_item,
                "required_qty": required_qty,
                "source_warehouse": ingredient.source_warehouse
            })
            
        work_order.insert()
        
        return {
            "success": True,
            "work_order": work_order.name,
            "message": f"Work Order {work_order.name} created successfully"
        }
        
    def get_or_create_bom(self):
        """Get existing BOM or create new one for the recipe"""
        # Check if BOM already exists
        existing_bom = frappe.db.get_value("BOM", 
            {"item": self.finished_item, "is_active": 1}, 
            "name"
        )
        
        if existing_bom:
            return existing_bom
            
        # Create new BOM from recipe
        bom = frappe.get_doc({
            "doctype": "BOM",
            "item": self.finished_item,
            "quantity": self.yield_quantity,
            "uom": self.yield_uom,
            "recipe_master": self.name
        })
        
        # Add materials from recipe
        for ingredient in self.ingredients:
            bom.append("items", {
                "item_code": ingredient.ingredient_item,
                "qty": ingredient.quantity,
                "uom": ingredient.uom,
                "rate": ingredient.rate
            })
            
        bom.insert()
        bom.submit()
        
        return bom.name
        
    @frappe.whitelist()
    def scale_recipe(self, scale_factor):
        """Create scaled version of recipe"""
        scale_factor = flt(scale_factor)
        if scale_factor <= 0:
            frappe.throw("Scale factor must be greater than zero")
            
        # Create new recipe version
        new_version = f"V{cint(self.version.replace('V', '')) + 1}"
        
        # Copy current recipe
        new_recipe = frappe.copy_doc(self)
        new_recipe.version = new_version
        new_recipe.recipe_code = ""  # Will be auto-generated
        new_recipe.status = "Draft"
        new_recipe.approved_by = ""
        new_recipe.approved_date = None
        
        # Scale quantities
        new_recipe.yield_quantity = flt(self.yield_quantity) * scale_factor
        
        # Scale ingredients
        for ingredient in new_recipe.ingredients:
            ingredient.quantity = flt(ingredient.quantity) * scale_factor
            
        new_recipe.insert()
        
        return {
            "success": True,
            "new_recipe": new_recipe.name,
            "message": f"Scaled recipe {new_recipe.name} created successfully"
        }
        
    @frappe.whitelist()
    def get_nutritional_info(self):
        """Calculate nutritional information based on ingredients"""
        total_calories = 0
        total_protein = 0
        total_carbs = 0
        total_fat = 0
        
        for ingredient in self.ingredients:
            # Get nutritional data from item master
            nutrition_data = frappe.db.get_value("Item", ingredient.ingredient_item, 
                ["calories_per_100g", "protein_per_100g", "carbs_per_100g", "fat_per_100g"], 
                as_dict=True
            )
            
            if nutrition_data:
                qty_factor = flt(ingredient.quantity) / 100  # Per 100g basis
                total_calories += flt(nutrition_data.calories_per_100g or 0) * qty_factor
                total_protein += flt(nutrition_data.protein_per_100g or 0) * qty_factor
                total_carbs += flt(nutrition_data.carbs_per_100g or 0) * qty_factor
                total_fat += flt(nutrition_data.fat_per_100g or 0) * qty_factor
                
        # Calculate per unit values
        per_unit_calories = total_calories / flt(self.yield_quantity) if self.yield_quantity else 0
        per_unit_protein = total_protein / flt(self.yield_quantity) if self.yield_quantity else 0
        per_unit_carbs = total_carbs / flt(self.yield_quantity) if self.yield_quantity else 0
        per_unit_fat = total_fat / flt(self.yield_quantity) if self.yield_quantity else 0
        
        return {
            "total_yield_nutrition": {
                "calories": total_calories,
                "protein": total_protein,
                "carbs": total_carbs,
                "fat": total_fat
            },
            "per_unit_nutrition": {
                "calories": per_unit_calories,
                "protein": per_unit_protein,
                "carbs": per_unit_carbs,
                "fat": per_unit_fat
            }
        }