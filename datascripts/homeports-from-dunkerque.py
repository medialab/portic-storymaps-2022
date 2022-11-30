import csv
import json
from collections import defaultdict
import sys


from index import get_viz_metas

output = get_viz_metas('homeports-from-dunkerque')['outputs'][0]
pointcalls = get_viz_metas('homeports-from-dunkerque')['inputs'][0]

homeports = {}
with open(pointcalls, "r") as r:
  reader = csv.DictReader(r)
  for i, pointcall in enumerate(reader):
    if pointcall['pointcall'] != 'Dunkerque':
      continue
    tonnage = float(pointcall['tonnage']) if pointcall['tonnage'] != '' else 0
    homeport_fr = pointcall['homeport_toponyme_fr'] or "Indéterminé"
    homeport_en = pointcall['homeport_toponyme_en'] or "Undefined"
    homeport_state_fr = pointcall['homeport_state_1789_fr'] or "Indéterminé"
    homeport_state_en = pointcall['homeport_state_1789_en'] or "Undefined"
    state_category = "France" if homeport_state_fr == "France" else "étranger"
    if homeport_state_fr == "Grande-Bretagne":
      state_category = "Grande Bretagne"
    # if homeport_fr == "Dunkerque":
    #   homeport_state_fr = "Dunkerque"
    #   homeport_state_en = "Dunkerque"
    if homeport_fr not in homeports:
      homeports[homeport_fr] = {
        "homeport_fr": homeport_fr,
        "homeport_en": homeport_en,
        "homeport_state_fr": homeport_state_fr,
        "homeport_state_en": homeport_state_en,
        "state_category": state_category,
        "tonnage": 0,
        "nb_pointcalls": 0
      }
    homeports[homeport_fr]["tonnage"] += tonnage
    homeports[homeport_fr]["nb_pointcalls"] += 1

with open(output, "w") as w:
  fieldnames = [
    "homeport_fr",
    "homeport_en",
    "state_category",
    "homeport_state_fr",
    "homeport_state_en",
    "tonnage",
    "nb_pointcalls"
  ]
  writer = csv.DictWriter(w, fieldnames=fieldnames)
  writer.writeheader()
  for _homeport, values in homeports.items():
    writer.writerow(values)