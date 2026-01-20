from sqlalchemy import Column, String, Date
from db.session import Base
class Employee(Base):
    __tablename__ = "employees"

    employee_id = Column(String(5), primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    dob = Column(Date)
    last4_ssn = Column(String(4))
