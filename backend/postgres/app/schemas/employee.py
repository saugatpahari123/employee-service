from pydantic import BaseModel
from datetime import date

class EmployeeCreate(BaseModel):
    employee_id: str
    first_name: str
    last_name: str
    dob: date
    last4_ssn: str
