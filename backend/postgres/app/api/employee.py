from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from ..db.session import get_db, Base, engine
from ..models.employee import Employee
from ..schemas.employee import EmployeeCreate

Base.metadata.create_all(bind=engine)

router = APIRouter()

@router.post("/")
def create_employee(emp: EmployeeCreate, db: Session = Depends(get_db)):
    employee = Employee(**emp.dict())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee

@router.get("/{employee_id}")
def get_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(404, "Employee not found")
    return emp

@router.put("/{employee_id}")
def update_employee(employee_id: str, emp: EmployeeCreate, db: Session = Depends(get_db)):
    db_emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not db_emp:
        raise HTTPException(404, "Employee not found")
    for k, v in emp.dict().items():
        setattr(db_emp, k, v)
    db.commit()
    return db_emp

@router.delete("/{employee_id}")
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    emp = db.query(Employee).filter(Employee.employee_id == employee_id).first()
    if not emp:
        raise HTTPException(404, "Employee not found")
    db.delete(emp)
    db.commit()
    return {"deleted": True}
