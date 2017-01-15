(function (global) {
  'use strict';
  /**
  * obj1にobj2のプロパティを追加する
  */
  function extend(obj1, obj2) {
    for (var key in obj2) {
      obj1[key] = obj2[key];
    }
  }
  /**
  * 編集ルールjsonをパースする
  */
  function parseRules(json) {
    // TODO: パース後のデータ構造をrules.jsと同じにする
    return json[0];
  }
  /**
  * 編集ルールを取得してappに設定する
  */
  function getRules(app) {
    var request = global.superagent;
    request.get("json/rules.json").end(function (err, res) {
      app.rules = parseRules(res.body);
      app.loaded = true;
    });
  }
  /**
  * 検索ヒットした語句の要素を作成する
  */
  function createFoundElement(rule, word) {
    var span = global.document.createElement('span');
    span.className = 'found';
    span.dataset.rule = rule;
    span.dataset.word = word;
    span.textContent = word;
    return span;
  }
  /**
  * 置換用のプレースホルダーを管理
  */
  var getPlaceHolder = (function () {
    var count = -1;
    return {
      get: function () {
        count += 1;
        return '<' + count + '>';
      },
      reset: function () {
        count = -1;
      }
    };
  })();
  /**
  * ルール適用の前準備
  */
  function preRuleMapper(rules, rule, text, placeHolderMap) {
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
  /**
  * テキストにルールを適用する
  */
  function ruleMapper(text, placeHolderMap) {
    for (var key in placeHolderMap) {
      var re = new RegExp(key, 'g');
      text = text.replace(re, placeHolderMap[key])
    }
    return text
  }
  /**
  * 改行コードをbrタグで置換する
  */
  function replaceReturnCode(text) {
    return text.replace(/\n/g, '<br>');
  }
  var app = new Vue({
    el: '#app',
    data: {
      input: '',
      info: {},
      rules: null,
      loaded: false
    },
    methods: {
      showMessage: function (event) {
        var target = event.target;
        if (target.className !== 'found') {
          this.info = {};
          return;
        }
        var rule = this.rules[target.dataset.rule];
        var word = target.dataset.word;
        var wardInfo = rule.words[word];
        this.info = {
          name: rule.name,
          desc: rule.desc,
          word: target.dataset.word,
          sub: wardInfo.sub,
          examples: wardInfo.examples
        };
      }
    },
    filters: {
      check: function (value) {
        var placeHolderMap = {};
        getPlaceHolder.reset();
        if (!value)
          return;
        var rules = ['kanji1', 'kanji2', 'saidoku', 'kana3', 'kana2', 'kana1'];
        rules.forEach(function (rule) {
          value = preRuleMapper(this.rules, rule, value, placeHolderMap);
        }, this);
        value = ruleMapper(value, placeHolderMap);
        value = replaceReturnCode(value);
        return value;
      }
    }
  });
  // 編集ルールを設定する
  getRules(app);
})(this);
