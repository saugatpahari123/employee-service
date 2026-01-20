<<<<<<< HEAD
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.employee import router
import os

app = FastAPI(title="Employee Service - PostgreSQL")

origins = ["http://localhost:3000"]


app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
=======
from fastapi.responses import Response


from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.employee import router
from app.db.session import Base, engine
app = FastAPI(title="Employee Service - PostgreSQL")

# CORS middleware must be before router inclusion
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
>>>>>>> 21c78e4 (Update deployment and setup docs for project)
    allow_methods=["*"],
    allow_headers=["*"],
    )

<<<<<<< HEAD

=======
# Print all routes at startup for debugging
@app.on_event("startup")
async def print_routes():
    print("Startup event running")
    print("Registered routes:")
    for route in app.routes:
        print(f"{route.path} [{','.join(route.methods)}]")

@app.get("/favicon.ico")
async def favicon():
    return Response(status_code=204)


@app.on_event("startup")
def startup():
    Base.metadata.create_all(bind=engine)


# Add robust OPTIONS handlers for both /api/employees and /api/employees/
@app.options("/api/employees")
async def options_employees():
    return Response(status_code=204)

@app.options("/api/employees/")
async def options_employees_slash():
    return Response(status_code=204)

print("Including router: app.api.employee.router with prefix /api/employees")
>>>>>>> 21c78e4 (Update deployment and setup docs for project)
app.include_router(router, prefix="/api/employees")
