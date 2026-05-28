import os
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
import httpx
from main import app
from fastapi.testclient import TestClient

def test_flow():
    with TestClient(app) as client:
        response = client.get("/")
        assert response.status_code == 200
        response = client.post("/token", data={"username": "admin", "password": "Password123"})
        assert response.status_code == 200

if __name__ == "__main__":
    test_flow()
    print("Verification passed!")
