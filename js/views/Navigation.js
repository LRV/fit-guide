/**
 * 
 */

App.Views.Navigation = Backbone.View.extend({

	initialize: function()
	{
		this.render();
    },

	render: function()
	{
		var viewObj = this;

		//$('#primary-nav').append(this.navConstructor(this.collection, 0));
		//$('#primary-nav').append(this.breadcrumbConstructor(''));
		
	},
	
	/*
	 * Summary:      Creates mark up for primary navigation along with one level of sub navigation
	 * Parameters:   pageList is collection of pages, nav_level is which level you would like to start building from
	 * Return:       html elements ul > li >a ul > li a
	 */
	navConstructor: function(pageList, nav_level)
	{
		var navContent = $('<ul>');
		
		//build nav_level navigation items
		pageList.each(function(page)
		{
			var pagenav_level = page.get('nav_level');
			var pageChildrenCount = page.get('childrenCount');
			var pageID =  page.get('page_id');
			
			//nav_level should be used to 
			if(pagenav_level == nav_level)
			{
				var template = $('#tpl-primary-nav').html();
				var navItem = Mustache.render(template, page.toJSON() );
			
				//if page has sub pages
				if(pageChildrenCount > 0)
				{
					var subNavContent = $('<ul>');
					
					//use same list
					pageList.each(function(subPage)
					{
						var subPagenav_level = subPage.get('nav_level');
						var subPageParent = subPage.get('parent_id');
						//only worry about one level of nav for now
						/*subPageChildrenCount = subPage.get('childrenCount');*/
						
						//match parent_id with parents' id
						if(subPageParent == pageID)
						{
							var subNavItem = Mustache.render(template,subPage.toJSON());
							
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
	/*
	 * Summary:      Builds bread crumbs navigation based on current page
	 * Parameters:   currentPageModel is Pages model
	 * Return:       nothing
	 */
	breadcrumbConstructor: function(currentPageModel,compareMode)
	{
		var viewObj = this;
		var navContent = $('<ul>');
		var navObj=[]
		var crumbs = new Backbone.Collection([]);

		if(currentPageModel.get('id') != 'home')
		{
			//traverse pages order of page breadcrumbs
			if(currentPageModel.get('parent_id'))
			{
				crumbs = viewObj.locateParent(currentPageModel,crumbs);
			}
			//always add current page last
			crumbs.add([
				{name:currentPageModel.get('name'),
				 slug:currentPageModel.get('slug')}
			]);
			
			//
			navObj.crumbs = crumbs.toJSON();
		}
		var template = $('#tpl-primary-nav').html();
		var navItem = Mustache.render(template, navObj );
		$(navContent).append( $(navItem) );

		if(compareMode)
		{
			$(navContent).append('<li>&gt;</li>');
			$(navContent).append( this.buildCompareCrumb(currentPageModel) );
		}

		$('#fg-primary-nav').html(navContent);

	},

	/*
	 * Summary:      Recursively traverse pages collection
	 * Parameters:   pageModel current or parent model, crumbsCollection is object
	 * Return:       object
	 */
	locateParent: function(pageModel,crumbsCollection)
	{
		var viewObj = this;

		var parentPageModel = this.collection.findWhere({root_section: pageModel.get('root_section'), page_id: pageModel.get('parent_id')});

		if(parentPageModel.get('parent_id'))
		{
			crumbsCollection = viewObj.locateParent(parentPageModel,crumbsCollection);
		}

		crumbsCollection.add([
			{name:parentPageModel.get('name'),
			slug:parentPageModel.get('slug')}
		]);

		return crumbsCollection;
	},

	buildCompareCrumb: function(PageModel)
	{
		return $('<li/>').html('<a href="#'+PageModel.get('compare_url')+'">Compare</a>');
	},

	buildBackButton: function(currentPageModel)
	{
		if(currentPageModel.get('id') != 'home')
		{
			var parent_id = currentPageModel.get('parent_id');
			if(parent_id != '')
			{	
				var parentModel = this.collection.findWhere({id:parent_id});
				if($('#section-header').length)
				{
					var backBtn = $('<a/>').html('BACK').attr('id','btn-back').attr('href',parentModel.get('slug'));
				}
			}else{
				var backBtn = $('<a/>').html('BACK').attr('id','btn-back').attr('href','/fit-guide/#');
			}
			$('#section-header').append($(backBtn));
		}

	},

	/*
	 * Summary:      Set a current-page class to navItem that matches id passed to this function
	 * Parameters:   htmlId is string from model's attribute 'htmlID'
	 * Return:       nothing
	 */
	updateNavigation: function(htmlID){
			
		if(htmlID != 'error')
		{
			var viewObj = this;
	
			$(this.el).find('a').removeClass('current-page');
			
			$('#'+htmlID).addClass('current-page');
			
			//Locate model equal to passed param
			this.pageModel = this.collection.find(function(page) {
				return page.get('htmlID') === htmlID;
			});
			
			if(this.pageModel.get('parent_id') != '')
			{
				this.parrentPageModel = this.collection.find(function(page) {
					return page.get('id') === viewObj.pageModel.get('parent_id');
				})
						
				$('#'+this.parrentPageModel.get('htmlID')).addClass('current-page');
			}
		}
		
	}
    
});