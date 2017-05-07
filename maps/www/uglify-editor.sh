#!/usr/bin/env bash
`npm bin`/uglifyjs2 ./app/editor/app.js  \
	 ./app/editor/routes.js \
	 ./app/editor/components/mainController.js  \
	 ./app/editor/components/advEditor/controller.js     \
	 ./app/editor/components/mapEditor/mapsEditorController.js     \
	 ./app/editor/components/mapEditor/mapSegmentEditorController.js     \
	 ./app/editor/components/mapEditor/mapSegmentDetailsController.js     \
	 ./app/editor/components/photoEditor/indexController.js  \
	 ./app/editor/components/photoEditor/albumEditor.js  \
	 ./app/editor/components/blogEditor/controller.js  \
	 ./app/editor/components/gearEditor/controller.js  -o ./js/editor.min.js