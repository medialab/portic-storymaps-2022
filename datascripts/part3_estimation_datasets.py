import csv
import json
import requests

"""
-1 - correspondance tables in data
"""

navigo_f12_to_toflit18_simplification = {
    'Levant et Etats du Grand Seigneur et de Barbarie': 'Empire Ottoman et Barbarie',
    'Etat ecclésiastique': 'États ecclésiastiques',
    'Piémont et Sardaigne': 'Royaume de Sardaigne',
    'Naples et Sicile': 'Naples',
    'Toscane et Lucques': 'Milanais, Toscane et Lucques',
    'Etats de l\'Empereur': 'Allemagne'
}

navigo_f12_to_toflit18_grouping = {
  'Danemark' : 'Nord',
  'Angleterre' : 'Angleterre',
  'Russie' : 'Nord',
  'Espagne' : 'Espagne',
  'Hollande' : 'Hollande',
  'Portugal' : 'Portugal',
  'Villes hanséatiques' : 'Nord',
  'Suède' : 'Nord',
  'États-Unis d\'Amérique' : 'États-Unis d\'Amérique',
  'Etats de l\'Empereur' : 'Flandre et autres états de l\'Empereur',
  'Prusse' : 'Nord',
  'Piémont et Sardaigne' : 'Italie',
  'Gênes' : 'Italie',
  'Toscane et Lucques' : 'Italie',
  'Etat ecclésiastique' : 'Italie',
  'Naples et Sicile' : 'Italie',
  'Venise' : 'Italie',
  'Levant et Etats du Grand Seigneur et de Barbarie' : 'Levant et Barbarie',
  'Prusse+ Courlande, Mecklenbourg, Oldenboug + Pologne - Dantzig' : 'Nord',
  'vers la "Mer Baltique"' : 'Nord',
  'Prusse etc + Russie + Suède + mer Baltique' : 'Nord',
}

terre_mer_to_toflit18_simplification = {
  'Villes Anséatiques': 'Villes hanséatiques',
  'Danemarck et Norwège': 'Danemark',
  'République de Gênes': 'Gênes',
  'Naples et Sicile': 'Naples',
  'États du Roi de Sardaigne': 'Royaume de Sardaigne',
  'Milanès et Toscane': 'Milanais, Toscane et Lucques',
  'Angleterre, Ecosse et Irlande': 'Angleterre',
  'Rome et Venise': 'Venise',
  'États de l\'Empereur, en Flandre et Allemagne': 'Etats de l\'Empereur',
  'Suisse, ses Alliées et Genève': 'Suisse'
}

terre_mer_to_toflit18_grouping = {
  'Espagne' : 'Espagne',
  'Portugal' : 'Portugal',
  'États du Roi de Sardaigne' : 'Italie',
  'République de Gênes' : 'Italie',
  'Milanès et Toscane' : 'Italie',
  'Naples et Sicile' : 'Italie',
  'Rome et Venise' : 'Italie',
  'Angleterre, Ecosse et Irlande' : 'Angleterre',
  'Hollande' : 'Hollande',
  'Villes Anséatiques' : 'Nord',
  'États de l\'Empereur, en Flandre et Allemagne' : 'Flandre et autres états de l\'Empereur',
  'Allemagne et Pologne' : 'Allemagne',
  'Suisse, ses Alliées et Genève' : 'Suisse',
  'Danemarck et Norwège' : 'Nord',
  'Suède' : 'Nord',
  'Prusse' : 'Nord',
  'Russie' : 'Nord',
  'États-Unis d\'Amérique' : 'États-Unis d\'Amérique',
  'Le Levant et l\'Empire Ottoman' : 'Levant et Barbarie',
  'Saint-Domingue' : 'Amériques',
  'Martinique' : 'Amériques',
  'Guadeloupe' : 'Amériques',
  'Cayenne et Guyanne' : 'Amériques',
  'Tabago et Sainte-Lucie' : 'Amériques',
  'Traite des noirs et de la gomme' : 'Divers',
  'Isles de France, de la Réunion et Mozambique' : 'Divers',
  'Etats de l\'Inde' : 'Asie',
  'La Chine' : 'Asie',
  'La Morue à Terre-Neuve' : 'Divers',
  'La Baleine, au Groënland, au Bresil et Madagascar' : 'Divers',
  'Pêches sur nos côtes Hareng (simple apperçu)' : 'Divers',
  'Pêches sur nos côtes Maquereaux (simple apperçu)' : 'Divers'
}

navigo_partner_balance_1789_to_toflit18_simplification = {
  'Quatre villes hanséatiques': 'Villes hanséatiques',
  'Etats-Unis': 'États-Unis d\'Amérique',
  # 'Etats de l\'Empereur':''
}

navigo_partner_balance_1789_to_toflit18_grouping = {
  'Etats-Unis' : 'États-Unis d\'Amérique',
  'Danemark' : 'Nord',
  'Angleterre' : 'Angleterre',
  'Quatre villes hanséatiques' : 'Nord',
  'Portugal' : 'Portugal',
  'Espagne' : 'Espagne',
  'Hollande' : 'Hollande',
  'Etats de l\'Empereur' : 'Flandre et autres états de l\'Empereur',
  'Prusse' : 'Nord',
  'Russie' : 'Nord',
  'France': 'France',
  'Marseille': 'France',
  'Etranger': 'Divers',
  '': 'Divers',
  'Saint-Domingue': 'Amériques',
  'Iles françaises de l\'Amérique': 'Amériques',
  'Bayonne': 'France',
  'Dunkerque': 'France',
  'colonies françaises': 'Outre-mers',
  'Lorient': 'France',
  'Suède': 'Nord',
  'Sénégal et Guinée': 'Outre-mers',
  'Petites Iles': 'France',
  'Saint-Jean de Luz': 'France'
}

navigo_divers_to_toflit18_grouping = {
   'Royaume de Piémont-Sardaigne': 'Italie', 
   '': 'Divers', 
   'Principauté de Lampédouse': 'Italie', 
   'Maroc': 'Italie', 
   'multi-Etat': 'Divers', 
   'Principauté de Piombino': 'Italie', 
   'Toscane': 'Italie', 
   'Monaco': 'Italie', 
   'Duché de Massa et Carrare': 'Italie', 
   'République de Gênes': 'Italie', 
   'Malte': 'Italie', 
   'Etats pontificaux': 'Italie', 
   'zone maritime': 'Divers', 
   'Royaume de Naples': 'Italie', 
   'Empire ottoman': 'Levant et Barbarie'
}

