# allow us to use all dependencies that we installed in the environment of fastAPI
from fastapi import FastAPI 
from .api.employee import router

# allow to use the dependencies that we installed in the environment of fastAPI
app = FastAPI(title="Employee Service - MongoDB")
app.include_router(router, prefix="/api/employees")
