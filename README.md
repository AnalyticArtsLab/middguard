## middguard

### Core

The core system is limited to schema necessary for analysis, a communication
system between the server and clients, and loaders for various packages.

#### Schema

Three tables are built into the system:

**User**

 - id
 - name
 - password

**Message**

 - id
 - user_id
 - state
 - content

**Relationship**

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

[1]: http://nodejs.org/ "Node.js"
[2]: http://bower.io/   "bower"
[3]: http://nodemon.io/ "nodemon"
