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
  function filter_kanji(text) {
    var rules = get_rules();
    var targets = rules['kanji']['targets'];
    targets.forEach(function(target, index) {
      var re = new RegExp(target['data'], 'g');
      var span = global.document.createElement('span');
      span.className = 'found';
      span.dataset.rule = 'kanji';
      span.dataset.target = target['data'];
      span.textContent = target['data'];
      text = text.replace(re, span.outerHTML);
    });
    return text
  }
  function filter_saidoku(text) {
    var rules = get_rules();
    var targets = rules['saidoku']['targets'];
    targets.forEach(function(target, index) {
      var re = new RegExp(target['data'], 'g');
      var tagged = '<span class="found" data-hoge="bbb">' + target['data'] + '</span>';
      text = text.replace(re, tagged);
    });
    return text
  }
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
        var target = null;
        rule.targets.forEach(function(elm, index) {
          if (elm.data === tg.dataset.target) {
            target = elm;
            return;
          }
        })
        this.info.name = rule.name;
        this.info.desc = rule.desc;
        this.info.target = target.data;
        this.info.note = target.note;
      }
    },
    filters: {
      check: function (value) {
        var result = '';
        if (!value)
          return;
        result = filter_kanji(value);
        result = filter_saidoku(result);
        return result;
      }
    }
  });
})(this);
