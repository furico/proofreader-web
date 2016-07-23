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
  function createFoundElement(rule, word) {
    var span = global.document.createElement('span');
    span.className = 'found';
    span.dataset.rule = rule;
    span.dataset.word = word;
    span.textContent = word;
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
    var words = rules[rule]['words'];
    var map = {};
    for (var word in words) {
      var re = new RegExp(word, 'g');
      if (text.search(re) == -1)
        continue;
      var found = createFoundElement(rule, word);
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
        this.info = {
          name: rule.name,
          desc: rule.desc,
          word: tg.dataset.word,
          note: rule.words[tg.dataset.word]
        };
      }
    },
    filters: {
      check: function (value) {
        var placeHolderMap = {};
        getPlaceHolder.reset();
        if (!value)
          return;
        var rules = ['kanji', 'saidoku', 'kana3', 'kana2', 'kana1'];
        rules.forEach(function(rule) {
          value = preRuleMapper(rule, value, placeHolderMap);
        });
        value = ruleMapper(value, placeHolderMap);
        value = replaceReturnCode(value);
        return value;
      }
    }
  });
})(this);