"""
0 - lib
"""
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
  cList=list(singleQuoted)
  inDouble=False;
  inSingle=False;
  for i,c in enumerate(cList):
      #print ("%d:%s %r %r" %(i,c,inSingle,inDouble))
      if c=="'":
          if not inDouble:
              inSingle=not inSingle
              cList[i]='"'
      elif c=='"':
          inDouble=not inDouble
  doubleQuoted="".join(cList)    
  return doubleQuoted

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

def get_terre_mer_ratios():
  file = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQr_Pz7arcPoimNTbyAZ4cCXDUDAO5AjMwbGtZ4aA6YnmeukK7GBohWvhaxQW0FtixJSWtW_F2i32ty/pub?gid=373560562&single=true&output=csv';
  csv_content = get_online_csv(file)

  partners = {}

  for flow in csv_content:
    partner_initial = flow['partner_clean']
    if partner_initial not in terre_mer_to_toflit18_grouping:
      raise Exception(partner_initial + ' is not in terre_mer_to_toflit18_grouping')
    partner = terre_mer_to_toflit18_grouping[partner_initial]
    flow_type = flow['terre_mer']
    value = flow['value']
    if partner not in partners: 
      partners[partner] = {
        "terre": 0,
        "mer": 0
      }
    partners[partner][flow_type] += float(value)

  output = []

  for partner, values in partners.items():
    ratio = values["mer"] / (values["mer"] + values["terre"])
    output.append({
      "partner": partner,
      "ratio_terre_mer": ratio,
      "somme_mer": values["mer"],
      "somme_terre": values["terre"]
    })
  # print('===')
  # print('Partenaires terre-mer : ')
  # for p in output:
  #   print(p['partner'])
  # print('===')
  return output

# def get_navigo_f12_dict (with_lest = True) :
#     F12_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHqTGjTMavPEw0Mf4RBjvXz5qhBjWV7a1gYuokEvaKRP-HzBSURdpCozaXzHHySXLKQWrQcO7LGk2K/pub?gid=249173198&single=true&output=csv'
#     field = 'tonnage_a_utiliser_clean' if with_lest == True else 'tonnage_hypothese_sans_lest'
#     destinations_f12 = get_online_csv(F12_SPREADSHEET_URL)
#     f12_dict = {}
#     for item in destinations_f12:
#       f12_dict[item['destination_state_1789_fr']] = float(item[field].replace("\u202f", "") or 0)
#     return f12_dict

# Turning the computation into a function
def compute_price_per_barrel_per_destination(method="résumé", verbose = False):
    # compute destinations f12 general
    F12_SPREADSHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHqTGjTMavPEw0Mf4RBjvXz5qhBjWV7a1gYuokEvaKRP-HzBSURdpCozaXzHHySXLKQWrQcO7LGk2K/pub?gid=249173198&single=true&output=csv'
    destinations_f12_raw = get_online_csv(F12_SPREADSHEET_URL)
    transpal = {
      "destination_state_1789_fr": "destination",
      "tonnage_a_utiliser_clean": "tonnage_hypothese_avec_lest",
      "tonnage_hypothese_sans_lest": "tonnage_hypothese_sans_lest"
    }

    destinations_f12_arr = []
    # formatting data
    for item in destinations_f12_raw:
      if len(item["destination_state_1789_fr"]) > 0:
        el = {}
        for fr, to in transpal.items():
          # remove weird gspread symbols with numbers
          val = item[fr].replace("\u202f", "")
          if to == "destination":
            el[to] = val
          else:
            el[to] = int(val) if len(val) else 0
        destinations_f12_arr.append(el)

    # build dataset with F12 viewed by grouping
    destinations_f12_grouping_map = {}
    for d in destinations_f12_arr:
      destination = d['destination']
      if destination not in navigo_f12_to_toflit18_grouping:
        raise Exception(destination + " not in navigo_f12_to_toflit18_grouping")
      destination_grouping = navigo_f12_to_toflit18_grouping[destination]
      tonnage_hypothese_avec_lest = d['tonnage_hypothese_avec_lest']
      tonnage_hypothese_sans_lest = d['tonnage_hypothese_sans_lest']

      if destination_grouping not in destinations_f12_grouping_map:
        destinations_f12_grouping_map[destination_grouping] = {
          "tonnage_hypothese_avec_lest": 0,
          "tonnage_hypothese_sans_lest": 0
        }
      destinations_f12_grouping_map[destination_grouping]["tonnage_hypothese_avec_lest"] += tonnage_hypothese_avec_lest
      destinations_f12_grouping_map[destination_grouping]["tonnage_hypothese_sans_lest"] += tonnage_hypothese_sans_lest

    rows_terremer = get_terre_mer_ratios()
    terre_mer_ratio = {}
    for el in rows_terremer:
      terre_mer_ratio[el["partner"]] = el["ratio_terre_mer"]

    toflit18_map = {}
    # compute sums of exports at national level
    partners_toflit18_national = {}
    with open('../data/toflit18_all_flows.csv', newline='') as csvfile:
      flows = csv.DictReader(csvfile)
      for flow in flows:
        if flow['source_type'] == 'Résumé' \
          and flow['year'] == '1787' \
          and flow['export_import'] == 'Exports':
          partner = flow['partner_grouping']
          # if partner == 'États de l\'Empereur':
          #   partner = 'Etats de l\'Empereur'
          value = float(flow['value'] or 0)
          if partner not in partners_toflit18_national:
            partners_toflit18_national[partner] = 0
          partners_toflit18_national[partner] += value
    # correct sums of exports at national level with ratios
    partners_toflit18_national_corrected = {}
    for (partner, value) in partners_toflit18_national.items():
      ratio = 1

      if partner in terre_mer_ratio:
        ratio = float(terre_mer_ratio[partner])
      else:
       print('ratio : ce partenaire n\'est pas disponible dans la table des ratios : ', partner)
      partners_toflit18_national_corrected[partner] = value * ratio
    toflit18_map = partners_toflit18_national_corrected  

    correspondance = []
    for destination, tonnages in destinations_f12_grouping_map.items():
      if destination not in toflit18_map:
        # if verbose == True:
        raise Exception('problème, le pays de destination navigo suivant n\'est pas dans la source terre-mer pour 1787 :', destination)
      else:
        value = toflit18_map[destination]
        # tonnage_without_lest = destinations_navigo_national_without_lest[destination]
        correspondance.append({
          "partner": destination,
          "sum_tonnage": tonnages['tonnage_hypothese_avec_lest'],
          "sum_tonnage_without_lest":  tonnages['tonnage_hypothese_sans_lest'],
          "sum_exports": value,
          "price_per_barrel": value /  tonnages['tonnage_hypothese_avec_lest'] if tonnages['tonnage_hypothese_avec_lest'] > 0 else 0,
          "price_per_barrel_without_lest": value /  tonnages['tonnage_hypothese_sans_lest'] if tonnages['tonnage_hypothese_sans_lest'] > 0 else 0
        })
    if verbose:
        print('table de correspondance : ')
        print(correspondance)
    return correspondance, terre_mer_ratio

