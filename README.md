## MiddGuard

A Framework for Collaborative and Extensible Visual Analytics

### Overview

MiddGuard is a web framework that enables speedy, transparent visual analytics
investigations between multiple investigators. It features a database-backed web
server, front-end user interface, authentication, real-time updates between
multiple users, a shared observations client, and a model for extensibility
using Node.js modules.

### Getting Started

#### Install

Install Node.js using [n](https://github.com/tj/n) or
[nvm](https://github.com/creationix/nvm).

```sh
$ node --version
6.2.0
```

Install MiddGuard from npm. (This does not work yet, MiddGuard is not on npm.)

```sh
$ npm install --save middguard
```


### Developing MiddGuard

*This section describes how to develop MiddGuard itself, not a MiddGuard-based
investigation.*

Install Node.js using [n](https://github.com/tj/n) or
[nvm](https://github.com/creationix/nvm).

```sh
$ node --version
6.2.0
```

Clone the repository from [GitHub](https://github.com/ProfBlack/middguard).

```sh
$ git clone https://github.com/ProfBlack/middguard.git
```

Install MiddGuard's dependencies. The `postinstall` hook will install the
[Bower][2] dependencies.

```sh
$ npm install
```

Make some changes and start a server with one of the example projects.

```sh
$ node examples/simple
```

Alternatively, install [nodemon][3] with `npm install -g nodemon` and start the
server with `nodemon examples/simple`. nodemon watches for changes and
automatically restarts the server.

[1]: http://nodejs.org/       "Node.js"
[2]: http://bower.io/         "bower"
[3]: http://nodemon.io/       "nodemon"
