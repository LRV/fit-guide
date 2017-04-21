/**
 * 
 */

App.Views.Style = App.Views.Base.extend({
	model: Page,
	currentItemPos: 0,
	currentView:null,
	viewItem:'.view-container .view-item',
	//el: extended from Base
	//parentContainer: extended from AppView
	events:{
		'click .view-spot'           :   'spotToggler',
		'click #btn-view-prev'     :   'slideshowSwitch',
		'click #btn-view-next'     :   'slideshowSwitch',
		'click #style-nav .fit-nav-row'  :   'navAccordion',
		'click #size-chart': 'sizeChartShow',
		'swipe #style-view-column' : 'slideshowSwipe',
		'touchmove .page-copy' : 'touchOptimizing'
	},
	
	render: function()
	{
		var viewObj = this;
		var pageModel = this.model;
		//for swipe/gesture events
		this.$el.hammer();

		this.pageCopy = $('<div class="page-copy"/>');

		var pageData = pageModel.toJSON();

		//size chart resize
		if(pageData.root_section =='womens'){
			pageData.sc_width = 490;
		}else{
			pageData.sc_width = 560;
		}

		//build markup from the model
		var template = $('#tpl-style-detail').html();
		var styleItem = Mustache.render(template,pageData );
			
		$(viewObj.pageCopy).append( $(styleItem) );

		$(this.el).append(this.pageCopy).addClass('style-clip');
		
		$(this.parentContainer).append(this.el);

		$('#style-nav').append(this.navConstructor());
		//
		$('#facebook-image').attr('content',pageData.first_view);

		//set heights for #style-nav items
		var newHeight =$('#style-nav .fit-nav-row.active').find('ul').outerHeight() + 15;
		$('#style-nav .fit-nav-row.active').css('height',newHeight);

		this.slideshowlSetup();
		this.videoSetup();
		this.transitionIn();
	},

	navConstructor: function()
	{
		var viewObj = this;
		var navContent = $('<ul>');
		var nav_level = 1;

		var pageList = viewObj.model.collection.where({root_section:this.model.get('root_section')});
		//var pageList = this.model.collection;
		//build nav_level navigation items
		$.each(pageList, function(i, page)
		{
			var pagenav_level = page.get('nav_level');
			var pageChildrenCount = page.get('childrenCount');
			var pageID =  page.get('page_id');

			//nav_level should be used to 
			if(pagenav_level == nav_level)
			{
				var template = $('#tpl-style-nav').html();
				var navItem = $('<li class="fit-nav-row">').append('<span>'+page.get('name')+'</span>');

				//if page has sub pages
				if(pageChildrenCount > 0)
				{
					var subNavContent = $('<ul>');
					
					//use same list
					$.each(pageList, function(s, subPage)
		{
						var subPagenav_level = subPage.get('nav_level');
						var subPageParent = subPage.get('parent_id');
						//only worry about one level of nav for now
						/*subPageChildrenCount = subPage.get('childrenCount');*/
						
						//match parent_id with parents' id
						if(subPageParent == pageID)
						{
							var subNavItem = $('<li>').append(Mustache.render(template,subPage.toJSON()));
							
							if(viewObj.model.get('slug') == subPage.get('slug'))
							{
								$(navItem).addClass('active');
								$(subNavItem).addClass('active');
							}
							//
							$(subNavContent).append( $(subNavItem) );
						}
	
					});//end each subPage	
					
					$(navItem).append( $(subNavContent) );

				}//end if pageChildrenCount
				$(navContent).append( $(navItem) );
					
			}//end if nav_level
			
		});//end each page
		

		return $(navContent);

	},
	videoSetup:function()
	{
		var pageModel = this.model;
		var viewObj = this;
		if(!fitVid){
			var fitVid = _V_("fit-video");
		}
		//
		$("#btn-video").bind("click", function() {
			$("#fit-video-container").fadeIn(500);
			fitVid.play();
			viewObj.gaEventTracking('video-play',pageModel.get('name'));
		});

		$("#fit-video-overlay").bind("click", function() {
			fitVid.pause();
		});

		$("#fit-video-pause-overlay").bind("click", function() {
			fitVid.play();
		});

		$("#fit-video-close-button").bind("click", function() {
			$("#fit-video-container").fadeOut(500, function() {
				$("#fit-video-pause-overlay").hide();
				fitVid.pause();
				fitVid.currentTime(0);
			});
		});

		fitVid.addEvent("pause", function() {
			$("#fit-video-overlay").hide();
			$("#fit-video-pause-overlay").fadeIn(500);
			$("#fit-video-pause-overlay-play-btn").delay(500).fadeIn(500);
		});

		fitVid.addEvent("play", function() {
			$("#fit-video-overlay").show();
			$("#fit-video-pause-overlay").fadeOut(500, function() {
				$(this).hide();
				$("#fit-video-pause-overlay-play-btn").hide();
			});
		});

		//
		fitVid.src([
			{ type: "video/mp4", src: pageModel.get('video_path')+pageModel.get('video_url_mp4') },
			{ type: "video/webm", src: pageModel.get('video_path')+pageModel.get('video_url_webm') },
			{ type: "video/ogg", src: pageModel.get('video_path')+pageModel.get('video_url_ogv') }
		]);
	},

	slideshowlSetup: function()
	{
		this.itemlength = $(this.viewItem).length;
		$(this.viewItem).css('opacity',0);
		this.currentView = $(this.viewItem).eq(this.currentItemPos);
		this.currentView.addClass('current-view');
		this.currentView.css('opacity',1);
		this.btnPrev = $('#btn-view-prev');
		this.btnNext = $('#btn-view-next');

	},

	slideshowSwitch: function(selector)
	{
		var activeBtn = $(selector.currentTarget);
		this.slideshowDirectionCheck(activeBtn.data('dir'));
		//
		this.currentView.removeClass('current-view');
		TweenLite.to(this.currentView, .5, { opacity:0});
		//
		this.currentView = $(this.viewItem).eq(this.currentItemPos);
		this.currentView.addClass('current-view');
		TweenLite.to(this.currentView, .5, { opacity:1});

	},

	slideshowSwipe: function(e){
		var newLeft;

		e.preventDefault();
		if(e.gesture.direction == 'left'){
			newLeft = this.slideshowDirectionCheck('next');
		}else if(e.gesture.direction == 'right'){
			newLeft = this.slideshowDirectionCheck('prev');
		}
		//
		this.currentView.removeClass('current-view');
		TweenLite.to(this.currentView, .5, { opacity:0});
		//
		this.currentView = $(this.viewItem).eq(this.currentItemPos);
		this.currentView.addClass('current-view');
		TweenLite.to(this.currentView, .5, { opacity:1});
	},

	slideshowDirectionCheck: function(stringDirection){
		if(stringDirection === 'next')
		{
			this.currentItemPos++;
			if(this.currentItemPos > (this.itemlength-1)){
				this.currentItemPos = 0;
			}
		}
		else if(stringDirection === 'prev')
		{
			this.currentItemPos--;
			if(this.currentItemPos < 0){
				this.currentItemPos = this.itemlength-1;
			}
		}

	},

	spotToggler: function(selector)
	{
		$(selector.currentTarget).toggleClass('active');
	},
	navAccordion: function(selector)
	{
		var activeItem =  $(selector.currentTarget);
		var siblings = activeItem.siblings();
		var newHeight = activeItem.find('ul').outerHeight() + 15;
		siblings.removeClass('active');
		activeItem.addClass('active');

		TweenLite.to(siblings, .5, { height:15});
		TweenLite.to(activeItem, .5, { height:newHeight});
	},
	sizeChartShow: function(e){
		e.preventDefault();
		//console.log(e.currentTarget.href);
		tb_show('', e.currentTarget.href);
	},
	
	transitionIn: function () {
		var viewObj = this;
		var tl = new TimelineLite({onComplete:viewObj.transitionInComplete, onCompleteParams:[viewObj]});

		tl.from('.view-item.current-view', .75, { opacity:0,left:'400px', ease:Power2.easeOut})
		.staggerFrom('#style-detail-column *',.75,{opacity:0}, 0, "-=.25")
		.from('#view-nav', .5, { opacity:0}, "-=.5")
		.from('#style-controls', .25, { opacity:0}, "-=.5")
		.from('#style-measurements', .25, { opacity:0}, "-=.5")
		.from('.view-item .view-spot', .25, { opacity:0}, "-=.5");
		/*
		tl.from('.view-item.current-view', .75, { opacity:0,left:'400px', ease:Power2.easeOut})
		.staggerFrom('#style-detail-column *',1,{opacity:0}, 0, "-=.5")
		.from('#view-nav', .5, { opacity:0}, "-=.5")
		.from('#style-controls', .5, { opacity:0}, "-=.5")
		.from('#style-measurements', .5, { opacity:0}, "-=.5")
		.from('.view-item .view-spot', .5, { opacity:0}, "-=.5");
		*/
			
	},
	
	transitionOut: function(){
		var viewObj = this;
		var tl = new TimelineLite({onComplete:viewObj.transitionOutComplete, onCompleteParams:[viewObj]});

		$("#fit-video-close-button").trigger('click');

		tl.to(viewObj.pageCopy, .5, { opacity:'0'});
		
	}
	
});