def project_for_bureau (ferme_bureau, ferme_key = 'departure_ferme_bureau', verbose = False):
  # build two models
  correspondance_resume, national_ratios = compute_price_per_barrel_per_destination(method='résumé')

  # =================================================
  # =================================================
  # select flows from navigo 1787 - ferme_bureau = ferme_bureau
  # =================================================
  # =================================================
  destinations_navigo = {}
  sum_tonnage = 0
  sum_travels = 0
  ports = set()
  with open('../data/navigo_all_flows_1789.csv', newline='') as csvfile:
    flows = csv.DictReader(csvfile)
    
    commodity_fields = ['commodity_standardized_fr', 'commodity_standardized2_fr', 'commodity_standardized3_fr', 'commodity_standardized4_fr']
    stop_commodities = set(['lest', 'lège', 'vide', 'futailles vides'])
    commodity_id_fields = ['commodity_id', 'commodity_id2', 'commodity_id3', 'commodity_id4']
    stop_commodities_ids = set([
        # lest
        '00000162', '00000094', '00000469', '00000162',
        # pêche
        '00000012','00000240','00000240','00000280','00000306','00000307','00000328','00000329','00000331','00000332','00000336',
    ])
    
    
    total_commodities = set()
    for flow in flows:
      destination = flow['destination_partner_balance_1789']
      if destination == '':
        destination = flow['destination_partner_balance_supp_1789']
      if destination not in navigo_partner_balance_1789_to_toflit18_grouping:
        raise Exception('The following navigo partner balance 1789 destination is not in navigo_partner_balance_1789_to_toflit18_grouping : ' + destination)
      destination = navigo_partner_balance_1789_to_toflit18_grouping[destination]
      departure = flow['departure']
      bureau_clean = flow[ferme_key]
      if bureau_clean == 'Charente':
            bureau_clean = 'Tonnay-Charente'
      if bureau_clean == 'Saint-Martin île de Ré':
            bureau_clean = 'Saint-Martin-de-Ré'
      # if destination in navigo_partner_balance_1789_to_toflit18_simplification:
        # destination = navigo_partner_balance_1789_to_toflit18_simplification[destination]
      tonnage = float(flow['tonnage'] or 0)
      if flow['departure_function'] == 'O' \
        and bureau_clean == ferme_bureau \
        and destination != '' \
        and destination != 'France' \
        and flow['destination_state_1789_fr'] != 'France' :
        ports.add(departure)
        # commodities = [flow[field].lower() for field in commodity_fields if  flow[field] != '']
        # commodities_ids = [flow[field] for field in commodity_id_fields if flow[field] != '']
        # change done after API response changed
        commodities = []
        commodities_ids = []
        if flow['all_cargos'] != '':
          cargos = singleQuoteToDoubleQuote(flow['all_cargos'])
          cargos = json.loads(cargos)
          for cargo in cargos:
            if 'commodity_standardized_fr' in cargo and cargo['commodity_standardized_fr'] != '':
              commodities.append(cargo['commodity_standardized_fr'])
              commodities_ids.append(cargo['commodity_id'])

        forbidden_commodities_ids = [commodity for commodity in commodities_ids if commodity in stop_commodities_ids]

        not_stop = [commodity for commodity in commodities if commodity not in stop_commodities]
        # take the flow if no commodity specified or no 'stop' commodity specified
        if len(commodities_ids) == 0 or len(forbidden_commodities_ids) == 0:
          for c in not_stop:
            total_commodities.add(c)
          # print(departure + '->' + destination, flow['tonnage'] + '->' + str(tonnage))
          # at this point we have all the flows we want
          if destination not in destinations_navigo:
            destinations_navigo[destination] = 0
          destinations_navigo[destination] += tonnage
          sum_tonnage +=  tonnage
          sum_travels += 1
  # print('Destinations selon navigo (en tonneaux) : ')
  # print([{"destination": destination, "tonnage": tonnage} for destination, tonnage in destinations_navigo.items()])
  # print('Ports pris en compte pour le bureau : ' + ', '.join(list(ports)))
  # print('Tonnage moyen des navires : ' + str(sum_tonnage / sum_travels))

  destinations_navigo_arr = [{"destination": destination, "tonnage": tonnage} for destination, tonnage in destinations_navigo.items()]
  # print('===')
  # for p in destinations_navigo_arr:
  #   print(p["destination"])
  # print('===')
  
  # =================================================
  # =================================================
  # select flows from  - customs office = ferme_bureau
  # =================================================
  # =================================================

  partners_toflit18 = {}
  sum_toflit18_raw = 0
  flows_detail = []
  # print('scan des valeurs pour ' + ('le bureau des fermes de ' if ferme_key == 'departure_ferme_bureau' else 'la direction des fermes de ') + ferme_bureau)
  with open('../data/toflit18_all_flows.csv', newline='') as csvfile:
    flows = csv.DictReader(csvfile)
    for flow in flows:
      if flow['year'] == '1789' \
        and flow['customs_office' if ferme_key == 'departure_ferme_bureau' else 'customs_region'] == ferme_bureau \
        and flow['export_import'] == 'Exports' \
        and flow['partner_simplification'] != 'Îles françaises de l\'Amérique' \
        and flow['partner_simplification'] != 'Colonies françaises' \
        and flow['partner_grouping'] != 'France' \
        and flow['partner_simplification'] != 'Sénégal' \
        and flow['partner_simplification'] != 'Saint-Domingue':
          # partner = flow['partner_simplification']
          partner = flow['partner_grouping']
          # if partner == "États de l'Empereur":
          #   partner = "Etats de l'Empereur"
          value = float(flow['value'] or 0)
          if partner not in partners_toflit18:
            partners_toflit18[partner] = 0
          partners_toflit18[partner] += value
          sum_toflit18_raw += value
          flows_detail.append(flow)
  # print('flux bruts toflit18 : ')
  # print([{"partenaire": partenaire, "valeur": valeur} for partenaire, valeur in partners_toflit18.items()])

  partners_toflit18_corrected = {}
  sum_toflit18_corrected = 0
  for (partner, value) in partners_toflit18.items():
    ratio = 1
    if partner in national_ratios:
      ratio = float(national_ratios[partner])
    else:
      if verbose == True:
        print('Problème d\'attribution du le partenaire qui n\'est pas dans la table des ratios terre-mer : ', partner)
    partners_toflit18_corrected[partner] = value * ratio
    sum_toflit18_corrected += (value * ratio)

  partners_toflit18_arr = [{"partenaire": partenaire, "valeur": valeur} for partenaire, valeur in partners_toflit18.items()]
 

  # Compute relative values
  def compute_rel_pcts(dct) :
      total = 0
      output = {}
      for key, val in dct.items():
          total += val
      for key, val in dct.items():
          output[key] = val / total * 100
      return output

  toflit18_corrected_pcts = compute_rel_pcts(partners_toflit18_corrected)
  destinations_navigo_pcts = compute_rel_pcts(destinations_navigo)
  correspondances_in_pct = []
  navigo_parsed = set()
  for key, toflit18_part in toflit18_corrected_pcts.items():
      if key in destinations_navigo_pcts:
          tonnage_part = destinations_navigo_pcts[key]
          navigo_parsed.add(key)
          correspondances_in_pct.append({
              "partner": key,
              "group": "toflit18",
              "value": toflit18_part
          })
          correspondances_in_pct.append({
              "partner": key,
              "group": "navigo",
              "value": tonnage_part
          })
      else: 
          correspondances_in_pct.append({
              "partner": key,
              "group": "toflit18",
              "value": toflit18_part
          })
          correspondances_in_pct.append({
              "partner": key,
              "group": "navigo",
              "value": 0
          })
  for key, navigo_part in destinations_navigo_pcts.items():
      if key not in navigo_parsed:
          correspondances_in_pct.append({
              "partner": key,
              "group": "toflit18",
              "value": 0
          })
          correspondances_in_pct.append({
              "partner": key,
              "group": "navigo",
              "value": tonnage_part
          })

  projection_resume = []
  sum_projection_resume = 0
  sum_projection_resume_without_lest = 0
  sum_toflit18_resume = 0
  handled_toflit18_partners = set()
  for cor in correspondance_resume:
      partner = cor['partner']
      price_per_barrel = cor['price_per_barrel']
      price_per_barrel_without_lest = cor['price_per_barrel_without_lest']
      if partner in destinations_navigo:
          navigo_tonnage = destinations_navigo[partner]
          estimate = navigo_tonnage * price_per_barrel
          estimate_without_lest = navigo_tonnage * price_per_barrel_without_lest
          #if partner == 'Danemark':
          #  print('in partner danemark')
          #  print('tonnage (should be 4277) : ', navigo_tonnage)
          #  print('price per barel (should be 230 : ', price_per_barrel)
          #  print('estimate : ', estimate)
          projection_resume.append({
              "partner": partner,
              "group": "estimation par tonnage x prix par tonneau F12/1787",
              "value": estimate
          })
          projection_resume.append({
              "partner": partner,
              "group": "estimation par tonnage x prix par tonneau F12/1787 (sans lest)",
              "value": estimate_without_lest
          })
          sum_projection_resume += estimate
          sum_projection_resume_without_lest += estimate_without_lest
      else:
          projection_resume.append({
              "partner": partner,
              "group": "estimation par tonnage x prix par tonneau F12/1787",
              "value": 0
          })
          projection_resume.append({
              "partner": partner,
              "group": "estimation par tonnage x prix par tonneau F12/1787 (sans lest)",
              "value": 0
          })
          
      if partner in partners_toflit18_corrected:
          toflit18_value_corrected = partners_toflit18_corrected[partner]
          projection_resume.append({
              "partner": partner,
              "group": "vraie valeur dans toflit18 (pondéré avec terre-mer)",
              "value": toflit18_value_corrected
          })
          # projection_resume.append({
          #     "partner": partner,
          #     "group": "vraie valeur dans toflit18 (non pondéré)",
          #     "value": partners_toflit18[partner]
          # })
          sum_toflit18_resume += toflit18_value_corrected
          handled_toflit18_partners.add(partner)
      else:
          projection_resume.append({
              "partner": partner,
              "group": "vraie valeur dans toflit18 (non pondéré)",
              "value": 0
          })
  # print('Correspondance résumé : ')
  # print(correspondance_resume)
  projection_resume.append({
    "partner": "total",
    "group":  "vraie valeur dans toflit18 (non pondéré)",
    "value": sum_toflit18_raw
  })
  projection_resume.append({
    "partner": "total",
    "group":  "vraie valeur dans toflit18 (pondéré avec terre-mer)",
    "value": sum_toflit18_corrected
  })
  projection_resume.append({
    "partner": "total",
    "group":  "estimation par tonnage x prix par tonneau F12/1787",
    "value": sum_projection_resume
  })
  projection_resume.append({
    "partner": "total",
    "group":  "estimation par tonnage x prix par tonneau F12/1787 (sans lest)",
    "value": sum_projection_resume_without_lest
  })
  
  print("Total des exports en lt selon la projection : " + f'{int(sum_projection_resume):,}' + " lt")
  print("Total des exports en lt selon toflit18 : " + f'{int(sum_toflit18_raw):,}' + " lt")
  print("Total des exports en lt selon toflit18 (corrigé avec ratios terre-mer) : " + f'{int(sum_toflit18_corrected):,}' + " lt")
  print('Méthode \'résumé\' - rapport projection/réalité : facteur de ' + str(sum_projection_resume / sum_toflit18_corrected))
  
  return {
    "partners_toflit18": partners_toflit18_arr,
    "destinations_navigo": destinations_navigo_arr,
    "correspondance": correspondance_resume,
    "projection": projection_resume
  }


