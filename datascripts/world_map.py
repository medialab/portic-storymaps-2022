import requests
import json
import sys

import visvalingamwyatt as vw

GEOJSON_URL = 'https://raw.githubusercontent.com/medialab/portic-storymaps-2021/main/public/data/map_backgrounds/map_cartoweb_world_1789_29juillet2021_mixte4326_geojson_UTF8.geojson'
GEOJSON_FILE_PATH = '../public/data/world_map.geojson'
KEEP_POINTS_RATIO = 0.3

with requests.Session() as s:
    print('Get .geojson file')
    download = s.get(GEOJSON_URL)
    decoded_content = download.content.decode('utf-8')
    json_content = json.loads(decoded_content)
    features = json_content['features']
    for i, feature in enumerate(features):
        feature_simplify = vw.simplify_feature(feature, threshold=KEEP_POINTS_RATIO)
        coordinates_simplify = feature_simplify['geometry']['coordinates']
        json_content['features'][i]['geometry']['coordinates'] = coordinates_simplify
        sys.stdout.write("\rSimplify %i" % i) ; sys.stdout.flush() # consol print
    with open(GEOJSON_FILE_PATH, "w") as geojson_file:
        geojson_file_content = json.dumps(json_content)
        geojson_file.write(geojson_file_content)