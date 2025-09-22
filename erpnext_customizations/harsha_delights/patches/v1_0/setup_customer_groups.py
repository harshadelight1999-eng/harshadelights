import frappe
from frappe import _

def execute():
    """Setup customer groups for confectionery business segmentation"""

    customer_groups = [
        {
            "customer_group_name": "B2B Customers",
            "parent_customer_group": "All Customer Groups",
            "is_group": 1
        },
        {
            "customer_group_name": "B2C Customers",
            "parent_customer_group": "All Customer Groups",
            "is_group": 1
        },
        {
            "customer_group_name": "Wholesale Distributors",
            "parent_customer_group": "B2B Customers",
            "is_group": 0
        },
        {
            "customer_group_name": "Retail Stores",
            "parent_customer_group": "B2B Customers",
            "is_group": 0
        },
        {
            "customer_group_name": "Hotels & Restaurants",
            "parent_customer_group": "B2B Customers",
            "is_group": 0
        },
        {
            "customer_group_name": "Local Customers",
            "parent_customer_group": "B2C Customers",
            "is_group": 0
        },
        {
            "customer_group_name": "International Customers",
            "parent_customer_group": "B2C Customers",
            "is_group": 0
        },
        {
            "customer_group_name": "Corporate Orders",
            "parent_customer_group": "B2B Customers",
            "is_group": 0
        }
    ]

    for group in customer_groups:
        if not frappe.db.exists("Customer Group", group["customer_group_name"]):
            doc = frappe.get_doc({
                "doctype": "Customer Group",
                "customer_group_name": group["customer_group_name"],
                "parent_customer_group": group["parent_customer_group"],
                "is_group": group["is_group"]
            })
            doc.insert(ignore_permissions=True)
            print(f"Created Customer Group: {group['customer_group_name']}")
        else:
            print(f"Customer Group already exists: {group['customer_group_name']}")

    frappe.db.commit()