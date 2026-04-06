# test_api.py

import requests

# Backend URL
url = "http://127.0.0.1:5000/report"

# Sample data
data = {
    "description": "He is threatening me and stalking me repeatedly",
    "location": "Chennai",
    "latitude": "13.0827",
    "longitude": "80.2707"
}

# Send POST request
response = requests.post(url, data=data)

# Print response
print("Response from server:")
print(response.json())


# Now test GET reports
get_url = "http://127.0.0.1:5000/reports"

response2 = requests.get(get_url)

print("\nAll Reports:")
print(response2.json())


# Test map data
map_url = "http://127.0.0.1:5000/map-data"

response3 = requests.get(map_url)

print("\nMap Data:")
print(response3.json())