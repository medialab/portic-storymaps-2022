import csv

from index import get_viz_metas

metas =  get_viz_metas('destinations-gb-vers-gb')
flows1787 = get_viz_metas('destinations-gb-vers-gb')['inputs'][1]

output = get_viz_metas('destinations-gb-vers-gb')['outputs'][1]

ports = {}
with open(flows1787, "r") as muerte:
    reader = csv.DictReader(muerte)
    for i, row in enumerate(reader):
        
        if "1787" in row["outdate_fixed"] \
        and row["departure_function"] == "O" \
        and row["departure"] == "Dunkerque" \
        and row["destination"] != "Marseille" \
        and row["flag"] == "British" \
        :
            destination_state = row['destination_state_1789_fr']
            port = row["destination"]
            port_en = row["destination_en"]
            category = "port_specifie"
            if port in ["Lisbonne [mais: Angleterre]", "Bergen"]:
                category = "fausse_destination"
            # elif port == "":
            #     category = "gb_no_port"
            elif destination_state != "Grande-Bretagne":
                continue
            
            
            latitude = row["destination_latitude"]
            longitude = row["destination_longitude"]
            tonnage = int(row["tonnage"] or 0)
           
            if port not in ports:
                ports[port] = {
                    "latitude": latitude,
                    "longitude": longitude,
                    "category": category,
                    "port_en": port_en,
                    "nb_pointcalls": 0,
                    "tonnage": 0
                }
            ports[port]["nb_pointcalls"] += 1
            ports[port]["tonnage"] += tonnage

print('in destinations-gb-vers-gb.py')
csv_data = []
for port, data in ports.items():
    csv_data.append({
        "port": port,
        "port_en": data["port_en"] if data["port_en"] != "England (fake destination for)" else "Lisbon [but : England]",
        "latitude": data["latitude"],
        "longitude": data["longitude"],
        "nb_pointcalls": data["nb_pointcalls"],
        "tonnage": data["tonnage"],
        "category": data["category"]
    })

with open(output, "w") as muerte:
    writer = csv.DictWriter(muerte, fieldnames=csv_data[0].keys())
    writer.writeheader()
    writer.writerows(csv_data)