import frappe
from frappe import _

def execute():
    """Setup confectionery-specific item groups"""

    item_groups = [
        {
            "item_group_name": "Confectionery",
            "parent_item_group": "All Item Groups",
            "is_group": 1
        },
        {
            "item_group_name": "Raw Materials",
            "parent_item_group": "Confectionery",
            "is_group": 1
        },
        {
            "item_group_name": "Packaging Materials",
            "parent_item_group": "Confectionery",
            "is_group": 1
        },
        {
            "item_group_name": "Finished Goods",
            "parent_item_group": "Confectionery",
            "is_group": 1
        },
        {
            "item_group_name": "Sweets & Desserts",
            "parent_item_group": "Finished Goods",
            "is_group": 0
        },
        {
            "item_group_name": "Chocolates",
            "parent_item_group": "Finished Goods",
            "is_group": 0
        },
        {
            "item_group_name": "Baked Items",
            "parent_item_group": "Finished Goods",
            "is_group": 0
        }
    ]

    for group in item_groups:
        if not frappe.db.exists("Item Group", group["item_group_name"]):
            doc = frappe.get_doc({
                "doctype": "Item Group",
                "item_group_name": group["item_group_name"],
                "parent_item_group": group["parent_item_group"],
                "is_group": group["is_group"]
            })
            doc.insert(ignore_permissions=True)
            print(f"Created Item Group: {group['item_group_name']}")
        else:
            print(f"Item Group already exists: {group['item_group_name']}")

    frappe.db.commit()