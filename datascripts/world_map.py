#!/usr/bin/env python3

'''
Description: Get world map as simplified GeoJson file, used for SVG maps
License: GPL-3.0-or-later
Author: Guillaume Brioudes (https://myllaume.fr/)
Date last modified: 2022-05-23
Python Version: 3.10.1
'''

import requests
import json
import sys
import os

import visvalingamwyatt as vw

GEOJSON_URL = 'https://raw.githubusercontent.com/medialab/portic-storymaps-2021/main/public/data/map_backgrounds/map_cartoweb_world_1789_29juillet2021_mixte4326_geojson_UTF8.geojson'
GEOJSON_FOLDER_PATH = '../public/data/map_backgrounds/'
GEOJSON_FILE_NAME = 'world_map.geojson'
KEEP_POINTS_RATIO = 0.001 # raised ratio = more points = more size
# KEEP_POINTS_RATIO = 0.2 # raised ratio = more points = more size
NO_SIMPLIFY_LIST = {
    # 'Poitou',
    # 'Aunis',
    # 'Saintonge',
    # 'Bretagne',
    # 'Anjou',
    # 'Saumurois',
    # 'Angoumois',
  'Normandie', 
  'Grande-Bretagne', 
  'Picardie', 
  'Bretagne'
}

with requests.Session() as s:
    print('Get .geojson file')
    download = s.get(GEOJSON_URL)
    decoded_content = download.content.decode('utf-8')
    json_content = json.loads(decoded_content)
    features = json_content['features']
    print('Simplify features')
    for i, feature in enumerate(features):
        # if feature['properties']['dominant'] not in ACCEPTED_LIST:
        #     del json_content['features'][i]
        if feature['properties']['shortname'] in NO_SIMPLIFY_LIST:
            continue
        feature_simplify = vw.simplify_feature(feature, threshold=KEEP_POINTS_RATIO)
        coordinates_simplify = feature_simplify['geometry']['coordinates']
        json_content['features'][i]['geometry']['coordinates'] = coordinates_simplify
        # sys.stdout.write("\rSimplify %i" % i) ; sys.stdout.flush() # consol print
    if not os.path.exists(GEOJSON_FOLDER_PATH):
      os.mkdir(GEOJSON_FOLDER_PATH)
    with open(GEOJSON_FOLDER_PATH + GEOJSON_FILE_NAME, "w") as geojson_file:
        geojson_file_content = json.dumps(json_content)
        geojson_file.write(geojson_file_content)