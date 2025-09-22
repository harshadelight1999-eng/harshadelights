from frappe import _

def get_data():
    return [
        {
            "module_name": "Confectionery Production",
            "color": "grey",
            "icon": "octicon octicon-gear",
            "type": "module",
            "label": _("Confectionery Production")
        },
        {
            "module_name": "Inventory Management",
            "color": "grey",
            "icon": "octicon octicon-package",
            "type": "module",
            "label": _("Inventory Management")
        },
        {
            "module_name": "Quality Control",
            "color": "grey",
            "icon": "octicon octicon-checklist",
            "type": "module",
            "label": _("Quality Control")
        },
        {
            "module_name": "Customer Segmentation",
            "color": "grey",
            "icon": "octicon octicon-people",
            "type": "module",
            "label": _("Customer Segmentation")
        },
        {
            "module_name": "Pricing and Sales",
            "color": "grey",
            "icon": "octicon octicon-graph",
            "type": "module",
            "label": _("Pricing and Sales")
        }
    ]