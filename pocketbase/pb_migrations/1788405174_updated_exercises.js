/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1804250889")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3845069049",
    "help": "",
    "hidden": false,
    "id": "relation1688206194",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "workout",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1804250889")

  // update field
  collection.fields.addAt(1, new Field({
    "cascadeDelete": false,
    "collectionId": "pbc_3845069049",
    "help": "",
    "hidden": false,
    "id": "relation1688206194",
    "maxSelect": 0,
    "minSelect": 0,
    "name": "workout",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "relation"
  }))

  return app.save(collection)
})
