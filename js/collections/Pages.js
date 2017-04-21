/**
 * 
 */
App.Collections.Pages = Backbone.Collection.extend({
	//This is our Pages collection and holds our Page models
	model: Page,
	//url: App.dataPath,
    
    rootSection: null,
	  
	initialize: function (models, options) {
		//this.bind('change:isCurrentPage', options.view.StartPageTransition);
		//Listen for new additions to the collection and call a view function if so

	},
	
	collectPages: function(pageData, pageParent, parentSlug, pageLevel){
		
		var pageParent = typeof(pageParent) != 'undefined' ? pageParent : '';
        var parentSlug = typeof(parentSlug) != 'undefined' ? parentSlug : '';
		var pageLevel = typeof(pageLevel) != 'undefined' ? pageLevel : 0;
		var sectionGender = null;

		var collectObj = this;

		_(pageData).map(function(i)
        {  
        	//add data to object before creating model
           // i['id'] = i['@attributes']['id'];
            i['title'] =encodeURIComponent( Mustache.render(collectObj.defualtTitle, i ));
        	i['parent_id'] = pageParent;
        	i['nav_level'] = pageLevel;
            i['page_id'] = i['name'].replace(' / ','-').toLowerCase();
            i['page_id'] = i['page_id'].replace(' ','-').toLowerCase();

            if(pageLevel > 0 )
            {
                i['slug'] = parentSlug+ i['page_id']+'/';
                i['root_section'] = this.rootSection;
            }else
            {
                 i['slug'] =  i['page_id']+'/';
                 this.rootSection = i['page_id'];
                 i['root_section'] = i['page_id'];
            }
        	//add data to and create model
        	var pageModel = new Page(i);
        	
        	//add model to collection
        	collectObj.add(pageModel);

        	//check for sub-pages
        	if(i.page)
            { 
        		collectObj.collectPages(i.page, i['page_id'],i['slug'], pageLevel+1);
        	}

        });

	}
	
});