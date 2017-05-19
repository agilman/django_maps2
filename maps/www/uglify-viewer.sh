#!/usr/bin/env bash
`npm bin`/uglifyjs2 ./app/viewer/app.js  \
	 ./app/viewer/routes.js   \
	 ./app/viewer/shared/profileController.js  \
	 ./app/viewer/components/advSelect/advController.js     \
	 ./app/viewer/components/maps/mapsController.js -o ./js/viewer.min.js
