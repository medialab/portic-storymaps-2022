# Datascripts

This directory contains the scripts for downloading and processing data.

The `./_fetch_content.py` script must be run first in order to download the index of visualizations and all related data.

It is important that the name of the `.csv` data files to be loaded for each visualization is attached to the correct visualization id. Then the application can call the right files in the font-end.

The other scripts can be executed in any order and allow to transform the previously downloaded data, according to the sources indicated in the visualizations index (`/src/data/viz.json`).

Below is an example of entering the visualization index with a python script to get the right recording path, with the file name as in the visualization index.

```json
"smoggleur-proportion": {
    "id": "smoggleur-proportion",
    "n_chapitre": 2,
    "inputs": [
        "navigo_all_flows_1787.csv",
        "navigo_all_flows_1789.csv"
    ],
    "outputs": [
        "smogglage_ports_stats.csv"
    ]
}
```

```python
from index import get_viz_metas

output = get_viz_metas('smoggleur-proportion')['outputs'][0]
```