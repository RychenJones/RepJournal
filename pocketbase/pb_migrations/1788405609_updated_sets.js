/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3011519073")

  // update collection data
  unmarshal({
    "createRule": "@request.auth.id != \"\" && @request.body.exercise != \"\"",
    "deleteRule": "exercise.workout.user = @request.auth.id",
    "listRule": "exercise.workout.user = @request.auth.id",
    "updateRule": "exercise.workout.user = @request.auth.id",
    "viewRule": "exercise.workout.user = @request.auth.id"
  }, collection)

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3011519073")

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
