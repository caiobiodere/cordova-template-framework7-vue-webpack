## 19.01.2018 - 2.0.0
* Added new framework7 (2.x.x) version from https://framework7.io/.
* Added new framework7-vue (2.x.x) version from https://github.com/framework7io/framework7-vue.
* Added new library fontawesome from http://fontawesome.io/.
* Fixed templates inside static folder.

## 29.11.2017 - 1.2.1
* Updated dependencies.
* Fixed device.js related errors.

## 23.07.2017 - 1.2.0
* Updated dependencies.

## 10.05.2017 - 1.1.3
* Changed uglify-js dependency version.
* Removed source-map-loader dependency.

## 04.05.2017 - 1.1.2
* Added support for scss to one page component.
* Chokidar dependency added to template's package.json.

## 25.04.2017 - 1.1.1
* Added whitespace support to command paths. You can use folder names with whitespace now.

## 25.04.2017 - 1.1.0
* Added static folder for static assets. Static folder directly copies to www folder on compile time also static folder automatically sync with www/static when you are using live-reload.
* Directory structure changed.
* Dependency added: `chokidar`

## 25.04.2017 - 1.0.12
* Provided compatibility with latest webpack-dev-server update. Added ip:port to public argument for live reload.
* The double nails were standardized as single nails in `beforedep.js` and `hookers.js`.

## 07.04.2017 - 1.0.11
* Fixed Device_router.html has been made compatible with Android < 4.4.0.
* Fixed key to vue lists
> Thanks for **konstantin-popov** for fixes.
* Added .editorconfig and files edited with this config.

## 14.03.2017 - 1.0.10
* Added epipebomb for linux and mac os.
* Fixed webpack ^2.2.1 support
* Fixed buffer size for webpack outputs
* Updated uglify js version to latest (for ES6 features)

## 17.01.2017 - 1.0.4
* Dev-server supports hot-module-replacement now!

## 16.01.2017 - 1.0.1
* Supports phonegap now!
* Template now uses `webpack-dev-server` for live-reload. So cordova-plugin-browsersync dependency dropped.
* `webpack-dev-server` dependency added.
* You can use `cordova (run|emulate) (ios|android|browser) -- --lr` now. lr means `live-reload`.
* Added `before_deploy` hook. You can check at: [beforedep.js](template_src/hooks/beforedep.js)
* [hookers.js](template_src/hooks/hookers.js) changed.
* [CordovaDeviceRouter.js](template_src/webpack/dev_helpers/CordovaDeviceRouter.js) added. In `live-reload` mode, server injects the `cordova.js` file according to where you are connecting.
* [device_router.html](template_src/webpack/dev_helpers/device_router.html) added. In `live-reload` mode, this file routes you to right location.
