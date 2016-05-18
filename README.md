# LoL ItemSet Creator

**Powered by the Champion.gg API and Electron**

## What is this for:

- the app accesses the Champion.gg API and creates ItemSets as .json files, usable in `League of Legends`
- it creates an ItemSet for each role suggested/available in the Champion.gg API
- There are always the following "rows" in each Set
    - StartItems
        - Highest Winrate
        - Most Picked
    - Build
        - Highest Winrate
        - Most Picked
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

To clone and run this repository you'll need [Git](https://git-scm.com), [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) and [Electron](http://electron.atom.io/docs/latest) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/primus852/c-gg
# Go into the repository
cd c-gg
# Install dependencies and run the app
npm install && npm start
```

To create an executable please refer to[Electron-Packager](https://github.com/electron-userland/electron-packager)
 
## What's next
A lot actually, some major stuff first
- Make really "cross platform" (I need the Executable "Names" for Mac though)
- Beautify UI
- Give more feedback of what is going on currently in the App
- Error handling


## I only want the compiled stuff
Soon

## But me no speak Englando
Ich spreche auch deutsch und arbeite an einer "Übersetzung.". For more languages I will accept PRs (as soon as I have mastered github)

Learn more about Electron and its API in the [documentation](http://electron.atom.io/docs/latest).

#### License [CC0 (Public Domain)](LICENSE.md)
