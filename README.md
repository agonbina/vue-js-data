# vue-js-data

Provides bindings for js-data `Collection` instances to Vue.js view models.

*Note: This works only with js-data@3.x*

Install:
```
npm i -S vue-js-data
```

Usage:
```js
import Vue from 'vue'
import VueData from 'vue-js-data'
import JSData from 'js-data'

Vue.use(VueData, JSData)

const myCollection = new JSData.Collection([{
  id: 1,
  title: 'Hello world.'
}, {
  id: 2,
  title: 'Hello there!'
}])

new Vue({
  data: {
    myItems: myCollection
  },
  template: `
    <ul>
      <li v-for="item in myItems">{{item.id}} has a title: {{item.title}}</li>
    </ul>
  `
})
```

# License

[MIT](http://opensource.org/licenses/MIT)
