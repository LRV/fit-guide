/* 
- - - - - - - - - - - - - - - - - - - - - - - - - - - - -
Title : Page
Author : Luis Villarreal
Description : Model used for page rendering | Created : Friday May 6, 2011
Modified :  Wednesday June 22, 2011
- - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
*/
Page = Backbone.Model.extend({
	//Create a model to hold Page attributes
	defaults: {
		"name":			null,
		"slug": 		null,
		"title": 		null,
		"nav_level": 	0,
		"parent_id": 	null,
		"childrenCount": 0,
		"isLoaded": 	false,
		"hasRendered": false
	},
	
	initialize: function () {
		var modelObj = this;
		//data from <page> attributes and or assigned to "@attributes" object
		//var modelAttr = modelObj.attributes["@attributes"];
		
		//data manipulation
		//var newTitle = modelObj.get("title").replace("{{ title }}", modelObj.get("title"));
		var modelID = modelObj["id"];

		//check for url override 
		if(this.get("url") != undefined){
			this.set({url:this.get("url")});
		}

		//count children (sub-pages)
		if(this.get("page")){
			this.set({ childrenCount: this.get("page").length });
		}
		if(this.get("type") == 'style')
		{	
			var compareSlugs = this.get('slug').split('/');
			var styleViews = this.get('views');
			//
			this.set({
				compare_url: compareSlugs[0]+'/'+'compare'+'/'+compareSlugs[2]+'/-/',
				//first_view: encodeURIComponent('http://'+location.host+App.imagePath+styleViews[0].url),
				fit:this.get('parent_id')
			});


			//because OneStop is a wimp
			if(this.get('root_section') == 'mens')
			{
				this.set({
					first_view: encodeURIComponent('http://'+location.host+App.imagePathMens+styleViews[0].url)
				});
			}else{
				this.set({
					first_view: encodeURIComponent('http://'+location.host+App.imagePathWomens+styleViews[0].url)
				});
			}
		}

		//because OneStop is a wimp
		if(this.get('root_section') == 'mens')
		{
			this.set({
				image_path: App.imagePathMens,
				video_path: App.videoPathMens
			});
		}else{
			this.set({
				image_path: App.imagePathWomens,
				video_path: App.videoPathWomens
			});
		}

		//set some data for init use
		this.set({
			//id: modelID,
			htmlID: "el-" + this.cid,
			//name: modelObj["name"]
			//image_path: App.imagePath,
			share_description: encodeURIComponent(this.get('short_description')),
			full_url:encodeURIComponent('http://'+location.host+'/fit-guide/#'+this.get('slug'))
		});
		
		//console.log("from INIT(): "+ this.get("title"));
		
	},
	
	/*
	 * is called whenever a model's data is returned by the server, in fetch, and save. 
	 */
	parse: function(resp){
	
		if(this.get("url")){
			this.set({
				content: resp.results
			});
		}else{
			this.set({
				page_header: resp.content["page_header"],
				page_copy: resp.content["page_copy"]
			});
		}
		
	},
	
	/*
	 * usually wouldn't need to do this because the model will create its url() base on collection
	 * only need this to recreate model's url()
	 */
	url: function(){
		//overwriting url() method because current server wont rewrite clean paths
		if(this.get("url") != undefined){
			return this.get("url");
		}else{
			return this.collection.url+"index.php?page="+ this.get("id");
		}
	}

});
