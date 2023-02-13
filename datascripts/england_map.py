import shutil
import os
input_path = "./resources/england_map.geojson"
output_path = "../public/data/map_backgrounds/england_map.geojson"
output_folder_path = "../public/data/map_backgrounds"
print('copying england map')
if not os.path.exists(output_folder_path):
   os.makedirs(output_folder_path)
shutil.copyfile(input_path, output_path)