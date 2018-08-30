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

google fonts:
https://fonts.google.com

flexbox tricks:
https://stackoverflow.com/questions/38948102/center-and-right-align-flexbox-elements

nodejs csv stuff:
this library will grow with you:
https://www.npmjs.com/package/csv
more specifically:
http://csv.adaltas.com/parse/
and you can find examples of usage if you scroll down on:
https://stackoverflow.com/questions/23080413/nodejs-reading-csv-file#23085938

to SLIM the application once finished:
  * module 'csv' is not needed.  'csv-parse' is enough
  * in a SEPARATE branch, remove all deps from package.json, and repeatedly rerun the application, installing things to address errors
  * make sure to use --save-dev for deps that are only for development
  * see if there is a css slim tool
  * remove argon and manually re-add the styles that are relevant
  * use the 'exclude' option or whatever its called in the electron-forge package/make options to exclude all unnecessary files
  * seperate INIT things into initBeforeDomLoad and initAfterDomLoad.  Put as many things before as possible, to speed up application load.
  * try out some queue module if large spreadsheets lead to terrible performance due to shift operation

dealing with files:
https://nodejs.org/docs/v0.3.1/api/fs.html#fs.readFile

to disable security warnings:
ELECTRON_DISABLE_SECURITY_WARNINGS=true npm start

create a "Send Tokens" application which is only the "Settings" part of this application.  It would 'literally' be the GUI for send-tokens.  This would be nice because the GitHub can link to send-tokens and vice-versa.

possible tabs resources:
https://www.npmjs.com/package/@minna-ui/tabs
https://www.npmjs.com/package/@vaadin/vaadin-tabs
https://www.npmjs.com/package/@material/tab
the EASIEST solution by far is to make an exact copy of the entire "main container", and use z-index to make the correct one on top.  This would work flawlessly with the CSS, so we should probably just do it this way!

electron + angular:
https://www.intertech.com/Blog/electron-tutorial-getting-started-with-electron-and-angular-cli/

how to read json synchronously or asynchronously:
https://www.codementor.io/codementorteam/how-to-use-json-files-in-node-js-85hndqt32

the next step is to crack open the RECEIPT object and use it to update the status and timestamps accordingly

google doc:
https://docs.google.com/document/d/1_P_ciPyGb21ebSfVH_u54TpUOldzS9ugVNhOCzkJSbo/edit

next, SAVE settings and restore them when application is relaunched
https://medium.com/cameron-nokes/how-to-store-user-data-in-electron-3ba6bf66bc1e
keep reading because it seems there is a "electron-config" electron-store" module that already does it for you!
https://github.com/sindresorhus/electron-store
arguably "Prefs" should SUBCLASS because then the full API of electron-store is 'easily' accessible.  of course one could just write prefs.storage.
working, but saves in Application Support/Electron instead of Payout.  Might be fixed in the dist tho...

electron choose file glitch:
ticket
https://github.com/electron/electron/issues/14368

to do next:
keep going through the google doc

receipt object = {
	blockHash: "0x..."
	blockNumber
	cumulativeGasUsed: 909939
	events: [
		{
		args: {
			contract address, from, to, value(amount!)
			}
		}
	]
	from: the from address
	gasUsed: 36717
	status: true
	to: the token contract address
	transactionHash: the transaction id
}

possible ways to identify a computer:
os.cpus()
os.platform()
os.type() similar to platform
https://stackoverflow.com/questions/98516/how-do-i-obtain-equipment-serial-numbers-programmatically#98546
https://stackoverflow.com/questions/13357073/identify-computer-using-javascript
https://samy.pl/evercookie/
https://stackoverflow.com/questions/32672533/python-core-speed/32672771#32672771
linux command line utility "dmidecode"
https://stackoverflow.com/questions/2461141/get-a-unique-computer-id-in-python-on-windows-and-linux
for macs:
/usr/sbin/system_profiler SPHardwareDataType | fgrep 'Serial' | awk '{print $NF}'
this is the way to go:
https://github.com/automation-stack/node-machine-id


think about whether it sends the transactions in sequence or not, and how to make it send them all at once.

email:
py docs on sending email
https://docs.python.org/3/library/email.examples.html
stack overflow on starting an smtp server on your local machine
https://stackoverflow.com/questions/5619914/sendmail-errno61-connection-refused#7422843
special article on using python to send emails from gmail specifically
https://stackoverflow.com/questions/778202/smtplib-and-gmail-python-script-problems
to be cooler, let's use mailchimp:
https://pypi.org/project/mailchimp3/

