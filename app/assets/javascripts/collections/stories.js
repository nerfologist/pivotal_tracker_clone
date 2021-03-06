(function () {
  'use strict';

  LiteTracker.Collections.Stories = Backbone.Collection.extend({
    model: LiteTracker.Models.Story,

    url: function () {
      return 'api/projects/' + this.tab.project().get('id') + '/stories';
    },

    initialize: function (models, options) {
      this.tab = options.tab;
    },

    comparator: 'ord'
  });

  LiteTracker.Collections.tempStories = new LiteTracker.Collections.Stories([], {
    tab: null
  });
}());
