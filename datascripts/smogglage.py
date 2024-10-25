#!/usr/bin/env python3

'''
Description: Get datasets about smogglage between France and Great Britain at 1787
License: GPL-3.0-or-later
Author: Guillaume Brioudes (https://myllaume.fr/)
Date created: 2022-03-25
Date last modified: 2022-03-25
Python Version: 3.10.1
'''

import csv
from index import (
    get_viz_metas
)
from utils import (
    is_smoggleur_dunkerque,
    is_smoggleur_calais,
    is_smoggleur_boulogne,
    is_smoggleur_roscoff,
    is_smoggleur_lorient,
    is_smoggleur_bordeaux,
    is_illegal_commodities
)

ports = {
    'dunkerque': [],
    'calais': [],
    'boulogne': [],
    'roscoff': [],
    'lorient': [],
    'bordeaux': []
}

VIZ_METAS = get_viz_metas('smoggleur-proportion')

for source in VIZ_METAS['inputs']:

    with open(source, newline='') as csvfile:
        reader = csv.DictReader(csvfile)

        for row in reader:
            # we want 1787 only
            if '1787' not in row['indate_fixed']:
                continue
            row['tonnage'] = int(row['tonnage']) if row['tonnage'].isnumeric() == True else 0

            if row['departure_fr'] == 'Dunkerque':
                row['is_smoggleur'] = is_smoggleur_dunkerque(row)
                ports['dunkerque'].append(row)
            if row['departure_fr'] == 'Calais':
                row['is_smoggleur'] = is_smoggleur_calais(row)
                ports['calais'].append(row)
            if row['departure_fr'] == 'Boulogne-sur-Mer':
                row['is_smoggleur'] = is_smoggleur_boulogne(row)
                ports['boulogne'].append(row)
            if row['departure_fr'] == 'Roscoff':
                row['is_smoggleur'] = is_smoggleur_roscoff(row)
                ports['roscoff'].append(row)
            if row['departure_fr'] == 'Lorient':
                row['is_smoggleur'] = is_smoggleur_lorient(row)
                ports['lorient'].append(row)
            if row['departure_fr'] == 'Bordeaux':
                row['is_smoggleur'] = is_smoggleur_bordeaux(row)
                ports['bordeaux'].append(row)

with open(VIZ_METAS['outputs'][0], 'w', newline='') as csvfile:
    fieldnames = [
        'port de départ',
        'port de départ en anglais',
        'total des trajets anglais',
        'trajets anglais smoggleurs',
        '% de trajets anglais smoggleurs',
        'total tonnage',
        'tonnage smoggleur',
        '% de tonnage smoggleurs',
        'total des destinations',
        'destinations smoggleurs',
        '% de destination smoggleurs',
        'smoggleurs avec produits de contrebande',
        '% de smoggleurs avec produits de contrebande'
    ]

    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()

    for port in ports.keys():
        flows = [flow for flow in ports[port] if flow['flag'] == 'British']

        row = dict.fromkeys(
            fieldnames,
            0 # initial value for all fields
        )

        first_flow = ports[port][0]

        row['port de départ'] = first_flow['departure_fr']
        row['port de départ en anglais'] = first_flow['departure_en']
        row['total des trajets anglais'] = len(flows)
        row['trajets anglais smoggleurs'] = len([flow for flow in ports[port] if flow['is_smoggleur'] == True])
        row['% de trajets anglais smoggleurs'] = (row['trajets anglais smoggleurs'] / row['total des trajets anglais']) * 100 if row['total des trajets anglais'] > 0 else 0
        row['total tonnage'] = sum([flow['tonnage'] for flow in ports[port]])
        row['tonnage smoggleur'] = sum([flow['tonnage'] for flow in ports[port] if flow['is_smoggleur'] == True])
        row['% de tonnage smoggleurs'] = (row['tonnage smoggleur'] / row['total tonnage']) * 100 if row['total tonnage'] > 0 else 0
        row['total des destinations'] = len(set([flow['destination_fr'] for flow in ports[port]]))
        row['destinations smoggleurs'] = len(set([flow['destination_fr'] for flow in ports[port] if flow['is_smoggleur'] == True]))
        row['% de destination smoggleurs'] = (row['destinations smoggleurs'] / row['total des destinations']) * 100
        row['smoggleurs avec produits de contrebande'] = len([flow for flow in ports[port] if (flow['is_smoggleur'] == True and is_illegal_commodities(flow) == True)])
        row['% de destination smoggleurs'] = 0 if row['smoggleurs avec produits de contrebande'] == 0 else (row['smoggleurs avec produits de contrebande'] / row['trajets anglais smoggleurs']) * 100

        writer.writerow(row)

VIZ_METAS = get_viz_metas('smoggleur-statut')

with open(VIZ_METAS['outputs'][0], 'w', newline='') as csvfile:
    fieldnames = [
        'departure_fr',
        'departure_longitude',
        'departure_latitude',
        'destination_fr',
        'destination_longitude',
        'destination_latitude',
        'tonnage',
        'is_smoggleur'
    ]

    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)

    writer.writeheader()

    for port in ports.keys():
        flows = [flow for flow in ports[port]]

        for flow in flows:
            if flow['flag'] != 'British':
                continue
            if flow['destination_fr'] in {'Angleterre', 'Angleterre (destination simulée pour)'}:
                flow['destination_fr'] = 'Autre en Angleterre'
                # continue
            if flow['destination_fr'] in {'pas identifié', 'pas mentionné'}:
                flow['destination_fr'] = 'inconnu'
                # continue
            # if flow['is_smoggleur'] == False:
            #     continue
            writer.writerow({
                'departure_fr': flow['departure_fr'],
                'departure_longitude': flow['departure_longitude'],
                'departure_latitude': flow['departure_latitude'],
                'destination_fr': flow['destination_fr'],
                'destination_longitude': flow['destination_longitude'],
                'destination_latitude': flow['destination_latitude'],
                'tonnage': flow['tonnage'],
                'is_smoggleur': 1 if flow['is_smoggleur'] == True else 0
            })