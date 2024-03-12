
function sumArrays(a, b){
    s = []
    for(let i = 0; i < Math.min(a.length, b.length); i++){
        s.push(a[i] + b[i])
    }
    return s
}

(() => {
    let codec, format, export_action, import_action, dialog, properties
    const id = "cosmic_reach_model"
    const name = "Cosmic Reach Model"
    const icon = "icon.png"
    Plugin.register(id, {
      title: name,
      icon: "icon.png",
      author: "Z. Hoeshin",
      description: "A plugin that allows to create models for the game Cosmic Reach.",
      tags: [],
      version: "1.0.0",
      creation_date: "2024-03-09",
      onload() {
        dialog = new Dialog("cosmic_reach_model_errormessage", {
            id: "cosmic_reach_model_dialog",
            title: "Something went wrong...",
            buttons: [],
            lines: [],
        })

        codec = new Codec("cosmic_reach_block_model_codec", {
            name: "Cosmic Reach",
            extension: "json",
            remember: false,
            compile(options={}){
                let facenamesbb = ["up", "down", "north", "south", "east", "west"]
                let facenamescr = ["localPosY", "localNegY", "localNegZ", "localPosZ", "localPosX", "localNegX"]
            
                cuboids = []
                texturesUsed = []
                texturesFilesUsed = []
                textures = {}

                function compileCube(obj){
                    let uvs = {}
                    for(let f of Object.keys(obj.faces)){
                        let uv = obj.faces[f].uv

                        let texture = Texture.all.filter((x) => {return x.uuid == obj.faces[f].texture})[0]
                        texture = (texture === undefined) ? "empty.png" : texture.name

                        let face = obj.faces[f]

                        uvs[f] = [uv[0], uv[1], uv[2], uv[3], face, texture]

                        texturesUsed.push(texture)
                    }
                    
                    let cube = {
                        "localBounds": [...obj.from, ...obj.to],
                        "faces":
                        {
                            "localNegX": {"uv": uvs.west.slice(0, 4), "ambientocclusion": uvs.west[4].tint === 0,
                            "cullFace": uvs.west[4].cullFace !== "", "texture": uvs.west[5]},
                            "localPosX": {"uv": uvs.east.slice(0, 4), "ambientocclusion":  uvs.east[4].tint === 0,
                            "cullFace": uvs.east[4].cullFace !== "", "texture": uvs.east[5]},

                            "localNegY": {"uv": uvs.down.slice(0, 4), "ambientocclusion":  uvs.down[4].tint === 0,
                            "cullFace": uvs.down[4].cullFace !== "", "texture": uvs.down[5]},
                            "localPosY": {"uv": uvs.up.slice(0, 4), "ambientocclusion":  uvs.up[4].tint === 0,
                            "cullFace": uvs.up[4].cullFace !== "", "texture": uvs.up[5]},

                            "localNegZ": {"uv": uvs.north.slice(0, 4), "ambientocclusion":  uvs.north[4].tint === 0,
                            "cullFace": uvs.north[4].cullFace !== "", "texture": uvs.north[5]},
                            "localPosZ": {"uv": uvs.south.slice(0, 4), "ambientocclusion":  uvs.south[4].tint === 0,
                            "cullFace": uvs.south[4].cullFace !== "", "texture": uvs.south[5]}
                        }
                    }
                    
                    for(let f = 0; f < 6; f++){
                        if(uvs[facenamesbb[f]][4].rotation > 0){
                            cube.faces[facenamescr[f]].uvRotation = uvs[facenamesbb[f]][4].rotation
                        }
                    }

                    cuboids.push(cube)
                }
                function compileGroup(group){
                    group.children.forEach(obj => {
					if (obj instanceof Group) {
						compileGroup(obj);
					} else if (obj instanceof Cube) {
						compileCube(obj)
					}
				})
                }

                Outliner.root.forEach(obj => {
					if (obj instanceof Group) {
						compileGroup(obj);
					} else if (obj instanceof Cube) {
						compileCube(obj)
					}
				})

                console.warn(texturesUsed)
                for(let i = 0; i < texturesUsed.length; i++){
                    if(texturesUsed[i] == null){
                        continue
                    }
                    const name = texturesUsed[i]
                    textures[name] = { "fileName": name }
                }

                return JSON.stringify({"textures": textures, "cuboids": cuboids}, undefined, 4)
            },

            parse(rawJSONstring){
                let facenamesbb = ["up", "down", "north", "south", "east", "west"]
                let facenamescr = ["localPosY", "localNegY", "localNegZ", "localPosZ", "localPosX", "localNegX"]

                let allTexturesSpecified = false

                let data = JSON.parse(rawJSONstring)

                if(data.textures["all"] != undefined){
                    allTexturesSpecified = true
                }

                function getFaceUV(cuboid, face, uv){
                    return cuboid.faces[face].uv[uv]
                }

                function setUVforFace(cube, cuboid, facenamebb, facenamecr){
                    texture = allTexturesSpecified ? data.textures["all"] : data.textures[cuboid.faces[facenamecr].texture]
                    cube.faces[facenamebb].uv =[getFaceUV(cuboid, facenamecr, 0),
                                                getFaceUV(cuboid, facenamecr, 1),
                                                getFaceUV(cuboid, facenamecr, 2),
                                                getFaceUV(cuboid, facenamecr, 3)]
                    cube.faces[facenamebb].texture = Texture.all.filter((x) => {return x.name == texture.fileName})[0]
                }

                for(let cuboid of data.cuboids){
                    let from = cuboid.localBounds.slice(0, 3)
                    let to = cuboid.localBounds.slice(3, 6)

                    let cube = new Cube({from: from, to: to})
                    for(let i = 0; i < 6; i++){
                        try{
                            setUVforFace(cube, cuboid, facenamesbb[i], facenamescr[i])
                        }catch(error){

                        }
                        cube.faces[facenamesbb[i]].cullface = cuboid.faces[facenamescr[i]].cullFace ? facenamesbb[i] : ""
                        cube.faces[facenamesbb[i]].tint = cuboid.faces[facenamescr[i]].ambientocclusion ? 0 : -1
                    }

                    cube.addTo(Group.all.last()).init()
                }
            }
        })

        
        import_action = new Action('import_cosmic_reach_model', {
            name: 'Import Cosmic Reach Model',
            description: '',
            icon: null,
            category: 'file',
            click() {
                Blockbench.import({
                    extensions: ['json'],
                    type: 'Cosmic Reach Model',
                    readtype: 'text',
                    resource_id: 'json'
                }, files => {
                    try{
                        codec.parse(files[0].content);
                    }catch(error){
                        dialog.lines = `<div>
                            <h1>Unable to import file.</h1>
                            <p>${error}</p>
                        </div>`.split("\n")
                        dialog.show()
                    }
                })
            }
        })

        export_action = new Action('export_cosmic_reach_model', {
            name: 'Export Cosmic Reach Model',
            description: '',
            icon: null,
            category: 'file',
            click() {
                try{
                    codec.export();
                }catch(error){
                    dialog.lines = `<div>
                        <h1>Unable to export file.</h1>
                        <p>${error}</p>
                    </div>`.split("\n")
                    dialog.show()
                }
            }
        })

        MenuBar.addAction(import_action, 'file.import')
        MenuBar.addAction(export_action, 'file.export')

        format = new ModelFormat("cosmic_reach_model", {
            id: "cosmic_reach_model",
            icon: null,
            name: "Cosmic Reach Model",
            description: "Model format used by the game Cosmic Reach",
            show_on_start_screen: true,
            target: ["json"],

            vertex_color_ambient_occlusion: true,
            /*rotate_cubes: true,
            rotation_limit: true,
            rotation_snap: true,*/
            uv_rotation: true,
            java_face_properties: true,

            new() {
                newProject(this)
                Project.texture_width = 16
                Project.texture_height = 16
            }
        })

      },
      onunload() {
		import_action.delete();
		export_action.delete();

      }
    })
  })()