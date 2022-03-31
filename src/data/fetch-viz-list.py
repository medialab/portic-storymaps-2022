
import requests
import csv
import json

GSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQjllJXqWEPJ2cBWNNBAnKR4Kwt10LOR9AiLe4xyM5LNoC-c8y3AzNKJs4BtlEizuenQDFcYkoZvwJj/pub?gid=0&single=true&output=csv'

with requests.Session() as s:
    download = s.get(GSHEET_URL)
    decoded_content = download.content.decode('utf-8')

    vizualisations = {}

    reader = csv.DictReader(decoded_content.splitlines(), delimiter=',')
    for row in reader:
        row['n_chapitre'] = int(row['n_chapitre'])
        row['inputs'] = row['inputs'].split(',') # 'item1,item2' => ['item1', 'item2']
        row['outputs'] = row['outputs'].split(',')
        vizualisations[ row['id'] ] = row

    json_object = json.dumps(vizualisations, indent=4, ensure_ascii=False)
    with open("viz.json", "w") as f:
        f.write(json_object)