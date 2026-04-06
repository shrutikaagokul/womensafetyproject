# mapping.py

def prepare_map_data(reports):
    location_count = {}
    map_data = []

    for report in reports:
        key = (report["latitude"], report["longitude"])
        location_count[key] = location_count.get(key, 0) + 1

    for report in reports:
        key = (report["latitude"], report["longitude"])

        map_data.append({
            "lat": float(report["latitude"]),
            "lng": float(report["longitude"]),
            "severity": report["severity"],
            "count": location_count[key],
            "hotspot": location_count[key] >= 2
        })

    return map_data
    map_data = []

    for report in reports:
        lat = report.get("latitude")
        lng = report.get("longitude")
        severity = report.get("severity")

        try:
            if lat and lng:
                map_data.append({
                    "lat": float(lat),
                    "lng": float(lng),
                    "severity": severity
                })
        except:
            continue  # skip invalid data

    return map_data