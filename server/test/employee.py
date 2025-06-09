from pathlib import Path
import json
from datetime import datetime
import random

# 30 fictional movie-inspired employee names
names = [
    "Cooper",
    "Bruce Wayne",
    "Tony Stark",
    "Natasha Romanoff",
    "Clark Kent",
    "Diana Prince",
    "Peter Parker",
    "Selina Kyle",
    "Barry Allen",
    "Arthur Curry",
    "Steve Rogers",
    "Wanda Maximoff",
    "Bruce Banner",
    "Stephen Strange",
    "Lara Croft",
    "Jason Bourne",
    "Ellen Ripley",
    "John Wick",
    "James Bond",
    "Trinity",
    "Neo",
    "Morpheus",
    "Rick Deckard",
    "Sarah Connor",
    "Max Rockatansky",
    "Elle Woods",
    "Forrest Gump",
    "Jack Sparrow",
    "Indiana Jones",
    "Hermione Granger",
]

employee_types = ["Full-Time", "Part-Time", "Contractor", "Intern"]
positions = [
    "Manager",
    "Engineer",
    "Analyst",
    "Developer",
    "Consultant",
    "Technician",
    "Clerk",
]
divisions = ["Operations", "Finance", "HR", "IT", "Marketing", "Legal"]
departments = ["Department A", "Department B", "Department C", "Department D"]
sections = ["Section 1", "Section 2", "Section 3"]


def random_date_of_birth(start_year=1960, end_year=2000):
    year = random.randint(start_year, end_year)
    month = random.randint(1, 12)
    day = random.randint(1, 28)  # simple to avoid invalid dates
    return f"{year:04d}-{month:02d}-{day:02d}"


def random_phone():
    return f"+1-555-{random.randint(1000,9999)}"


def random_email(name):
    domains = ["example.com", "testmail.com", "email.com"]
    return f"{name.lower()}@{random.choice(domains)}"


employees = []

for i, name in enumerate(names, 1):
    emp = {
        "employeeName": name,
        "employeeImage": "",  # empty string, can be URL or base64
        "employeeType": random.choice(employee_types),
        "employeePosition": random.choice(positions),
        "employeeDivision": random.choice(divisions),
        "employeeDepartment": random.choice(departments),
        "employeeSection": random.choice(sections),
        "address": f"{random.randint(100,999)} Fictional St, Movie City",
        "contactNo": random_phone(),
        "email": random_email(name.replace(" ", "").lower()),
        "dateOfBirth": random_date_of_birth(),
        "Status": {"isDeleted": False, "isArchived": False},
        "assetRecords": [],
        "CreatedBy": {
            "name": "Administrator",
            "position": "Administrator",
            "_id": "66fc98f526728f8c6c24a1aa",
        },
    }
    employees.append(emp)

# Save to json file
output_dir = Path("test")
output_dir.mkdir(parents=True, exist_ok=True)
output_path = output_dir / "employees_raw.json"

with open(output_path, "w") as f:
    json.dump(employees, f, indent=2)

print(f"Saved {len(employees)} employees to {output_path}")
