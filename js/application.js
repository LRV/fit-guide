var App = {
    imagePathMens:null,
    imagePathWomens:null,
    videoPathMens:null,
    videoPathWomens:null,
    dataPath:null,
    Views: {},
    Routers: {},
    Collections: {},
    init: function() {
    	_.extend(this, Backbone.Events);
        new App.Routers.Base();
        Backbone.history.start({root: '/fit-guide/'});
        //if using htmlPush
       // Backbone.history.start({pushState: true, root: "/backbone/"});
    }
};
