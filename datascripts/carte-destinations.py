import csv
import requests

from index import get_viz_metas

output = get_viz_metas('carte-destinations')['outputs'][-1]
input = '../data/navigo_all_flows.csv' # get_viz_metas('carte-destinations')['inputs'][1]

# map_input =  get_viz_metas('carte-destinations')['inputs'][0]
# map_output =  get_viz_metas('carte-destinations')['outputs'][0]


# with open(map_output, "w") as mr:
#   print("get map background https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson")
#   with requests.Session() as s:
#     download = s.get("https://d2ad6b4ur7yvpq.cloudfront.net/naturalearth-3.3.0/ne_50m_land.geojson")
#     decoded_content = download.content.decode('utf-8')
#     mr.write(decoded_content)
#     print("done")
#   mr.close()


with open(input, "r") as fr:
    reader = csv.DictReader(fr)
    with open(output, "w") as fw:
      fieldnames = [
        "destination",
        "destination_state",
        "destination_latitude",
        "destination_longitude",
        "homeport",
        "flag_fr",
        "flag_en",
        "long_cours",
        "tonnage"
      ]
      writer = csv.DictWriter(fw, fieldnames=fieldnames)
      writer.writeheader()
      for row in reader:
        year = row["departure_out_date"][0: 4]
        if year == "1789" and row['departure'] == 'Dunkerque' and row['departure_function'] == 'O':
          tonnage = int(row['tonnage'] or 0)
          destination = row['destination']
          destination_state = row['destination_state_1789_fr']
          flag_fr = row['ship_flag_standardized_fr']
          flag_en = row['ship_flag_standardized_en']
          if flag_fr == 'espagne, undeterminé':
            flag_fr = 'espagnol'
          homeport = row['homeport']
          taxes_fields = ["tax_concept1", "tax_concept2", "tax_concept3", "tax_concept4", "tax_concept5"]
          all_taxes = " ".join([row[f] for f in taxes_fields])
          is_long_cours = "long cours" in all_taxes
          writer.writerow({
            "destination": destination,
            "destination_state": destination_state,
            "destination_latitude": row["destination_latitude"],
            "destination_longitude": row["destination_longitude"],
            "homeport": homeport,
            "flag_fr": flag_fr.lower() or "inconnu",
            "flag_en": flag_en.lower() or "unknown",
            "long_cours": "1" if is_long_cours else "0",
            "tonnage": tonnage
          })