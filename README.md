# Cosmic Reach Model Editor
A plugin for Blockbench that allows importing and exporting models made for the game Cosmic Reach.

## Usage

You can import/export your models with File>Import and File>Export after you load the plugin. To load a plugin, you go to File>Plugins and either press "Load via URL" or "Load from file" next to the search bar.

## Details/Notes
- Rotation is not supported
- "Tint" property faces have is used for Ambient Occlusion
- Any value other than "None" of the "Culling face" property faces have will result in culling being set to "true"
- The JSON parser is picky for trailing commas: [1,2,3,] is not valid syntax. If your JSON file features those, you will have to manually delete all of them (change [1,2,3,] => [1,2,3] for every of your arrays and dictionaries in the JSON file)
- Cubes cannot be bigger than 16x16x16(bigger causes in-game bugs)
- Textures cannot be bigger than 16x16(bigger causes in-game bugs)
