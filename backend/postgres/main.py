"""Convenience shim so you can run `uvicorn main:app` from the
`backend/postgres` directory.

This file simply imports the FastAPI `app` from the package located in
`backend/postgres/app/main.py` using the local `app` package that exists
as a subdirectory of this folder.
"""

from app.main import app  # noqa: F401
