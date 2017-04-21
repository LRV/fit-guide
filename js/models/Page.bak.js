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
		var modelAttr = modelObj.attributes["@attributes"];
		var modelID = modelAttr["id"];
		//data manipulation
		var newTitle = modelObj.get("title").replace("{{ title }}", modelAttr["title"]);
		
		//construct slug value
		if(modelObj.get("nav_level") > 0 ){
			var newSlug = modelObj.get("parent_id")+"/"+modelID+"/";
		}else{
			var newSlug = modelID+"/";
		}
		
		//check for url override 
		if(modelAttr["url"] != undefined){
			this.set({url:modelAttr["url"]});
		}
		
		//count children (sub-pages)
		if(this.get("page")){
			this.set({ childrenCount: this.get("page").length });
		}
		
		//set some data for init use
		this.set({
			id: modelID,
			htmlID: "navBtn-" + this.cid,
			name: modelAttr["name"],
			slug: newSlug,
			title: newTitle,
			url: modelAttr["url"]
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
