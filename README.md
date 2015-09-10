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

### Packages and their Structure

A package is the instance or version of MiddGuard that will be run. For example, middguard comes with a ‘demo’ package, and a different package could be created for each analytics project in which Middguard is used. Middguard can run an unlimited number of packages, but only one at a time. To indicate which package MiddGuard should run, you must set the ‘app’ field in /middguard/config/settings.js’. Each package MUST contain 3 folders titled ‘modules’, ‘models’, and ‘analytics’, and the contents of these folders should correspond to the following descriptions:

  *Models* — Data models that should correspond to a row in a relational database. (Server-side)	
  *Modules* — Client-side views ('views' in the MVC sense)
  *Analytics* — Analytic tools (Server-side)


Modules, models, and analytic tools may depend on each other and should raise errors if a dependency is not
found. Any client-side module should be able to run properly given only the information
contained in a given state. (See static/js/setup.js for more detail on states)

#### Structure

The only required file for a model/module/analytic tool is a *manifest.json*, structured
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

### General Setup, Databases, and Migrations

####Setup
For any package to run on MiddGuard, it *must* contain a config file within its directory. When getting started, simply copy the config file in the 'demo' package directory and put it in the directory of your new package. Then, change the information in the file as needed. (You will likely only need to change the database information at first, if that).

####Database Setup
MiddGuard can operate on either a SQLite database or a PostgreSQL database. To ensure that middguard is configured to work with the type of database you are using, *make sure that you set the "dbConfig" field in the ./middguard/__package_name__/config.js file appropriately.* (There are guidelines in the file). If you choose to use SQLite, MiddGuard will operate on a single SQLite database called *middguard.db* stored at
the project root.  It will automatically be created when you run your first
migration. Alternatively, if you would like to use a PostgreSQL database, fill in the appropriate information *in the ./middguard/config/settings.js file* to connect to a PostgreSQL database you have already set up.



#### Make a MiddGuard migration

This is different than a packaged model migration.  You should only need this
if you are altering the MiddGuard framework.

```sh
$ bin/migrate make --middguard --name <migration name>
```

#### Run MiddGuard migrations

You should only need to run this once at startup to migrate the database to the
MiddGuard schema.

```sh
$ bin/migrate latest --middguard
```

#### Make a model migration

Create a migration template for a specific model.  The *model name*
is the name of model's package directory.  The *migration name* is required.

If a **migrations** directory does not exist as an immediate subdirectory of the
model, it will be created when the first `migrate make --model ...` command is
run.

```sh
$ bin/migrate make --model <model name> --name <migration name>
```

#### Run model migrations

Run the migrations for a specific model.  Run this for each model in your
**packages/models** directory.

```sh
$ bin/migrate latest --model <model name>
```

### Examples

#### Make a new model from scratch

To make an empty table for the new model's data to be stored in, create your own migration file \(*'model_migration_demo.js'* in the *demo-model* example\) in a *'migrations'* folder that resides in the folder for your new model. This migration file should specify the names and types of the columns in your new database table. Next, make a javascript file \(*'demo-model.js'* in the *demo-model* example\) for your model that links it to the table you created in the migration file. Then, make a *'manifest.json'* file with the appropriate fields. Lastly, from the command line on the server, run **'bin/migrate latest --model <modelname>'**. Now your table has been created, and you will have models (each corresponding to a row of data) available for access once you load data into the table.

The hierarchy below shows what the file system should look like when you are done making a new model for an existing package. \(Files/directories marked 'create' are ones that you must add when making your new model.\) For examples of the code each file that you add should contain to make everything work, see the *demo-model* model in the **demo** package directory.

* \[package name\] directory
  * 'models' directory
    * \[model name\] directory __\(CREATE\)__
    * 'manifest.json' __\(CREATE\)__
    * JavaScript file for model __\(CREATE\)__
    * 'migrations' directory __\(CREATE\)__
      * custom migration file __\(CREATE\)__

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
