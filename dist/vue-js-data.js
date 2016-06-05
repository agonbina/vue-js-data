/*!
 * vue-js-data v0.1.1
 * (c) 2016 Agon Bina
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  global.VueJsData = factory();
}(this, function () { 'use strict';

  function ensureRefs(vm, type) {
    if (!vm[type]) {
      vm[type] = Object.create(null);
      vm[type]['__handlers__'] = Object.create(null);
    }
  }

  function bind(vm, _ref) {
    var type = _ref.type;
    var key = _ref.key;
    var source = _ref.source;

    var handlers = vm[type]['__handlers__'];
    var handler = handlers[key];
    if (handler) return;

    if (type === '$collections') {
      handler = function handler() {
        vm[key] = source.filter();
      };
      source.on('add', handler);
      source.on('remove', handler);
    }
    vm[type][key] = source;
    handlers[key] = handler;
  }

  function unbind(vm, _ref2) {
    var type = _ref2.type;
    var key = _ref2.key;

    var collection = vm[type] && vm[type][key];

    if (!collection) {
      throw new Error('VueData: ' + key + ' is not bound to a Collection instance.');
    }

    var handlers = vm[type]['__handlers__'];
    collection.off('add', handlers[key]);
    collection.off('remove', handlers[key]);
  }

  function plugin(Vue, JsData) {
    var Collection = JsData.Collection;


    Vue.mixin({
      init: function init() {
        var self = this;
        var dataFn = self.$options.data;

        if (dataFn) {
          self.$options.data = function () {
            var collections = Object.create(null);
            var raw = dataFn();

            Object.keys(raw).forEach(function (key) {
              var value = raw[key];

              if (value instanceof Collection) {
                collections[key] = value;
              }
            });

            var collectionKeys = Object.keys(collections);

            if (collectionKeys.length) {
              (function () {
                var type = '$collections';
                ensureRefs(self, type);
                collectionKeys.forEach(function (key) {
                  var source = collections[key];
                  raw[key] = source.filter();
                  bind(self, { type: type, key: key, source: source });
                });
              })();
            }

            return raw;
          };
        }
      },
      beforeDestroy: function beforeDestroy() {
        var _this = this;

        var $collections = this.$collections;

        if (!$collections) return;

        Object.keys($collections).filter(function (key) {
          return key !== '__handlers__';
        }).forEach(function (key) {
          _this.$unbind(key);
        });
      }
    });

    Vue.prototype.$bindCollection = function (key, source) {
      var type = '$collections';
      ensureRefs(this, type);
      bind(this, { type: type, key: key, source: source });
    };

    Vue.prototype.$unbind = function (key) {
      try {
        this.$data[key] = JSON.parse(JSON.stringify(this[key]));
      } catch (error) {
        throw new Error('VueData: Failed unbinding key[' + key + ']');
      }
      unbind(this, { type: '$collections', key: key });
    };
  }

  plugin.version = '0.1.1';

  return plugin;

}));