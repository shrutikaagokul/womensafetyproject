# mapping.py — S.P.E.A.K. Map Data Preparation

def prepare_map_data(reports):
    """
    Converts stored reports into map-ready format for the frontend MapView.
    Each entry matches the shape expected by MapView.jsx:
    { id, lat, lng, severity, types, description, time, address }
    """
    map_data = []
    location_count = {}

    # ── Count incidents per coordinate (hotspot detection) ────────────────────
    for report in reports:
        try:
            lat = float(report.get("latitude") or 0)
            lng = float(report.get("longitude") or 0)
            if lat == 0 and lng == 0:
                continue
            key = (round(lat, 4), round(lng, 4))
            location_count[key] = location_count.get(key, 0) + 1
        except (TypeError, ValueError):
            continue

    # ── Build map entries ─────────────────────────────────────────────────────
    for report in reports:
        try:
            lat = float(report.get("latitude") or 0)
            lng = float(report.get("longitude") or 0)
            if lat == 0 and lng == 0:
                continue

            key = (round(lat, 4), round(lng, 4))
            count = location_count.get(key, 1)

            # Severity: use stored value (already lowercase from ai_analysis)
            severity = report.get("severity", "low")
            if isinstance(severity, dict):
                # Legacy format guard — old ai_analysis returned a dict
                severity = severity.get("severity", "low").lower()
            severity = severity.lower()

            # Incident types: stored as list from frontend chips
            types = report.get("incident_types", [])
            if not types:
                types = ["Incident"]

            map_data.append({
                "id":          report.get("id", "SPK-???"),
                "lat":         lat,
                "lng":         lng,
                "severity":    severity,
                "types":       types,
                "description": report.get("description", "No details provided."),
                "address":     report.get("location", "Unknown location"),
                "time":        report.get("time_ago", "Recently"),
                "count":       count,
                "hotspot":     count >= 2,
            })

        except (TypeError, ValueError):
            continue

    return map_data