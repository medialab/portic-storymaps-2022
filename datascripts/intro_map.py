
import shutil
import os
input_path = "./resources/intro_map.geojson"
output_path = "../public/data/map_backgrounds/intro_map.geojson"
output_folder_path = "../public/data/map_backgrounds"
print('copying intro map')
if not os.path.exists(output_folder_path):
   os.makedirs(output_folder_path)
shutil.copyfile(input_path, output_path)

# input_path = "./resources/physical_world_map.geojson"
input_path = "./resources/physical_world_map_simplified.geojson"
output_path = "../public/data/map_backgrounds/physical_world_map.geojson"
output_folder_path = "../public/data/map_backgrounds"
print('copying physical world map to ' + output_path)
if not os.path.exists(output_folder_path):
   os.makedirs(output_folder_path)
shutil.copyfile(input_path, output_path)

# input_path = "./resources/physical_world_map_light.geojson"
# output_path = "../public/data/map_backgrounds/physical_world_map_light.geojson"
# output_folder_path = "../public/data/map_backgrounds"
# print('copying physical world map light')
# if not os.path.exists(output_folder_path):
#    os.makedirs(output_folder_path)
# shutil.copyfile(input_path, output_path)

