#!/bin/bash

# 30.09.2019, Benjamin Ammann
# License GPL v3 https://www.gnu.org/licenses/gpl-3.0.de.html
# All rights reserved

# Android APK release erstellen

# Here are the APK releases
release_dir="platforms/android/app/build/outputs/apk/release"
app_name="Shoppinglist"

# Default build tool version
sdk_version="28.0.3"

# Start
echo "NOTE: increase the version number in config.xml before you deploy a new release."
echo "Press Ctrl+C to abort this script."
sleep 5

# Check if APK already exists
if [[ -f "$release_dir/$app_name.apk" ]]; then
    echo "'$release_dir/$app_name.apk' already exists. Abort."
    exit 1
fi

# Check if ANDROID_HOME path is present
if [[ -z "$ANDROID_HOME" ]]; then
    echo "Global variable 'ANDROID_HOME' is not set. Abort."
    exit 1
fi

# Check if ionic is installed
if [[ ! $(which ionic) ]]; then
    echo "ionic is not installed. See README.md. Abort."
    exit 1
fi

# Overwrite build tool version (optional)
echo "Please select SDK build tool version."
echo "Available versions:"

ls -1 "$ANDROID_HOME/build-tools"

read -p "SDK Version ($sdk_version): "
if [[ -n "$REPLY" ]]; then
    sdk_version="$REPLY"
fi

# Build android productive release
ionic cordova build android --prod --release

# Rename APK
mv ./$release_dir/app-release-unsigned.apk ./$release_dir/$app_name-release-unsigned.apk

# Sign APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore $app_name-release-key.keystore ./$release_dir/$app_name-release-unsigned.apk alias_name

# Compress APK
$ANDROID_HOME/build-tools/$sdk_version/zipalign -v 4 ./$release_dir/$app_name-release-unsigned.apk ./$release_dir/$app_name.apk

# Finished
echo "Congrats. You can find your APK in '$release_dir/$app_name.apk'"

if [[ $(which dolphin) ]]; then
    dolphin "$release_dir" &
fi
