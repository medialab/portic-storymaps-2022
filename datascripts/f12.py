import csv
import requests
from index import (
    get_viz_metas
)

SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHqTGjTMavPEw0Mf4RBjvXz5qhBjWV7a1gYuokEvaKRP-HzBSURdpCozaXzHHySXLKQWrQcO7LGk2K/pub?output=csv'

OUTPUT_PATH = "../public/data/tonnages_f12_1787.csv";

results = []
with requests.Session() as s:
    download = s.get(SPREADSHEET_URL)
    decoded_content = download.content.decode('utf-8')
    reader = csv.DictReader(decoded_content.splitlines(), delimiter=',')
    for row in reader:
      results.append(row)

transpal = {
  "destination_state_1789_fr": "destination",
  "tonnage_a_utiliser_clean": "tonnage_hypothese_avec_lest",
  "tonnage_hypothese_sans_lest": "tonnage_hypothese_sans_lest"
}

data = []
for item in results:
  if len(item["destination_state_1789_fr"]) > 0:
    el = {}
    for fr, to in transpal.items():
      val = item[fr].replace("\u202f", "")
      if to == "destination":
        el[to] = val
      else:
        el[to] = int(val) if len(val) else 0
    data.append(el)

with open(OUTPUT_PATH, 'w', newline='') as csvfile:
  fieldnames = transpal.values();
  writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
  writer.writeheader()
  writer.writerows(data)