/*!
 * Debounce Event
 * https://github.com/gregstallings/debounce-event
 *
 * Copyright 2016 Greg Stallings
 * Released under the MIT license
 */
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory)
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory()
  } else {
    root.DebounceEvent = factory()
  }
}(this, function() {
  'use strict'

  var keyCount = 0
  var eventGroups = {}

  function debounceEvent(eventKey, elem, eventName, timeout) {
    var that = this
    var count = 0
    var eventGroup = eventGroups[eventKey]
    var items = eventGroup.items

    var listener = function() {
      var id = (++count)

      setTimeout(function() {
        if (id === count) {
          var toRemove = []

          for (var i = 0; i < items.length; i++) {
            items[i][0].call(that)

            // Remove if only once
            if (items[i][1]) {
              toRemove.push(i)
            }
          }

          // Remove elements marked for removal
          for (var i = toRemove.length - 1; i >= 0; i--) {
            items.splice(toRemove[i], 1)
          }

          // Detach event handler and delete event group if empty
          if (items.length === 0) {
            DebounceEvent.detach(eventKey)
          }
        }
      }, timeout)
    }

    elem.addEventListener(eventName, listener)

    // Register other properties on the event group for use by the detach
    // handler
    eventGroup.elem = elem
    eventGroup.eventName = eventName
    eventGroup.listener = listener
  }

  function eventKeyNotRegistered(key) {
    throw new Error("Given event key '" + key + "' not registered")
  }

  var DebounceEvent = {
    attach: function(obj) {
      var eventKey
      var once = obj.hasOwnProperty('once') ? obj.once : false

      if (obj.hasOwnProperty('eventKey')) {
        eventKey = obj.eventKey
        if (!eventGroups.hasOwnProperty(eventKey)) {
          eventKeyNotRegistered(eventKey)
        }

        eventGroups[eventKey].items.push([obj.done, once])
      } else {
        eventKey = keyCount++
        eventGroups[eventKey] = {}
        eventGroups[eventKey].items = []
        eventGroups[eventKey].items.push([obj.done, once])
        debounceEvent(eventKey, obj.elem, obj.eventName, obj.timeout)
      }

      return eventKey
    },

    detach: function(eventKey) {
      if (!eventGroups.hasOwnProperty(eventKey)) {
        eventKeyNotRegistered(eventKey)
      }

      var eventGroup = eventGroups[eventKey]
      eventGroup.elem.removeEventListener(eventGroup.eventName, eventGroup.listener)
      delete eventGroups[eventKey]
    }
  }

  return DebounceEvent
}));
