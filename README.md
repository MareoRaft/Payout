# Payout

Almost all of my hand-typed files that control the actual content on the actual webpage are in the `source` directory.

Build processes (such as `gulp`) process those files and output them into the `build` directory.

The application runs off the `build` directory.

To package and make the application into an actual ".app", run `electron-forge make`.  This will create distributable files in the `out` directory.
