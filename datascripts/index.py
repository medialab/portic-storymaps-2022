import json

PATH_DATA = '../data/'
PATH_DATA_PUBLIC = '../public/data/'
FILE_JSON_INDEX = '../src/data/viz.json'

def get_viz_metas(viz_id):
    """
    Obtenir les métadonneés d'une visualisation
    :param str viz_id: Identifiant de la visualisation
    :return dict
    """
    json_file = open(FILE_JSON_INDEX, "r").read()
    json_content = json.loads(json_file)
    result = json_content[viz_id]
    # result = [viz for viz in viz_list if viz['id'] == viz_id][0]

    result['inputs'] = [PATH_DATA + path for path in result['inputs']]
    result['outputs'] = [PATH_DATA_PUBLIC + path for path in result['outputs']]

    return result