"""
1 - toflit18 partners in 1787
Visualisations : exports-fr-1787
Output : toflit18_exports_nationaux_1787.csv
"""

INPUT = '../data/toflit18_all_flows.csv'
OUTPUT = "../public/data/toflit18_exports_nationaux_1787.csv";

national_partners = {}
with open(INPUT, "r") as fr:
  reader = csv.DictReader(fr)
  for row in reader:
    # partner = row['partner_simplification']
    partner = row['partner_grouping']
    if row['year'] == '1787' \
    and row['export_import'] == 'Exports' \
    and row['best_guess_national_prodxpart'] == '1' \
    and row['partner_simplification'] != 'Colonies françaises':
      value = float(row['value']) if row['value'] != '' else 0
      if partner not in national_partners:
        national_partners[partner] = 0
      national_partners[partner] += value

national_partners_arr = [{"partner": partner, "value": value} for partner, value in national_partners.items()]

# print('===')
# print('Partenaires toflit18 : exports ; 1787 ; != "Colonies françaises"; best_guess_national_prodxpart=1  (simplification)')
# for p in national_partners_arr:
#   print(p['partner'])
# print('===')
with open(OUTPUT, 'w', newline='') as csvfile:
  fieldnames = ['partner', 'value']
  writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
  writer.writeheader()
  writer.writerows(national_partners_arr)

