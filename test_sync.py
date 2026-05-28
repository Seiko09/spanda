import os
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
import httpx
from main import app
from fastapi.testclient import TestClient

def test_everything():
    with TestClient(app) as client:
        # API Health
        res = client.get("/api/health")
        assert res.status_code == 200

        # Static
        if not os.path.exists("static"):
            os.makedirs("static")
        with open("static/index.html", "w") as f:
            f.write("test_content")

        res = client.get("/")
        assert res.status_code == 200
        # FileResponse content reading
        assert res.text == "test_content"

if __name__ == "__main__":
    test_everything()
    print("Integration tests PASSED!")
