(function(global) {
  'use strict';
  function extend(obj1, obj2) {
    for (var key in obj2) {
      obj1[key] = obj2[key];
    }
  }
  // 編集ルールを取得する
  var get_rules = (function() {
    var rules = null;
    var request = global.superagent;
    request.get("/json/rules.json").end(function(err, res) {
      rules = res.body;
    });
    return function() {
      return rules;
    }
  })();
  function createFoundElement(rule, target) {
    var span = global.document.createElement('span');
    span.className = 'found';
    span.dataset.rule = rule;
    span.dataset.target = target;
    span.textContent = target;
    return span;
  }
  var getPlaceHolder = (function() {
    var count = -1;
    return {
      get: function() {
        count += 1;
        return '<' + count + '>';
      },
      reset: function() {
        count = -1;
      }
    };
  })();
  function preRuleMapper(rule, text, placeHolderMap) {
    var rules = get_rules();
    var targets = rules[rule]['targets'];
    var map = {};
    for (var target in targets) {
      var re = new RegExp(target, 'g');
      if (text.search(re) == -1)
        continue;
      var found = createFoundElement(rule, target);
      var placeHolder = getPlaceHolder.get();
      text = text.replace(re, placeHolder);
      map[placeHolder] = found.outerHTML;
    }
    extend(placeHolderMap, map);
    return text
  }
  function ruleMapper(text, placeHolderMap) {
    for (var key in placeHolderMap) {
      var re = new RegExp(key, 'g');
      text = text.replace(re, placeHolderMap[key])
    }
    return text
  }
  function replaceReturnCode(text) {
    return text.replace(/\n/g, '<br>');
  }
  var app = new Vue({
    el: '#app',
    data: {
      input: '',
      info: {}
    },
    methods: {
      showMessage: function(event) {
        var tg = event.target;
        if (tg.className !== 'found') {
          this.info = {};
          return;
        }
        var rules = get_rules();
        var rule = rules[tg.dataset.rule];
        var target = '';
        var note = '';
        for (var prop in rule.targets) {
          if (prop === tg.dataset.target) {
            target = prop;
            note = rule.targets[prop];
            break;
          }
        }
        this.info = {
          name: rule.name,
          desc: rule.desc,
          target: target,
          note: note
        };
      }
    },
    filters: {
      check: function (value) {
        var placeHolderMap = {};
        getPlaceHolder.reset();
        if (!value)
          return;
        value = preRuleMapper('kanji', value, placeHolderMap);
        value = preRuleMapper('saidoku', value, placeHolderMap);
        value = replaceReturnCode(value);
        value = ruleMapper(value, placeHolderMap);
        return value;
      }
    }
  });
})(this);
