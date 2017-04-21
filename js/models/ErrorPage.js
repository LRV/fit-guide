/**
 * 
 */
ErrorPage = Backbone.Model.extend({
	//Create a model to hold Page attributes
	defaults: {
		"id":           "error",
		"name": 		"errorPage",
		"slug": 		"",
		"htmlID": 		"error",
		"isLoaded":		true
		
	},
	
	initialize: function () {
		
		this.updateType();
		
	},
	
	updateType: function(){
		switch(this.get("type"))
		{
			case "404":
			{
				this.set({
					title: "Page Not Found",
					page_header:"The requested document couldn't be found.",
					page_copy:"<p>Please check the URL</p>"
				});
				break;	
			}
			case "data":
			{
				this.set({
					title: "Page Could Not Load",
					page_header:"Page Could Not Load.",
					page_copy:"<p>The requested page could not load. Please check the URL and try refreshing.</p>"
				});
				break;	
			}
			default:
			{
				this.set({
					title: "Page Not Found",
					page_header:"The requested document couldn't be found.",
					page_copy:"<p>Please check the URL</p>"
				});
				break;	
			}
		}
	}
	
	

});
