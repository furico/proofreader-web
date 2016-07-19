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
    rules['kanji'].forEach(function(kanji, index) {
      var re = new RegExp(kanji, 'g');
      var tagged = '<span class="found">' + kanji + '</span>';
      text = text.replace(re, tagged);
    });
    return text
  }
  function filter_saidoku(text) {
    var rules = get_rules();
    rules['saidoku'].forEach(function(saidoku, index) {
      var re = new RegExp(saidoku, 'g');
      var tagged = '<span class="found">' + saidoku + '</span>';
      text = text.replace(re, tagged);
    });
    return text
  }
  Vue.filter('check', function (value) {
    var result = '';
    if (value) {
      result = filter_kanji(value);
      result = filter_saidoku(result);
      return result;
    }
  })
  new Vue({
    el: '#editor',
    data: {
      input: ''
    }
  });
})(this);
