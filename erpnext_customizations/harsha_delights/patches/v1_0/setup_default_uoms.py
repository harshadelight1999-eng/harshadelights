import frappe
from frappe import _

def execute():
    """Setup default UOMs for confectionery business"""

    uoms = [
        {"uom_name": "Kg", "must_be_whole_number": 0, "enabled": 1},
        {"uom_name": "Gram", "must_be_whole_number": 0, "enabled": 1},
        {"uom_name": "Piece", "must_be_whole_number": 1, "enabled": 1},
        {"uom_name": "Box", "must_be_whole_number": 1, "enabled": 1},
        {"uom_name": "Packet", "must_be_whole_number": 1, "enabled": 1},
        {"uom_name": "Liter", "must_be_whole_number": 0, "enabled": 1},
        {"uom_name": "ML", "must_be_whole_number": 0, "enabled": 1},
        {"uom_name": "Dozen", "must_be_whole_number": 1, "enabled": 1},
        {"uom_name": "Tin", "must_be_whole_number": 1, "enabled": 1},
        {"uom_name": "Bottle", "must_be_whole_number": 1, "enabled": 1}
    ]

    for uom in uoms:
        if not frappe.db.exists("UOM", uom["uom_name"]):
            doc = frappe.get_doc({
                "doctype": "UOM",
                "uom_name": uom["uom_name"],
                "must_be_whole_number": uom["must_be_whole_number"],
                "enabled": uom["enabled"]
            })
            doc.insert(ignore_permissions=True)
            print(f"Created UOM: {uom['uom_name']}")
        else:
            print(f"UOM already exists: {uom['uom_name']}")

    frappe.db.commit()