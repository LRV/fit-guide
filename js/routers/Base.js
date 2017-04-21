/* 
- - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Title : Base
Author : Luis Villarreal
Description : Base class for routing App | Created : Friday May 6, 2011
Modified :  Wednesday July 6, 2011
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
*/


App.Routers.Base = Backbone.Router.extend({
	  
	pages: null,
	navigationVeiw:null,
	currentPageView: null,
	lastPageView: null,
	loaderView: null,
	currentPageModel: null,
	comparePageModel1: null,
	comparePageModel2: null,
	inCompareMode: false,
	isPagesLoaded: false,
	isFirstRun: true,
	nextPage: '',
	defualtTitle: '',
	
	routes: { 

		
		/*'mens/'                :           'mens',   
		'womens/'              :           'womens',
		'mens/:fit/'           :           'mens',   
		'womens/:fit/'         :           'womens',
		'mens/:fit/:style/'           :    'mens',   
		'womens/:fit/:style/'         :    'womens',*/
		':gender/compare/:style1/:style2/' :  'compareHandeler',
		'*actions'             :          'defaultHandeler' // Backbone will try match the route above first
	
	},
	  
	initialize: function ()
	{
		var routeObj = this;
		
		//Create a Pages Collection when the Router is initialized.
		routeObj.pages = new App.Collections.Pages();
		
		//Events
		App.bind('transitionOutComplete', function() {
			//only transitionIn if page has already been loaded and rendered once already else view with handle when to transition in
			/*
			if(routeObj.currentPageModel.get('isLoaded')){
				//lastPageView has fully transitioned out lets now transition in currentPageView
				routeObj.currentPageView.render();
			}else{
				routeObj.fetchModelData();
			}*/

			//all data is will be loaded init for this fit-guide
			routeObj.currentPageView.render();
		});
		
		App.bind('transitionInComplete', function() {
			//not fully sure what to use it for, but it is here
			 
		});

		App.bind('imagePreloadingComplete', function() {
			//then we can transition in the page.
			 routeObj.pageTransition();
		});
		
		//Load data to populate collection
		$.getJSON(App.dataPath, function(data)
		{
			if(data)
			{
				routeObj.pages.defualtTitle = data.site['title'];
				
				//run through and find pages to populate collection
				routeObj.pages.collectPages(data.site.page);
	            //pages are now all loaded
	            routeObj.isPagesLoaded = true;
	            
	            //build navigation based off of collection
	            routeObj.navigationVeiw = new App.Views.Navigation({ collection: routeObj.pages });
	            //
	            if(routeObj.inCompareMode)
	            {
	            	var compareSlugs = routeObj.nextPage.split('/');
	            	routeObj.compareHandeler(compareSlugs[0],compareSlugs[2],compareSlugs[3]);
	            }else{
	            	routeObj.pageHandeler(routeObj.nextPage);
	            }
	            
			}else{
				routeObj.displayErrorPage('data', true);
			}
	               
	    });

	},

	compareHandeler: function(gender,style1,style2)
	{
		var pageSlug;
		this.inCompareMode = true;
		
		if(this.isPagesLoaded)
		{
			this.comparePageModel1  = this.pages.findWhere({root_section:gender,page_id:style1});

			if(style2 ==='-')
			{
				pageSlug = gender+'/';
				this.pageHandeler(pageSlug);
			}else if(this.pages.findWhere({page_id:style2,type:'fit'}) !== undefined)
			{
				pageSlug = gender+'/'+style2+'/';
				this.pageHandeler(pageSlug);
			}else
			{
				
				this.comparePageModel2  = this.pages.findWhere({root_section:gender,page_id:style2});
				this.currentPageModel = this.comparePageModel1;
				//set up for transition out
				if(!this.isFirstRun)
				{
					this.lastPageView = this.currentPageView;
				}
				this.currentPageView = new App.Views.Compare({ model :  this.comparePageModel1, model2:this.comparePageModel2, id:'compare-content'  });
				//this.pageTransition();
				//loaderView will fire event when all images in the currentPageView have been preloaded.
				this.getLoader();	
			}
			
		}else{
			pageSlug = gender+'/'+'compare/'+style1+'/'+style2+'/';
			//when pages not yet loaded, initialize function will need slug load for first round
			this.nextPage = pageSlug;			
		}

	},

	defaultHandeler: function(pageSlug){
		//clear off any flags that would cause compare mode functionality
		this.inCompareMode = false;
		this.comparePageModel1  = null;
		this.comparePageModel2  = null;
		this.pageHandeler(pageSlug);
	},
	
	/*
	 * Summary:    Once Collection is loaded this chooses model out of our collection based on page slug and then start this.pageTransition()
	 * 			   else set this.nextPage for the initialize() to deal with
	 * Parameters:   pagesSlug is the URI that is pass on hash change
	 * Return:       void
	 */
	pageHandeler: function(pageSlug)
	{
		//forces trailing slashes on uri requests
		var isUriReady = this.uriCheck(pageSlug);
		
		if(this.isPagesLoaded && isUriReady)
		{
			//check for param if on index or other page
			if(pageSlug)
			{
				//Locate model equal to passed param
				this.currentPageModel = this.pages.find(function(page) {
					return page.get('slug') === pageSlug;
				});
				
				//page not found model
				if(this.currentPageModel === undefined)
				{
					//this.displayErrorPage('404', false);
					location.hash ='#'
				}
			}else{
				//select first page in collection as index
				this.currentPageModel = this.pages.first();
			}
			
			//set up for transition out
			if(!this.isFirstRun)
			{
				this.lastPageView = this.currentPageView;
			}
			//pass model into the view to create main content for page
			this.currentPageView = this.pageViewSelector();
			
			//when pages are loaded, every page request will use
			//this.pageTransition();
			//loaderView will fire event when all images in the currentPageView have been preloaded.
			this.getLoader();	
		}else{
			//when pages not yet loaded, initialize function will need slug load for first round
			this.nextPage = pageSlug;
			
		}
		
	},
	
	/*
	 * Summary:    Force trailing slash of URI requests
	 * Parameters:   pagesSlug is the URI that is pass on hash change
	 * Return:       original slug if contains a trailing slash else append trailing slash and reload
	 */
	uriCheck: function(pageSlug)
	{
		var pageSlug = typeof(pageSlug) != 'undefined' ? pageSlug : '';
		if(pageSlug !== null)
		{
			if(pageSlug.length)
			{
				var slugLength = pageSlug.length;
				var lastChar = pageSlug.charAt(slugLength-1);
				
				if(lastChar !== '/' && pageSlug !== '')
				{
					location.hash ='#/'+pageSlug+'/';
					return false;
				}else{
					return true;
				}
			}
		}else{
			return "home/";
		}
	},
	
	/*
	 * Summary:    Chooses view for current PageModel in order to display content of that model
	 * Return:       object pageView to be this.currentPageView
	 */
	pageViewSelector: function()
	{		
		var viewID = this.currentPageModel.get('page_id')+'-content';
		var pageView;	   
		switch(this.currentPageModel.get('type'))
		{
			case 'gender':
			{
				pageView = new App.Views.Gender({ model :  this.currentPageModel, id:viewID, comparePageModel: this.comparePageModel1  });
				break;	
			}
			case 'fit':
			{
				pageView = new App.Views.Fit({ model :  this.currentPageModel, id:viewID, comparePageModel: this.comparePageModel1  });
				break;	
			}
			case 'style':
			{
				pageView = new App.Views.Style({ model :  this.currentPageModel, id:viewID  });
				break;	
			}
			default:
			{
				pageView = new App.Views.Base({ model :  this.currentPageModel, id: viewID });
				break;	
			}
		}
		
		return pageView;
		
	},
	
	/*
	 * Summary:    Kick starts page transition and call our navigation view to update nav with a visual indication as well
	 * Parameters:   none
	 * Return:       void
	 */
	pageTransition: function()
	{
		
		if(this.isFirstRun)
		{
			this.isFirstRun = false;
			//kick start for first load, all transitionIn after listen for event of 'transitionOutComplete'
			//this.fetchModelData();

			//all data is will be loaded init for this fit-guide
			this.currentPageView.render();
		}else{	
			//transition out previous view
			if(this.lastPageView !== null){
				this.lastPageView.transitionOut();
			}
		}
		//update bread crumb navigation 
		if(this.inCompareMode)
	    {
			this.navigationVeiw.breadcrumbConstructor(this.comparePageModel1,true);
		}else{
			this.navigationVeiw.breadcrumbConstructor(this.currentPageModel,false);
		}
			
	},
	
	/*
	 * Summary:     Runs fetch() method for this.currentPageModel
	 * Parameters:   none
	 * Return:       void
	 * TODO: need to also have condition here for pageModels that need refreshing.
	 */
	fetchModelData: function()
	{
		var routeObj = this;		
		routeObj.getLoader();

			this.currentPageModel.fetch({
				success:function(){
					//on data success this.model runs parse() before fetch runs success()
					routeObj.currentPageModel.set({isLoaded: true });
					routeObj.loaderView.clearLoader();
					routeObj.currentPageView.render();
					
				},
				error: function(){
					routeObj.displayErrorPage('data', true);
				}
			});

	},
	
	/*
	 * Summary:     Selects Loader View to display during page load
	 * Parameters:   none
	 * Return:       void
	 */
	getLoader: function()
	{
		//IE wasn't playi8ng nice with preloader when hitting back on browser
		if(navigator.appVersion.indexOf('MSIE 8.0;') === -1){
			this.loaderView = new App.Views.Loader({model:this.currentPageModel});
		}else{
			this.pageTransition();
		}
	},
	
	/*
	 * Summary:     Selects and sets ErrorPage Model to display 
	 * Parameters:   none
	 * Return:       void
	 */
	displayErrorPage: function(type, autoLoad){
		
		this.currentPageModel = this.pages.find(function(page) {
			return page.get('id') === 'error';
		});
		
		//set up model for appropriate error
		if(this.currentPageModel === undefined){
			this.currentPageModel = new ErrorPage({type:type});
			this.pages.add(this.currentPageModel);
		}else{
			this.currentPageModel.set({type:type});
			this.currentPageModel.updateType();
		}
		
		if(autoLoad){
			//pass model into the view to create main content for page
			this.currentPageView = this.pageViewSelector(type);
			
			//when pages are loaded, every page request will use
			this.pageTransition();
		}
		
	}

});