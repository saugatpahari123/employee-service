from fastapi import APIRouter, HTTPException
from ..db.mongo import collection

router = APIRouter()

@router.post("/")
def create_employee(emp: dict):
    collection.insert_one(emp)
    return emp

@router.get("/{employee_id}")
def get_employee(employee_id: str):
    emp = collection.find_one({"employee_id": employee_id}, {"_id": 0})
    if not emp:
        raise HTTPException(404, "Employee not found")
    return emp

@router.put("/{employee_id}")
def update_employee(employee_id: str, emp: dict):
    collection.update_one({"employee_id": employee_id}, {"$set": emp})
    return emp

@router.delete("/{employee_id}")
def delete_employee(employee_id: str):
    collection.delete_one({"employee_id": employee_id})
    return {"deleted": True}
