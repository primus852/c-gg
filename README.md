# LoL ItemSet Creator

**Powered by the Champion.gg API and Electron**

## What is this for:

- the app accesses the Champion.gg API and creates ItemSets as .json files, usable in `League of Legends`
- it creates an ItemSet for each role suggested/available in the Champion.gg API
- There are always the following "rows" in each Set
    - StartItems
        - Most Picked
        - Highest Winrate
    - Build
        - Most Picked
        - Highest Winrate
    - Consumables
    - Wards & Trinkets

(The last two will have the skill maxing order for highest winrate and most picked as their "names")

**Note: You will still get flamed for feeding but now you show them your dominance by having the right items**

## But Why?

**mostly for fun, but apart from that**
- learn Node.js & npm
- learn Electron and cross platform developing
- learn git/github
- climb from Bronze V (Silver V now, wohoo)

## How?

To clone and run this repository you'll need [Git](https://git-scm.com), [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)), [Bower](http://bower.io/) and [Electron](http://electron.atom.io/docs/latest) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/primus852/c-gg
# Go into the repository
cd c-gg
# Install dependencies and run the app
bower update && npm install && npm start
```

To create an executable please refer to [Electron-Packager](https://github.com/electron-userland/electron-packager)
 
## What's next
A lot actually, some major stuff first
- Make really "cross platform" (I need the Executable "Names" for Mac though)
- Beautify UI
- Give more feedback of what is going on currently in the App
- Error handling

## But I want the compiled stuff
Please see the "dist" folder
- [Windows - 32Bit](https://github.com/primus852/c-gg/raw/master/dist/packages/windows_ia32.7z) **recommended**
- [Windows - 64Bit](https://github.com/primus852/c-gg/raw/master/dist/packages/windows_x64.7z) **recommended**
- [Mac OS X - Darwin 64Bit Zip](https://github.com/primus852/c-gg/raw/master/dist/packages/darwin_x64.7z)
- [Mac AppStore App (unsigned) 64Bit Zip](https://github.com/primus852/c-gg/raw/master/dist/packages/mas_x64.7z)

## Meh, can't I have just one Executable?
Windows Installer up:
- [Download 32Bit](https://github.com/primus852/c-gg/raw/master/dist/installers/win/32bit/LoLItemSetCreator-0.1.1-setup.exe)
- [Download 64Bit](https://github.com/primus852/c-gg/raw/master/dist/installers/win/64bit/LoLItemSetCreator-0.1.1-setup.exe) 
- What is stopping me?
    - ~~On Windows, path too long [issue#1](https://github.com/primus852/c-gg/issues/1)~~ Fixed
    - On Linux, error with windows installer, see [issue#2](https://github.com/primus852/c-gg/issues/2)

## Few words about the Windows Setup Files
- The `LoLItemSetCreator-x.x.x-setup.exe` are the ones created by the `electron-installer-windows`. Running them creates a folder in `C:\Users\<USERNAME>\AppData\Local\LoLItemSetCreator\app-x.x.x\LoLItemSetCreator.exe`. I am not yet sure how to change that.
- The `LolItemSetCreator-Setup.exe` are supposed to be a signed .exe, but apparently that did not work. My Avast AntiVir even blocks that thing, possibly because of the numerous outside calls and file creations.
- I highly recommend running/compiling from source or take the Zip Files instead. Inside the Zips of Windows, just click `LoLItemSetCreator.exe`

## Few words about the Mac Files
- Untested, currently "Download Only" only works (can't detect LoL Path yet, happy for PRs)

## But me no speak Englando
Ich spreche auch deutsch und arbeite an einer "Übersetzung.".
- For languages other than German, I will accept PRs (as soon as I have mastered github)

Learn more about Electron and its API in the [documentation](http://electron.atom.io/docs/latest).

#### License [CC0 (Public Domain)](LICENSE.md)
