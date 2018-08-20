resources:
https://www.reddit.com/r/Python/comments/3u789b/htmlcssjs_gui_for_desktop_app/

this is the right question, with good links!:
https://stackoverflow.com/questions/4034169/how-can-i-use-html-javascript-to-build-a-python-gui

this is the right question specifically for PYTHON guis:
https://stackoverflow.com/questions/3743572/python-best-gui-library-for-the-job#3743578
pyside:
https://wiki.qt.io/Qt_for_Python#Getting_Started
further pyside install instructions, if you need:
https://wiki.qt.io/Qt_for_Python/GettingStarted/MacOS


pyjs is an option, but maybe doesn't use HTML?:
http://pyjs.org

this sounds promising, and has links to other things:
https://www.fyears.org/2017/02/electron-as-gui-of-python-apps-updated.html

node-webkit is a good idea:
https://nwjs.io
https://github.com/nwjs/nw.js
it does EVERYTHING you want, linux, osx, windows, but uses NODE instead of python.
creating a demo app:
https://www.sitepoint.com/cross-platform-desktop-app-nw-js/

or ELECTRON, which is almost as good and WORKS on my computer:
https://github.com/electron/electron-api-demos
can it actually connect to a server on the web if I wanted it to?
gives some conveniences:
https://github.com/electron-userland/electron-forge/tree/5.x
there is an icon option here:
https://github.com/electron-userland/electron-packager/blob/master/docs/api.md

non-programmer solutions:
Any website can be converted into an app with
https://fluidapp.com
Fluid works extremely well, but it is only for Mac.
or
https://applicationize.me/now
the second one requires chrome to be running, and brings chrome to the forefront when it goes in focus.  It is a chrome web app.  Cool but i'm not happy with the usage.


animation:
You could make things disapeer by making the width 0.0001, and then add a new thing of width 0.0001 and change its width to 1.
consider using javascript!
It could look good with a high refresh rate

ideas for application name:
Send Tokens, send-tokens, payout, erc20 payout, erc20 automator, token automator, dispatch,

packaging.  there's actually quite a bit you can do with gulp:
https://stackoverflow.com/questions/30445766/live-reload-for-electron-application

understanding asynchronous stuff in node.  async/await is just like using yeild in python:
https://blog.risingstack.com/mastering-async-await-in-nodejs/

hex encoding / decoding:
https://stackoverflow.com/questions/6182315/how-to-do-base64-encoding-in-node-js

1 digit of hex is:
4 bits of information, or 0.5 bytes of information
64 digits of hex is:
256 bits of information, or 32 bytes of information
