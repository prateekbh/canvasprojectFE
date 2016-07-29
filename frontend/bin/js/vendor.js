/* Riot v2.5.0, @license MIT */

;(function(window, undefined) {
  'use strict';
var riot = { version: 'v2.5.0', settings: {} },
  // be aware, internal usage
  // ATTENTION: prefix the global dynamic variables with `__`

  // counter to give a unique id to all the Tag instances
  __uid = 0,
  // tags instances cache
  __virtualDom = [],
  // tags implementation cache
  __tagImpl = {},

  /**
   * Const
   */
  GLOBAL_MIXIN = '__global_mixin',

  // riot specific prefixes
  RIOT_PREFIX = 'riot-',
  RIOT_TAG = RIOT_PREFIX + 'tag',
  RIOT_TAG_IS = 'data-is',

  // for typeof == '' comparisons
  T_STRING = 'string',
  T_OBJECT = 'object',
  T_UNDEF  = 'undefined',
  T_FUNCTION = 'function',
  // special native tags that cannot be treated like the others
  SPECIAL_TAGS_REGEX = /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?|opt(?:ion|group))$/,
  RESERVED_WORDS_BLACKLIST = /^(?:_(?:item|id|parent)|update|root|(?:un)?mount|mixin|is(?:Mounted|Loop)|tags|parent|opts|trigger|o(?:n|ff|ne))$/,
  // SVG tags list https://www.w3.org/TR/SVG/attindex.html#PresentationAttributes
  SVG_TAGS_LIST = ['altGlyph', 'animate', 'animateColor', 'circle', 'clipPath', 'defs', 'ellipse', 'feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', 'feConvolveMatrix', 'feDiffuseLighting', 'feDisplacementMap', 'feFlood', 'feGaussianBlur', 'feImage', 'feMerge', 'feMorphology', 'feOffset', 'feSpecularLighting', 'feTile', 'feTurbulence', 'filter', 'font', 'foreignObject', 'g', 'glyph', 'glyphRef', 'image', 'line', 'linearGradient', 'marker', 'mask', 'missing-glyph', 'path', 'pattern', 'polygon', 'polyline', 'radialGradient', 'rect', 'stop', 'svg', 'switch', 'symbol', 'text', 'textPath', 'tref', 'tspan', 'use'],

  // version# for IE 8-11, 0 for others
  IE_VERSION = (window && window.document || {}).documentMode | 0,

  // detect firefox to fix #1374
  FIREFOX = window && !!window.InstallTrigger
/* istanbul ignore next */
riot.observable = function(el) {

  /**
   * Extend the original object or create a new empty one
   * @type { Object }
   */

  el = el || {}

  /**
   * Private variables
   */
  var callbacks = {},
    slice = Array.prototype.slice

  /**
   * Private Methods
   */

  /**
   * Helper function needed to get and loop all the events in a string
   * @param   { String }   e - event string
   * @param   {Function}   fn - callback
   */
  function onEachEvent(e, fn) {
    var es = e.split(' '), l = es.length, i = 0, name, indx
    for (; i < l; i++) {
      name = es[i]
      indx = name.indexOf('.')
      if (name) fn( ~indx ? name.substring(0, indx) : name, i, ~indx ? name.slice(indx + 1) : null)
    }
  }

  /**
   * Public Api
   */

  // extend the el object adding the observable methods
  Object.defineProperties(el, {
    /**
     * Listen to the given space separated list of `events` and
     * execute the `callback` each time an event is triggered.
     * @param  { String } events - events ids
     * @param  { Function } fn - callback function
     * @returns { Object } el
     */
    on: {
      value: function(events, fn) {
        if (typeof fn != 'function')  return el

        onEachEvent(events, function(name, pos, ns) {
          (callbacks[name] = callbacks[name] || []).push(fn)
          fn.typed = pos > 0
          fn.ns = ns
        })

        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Removes the given space separated list of `events` listeners
     * @param   { String } events - events ids
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    off: {
      value: function(events, fn) {
        if (events == '*' && !fn) callbacks = {}
        else {
          onEachEvent(events, function(name, pos, ns) {
            if (fn || ns) {
              var arr = callbacks[name]
              for (var i = 0, cb; cb = arr && arr[i]; ++i) {
                if (cb == fn || ns && cb.ns == ns) arr.splice(i--, 1)
              }
            } else delete callbacks[name]
          })
        }
        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Listen to the given space separated list of `events` and
     * execute the `callback` at most once
     * @param   { String } events - events ids
     * @param   { Function } fn - callback function
     * @returns { Object } el
     */
    one: {
      value: function(events, fn) {
        function on() {
          el.off(events, on)
          fn.apply(el, arguments)
        }
        return el.on(events, on)
      },
      enumerable: false,
      writable: false,
      configurable: false
    },

    /**
     * Execute all callback functions that listen to
     * the given space separated list of `events`
     * @param   { String } events - events ids
     * @returns { Object } el
     */
    trigger: {
      value: function(events) {

        // getting the arguments
        var arglen = arguments.length - 1,
          args = new Array(arglen),
          fns

        for (var i = 0; i < arglen; i++) {
          args[i] = arguments[i + 1] // skip first argument
        }

        onEachEvent(events, function(name, pos, ns) {

          fns = slice.call(callbacks[name] || [], 0)

          for (var i = 0, fn; fn = fns[i]; ++i) {
            if (fn.busy) continue
            fn.busy = 1
            if (!ns || fn.ns == ns) fn.apply(el, fn.typed ? [name].concat(args) : args)
            if (fns[i] !== fn) { i-- }
            fn.busy = 0
          }

          if (callbacks['*'] && name != '*')
            el.trigger.apply(el, ['*', name].concat(args))

        })

        return el
      },
      enumerable: false,
      writable: false,
      configurable: false
    }
  })

  return el

}
/* istanbul ignore next */
;(function(riot) {

/**
 * Simple client-side router
 * @module riot-route
 */


var RE_ORIGIN = /^.+?\/\/+[^\/]+/,
  EVENT_LISTENER = 'EventListener',
  REMOVE_EVENT_LISTENER = 'remove' + EVENT_LISTENER,
  ADD_EVENT_LISTENER = 'add' + EVENT_LISTENER,
  HAS_ATTRIBUTE = 'hasAttribute',
  REPLACE = 'replace',
  POPSTATE = 'popstate',
  HASHCHANGE = 'hashchange',
  TRIGGER = 'trigger',
  MAX_EMIT_STACK_LEVEL = 3,
  win = typeof window != 'undefined' && window,
  doc = typeof document != 'undefined' && document,
  hist = win && history,
  loc = win && (hist.location || win.location), // see html5-history-api
  prot = Router.prototype, // to minify more
  clickEvent = doc && doc.ontouchstart ? 'touchstart' : 'click',
  started = false,
  central = riot.observable(),
  routeFound = false,
  debouncedEmit,
  base, current, parser, secondParser, emitStack = [], emitStackLevel = 0

/**
 * Default parser. You can replace it via router.parser method.
 * @param {string} path - current path (normalized)
 * @returns {array} array
 */
function DEFAULT_PARSER(path) {
  return path.split(/[/?#]/)
}

/**
 * Default parser (second). You can replace it via router.parser method.
 * @param {string} path - current path (normalized)
 * @param {string} filter - filter string (normalized)
 * @returns {array} array
 */
function DEFAULT_SECOND_PARSER(path, filter) {
  var re = new RegExp('^' + filter[REPLACE](/\*/g, '([^/?#]+?)')[REPLACE](/\.\./, '.*') + '$'),
    args = path.match(re)

  if (args) return args.slice(1)
}

/**
 * Simple/cheap debounce implementation
 * @param   {function} fn - callback
 * @param   {number} delay - delay in seconds
 * @returns {function} debounced function
 */
function debounce(fn, delay) {
  var t
  return function () {
    clearTimeout(t)
    t = setTimeout(fn, delay)
  }
}

/**
 * Set the window listeners to trigger the routes
 * @param {boolean} autoExec - see route.start
 */
function start(autoExec) {
  debouncedEmit = debounce(emit, 1)
  win[ADD_EVENT_LISTENER](POPSTATE, debouncedEmit)
  win[ADD_EVENT_LISTENER](HASHCHANGE, debouncedEmit)
  doc[ADD_EVENT_LISTENER](clickEvent, click)
  if (autoExec) emit(true)
}

/**
 * Router class
 */
function Router() {
  this.$ = []
  riot.observable(this) // make it observable
  central.on('stop', this.s.bind(this))
  central.on('emit', this.e.bind(this))
}

function normalize(path) {
  return path[REPLACE](/^\/|\/$/, '')
}

function isString(str) {
  return typeof str == 'string'
}

/**
 * Get the part after domain name
 * @param {string} href - fullpath
 * @returns {string} path from root
 */
function getPathFromRoot(href) {
  return (href || loc.href)[REPLACE](RE_ORIGIN, '')
}

/**
 * Get the part after base
 * @param {string} href - fullpath
 * @returns {string} path from base
 */
function getPathFromBase(href) {
  return base[0] == '#'
    ? (href || loc.href || '').split(base)[1] || ''
    : (loc ? getPathFromRoot(href) : href || '')[REPLACE](base, '')
}

function emit(force) {
  // the stack is needed for redirections
  var isRoot = emitStackLevel == 0
  if (MAX_EMIT_STACK_LEVEL <= emitStackLevel) return

  emitStackLevel++
  emitStack.push(function() {
    var path = getPathFromBase()
    if (force || path != current) {
      central[TRIGGER]('emit', path)
      current = path
    }
  })
  if (isRoot) {
    while (emitStack.length) {
      emitStack[0]()
      emitStack.shift()
    }
    emitStackLevel = 0
  }
}

function click(e) {
  if (
    e.which != 1 // not left click
    || e.metaKey || e.ctrlKey || e.shiftKey // or meta keys
    || e.defaultPrevented // or default prevented
  ) return

  var el = e.target
  while (el && el.nodeName != 'A') el = el.parentNode

  if (
    !el || el.nodeName != 'A' // not A tag
    || el[HAS_ATTRIBUTE]('download') // has download attr
    || !el[HAS_ATTRIBUTE]('href') // has no href attr
    || el.target && el.target != '_self' // another window or frame
    || el.href.indexOf(loc.href.match(RE_ORIGIN)[0]) == -1 // cross origin
  ) return

  if (el.href != loc.href) {
    if (
      el.href.split('#')[0] == loc.href.split('#')[0] // internal jump
      || base != '#' && getPathFromRoot(el.href).indexOf(base) !== 0 // outside of base
      || !go(getPathFromBase(el.href), el.title || doc.title) // route not found
    ) return
  }

  e.preventDefault()
}

/**
 * Go to the path
 * @param {string} path - destination path
 * @param {string} title - page title
 * @param {boolean} shouldReplace - use replaceState or pushState
 * @returns {boolean} - route not found flag
 */
function go(path, title, shouldReplace) {
  if (hist) { // if a browser
    path = base + normalize(path)
    title = title || doc.title
    // browsers ignores the second parameter `title`
    shouldReplace
      ? hist.replaceState(null, title, path)
      : hist.pushState(null, title, path)
    // so we need to set it manually
    doc.title = title
    routeFound = false
    emit()
    return routeFound
  }

  // Server-side usage: directly execute handlers for the path
  return central[TRIGGER]('emit', getPathFromBase(path))
}

/**
 * Go to path or set action
 * a single string:                go there
 * two strings:                    go there with setting a title
 * two strings and boolean:        replace history with setting a title
 * a single function:              set an action on the default route
 * a string/RegExp and a function: set an action on the route
 * @param {(string|function)} first - path / action / filter
 * @param {(string|RegExp|function)} second - title / action
 * @param {boolean} third - replace flag
 */
prot.m = function(first, second, third) {
  if (isString(first) && (!second || isString(second))) go(first, second, third || false)
  else if (second) this.r(first, second)
  else this.r('@', first)
}

/**
 * Stop routing
 */
prot.s = function() {
  this.off('*')
  this.$ = []
}

/**
 * Emit
 * @param {string} path - path
 */
prot.e = function(path) {
  this.$.concat('@').some(function(filter) {
    var args = (filter == '@' ? parser : secondParser)(normalize(path), normalize(filter))
    if (typeof args != 'undefined') {
      this[TRIGGER].apply(null, [filter].concat(args))
      return routeFound = true // exit from loop
    }
  }, this)
}

/**
 * Register route
 * @param {string} filter - filter for matching to url
 * @param {function} action - action to register
 */
prot.r = function(filter, action) {
  if (filter != '@') {
    filter = '/' + normalize(filter)
    this.$.push(filter)
  }
  this.on(filter, action)
}

var mainRouter = new Router()
var route = mainRouter.m.bind(mainRouter)

/**
 * Create a sub router
 * @returns {function} the method of a new Router object
 */
route.create = function() {
  var newSubRouter = new Router()
  // assign sub-router's main method
  var router = newSubRouter.m.bind(newSubRouter)
  // stop only this sub-router
  router.stop = newSubRouter.s.bind(newSubRouter)
  return router
}

/**
 * Set the base of url
 * @param {(str|RegExp)} arg - a new base or '#' or '#!'
 */
route.base = function(arg) {
  base = arg || '#'
  current = getPathFromBase() // recalculate current path
}

/** Exec routing right now **/
route.exec = function() {
  emit(true)
}

/**
 * Replace the default router to yours
 * @param {function} fn - your parser function
 * @param {function} fn2 - your secondParser function
 */
route.parser = function(fn, fn2) {
  if (!fn && !fn2) {
    // reset parser for testing...
    parser = DEFAULT_PARSER
    secondParser = DEFAULT_SECOND_PARSER
  }
  if (fn) parser = fn
  if (fn2) secondParser = fn2
}

/**
 * Helper function to get url query as an object
 * @returns {object} parsed query
 */
route.query = function() {
  var q = {}
  var href = loc.href || current
  href[REPLACE](/[?&](.+?)=([^&]*)/g, function(_, k, v) { q[k] = v })
  return q
}

/** Stop routing **/
route.stop = function () {
  if (started) {
    if (win) {
      win[REMOVE_EVENT_LISTENER](POPSTATE, debouncedEmit)
      win[REMOVE_EVENT_LISTENER](HASHCHANGE, debouncedEmit)
      doc[REMOVE_EVENT_LISTENER](clickEvent, click)
    }
    central[TRIGGER]('stop')
    started = false
  }
}

/**
 * Start routing
 * @param {boolean} autoExec - automatically exec after starting if true
 */
route.start = function (autoExec) {
  if (!started) {
    if (win) {
      if (document.readyState == 'complete') start(autoExec)
      // the timeout is needed to solve
      // a weird safari bug https://github.com/riot/route/issues/33
      else win[ADD_EVENT_LISTENER]('load', function() {
        setTimeout(function() { start(autoExec) }, 1)
      })
    }
    started = true
  }
}

/** Prepare the router **/
route.base()
route.parser()

riot.route = route
})(riot)
/* istanbul ignore next */

/**
 * The riot template engine
 * @version v2.4.0
 */
/**
 * riot.util.brackets
 *
 * - `brackets    ` - Returns a string or regex based on its parameter
 * - `brackets.set` - Change the current riot brackets
 *
 * @module
 */

var brackets = (function (UNDEF) {

  var
    REGLOB = 'g',

    R_MLCOMMS = /\/\*[^*]*\*+(?:[^*\/][^*]*\*+)*\//g,

    R_STRINGS = /"[^"\\]*(?:\\[\S\s][^"\\]*)*"|'[^'\\]*(?:\\[\S\s][^'\\]*)*'/g,

    S_QBLOCKS = R_STRINGS.source + '|' +
      /(?:\breturn\s+|(?:[$\w\)\]]|\+\+|--)\s*(\/)(?![*\/]))/.source + '|' +
      /\/(?=[^*\/])[^[\/\\]*(?:(?:\[(?:\\.|[^\]\\]*)*\]|\\.)[^[\/\\]*)*?(\/)[gim]*/.source,

    FINDBRACES = {
      '(': RegExp('([()])|'   + S_QBLOCKS, REGLOB),
      '[': RegExp('([[\\]])|' + S_QBLOCKS, REGLOB),
      '{': RegExp('([{}])|'   + S_QBLOCKS, REGLOB)
    },

    DEFAULT = '{ }'

  var _pairs = [
    '{', '}',
    '{', '}',
    /{[^}]*}/,
    /\\([{}])/g,
    /\\({)|{/g,
    RegExp('\\\\(})|([[({])|(})|' + S_QBLOCKS, REGLOB),
    DEFAULT,
    /^\s*{\^?\s*([$\w]+)(?:\s*,\s*(\S+))?\s+in\s+(\S.*)\s*}/,
    /(^|[^\\]){=[\S\s]*?}/
  ]

  var
    cachedBrackets = UNDEF,
    _regex,
    _cache = [],
    _settings

  function _loopback (re) { return re }

  function _rewrite (re, bp) {
    if (!bp) bp = _cache
    return new RegExp(
      re.source.replace(/{/g, bp[2]).replace(/}/g, bp[3]), re.global ? REGLOB : ''
    )
  }

  function _create (pair) {
    if (pair === DEFAULT) return _pairs

    var arr = pair.split(' ')

    if (arr.length !== 2 || /[\x00-\x1F<>a-zA-Z0-9'",;\\]/.test(pair)) { // eslint-disable-line
      throw new Error('Unsupported brackets "' + pair + '"')
    }
    arr = arr.concat(pair.replace(/(?=[[\]()*+?.^$|])/g, '\\').split(' '))

    arr[4] = _rewrite(arr[1].length > 1 ? /{[\S\s]*?}/ : _pairs[4], arr)
    arr[5] = _rewrite(pair.length > 3 ? /\\({|})/g : _pairs[5], arr)
    arr[6] = _rewrite(_pairs[6], arr)
    arr[7] = RegExp('\\\\(' + arr[3] + ')|([[({])|(' + arr[3] + ')|' + S_QBLOCKS, REGLOB)
    arr[8] = pair
    return arr
  }

  function _brackets (reOrIdx) {
    return reOrIdx instanceof RegExp ? _regex(reOrIdx) : _cache[reOrIdx]
  }

  _brackets.split = function split (str, tmpl, _bp) {
    // istanbul ignore next: _bp is for the compiler
    if (!_bp) _bp = _cache

    var
      parts = [],
      match,
      isexpr,
      start,
      pos,
      re = _bp[6]

    isexpr = start = re.lastIndex = 0

    while ((match = re.exec(str))) {

      pos = match.index

      if (isexpr) {

        if (match[2]) {
          re.lastIndex = skipBraces(str, match[2], re.lastIndex)
          continue
        }
        if (!match[3]) {
          continue
        }
      }

      if (!match[1]) {
        unescapeStr(str.slice(start, pos))
        start = re.lastIndex
        re = _bp[6 + (isexpr ^= 1)]
        re.lastIndex = start
      }
    }

    if (str && start < str.length) {
      unescapeStr(str.slice(start))
    }

    return parts

    function unescapeStr (s) {
      if (tmpl || isexpr) {
        parts.push(s && s.replace(_bp[5], '$1'))
      } else {
        parts.push(s)
      }
    }

    function skipBraces (s, ch, ix) {
      var
        match,
        recch = FINDBRACES[ch]

      recch.lastIndex = ix
      ix = 1
      while ((match = recch.exec(s))) {
        if (match[1] &&
          !(match[1] === ch ? ++ix : --ix)) break
      }
      return ix ? s.length : recch.lastIndex
    }
  }

  _brackets.hasExpr = function hasExpr (str) {
    return _cache[4].test(str)
  }

  _brackets.loopKeys = function loopKeys (expr) {
    var m = expr.match(_cache[9])

    return m
      ? { key: m[1], pos: m[2], val: _cache[0] + m[3].trim() + _cache[1] }
      : { val: expr.trim() }
  }

  _brackets.array = function array (pair) {
    return pair ? _create(pair) : _cache
  }

  function _reset (pair) {
    if ((pair || (pair = DEFAULT)) !== _cache[8]) {
      _cache = _create(pair)
      _regex = pair === DEFAULT ? _loopback : _rewrite
      _cache[9] = _regex(_pairs[9])
    }
    cachedBrackets = pair
  }

  function _setSettings (o) {
    var b

    o = o || {}
    b = o.brackets
    Object.defineProperty(o, 'brackets', {
      set: _reset,
      get: function () { return cachedBrackets },
      enumerable: true
    })
    _settings = o
    _reset(b)
  }

  Object.defineProperty(_brackets, 'settings', {
    set: _setSettings,
    get: function () { return _settings }
  })

  /* istanbul ignore next: in the browser riot is always in the scope */
  _brackets.settings = typeof riot !== 'undefined' && riot.settings || {}
  _brackets.set = _reset

  _brackets.R_STRINGS = R_STRINGS
  _brackets.R_MLCOMMS = R_MLCOMMS
  _brackets.S_QBLOCKS = S_QBLOCKS

  return _brackets

})()

/**
 * @module tmpl
 *
 * tmpl          - Root function, returns the template value, render with data
 * tmpl.hasExpr  - Test the existence of a expression inside a string
 * tmpl.loopKeys - Get the keys for an 'each' loop (used by `_each`)
 */

var tmpl = (function () {

  var _cache = {}

  function _tmpl (str, data) {
    if (!str) return str

    return (_cache[str] || (_cache[str] = _create(str))).call(data, _logErr)
  }

  _tmpl.haveRaw = brackets.hasRaw

  _tmpl.hasExpr = brackets.hasExpr

  _tmpl.loopKeys = brackets.loopKeys

  _tmpl.errorHandler = null

  function _logErr (err, ctx) {

    if (_tmpl.errorHandler) {

      err.riotData = {
        tagName: ctx && ctx.root && ctx.root.tagName,
        _riot_id: ctx && ctx._riot_id  //eslint-disable-line camelcase
      }
      _tmpl.errorHandler(err)
    }
  }

  function _create (str) {
    var expr = _getTmpl(str)

    if (expr.slice(0, 11) !== 'try{return ') expr = 'return ' + expr

/* eslint-disable */

    return new Function('E', expr + ';')
/* eslint-enable */
  }

  var
    CH_IDEXPR = '\u2057',
    RE_CSNAME = /^(?:(-?[_A-Za-z\xA0-\xFF][-\w\xA0-\xFF]*)|\u2057(\d+)~):/,
    RE_QBLOCK = RegExp(brackets.S_QBLOCKS, 'g'),
    RE_DQUOTE = /\u2057/g,
    RE_QBMARK = /\u2057(\d+)~/g

  function _getTmpl (str) {
    var
      qstr = [],
      expr,
      parts = brackets.split(str.replace(RE_DQUOTE, '"'), 1)

    if (parts.length > 2 || parts[0]) {
      var i, j, list = []

      for (i = j = 0; i < parts.length; ++i) {

        expr = parts[i]

        if (expr && (expr = i & 1

            ? _parseExpr(expr, 1, qstr)

            : '"' + expr
                .replace(/\\/g, '\\\\')
                .replace(/\r\n?|\n/g, '\\n')
                .replace(/"/g, '\\"') +
              '"'

          )) list[j++] = expr

      }

      expr = j < 2 ? list[0]
           : '[' + list.join(',') + '].join("")'

    } else {

      expr = _parseExpr(parts[1], 0, qstr)
    }

    if (qstr[0]) {
      expr = expr.replace(RE_QBMARK, function (_, pos) {
        return qstr[pos]
          .replace(/\r/g, '\\r')
          .replace(/\n/g, '\\n')
      })
    }
    return expr
  }

  var
    RE_BREND = {
      '(': /[()]/g,
      '[': /[[\]]/g,
      '{': /[{}]/g
    }

  function _parseExpr (expr, asText, qstr) {

    expr = expr
          .replace(RE_QBLOCK, function (s, div) {
            return s.length > 2 && !div ? CH_IDEXPR + (qstr.push(s) - 1) + '~' : s
          })
          .replace(/\s+/g, ' ').trim()
          .replace(/\ ?([[\({},?\.:])\ ?/g, '$1')

    if (expr) {
      var
        list = [],
        cnt = 0,
        match

      while (expr &&
            (match = expr.match(RE_CSNAME)) &&
            !match.index
        ) {
        var
          key,
          jsb,
          re = /,|([[{(])|$/g

        expr = RegExp.rightContext
        key  = match[2] ? qstr[match[2]].slice(1, -1).trim().replace(/\s+/g, ' ') : match[1]

        while (jsb = (match = re.exec(expr))[1]) skipBraces(jsb, re)

        jsb  = expr.slice(0, match.index)
        expr = RegExp.rightContext

        list[cnt++] = _wrapExpr(jsb, 1, key)
      }

      expr = !cnt ? _wrapExpr(expr, asText)
           : cnt > 1 ? '[' + list.join(',') + '].join(" ").trim()' : list[0]
    }
    return expr

    function skipBraces (ch, re) {
      var
        mm,
        lv = 1,
        ir = RE_BREND[ch]

      ir.lastIndex = re.lastIndex
      while (mm = ir.exec(expr)) {
        if (mm[0] === ch) ++lv
        else if (!--lv) break
      }
      re.lastIndex = lv ? expr.length : ir.lastIndex
    }
  }

  // istanbul ignore next: not both
  var // eslint-disable-next-line max-len
    JS_CONTEXT = '"in this?this:' + (typeof window !== 'object' ? 'global' : 'window') + ').',
    JS_VARNAME = /[,{][$\w]+:|(^ *|[^$\w\.])(?!(?:typeof|true|false|null|undefined|in|instanceof|is(?:Finite|NaN)|void|NaN|new|Date|RegExp|Math)(?![$\w]))([$_A-Za-z][$\w]*)/g,
    JS_NOPROPS = /^(?=(\.[$\w]+))\1(?:[^.[(]|$)/

  function _wrapExpr (expr, asText, key) {
    var tb

    expr = expr.replace(JS_VARNAME, function (match, p, mvar, pos, s) {
      if (mvar) {
        pos = tb ? 0 : pos + match.length

        if (mvar !== 'this' && mvar !== 'global' && mvar !== 'window') {
          match = p + '("' + mvar + JS_CONTEXT + mvar
          if (pos) tb = (s = s[pos]) === '.' || s === '(' || s === '['
        } else if (pos) {
          tb = !JS_NOPROPS.test(s.slice(pos))
        }
      }
      return match
    })

    if (tb) {
      expr = 'try{return ' + expr + '}catch(e){E(e,this)}'
    }

    if (key) {

      expr = (tb
          ? 'function(){' + expr + '}.call(this)' : '(' + expr + ')'
        ) + '?"' + key + '":""'

    } else if (asText) {

      expr = 'function(v){' + (tb
          ? expr.replace('return ', 'v=') : 'v=(' + expr + ')'
        ) + ';return v||v===0?v:""}.call(this)'
    }

    return expr
  }

  // istanbul ignore next: compatibility fix for beta versions
  _tmpl.parse = function (s) { return s }

  _tmpl.version = brackets.version = 'v2.4.0'

  return _tmpl

})()

/*
  lib/browser/tag/mkdom.js

  Includes hacks needed for the Internet Explorer version 9 and below
  See: http://kangax.github.io/compat-table/es5/#ie8
       http://codeplanet.io/dropping-ie8/
*/
var mkdom = (function _mkdom() {
  var
    reHasYield  = /<yield\b/i,
    reYieldAll  = /<yield\s*(?:\/>|>([\S\s]*?)<\/yield\s*>|>)/ig,
    reYieldSrc  = /<yield\s+to=['"]([^'">]*)['"]\s*>([\S\s]*?)<\/yield\s*>/ig,
    reYieldDest = /<yield\s+from=['"]?([-\w]+)['"]?\s*(?:\/>|>([\S\s]*?)<\/yield\s*>)/ig
  var
    rootEls = { tr: 'tbody', th: 'tr', td: 'tr', col: 'colgroup' },
    tblTags = IE_VERSION && IE_VERSION < 10
      ? SPECIAL_TAGS_REGEX : /^(?:t(?:body|head|foot|[rhd])|caption|col(?:group)?)$/

  /**
   * Creates a DOM element to wrap the given content. Normally an `DIV`, but can be
   * also a `TABLE`, `SELECT`, `TBODY`, `TR`, or `COLGROUP` element.
   *
   * @param   {string} templ  - The template coming from the custom tag definition
   * @param   {string} [html] - HTML content that comes from the DOM element where you
   *           will mount the tag, mostly the original tag in the page
   * @returns {HTMLElement} DOM element with _templ_ merged through `YIELD` with the _html_.
   */
  function _mkdom(templ, html) {
    var
      match   = templ && templ.match(/^\s*<([-\w]+)/),
      tagName = match && match[1].toLowerCase(),
      el = mkEl('div', isSVGTag(tagName))

    // replace all the yield tags with the tag inner html
    templ = replaceYield(templ, html)

    /* istanbul ignore next */
    if (tblTags.test(tagName))
      el = specialTags(el, templ, tagName)
    else
      setInnerHTML(el, templ)

    el.stub = true

    return el
  }

  /*
    Creates the root element for table or select child elements:
    tr/th/td/thead/tfoot/tbody/caption/col/colgroup/option/optgroup
  */
  function specialTags(el, templ, tagName) {
    var
      select = tagName[0] === 'o',
      parent = select ? 'select>' : 'table>'

    // trim() is important here, this ensures we don't have artifacts,
    // so we can check if we have only one element inside the parent
    el.innerHTML = '<' + parent + templ.trim() + '</' + parent
    parent = el.firstChild

    // returns the immediate parent if tr/th/td/col is the only element, if not
    // returns the whole tree, as this can include additional elements
    if (select) {
      parent.selectedIndex = -1  // for IE9, compatible w/current riot behavior
    } else {
      // avoids insertion of cointainer inside container (ex: tbody inside tbody)
      var tname = rootEls[tagName]
      if (tname && parent.childElementCount === 1) parent = $(tname, parent)
    }
    return parent
  }

  /*
    Replace the yield tag from any tag template with the innerHTML of the
    original tag in the page
  */
  function replaceYield(templ, html) {
    // do nothing if no yield
    if (!reHasYield.test(templ)) return templ

    // be careful with #1343 - string on the source having `$1`
    var src = {}

    html = html && html.replace(reYieldSrc, function (_, ref, text) {
      src[ref] = src[ref] || text   // preserve first definition
      return ''
    }).trim()

    return templ
      .replace(reYieldDest, function (_, ref, def) {  // yield with from - to attrs
        return src[ref] || def || ''
      })
      .replace(reYieldAll, function (_, def) {        // yield without any "from"
        return html || def || ''
      })
  }

  return _mkdom

})()

/**
 * Convert the item looped into an object used to extend the child tag properties
 * @param   { Object } expr - object containing the keys used to extend the children tags
 * @param   { * } key - value to assign to the new object returned
 * @param   { * } val - value containing the position of the item in the array
 * @returns { Object } - new object containing the values of the original item
 *
 * The variables 'key' and 'val' are arbitrary.
 * They depend on the collection type looped (Array, Object)
 * and on the expression used on the each tag
 *
 */
function mkitem(expr, key, val) {
  var item = {}
  item[expr.key] = key
  if (expr.pos) item[expr.pos] = val
  return item
}

/**
 * Unmount the redundant tags
 * @param   { Array } items - array containing the current items to loop
 * @param   { Array } tags - array containing all the children tags
 */
function unmountRedundant(items, tags) {

  var i = tags.length,
    j = items.length,
    t

  while (i > j) {
    t = tags[--i]
    tags.splice(i, 1)
    t.unmount()
  }
}

/**
 * Move the nested custom tags in non custom loop tags
 * @param   { Object } child - non custom loop tag
 * @param   { Number } i - current position of the loop tag
 */
function moveNestedTags(child, i) {
  Object.keys(child.tags).forEach(function(tagName) {
    var tag = child.tags[tagName]
    if (isArray(tag))
      each(tag, function (t) {
        moveChildTag(t, tagName, i)
      })
    else
      moveChildTag(tag, tagName, i)
  })
}

/**
 * Adds the elements for a virtual tag
 * @param { Tag } tag - the tag whose root's children will be inserted or appended
 * @param { Node } src - the node that will do the inserting or appending
 * @param { Tag } target - only if inserting, insert before this tag's first child
 */
function addVirtual(tag, src, target) {
  var el = tag._root, sib
  tag._virts = []
  while (el) {
    sib = el.nextSibling
    if (target)
      src.insertBefore(el, target._root)
    else
      src.appendChild(el)

    tag._virts.push(el) // hold for unmounting
    el = sib
  }
}

/**
 * Move virtual tag and all child nodes
 * @param { Tag } tag - first child reference used to start move
 * @param { Node } src  - the node that will do the inserting
 * @param { Tag } target - insert before this tag's first child
 * @param { Number } len - how many child nodes to move
 */
function moveVirtual(tag, src, target, len) {
  var el = tag._root, sib, i = 0
  for (; i < len; i++) {
    sib = el.nextSibling
    src.insertBefore(el, target._root)
    el = sib
  }
}


/**
 * Manage tags having the 'each'
 * @param   { Object } dom - DOM node we need to loop
 * @param   { Tag } parent - parent tag instance where the dom node is contained
 * @param   { String } expr - string contained in the 'each' attribute
 */
function _each(dom, parent, expr) {

  // remove the each property from the original tag
  remAttr(dom, 'each')

  var mustReorder = typeof getAttr(dom, 'no-reorder') !== T_STRING || remAttr(dom, 'no-reorder'),
    tagName = getTagName(dom),
    impl = __tagImpl[tagName] || { tmpl: getOuterHTML(dom) },
    useRoot = SPECIAL_TAGS_REGEX.test(tagName),
    root = dom.parentNode,
    ref = document.createTextNode(''),
    child = getTag(dom),
    isOption = tagName.toLowerCase() === 'option', // the option tags must be treated differently
    tags = [],
    oldItems = [],
    hasKeys,
    isVirtual = dom.tagName == 'VIRTUAL'

  // parse the each expression
  expr = tmpl.loopKeys(expr)

  // insert a marked where the loop tags will be injected
  root.insertBefore(ref, dom)

  // clean template code
  parent.one('before-mount', function () {

    // remove the original DOM node
    dom.parentNode.removeChild(dom)
    if (root.stub) root = parent.root

  }).on('update', function () {
    // get the new items collection
    var items = tmpl(expr.val, parent),
      // create a fragment to hold the new DOM nodes to inject in the parent tag
      frag = document.createDocumentFragment()

    // object loop. any changes cause full redraw
    if (!isArray(items)) {
      hasKeys = items || false
      items = hasKeys ?
        Object.keys(items).map(function (key) {
          return mkitem(expr, key, items[key])
        }) : []
    }

    // loop all the new items
    var i = 0,
      itemsLength = items.length

    for (; i < itemsLength; i++) {
      // reorder only if the items are objects
      var
        item = items[i],
        _mustReorder = mustReorder && typeof item == T_OBJECT && !hasKeys,
        oldPos = oldItems.indexOf(item),
        pos = ~oldPos && _mustReorder ? oldPos : i,
        // does a tag exist in this position?
        tag = tags[pos]

      item = !hasKeys && expr.key ? mkitem(expr, item, i) : item

      // new tag
      if (
        !_mustReorder && !tag // with no-reorder we just update the old tags
        ||
        _mustReorder && !~oldPos || !tag // by default we always try to reorder the DOM elements
      ) {

        tag = new Tag(impl, {
          parent: parent,
          isLoop: true,
          hasImpl: !!__tagImpl[tagName],
          root: useRoot ? root : dom.cloneNode(),
          item: item
        }, dom.innerHTML)

        tag.mount()

        if (isVirtual) tag._root = tag.root.firstChild // save reference for further moves or inserts
        // this tag must be appended
        if (i == tags.length || !tags[i]) { // fix 1581
          if (isVirtual)
            addVirtual(tag, frag)
          else frag.appendChild(tag.root)
        }
        // this tag must be insert
        else {
          if (isVirtual)
            addVirtual(tag, root, tags[i])
          else root.insertBefore(tag.root, tags[i].root) // #1374 some browsers reset selected here
          oldItems.splice(i, 0, item)
        }

        tags.splice(i, 0, tag)
        pos = i // handled here so no move
      } else tag.update(item, true)

      // reorder the tag if it's not located in its previous position
      if (
        pos !== i && _mustReorder &&
        tags[i] // fix 1581 unable to reproduce it in a test!
      ) {
        // update the DOM
        if (isVirtual)
          moveVirtual(tag, root, tags[i], dom.childNodes.length)
        else root.insertBefore(tag.root, tags[i].root)
        // update the position attribute if it exists
        if (expr.pos)
          tag[expr.pos] = i
        // move the old tag instance
        tags.splice(i, 0, tags.splice(pos, 1)[0])
        // move the old item
        oldItems.splice(i, 0, oldItems.splice(pos, 1)[0])
        // if the loop tags are not custom
        // we need to move all their custom tags into the right position
        if (!child && tag.tags) moveNestedTags(tag, i)
      }

      // cache the original item to use it in the events bound to this node
      // and its children
      tag._item = item
      // cache the real parent tag internally
      defineProperty(tag, '_parent', parent)
    }

    // remove the redundant tags
    unmountRedundant(items, tags)

    // insert the new nodes
    root.insertBefore(frag, ref)
    if (isOption) {

      // #1374 FireFox bug in <option selected={expression}>
      if (FIREFOX && !root.multiple) {
        for (var n = 0; n < root.length; n++) {
          if (root[n].__riot1374) {
            root.selectedIndex = n  // clear other options
            delete root[n].__riot1374
            break
          }
        }
      }
    }

    // set the 'tags' property of the parent tag
    // if child is 'undefined' it means that we don't need to set this property
    // for example:
    // we don't need store the `myTag.tags['div']` property if we are looping a div tag
    // but we need to track the `myTag.tags['child']` property looping a custom child node named `child`
    if (child) parent.tags[tagName] = tags

    // clone the items array
    oldItems = items.slice()

  })

}
/**
 * Object that will be used to inject and manage the css of every tag instance
 */
var styleManager = (function(_riot) {

  if (!window) return { // skip injection on the server
    add: function () {},
    inject: function () {}
  }

  var styleNode = (function () {
    // create a new style element with the correct type
    var newNode = mkEl('style')
    setAttr(newNode, 'type', 'text/css')

    // replace any user node or insert the new one into the head
    var userNode = $('style[type=riot]')
    if (userNode) {
      if (userNode.id) newNode.id = userNode.id
      userNode.parentNode.replaceChild(newNode, userNode)
    }
    else document.getElementsByTagName('head')[0].appendChild(newNode)

    return newNode
  })()

  // Create cache and shortcut to the correct property
  var cssTextProp = styleNode.styleSheet,
    stylesToInject = ''

  // Expose the style node in a non-modificable property
  Object.defineProperty(_riot, 'styleNode', {
    value: styleNode,
    writable: true
  })

  /**
   * Public api
   */
  return {
    /**
     * Save a tag style to be later injected into DOM
     * @param   { String } css [description]
     */
    add: function(css) {
      stylesToInject += css
    },
    /**
     * Inject all previously saved tag styles into DOM
     * innerHTML seems slow: http://jsperf.com/riot-insert-style
     */
    inject: function() {
      if (stylesToInject) {
        if (cssTextProp) cssTextProp.cssText += stylesToInject
        else styleNode.innerHTML += stylesToInject
        stylesToInject = ''
      }
    }
  }

})(riot)


function parseNamedElements(root, tag, childTags, forceParsingNamed) {

  walk(root, function(dom) {
    if (dom.nodeType == 1) {
      dom.isLoop = dom.isLoop ||
                  (dom.parentNode && dom.parentNode.isLoop || getAttr(dom, 'each'))
                    ? 1 : 0

      // custom child tag
      if (childTags) {
        var child = getTag(dom)

        if (child && !dom.isLoop)
          childTags.push(initChildTag(child, {root: dom, parent: tag}, dom.innerHTML, tag))
      }

      if (!dom.isLoop || forceParsingNamed)
        setNamed(dom, tag, [])
    }

  })

}

function parseExpressions(root, tag, expressions) {

  function addExpr(dom, val, extra) {
    if (tmpl.hasExpr(val)) {
      expressions.push(extend({ dom: dom, expr: val }, extra))
    }
  }

  walk(root, function(dom) {
    var type = dom.nodeType,
      attr

    // text node
    if (type == 3 && dom.parentNode.tagName != 'STYLE') addExpr(dom, dom.nodeValue)
    if (type != 1) return

    /* element */

    // loop
    attr = getAttr(dom, 'each')

    if (attr) { _each(dom, tag, attr); return false }

    // attribute expressions
    each(dom.attributes, function(attr) {
      var name = attr.name,
        bool = name.split('__')[1]

      addExpr(dom, attr.value, { attr: bool || name, bool: bool })
      if (bool) { remAttr(dom, name); return false }

    })

    // skip custom tags
    if (getTag(dom)) return false

  })

}
function Tag(impl, conf, innerHTML) {

  var self = riot.observable(this),
    opts = inherit(conf.opts) || {},
    parent = conf.parent,
    isLoop = conf.isLoop,
    hasImpl = conf.hasImpl,
    item = cleanUpData(conf.item),
    expressions = [],
    childTags = [],
    root = conf.root,
    tagName = root.tagName.toLowerCase(),
    attr = {},
    propsInSyncWithParent = [],
    dom

  // only call unmount if we have a valid __tagImpl (has name property)
  if (impl.name && root._tag) root._tag.unmount(true)

  // not yet mounted
  this.isMounted = false
  root.isLoop = isLoop

  // keep a reference to the tag just created
  // so we will be able to mount this tag multiple times
  root._tag = this

  // create a unique id to this tag
  // it could be handy to use it also to improve the virtual dom rendering speed
  defineProperty(this, '_riot_id', ++__uid) // base 1 allows test !t._riot_id

  extend(this, { parent: parent, root: root, opts: opts}, item)
  // protect the "tags" property from being overridden
  defineProperty(this, 'tags', {})

  // grab attributes
  each(root.attributes, function(el) {
    var val = el.value
    // remember attributes with expressions only
    if (tmpl.hasExpr(val)) attr[el.name] = val
  })

  dom = mkdom(impl.tmpl, innerHTML)

  // options
  function updateOpts() {
    var ctx = hasImpl && isLoop ? self : parent || self

    // update opts from current DOM attributes
    each(root.attributes, function(el) {
      var val = el.value
      opts[toCamel(el.name)] = tmpl.hasExpr(val) ? tmpl(val, ctx) : val
    })
    // recover those with expressions
    each(Object.keys(attr), function(name) {
      opts[toCamel(name)] = tmpl(attr[name], ctx)
    })
  }

  function normalizeData(data) {
    for (var key in item) {
      if (typeof self[key] !== T_UNDEF && isWritable(self, key))
        self[key] = data[key]
    }
  }

  function inheritFromParent () {
    if (!self.parent || !isLoop) return
    each(Object.keys(self.parent), function(k) {
      // some properties must be always in sync with the parent tag
      var mustSync = !RESERVED_WORDS_BLACKLIST.test(k) && contains(propsInSyncWithParent, k)
      if (typeof self[k] === T_UNDEF || mustSync) {
        // track the property to keep in sync
        // so we can keep it updated
        if (!mustSync) propsInSyncWithParent.push(k)
        self[k] = self.parent[k]
      }
    })
  }

  /**
   * Update the tag expressions and options
   * @param   { * }  data - data we want to use to extend the tag properties
   * @param   { Boolean } isInherited - is this update coming from a parent tag?
   * @returns { self }
   */
  defineProperty(this, 'update', function(data, isInherited) {

    // make sure the data passed will not override
    // the component core methods
    data = cleanUpData(data)
    // inherit properties from the parent
    inheritFromParent()
    // normalize the tag properties in case an item object was initially passed
    if (data && isObject(item)) {
      normalizeData(data)
      item = data
    }
    extend(self, data)
    updateOpts()
    self.trigger('update', data)
    update(expressions, self)

    // the updated event will be triggered
    // once the DOM will be ready and all the re-flows are completed
    // this is useful if you want to get the "real" root properties
    // 4 ex: root.offsetWidth ...
    if (isInherited && self.parent)
      // closes #1599
      self.parent.one('updated', function() { self.trigger('updated') })
    else rAF(function() { self.trigger('updated') })

    return this
  })

  defineProperty(this, 'mixin', function() {
    each(arguments, function(mix) {
      var instance,
        props = [],
        obj

      mix = typeof mix === T_STRING ? riot.mixin(mix) : mix

      // check if the mixin is a function
      if (isFunction(mix)) {
        // create the new mixin instance
        instance = new mix()
      } else instance = mix

      // build multilevel prototype inheritance chain property list
      do props = props.concat(Object.getOwnPropertyNames(obj || instance))
      while (obj = Object.getPrototypeOf(obj || instance))

      // loop the keys in the function prototype or the all object keys
      each(props, function(key) {
        // bind methods to self
        if (key != 'init' && !self[key])
          // apply method only if it does not already exist on the instance
          self[key] = isFunction(instance[key]) ?
            instance[key].bind(self) :
            instance[key]
      })

      // init method will be called automatically
      if (instance.init) instance.init.bind(self)()
    })
    return this
  })

  defineProperty(this, 'mount', function() {

    updateOpts()

    // add global mixins
    var globalMixin = riot.mixin(GLOBAL_MIXIN)
    if (globalMixin)
      for (var i in globalMixin)
        if (globalMixin.hasOwnProperty(i))
          self.mixin(globalMixin[i])

    // initialiation
    if (impl.fn) impl.fn.call(self, opts)

    // parse layout after init. fn may calculate args for nested custom tags
    parseExpressions(dom, self, expressions)

    // mount the child tags
    toggle(true)

    // update the root adding custom attributes coming from the compiler
    // it fixes also #1087
    if (impl.attrs)
      walkAttributes(impl.attrs, function (k, v) { setAttr(root, k, v) })
    if (impl.attrs || hasImpl)
      parseExpressions(self.root, self, expressions)

    if (!self.parent || isLoop) self.update(item)

    // internal use only, fixes #403
    self.trigger('before-mount')

    if (isLoop && !hasImpl) {
      // update the root attribute for the looped elements
      root = dom.firstChild
    } else {
      while (dom.firstChild) root.appendChild(dom.firstChild)
      if (root.stub) root = parent.root
    }

    defineProperty(self, 'root', root)

    // parse the named dom nodes in the looped child
    // adding them to the parent as well
    if (isLoop)
      parseNamedElements(self.root, self.parent, null, true)

    // if it's not a child tag we can trigger its mount event
    if (!self.parent || self.parent.isMounted) {
      self.isMounted = true
      self.trigger('mount')
    }
    // otherwise we need to wait that the parent event gets triggered
    else self.parent.one('mount', function() {
      // avoid to trigger the `mount` event for the tags
      // not visible included in an if statement
      if (!isInStub(self.root)) {
        self.parent.isMounted = self.isMounted = true
        self.trigger('mount')
      }
    })
  })


  defineProperty(this, 'unmount', function(keepRootTag) {
    var el = root,
      p = el.parentNode,
      ptag,
      tagIndex = __virtualDom.indexOf(self)

    self.trigger('before-unmount')

    // remove this tag instance from the global virtualDom variable
    if (~tagIndex)
      __virtualDom.splice(tagIndex, 1)

    if (p) {

      if (parent) {
        ptag = getImmediateCustomParentTag(parent)
        // remove this tag from the parent tags object
        // if there are multiple nested tags with same name..
        // remove this element form the array
        if (isArray(ptag.tags[tagName]))
          each(ptag.tags[tagName], function(tag, i) {
            if (tag._riot_id == self._riot_id)
              ptag.tags[tagName].splice(i, 1)
          })
        else
          // otherwise just delete the tag instance
          ptag.tags[tagName] = undefined
      }

      else
        while (el.firstChild) el.removeChild(el.firstChild)

      if (!keepRootTag)
        p.removeChild(el)
      else {
        // the riot-tag and the data-is attributes aren't needed anymore, remove them
        remAttr(p, RIOT_TAG_IS)
        remAttr(p, RIOT_TAG) // this will be removed in riot 3.0.0
      }

    }

    if (this._virts) {
      each(this._virts, function(v) {
        if (v.parentNode) v.parentNode.removeChild(v)
      })
    }

    self.trigger('unmount')
    toggle()
    self.off('*')
    self.isMounted = false
    delete root._tag

  })

  // proxy function to bind updates
  // dispatched from a parent tag
  function onChildUpdate(data) { self.update(data, true) }

  function toggle(isMount) {

    // mount/unmount children
    each(childTags, function(child) { child[isMount ? 'mount' : 'unmount']() })

    // listen/unlisten parent (events flow one way from parent to children)
    if (!parent) return
    var evt = isMount ? 'on' : 'off'

    // the loop tags will be always in sync with the parent automatically
    if (isLoop)
      parent[evt]('unmount', self.unmount)
    else {
      parent[evt]('update', onChildUpdate)[evt]('unmount', self.unmount)
    }
  }


  // named elements available for fn
  parseNamedElements(dom, this, childTags)

}
/**
 * Attach an event to a DOM node
 * @param { String } name - event name
 * @param { Function } handler - event callback
 * @param { Object } dom - dom node
 * @param { Tag } tag - tag instance
 */
function setEventHandler(name, handler, dom, tag) {

  dom[name] = function(e) {

    var ptag = tag._parent,
      item = tag._item,
      el

    if (!item)
      while (ptag && !item) {
        item = ptag._item
        ptag = ptag._parent
      }

    // cross browser event fix
    e = e || window.event

    // override the event properties
    if (isWritable(e, 'currentTarget')) e.currentTarget = dom
    if (isWritable(e, 'target')) e.target = e.srcElement
    if (isWritable(e, 'which')) e.which = e.charCode || e.keyCode

    e.item = item

    // prevent default behaviour (by default)
    if (handler.call(tag, e) !== true && !/radio|check/.test(dom.type)) {
      if (e.preventDefault) e.preventDefault()
      e.returnValue = false
    }

    if (!e.preventUpdate) {
      el = item ? getImmediateCustomParentTag(ptag) : tag
      el.update()
    }

  }

}


/**
 * Insert a DOM node replacing another one (used by if- attribute)
 * @param   { Object } root - parent node
 * @param   { Object } node - node replaced
 * @param   { Object } before - node added
 */
function insertTo(root, node, before) {
  if (!root) return
  root.insertBefore(before, node)
  root.removeChild(node)
}

/**
 * Update the expressions in a Tag instance
 * @param   { Array } expressions - expression that must be re evaluated
 * @param   { Tag } tag - tag instance
 */
function update(expressions, tag) {

  each(expressions, function(expr, i) {

    var dom = expr.dom,
      attrName = expr.attr,
      value = tmpl(expr.expr, tag),
      parent = expr.dom.parentNode

    if (expr.bool) {
      value = !!value
    } else if (value == null) {
      value = ''
    }

    // #1638: regression of #1612, update the dom only if the value of the
    // expression was changed
    if (expr.value === value) {
      return
    }
    expr.value = value

    // textarea and text nodes has no attribute name
    if (!attrName) {
      // about #815 w/o replace: the browser converts the value to a string,
      // the comparison by "==" does too, but not in the server
      value += ''
      // test for parent avoids error with invalid assignment to nodeValue
      if (parent) {
        if (parent.tagName === 'TEXTAREA') {
          parent.value = value                    // #1113
          if (!IE_VERSION) dom.nodeValue = value  // #1625 IE throws here, nodeValue
        }                                         // will be available on 'updated'
        else dom.nodeValue = value
      }
      return
    }

    // ~~#1612: look for changes in dom.value when updating the value~~
    if (attrName === 'value') {
      dom.value = value
      return
    }

    // remove original attribute
    remAttr(dom, attrName)

    // event handler
    if (isFunction(value)) {
      setEventHandler(attrName, value, dom, tag)

    // if- conditional
    } else if (attrName == 'if') {
      var stub = expr.stub,
        add = function() { insertTo(stub.parentNode, stub, dom) },
        remove = function() { insertTo(dom.parentNode, dom, stub) }

      // add to DOM
      if (value) {
        if (stub) {
          add()
          dom.inStub = false
          // avoid to trigger the mount event if the tags is not visible yet
          // maybe we can optimize this avoiding to mount the tag at all
          if (!isInStub(dom)) {
            walk(dom, function(el) {
              if (el._tag && !el._tag.isMounted)
                el._tag.isMounted = !!el._tag.trigger('mount')
            })
          }
        }
      // remove from DOM
      } else {
        stub = expr.stub = stub || document.createTextNode('')
        // if the parentNode is defined we can easily replace the tag
        if (dom.parentNode)
          remove()
        // otherwise we need to wait the updated event
        else (tag.parent || tag).one('updated', remove)

        dom.inStub = true
      }
    // show / hide
    } else if (attrName === 'show') {
      dom.style.display = value ? '' : 'none'

    } else if (attrName === 'hide') {
      dom.style.display = value ? 'none' : ''

    } else if (expr.bool) {
      dom[attrName] = value
      if (value) setAttr(dom, attrName, attrName)
      if (FIREFOX && attrName === 'selected' && dom.tagName === 'OPTION') {
        dom.__riot1374 = value   // #1374
      }

    } else if (value === 0 || value && typeof value !== T_OBJECT) {
      // <img src="{ expr }">
      if (startsWith(attrName, RIOT_PREFIX) && attrName != RIOT_TAG) {
        attrName = attrName.slice(RIOT_PREFIX.length)
      }
      setAttr(dom, attrName, value)
    }

  })

}
/**
 * Specialized function for looping an array-like collection with `each={}`
 * @param   { Array } els - collection of items
 * @param   {Function} fn - callback function
 * @returns { Array } the array looped
 */
function each(els, fn) {
  var len = els ? els.length : 0

  for (var i = 0, el; i < len; i++) {
    el = els[i]
    // return false -> current item was removed by fn during the loop
    if (el != null && fn(el, i) === false) i--
  }
  return els
}

/**
 * Detect if the argument passed is a function
 * @param   { * } v - whatever you want to pass to this function
 * @returns { Boolean } -
 */
function isFunction(v) {
  return typeof v === T_FUNCTION || false   // avoid IE problems
}

/**
 * Get the outer html of any DOM node SVGs included
 * @param   { Object } el - DOM node to parse
 * @returns { String } el.outerHTML
 */
function getOuterHTML(el) {
  if (el.outerHTML) return el.outerHTML
  // some browsers do not support outerHTML on the SVGs tags
  else {
    var container = mkEl('div')
    container.appendChild(el.cloneNode(true))
    return container.innerHTML
  }
}

/**
 * Set the inner html of any DOM node SVGs included
 * @param { Object } container - DOM node where we will inject the new html
 * @param { String } html - html to inject
 */
function setInnerHTML(container, html) {
  if (typeof container.innerHTML != T_UNDEF) container.innerHTML = html
  // some browsers do not support innerHTML on the SVGs tags
  else {
    var doc = new DOMParser().parseFromString(html, 'application/xml')
    container.appendChild(
      container.ownerDocument.importNode(doc.documentElement, true)
    )
  }
}

/**
 * Checks wether a DOM node must be considered part of an svg document
 * @param   { String }  name - tag name
 * @returns { Boolean } -
 */
function isSVGTag(name) {
  return ~SVG_TAGS_LIST.indexOf(name)
}

/**
 * Detect if the argument passed is an object, exclude null.
 * NOTE: Use isObject(x) && !isArray(x) to excludes arrays.
 * @param   { * } v - whatever you want to pass to this function
 * @returns { Boolean } -
 */
function isObject(v) {
  return v && typeof v === T_OBJECT         // typeof null is 'object'
}

/**
 * Remove any DOM attribute from a node
 * @param   { Object } dom - DOM node we want to update
 * @param   { String } name - name of the property we want to remove
 */
function remAttr(dom, name) {
  dom.removeAttribute(name)
}

/**
 * Convert a string containing dashes to camel case
 * @param   { String } string - input string
 * @returns { String } my-string -> myString
 */
function toCamel(string) {
  return string.replace(/-(\w)/g, function(_, c) {
    return c.toUpperCase()
  })
}

/**
 * Get the value of any DOM attribute on a node
 * @param   { Object } dom - DOM node we want to parse
 * @param   { String } name - name of the attribute we want to get
 * @returns { String | undefined } name of the node attribute whether it exists
 */
function getAttr(dom, name) {
  return dom.getAttribute(name)
}

/**
 * Set any DOM attribute
 * @param { Object } dom - DOM node we want to update
 * @param { String } name - name of the property we want to set
 * @param { String } val - value of the property we want to set
 */
function setAttr(dom, name, val) {
  dom.setAttribute(name, val)
}

/**
 * Detect the tag implementation by a DOM node
 * @param   { Object } dom - DOM node we need to parse to get its tag implementation
 * @returns { Object } it returns an object containing the implementation of a custom tag (template and boot function)
 */
function getTag(dom) {
  return dom.tagName && __tagImpl[getAttr(dom, RIOT_TAG_IS) ||
    getAttr(dom, RIOT_TAG) || dom.tagName.toLowerCase()]
}
/**
 * Add a child tag to its parent into the `tags` object
 * @param   { Object } tag - child tag instance
 * @param   { String } tagName - key where the new tag will be stored
 * @param   { Object } parent - tag instance where the new child tag will be included
 */
function addChildTag(tag, tagName, parent) {
  var cachedTag = parent.tags[tagName]

  // if there are multiple children tags having the same name
  if (cachedTag) {
    // if the parent tags property is not yet an array
    // create it adding the first cached tag
    if (!isArray(cachedTag))
      // don't add the same tag twice
      if (cachedTag !== tag)
        parent.tags[tagName] = [cachedTag]
    // add the new nested tag to the array
    if (!contains(parent.tags[tagName], tag))
      parent.tags[tagName].push(tag)
  } else {
    parent.tags[tagName] = tag
  }
}

/**
 * Move the position of a custom tag in its parent tag
 * @param   { Object } tag - child tag instance
 * @param   { String } tagName - key where the tag was stored
 * @param   { Number } newPos - index where the new tag will be stored
 */
function moveChildTag(tag, tagName, newPos) {
  var parent = tag.parent,
    tags
  // no parent no move
  if (!parent) return

  tags = parent.tags[tagName]

  if (isArray(tags))
    tags.splice(newPos, 0, tags.splice(tags.indexOf(tag), 1)[0])
  else addChildTag(tag, tagName, parent)
}

/**
 * Create a new child tag including it correctly into its parent
 * @param   { Object } child - child tag implementation
 * @param   { Object } opts - tag options containing the DOM node where the tag will be mounted
 * @param   { String } innerHTML - inner html of the child node
 * @param   { Object } parent - instance of the parent tag including the child custom tag
 * @returns { Object } instance of the new child tag just created
 */
function initChildTag(child, opts, innerHTML, parent) {
  var tag = new Tag(child, opts, innerHTML),
    tagName = getTagName(opts.root),
    ptag = getImmediateCustomParentTag(parent)
  // fix for the parent attribute in the looped elements
  tag.parent = ptag
  // store the real parent tag
  // in some cases this could be different from the custom parent tag
  // for example in nested loops
  tag._parent = parent

  // add this tag to the custom parent tag
  addChildTag(tag, tagName, ptag)
  // and also to the real parent tag
  if (ptag !== parent)
    addChildTag(tag, tagName, parent)
  // empty the child node once we got its template
  // to avoid that its children get compiled multiple times
  opts.root.innerHTML = ''

  return tag
}

/**
 * Loop backward all the parents tree to detect the first custom parent tag
 * @param   { Object } tag - a Tag instance
 * @returns { Object } the instance of the first custom parent tag found
 */
function getImmediateCustomParentTag(tag) {
  var ptag = tag
  while (!getTag(ptag.root)) {
    if (!ptag.parent) break
    ptag = ptag.parent
  }
  return ptag
}

/**
 * Helper function to set an immutable property
 * @param   { Object } el - object where the new property will be set
 * @param   { String } key - object key where the new property will be stored
 * @param   { * } value - value of the new property
* @param   { Object } options - set the propery overriding the default options
 * @returns { Object } - the initial object
 */
function defineProperty(el, key, value, options) {
  Object.defineProperty(el, key, extend({
    value: value,
    enumerable: false,
    writable: false,
    configurable: true
  }, options))
  return el
}

/**
 * Get the tag name of any DOM node
 * @param   { Object } dom - DOM node we want to parse
 * @returns { String } name to identify this dom node in riot
 */
function getTagName(dom) {
  var child = getTag(dom),
    namedTag = getAttr(dom, 'name'),
    tagName = namedTag && !tmpl.hasExpr(namedTag) ?
                namedTag :
              child ? child.name : dom.tagName.toLowerCase()

  return tagName
}

/**
 * Extend any object with other properties
 * @param   { Object } src - source object
 * @returns { Object } the resulting extended object
 *
 * var obj = { foo: 'baz' }
 * extend(obj, {bar: 'bar', foo: 'bar'})
 * console.log(obj) => {bar: 'bar', foo: 'bar'}
 *
 */
function extend(src) {
  var obj, args = arguments
  for (var i = 1; i < args.length; ++i) {
    if (obj = args[i]) {
      for (var key in obj) {
        // check if this property of the source object could be overridden
        if (isWritable(src, key))
          src[key] = obj[key]
      }
    }
  }
  return src
}

/**
 * Check whether an array contains an item
 * @param   { Array } arr - target array
 * @param   { * } item - item to test
 * @returns { Boolean } Does 'arr' contain 'item'?
 */
function contains(arr, item) {
  return ~arr.indexOf(item)
}

/**
 * Check whether an object is a kind of array
 * @param   { * } a - anything
 * @returns {Boolean} is 'a' an array?
 */
function isArray(a) { return Array.isArray(a) || a instanceof Array }

/**
 * Detect whether a property of an object could be overridden
 * @param   { Object }  obj - source object
 * @param   { String }  key - object property
 * @returns { Boolean } is this property writable?
 */
function isWritable(obj, key) {
  var props = Object.getOwnPropertyDescriptor(obj, key)
  return typeof obj[key] === T_UNDEF || props && props.writable
}


/**
 * With this function we avoid that the internal Tag methods get overridden
 * @param   { Object } data - options we want to use to extend the tag instance
 * @returns { Object } clean object without containing the riot internal reserved words
 */
function cleanUpData(data) {
  if (!(data instanceof Tag) && !(data && typeof data.trigger == T_FUNCTION))
    return data

  var o = {}
  for (var key in data) {
    if (!RESERVED_WORDS_BLACKLIST.test(key)) o[key] = data[key]
  }
  return o
}

/**
 * Walk down recursively all the children tags starting dom node
 * @param   { Object }   dom - starting node where we will start the recursion
 * @param   { Function } fn - callback to transform the child node just found
 */
function walk(dom, fn) {
  if (dom) {
    // stop the recursion
    if (fn(dom) === false) return
    else {
      dom = dom.firstChild

      while (dom) {
        walk(dom, fn)
        dom = dom.nextSibling
      }
    }
  }
}

/**
 * Minimize risk: only zero or one _space_ between attr & value
 * @param   { String }   html - html string we want to parse
 * @param   { Function } fn - callback function to apply on any attribute found
 */
function walkAttributes(html, fn) {
  var m,
    re = /([-\w]+) ?= ?(?:"([^"]*)|'([^']*)|({[^}]*}))/g

  while (m = re.exec(html)) {
    fn(m[1].toLowerCase(), m[2] || m[3] || m[4])
  }
}

/**
 * Check whether a DOM node is in stub mode, useful for the riot 'if' directive
 * @param   { Object }  dom - DOM node we want to parse
 * @returns { Boolean } -
 */
function isInStub(dom) {
  while (dom) {
    if (dom.inStub) return true
    dom = dom.parentNode
  }
  return false
}

/**
 * Create a generic DOM node
 * @param   { String } name - name of the DOM node we want to create
 * @param   { Boolean } isSvg - should we use a SVG as parent node?
 * @returns { Object } DOM node just created
 */
function mkEl(name, isSvg) {
  return isSvg ?
    document.createElementNS('http://www.w3.org/2000/svg', 'svg') :
    document.createElement(name)
}

/**
 * Shorter and fast way to select multiple nodes in the DOM
 * @param   { String } selector - DOM selector
 * @param   { Object } ctx - DOM node where the targets of our search will is located
 * @returns { Object } dom nodes found
 */
function $$(selector, ctx) {
  return (ctx || document).querySelectorAll(selector)
}

/**
 * Shorter and fast way to select a single node in the DOM
 * @param   { String } selector - unique dom selector
 * @param   { Object } ctx - DOM node where the target of our search will is located
 * @returns { Object } dom node found
 */
function $(selector, ctx) {
  return (ctx || document).querySelector(selector)
}

/**
 * Simple object prototypal inheritance
 * @param   { Object } parent - parent object
 * @returns { Object } child instance
 */
function inherit(parent) {
  function Child() {}
  Child.prototype = parent
  return new Child()
}

/**
 * Get the name property needed to identify a DOM node in riot
 * @param   { Object } dom - DOM node we need to parse
 * @returns { String | undefined } give us back a string to identify this dom node
 */
function getNamedKey(dom) {
  return getAttr(dom, 'id') || getAttr(dom, 'name')
}

/**
 * Set the named properties of a tag element
 * @param { Object } dom - DOM node we need to parse
 * @param { Object } parent - tag instance where the named dom element will be eventually added
 * @param { Array } keys - list of all the tag instance properties
 */
function setNamed(dom, parent, keys) {
  // get the key value we want to add to the tag instance
  var key = getNamedKey(dom),
    isArr,
    // add the node detected to a tag instance using the named property
    add = function(value) {
      // avoid to override the tag properties already set
      if (contains(keys, key)) return
      // check whether this value is an array
      isArr = isArray(value)
      // if the key was never set
      if (!value)
        // set it once on the tag instance
        parent[key] = dom
      // if it was an array and not yet set
      else if (!isArr || isArr && !contains(value, dom)) {
        // add the dom node into the array
        if (isArr)
          value.push(dom)
        else
          parent[key] = [value, dom]
      }
    }

  // skip the elements with no named properties
  if (!key) return

  // check whether this key has been already evaluated
  if (tmpl.hasExpr(key))
    // wait the first updated event only once
    parent.one('mount', function() {
      key = getNamedKey(dom)
      add(parent[key])
    })
  else
    add(parent[key])

}

/**
 * Faster String startsWith alternative
 * @param   { String } src - source string
 * @param   { String } str - test string
 * @returns { Boolean } -
 */
function startsWith(src, str) {
  return src.slice(0, str.length) === str
}

/**
 * requestAnimationFrame function
 * Adapted from https://gist.github.com/paulirish/1579671, license MIT
 */
var rAF = (function (w) {
  var raf = w.requestAnimationFrame    ||
            w.mozRequestAnimationFrame || w.webkitRequestAnimationFrame

  if (!raf || /iP(ad|hone|od).*OS 6/.test(w.navigator.userAgent)) {  // buggy iOS6
    var lastTime = 0

    raf = function (cb) {
      var nowtime = Date.now(), timeout = Math.max(16 - (nowtime - lastTime), 0)
      setTimeout(function () { cb(lastTime = nowtime + timeout) }, timeout)
    }
  }
  return raf

})(window || {})

/**
 * Mount a tag creating new Tag instance
 * @param   { Object } root - dom node where the tag will be mounted
 * @param   { String } tagName - name of the riot tag we want to mount
 * @param   { Object } opts - options to pass to the Tag instance
 * @returns { Tag } a new Tag instance
 */
function mountTo(root, tagName, opts) {
  var tag = __tagImpl[tagName],
    // cache the inner HTML to fix #855
    innerHTML = root._innerHTML = root._innerHTML || root.innerHTML

  // clear the inner html
  root.innerHTML = ''

  if (tag && root) tag = new Tag(tag, { root: root, opts: opts }, innerHTML)

  if (tag && tag.mount) {
    tag.mount()
    // add this tag to the virtualDom variable
    if (!contains(__virtualDom, tag)) __virtualDom.push(tag)
  }

  return tag
}
/**
 * Riot public api
 */

// share methods for other riot parts, e.g. compiler
riot.util = { brackets: brackets, tmpl: tmpl }

/**
 * Create a mixin that could be globally shared across all the tags
 */
riot.mixin = (function() {
  var mixins = {},
    globals = mixins[GLOBAL_MIXIN] = {},
    _id = 0

  /**
   * Create/Return a mixin by its name
   * @param   { String }  name - mixin name (global mixin if object)
   * @param   { Object }  mixin - mixin logic
   * @param   { Boolean } g - is global?
   * @returns { Object }  the mixin logic
   */
  return function(name, mixin, g) {
    // Unnamed global
    if (isObject(name)) {
      riot.mixin('__unnamed_'+_id++, name, true)
      return
    }

    var store = g ? globals : mixins

    // Getter
    if (!mixin) {
      if (typeof store[name] === T_UNDEF) {
        throw new Error('Unregistered mixin: ' + name)
      }
      return store[name]
    }
    // Setter
    if (isFunction(mixin)) {
      extend(mixin.prototype, store[name] || {})
      store[name] = mixin
    }
    else {
      store[name] = extend(store[name] || {}, mixin)
    }
  }

})()

/**
 * Create a new riot tag implementation
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   html - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @returns { String } name/id of the tag just created
 */
riot.tag = function(name, html, css, attrs, fn) {
  if (isFunction(attrs)) {
    fn = attrs
    if (/^[\w\-]+\s?=/.test(css)) {
      attrs = css
      css = ''
    } else attrs = ''
  }
  if (css) {
    if (isFunction(css)) fn = css
    else styleManager.add(css)
  }
  name = name.toLowerCase()
  __tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn }
  return name
}

/**
 * Create a new riot tag implementation (for use by the compiler)
 * @param   { String }   name - name/id of the new riot tag
 * @param   { String }   html - tag template
 * @param   { String }   css - custom tag css
 * @param   { String }   attrs - root tag attributes
 * @param   { Function } fn - user function
 * @returns { String } name/id of the tag just created
 */
riot.tag2 = function(name, html, css, attrs, fn) {
  if (css) styleManager.add(css)
  //if (bpair) riot.settings.brackets = bpair
  __tagImpl[name] = { name: name, tmpl: html, attrs: attrs, fn: fn }
  return name
}

/**
 * Mount a tag using a specific tag implementation
 * @param   { String } selector - tag DOM selector
 * @param   { String } tagName - tag implementation name
 * @param   { Object } opts - tag logic
 * @returns { Array } new tags instances
 */
riot.mount = function(selector, tagName, opts) {

  var els,
    allTags,
    tags = []

  // helper functions

  function addRiotTags(arr) {
    var list = ''
    each(arr, function (e) {
      if (!/[^-\w]/.test(e)) {
        e = e.trim().toLowerCase()
        list += ',[' + RIOT_TAG_IS + '="' + e + '"],[' + RIOT_TAG + '="' + e + '"]'
      }
    })
    return list
  }

  function selectAllTags() {
    var keys = Object.keys(__tagImpl)
    return keys + addRiotTags(keys)
  }

  function pushTags(root) {
    if (root.tagName) {
      var riotTag = getAttr(root, RIOT_TAG_IS) || getAttr(root, RIOT_TAG)

      // have tagName? force riot-tag to be the same
      if (tagName && riotTag !== tagName) {
        riotTag = tagName
        setAttr(root, RIOT_TAG_IS, tagName)
        setAttr(root, RIOT_TAG, tagName) // this will be removed in riot 3.0.0
      }
      var tag = mountTo(root, riotTag || root.tagName.toLowerCase(), opts)

      if (tag) tags.push(tag)
    } else if (root.length) {
      each(root, pushTags)   // assume nodeList
    }
  }

  // ----- mount code -----

  // inject styles into DOM
  styleManager.inject()

  if (isObject(tagName)) {
    opts = tagName
    tagName = 0
  }

  // crawl the DOM to find the tag
  if (typeof selector === T_STRING) {
    if (selector === '*')
      // select all the tags registered
      // and also the tags found with the riot-tag attribute set
      selector = allTags = selectAllTags()
    else
      // or just the ones named like the selector
      selector += addRiotTags(selector.split(/, */))

    // make sure to pass always a selector
    // to the querySelectorAll function
    els = selector ? $$(selector) : []
  }
  else
    // probably you have passed already a tag or a NodeList
    els = selector

  // select all the registered and mount them inside their root elements
  if (tagName === '*') {
    // get all custom tags
    tagName = allTags || selectAllTags()
    // if the root els it's just a single tag
    if (els.tagName)
      els = $$(tagName, els)
    else {
      // select all the children for all the different root elements
      var nodeList = []
      each(els, function (_el) {
        nodeList.push($$(tagName, _el))
      })
      els = nodeList
    }
    // get rid of the tagName
    tagName = 0
  }

  pushTags(els)

  return tags
}

/**
 * Update all the tags instances created
 * @returns { Array } all the tags instances
 */
riot.update = function() {
  return each(__virtualDom, function(tag) {
    tag.update()
  })
}

/**
 * Export the Virtual DOM
 */
riot.vdom = __virtualDom

/**
 * Export the Tag constructor
 */
riot.Tag = Tag
  // support CommonJS, AMD & browser
  /* istanbul ignore next */
  if (typeof exports === T_OBJECT)
    module.exports = riot
  else if (typeof define === T_FUNCTION && typeof define.amd !== T_UNDEF)
    define(function() { return riot })
  else
    window.riot = riot

})(typeof window != 'undefined' ? window : void 0);

/**
 * Bound class contain methods for
 * receiving bounds of DOM element.
 */
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var Bound = (function () {
    function Bound() {
        _classCallCheck(this, Bound);
    }

    _createClass(Bound, [{
        key: 'receiveBound',

        /**
         * Get Bounds
         * @returns {*}
         */
        value: function receiveBound() {
            if (!this.container) console.error('Yor class must contain a container. It is DOM Element. Define please this.container property.');
            var document,
                window,
                box,
                doc = this.container && this.container.ownerDocument;
            // Get document
            document = doc.documentElement;
            // Get container
            if (typeof this.container.getBoundingClientRect !== typeof undefined) {
                box = this.container.getBoundingClientRect();
            }
            window = this.getWindow(doc);
            // Return BoundingRect with additional properties.
            return this.mix(box, {
                size: Math.max(box.width, box.height),
                offsetTop: box.top + window.pageYOffset - document.clientTop,
                offsetLeft: box.left + window.pageXOffset - document.clientLeft
            });
        }

        /**
         * Window or not?
         * @param o - supposing object
         * @returns {boolean}
         */
    }, {
        key: 'isWindow',
        value: function isWindow(o) {
            return o !== null && o === o.window;
        }

        /**
         * Get window method
         * @param e - supposing object
         * @returns {*}
         */
    }, {
        key: 'getWindow',
        value: function getWindow(o) {
            return this.isWindow(o) ? o : o.nodeType === 9 && o.defaultView;
        }

        /**
         * Simple mixin. Unfortunately, babel doesn't support Object.assign \ or mixin
         * @param so
         * @param to
         * @returns {*}
         */
    }, {
        key: 'mix',
        value: function mix(so, to) {
            for (var key in so) {
                // only copy if not already present
                if (!(key in to)) {
                    to[key] = so[key];
                }
            }
            return to;
        }
    }]);

    return Bound;
})();

riot.mixin('Bound', Bound);
riot.tag2('material-button', '<material-waves onclick="{click}" onmousedown="{launch}" center="{opts.wavesCenter}" rounded="{opts.rounded}" opacity="{opts.wavesOpacity}" color="{opts.wavesColor}" duration="{opts[\'waves-duration\']}"></material-waves> <div class="content"><yield></yield></div>', '', '', function(opts) {
var _this = this;

this.dynamicAttributes = ['disabled'];

this.disabled = opts.disabled || false;

this.launch = function (e) {
    if (!_this.disabled) _this.tags['material-waves'].trigger('launch', e);
};

this.tags['material-waves'].on('wavestart', function (wave) {
    _this.trigger('wavestart', wave);
});

this.tags['material-waves'].on('waveend', function () {
    _this.trigger('waveend');
});

this.click = function () {
    if (opts.link) window.location.href = opts.link;
    _this.trigger('click');
};

this.mixin('dynamicAttributes');
});
'use strict';

var CollectionMixin = {
    /**
     * Filter collection by criteria
     * @params prop - collection name
     * @params criteria - object (Which field should be filtred)
     */
    filter: function filter(prop, criteria) {
        return this[prop].filter(function (item) {
            var criteriaPass = false;
            Object.keys(criteria).forEach(function (k) {
                var v = criteria[k];
                var regexp = new RegExp('' + v, 'i');
                criteriaPass = regexp.test(item[k]);
            });
            return criteriaPass;
        });
    },
    /**
     * Find something in collection
     * @params prop - collection name
     * @params criteria - object (Which field should be filtred)
     */
    find: function find(data, criteria) {
        var searched = {};
        var i = 0;
        data.forEach(function (e) {
            Object.keys(criteria).forEach(function (k) {
                var v = criteria[k];
                if (e[k] == v) {
                    searched.e = e;
                    searched.k = i;
                }
            });
            i++;
        });
        return searched;
    }
};

riot.mixin('collection', CollectionMixin);
riot.tag2('material-card', '<div class="title" if="{titleExist}"> <content select=".material-card-title"></content> </div> <yield></yield>', '', '', function(opts) {
var _this = this;

this.titleExist = false;
this.on('mount', function () {
    _this.update({ titleExist: !!_this.root.querySelector('.material-card-title') });
});
this.mixin('content');
});
'use strict';

var Content = {
    init: function init() {
        var _this = this;

        this.on('mount', function () {
            [].forEach.call(_this.root.querySelectorAll('content'), function (node) {
                var selector = node.getAttribute('select');
                [].forEach.call(_this.root.querySelectorAll(selector), function (content) {
                    node.parentNode.insertBefore(content, node.nextSibling);
                });
                node.parentNode.removeChild(node);
            });
        });
    }
};
riot.mixin('content', Content);
riot.tag2('material-checkbox', '<div class="{checkbox:true,checked:checked}" onclick="{toggle}"> <div class="checkmark"></div> </div> <div class="label" onclick="{toggle}"><yield></yield></div> <input type="hidden" name="{opts.name}" value="{checked}">', '', '', function(opts) {
var _this = this;

this.checked = opts.checked || false;

this.disabled = opts.disabled || false;

this.toggle = function () {
    if (_this.disabled) return false;
    _this.update({ checked: !_this.checked });
    _this.trigger('toggle', _this.checked);
};
});
/**
 * The mixin ables to update root tag attributes
 * if in this.dynamicAttributes array contains
 * name of attribute, which equals variable into tag instance
 * Example:
 * <my-tag disabled="true"></my-tag>
 * <my-tag>
 *     ....
 *     <script>
 *         this.disabled = true;
 *         this.dynamicAttributes = ['disabled'];
 *         setTimeout(function(){
 *              this.update({disabled:false});
 *         }.bind(this),1000);
 *     </script>
 * </my-tag>
 * In this example disabled attribute of my-tag
 * will be changed after 1s and we will see following HTML
 * <my-tag disabled="false"></my-tag>
 */
'use strict';

var DynamicAttributesMixin = {
    init: function init() {
        var _this = this;

        this.on('update', function (updated) {
            if (updated && _this.dynamicAttributes) {
                _this.dynamicAttributes.forEach(function (key) {
                    if (updated[key] != undefined) {
                        _this.root.setAttribute(key, updated[key]);
                    }
                });
            }
        });
    }
};

riot.mixin('dynamicAttributes', DynamicAttributesMixin);
riot.tag2('material-combo', '<material-input name="input"></material-input> <material-dropdown-list selected="{opts.selected}" name="dropdown"></material-dropdown-list> <input type="hidden" value="{value}" name="{opts.name || \'combo\'}"> <div name="options" hidden if="{!isParsed}"> <yield></yield> </div>', '', '', function(opts) {
var _this = this;

this.items = [];
this.isParsed = true;
this.title = null;
var lastValue = this.value;
var valueChanged = function valueChanged() {
    if (_this.value !== lastValue) {
        lastValue = _this.value;
        _this.root.dispatchEvent(new CustomEvent('change', { value: _this.value }));
    }
};

this.getOptions = function () {
    Array.prototype.forEach.call(_this.options.children, function (option, key) {
        if (option.tagName.toLowerCase() == 'option') {
            var item = { title: option.innerHTML, value: option.getAttribute('value') };
            _this.items.push(item);

            if (option.getAttribute('isSelected') != null) {
                _this.tags.dropdown.update({ selected: key });
                _this.update({ value: item.value || item.title });
                valueChanged();
                _this.title = item.title;
            }
        }
    });

    _this.tags.dropdown.update({ items: _this.items });

    if (_this.tags.dropdown.selected) {
        _this.update({ hValue: _this.tags.dropdown.items[_this.tags.dropdown.selected].value || _this.tags.dropdown.items[_this.tags.dropdown.selected].title });
    }
    _this.update({ isParsed: true });
    valueChanged();
};

this.getOptions();

if (opts.items) {
    try {
        this.items = eval(opts.items) || [];
        if (this.items.length) this.tags.dropdown.update({ items: this.items });
    } catch (e) {
        console.error('Something wrong with your items. For details look at it - ' + e);
    }
}

this.on('mount', function () {
    _this.tags.dropdown.root.style.top = _this.tags.input.root.getBoundingClientRect().height + 'px';
    _this.tags.input.update({ value: _this.title || opts.defaulttext || 'Choose item' });
});

this.tags.dropdown.on('selectChanged', function (selected) {
    _this.update({ value: _this.tags.dropdown.items[selected].value || _this.tags.dropdown.items[selected].title });
    valueChanged();
    _this.tags.input.update({ value: _this.tags.dropdown.items[selected].title });

    setTimeout(function () {
        _this.tags.dropdown.update({ items: _this.items });
    }, 200);
});

this.tags.input.on('valueChanged', function (value) {
    _this.tags.dropdown.update({ items: _this.filter('items', { title: value }) });
});

this.tags.input.on('focusChanged', function (focus) {
    if (_this.tags.input.value == (opts.defaulttext || 'Choose item') && focus) {
        _this.tags.input.update({ value: '' });
    }
    if (_this.tags.input.value == '' && !focus) {
        _this.tags.input.update({ value: opts.defaulttext || 'Choose item' });
    }
    focus ? _this.tags.dropdown.open() : null;
});

this.mixin('collection');
});

'use strict';

var RiotHelpers = {
    /**
     * Find tag in pack
     */
    findTag: function findTag(pack, name) {
        var searched = null;
        pack.forEach(function (tag) {
            if (tag.root.getAttribute('name').toLowerCase() == name.toLowerCase() || tag.root.tagName.toLowerCase() == name.toLowerCase()) {
                searched = tag;
            }
        });
        return searched;
    },
    /**
     * By the default riot don't support a camel case options
     * but in some cases we just use camel case, like a options
     * for instance
     */
    turnHyphensOptsToCamelCase: function turnHyphensOptsToCamelCase(opts) {
        for (var p in opts) {
            if (/-/.test(p)) {
                var camelCased = p.replace(/-([a-z])/g, function (g) {
                    return g[1].toUpperCase();
                });
                opts[camelCased] = opts[p];
                delete opts[p];
            }
        }
    }
};

riot.findTag = RiotHelpers.findTag;

riot.mixin('helpers', RiotHelpers);
riot.tag2('material-dropdown', '<div name="dropdown" class="{dropdown:true,opening:opening}" if="{opened}"> <yield></yield> </div>', '', '', function(opts) {
var _this = this;

this.opened = opts.opened || false;

this.dropdown.classList.add(opts.animation || 'top');

this.open = function () {
    _this.update({ opened: true, opening: true });
    setTimeout(function () {
        _this.update({ opening: false });
    }, 0);
};

this.close = function () {
    _this.update({ opening: true });
    setTimeout(function () {
        _this.update({ opened: false });
    }, 200);
};
});
'use strict';

var ValidateMixin = Object.defineProperties({
    init: function init() {
        if (!this.opts) console.debug('Sorry, but for using validate mixin you should add following code in your component: this.opts = opts;');
        if (this.opts && this.opts.valid) {
            this.validationType = typeof this[this.opts.valid] == 'function' ? 'Function' : 'Regexp';
            if (this.validationType === 'Regexp') {
                try {
                    this.validationRegexp = eval(this.opts.valid);
                } catch (e) {
                    throw new Error('Something wrong with your regular expression!. Checkout --- ' + e);
                }
            }
            if (this.validationType === 'Function') {
                this.validationFunction = this[this.opts.valid] || false;
            }
        } else if (this.opts && Object.keys(this.base).indexOf(this.opts.type) != -1) {
            this.validationType = 'Type';
        }
    },
    validate: function validate(value) {
        if (this.validationType) {
            return this['validateBy' + this.validationType](value);
        }
        return null;
    },
    validateByFunction: function validateByFunction(value) {
        if (this.validationFunction) {
            return this.validationFunction(value);
        }
    },
    validateByRegexp: function validateByRegexp(value) {
        if (this.validationRegexp) {
            return this.validationRegexp.test(value);
        }
    },
    validateByType: function validateByType(value) {
        return this.base[this.opts.type].test(value);
    }
}, {
    base: {
        get: function get() {
            return {
                'email': /^(([\w\.\-_]+)@[\w\-\_]+(\.\w+){1,}|)$/i,
                'number': /^(\d+|)$/i,
                'tel': /^((\+|\d)?([\d\-\(\)\#])|)+$/i,
                'url': /([--:\w?@%&+~#=]*\.[a-z]{2,4}\/{0,2})((?:[?&](?:\w+)=(?:\w+))+|[--:\w?@%&+~#=]+)?/i
            };
        },
        configurable: true,
        enumerable: true
    }
});

riot.mixin('validate', ValidateMixin);
riot.tag2('material-dropdown-list', '<ul class="{dropdown-content:true,opening:opening}" if="{opened}"> <li each="{item,key in items}" class="{selected:parent.selected==key}"> <span if="{!item.link}" onclick="{parent.select}">{item.title}</span> <a if="{item.link}" href="{item.link}" onclick="{parent.select}" title="{item.title}">{item.title}</a> </li> </ul> <div name="overlay" if="{opts.extraclose && opened}" onclick="{close}" class="material-dropdown-list-overlay"></div>', '', '', function(opts) {
var _this = this;

this.opened = false;

if (opts.items) {
    try {
        this.items = eval(opts.items) || [];
    } catch (e) {
        console.error('Something wrong with your items. For details look at it - ' + e);
    }
    this.update({ items: this.items });
}

if (opts.selected) {
    this.update({ selected: opts.selected });
}

this.select = function (e) {
    _this.update({ selected: e.item.key });
    _this.close();

    _this.trigger('selectChanged', e.item.key, e.item.item);
    return true;
};

this.open = function () {
    _this.update({ opened: true, opening: true });
    if (_this.opts.extraclose) document.body.appendChild(_this.overlay);
    setTimeout(function () {
        _this.update({ opening: false });
    }, 0);
};

this.close = function () {
    _this.update({ opening: true });
    setTimeout(function () {
        _this.update({ opened: false });
    }, 200);
};
});
riot.tag2('material-input', '<div class="label-placeholder"></div> <div class="{input-content:true,not-empty:value,error:error}"> <label for="input" name="label" if="{opts.label}">{opts.label}</label> <input type="{opts.type||\'text\'}" disabled="{disabled}" placeholder="{opts.placeholder}" onkeyup="{changeValue}" value="{value}" autocomplete="off" name="{opts.name||\'default-input\'}" required="{required}"> <div class="iconWrapper" name="iconWrapper" if="{opts.icon}"> <material-button name="iconButton" center="true" waves-center="true" waves-color="{opts[\'waves-color\']||\'#fff\'}" rounded="true" waves-opacity="{opts[\'waves-opacity\']||\'0.6\'}" waves-duration="{opts[\'waves-duration\']||\'600\'}"> <yield></yield> </material-button> </div> </div> <div class="{underline:true,focused:focused,error:error}"> <div class="unfocused-line"></div> <div class="focused-line"></div> </div>', '', '', function(opts) {
var _this = this;

this.opts = opts;
this.required = "";

this.name = opts.name || 'input';

this.notSupportedTypes = ['date', 'color', 'datetime', 'month', 'range', 'time'];
if (this.notSupportedTypes.indexOf(opts.type) != -1) throw new Error('Sorry but we not support ' + date + ' type yet!');

this.update({ showIcon: false });

this.on('mount', function () {
    _this.update({
        value: opts.value || '',
        disabled: opts.disabled || false,
        required: opts.required || false
    });

    _this.n = opts.name || 'default-input';
    _this[_this.n].addEventListener('focus', _this.changeFocus);
    _this[_this.n].addEventListener('blur', _this.changeFocus);
});

this.changeFocus = function (e) {
    if (_this.disabled) return false;
    _this.update({ focused: _this[_this.n] == document.activeElement });
    _this.trigger('focusChanged', _this.focused, e);
    if (opts.focuschanged && typeof opts.focuschanged === "function") {
        opts.focuschanged(_this.focused);
    }
};

this.changeValue = function (e) {
    _this.update({ value: _this[_this.n].value });
    _this.trigger('valueChanged', _this[_this.n].value, e);
    if (opts.valuechanged && typeof opts.valuechanged === "function") {
        opts.valuechanged(_this[_this.n].value);
    }
};

this.on('update', function (updated) {
    if (updated && updated.value != undefined) {
        if (_this.validationType) {
            _this.isValid(_this.validate(updated.value));
        }
    }
});

this.isValid = function (isValid) {
    _this.update({ error: !isValid });
};
this.mixin('validate');
});
riot.tag2('material-navbar', '<div class="nav-wrapper"> <yield></yield> </div>', '', 'role="toolbar"', function(opts) {
});
riot.tag2('material-pane', '<material-navbar style="height:{opts.materialNavbarHeight || \'60px\'};line-height: {opts.materialNavbarHeight || \'60px\'};background-color:{opts.materialNavbarColor || \'#ccc\'}"> <content select=".material-pane-left-bar"></content> <content select=".material-pane-title"></content> <content select=".material-pane-right-bar"></content> </material-navbar> <div class="content"> <content select=".material-pane-content"></content> <yield></yield> </div>', '', '', function(opts) {
this.mixin('content');
});
riot.tag2('material-popup', '<div name="popup" class="{popup:true,opening:opening}" if="{opened}"> <div class="content"> <content select=".material-popup-title"></content> <yield></yield> </div> <div select=".material-popup-action"></div> </div> <div class="overlay" onclick="{close}" if="{opened}"></div>', '', '', function(opts) {
var _this = this;

this.opened = opts.opened || false;

this.popup.classList.add(opts.animation || 'top');

this.on('mount', function () {
    document.body.appendChild(_this.root);
});

this.open = function () {
    _this.update({ opened: true, opening: true });
    setTimeout(function () {
        _this.update({ opening: false });
    }, 0);
};

this.close = function () {
    _this.update({ opening: true });
    setTimeout(function () {
        _this.update({ opened: false });
    }, 200);
};
this.mixin('content');
});

riot.tag2('material-snackbar', '<div class="{toast:true,error:toast.isError,opening:toast.opening}" onclick="{parent.removeToastByClick}" each="{toast,key in toasts}"> {toast.message} </div>', '', '', function(opts) {
var _this = this;

this.toasts = [];
this.intervals = {};

this.addToast = function (toast, duration) {
    var toastID = _this.toastID = Math.random().toString(36).substring(7);

    _this.toasts.push(Object.assign(toast, { opening: true, _id: toastID }));
    _this.update({ toasts: _this.toasts });

    setTimeout(function () {
        _this.toasts[_this.findToastKeyByID(toastID)].opening = false;
        _this.update({ toasts: _this.toasts });
    }, 50);

    _this.intervals[toastID] = setTimeout(function () {
        _this.removeToast(toastID);
    }, opts.duration || duration || 5000);
};

this.removeToastAfterDurationEnding = function (toastID) {
    _this.removeToast(toastID);
};

this.findToastKeyByID = function (ID) {
    var toastKey = null;
    _this.toasts.forEach(function (toast, key) {
        if (toast._id == ID) toastKey = key;
    });
    return toastKey;
};

this.removeToastByClick = function (e) {
    var toastID = e.item.toast._id;
    clearInterval(_this.intervals[toastID]);
    _this.removeToast(toastID);
};

this.removeToast = function (toastID) {
    if (_this.findToastKeyByID(toastID) != null) {
        _this.toasts[_this.findToastKeyByID(toastID)].opening = true;
        _this.update({ toasts: _this.toasts });

        setTimeout(function () {
            _this.toasts.splice(_this.findToastKeyByID(toastID), 1);
            _this.update({ toasts: _this.toasts });
        }, 200);
    }
};
});
riot.tag2('material-spinner', '<svg class="loader-circular" height="50" width="50"> <circle class="loader-path" cx="25" cy="25.2" r="19.9" fill="none" stroke-width="{opts.strokewidth||3}" stroke-miterlimit="10"></circle> </svg>', '', '', function(opts) {
});
riot.tag2('material-tabs', '<material-button each="{tab,k in tabs}" onclick="{parent.onChangeTab}" class="{selected:parent.selected==k}" waves-opacity="{parent.opts.wavesOpacity}" waves-duration="{parent.opts.wavesDuration}" waves-center="{parent.opts.wavesCenter}" waves-color="{parent.opts.wavesColor}"> <div class="text" title="{tab.title}">{parent.opts.cut ? parent.cut(tab.title) : tab.title}</div> </material-button> <div class="line-wrapper" if="{opts.useline}"> <div class="line" name="line"></div> </div> <yield></yield>', '', '', function(opts) {
var _this = this;

this.selected = 0;
this.tabs = [];

if (opts.tabs) {
    var tabs = [];
    try {
        tabs = opts.tabs ? eval(opts.tabs) : [];
        this.tabs = tabs;
        console.log(tabs);
    } catch (e) {
        console.log(e);
    }
}

this.on('mount', function () {

    _this.setWidth();
    _this.setLinePosition();
});

this.setWidth = function () {
    [].forEach.call(_this.root.querySelectorAll('material-button'), function (node) {
        node.style.width = _this.line.style.width = (100 / _this.tabs.length).toFixed(2) + '%';
    });
};

this.onChangeTab = function (e) {
    var selected = _this.tabs.indexOf(e.item.tab);
    _this.changeTab(selected);
};

this.changeTab = function (index) {
    _this.update({ selected: index });
    _this.setLinePosition();

    _this.trigger('tabChanged', _this.tabs[index], index);
    if (opts.tabchanged && typeof opts.tabchanged === "function") {
        opts.tabchanged(_this.tabs[index], index);
    }
};

this.setLinePosition = function () {
    _this.line.style.left = _this.line.getBoundingClientRect().width * _this.selected + 'px';
};

this.cut = function (title) {
    return title.length > opts.cut ? title.substr(0, opts.cut) + '...' : title;
};
});
riot.tag2('material-textarea', '<div class="label-placeholder"></div> <div class="{textarea-content:true,not-empty:value,error:error}"> <label for="textarea" name="label" if="{opts.label}">{opts.label}</label> <div class="mirror" name="mirror"></div> <div class="textarea-container"> <textarea disabled="{disabled}" name="{opts.name||\'default-textarea\'}" value="{value}"></textarea> </div> </div> <div class="{underline:true,focused:focused,error:error}"> <div class="unfocused-line"></div> <div class="focused-line"></div> </div>', '', '', function(opts) {
var _this = this;

this.opts = opts;

this.disabled = opts.disabled || false;

this.on('mount', function () {
    if (opts.maxRows) _this.mirror.style.maxHeight = opts.maxRows * _this[_this.n].getBoundingClientRect().height + 'px';
    _this.n = opts.name || 'default-textarea';

    _this[_this.n].scrollTop = _this[_this.n].scrollHeight;

    _this[_this.n].addEventListener('focus', _this.changeFocus);
    _this[_this.n].addEventListener('blur', _this.changeFocus);
    _this[_this.n].addEventListener('input', _this.inputHandler);
});

this.changeFocus = function (e) {
    if (_this.disabled) return false;
    var focused = _this[_this.n] == document.activeElement;
    _this.update({ focused: focused });
    _this.trigger('focusChanged', focused);
};

this.inputHandler = function (e) {
    var value = _this[_this.n].value;
    _this.mirror.innerHTML = _this.format(value);
    _this.update({ value: value });
    _this.trigger('valueChanged', value);
};

this.on('update', function (updated) {
    if (updated && updated.value != undefined) {
        if (_this.validationType) {
            _this.isValid(_this.validate(updated.value));
        }
    }
});

this.isValid = function (isValid) {
    _this.update({ error: !isValid });
};

this.format = function (value) {
    return value.replace(/\n/g, '<br/>&nbsp;');
};
this.mixin('validate');
});
riot.tag2('material-waves', '<div id="waves" name="waves"></div>', '', '', function(opts) {
var _this3 = this;

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var Wave = (function (_Bound) {
    _inherits(Wave, _Bound);

    function Wave(container, opts, e) {
        _classCallCheck(this, Wave);

        _get(Object.getPrototypeOf(Wave.prototype), 'constructor', this).call(this);

        if (!container) console.error('You should to set container to the wave!');
        this.container = container;

        this.maxOpacity = opts.opacity || 0.6;
        this.duration = opts.duration || 750;
        this.color = opts.color || '#fff';
        this.center = opts.center || false;

        this.event = e;

        this.containerBound = this.receiveBound();
        this.maxScale = this.containerBound.size / 100 * 10;
        this.created = Date.now();

        this.start = {};

        this.createNode();
        this.waveIn();
    }

    _createClass(Wave, [{
        key: 'createNode',
        value: function createNode() {
            this.wave = document.createElement('div');
            this.wave.classList.add('wave');
            this.container.appendChild(this.wave);
        }
    }, {
        key: 'waveIn',
        value: function waveIn() {
            var _this = this;

            if (this.center && !this.event) console.error('Setup at least mouse event... Or just set center attribute');

            this.start.x = this.center ? this.containerBound.height / 2 : this.event.pageY - this.containerBound.offsetTop;
            this.start.y = this.center ? this.containerBound.width / 2 : this.event.pageX - this.containerBound.offsetLeft;

            var isIE = window.navigator.userAgent.indexOf('Trident') !== -1;
            setTimeout(function () {
                return _this.setStyles(_this.maxOpacity);
            }, isIE ? 50 : 0);
        }
    }, {
        key: 'waveOut',
        value: function waveOut(cb) {
            var _this2 = this;

            var delta = Date.now() - this.created;
            var deltaX = Math.round(this.duration / 2) - delta;
            var delay = deltaX > 0 ? deltaX : 0;
            setTimeout(function () {
                _this2.setStyles(0);
                setTimeout(function () {
                    if (_this2.wave.parentNode === _this2.container) {
                        _this2.container.removeChild(_this2.wave);
                        cb();
                    }
                }, _this2.duration);
            }, delay);
        }
    }, {
        key: 'setStyles',
        value: function setStyles(opacity) {
            this.wave.setAttribute('style', this.convertStyle({
                'top': this.start.x + 'px',
                'left': this.start.y + 'px',
                'transform': 'scale(' + this.maxScale + ')',
                'transition-duration': this.duration + 'ms',
                'transition-timing-function': 'cubic-bezier(0.250, 0.460, 0.450, 0.940)',
                'background': this.color,
                'opacity': opacity
            }));
        }
    }, {
        key: 'convertStyle',
        value: function convertStyle(o) {
            var style = '';
            Object.keys(o).forEach(function (key) {
                if (o.hasOwnProperty(key)) {
                    style += key + ':' + o[key] + ';';
                }
            });
            return style;
        }
    }]);

    return Wave;
})(Bound);

this._waves = [];
this._events = [];

this.on('launch', function (e) {
    var wave = new Wave(_this3.waves, opts, e);
    _this3._waves.push(wave);
    _this3.trigger('wavestart', wave);
    if (_this3.parent && _this3.parent.opts && _this3.parent.opts.wavestart) {
        _this3.parent.opts.wavestart(wave);
    }
    if (!_this3._events.length) {
        _this3._events.push(e.target.addEventListener('mouseup', function () {
            return _this3.trigger('hold');
        }));
        _this3._events.push(e.target.addEventListener('mouseleave', function () {
            return _this3.trigger('hold');
        }));
    }
});

this.on('hold', function () {
    if (_this3._waves[_this3._waves.length - 1]) _this3._waves[_this3._waves.length - 1].waveOut(_this3.waveOut);
    if (_this3._waves[_this3._waves.length - 1]) _this3._waves.slice(_this3._waves.length - 1, 1);
});

this.waveOut = function () {
    _this3.trigger('waveend');

    if (_this3.parent && _this3.parent.opts && _this3.parent.opts.waveend) {
        _this3.parent.opts.waveend();
    }
};
});
(function(window, riot) {
    "use strict";

    var veronica = {
        version: "v1.0-beta",
        settings: {
            viewTag: ".app-body",
            maxPageTransitionTime: 200,
            enablePageTransitions:false,
            listenPopState:true
        }
    };

    var gems={
        flux:{}
    };

    var semiQualifiedBrowsers = [
        "UCBrowser",
        "Opera Mini"
    ];

    var globals = {
        BROWSER_SUPPORT : "A" //A for full support, B for semi support
    };
/*============================
Author : Prateek Bhatnagar
Data : 7th-Sept-2015
Description : This facilitates the capability detection and suppliment for the framework
=============================*/

;
(function(gems) {
    function testAnimationCapability() {
        var animation = false,
            animationstring = "animation",
            keyframeprefix = "",
            domPrefixes = "Webkit Moz O ms Khtml".split(" "),
            pfx = "",
            elm = $("body")[0];

        if (elm.style.animationName !== undefined) {
            animation = true;
        }

        if (animation === false) {
            for (var i = 0; i < domPrefixes.length; i++) {
                if (elm.style[domPrefixes[i] + "AnimationName"] !== undefined) {
                    pfx = domPrefixes[i];
                    animationstring = pfx + "Animation";
                    keyframeprefix = "-" + pfx.toLowerCase() + "-";
                    animation = true;
                    break;
                }
            }
        }

        return animation;
    }

    function isBrowserSemiSupported() {
        for (var uaIndex = 0; uaIndex < semiQualifiedBrowsers; uaIndex++) {
            var currUA = semiQualifiedBrowsers[uaIndex];
            if (navigator.userAgent.indexOf(currUA) !== -1) {
                return true;
            }
        }
        return false;
    }

    function handleClick(e) {
        var node = e.target;
        var parentCount = 0;
        while (node && parentCount < 4) {
            if (node.tagName === "A") {
                e.preventDefault();
                var pageEnterEffect = "mounting";
                var pageLeaveEffect = "unmount";
                if (!!node.getAttribute("data-pageentereffect")) {
                    pageEnterEffect = node.getAttribute("data-pageentereffect").trim();
                }
                if (!!node.getAttribute("data-pageleaveeffect")) {
                    pageLeaveEffect = node.getAttribute("data-pageleaveeffect").trim();
                }
                veronica.loc(node.getAttribute("href"), pageEnterEffect, pageLeaveEffect);
                break;
            } else {
                node = node.parentNode;
                parentCount = parentCount + 1;
            }

        }
    }

    function createEvent(e) {
        var ev = document.createEvent("CustomEvent");
        ev.initEvent(e);
        return ev;
    };

    gems.capabilities = {
        testAnimationCapability: testAnimationCapability,
        isBrowserSemiSupported: isBrowserSemiSupported,
        handleClick: handleClick,
        createEvent:createEvent
    };
})(gems)

/*============================
Author : Prateek Bhatnagar
Data : 7th-Sept-2015
Description : This facilitates a mock sizzle selector
=============================*/
;(function(window) {
    window.$ = function(tag, root) {
        return document.querySelectorAll(tag, root);
    };
})(window);
(function(gems) {

    var PB = function() {
        var _self = this,
            _events = {};

        _self.on = function(event, fn, once) {
            if (arguments.length < 2 ||
                typeof event !== "string" ||
                typeof fn !== "function") return;

            var fnString = fn.toString();

            // if the named event object already exists in the dictionary...
            if (typeof _events[event] !== "undefined") {
                if (typeof once === "boolean") {
                    // the function already exists, so update it's 'once' value.
                    _events[event].callbacks[fnString].once = once;
                } else {
                    _events[event].callbacks[fnString] = {
                        cb: fn,
                        once: !!once
                    };
                }
            } else {
                // create a new event object in the dictionary with the specified name and callback.
                _events[event] = {
                    callbacks: {}
                };

                _events[event].callbacks[fnString] = {
                    cb: fn,
                    once: !!once
                };
            }
        };

        _self.once = function(event, fn) {
            _self.on(event, fn, true);
        };

        _self.off = function(event, fn) {
            if (typeof event !== "string" ||
                typeof _events[event] === "undefined") return;

            // remove just the function, if passed as a parameter and in the dictionary.
            if (typeof fn === "function") {
                var fnString = fn.toString(),
                    fnToRemove = _events[event].callbacks[fnString];

                if (typeof fnToRemove !== "undefined") {
                    // delete the callback object from the dictionary.
                    delete _events[event].callbacks[fnString];
                }
            } else {
                // delete all functions in the dictionary that are
                // registered to this event by deleting the named event object.
                delete _events[event];
            }
        };

        _self.trigger = function(event, data) {
            if (typeof event !== "string" ||
                typeof _events[event] === "undefined") return;

            for (var fnString in _events[event].callbacks) {
                var callbackObject = _events[event].callbacks[fnString];

                if (typeof callbackObject.cb === "function") callbackObject.cb(data);
                if (typeof callbackObject.once === "boolean" && callbackObject.once === true) _self.off(event, callbackObject.cb);
            }
        };

    };

    gems.PB=PB;
    gems.Dispatcher = new PB();

})(gems);

/* Promises ===============*/
(function(gems) {
    function Promise() {
        this._successCallbacks = [];
        this._errorCallbacks = [];
    }

    function resolvePromise(func, context, queue, promise) {
        queue.push(function() {
            var res = func.apply(context, arguments);
            if (res && typeof res.then === "function")
                res.then(promise.done, promise);
        });
    }

    Promise.prototype.then = function(func, context) {
        var p;
        if (this._isdone) {
            p = func.apply(context, this.result);
        } else {
            p = new Promise();
            resolvePromise(func, context, this._successCallbacks, p);
        }
        return this;
    };

    Promise.prototype.catch = function(func, context) {
        var p;
        if (this._isdone && this._isfailure) {
            p = func.apply(context, this.result);
        } else {
            p = new Promise();
            resolvePromise(func, context, this._errorCallbacks, p);
        }
        return this;
    };

    Promise.prototype.resolve = function() {
        this.result = arguments;
        this._isdone = true;
        this._issuccess = true;
        for (var i = 0; i < this._successCallbacks.length; i++) {
            this._successCallbacks[i].apply(null, arguments);
        }
        this._successCallbacks = [];
    };

    Promise.prototype.reject = function() {
        this.result = arguments;
        this._isdone = true;
        this._isfailure = true;
        for (var i = 0; i < this._errorCallbacks.length; i++) {
            this._errorCallbacks[i].apply(null, arguments);
        }
        this._errorCallbacks = [];
    };

    var promise = {
        Promise: Promise
    };

    gems.promise = promise;
})(gems);
/* Ajax ===============*/
;(function(gems) {
    var globalHeaders={};
    var globalData={};

    function _encode(data) {
        var result = "";
        if (typeof data === "string") {
            result = data;
        } else {
            var e = encodeURIComponent;
            for (var k in data) {
                if (data.hasOwnProperty(k)) {
                    result += "&" + e(k) + "=" + e(data[k]);
                }
            }
        }
        return result;
    }

    function new_xhr() {
        var xhr;
        if (window.XMLHttpRequest) {
            xhr = new XMLHttpRequest();
        } else if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
            }
        }
        return xhr;
    }


    function ajax(method, url, data, headers) {
        var p = new gems.promise.Promise();
        var xhr, payload;
        data = data || {};
        headers = headers || {};

        for(var tempHeader in globalHeaders){
            headers[tempHeader]=globalHeaders[tempHeader];
        }

        for(var tempData in globalData){
            data[tempData]=globalData[tempData];
        }

        try {
            xhr = new_xhr();
        } catch (e) {
            p.reject(veronicaAjax.ENOXHR,"AJAX:ABSENT");
            return p;
        }

        payload = _encode(data);
        if (method === "GET" && payload) {
            url += "?" + payload;
            payload = null;
        }

        xhr.open(method, url);
        if (method === "POST") {
            xhr.setRequestHeader("Content-type", "application/json");
        } else {
            xhr.setRequestHeader("Content-type", "*/*");
        }
        for (var h in headers) {
            if (headers.hasOwnProperty(h)) {
                xhr.setRequestHeader(h, headers[h]);
            }
        }

        function onTimeout() {
            p.reject(veronicaAjax.ETIMEOUT, "AJAX:TIMEOUT", xhr);
            xhr.abort();
        }

        var timeout = veronicaAjax.ajaxTimeout;
        if (timeout) {
            var tid = setTimeout(onTimeout, timeout);
        }

        xhr.onreadystatechange = function() {
            if (timeout) {
                clearTimeout(tid);
            }
            if (xhr.readyState === 4) {
                var err = (!xhr.status ||
                    (xhr.status < 200 || xhr.status >= 300) &&
                    xhr.status !== 304);
                if (err) {
                    p.reject(xhr.responseText, xhr);
                } else {
                    p.resolve(xhr.responseText, xhr);
                }

            }
        };

        xhr.send(payload);
        return p;
    }

    function _ajaxer(method) {
        return function(url, data, headers) {
            return ajax(method, url, data, headers);
        };
    }

    function setGlobalHeaders(headers){
        globalHeaders=headers;
    }

    function getGlobalHeaders(){
        return globalHeaders;
    }

    function setGlobalData(data){
        globalData=data;
    }

    function getGlobalData(){
        return globalData;
    }

    function setAjaxTimeout(timeout){
        if(typeof timeout==="number"){
            veronicaAjax.ajaxTimeout=timeout;
        }
    }

    var veronicaAjax = {
        ajax: ajax,
        get: _ajaxer("GET"),
        post: _ajaxer("POST"),
        put: _ajaxer("PUT"),
        del: _ajaxer("DELETE"),
        /* Error codes */
        ENOXHR: 1,
        ETIMEOUT: 2,

        /**
         * Configuration parameter: time in milliseconds after which a
         * pending AJAX request is considered unresponsive and is
         * aborted. Useful to deal with bad connectivity (e.g. on a
         * mobile network). A 0 value disables AJAX timeouts.
         *
         * Aborted requests resolve the promise with a ETIMEOUT error
         * code.
         */
        ajaxTimeout: 15000
    };

    gems.http={};

    gems.http.ajax = veronicaAjax.ajax;
    gems.http.get = veronicaAjax.get;
    gems.http.post = veronicaAjax.post;
    gems.http.put = veronicaAjax.put;
    gems.http.delete = veronicaAjax.del;

    //global ajax funtions
    gems.httpGlobal={};
    gems.httpGlobal.setAjaxTimeout=setAjaxTimeout;
    gems.httpGlobal.getGlobalHeaders=getGlobalHeaders;
    gems.httpGlobal.setGlobalHeaders=setGlobalHeaders;
    gems.httpGlobal.getGlobalData=getGlobalData;
    gems.httpGlobal.setGlobalData=setGlobalData;

})(gems);
/*============================
Author : Prateek Bhatnagar
Data : 6th-Sept-2015
Description : This is the lib for extending base store/action to user provided actions and stores
=============================*/
;
(function(gems) {
    var extend = function(base, child) {
        child.prototype = new base();
        return child;
    };

    gems.extender = extend;
})(gems);

/*============================
Author : Prateek Bhatnagar
Data : 7th-Sept-2015
Description : This facilitates the router of the framework
=============================*/
;
(function(gems, veronica) {
    var appStatus = {
        shownEventFired: false,
        mountingComponent: null
    }

    appStatus.viewTag = $(veronica.settings.viewTag)[0];
    if (appStatus.viewTag) {
        appStatus.viewTag.innerHTML = "<div class='page'></div>";
        appStatus.pageTag = appStatus.viewTag.querySelector(".page");
    } else {
        appStatus.pageTag = null;
    }

    appStatus.routes = [];

    appStatus.currentState = {
        name: "",
        state: {}
    };

    appStatus.currentComponent = null;

    function createRoute(stateName, urlRegex, componentToMount) {
        return {
            url: urlRegex,
            state: stateName,
            component: componentToMount
        };
    }

    function getCurrentState() {
        return appStatus.currentState.state;
    }

    function getCurrentPath() {
        var route = location.pathname.split("#")[0];
        if (typeof route === "string") {
            return route;
        } else if (route.length > 0) {
            return route[0];
        } else {
            throw new Error("Unable to process route");
        }
    }

    function addRoute(route) {
        if (route && route.url && route.component) {
            var tokenRegExp = /:([A-Za-z0-9]*)$|:(([A-Za-z0-9]*)\/)/g;
            var params = route.url.match(tokenRegExp);
            var urlregex = route.url;
            if (params) {
                for (var paramIndex = 0; paramIndex < params.length; paramIndex++) {
                    params[paramIndex] = params[paramIndex].replace("/", "");
                    urlregex = urlregex.replace(params[paramIndex], "(.*)");
                }
            }
            route.regex = new RegExp("^" + urlregex + "$", "i");
            route.paramDictionary = params;

            appStatus.routes.push(route);
        } else {
            throw new Error("Route object should contain a URL regex and a component name");
        }
    }

    function extractRouteData(regex, paramDictionary, url) {
        if (!paramDictionary || paramDictionary.length === 0) {
            return {};
        }

        var data = url.match(regex);
        var routeData = {};
        data.shift();

        for (var pdIndex = 0; pdIndex < paramDictionary.length; pdIndex++) {
            routeData[paramDictionary[pdIndex]] = data[pdIndex];
        }

        return routeData;
    }

    function loc() {
        if (arguments.length === 0) {
            return appStatus.currentState;
        } else if (arguments.length > 0 && typeof(arguments[0]) == "string") {
            var newRoute = arguments[0];
            var currRoute = getCurrentPath();
            if (history && history.pushState) {
                var urlFound = false;
                for (var r in appStatus.routes) {
                    var route = appStatus.routes[r];
                    var currRouteRegex = route.regex;
                    //check if route matches and is not the current route
                    if (currRouteRegex.test(newRoute) && (appStatus.currentState.name !== route.state)) {
                        route.data = extractRouteData(currRouteRegex, route.paramDictionary, newRoute);
                        var routeData = {};
                        routeData.component = route.component;
                        routeData.data = route.data;
                        routeData.url = route.url;
                        routeData.state = route.state;

                        if (appStatus.currentState.name === "") {
                            history.replaceState(routeData, "", newRoute);
                        } else {
                            route.prevPage = currRoute;
                            if (arguments[1] && typeof(arguments[1]) == "boolean" && arguments[1] === true) {
                                history.replaceState(routeData, "", newRoute);
                            } else {
                                history.pushState(routeData, "", newRoute);
                            }
                        }
                        urlFound = true;
                        gems.Dispatcher.trigger("veronica:stateChange", route);
                        var pageEnterEffect = "mounting";
                        var pageLeaveEffect = "unmount";
                        if (arguments[1] && typeof(arguments[1]) == "string") {
                            pageEnterEffect = arguments[1];
                        }
                        if (arguments[2] && typeof(arguments[2]) == "string") {
                            pageLeaveEffect = arguments[2];
                        }
                        evalRoute(route, pageEnterEffect, pageLeaveEffect);
                        break;
                    }
                }
                //current web app does not have this route so send this request to Server
                if (!urlFound) {
                    location.href = newRoute;
                }
            } else {
                if (newRoute !== currRoute) {
                    location.href = newRoute;
                }
            }
        }
    }

    function replaceLoc(url) {
        loc(url, true);
    }

    window.addEventListener("popstate", function(e) {
        if (veronica.settings.listenPopState && e && e.state) {
            if (appStatus.currentState.state.state !== e.state.state) {
                gems.Dispatcher.trigger("veronica:stateChange", e.state);
            }
            evalRoute(e.state, "mounting-pop", "unmount-pop");
        }
    });

    function evalRoute(stateObj, pageEnterEffect, pageLeaveEffect) {
        // declare components and states
        if (stateObj === null) {
            return;
        }

        var componentName = stateObj.component;
        var prevState = appStatus.currentState;


        //initialize current state and component
        appStatus.currentState.name = stateObj.state;
        appStatus.currentState.state = stateObj;
        appStatus.currentComponent = document.createElement(componentName);


        mountNewPage(pageEnterEffect, pageLeaveEffect);

        var tag = riot.mount(componentName, {});

    }

    function mountNewPage(pageEnterEffect, pageLeaveEffect) {
        pageEnterEffect = pageEnterEffect || "mounting";
        pageLeaveEffect = pageLeaveEffect || "unmount";

        if (appStatus.viewTag) {
            //if there is already something in current page
            if (appStatus.pageTag.children.length > 0) {
                var elem = document.createElement("div");
                appStatus.shownEventFired = false;
                elem.className = "page " + appStatus.currentComponent.tagName.toLowerCase();
                elem.appendChild(appStatus.currentComponent);

                appStatus.mountingComponent = elem;

                if (veronica.settings.enablePageTransitions) {
                    appStatus.pageTag.addEventListener("webkitTransitionEnd", transEnd);
                    appStatus.pageTag.addEventListener("oTransitionEnd", transEnd);
                    appStatus.pageTag.addEventListener("transitionend", transEnd);
                }

                setTimeout(function() {
                    if (!appStatus.shownEventFired) {
                        animEndCallback(appStatus.pageTag, elem)
                        appStatus.currentComponent.dispatchEvent(gems.capabilities.createEvent("shown"));
                    }
                }, veronica.settings.maxPageTransitionTime);

                if (globals.BROWSER_SUPPORT === "A" && veronica.settings.enablePageTransitions) {
                    elem.classList.add(pageEnterEffect);
                    appStatus.pageTag.classList.add(pageLeaveEffect);
                    appStatus.viewTag.appendChild(elem);

                } else {
                    var page = appStatus.viewTag.children && appStatus.viewTag.children[0];
                    var tag = page && page.children && page.children[0];
                    if (tag._tag && tag._tag.isMounted) {
                        tag._tag.unmount()
                    }

                    var newComponent = appStatus.currentComponent.tagName.toLowerCase();
                    var newTag = "<div class='page " + newComponent + "'>" + "<" + newComponent + "></" + newComponent + ">" + "</div>";

                    appStatus.viewTag.innerHTML = newTag;
                }
            } else {
                //if this is the first time a page is being mounted
                appStatus.pageTag.classList.add(appStatus.currentComponent.tagName.toLowerCase());
                appStatus.pageTag.appendChild(appStatus.currentComponent);
                gems.Dispatcher.trigger("veronica:stateTransitionComplete", appStatus.currentState.state);
            }
        }
    }

    function transEnd(elem) {
        this.removeEventListener("transitionend", transEnd);
        this.removeEventListener("webkitTransitionEnd", transEnd);
        this.removeEventListener("oTransitionEnd", transEnd);
        animEndCallback(this, appStatus.mountingComponent);
        appStatus.shownEventFired = true;
        appStatus.currentComponent.dispatchEvent(gems.capabilities.createEvent("shown"));
    }

    function animEndCallback(currElem, newPage) {
        currElem.className = "hidden";

        removePrevComponents(newPage);

        newPage.className = "page " + appStatus.currentComponent.tagName.toLowerCase();
        appStatus.pageTag = newPage;
        gems.Dispatcher.trigger("veronica:stateTransitionComplete", appStatus.currentState.state);
    }

    function getPrevPageUrl() {
        if (history.state) {
            return history.state.prevPage || null;
        } else {
            return null;
        }

    }

    function removePrevComponents(currComponent) {
        var viewTags = appStatus.viewTag.childNodes;
        var tegRemovalIndex = 0;
        while (viewTags.length > 1) {
            var currTag = viewTags[tegRemovalIndex];
            var currPage = currTag.childNodes[0];
            if (currTag !== currComponent) {
                if (currTag.remove) {
                    currTag.remove();
                } else if (currTag.parentElement) {
                    currTag.parentElement.removeChild(currTag);
                }
            } else {
                tegRemovalIndex = tegRemovalIndex + 1;
            }
        }
    }

    veronica.createRoute = createRoute;
    veronica.getCurrentPath = getCurrentPath;
    veronica.getCurrentState = getCurrentState;
    veronica.getPrevPageUrl = getPrevPageUrl;
    veronica.addRoute = addRoute;
    veronica.loc = loc;
    gems.totalRouteLength = function() {
        return appStatus.routes.length
    };

})(gems, veronica);

/*============================
Author : Prateek Bhatnagar
Data : 4th-Sept-2015
Description : This is the base class 
=============================*/
;(function(veronica, http, Dispatcher, promise) {
    var actions={};
    gems.flux.Actions={};

    function Action() {
        this.Dispatcher = {
            trigger: Dispatcher.trigger
        };
        this.Ajax = http;
        this.Promise = promise.Promise;
    }

    gems.flux.Actions.createAction=function(actionName,childClass){
        try{
            actions[actionName]=gems.extender(Action,childClass);    
            return true;
        }
        catch(e){
            return false;
        }
    }

    gems.flux.Actions.getAction=function(name){
        var klass=actions[name];
        if(klass){
            return new klass();    
        }
        else{
            return null;
        }
    }

})(veronica,gems.http, gems.Dispatcher, gems.promise);

/*============================
Author : Prateek Bhatnagar
Data : 6th-Sept-2015
Description : This is the base class for stores
=============================*/
;
(function(veronica, Dispatcher, PubSub, promise) {
    var stores = {};
    gems.flux.Stores = {};

    function Store() {
        var PB = new PubSub();
        this.Dispatcher = {
            register: Dispatcher.on,
            unregister: Dispatcher.off,
            once: Dispatcher.once
        };
        //no more including this wrapper
        //this.Storage = gems.Storage;
        this.subscribe = PB.on;
        this.unsubscribe = PB.off;
        this.Promise = promise.Promise;
        this.emit = function(eventName) {
            PB.trigger(eventName, {});
        }
    }

    gems.flux.Stores.createStore = function(storeName, childClass) {
        try {
            var klass = gems.extender(Store, childClass);
            stores[storeName] = new klass();
            return true;
        } catch (e) {
            return false;
        }
    }

    gems.flux.Stores.getStore = function(name) {
        return stores[name];
    }

})(veronica, gems.Dispatcher, gems.PB, gems.promise);
/*============================
Author : Prateek Bhatnagar
Data : 7th-Sept-2015
Description : This facilitates the initialization of the framework
=============================*/
(function(gems,veronica){
    function init() {

        if (!gems.capabilities.testAnimationCapability()) {
            $("body")[0].classList.add("noanim");
        }

        if (gems.capabilities.isBrowserSemiSupported()) {
            globals.BROWSER_SUPPORT = "B";
            $("body")[0].classList.add("noanim");
        }

        //mount riot
        //only mount pages else some components might get mounted twice
        //riot.mount("*", {});

        //mount initial page
        if(gems.totalRouteLength()>0){
            veronica.loc(location.pathname);
            gems.Dispatcher.trigger("veronica:init");
            window.dispatchEvent(gems.capabilities.createEvent("veronica:init"));
        }

        document.addEventListener("click", gems.capabilities.handleClick);
    }

    document.onreadystatechange = function() {
        if (document.readyState == "interactive") {
            init();
        }
    };
})(gems,veronica);
    veronica.flux = gems.flux;
    veronica.http=gems.httpGlobal;
    window.veronica = veronica;

})(window, riot);
/**
 *
 * Version: 1.0.0
 * Author: Gianluca Guarini
 * Contact: gianluca.guarini@gmail.com
 * Website: http://www.gianlucaguarini.com/
 * Twitter: @gianlucaguarini
 *
 * Copyright (c) Gianluca Guarini
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 **/
(function(doc, win) {
  'use strict'
  if (typeof doc.createEvent !== 'function') return false // no tap events here
  // helpers
  var useJquery = typeof jQuery !== 'undefined',
    msEventType = function(type) {
      var lo = type.toLowerCase(),
        ms = 'MS' + type
      return navigator.msPointerEnabled ? ms : lo
    },
    // was initially triggered a "touchstart" event?
    wasTouch = false,
    touchevents = {
      touchstart: msEventType('PointerDown') + ' touchstart',
      touchend: msEventType('PointerUp') + ' touchend',
      touchmove: msEventType('PointerMove') + ' touchmove'
    },
    setListener = function(elm, events, callback) {
      var eventsArray = events.split(' '),
        i = eventsArray.length

      while (i--) {
        elm.addEventListener(eventsArray[i], callback, false)
      }
    },
    getPointerEvent = function(event) {
      return event.targetTouches ? event.targetTouches[0] : event
    },
    getTimestamp = function () {
      return new Date().getTime()
    },
    sendEvent = function(elm, eventName, originalEvent, data) {
      var customEvent = doc.createEvent('Event')
      customEvent.originalEvent = originalEvent
      data = data || {}
      data.x = currX
      data.y = currY
      data.distance = data.distance

      // jquery
      if (useJquery) {
        customEvent = jQuery.Event(eventName, {originalEvent: originalEvent})
        jQuery(elm).trigger(customEvent, data)
      }

      // addEventListener
      if (customEvent.initEvent) {
        for (var key in data) {
          customEvent[key] = data[key]
        }
        customEvent.initEvent(eventName, true, true)
        elm.dispatchEvent(customEvent)
      }

      // detect all the inline events
      // also on the parent nodes
      while (elm) {
        // inline
        if (elm['on' + eventName])
          elm['on' + eventName](customEvent)
        elm = elm.parentNode
      }

    },

    onTouchStart = function(e) {
      /**
       * Skip all the mouse events
       * events order:
       * Chrome:
       *   touchstart
       *   touchmove
       *   touchend
       *   mousedown
       *   mousemove
       *   mouseup <- this must come always after a "touchstart"
       *
       * Safari
       *   touchstart
       *   mousedown
       *   touchmove
       *   mousemove
       *   touchend
       *   mouseup <- this must come always after a "touchstart"
       */

      // it looks like it was a touch event!
      if (e.type !== 'mousedown')
        wasTouch = true

      // skip this event we don't need to track it now
      if (e.type === 'mousedown' && wasTouch) return

      var pointer = getPointerEvent(e)

      // caching the current x
      cachedX = currX = pointer.pageX
      // caching the current y
      cachedY = currY = pointer.pageY

      longtapTimer = setTimeout(function() {
        sendEvent(e.target, 'longtap', e)
        target = e.target
      }, longtapThreshold)

      // we will use these variables on the touchend events
      timestamp = getTimestamp()

      tapNum++

    },
    onTouchEnd = function(e) {

      // skip the mouse events if previously a touch event was dispatched
      // and reset the touch flag
      if (e.type === 'mouseup' && wasTouch) {
        wasTouch = false
        return
      }

      var eventsArr = [],
        now = getTimestamp(),
        deltaY = cachedY - currY,
        deltaX = cachedX - currX

       // clear the previous timer if it was set
      clearTimeout(dblTapTimer)
      // kill the long tap timer
      clearTimeout(longtapTimer)

      if (deltaX <= -swipeThreshold)
        eventsArr.push('swiperight')

      if (deltaX >= swipeThreshold)
        eventsArr.push('swipeleft')

      if (deltaY <= -swipeThreshold)
        eventsArr.push('swipedown')

      if (deltaY >= swipeThreshold)
        eventsArr.push('swipeup')

      if (eventsArr.length) {
        for (var i = 0; i < eventsArr.length; i++) {
          var eventName = eventsArr[i]
          sendEvent(e.target, eventName, e, {
            distance: {
              x: Math.abs(deltaX),
              y: Math.abs(deltaY)
            }
          })
        }
        // reset the tap counter
        tapNum = 0
      } else {

        if (
          cachedX >= currX - tapPrecision &&
          cachedX <= currX + tapPrecision &&
          cachedY >= currY - tapPrecision &&
          cachedY <= currY + tapPrecision
        ) {
          if (timestamp + tapThreshold - now >= 0)
          {
            // Here you get the Tap event
            sendEvent(e.target, tapNum >= 2 && target === e.target ? 'dbltap' : 'tap', e)
            target= e.target
          }
        }

        // reset the tap counter
        dblTapTimer = setTimeout(function() {
          tapNum = 0
        }, dbltapThreshold)

      }
    },
    onTouchMove = function(e) {
      // skip the mouse move events if the touch events were previously detected
      if (e.type === 'mousemove' && wasTouch) return

      var pointer = getPointerEvent(e)
      currX = pointer.pageX
      currY = pointer.pageY
    },
    swipeThreshold = win.SWIPE_THRESHOLD || 100,
    tapThreshold = win.TAP_THRESHOLD || 150, // range of time where a tap event could be detected
    dbltapThreshold = win.DBL_TAP_THRESHOLD || 200, // delay needed to detect a double tap
    longtapThreshold = win.LONG_TAP_THRESHOLD || 1000, // delay needed to detect a long tap
    tapPrecision = win.TAP_PRECISION / 2 || 60 / 2, // touch events boundaries ( 60px by default )
    justTouchEvents = win.JUST_ON_TOUCH_DEVICES,
    tapNum = 0,
    currX, currY, cachedX, cachedY, timestamp, target, dblTapTimer, longtapTimer

  //setting the events listeners
  // we need to debounce the callbacks because some devices multiple events are triggered at same time
  setListener(doc, touchevents.touchstart + (justTouchEvents ? '' : ' mousedown'), onTouchStart)
  setListener(doc, touchevents.touchend + (justTouchEvents ? '' : ' mouseup'), onTouchEnd)
  setListener(doc, touchevents.touchmove + (justTouchEvents ? '' : ' mousemove'), onTouchMove)

}(document, window));
