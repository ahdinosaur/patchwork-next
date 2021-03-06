var pull = require('pull-stream')
var computed = require('@mmckegg/mutant/computed')
var MutantPullReduce = require('../lib/mutant-pull-reduce')
var plugs = require('patchbay/plugs')
var sbot_user_feed = plugs.first(exports.sbot_user_feed = [])
var cache = {}
var throttle = require('@mmckegg/mutant/throttle')

exports.obs_following = function (userId) {
  if (cache[userId]) {
    return cache[userId]
  } else {
    var stream = pull(
      sbot_user_feed({id: userId, live: true}),
      pull.filter((msg) => {
        return !msg.value || msg.value.content.type === 'contact'
      })
    )

    var result = MutantPullReduce(stream, (result, msg) => {
      var c = msg.value.content
      if (c.contact) {
        if (typeof c.following === 'boolean') {
          if (c.following) {
            result.add(c.contact)
          } else {
            result.delete(c.contact)
          }
        }
      }
      return result
    }, {
      startValue: new Set(),
      nextTick: true
    })

    var instance = throttle(result, 2000)
    instance.sync = result.sync

    instance.has = function (value) {
      return computed(instance, x => x.has(value))
    }

    cache[userId] = instance
    return instance
  }
}
