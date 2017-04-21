/* 
- - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Title : Base
Author : Luis Villarreal
Description : Base View class for displaying a Page Model | Created : Friday May 6, 2011
Modified :  Wednesday June 22, 2011
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
*/

App.Views.Base = Backbone.View.extend({
	model: Page,
	comparePageModel: null,
	parentContainer: '#fitGuide',
	tagName: 'div',
	className: 'page-clip',

	events:{
		'mouseenter .silhouette-item' : 'silhouetteMouseEnter',
		'mouseleave .silhouette-item' : 'silhouetteMouseLeave'
	},
	
	/*
	 * Summary:    It will be called when the view is first created.
	 * Parameters:   any options that you would like
	 * Return:       void
	 */
	initialize: function() {
		var viewObj = this;
		// changes the document's <title>
		//$('title').html(this.model.get('title'));
		viewObj.gaEventTracking('view','/fit-guide/'+location.hash);
		
	},
	
	/*
	 * Summary:     Main display function for every view, if not over written when extended it will attempt to append basic data.
	 * Parameters:   none
	 * Return:       void
	 */
	render: function(){
		var viewObj = this;
		var pageModel = this.model;

		this.pageHeader = $('<header id="section-header"/>').html('<h2>Select A Gender</h2>').css('opacity',0);

		this.pageCopy = $('<div class="page-copy"/>');

		$.each(pageModel.get('item'), function(i, item)
		{
			//item.image_path = pageModel.get('image_path');
			//because OneStop is a wimp
			if(item.name === 'mens')
			{
				item.image_path = App.imagePathMens;
			}else{
				item.image_path = App.imagePathWomens;
			}
			//build markup from the model
			var template = $('#tpl-gender-item').html();
			var genderItem = Mustache.render(template, item );
			$(viewObj.pageCopy).append( $(genderItem).css('opacity',0) );
					
		 });
		
		$(this.el).append(this.pageHeader,this.pageCopy);
		
		$(this.parentContainer).append(this.el);
		//style setup for transition
		$('#silhouette-mens').css('left','-200px');
		$('#silhouette-womens').css('left','900px');	
		
		this.transitionIn();
	},

	buildBackButton: function(currentPageModel)
	{
		if(currentPageModel.get('page_id') != 'home')
		{
			var parent_id = currentPageModel.get('parent_id');

			if(this.options.comparePageModel != null)
			{
				var closeBtn = $('<a/>').html('<span>X</span>').attr('id','btn-close').attr('href','#'+this.options.comparePageModel.get('slug'));
				$('#section-header').append($(closeBtn));
				//dont need back in compare when selecting fit
				if(this.model.get('type') != 'gender'){
					var newBackUrl = this.options.comparePageModel.get('compare_url')
					var backBtn = $('<a/>').html('BACK').attr('id','btn-back').attr('href','#'+newBackUrl);
					$('#section-header').append($(backBtn));
				}
				
			}else
			{
				if(parent_id != '')
				{	
					var parentModel = currentPageModel.collection.findWhere({page_id:parent_id});
					if($('#section-header').length)
					{
						var backBtn = $('<a/>').html('BACK').attr('id','btn-back').attr('href','#'+parentModel.get('slug'));
					}
				}else{
					var backBtn = $('<a/>').html('BACK').attr('id','btn-back').attr('href','/fit-guide/#');
				}
				$('#section-header').append($(backBtn));
			}
			
		}

	},

	silhouetteMouseEnter: function(selector)
	{
		$(selector.currentTarget).addClass('active');
		TweenLite.to('.silhouette-item:not(.active) .list-view', .5, { opacity:'0'});
		if($('.silhouette-item > h3').length)
		{
			TweenLite.to('.silhouette-item:not(.active) > h3', .5, { opacity:'.5'});
			TweenLite.to('.silhouette-item:not(.active) > p', .5, { opacity:'.5'});
		}
		if($('.silhouette-item .title-overlay').length)
		{
			TweenLite.to('.silhouette-item:not(.active) .title-overlay', .5, { opacity:'0'});
		}
	},

	silhouetteMouseLeave: function(selector)
	{
		$(selector.currentTarget).removeClass('active');
		TweenLite.to('.silhouette-item .list-view', .5, { opacity:'1'});
		if($('.silhouette-item > h3').length)
		{
			TweenLite.to('.silhouette-item:not(.active) > h3', .5, { opacity:'1'});
			TweenLite.to('.silhouette-item:not(.active) > p', .5, { opacity:'1'});
		}
		if($('.silhouette-item .title-overlay').length)
		{
			TweenLite.to('.silhouette-item:not(.active) .title-overlay', .5, { opacity:'1'});
		}
	},

	touchOptimizing: function(e){
		//disable scrolling when trying to swipe
		e.preventDefault();
		//e.gesture.preventDefault();
	},
	
	/*
	 * Summary:     The start animations for a page. Should be overwritten. Be sure to call transitionInComplete() to let controller know it has finished
	 * Parameters:   none
	 * Return:       void
	 */
	transitionIn: function ()
	{
		var viewObj = this;
		var tl = new TimelineLite({onComplete:viewObj.transitionInComplete, onCompleteParams:[viewObj]});

		tl.to(viewObj.pageHeader, .5, { opacity:'1'})
		.to($('#silhouette-mens'), .75, {left:'140px', ease:Power2.easeOut})
		.to($('#silhouette-womens'), .75, { left:'420px', ease:Power2.easeOut},'-=.75')
		.to($('#silhouette-mens'), 1, { opacity:'1'},'-=.5')
		.to($('#silhouette-womens'), 1, { opacity:'1'},'-=1')
		.from('.silhouette-item h3', .5, { opacity:0},'-=.5');

		/*
		tl.to(viewObj.pageHeader, .5, { opacity:'1'})
		.to($('#silhouette-mens'), .75, {left:'140px', ease:Power2.easeOut})
		.to($('#silhouette-womens'), .75, { left:'420px', ease:Power2.easeOut},'-=.75')
		.to($('#silhouette-mens'), 1.5, { opacity:'1'},'-=.75')
		.to($('#silhouette-womens'), 1.5, { opacity:'1'},'-=1.5')
		.from('.silhouette-item h3', .75, { opacity:0},'-=1');
		*/
	},
	
	/*
	 * Summary:     The start animations for a page. Should be overwritten. Be sure to call transitionOutComplete() to let controller know to transition In the next view
	 * Parameters:   none
	 * Return:       void
	 */
	transitionOut: function()
	{
		var viewObj = this;
		var tl = new TimelineLite({onComplete:viewObj.transitionOutComplete, onCompleteParams:[viewObj]});

		tl.to($('#silhouette-mens'), .5, { opacity:'1',left:'-200'})
		.to($('#silhouette-womens'), .5, { opacity:'1',left:'900px'},'-=.5')
		.to(viewObj.pageHeader, .25, { opacity:'0'});

	},
	
	/*
	 * Summary:     Announces to control Event listener. Shouldn't have to overwrite
	 * Parameters:   none
	 * Return:       void
	 */
	transitionInComplete: function()
	{
		var viewObj = typeof(viewObj) != 'undefined' ? viewObj : this;
		//announce that it has finished transition	
		App.trigger('transitionInComplete');
		//console.log('transitionInComplete');
	},
	
	/*
	 * Summary:      Cleans up previous page and announces to control Event listener. Shouldn't have to overwrite
	 * Parameters:   none
	 * Return:       void
	 */
	transitionOutComplete: function(viewObj){

		var viewObj = typeof(viewObj) != 'undefined' ? viewObj : this;
		//this.undelegateEvents() 
		//deletes element and contents from the DOM
		$(viewObj.el).remove();
		//announce that it has finished transition	
		App.trigger('transitionOutComplete');

		//will delete the view from the DOM, not sure if needed may help with memory,
		//though for views that have loaded dynamic data we might want to keep for cache
		//this.remove()
	},
	

	gaEventTracking: function(action, opt_label){
		//https://developers.google.com/analytics/devguides/collection/gajs/eventTrackerGuide
		if(typeof(_gaq) != 'undefined'){
			_gaq.push(['_trackEvent', 'fit-guide', action, opt_label]);
		}
	}

});