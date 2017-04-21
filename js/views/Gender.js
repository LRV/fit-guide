/**
 * 
 */

App.Views.Gender = App.Views.Base.extend({
	model: Page,
	viewCount: 3,
	currentItemPos: 0,
	itemlength:null,
	touchStartPosX: null,
	touchEndPosX: null,
	//el: extended from Base
	//parentContainer: extended from AppView

	events:{
		'mouseenter .silhouette-item:not(.being-compared)' : 'silhouetteMouseEnter',
		'mouseleave .silhouette-item:not(.being-compared)' : 'silhouetteMouseLeave',
		'click .being-compared' : 'diableSilhouette',
		'click #btn-viewport-prev' : 'carouselSlide',
		'click #btn-viewport-next' : 'carouselSlide',
		'touchmove .page-copy' : 'touchOptimizing',
		'swipe .page-copy' : 'carouselSwipe'
		
	},
	
	render: function(){
		var viewObj = this;
		var pageModel = this.model;
		var compareModel = viewObj.options.comparePageModel;
		//for swipe/gesture events
		this.$el.hammer();

		this.pageHeader = $('<header id="section-header"/>');

		//Headers are different for defualt and compare layouts
		if(compareModel != null)
		{
			var titleString = '<h2><span>Compare to '+compareModel.get('name')+'</span> Select A Fit</h2>';
			$(this.pageHeader).addClass('compare-header');
		}else{
			var titleString = '<h2>Select A Fit</h2>';
		}

		$(this.pageHeader).html(titleString).css('opacity',0);
		//end header build

		this.pageCopy = $('<div class="page-copy viewport"/>');

		this.overview = $('<div class="overview"/>');

		var childPages = pageModel.collection.where({parent_id:pageModel.get('page_id')});

		$.each(childPages, function(i, item)
		{

			var pageDataObj = item.toJSON();

			//override slug only when in compareMode
			if(compareModel != null)
			{
				pageDataObj.slug = viewObj.buildCompareSlug(pageDataObj);
			}

			//build markup from the model
			var template = $('#tpl-fit-item').html();
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

	buildCompareSlug: function(pageObj){
		var compareID = this.options.comparePageModel.get('page_id');
		var newSlug = this.model.get('root_section')+'/compare/'+compareID+'/'+pageObj.page_id+'/';
		return newSlug;
	},

	/*
	 * Summary:     Set sizes and lenths of items related to the carousel.
	 * Parameters:   container: html element
	 * Return:       void
	 */
	carouselSetup: function(container)
	{
		this.itemlength = $(container).find('a').length;
		this.itemWidth = parseInt($(container).find('a').outerWidth(true),10);	
		var newWidth = this.itemWidth*this.itemlength;
		$(container).css('width',newWidth+'px');
		//
		if(this.itemlength >= this.viewCount)
		{
			if(this.itemlength > this.viewCount)
			{
				this.btnPrev = $('<div id="btn-viewport-prev" data-dir="prev"><span>prev</span></div>');
				this.btnNext = $('<div id="btn-viewport-next" data-dir="next"><span>next</span></div>');
				$(this.el).append(this.btnPrev,this.btnNext);
			}
		}else
		{
			$(container).css('left',(645-newWidth)/2);
		}
	},

	carouselSlide: function(selector)
	{		
		var activeBtn = $(selector.currentTarget);
		var newLeft = this.carouselDirectionCheck(activeBtn.data('dir'));
		//
		TweenLite.to(this.overview, .5, { left:newLeft});

	},

	carouselSwipe: function(e){
		var newLeft;
		if(this.itemlength > this.viewCount)
		{
			if(e.gesture.direction == 'left'){
				newLeft = this.carouselDirectionCheck('next');
			}else if(e.gesture.direction == 'right'){
				newLeft = this.carouselDirectionCheck('prev');
			}
			TweenLite.to(this.overview, 1, { left:newLeft});
		}
	},

	/*
	 * Summary:     determines position of overview based off button clicked
	 * Parameters:   btn: html object with event attached
	 * Return:       number
	 */
	carouselDirectionCheck: function(stringDirection){
		if(stringDirection == 'next')
		{
			this.currentItemPos++;
			if(this.currentItemPos > (this.itemlength-this.viewCount)){
				this.currentItemPos = 0;
			}
		}
		else if(stringDirection == 'prev')
		{
			this.currentItemPos--;
			if(this.currentItemPos < 0){
				this.currentItemPos = this.itemlength-this.viewCount;
			}
		}

		var newLeft = -(this.currentItemPos*this.itemWidth);

		return newLeft;

	},

	diableSilhouette: function(e){
		e.preventDefault();
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
		.from('#btn-viewport-prev', .75, { opacity:'0'},'-=.5')
		.from('#btn-viewport-next', .75, { opacity:'0'},'-=1');
		*/

		
			
	},
	
	transitionOut: function(){
		var viewObj = this;

		var tl = new TimelineLite({onComplete:viewObj.transitionOutComplete, onCompleteParams:[viewObj]});

		tl.to(viewObj.pageHeader, .2, { opacity:'0'})
		.to(viewObj.pageCopy, .3, { opacity:'0'});
		
	}
	
});