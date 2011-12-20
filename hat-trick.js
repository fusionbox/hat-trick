;(function(exports){

  var HatTrick = exports.HatTrick = {};


  var Person = HatTrick.Person = Backbone.Model.extend({

  });


  var Hat = Backbone.Collection.extend({
    model: Person
  , localStorage: new Store('Hat')

  , pickAndRemoveOne: function() {
      // TODO: Add some random juice.
      var length = this.length
        , randIndex = Math.floor(Math.random() * length)
        , model = this.models[randIndex]
        ;
      
      model.destroy();
      return model;
    }
  });

  _.extend(Backbone.View.prototype, {
    /**
     * Adds a method for killing zombies.
     *
     * Based on Derick Bailey's blog post:
     * http://lostechies.com/derickbailey/2011/09/15/zombies-run-managing-page-transitions-in-backbone-apps/
     */
    close: function() {
      this.remove();
      this.unbind();
      this.onClose();
    }

  , init: function() {
      _.bindAll(this, 'close');
    }

  , onClose: function() {}

  , _ensureElement : function() {
      if (!this.el) {
        var attrs = this.attributes || {};
        if (this.id) attrs.id = this.id;
        if (this.className) attrs['class'] = this.className;
        this.el = this.make(this.tagName, attrs);
        this.$el = $(this.el);
      } else if (_.isString(this.el)) {
        this.$el = $(this.el);
        this.el = this.$el[0];
      }

      this.init();
    }
  });

  var PersonView = Backbone.View.extend({
    tagName: 'li'
  , className: 'person'
  , events: {
      'click .delete': 'delete'
    }

  , initialize: function() {
      this.model.bind('destroy', this.close);
    }

  , render: function() {
      this.$el.html(this.model.get('name') + ' <span class="delete">x</span>');

      return this;
    }

  , 'delete': function() {
      this.model.destroy();
    }
  });

  var FeatureView = HatTrick.FeatureView = Backbone.View.extend({
    tagName: 'article'
  , className: 'chosenOne'

  , render: function() {
      this.$el.html('<h2>' + this.model.get('name') + '</h2>');

      return this;
    }
  });

  var HatView = HatTrick.HatView = Backbone.View.extend({
    el: '#hat'
  , events: {
      'submit form': 'handleForm'
    , 'click .pick': 'pick'
    }

  , initialize: function() {
      _.bindAll(this, 'addOne', 'addAll');
      this.hat = new Hat();

      this.hat.bind('add', this.addOne);
      this.hat.bind('reset', this.addAll);
      
      this.hat.fetch();
    }

  , addAll: function() {
      this.hat.each(this.addOne);
    }

  , addOne: function(model) {
      var view = new PersonView({model: model});

      this.$('.people').append(view.render().el);
    }
  
  , handleForm: function(event) {
      event.preventDefault();
      
      var form = event.target
        , person = this.hat.create({name: form.name.value})
        ;

      form.name.value = '';
    }

  , pick: function() {
      if ( this.hat.length == 0 )  return;

      var model = this.hat.pickAndRemoveOne()
        , feature = new FeatureView({model: model})
        ;

      this.$('.feature')
        .html(feature.render().el)
        .addClass('dazzle');
    }
  });
})(this);