"""
2 - computation F12
Visualisations : valeur-par-tonneau, tonnages-1787-f12
Output : tonnages_f12_1787.csv
"""
INPUT = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRHqTGjTMavPEw0Mf4RBjvXz5qhBjWV7a1gYuokEvaKRP-HzBSURdpCozaXzHHySXLKQWrQcO7LGk2K/pub?output=csv'
OUTPUT = "../public/data/tonnages_f12_1787.csv";

results = []
with requests.Session() as s:
    download = s.get(INPUT)
    decoded_content = download.content.decode('utf-8')
    reader = csv.DictReader(decoded_content.splitlines(), delimiter=',')
    for row in reader:
      results.append(row)

transpal = {
  "destination_state_1789_fr": "destination",
  "tonnage_a_utiliser_clean": "tonnage_hypothese_avec_lest",
  "tonnage_hypothese_sans_lest": "tonnage_hypothese_sans_lest"
}

destinations_f12_arr = []
# formatting data
for item in results:
  if len(item["destination_state_1789_fr"]) > 0:
    el = {}
    for fr, to in transpal.items():
      # remove weird gspread symbols with numbers
      val = item[fr].replace("\u202f", "")
      if to == "destination":
        el[to] = val
      else:
        el[to] = int(val) if len(val) else 0
    destinations_f12_arr.append(el)

# print('===')
# print('Partenaires F12')
# for p in data:
#   print(p['destination'])
# print('===')

with open(OUTPUT, 'w', newline='') as csvfile:
  fieldnames = transpal.values();
  writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
  writer.writeheader()
  writer.writerows(destinations_f12_arr)

# build dataset with F12 viewed by grouping
OUTPUT = "../public/data/tonnages_f12_1787_aggregated_by_grouping.csv";
destinations_f12_grouping_map = {}
for d in destinations_f12_arr:
  destination = d['destination']
  if destination not in navigo_f12_to_toflit18_grouping:
    raise Exception(destination + " not in navigo_f12_to_toflit18_grouping")
  destination_grouping = navigo_f12_to_toflit18_grouping[destination]
  tonnage_hypothese_avec_lest = d['tonnage_hypothese_avec_lest']
  tonnage_hypothese_sans_lest = d['tonnage_hypothese_sans_lest']
  if destination_grouping not in destinations_f12_grouping_map:
    destinations_f12_grouping_map[destination_grouping] = {
      "tonnage_hypothese_avec_lest": 0,
      "tonnage_hypothese_sans_lest": 0
    }
  destinations_f12_grouping_map[destination_grouping]["tonnage_hypothese_avec_lest"] += tonnage_hypothese_avec_lest
  destinations_f12_grouping_map[destination_grouping]["tonnage_hypothese_sans_lest"] += tonnage_hypothese_sans_lest
destinations_f12_grouping_arr = [{"destination": destination, **vals} for destination, vals in destinations_f12_grouping_map.items()]

with open(OUTPUT, 'w', newline='') as csvfile:
  fieldnames = transpal.values();
  writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
  writer.writeheader()
  writer.writerows(destinations_f12_grouping_arr)

"""
3 - computation prix par tonneau
Visualisations : valeur-par-tonneau
Output : projection-valeur-par-tonneau.csv
"""
OUTPUT = "../public/data/projection-valeur-par-tonneau.csv";
correspondance, terre_mer_ratio = compute_price_per_barrel_per_destination()
with open(OUTPUT, 'w', newline='') as csvfile:
  fieldnames = correspondance[0].keys()
  writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
  writer.writeheader()
  writer.writerows(correspondance)

"""
4 - toflit18 pour La Rochelle
Visualisations : comparaisons-la-rochelle
Output : comparaisons-la-rochelle-toflit18.csv

5 - navigo pour La Rochelle
Visualisations : comparaisons-la-rochelle
Output : comparaisons-la-rochelle-navigo.csv
"""

def output_la_rochelle(data, nickname):
  that_path = '../public/data/comparaisons-la-rochelle-' + nickname + '.csv';
  with open(that_path, 'w', newline='') as csvfile:
    fieldnames = data[0].keys()
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()
    writer.writerows(data)


# la_rochelle = project_for_bureau('La Rochelle', ferme_key='departure_ferme_bureau')
la_rochelle = project_for_bureau('La Rochelle', ferme_key='departure_ferme_direction')
la_rochelle_toflit18 = la_rochelle["partners_toflit18"]
output_la_rochelle(la_rochelle_toflit18, 'toflit18')
la_rochelle_navigo = la_rochelle["destinations_navigo"]
output_la_rochelle(la_rochelle_navigo, 'navigo')
la_rochelle_projection = la_rochelle["projection"]
output_la_rochelle(la_rochelle_projection, 'projection')

