/**
 * 
 */

App.Views.Loader = Backbone.View.extend({
	parentContainer: "#fitGuide",
	className: "loaderView",
	tagName: "div",
	imagesArray: [],
	initialize: function() 
	{
		var viewObj = this;
		this.render();
		
		//empty it!
		viewObj.imagesArray = [];

		//the images are under different objects depending on which model is current
		if(viewObj.model.get('type') === 'style')
		{
			$.each(viewObj.model.get('views'), function(i, img)
			{
				//console.log(viewObj.model.get('image_path'));
				viewObj.imagesArray.push(viewObj.model.get('image_path')+img.url);
			});
		}else if(viewObj.model.get('type') === 'default')
		{
			viewObj.annouceLoadStatus();
		}else
		{
			var childPages = viewObj.model.collection.where({parent_id: viewObj.model.get('page_id'),root_section:viewObj.model.get('root_section') });
			//loop through all children of current models and find thier list images
			$.each(childPages, function(p, item)
			{
				$.each(item.get('images'), function(i, img)
				{
					//console.log(viewObj.model.get('image_path'));
					viewObj.imagesArray.push(viewObj.model.get('image_path')+img.url);
				});
			});
		}

		viewObj.preloadImages(viewObj.imagesArray).done(function(images){
		 //call back codes, for example:
		 //console.log(images.length) //alerts 3
		 //console.log(images[0].src+" "+images[0].width) //alerts '1.gif 220'
		 viewObj.annouceLoadStatus();
		})
    },

	render: function()
	{
		
		$(this.parentContainer).append(this.el);
		
	},

	preloadImages: function(arr)
	{
		var viewObj = this;
	    var newimages=[], loadedimages=0
	    var postaction=function(){}
	    var arr=(typeof arr!="object")? [arr] : arr;
	    function imageloadpost()
	    {
	        loadedimages++
	        if (loadedimages==arr.length)
	        {
	            postaction(newimages); //call postaction and pass in newimages array as parameter
	        }
	    }

	    for (var i=0; i<arr.length; i++){
	        newimages[i]=new Image();
	        newimages[i].src=arr[i];
	        newimages[i].onload=function(){
	            imageloadpost();
	        }
	        newimages[i].onerror=function(){
	            imageloadpost();
	        }
	    }
	    return { //return blank object with done() method
	        done:function(f){
	            postaction=f || postaction //remember user defined callback functions to be called when images load
	            //viewObj.annouceLoadStatus();
	        }
	    }
	},

	annouceLoadStatus: function()
	{
		App.trigger('imagePreloadingComplete');
		this.clearLoader();
	},
	
	clearLoader: function()
	{
		
		//deletes element and contents from the DOM
		$(this.el).remove();
		this.remove()
	}
    
});