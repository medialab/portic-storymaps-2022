import csv
import requests
from collections import defaultdict
import sys

from index import get_viz_metas

metas =  get_viz_metas('departs-fr-vers-angleterre')
flows1789 = get_viz_metas('departs-fr-vers-angleterre')['inputs'][1]
flows1787 = '../data/navigo_all_flows_1787.csv'

output = get_viz_metas('departs-fr-vers-angleterre')['outputs'][1]

ports = {}
with open(flows1787, "r") as muerte:
    reader = csv.DictReader(muerte)
    for i, row in enumerate(reader):
        # if "1789" in row["outdate_fixed"] \
        if "1787" in row["outdate_fixed"] \
        and row["departure_function"] == "O" \
        :
            port_detail = row["departure_fr"]
            departure_province = row["departure_province"]
            if departure_province == 'Provence':
                if port_detail == 'Marseille':
                    continue
                else:
                    departure_province = port_detail
                
            if departure_province in ["Aunis", "Poitou", "Saintonge"]:
                departure_province = "Aunis, Poitou, Saintonge"
            port = departure_province
            latitude = row["departure_latitude"]
            longitude = row["departure_longitude"]
            tonnage = float(row["tonnage"] or 0)
            if port == "":
                continue
            if port not in ports:
                ports[port] = {
                    "latitude": latitude,
                    "longitude": longitude,
                    "ports": [port_detail],
                    "departs_vers_gb": {
                        "nb_pointcalls": 0,
                        "tonnage": 0
                    },
                    "departs_hors_gb": {
                        "nb_pointcalls": 0,
                        "tonnage": 0
                    },
                }
            if port_detail not in ports[port]["ports"]:
                ports[port]["ports"].append(port_detail)
            if row["destination_state_1789_fr"] == "Grande-Bretagne" \
            and "colonies britanniques" not in row['destination_substate_1789_fr']\
            :
                ports[port]["departs_vers_gb"]["nb_pointcalls"] += 1
                ports[port]["departs_vers_gb"]["tonnage"] += tonnage
            else:
                ports[port]["departs_hors_gb"]["nb_pointcalls"] += 1
                ports[port]["departs_hors_gb"]["tonnage"] += tonnage

csv_data = []
for port, data in ports.items():
    csv_data.append({
        "port": port,
        "latitude": data["latitude"],
        "longitude": data["longitude"],
        "departs_vers_gb_nb_pointcalls": data["departs_vers_gb"]["nb_pointcalls"],
        "departs_vers_gb_tonnage": data["departs_vers_gb"]["tonnage"],
        "departs_hors_gb_nb_pointcalls": data["departs_hors_gb"]["nb_pointcalls"],
        "departs_hors_gb_tonnage": data["departs_hors_gb"]["tonnage"],
        "ports": ", ".join(data["ports"])
    })

with open(output, "w") as muerte:
    writer = csv.DictWriter(muerte, fieldnames=csv_data[0].keys())
    writer.writeheader()
    writer.writerows(csv_data)