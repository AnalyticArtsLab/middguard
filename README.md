## middguard

### Core

The core system is limited to schema necessary for analysis, a communication
system between the server and clients, and loaders for various packages.

#### Schema

Three tables are built into the system:

**analyst**

 - id
 - username
 - password

**message**

 - id
 - analyst_id
 - state
 - content
 - timestamp

**relationship**

 - id_1
 - id_2
 - type_1
 - type_2

### Packages

A package is either a client-side module, a model with a schema, getters, and
setters, or an analytic tool.  Models and analytic tools run on the server.
Packages may depend on each other and should raise errors if a dependency is not
found.

#### Structure

Discoverable packages should be placed in one of three subdirectories of the
**packages** top level directory.  The subdirectories are **modules**,
**models**, and **analytics** and correspond directly to each of the types of
packages.  The only required file in a package is a *manifest.json*, structured
as follows:

```
{
  "name": string (spaces allowed),
  "main": string (camelCase, no spaces),
  "version": string (semantic versioning),
  "js": array of js files to be loaded in order,
  "css": array of css files to be loaded in order
}
```

#### Models

*manifest.json*

```
{
  "name": string,                 // no spaces, singular
  "model_path": string,           // defaults to 'index.js'
  "version": string               // semantic versioning
}
```

**name**: Each model should be named with the singular version of the entity it
represents (*person*, *car*, *building*).

**migrations**: Each model should contain a **migrations** subdirectory.
Migrations define and update the model schema.

**model_path**: Each model should contain a [Bookshelf][4] model definition.
The default name for the containing file is *index.js*.  If you name the file
differently, add *model_path* to your *manifest.json*.

**version**: The model's [SemVer][5] version.

### Install

With [Node.js][1] v0.10.x installed, install [bower][2] with
`npm install -g bower`.

Install middguard's dependencies with:

```sh
$ npm install   # server dependencies
$ bower install # client dependencies
```

Start the server on port 3000:

```sh
$ npm start
```

Alternatively, install [nodemon][3] with `npm install -g nodemon` and start the
server with `nodemon app.js`.  nodemon watches for changes and automatically
restarts the server.

[1]: http://nodejs.org/       "Node.js"
[2]: http://bower.io/         "bower"
[3]: http://nodemon.io/       "nodemon"
[4]: http://bookshelfjs.org/  "bookshelf"
[5]: http://semver.org/       "semver"
