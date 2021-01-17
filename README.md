# Shoppinglist App

Mobile application to manage your shopping lists, written with Ionic, Cordova and TypeScript.
Manage your shopping lists and share them with your family and flatmates.

## Why is this so awesome?

- **Multiple shopping lists** | Manage multiple shopping lists.
- **Android and iOS** | Download this app for Android and iOS.
- **Share your lists** | Share shopping lists with other users.
- **Online and offline usage** | Use the app offline only and optionally online.
- **Backup data** | Optionally your data is available through the cloud.

## Getting Started

Download repository

```bash
git clone https://github.com/ammannbe/ShoppinglistApp.git
```

### Prerequisites

- [Node.js](https://nodejs.org/en/)
- [Ionic CLI](https://ionicframework.com/docs/cli/)
- [Angular CLI](https://cli.angular.io/)
- Android: [Android Studio](https://developer.android.com/studio/)
- iOS: [XCode](https://developer.apple.com/xcode/)

### Installing/Updating

- Make sure you have all prerequisites
- Install NPM packets: `npm install`
- Run emulator with live-reload: `ionic cordova run android -l`
- Build app (debug APK): `ionic cordova android build`
- Build app (prod APK): `ionic cordova android build --prod --release`

## Deploy on Google Play Store

With both methods you'll get an APK, which you can upload to the google play store.

### Via Script

```bash
./build-apk.sh
```

### Manually

- Build APK

```bash
ionic cordova build android --prod --release
```

- Rename APK

```bash
mv ./platforms/android/app/build/outputs/apk/release/app-release-unsigned.apk ./platforms/android/app/build/outputs/apk/release/Shoppinglist-release-unsigned.apk
```

- Sign APK

```bash
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore Shoppinglist-release-key.keystore ./platforms/android/app/build/outputs/apk/release/Shoppinglist-release-unsigned.apk alias_name
```

- Optimize APK with the `zipalign`-utility

Exists in folder `$HOME/Android/Sdk/build-tools/[VERSION]/zipalign`

```bash
$version="28.0.3"
$HOME/Android/Sdk/build-tools/$version/zipalign -v 4 platforms/android/app/build/outputs/apk/release/Shoppinglist-release-unsigned.apk platforms/android/app/build/outputs/apk/release/Shoppinglist.apk
```

## Deploy on Apples App Store

- Edit version number in config.xml
- Prepare for XCode

```bash
ionic cordova prepare ios
```

- Open XCode:

```bash
open platforms/ios/Todo\ Liste.xcodeproj
```

- Change emulator to "Generic iOS Device"
- Check Identity:
  - Name: Shoppinglist
  - Bundle ID: (not ready yet)
  - Version & Build according to config.xml
- Go to Product > Archive (if the build failes, check the settings)
- A new window opens -> Choose iOS App
- Distribute App
- Choose iOS App Store -> Next
- Choose Upload -> Next
- Set hook -> Next
- Automatically Manage signing -> Next

## Docs

Generate docs and open in Firefox

```
npm run typedoc
firefox docs/index.html &
```

## Built With

- [Angular](https://angular.io/) - One framework. Mobile & desktop.
- [Cordova](https://cordova.apache.org/) - Mobile apps with HTML, CSS & JS.
- [core-js](https://github.com/zloirock/core-js) - Standard Library.
- [Ionic](https://ionicframework.com/) - One codebase. Any platform.
- [RxJS](https://github.com/ReactiveX/RxJS) - A reactive programming library for JavaScript.
- [TypeDoc](https://github.com/TypeStrong/typedoc) - Documentation generator for TypeScript projects.
- [TypeScript](http://www.typescriptlang.org/) - JavaScript that scales.

## Authors

- **Benjamin Ammann** - _Initial work_ - [ammannbe](https://github.com/ammannbe)

## License

This project is licensed under the AGPLv3 or later - see the LICENSE file for details
