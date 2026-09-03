/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_1804250889")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && @request.body.workout != \"\"",
    "deleteRule": "workout.user = @request.auth.id",
    "listRule": "workout.user = @request.auth.id",
    "updateRule": "workout.user = @request.auth.id",
    "viewRule": "workout.user = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_1804250889")

  // update collection data
  unmarshal({
    "createRule": null,
    "deleteRule": null,
    "listRule": null,
    "updateRule": null,
    "viewRule": null
  }, collection)

  return app.save(collection)
})
