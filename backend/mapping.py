# mapping.py

def prepare_map_data(reports):
    map_data = []

    for report in reports:
        lat = report.get("latitude")
        lng = report.get("longitude")
        severity = report.get("severity")

        # Skip invalid data
        if lat and lng:
            map_data.append({
                "lat": float(lat),
                "lng": float(lng),
                "severity": severity
            })

    return map_data