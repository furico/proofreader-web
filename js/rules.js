(function(global) {
  'use strict';
  function parseRules(json) {
    var parsed = [];
    for (var key in json[0]) {
      if (key !== "version") {
        parsed.push(json[0][key])
      }
    }
    return parsed;
  }
  function getRules(app) {
    var request = global.superagent;
    request.get("json/rules.json").end(function(err, res) {
      app.rules = parseRules(res.body);
      app.loaded = true;
    });
  }
  var app = new Vue({
    el: '#app',
    data: {
      rules: null,
    }
  });
  getRules(app);
})(this);
