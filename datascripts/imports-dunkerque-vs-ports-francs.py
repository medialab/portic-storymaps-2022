import csv

output = '../public/data/imports-dunkerque-vs-ports-francs.csv';
input = '../data/toflit18_all_flows.csv';

ports_francs_partners = ['Dunkerque', 'Bayonne','Lorient','Marseille','Noirmoutier','Yeu','Bouin']
# ports_francs_offices = [['Dunkerque', 'Port franc de Dunkerque'], ['Bayonne', 'Port franc de Bayonne'], ['Lorient'], ['Marseille']]
ports_francs_offices = [['Dunkerque', 'Port franc de Dunkerque'], ['Bayonne', 'Port franc de Bayonne', 'Port franc de Bayonne et Saint Jean de Luz'], ['Lorient'], ['Marseille']]

products_map = {}
for p in ports_francs_partners:
    products_map[p] = {}

with open(input, 'r') as muerte:
    reader = csv.DictReader(muerte)
    for flow in reader:
        # select imports 1789
        # @todo add source ?
        if  flow['year'] == '1789' \
        and flow['best_guess_region_prodxpart'] \
        :
          value = float(flow['value'] or 0)
          product = flow['product_revolutionempire']
          port = None
          source_import = None

          # France to Port Franc
          if flow['export_import'] == 'Exports' \
          and flow['partner_simplification'] in ports_francs_partners \
          :
              source_import = 'france'
              port = flow['partner_simplification']
          # BF imports
          elif flow['export_import'] == 'Imports' \
          and len([arr for arr in ports_francs_offices if flow['customs_office'] in arr]) \
          :
              # si BF des fermes est Marseille ne pas prendre en compte les imports de partenaires français (PF & autres)
              if flow['customs_office'] == 'Marseille' and flow['partner_grouping'] == 'France':
                continue
              source_import = 'foreign'
              port = [arr for arr in ports_francs_offices if flow['customs_office'] in arr][0][0]
          if source_import and port:
            if product not in products_map[port]:
                products_map[port][product] = {
                    "france": 0,
                    "foreign": 0
                }
            products_map[port][product][source_import] += value

data = []
for port, products in products_map.items():
    for product, sources in products.items():
        for source, value in sources.items():
          data.append({
              "port": port,
              "product": product,
              "source": source,
              "value": value
          })

with open(output, "w") as writer:
    w = csv.DictWriter(writer, fieldnames = data[0].keys())
    w.writeheader()
    w.writerows(data)