
import csv
import json

years = ['1787', '1789']

output_path = '../public/data/resume-activite-dunkerquois.csv'
output_data = []


def singleQuoteToDoubleQuote(singleQuoted):
    '''
    convert a single quoted string to a double quoted one
    Args:
        singleQuoted(string): a single quoted string e.g. {'cities': [{'name': "Upper Hell's Gate"}]}
    Returns:
        string: the double quoted version of the string e.g. 
    see
        - https://stackoverflow.com/questions/55600788/python-replace-single-quotes-with-double-quotes-but-leave-ones-within-double-q 
    '''
    cList = list(singleQuoted)
    inDouble = False
    inSingle = False
    for i, c in enumerate(cList):
        # print ("%d:%s %r %r" %(i,c,inSingle,inDouble))
        if c == "'":
            if not inDouble:
                inSingle = not inSingle
                cList[i] = '"'
        elif c == '"':
            inDouble = not inDouble
    doubleQuoted = "".join(cList)
    return doubleQuoted


i = 0
# for year in years:
#     pointcalls_path = '../data/navigo_all_pointcalls_' + year + '.csv'
#     with open(pointcalls_path, 'r') as muerte:
#       reader = csv.DictReader(muerte)
#       for pointcall in reader:
#          if pointcall['homeport'] == 'Dunkerque' and pointcall['pointcall_action'] == 'Out':
#             cargos = ['cargaison inconnue']
#             ship_tonnage = pointcall['tonnage'] or 0
#             i += 1
#             cargos = json.loads(singleQuoteToDoubleQuote(pointcall['all_cargos'] or '[]'))
#             try:
#               # print('try: ', flow['all_cargos'])
#               cargos = [c['category_toflit18_revolution_empire_aggregate'] for c in cargos if c['cargo_item_action'] == 'Out']
#             except:
#                 cargos = ['cargaison inconnue']
#             if len(cargos) == 0:
#                cargos = ['cargaison inconnue']

#             for cargo in cargos:
#               output_data.append({
#                   'departure': pointcall['pointcall'],
#                   'departure_state': pointcall['state_1789_fr'],
#                   'rel_tonnage': str(int(ship_tonnage) / len(cargos)),
#                   'cargo_type': cargo,
#                   'ship_tonnage': ship_tonnage,
#                   'ship_tonnage_class': pointcall['tonnage_class']
#               })


tonnage_classes_ranking = {
    "[1-20]": "a",
    "[21-50]": "b",
    "[51-100]": "c",
    "[101-200]": "d",
    "[201-500]": "e",
    "": "f"
}
for year in years:
    flows_path = '../data/navigo_all_flows_' + year + '.csv'
    j = 0
    with open(flows_path, 'r') as muerte:
        reader = csv.DictReader(muerte)
        for flow in reader:
            if flow['departure_function'] == 'O' and flow['homeport_toponyme_fr'] == 'Dunkerque':
                cargos = []
                ship_tonnage = flow['tonnage'] or 0
                all_cargos = json.loads(
                    singleQuoteToDoubleQuote(flow['all_cargos'] or '[]'))

                if 'pêche' in ' '.join([c['category_toflit18_revolution_empire'].lower() for c in all_cargos if 'category_toflit18_revolution_empire' in c]):
                    cargos = ['Pêche']
                elif len([c['commodity_id'].lower() for c in all_cargos if 'commodity_id' in c in ['00000012', '00000240', '00000252', '00000259', '00000281', '00000307', '00000329']]) > 0:
                    cargos = ['Pêche']
                else:
                    cargos = [c['category_toflit18_revolution_empire_aggregate']
                              for c in all_cargos if c['cargo_item_action'] == 'Out' and 'category_toflit18_revolution_empire_aggregate' in c]

                if len(all_cargos) == 0:
                    cargos = ['cargaison inconnue']

                j = j + 1
                for cargo in cargos:
                    i = i + 1
                    # print('go', str(year), len(cargos), j, i)
                    output_data.append({
                        'departure': flow['departure'],
                        'departure_state': flow['departure_state_1789_fr'] or 'inconnu',
                        'destination': flow['destination'],
                        'destination_state': flow['destination_state_1789_fr'] or 'inconnu',
                        'rel_tonnage': str(int(ship_tonnage) / len(cargos)),
                        'cargo_type': cargo,
                        'ship_tonnage': ship_tonnage,
                        'ship_tonnage_class': flow['tonnage_class'] or "inconnu",
                        "ship_tonnage_class_ranking": tonnage_classes_ranking[flow['tonnage_class']],
                        'year': year
                    })
with open(output_path, 'w', newline='') as csvfile:
    fieldnames = output_data[0].keys()
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(output_data)
