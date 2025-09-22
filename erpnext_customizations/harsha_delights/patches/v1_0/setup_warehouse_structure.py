import frappe
from frappe import _

def execute():
    """Setup warehouse structure for confectionery business"""

    warehouses = [
        {
            "warehouse_name": "Raw Materials Store",
            "parent_warehouse": "Stores - HD",
            "warehouse_type": "Stock",
            "is_group": 0
        },
        {
            "warehouse_name": "Production Floor",
            "parent_warehouse": "Stores - HD",
            "warehouse_type": "Manufacturing",
            "is_group": 0
        },
        {
            "warehouse_name": "Finished Goods Store",
            "parent_warehouse": "Stores - HD",
            "warehouse_type": "Stock",
            "is_group": 0
        },
        {
            "warehouse_name": "Packaging Store",
            "parent_warehouse": "Stores - HD",
            "warehouse_type": "Stock",
            "is_group": 0
        },
        {
            "warehouse_name": "Quality Control",
            "parent_warehouse": "Stores - HD",
            "warehouse_type": "Transit",
            "is_group": 0
        }
    ]

    for warehouse in warehouses:
        warehouse_name_with_abbr = f"{warehouse['warehouse_name']} - HD"

        if not frappe.db.exists("Warehouse", warehouse_name_with_abbr):
            try:
                doc = frappe.get_doc({
                    "doctype": "Warehouse",
                    "warehouse_name": warehouse["warehouse_name"],
                    "parent_warehouse": warehouse.get("parent_warehouse"),
                    "warehouse_type": warehouse.get("warehouse_type", "Stock"),
                    "is_group": warehouse["is_group"],
                    "company": "Harsha Delights Pvt Ltd"
                })
                doc.insert(ignore_permissions=True)
                print(f"Created Warehouse: {warehouse_name_with_abbr}")
            except Exception as e:
                print(f"Error creating warehouse {warehouse['warehouse_name']}: {str(e)}")
        else:
            print(f"Warehouse already exists: {warehouse_name_with_abbr}")

    frappe.db.commit()