
function ensureRefs (vm, type) {
  if (!vm[type]) {
    vm[type] = Object.create(null)
    vm[type]['__handlers__'] = Object.create(null)
  }
}

function bind (vm, { type, key, source }) {
  const handlers = vm[type]['__handlers__']
  let handler = handlers[key]
  if (handler) return

  if (type === '$collections') {
    handler = () => { vm[key] = source.filter() }
    source.on('add', handler)
    source.on('remove', handler)
  }
  vm[type][key] = source
  handlers[key] = handler
}

function unbind (vm, { type, key }) {
  const collection = vm[type] && vm[type][key]

  if (!collection) {
    throw new Error(`VueData: ${key} is not bound to a Collection instance.`)
  }

  const handlers = vm[type]['__handlers__']
  collection.off('add', handlers[key])
  collection.off('remove', handlers[key])
}

function plugin (Vue, JsData) {
  const { Collection } = JsData

  Vue.mixin({
    init () {
      const self = this
      const dataFn = self.$options.data

      if (dataFn) {
        self.$options.data = function () {
          const collections = Object.create(null)
          const raw = dataFn()

          Object.keys(raw).forEach(key => {
            const value = raw[key]

            if (value instanceof Collection) {
              collections[key] = value
            }
          })

          const collectionKeys = Object.keys(collections)

          if (collectionKeys.length) {
            const type = '$collections'
            ensureRefs(self, type)
            collectionKeys.forEach(key => {
              const source = collections[key]
              raw[key] = source.filter()
              bind(self, { type, key, source })
            })
          }

          return raw
        }
      }
    },
    beforeDestroy () {
      const { $collections } = this
      if (!$collections) return

      Object.keys($collections)
        .filter(key => key !== '__handlers__')
        .forEach(key => {
          this.$unbind(key)
        })
    }
  })

  Vue.prototype.$bindCollection = function (key, source) {
    const type = '$collections'
    ensureRefs(this, type)
    bind(this, { type, key, source })
  }

  Vue.prototype.$unbind = function (key) {
    try {
      this.$data[key] = JSON.parse(JSON.stringify(this[key]))
    } catch (error) {
      throw new Error(`VueData: Failed unbinding key[${key}]`)
    }
    unbind(this, { type: '$collections', key })
  }
}

plugin.version = '0.1.1'

export default plugin