"""
6 - Dunkerque 1789 - navigation partante
Visualisations : destinations-dk-pour-projection
Output : destinations-dk-pour-projection.csv
"""


def is_smoggleur(flow):
    return flow['departure'] == 'Dunkerque' \
        and flow['tonnage'] == '12'
        # and ('Lisbonne' in flow['destination'] or flow['destination'] == 'Bergen') \


destinations_navigo_dk = {}
sum_tonnage = 0
nb_trajets = 0
nb_trajets_angleterre = 0
nb_trajets_angleterre_avec_cargo = 0
nb_tonnage_angleterre = 0
with open('../data/navigo_all_flows_1789.csv', newline='') as csvfile:
  flows = csv.DictReader(csvfile)
    
  commodity_fields = ['commodity_standardized_fr', 'commodity_standardized2_fr', 'commodity_standardized3_fr', 'commodity_standardized4_fr']
  stop_commodities = set(['lest', 'lège', 'vide', 'futailles vides'])
    
  commodity_id_fields = ['commodity_id', 'commodity_id2', 'commodity_id3', 'commodity_id4']
  stop_commodities_ids = set([
      # lest
      '00000162', '00000094', '00000469',
      # pêche
      '00000012','00000240','00000240','00000280','00000306','00000307','00000328','00000329','00000331','00000332','00000336',
  ])
    
  # stop_commodities = set()
  total_commodities = set()
  for flow in flows:
    destination = flow['destination_partner_balance_1789']
    if destination == '':
      destination = flow['destination_partner_balance_supp_1789']
    if destination not in navigo_partner_balance_1789_to_toflit18_grouping:
      raise Exception('The following navigo partner balance 1789 destination is not in navigo_partner_balance_1789_to_toflit18_grouping : ' + destination)
    destination = navigo_partner_balance_1789_to_toflit18_grouping[destination]
    if destination == 'Divers':
       destination = navigo_divers_to_toflit18_grouping[flow['destination_state_1789_fr']]
    # if destination is still divers
    if destination == 'Divers':
       continue
    departure = flow['departure']
#    departure = flow['departure_state_1789_fr']
    tonnage = float(flow['tonnage'] or 0)
    if flow['departure_function'] == 'O' \
      and departure == 'Dunkerque' \
      and destination != '' \
      and destination != 'France' \
      and not flow["destination_uhgs_id"][0] == 'C' \
      and flow['destination_state_1789_fr'] != 'France' \
      and not is_smoggleur(flow):   
      # commodities = [flow[field].lower() for field in commodity_fields if flow[field] != '']
      # commodities_ids = [flow[field] for field in commodity_id_fields if flow[field] != '']
      # change done after API response changed
      commodities = []
      commodities_ids = []
      if flow['all_cargos'] != '':
          cargos = singleQuoteToDoubleQuote(flow['all_cargos'])
          cargos = json.loads(cargos)
          for cargo in cargos:
            if 'commodity_standardized_fr' in cargo and cargo['commodity_standardized_fr'] != '':
              commodities.append(cargo['commodity_standardized_fr'])
              commodities_ids.append(cargo['commodity_id'])
      not_stop = [commodity for commodity in commodities if commodity not in stop_commodities]
      forbidden_commodities_ids = [commodity_id for commodity_id in commodities_ids if commodity_id in stop_commodities_ids]
      # take the flow if no commodity specified or at least one 'not stop' commodity speciied
      if len(commodities_ids) == 0 or len(forbidden_commodities_ids) == 0:
        for c in not_stop:
          total_commodities.add(c)
        # print(departure + '->' + destination, flow['tonnage'] + '->' + str(tonnage))
        # at this point we have all the flows we want
        if destination not in destinations_navigo_dk:
          destinations_navigo_dk[destination] = 0
        destinations_navigo_dk[destination] += tonnage
        sum_tonnage += tonnage
        nb_trajets += 1
        if flow['destination_state_1789_fr'] == 'Grande-Bretagne':
              nb_trajets_angleterre += 1
              nb_tonnage_angleterre += tonnage
              if len(commodities_ids) > 0:
                    nb_trajets_angleterre_avec_cargo += 1
destinations_arr = [{"destination": destination, "tonnage": tonnage} for destination, tonnage in destinations_navigo_dk.items()]
# print('===')
# print('Destinations Dunkerque 1789 : ')
# for el in destinations_arr:
#   print(el['destination'])
# print('===')
OUTPUT = "../public/data/destinations-dk-pour-projection.csv";
with open(OUTPUT, 'w', newline='') as csvfile:
  fieldnames = ['destination', 'tonnage']
  writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
  writer.writeheader()
  writer.writerows(destinations_arr)
  # writer.writerows(destinations_arr)

# print('tonnage cumulé', sum_tonnage)
# print('nombre de trajets : ', nb_trajets)
# print('nombre de trajets vers l\'angleterre : ', nb_trajets_angleterre)
# print('nombre de trajets vers l\'angleterre avec cargo : ', nb_trajets_angleterre_avec_cargo)
# print('tonnage cumulée vers l\'angleterre : ', nb_tonnage_angleterre)


"""
7 - toflit18 exports produits coloniaux
Visualisations : comparaison-projection-destination-produits-coloniaux-dk
Output : toflit18-dk-exports_produits-coloniaux.csv
"""

exports_toflit18 = {}
imports_toflit18 = {}
with open('../data/toflit18_all_flows.csv', newline='') as csvfile:
  flows = csv.DictReader(csvfile)
  # and flow['customs_office'].lower().find('dunkerque') != -1 \
  for flow in flows:
    if flow['year'] == '1789' \
      and flow['export_import'] == 'Exports' \
      and flow['customs_office'] == "Dunkerque" \
      and flow['partner_grouping'] != 'France':

      partner = flow['partner_grouping']
      # partner = flow['partner_simplification']
      value = float(flow['value'] or 0)
      if partner not in exports_toflit18:
        exports_toflit18[partner] = 0
      exports_toflit18[partner] += value
    #   and flow['partner_grouping'] != 'France':
    if flow['year'] == '1789' \
      and flow['export_import'] == 'Imports' \
      and flow['customs_office'] == "Dunkerque":

      # partner = flow['partner_simplification']
      partner = flow['partner_grouping']
      value = float(flow['value'] or 0)
      if partner not in imports_toflit18:
        imports_toflit18[partner] = 0
      imports_toflit18[partner] += value
