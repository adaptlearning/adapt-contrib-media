define(function(require) {
	
	var Handlebars = require('handlebars');
	
	var Popup = Backbone.View.extend( {
		
		className: "pop-up",
		parent: "#wrapper",
		template: Handlebars.templates.popup,
		
		initialize: function(){
			this.$parent = $(this.parent);
			_.bindAll(this, "move", "stop");
			this.render();
		},
		
		render: function(){
			var html = this.template(this.model.toJSON());
			this.$el.html(html).appendTo(this.$parent);
			this.setup();
		},
		
		setup: function(){
			this.dimensions = {
				x: this.$el.width(),
				y: this.$el.height()
			};
			this.parentDimensions = {
				x: this.$parent.width(),
				y: this.$parent.height()
			};
			this.parentOffset = {
				x: this.$parent.offset().left,
				y: this.$parent.offset().top
			};
			this.offset = this.$el.offset();
		},
		
		baseEvents: {
			"click .media-component-transcript-close":"close",
			"mousedown .media-component-transcript-title":"mousedown"
		},
		
		addEvents: {
			
		},
		
		events: function(){
			return _.extend({}, this.addEvents, 
				Popup.prototype.baseEvents);
		},
		
		close: function(event){
			event.preventDefault();
			this.remove();
		},
		
		mousedown: function(event){
			event.preventDefault();
			var that = this;
			this.startPos = {
				x: event.pageX,
				y: event.pageY
			};
			this.offset = this.$el.offset();
			this.$parent.on("mousemove", that.move);
		},
		
		move: function(event){
			event.preventDefault();
			this.$parent.on("mouseup mouseleave", this.stop);
			var currentPos = {
				x: (event.pageX - this.startPos.x) + this.offset.left,
				y: (event.pageY - this.startPos.y) + this.offset.top
			};
			with(Math){
				currentPos.x = min(
								max(
									currentPos.x,
									this.parentOffset.x
								), 
								this.parentDimensions.x + this.parentOffset.x - this.dimensions.x 
							);
				currentPos.y = min(
								max(
									currentPos.y,
									this.parentOffset.y
								),
								this.parentDimensions.y + this.parentOffset.y - this.dimensions.y
							);
			}
			this.$el.offset({
				left: currentPos.x,
				top: currentPos.y
			});
		},
		
		stop: function(event){
			this.$parent.off("mouseup mouseleave mousemove");
		}
	});
	
	return Popup;
});