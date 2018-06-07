
/**
 * Module dependencies
 */

var EventEmitter = require('events').EventEmitter
  , fs = require('fs')
  , path = require('path')

var define = Object.defineProperty;
var isArray = Array.isArray
var stat = fs.statSync;
var readdir = fs.readdirSync;
var relative = path.relative;
var resolve = path.resolve;
var extname = path.extname;
var dirname = path.dirname;

/**
 * Checks if path is a directory
 *
 * @api private
 * @param {String} filepath
 */

function isDirectory (filepath) {
  try { return stat(filepath).isDirectory(); }
  catch (e) { return false; }
}

/**
 * Checks if path is a file
 *
 * @api private
 * @param {String} filepath
 */
function isFile (filepath) {
  try { return stat(filepath).isFile(); }
  catch (e) { return false; }
}

/**
 * creates a new `Loader` instance
 *
 * @api public
 * @param {String} dir
 */

module.exports = Loader;
// legacy
module.exports.Loader = Loader;
function Loader (dir, options = []) {
  var tmp = null;
  if (!(this instanceof Loader)) return new Loader(dir, options);
  tmp = dir;
  if (!isDirectory(dir)) { tmp = resolve(dirname(module.parent.id), dir) }
  dir = tmp;
  if (!isDirectory(dir)) { throw new Error("Invalid directory"); }
  this.directory = dir;
  this.options = options;
}

/**
 * inherit from `EventEmitter`
 */

Loader.prototype.__proto__ = EventEmitter.prototype;

/**
 * loads a directory's files as modules
 *
 * @api public
 * @param {String} dir
 */

module.exports.load = function (dir, options = []) {
  return new Loader(dir, options).load();
};

/**
 * loads a directory recursively requiring
 * each file or directory as a module
 *
 * @api public
 */

Loader.prototype.load = function () {
  var dir = this.directory;
  var options = this.options;
  var files = fs.readdirSync(dir);
  var tree = new Tree(dir, files, options);
  return this.emit('load', tree), tree;
};

/**
 * file tree abstraction
 *
 * @api public
 * @param {Object} root
 * @param {Array} children
 */

module.exports.Tree = Tree;
function Tree (root, children, options = []) {
  var path = null;
  var child = null;
  var i = 0;

  // ensure instance
  if (!(this instanceof Tree)) return new Tree(root, children, options);

  if ('string' === typeof root) {
    if (!isDirectory(root)) { throw new Error("`root' is not a directory"); }
    path = root; root = {};
    define(root, 'path', {
      enumerable: false,
      writable: false,
      value: path
    });
  }

  if (false == isArray(children)) { children = []; }

  // there must be a `path` property on the `root` object
  if (!root.path) { throw new Error("Reached root without `path' property"); }
  // just return the `root` object if there are no children
  else if (!children.length) { return root; }

  path = root.path

  for (; i < children.length; ++i) void function (child) {
    child = children[i];
    // skip `index.js`
    if (!!~['index', 'index.js'].indexOf(child)) return;

    var fpath = [path, child].join('/');
    var ext = extname(child);
    var name = child.replace(ext, '');

    if (isDirectory(fpath)) {
      root[name] = Tree(fpath, readdir(fpath), options);
    } else if (isFile(fpath)) {

      let regex = new RegExp(options.patterns.join('|'));

      if (! regex.test(fpath)) {
        return;
      }

      define(root, name, {
        enumerable: true,
        get: function () { return require(fpath) }
      });
    } else { throw new Error("Reached invalid file `"+ fpath +"'"); }
  }(children[i]);

  return root;
}
