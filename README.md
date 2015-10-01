TO BUILD
==

### Dependencies

1. [NodeJS/NPM](https://nodejs.org) (Latest Stable Version)
2. [Gulp](http://gulpjs.com) (`sudo npm install -g gulp`)

### Setup

1. `cd` to this directory
2. `npm install`
4. `gulp`
5. `npm start`

GENERAL
==

This is a MEAN stack app without the A(ngular). It is the API for [modwatch](http://github.com/ansballard/modwatch). It is fairly simple, just taking in JSON from the [uploader](http://github.com/ansballard/modwatchuploader), storing it at mongolab, and serving it out via API routes.

The general shape of the API is taking in data through `/loadorder`, which is only hit by the uploader. This route takes username, password, some descriptive fields, and file contents from Skyrim mod files as arrays. This is stored in MongoDB. The data is retrieved by the frontend site, which will pull anything from user profile data (types of files, username, last upload timestamp) to actual file data. All API routes are open, all data is available.

CONTRIBUTING
==

1. Fork this repo
2. Open an issue for the problem/enhancement you want to work on
3. Create a branch that has to do with the issue you want to fix
4. Implement your changes
5. Make a pull request to this repo
6. If there are no merge conflicts, and I've already approved the issue you created, I'll most likely merge your changes in

When making changes, do your best to follow the standards already set in other parts of the repo. Changes should not be noticeable when looking through source code. I would prefer all changes pass `eslint` with the `.eslintrc` in the root directory.

LINKS
==

- [The Live Site](http://www.modwat.ch)
- [The Nexus Mods Page](http://nexusmods.com/skyrim/mods/56640)
- [The Frontend](http://github.com/ansballard/modwatch)
- [The Uploader](http://github.com/ansballard/modwatchuploader)
