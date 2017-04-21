/**
 * 
 */

App.Views.Fit = App.Views.Gender.extend({
	model: Page,


	render: function()
	{
		var viewObj = this;
		var pageModel = this.model;
		var compareModel = viewObj.options.comparePageModel;
		//for swipe/gesture events
		this.$el.hammer();
		
		this.pageHeader = $('<header id="section-header"/>');

		//Headers are different for defualt and compare layouts
		if(compareModel != null)
		{
			var titleString = '<h2><span>Compare to '+compareModel.get('name')+'</span> Select A Style</h2>';
			$(this.pageHeader).addClass('compare-header');
		}else{
			var titleString = '<h2><span>'+pageModel.get('name')+'</span>Select A Style</h2>';
		}

		$(this.pageHeader).html(titleString).css('opacity',0);
		//end header build

		this.pageCopy = $('<div class="page-copy viewport"/>');

		this.overview = $('<div class="overview"/>');

		
		var childPages = pageModel.collection.where({root_section: pageModel.get('root_section'), parent_id: pageModel.get('page_id')});

		$.each(childPages, function(i, item)
		{

			var pageDataObj = item.toJSON();

			//override slug only when in compareMode
			if(compareModel != null)
			{
				pageDataObj.slug = viewObj.buildCompareSlug(pageDataObj);
				if(item.get('page_id') == compareModel.get('page_id'))
				{
					pageDataObj.compared ='being-compared';
				}

			}

			//build markup from the model
			var template = $('#tpl-style-item').html();
			var fitItem = Mustache.render(template, pageDataObj );
			
			$(viewObj.overview).append( $(fitItem) );
			
		 });

		$(this.pageCopy).append( this.overview );  
				
		$(this.el).append(this.pageHeader,this.pageCopy);
		
		$(this.parentContainer).append(this.el);

		//inherited function
		this.carouselSetup(this.overview);

		this.buildBackButton(pageModel);
		
		this.transitionIn();
	},

	
	transitionIn: function () {
		var viewObj = this;

		var tl = new TimelineLite({onComplete:viewObj.transitionInComplete, onCompleteParams:[viewObj]});

		tl.to(viewObj.pageHeader, .5, { opacity:1})
		.from(viewObj.overview, .75, { left:'900px'},'-=.25')
		.staggerFrom('.silhouette-item',.75,{opacity:0,marginRight:'150px', ease:Power2.easeOut},0,'-=.25')
		.from(viewObj.overview, .5, { width:'5000px'})
		.from('#btn-viewport-prev', .5, { opacity:'0'},'-=.5')
		.from('#btn-viewport-next', .5, { opacity:'0'},'-=1');
		
		/*
		tl.to(viewObj.pageHeader, .5, { opacity:1})
		.from(viewObj.overview, 1, { left:'900px'})
		.staggerFrom('.silhouette-item',.75,{opacity:0,marginRight:'150px', ease:Power2.easeOut},0,'-=.5')
		.from(viewObj.overview, 1, { width:'5000px'})
		.from('#btn-viewport-prev', 1, { opacity:'0'},'-=.5')
		.from('#btn-viewport-next', 1, { opacity:'0'},'-=1');
		*/	
	},
	
	transitionOut: function(){
		var viewObj = this;

		var tl = new TimelineLite({onComplete:viewObj.transitionOutComplete, onCompleteParams:[viewObj]});

		tl.to(viewObj.pageCopy, .3, { opacity:'0'})
		.to(viewObj.pageHeader, .2, { opacity:'0'});
		
	}

	
});