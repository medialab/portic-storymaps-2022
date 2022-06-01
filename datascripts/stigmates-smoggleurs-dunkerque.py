import csv
from index import get_viz_metas

years = {
    '1787': '../data/navigo_all_flows_1787.csv',
    '1789': '../data/navigo_all_flows_1789.csv'
}

fieldnames = {
    'year',
    'tonnage',
    'destination'
}

output = get_viz_metas('stigmates-smoggleurs-dunkerque')['outputs'][0]

with open(output, 'w', newline='') as csvfile:
    writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
    writer.writeheader()

    for year in years.keys():
        source_file = years[year]
        with open(source_file, newline='') as csvfile:
            reader = csv.DictReader(csvfile)

            for row in reader:
                if row['departure_function'] != 'O':
                    continue
                if row['departure_fr'] != 'Dunkerque':
                    continue    
                if row['flag'] != 'British':
                    continue
                row['year'] = year
                if row['destination'] == 'Lisbonne [mais: Angleterre]':
                    row['destination'] = 'Lisbonne'
                writer.writerow(
                    {key: value for key, value in row.items() if key in fieldnames}
                )