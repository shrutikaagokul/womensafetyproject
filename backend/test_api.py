# test.py — S.P.E.A.K. API Test Suite
# Run: python test.py  (while app.py is running in another terminal)

import requests
import json

BASE = "http://127.0.0.1:5000"
DIVIDER = "\n" + "─" * 55


def pretty(label, data):
    print(f"\n✅  {label}")
    print(json.dumps(data, indent=2))


def test_home():
    print(DIVIDER)
    print("1️⃣  GET / — Health check")
    r = requests.get(f"{BASE}/")
    pretty("Backend status", r.json())


def test_submit_reports():
    print(DIVIDER)
    print("2️⃣  POST /report — Submit test incidents")

    test_cases = [
        {
            "description": "A man has been stalking me and threatening me every day near the bus stop.",
            "location": "Anna Nagar, Chennai",
            "latitude": "13.0827",
            "longitude": "80.2707",
            "incident_types": ["Stalking", "Harassment"],
            "anonymous": True,
        },
        {
            "description": "Someone grabbed my chain and ran. It happened very fast near the signal.",
            "location": "T. Nagar, Chennai",
            "latitude": "13.0750",
            "longitude": "80.2600",
            "incident_types": ["Theft / Robbery"],
            "anonymous": True,
        },
        {
            "description": "The street lights are broken and it feels very unsafe at night after 9 PM.",
            "location": "Adyar, Chennai",
            "latitude": "13.0067",
            "longitude": "80.2206",
            "incident_types": ["Unsafe Area"],
            "anonymous": False,
        },
        {
            "description": "He threatened to kill me with a knife. I managed to escape. Please help.",
            "location": "Velachery, Chennai",
            "latitude": "12.9815",
            "longitude": "80.2180",
            "incident_types": ["Assault"],
            "anonymous": True,
        },
    ]

    submitted_ids = []
    for i, case in enumerate(test_cases, 1):
        r = requests.post(f"{BASE}/report", json=case)
        data = r.json()
        print(f"\n   Report {i} → ID: {data.get('report_id')} | Severity: {data.get('severity').upper()} | {data.get('ai_reason')}")
        submitted_ids.append(data.get("report_id"))

    return submitted_ids


def test_get_reports():
    print(DIVIDER)
    print("3️⃣  GET /reports — All stored reports")
    r = requests.get(f"{BASE}/reports")
    reports = r.json()
    print(f"\n   Total reports in store: {len(reports)}")
    for rep in reports:
        print(f"   {rep['id']} | {rep['severity'].upper():6} | {rep['location']}")


def test_map_data():
    print(DIVIDER)
    print("4️⃣  GET /map-data — Map markers for MapView.jsx")
    r = requests.get(f"{BASE}/map-data")
    markers = r.json()
    print(f"\n   Total markers: {len(markers)}")
    for m in markers:
        print(f"   [{m['severity'].upper():6}] {m['address']} → lat:{m['lat']}, lng:{m['lng']} | hotspot:{m['hotspot']}")


def test_dashboard_stats():
    print(DIVIDER)
    print("5️⃣  GET /dashboard-stats — KPIs for Dashboard.jsx")
    r = requests.get(f"{BASE}/dashboard-stats")
    stats = r.json()
    print(f"\n   Total: {stats['total']} | Active: {stats['active']} | Resolved: {stats['resolved']}")
    print(f"   High: {stats['high']} | Medium: {stats['medium']} | Low: {stats['low']}")
    print(f"\n   Recent feed ({len(stats['recent_feed'])} items):")
    for item in stats["recent_feed"]:
        print(f"   {item['icon']} {item['location']:20} — {item['status']:10} | {item['time']}")


if __name__ == "__main__":
    print("\n🚀  S.P.E.A.K. API Test Suite")
    print("    Make sure app.py is running: python app.py")

    try:
        test_home()
        test_submit_reports()
        test_get_reports()
        test_map_data()
        test_dashboard_stats()
        print(DIVIDER)
        print("\n🎉  All tests passed! Frontend is ready to connect.\n")

    except requests.exceptions.ConnectionError:
        print("\n❌  Could not connect to backend.")
        print("    Start the server first:  python app.py\n")