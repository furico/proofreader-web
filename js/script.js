(function(global) {
  'use strict';
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
  var applyFilter = (function() {
    return function(rule, text) {
      var rules = get_rules();
      var targets = rules[rule]['targets'];
      for (var target in targets) {
        var re = new RegExp(target, 'g');
        var found = createFoundElement(rule, target);
        text = text.replace(re, found.outerHTML);
      }
      return text;
    }
  })();
  new Vue({
    el: '#app',
    data: {
      input: '',
      info: {name: '', desc: '', target: '', note: ''}
    },
    methods: {
      showMessage: function(event) {
        var tg = event.target;
        if (tg.className !== 'found') {
          this.info.name = '';
          this.info.desc = '';
          this.info.target = '';
          this.info.note = '';
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
        this.info.name = rule.name;
        this.info.desc = rule.desc;
        this.info.target = target;
        this.info.note = note;
      }
    },
    filters: {
      check: function (value) {
        var result = '';
        if (!value)
          return;
        result = applyFilter('kanji', value);
        result = applyFilter('saidoku', result);
        return result;
      }
    }
  });
})(this);
