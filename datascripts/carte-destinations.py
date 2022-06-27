import csv
import json
from collections import defaultdict
import sys

from index import get_viz_metas

output = get_viz_metas('carte-destinations')['outputs'][-1]
input = get_viz_metas('carte-destinations')['inputs'][0]

with open(input, "r") as fr:
    reader = csv.DictReader(fr)
    with open(output, "w") as fw:
      print("write in " + output)
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
        if row['departure'] == 'Dunkerque' and row['departure_function'] == 'O':
          tonnage = int(row['tonnage'] or 0)
          destination = row['destination']
          destination_state = row['destination_state_1789_fr']
          flag_fr = row['ship_flag_standardized_fr']
          flag_en = row['ship_flag_standardized_en']
          if flag_fr == 'espagne, undeterminé':
            flag_fr = 'espagnol'
          homeport = row['homeport']
          is_long_cours = "long cours" in row["all_taxes"]
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