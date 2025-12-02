import requests
import sys

try:
    response = requests.get("http://localhost:8000/docs", timeout=5)
    if response.status_code == 200:
        print("Server is running!")
    else:
        print(f"Server returned status code: {response.status_code}")
except Exception as e:
    print(f"Could not connect to server: {e}")
