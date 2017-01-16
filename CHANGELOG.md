## 16.01.2017 - 1.0.1
* Supports phonegap now!
* Template now uses `webpack-dev-server` for live-reload. So cordova-plugin-browsersync dependency dropped.
* `webpack-dev-server` dependency added.
* You can use `cordova (run|emulate) (ios|android|browser) -- --lr` now. lr means `live-reload`.
* Added `before_deploy` hook. You can check at: [beforedep.js](template_src/hooks/beforedep.js)
* [hookers.js](template_src/hooks/hookers.js) changed.
* [CordovaDeviceRouter.js](template_src/webpack/dev_helpers/CordovaDeviceRouter.js) added. In `live-reload` mode, server injects the `cordova.js` file according to where you are connecting.
* [device_router.html](template_src/webpack/dev_helpers/device_router.html) added. In `live-reload` mode, this file routes you to right location.