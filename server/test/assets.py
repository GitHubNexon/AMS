from pathlib import Path
import json

# Create the list of 25 assets (5 for each category)
categories = {
    "Office Equipment": [
        ("Laptop-001", "ACER", "ACER LAPTOP", 25000),
        ("Printer-002", "HP LaserJet", "HP Laser Printer", 15000),
        ("Scanner-003", "CanonScan", "Document Scanner", 10000),
        ("Shredder-004", "Fellowes", "Paper Shredder", 8000),
        ("Phone-005", "Cisco", "VoIP Phone", 7000),
    ],
    "Furniture": [
        ("Chair-006", "ErgoChair", "Ergonomic Office Chair", 5000),
        ("Desk-007", "IKEA Desk", "Office Desk", 10000),
        ("Cabinet-008", "SteelCab", "Filing Cabinet", 8000),
        ("Table-009", "ConfTable", "Conference Table", 15000),
        ("Shelf-010", "Bookshelf", "Office Bookshelf", 6000),
    ],
    "Vehicle": [
        ("Vehicle-011", "Toyota", "Company Car", 800000),
        ("Vehicle-012", "Honda", "Delivery Van", 600000),
        ("Vehicle-013", "Suzuki", "Service Motorcycle", 150000),
        ("Vehicle-014", "Mitsubishi", "Pickup Truck", 700000),
        ("Vehicle-015", "Isuzu", "Cargo Truck", 900000),
    ],
    "Electronic Equipment": [
        ("Projector-016", "Epson", "Multimedia Projector", 30000),
        ("Monitor-017", "Dell", "LED Monitor", 12000),
        ("Camera-018", "Logitech", "Web Camera", 5000),
        ("Router-019", "TP-Link", "WiFi Router", 4000),
        ("Speaker-020", "JBL", "Conference Speaker", 10000),
    ],
    "Machinery & Tools": [
        ("Drill-021", "Bosch", "Electric Drill", 10000),
        ("Cutter-022", "Makita", "Metal Cutter", 15000),
        ("Welder-023", "Lincoln", "Welding Machine", 25000),
        ("Compressor-024", "Hitachi", "Air Compressor", 30000),
        ("Saw-025", "DeWalt", "Circular Saw", 18000),
    ],
}

assets = []
code_counter = 1

for category, items in categories.items():
    for i, (prop_no, name, desc, unit_cost) in enumerate(items):
        quantity = 5
        inventory = []
        for j in range(quantity):
            inventory.append({
                "invNo": f"{prop_no}-{chr(65 + j)}",
                "invName": name,
                "description": desc,
                "code": f"{code_counter:04d}",
                "status": "Available"
            })
            code_counter += 1

        asset = {
            "propNo": prop_no,
            "propName": name,
            "propDescription": desc,
            "unitCost": unit_cost,
            "acquisitionDate": "2025-05-06T00:00:00.000Z",
            "inventory": inventory,
            "useFullLife": 60,
            "assetImage": "",
            "quantity": quantity,
            "acquisitionCost": unit_cost * quantity,
            "reference": "test",
            "category": category,
            "accumulatedAccount": "accumulated",
            "depreciationAccount": "depreciation",
            "attachments": [],
            "Status": {"isDeleted": False, "isArchived": False},
            "CreatedBy": {
                "name": "Administrator",
                "position": "Administrator",
                "_id": "66fc98f526728f8c6c24a1aa",
            },
        }
        assets.append(asset)

# Ensure the json folder exists and save the file
output_dir = Path("test")
output_dir.mkdir(parents=True, exist_ok=True)
output_path = output_dir / "dummy_assets.json"

with open(output_path, "w") as f:
    json.dump(assets, f, indent=2)

print(f"Saved to {output_path}")