# print('exports toflit18 : ')
# print(exports_toflit18)
# print('imports toflit18 : ')
# print(imports_toflit18)

comparaison = []

for cor in correspondance:
    partner = cor['partner']
    if partner in destinations_navigo_dk:
        tonnage = destinations_navigo_dk[partner]
        comparaison.append({
            "partner": partner,
            "group": "estimation - m. 'résumé'",
            "value": tonnage * cor['price_per_barrel']
        })
        comparaison.append({
            "partner": partner,
            "group": "estimation - m. 'résumé' (hyp sans lest)",
            "value": tonnage * cor['price_per_barrel_without_lest']
        })
    if partner in exports_toflit18:
      comparaison.append({
          "partner": partner,
          "group": "exports selon toflit18",
          "value": exports_toflit18[partner]
      })
    if partner in imports_toflit18:
      comparaison.append({
          "partner": partner,
          "group": "importations de Dunkerque hors France",
          "value": imports_toflit18[partner]
      })
OUTPUT = "../public/data/toflit18-dk-exports_produits-coloniaux.csv";
with open(OUTPUT, 'w', newline='') as csvfile:
  fieldnames = ['partner', 'group', 'value']
  writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
  writer.writeheader()
  writer.writerows(comparaison)

"""
8 - Dunkerque estimations des exports par partenaire de destination
Visualisations : estimation-par-destination-dk
Output : estimation-exports-dk-1789-par-partenaire.csv
"""

correspondance, ratio = compute_price_per_barrel_per_destination()
sum_estimates_resume = 0
sum_estimates_resume_without_lest = 0
estimates_resume = []
correspondance_map = {}
for c in correspondance:
  correspondance_map[c['partner']] = c

for destination in destinations_navigo_dk.keys():
  tonnage = destinations_navigo_dk[destination]
  if destination == "Divers":
    estimates_resume.append({
      "partenaire": destination,
      "tonnage": tonnage,
      "estimate": 0,
      "estimate_without_lest": 0,
    })
    continue
  if destination not in correspondance_map:
    raise Exception('Dunkerque : the following destination is not in the correspondance map : ' + destination)
  cor = correspondance_map[destination]
  estimates_resume.append({
      "partenaire": destination,
      "tonnage": tonnage,
      "exports_toflit18" : exports_toflit18[destination] if destination in exports_toflit18 else 0,
      "imports_toflit18" : imports_toflit18[destination] if destination in imports_toflit18 else 0,
      "price_per_barrel": cor['price_per_barrel'],
      "price_per_barrel_without_lest": cor['price_per_barrel_without_lest'],
      "estimate": tonnage * cor['price_per_barrel'],
      "estimate_without_lest": tonnage * cor['price_per_barrel_without_lest']
  })
  sum_estimates_resume += tonnage * cor['price_per_barrel']
  sum_estimates_resume_without_lest += tonnage * cor['price_per_barrel_without_lest']


OUTPUT = "../public/data/estimation-exports-dk-1789-par-partenaire.csv";
with open(OUTPUT, 'w', newline='') as csvfile:
  fieldnames = ['partenaire', 'tonnage', 'estimate', 'estimate_without_lest', 'price_per_barrel', 'price_per_barrel_without_lest', 'exports_toflit18', 'imports_toflit18'];
  writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
  writer.writeheader()
  writer.writerows(estimates_resume)

"""
9 - chiffres multiples imports & exports
Visualisations : estimation-imports-exports
Output : misc-estimations-imports-exports-dk-1789.csv
"""

# 1. count number of smogglers
nb_smgl = 0

with open('../data/navigo_all_flows_1789.csv', newline='') as csvfile:
  flows = csv.DictReader(csvfile)
  for flow in flows:
        if flow['departure_function'] == 'O' \
        and flow['departure'] == 'Dunkerque' \
        and ('Lisbonne' in flow['destination'] or flow['destination'] == 'Bergen') \
        and flow['tonnage'] == '12':
            nb_smgl += 1

# print('Nombre de smoggleurs : ' + str(nb_smgl))
# 2. multiply by price per passage
total_smogglage_price = nb_smgl * 3168
# print('Estimation de la valeur du smogglage : ' + str(total_smogglage_price) + ' lt')

# 2. quantité des exports légitimes
sum_exports_legitimes_vers_gb = 0
with open('../data/toflit18_all_flows.csv', newline='') as csvfile:
  flows = csv.DictReader(csvfile)
  # and flow['customs_office'].lower().find('dunkerque') != -1 \
  for flow in flows:
    if flow['year'] == '1789' \
      and flow['export_import'] == 'Exports'  \
      and flow['customs_office'].lower().find('dunkerque') != -1 \
      and flow['partner_simplification'] == 'Angleterre':

      value = float(flow['value'] or 0)
      sum_exports_legitimes_vers_gb += value

# 3. données anglaises CUST
# récupération des imports depuis Flandres vers GB en livres anglaises
CUST_SUMS_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQK1sFjZSTkcBErcUMfId7XHaSX6UQ-E5258YxU2lx8lVTdOfYi-pXJHikHVL5QYQ/pub?gid=1430909667&single=true&output=csv'

cust_data = []
with requests.Session() as s:
  download = s.get(CUST_SUMS_URL)
  decoded_content = download.content.decode('utf-8')
  reader = csv.DictReader(decoded_content.splitlines(), delimiter=',')
  for row in reader:
    cust_data.append(row)

from_flanders = [f for f in cust_data if f['dénomination partenaire'] == 'French Flanders']
sum_pounds = 0
sum_shillings = 0
sum_pences = 0
for f in from_flanders:
    sum_pounds += float(f['valeur £-stg'] or 0)
    sum_shillings += float(f['valeur shilling-£'] or 0)
    sum_pences += float(f['valeur pences-£'] or 0)
    
