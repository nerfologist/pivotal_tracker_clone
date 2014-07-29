LiteTracker.Views.ProjectShow = Backbone.CompositeView.extend({
  template: JST['project/show'],
  
  attributes: {
    'class': 'project'
  },
  
  initialize: function (options) {
    "use strict";
    var view = this;
    this.listenTo(this.model, 'sync', this.render);
    this.listenTo(this.model.tabs(), 'add', this.addTab);
    
    this.model.tabs().each(function (tab) {
      view.addTab(tab);
    });
  },
  
  events: {
    'click a.tab-button'               : 'toggleTabVisible',
    'sortupdate div#tabs-row'          : 'persistTabOrder',
    'click .btn-create-story'          : 'createStory',
    'click li#nav-destroy-project'     : 'confirmDeleteProject',
    'click button#btn-delete-project'  : 'deleteProject'
  },

  addTab: function (tab) {
    "use strict";
    var tabView = new LiteTracker.Views.TabShow({ model: tab });
    this.addSubview('#tabs-row', tabView);
  },
  
  render: function () {
    "use strict";
    var renderedContent = this.template({ project: this.model });
    this.$el.html(renderedContent);
    
    this.attachSubviews();
    this.updateVisibleTabsAndButtons();
    
    // needs to be called after all DOM elements are in place
    this.setupSortables();
    
    return this;
  },
  
  setupSortables: function () {
    "use strict";
    this.$('#tabs-row').sortable({
      axis: 'x',
      cursor: 'move',
      distance: 5
    });
    
    // tab view's sortable() won't work if we don't fake a model update on tabs
    // to have them re-render. Earlier they were not in the DOM. Don't remove.
    this.model.tabs().each(function (tab) {
      tab.trigger('sync');
    });
  },
  
  persistTabOrder: function (event) {
    "use strict";
    var that = this;
    var $tabColumns = $(event.target).find('.tab-column');
    $tabColumns.each(function (idx) {
      var tabModel = that.model.tabs().sort().get($(this).data('tab-id'));
      tabModel.set('ord', idx);
      tabModel.save();
    });
  },
  
  toggleTabVisible: function (event) {
    "use strict";
    event.preventDefault();
    
    // works for: navbar buttons; tab 'x' buttons (event.target is a span there)
    var $anchor = $(event.target).closest('a');
    
    var $targetTabColumn = $($anchor.data('target'));
    var tabModel = this.model.tabs().get($targetTabColumn.data('tab-id'));
    
    $anchor.closest('li').toggleClass('active');
    $targetTabColumn.toggleClass('hidden');
    
    this.updateVisibleTabsAndButtons();

    // update tab model with new visibility
    tabModel.set('visible', ! $targetTabColumn.hasClass('hidden'));
    tabModel.save();
  },
  
  updateVisibleTabsAndButtons: function () {
    "use strict";
    // resize visible tabs to cover grid space
    var $visibleTabs = this.$('div.tab-column').not('.hidden');
    $visibleTabs.each(function (idx) {
      $(this).removeClass('col-xs-12 col-xs-6 col-xs-4 col-xs-3')
             .addClass('col-xs-' + (12 / $visibleTabs.length));
    });
    
    // update visibility buttons
    var $allTabs = this.$('div.tab-column');
    $allTabs.each(function (idx) {
      if (! $(this).hasClass('hidden')) {
        $($(this).data('target-nav-btn')).addClass('active');
      } else {
        $($(this).data('target-nav-btn')).removeClass('active');
      }
    });
  },
  
  createStory: function (event) {
    "use strict";
    event.preventDefault();
    var params = $(event.target).closest('form').serializeJSON().story;
    
    var $inputField = $('#input-story-title');
    
    if ($.trim(params.title) === '') {
      $inputField.closest('.form-group').addClass('has-error');
      $inputField.attr('placeholder', 'insert story title here');
      $inputField.focus();
      return;
    }
    
    $inputField.closest('.form-group').removeClass('has-error');
    
    var icebox = this.model.tabs().find(function(tab) {
      return tab.get('name') === 'icebox';
    });
    
    var ord = (icebox.stories().length > 0) ?
              _.max(icebox.stories().pluck('ord')) + 1 : 0;
    
    $('#input-story-title').val('');
    
    icebox.stories().create({
      title: params.title,
      tab_id: icebox.id,
      ord: ord
    }, {
      wait: true
    });
  },
  
  confirmDeleteProject: function (event) {
    "use strict";
    event.preventDefault();
    
    $('#projectDeletionModal').modal();
  },
  
  deleteProject: function (event) {
    "use strict";
    event.preventDefault();
    
    $('#projectDeletionModal').modal('hide');
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
    
    this.model.destroy({
      success: function () {
        Backbone.history.navigate('/', { trigger: true });
      }
    });
  }
});