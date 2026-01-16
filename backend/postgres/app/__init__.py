"""Package marker for backend.postgres.app

Making this directory a package allows running `uvicorn main:app` from
the `backend/postgres` folder while keeping imports like `from app.api.employee import ...`.
"""

__all__ = ["api", "db", "models", "schemas"]