# print('Imports french flanders dans la source anglaise : ' + f'{int(sum_pounds):,}' + ' £, ' + f'{int(sum_shillings):,}' + ' shillings-£ et ' + f'{int(sum_pences):,}' + ' pences-£' )
estimation_ff = sum_pounds * 25 + (sum_shillings / 20) * 25 + (sum_pences / 240) * 25
# print('Imports french flanders dans la source anglaise convertis en livres tournois : ' + f'{int(estimation_ff):,}' + ' lt')

sum_miroir = 0
with open('../data/toflit18_all_flows.csv', newline='') as csvfile:
  flows = csv.DictReader(csvfile)
  # and flow['customs_office'].lower().find('dunkerque') != -1 \
  for flow in flows:
    if flow['year'] == '1789' \
      and flow['export_import'] == 'Imports'  \
      and flow['partner_simplification'] == 'Dunkerque':
      value = float(flow['value'] or 0)
      sum_miroir += value



sum_projection_resume = 0
sum_projection_resume_sans_lest = 0

sum_projection_gb = 0
sum_projection_gb_sans_lest = 0

for c in comparaison:
    if c['group'] == "estimation - m. 'résumé'":
      sum_projection_resume += c['value']
      if c['partner'] == 'Angleterre':
        sum_projection_gb += c['value']
    if c['group'] == "estimation - m. 'résumé' (hyp sans lest)":
      sum_projection_resume_sans_lest += c['value']
      if c['partner'] == 'Angleterre':
        sum_projection_gb_sans_lest += c['value']
        
sum_exports = 0
for f, value in exports_toflit18.items():
    sum_exports += value
    
sum_imports = 0
for f, value in imports_toflit18.items():
    sum_imports += value

# print('somme imports Dunkerque : ' + f'{int(sum_imports):,}' + ' lt')   
# print('somme imports français depuis Dunkerque : ' + f'{int(sum_miroir):,}' + ' lt')
# print('somme exports coloniaux : ' + f'{int(sum_exports):,}' + ' lt')
# print('somme exports selon la projection résumé : ' + f'{int(sum_projection_resume):,}' + ' lt')

total_exports = total_smogglage_price + sum_miroir + sum_projection_resume

# snail = [
# {
#    "value": sum_imports - total_exports,
#    "product_type": "Différentiel avec imports du bureau des fermes de Dunkerque",
#    "importsexports": "Imports",
#    "partner_type": "bureau des fermes de Dunkerque"
# },
# {
#    "value": sum_miroir,
#    "product_type": "Exports connus de Dunkerque",
#    "importsexports": "Exports",
#    "partner_type": "bureau des fermes de Dunkerque"
# },
# {
#    "value": total_smogglage_price,
#    "product_type": "Estimation du smogglage",
#    "importsexports": "Exports",
#    "partner_type": "bureau des fermes de Dunkerque"
# },
# {
#    "value": sum_exports,
#    "product_type": "Exports de produits coloniaux",
#    "importsexports": "Exports",
#    "partner_type": "bureau des fermes de Dunkerque"
# },
# {
#    "value": sum_projection_resume - sum_exports,
#    "product_type": "Estimation des exports de produits hors coloniaux",
#    "importsexports": "Exports",
#    "partner_type": "bureau des fermes de Dunkerque"
# },
# ]

snail = [
{
   "value": sum_imports,
   "product_type": "",
   "importsexports": "Imports",
   "partner_type": "bureau des fermes de Dunkerque"
},
{
   "value": sum_miroir,
   "product_type": "Exports connus de Dunkerque",
   "importsexports": "Exports",
   "partner_type": "bureau des fermes de Dunkerque"
},
{
   "value": total_smogglage_price,
   "product_type": "Estimation du smogglage",
   "importsexports": "Exports",
   "partner_type": "bureau des fermes de Dunkerque"
},
{
   "value": sum_exports,
   "product_type": "Exports de produits coloniaux",
   "importsexports": "Exports",
   "partner_type": "bureau des fermes de Dunkerque"
},
{
   "value": sum_projection_resume - sum_exports,
   "product_type": "Estimation exports hors col.",
   "importsexports": "Exports",
   "partner_type": "bureau des fermes de Dunkerque"
},
]

snails = [{**d, "port": "Dunkerque", "aggregate_type": "counts"} for d in snail]


redux = [{
    "label": "imports du bf de Dunkerque",
    "type": "imports",
    "valeur": sum_imports
},
{
    "label": "estimation smogglage",
    "type": "exports - projection",
    "valeur": total_smogglage_price
},
{
    "label": "estimation des exports par projection (hyp. lest)",
    "type": "exports - projection",
    "valeur": sum_projection_resume
}, 
{
    "label": "estimation des exports par projection (hyp. sans lest)",
    "type": "exports - projection",
    "valeur": sum_projection_resume_sans_lest
},

{
    "label": "projection angleterre uniquement (hyp lest)",
    "type": "exports - projection (détail)",
    "valeur": sum_projection_gb
}, 
{
    "label": "projection angleterre uniquement (hyp sans lest)",
    "type": "exports - projection (détail)",
    "valeur": sum_projection_gb_sans_lest
}, 

{
    "label": "toflit18 flux mirroir : dk > france",
    "type": "exports - tiré d'une source",
    "valeur": sum_miroir
},
{
    "label": "toflit18 exports légitimes dk > angleterre",
    "type": "exports - tiré d'une source",
    "valeur": sum_exports_legitimes_vers_gb
},
{
    "label": "toflit18 exports produits coloniaux (monde...)",
    "type": "exports - tiré d'une source",
    "valeur": sum_exports
},
{
    "label": "CUST Flandres > GB",
    "type": "exports - tiré d'une source",
    "valeur": estimation_ff
},
]

OUTPUT = "../public/data/misc-estimations-imports-exports-dk-1789.csv";
with open(OUTPUT, 'w', newline='') as csvfile:
  fieldnames = ['label', 'type', 'valeur']
  writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
  writer.writeheader()
  writer.writerows(redux)

OUTPUT = "../public/data/snail-estimations-imports-exports-dk-1789.csv";
with open(OUTPUT, 'w', newline='') as csvfile:
  fieldnames = ['value', 'product_type', 'importsexports', 'partner_type', 'port', 'aggregate_type']
  writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
  writer.writeheader()
  writer.writerows(snail)