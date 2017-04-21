/**
 * 
 */

App.Views.Compare = App.Views.Style.extend({
	model: Page,
	model2: Page,
	currentView2:null,
	viewItem2:null,
	//el: extended from Base
	//parentContainer: extended from AppView

	events:{
		'click .view-spot'           :   'spotToggler',
		'click #btn-view-prev'     :   'slideshowSwitch',
		'click #btn-view-next'     :   'slideshowSwitch',
		'click #style-nav > ul >li'  :   'navAccordion',
		'touchmove .page-copy' : 'touchOptimizing',
		'swipe .page-copy' : 'slideshowSwipe'
	},
	
	render: function(){
		var viewObj = this;
		var pageModel = this.model.toJSON();
		var pageModel2 = this.options.model2.toJSON();
		//for swipe/gesture events
		this.$el.hammer();

		//needed to swap urls for when wanting to select a new item to compare against
		pageModel.new_compare = pageModel2.compare_url;
		pageModel2.new_compare = pageModel.compare_url;
		
		this.pageCopy = $('<div class="page-copy"/>');

		var template = $('#tpl-compare-item').html();
		$(this.pageCopy).append(Mustache.render(template, pageModel ));
		$(this.pageCopy).append(Mustache.render(template, pageModel2 ));

		$(this.pageCopy).append($('#tpl-compare-view-nav').html());

		$(this.el).append(this.pageCopy);
		
		$(this.parentContainer).append(this.el);
		
		this.slideshowlSetup();

		this.transitionIn();
	},

	slideshowlSetup: function()
	{
		
		this.viewItem =$('#compare-'+this.model.get('htmlID')+' .view-container .view-item');
		this.viewItem2 =$('#compare-'+this.options.model2.get('htmlID')+' .view-container .view-item');
		this.itemlength = $(this.viewItem).length;

		$(this.viewItem).css('opacity',0);
		$(this.viewItem2).css('opacity',0);
		this.currentView = $(this.viewItem).eq(this.currentItemPos);
		this.currentView2 = $(this.viewItem2).eq(this.currentItemPos);
		this.currentView.addClass('current-view');
		this.currentView2.addClass('current-view');
		this.currentView.css('opacity',1);
		this.currentView2.css('opacity',1);
		this.btnPrev = $('#btn-view-prev');
		this.btnNext = $('#btn-view-next');

	},

	slideshowSwitch: function(selector)
	{
		var activeBtn = $(selector.currentTarget);
		this.slideshowDirectionCheck(activeBtn.data('dir'));
		//
		this.currentView.removeClass('current-view');
		this.currentView2.removeClass('current-view');
		TweenLite.to(this.currentView, .5, { opacity:0});
		TweenLite.to(this.currentView2, .5, { opacity:0});

		//
		this.currentView = $(this.viewItem).eq(this.currentItemPos);
		this.currentView2 = $(this.viewItem2).eq(this.currentItemPos);
		this.currentView.addClass('current-view');
		this.currentView2.addClass('current-view');
		TweenLite.to(this.currentView, .5, { opacity:1});
		TweenLite.to(this.currentView2, .5, { opacity:1});

	},

	slideshowSwipe: function(e){
		var newLeft;
		if(e.gesture.direction == 'left'){
			newLeft = this.slideshowDirectionCheck('next');
		}else if(e.gesture.direction == 'right'){
			newLeft = this.slideshowDirectionCheck('prev');
		}
		//
		this.currentView.removeClass('current-view');
		this.currentView2.removeClass('current-view');
		TweenLite.to(this.currentView, .5, { opacity:0});
		TweenLite.to(this.currentView2, .5, { opacity:0});
		//
		this.currentView = $(this.viewItem).eq(this.currentItemPos);
		this.currentView2 = $(this.viewItem2).eq(this.currentItemPos);
		this.currentView.addClass('current-view');
		this.currentView2.addClass('current-view');
		TweenLite.to(this.currentView, .5, { opacity:1});
		TweenLite.to(this.currentView2, .5, { opacity:1});
	},
	
	transitionIn: function () {
		var viewObj = this;
		var tl = new TimelineLite({onComplete:viewObj.transitionInComplete, onCompleteParams:[viewObj]});

		tl.from('.view-container', 1.5, { opacity:0, ease:Power2.easeOut})
		.from('.compare-detail-column', 1, { opacity:0}, "-=.5")
		.from('.view-item .view-spot', .5, { opacity:0}, "-=.5");;
			
	},
	
	transitionOut: function(){
		var viewObj = this;
		var tl = new TimelineLite({onComplete:viewObj.transitionOutComplete, onCompleteParams:[viewObj]});

		tl.to(viewObj.pageCopy, .7, { opacity:'0'});
	}
	
});