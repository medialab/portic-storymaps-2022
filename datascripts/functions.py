def is_gb_destination(row):
    """
    True si la destination est la Grande-Bretagne et non les colonies anglaises à travers le monde
    """
    row['destination_substate_1789_fr'] = row['destination_substate_1789_fr'].lower()

    if row['destination_state_1789_fr'] == 'Grande-Bretagne' \
        and 'colonies britanniques' not in row['destination_substate_1789_fr']:
        return True
    return False

def is_illegal_commodities(row):
    """
    True si l'un des champs 'commodity_standardized' contient un produit de contrebande
    :return boolean
    """
    illegal_products = {'eau de vie', 'genèvre', 'taffia', 'tabac', 'tabac en feuilles', 'thé', 'thé vert', 'thé boay', 'vin', 'bière', 'corintes', 'café', 'schites'}
    if row['commodity_purpose'].lower() in illegal_products \
        or row['commodity_purpose2'].lower() in illegal_products \
        or row['commodity_purpose3'].lower() in illegal_products \
        or row['commodity_purpose4'].lower() in illegal_products:
        return True
    return False

def is_empty_strict_commodities(row):
    """
    True 'commodity_standardized_fr' est 'Vide' ou 'Lest' et si tous les autres champs sont empty
    :return boolean
    """
    if (row['commodity_standardized_fr'] == 'Vide' or row['commodity_standardized_fr'] == 'Lest') \
        and row['commodity_standardized2_fr'] == '' \
        and row['commodity_standardized3_fr'] == '' \
        and row['commodity_standardized4_fr'] == '':
        return True
    return False

def is_smoggleur_dunkerque(row):
    """
    :return boolean
    """
    if row['departure_fr'] != 'Dunkerque':
        return False
    if row['flag'] == 'British' \
        and row['tonnage'] == 12 :
        return True
    return False

def is_smoggleur_calais(row):
    """
    :return boolean
    """
    if row['departure_fr'] != 'Calais':
        return False
    if row['flag'] == 'British' \
        and row['tonnage'] <= 50 \
        and is_gb_destination(row) == True:
        return True
    return False

def is_smoggleur_boulogne(row):
    """
    :return boolean
    """
    if row['departure_fr'] != 'Boulogne-sur-Mer':
        return False
    if row['flag'] == 'British' \
        and is_gb_destination(row) == True:
        return True
    return False

def is_smoggleur_roscoff(row):
    """
    :return boolean
    """
    if row['departure_fr'] != 'Roscoff':
        return False
    if (is_gb_destination(row) == True or row['destination_uhgs_id'] in {'A1964976', 'A0912818', 'A0864873'}) \
        and is_illegal_commodities(row) == True:
        return True
    return False

def is_smoggleur_lorient(row):
    """
    :return boolean
    """
    if row['departure_fr'] != 'Lorient':
        return False
    if row['flag'] == 'British' \
        and row['destination_uhgs_id'] in {'A0840357', 'A0912818', 'A1964976'}:
        return True
    return False

def is_smoggleur_bordeaux(row):
    """
    :return boolean
    """
    if row['departure_fr'] != 'Bordeaux':
        return False
    if row['flag'] == 'British' \
        and row['destination_uhgs_id'] in {'A1964976', 'A0912818'} \
        and is_illegal_commodities(row) == True:
        return True
    return False