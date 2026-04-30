default:
    @just --list --unsorted


import './justfiles/js.justfile'
import './justfiles/git.justfile'

[group('Dev')]
dev:
    bunx expo start

[group('Dev')]
build:
    @echo "Unconfigured build"


[group('Dev')]
dev-android:
    bunx expo run:android
