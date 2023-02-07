import csv
import requests
from collections import defaultdict
import sys

from index import get_viz_metas

metas =  get_viz_metas('exports-vs-smogglage')
prices_sheet = get_viz_metas('exports-vs-smogglage')['inputs'][0]
pointcalls = get_viz_metas('exports-vs-smogglage')['inputs'][1]

"""
0 - lib
"""
def get_online_csv(url):
  """
  Cette fonction permet de récupérer le contenu d'un csv en ligne.
  Pour les google spreadsheets: fichier > publier sur le web > format csv > copier le lien
  """
  results = []
  with requests.Session() as s:
      download = s.get(url)
      decoded_content = download.content.decode('utf-8')
      reader = csv.DictReader(decoded_content.splitlines(), delimiter=',')
      for row in reader:
        results.append(row)
  return results

prices_sheet_url = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRFUMKd1Wfgo9vuETmpsnvp3BLbwzxtN_HSikGN-MtXz6wEvaO_tyQf9G1z2TlBWfByUH3u4-abpnFk/pub?output=csv';
prices_sheet = get_online_csv(prices_sheet_url)

smogglers_pointcalls_url = 'https://raw.githubusercontent.com/medialab/portic-datasprint-2022/main/productions/module_05/data/dunkerque_smugglers_shipmentvalues.csv';
smogglers_pointcalls = get_online_csv(smogglers_pointcalls_url)
# print('\n'.join(smogglers_pointcalls[0].keys()))
homeports_states = set()
for p in smogglers_pointcalls:
  homeports_states.add(p['homeport_state_1789_fr'])
# print(homeports_states)

prices_path = get_viz_metas('exports-vs-smogglage')['outputs'][0]
by_port_path = get_viz_metas('exports-vs-smogglage')['outputs'][1]

# fetch and write data from https://docs.google.com/spreadsheets/d/1NdzRMa2JvuDndKk_sJNukT0yACxqj2BJoOvQcHCauDo/edit#gid=736079474
with open(prices_path, 'w') as prices_writer:
  headers = prices_sheet[0].keys()
  writer = csv.DictWriter(prices_writer, fieldnames=headers)
  writer.writeheader()
  for row in prices_sheet:
    if row['produit_smogglé'] != 'total':
      writer.writerow(row)

ports = {}
quantitative_fields = [
  "geniève (pintes de Paris)",
"eau-de-vie (pintes de Paris)",
"Taffia (pintes de Paris)",
"tabac en feuilles (livres poids)",
"thé (livres poids)",
"corinthes (livres poids)",
"vin rouge (pintes)",
"vin fin (pintes)",
"vin (barriques)",
"vin (pots)",
"liqueurs (pintes)",
"tabac en poudre (livre poids)",
"tabac fabriqué (livres poids)",
"tabac en côtes (livres poids)",
"drogues (livres poids)",
"rhubarbre (livres poids)",
"amidon (livres poids)",
"café (livres poids)",
"sucre brut (livres poids)",
"sucre rafiné (livres)",
"sucre en pain (livres poids)",
"mousseline (livres poids)",
"mousseline (livres tounois)",
"mousseline des Indes (livres tournois)",
"mousselines et mouchoirs (livres tournois)",
"mouchoirs de mousseline (livres poids)",
"mouchoirs de mousselin (valeur en £-stg)",
"mouchoirs de soie (livres poids)",
"mouchoirs de soie (livres tournois)",
"perses (livres poids)",
"nankins (livres poids)",
"nankins (pièces)",
"mouchoirs de Bandannoes (livres poids)",
"Bandanoes (livres poids)",
"bandanoes (valeur livres tournois)",
"Bandanoes (pièces)",
"Dimity (?) (livres poids)",
"crêpes (livres poids)",
"Soie des Indes (livres poids)",
"soie et mousseline (livres tournois)",
"marchandises des Indes (livres tournois)",
"soieries (livres tournois)",
"Jalap (livres poids)",
"Taffetas (livres poids)",
"Cambray (en livres tournois)",
"Cambray (en £ stg)",
"cambray (livres poids)",
"Gauzes (livres poids)",
"mercerie fine (livres poids)",
"sené (livres poids)",
"nacres de perle (livres tournois)",
"pots de vess (en bouteiilles) /  potjevleesch???",
"porcelaine (livres tournois)",
"voiture",
"Chocolat (livres poids)",
"cartes à jouer (en livres poids)",
"poudre à poudrer (livres poids)",
"shipment_price",
]
# print('\n'.join(list(smogglers_pointcalls[0].keys())))
for p in smogglers_pointcalls:
  port = p['homeport_standardized_fr']
  port = port if port.strip() != "" else "Indéfini"
  lat =  p['homeport_lat']
  longitude = p['homeport_long']
  comte = p["homeport_comte"]
  if port not in ports:
    ports[port] = {
      "port": port,
      "latitude": lat,
      "longitude": longitude,
      "comte": comte,
      "tonnage": 0,
      "nb_pointcalls": 0
    }
    for f in quantitative_fields:
      ports[port][f] = 0
  ports[port]["nb_pointcalls"] += 1
  tonnage = float(p["ship_tonnage"]) if p["ship_tonnage"] != "" else 0
  ports[port]["tonnage"] += tonnage

  for field in quantitative_fields:
    val = p[field]
    val = float(val) if val != "" else 0
    ports[port][field] += val
  
ports = list(ports.values())
# print(ports)
with open(by_port_path, 'w') as ports_writer:
  writer = csv.DictWriter(ports_writer, fieldnames=ports[0].keys())
  writer.writeheader()
  writer.writerows(ports)
 
#   headers_written = False

#   with open(prices_sheet, 'r') as prices_reader:
#     reader = csv.DictReader(prices_reader)
#     for row in reader:
#       if headers_written is False:
#         headers = row.keys()
#         writer = csv.DictReader(prices_reader, headers=headers)
#         headers_written = True
#       writer.writerow(row)
