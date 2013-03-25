Ext.define('BSBExt.view.MainViewport', {
    extend: 'Ext.container.Viewport',

    layout: {
        type: 'absolute'
    },

    addStory: function(title, source, published, author, content, url, index) {
      var me = this
      var titleString = "<b>"+title+"</b>" + " - " + (this.currentFeed == "" ? source + " - " : "" )  + published
      var contentString = "<p><font size='4'>"+title+"</font></h3></p> <p><b>"+author+"</b></p>"+content
      var newStory = Ext.create('Ext.panel.Panel', {
          xtype: 'panel',
          layout: 'fit',
          title: titleString,
          html: contentString,
          storyContent: contentString,
          storyURL: url,
          storyIndex: index,
          minHeight: 700,
          hideCollapseTool: true,
          autoScroll: true,
          tools: [{
                    type: 'restore',
                    handler: function(event, target, owner, tool){
                      window.open(owner.ownerCt.storyURL, '_blank')
                    },
                    qtip: "Open Story in New Tab"
                  },
                  {
                    type: 'down',
                    handler: function(event, target, owner, tool){
                      owner.ownerCt.update("<iframe src='"+owner.ownerCt.storyURL+ "' " +
                       "width='"+ owner.ownerCt.getWidth() + "' height='700'></iframe>")
                      // owner.ownerCt.ownerCt.body.scrollTo('top',owner.ownerCt.storyIndex * owner.getHeight(), true);
                    },
                    qtip: "Open Story In Frame"
                  },
                  {
                    type: 'gear',
                    handler: function(event, target, owner, tool){
                      owner.ownerCt.update(owner.ownerCt.storyContent)
                    },
                    qtip: "Normal View"
                  },
                  {
                    type: 'pin',
                    handler: function(event, target, owner, tool){
                      me.markUnread(owner.ownerCt.storyURL, owner.ownerCt)
                    },
                  }
               ],
               listeners: {
                expand: function(){
                  var height = this.header.getHeight();
                  var index = Ext.getCmp("Story").items.items.indexOf(this)
                  this.ownerCt.body.scrollTo('top',index * (height), true)
                  me.markRead(this.storyURL, this)
                }
               }
          });
        Ext.getCmp("Story").add(newStory);
    },

    getActiveStory: function(){
      return Ext.getCmp("Story").child("[collapsed=false]")
    },

    markUnread: function(storyURL, story){
      var me = this;
      Ext.Ajax.request({
          url: 'mark_unread',
          params: {
            url: storyURL
          },
          success: function(response){
            console.log()
            // me.getActiveStory().header.body.dom.parentElement.style.backgroundColor = 'red'
            // me.getActiveStory().header.body.dom.parentElement.style.backgroundImage = 'none'
            story.header.body.setStyle('background-color','#abc7ec');
            // me.getActiveStory().header.body.setStyle('box-shadow','blue');
            // me.getActiveStory().header.body.setStyle('shadow','blue');
            // me.getActiveStory().header.body.setStyle('border-color','blue');
            // me.getActiveStory().header.getEl().applyStyles('box-shadow: red');
            // me.getActiveStory().header.getEl().applyStyles('border-color: red');
            // me.getActiveStory().header.getEl().applyStyles('background-image: none');
              /*var text = response.responseText;
              var obj = Ext.decode(text);
              me.storeObj.loadRawData(obj, false)*/
          }
      });
    },

    markRead: function(storyURL, story){
      Ext.Ajax.request({
          url: 'mark_read',
          params: {
            url: storyURL
          },
          success: function(response){
            story.header.body.setStyle('background-color','#ccddf3');

              /*var text = response.responseText;
              var obj = Ext.decode(text);
              me.storeObj.loadRawData(obj, false)*/
          }
      });
    },

    checkScrollEnd: function(){
      var storyPanel = Ext.getCmp("Story")
      var maxScroll = storyPanel.body.dom.scrollHeight - storyPanel.body.dom.offsetHeight
      if(Ext.getCmp("Story").body.dom.scrollTop >= maxScroll){
              // console.log('moar!')
              this.getMoreStories()
            }
    },

    nextStory: function(){
      var storyCmp = Ext.getCmp("Story")
      var current = storyCmp.child("[collapsed=false]")
      // current.collapse()
      storyCmp.items.items[storyCmp.items.items.indexOf(current) + 1].expand()
      // Ext.getCmp("Story").child("[collapsed=false]").collapse()
    },

    prevStory: function(){
      var storyCmp = Ext.getCmp("Story")

      var current = storyCmp.child("[collapsed=false]")
      storyCmp.items.items[storyCmp.items.items.indexOf(current) - 1].expand()

    },

    reloadFeeds: function(){
      var me = this;
      Ext.Ajax.request({
          url: 'get_feeds',
          success: function(response){
              var text = response.responseText;
              var obj = Ext.decode(text);
              me.storeObj.loadRawData(obj, false)
          }
      });
    },

    loadAllFeeds: function(){
      var me = this;
      Ext.getCmp("Story").removeAll(true)
      this.currentFeed = ""
      Ext.Ajax.request({
        url: 'get_all_stories',
        method: 'GET',
        success: function(response){
            var text = response.responseText;

            // console.log(text)
            var obj = Ext.decode(text);
            // console.log(obj)
            for (var i = 0; i < obj.length; i++) {
              me.addStory(obj[i].title, obj[i].source, obj[i].published, obj[i].author, obj[i].content, obj[i].url, i)
            };
          }
      });
    },

    getMoreStories: function(){
      var me = this

      Ext.Ajax.request({
        url: 'get_more_stories',
        method: 'GET',
        params: {
          storyUrl: Ext.getCmp("Story").items.items[Ext.getCmp("Story").items.length-1].storyURL,
          feedUrl: me.currentFeed
        },
        success: function(response){
            var text = response.responseText;

            // console.log(text)
            var obj = Ext.decode(text);
            for (var i = 0; i < obj.length; i++) {
              me.addStory(obj[i].title, obj[i].source, obj[i].published, obj[i].author, obj[i].content, obj[i].url, i)
            };
          }
      });
    },

    initComponent: function() {
        var me = this;

        var feedStore = Ext.create('Ext.data.JsonStore', {
            storeId:'feedStore',
            fields:['name', 'url'],

            data:{'items':[
                { 'name': 'BSB Loading Feeds'  },
                { 'url': 'BSB.com'  },
            ]},

            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        });
        this.storeObj = feedStore

        Ext.applyIf(me, {
          items: [
            {
                xtype: 'panel',
                x: 190,
                y: 10,
                height: 770,
                width: 820,
                title: 'Story',
                id: 'Story',
                autoScroll: true,
                layout: {
                    type: 'accordion',
                },
                tools: [{
                  type: 'refresh',
                  handler: function(){
                    me.getMoreStories()
                  }
                }],
                resizable: true,
            },
            {
              xtype: 'gridpanel',
              x: 0,
              y: 10,
              height: 600,
              width: 190,
              title: 'Feeds',
              store: feedStore, //Ext.data.StoreManager.lookup('feedStore'),
              autoScroll: true,
              tools: [
              {
                type: 'refresh',
                handler: function(){
                  me.reloadFeeds();
                },
                qtip: "Reload Feeds"
              },
              {
                type: 'plus',
                handler: function(){
                  var addWindow = Ext.create('BSBExt.view.NewFeedWindow')
                  addWindow.show();
                },
                qtip: "New Feed"
              },
              {
                type: 'gear',
                handler: function(){
                  me.loadAllFeeds();
                }
              }
              ],
              columns: [
                  {
                      xtype: 'gridcolumn',
                      width: 186,
                      dataIndex: 'name',
                      text: 'Name',

                  }
              ],
              listeners: {
                itemclick: function( grid, record, item, index, e, eOpts) {
                    // console.log(record.get("url"))
                  me.currentFeed = record.get("url");
                  Ext.getCmp("Story").removeAll(true)
                  Ext.Ajax.request({
                    url: 'get_stories',
                    method: 'GET',
                    params: {
                      // url: record.get("url")
                      url: me.currentFeed
                    },
                    success: function(response){
                      var text = response.responseText;

                      // console.log(text)
                      var obj = Ext.decode(text);
                      // console.log(obj)
                      for (var i = 0; i < obj.length; i++) {
                      // console.log(obj[i].source)
                        me.addStory(obj[i].title, obj[i].source, obj[i].published, obj[i].author, obj[i].content, obj[i].url, i)

                      }
                    }
                  });
                },

                afterrender: function(comp) {
                  Ext.getCmp("Story").body.on("scroll", function(){ me.checkScrollEnd() })
                },

                viewConfig: {

                }
              }
            },
            {
                    xtype: 'cycle',
                    x: 0,
                    y: 610,
                    width: 80,
                    height: 30,
                    showText: true,
                    menu: {
                        xtype: 'menu',
                        width: 60,
                        items: [
                            {
                                xtype: 'menucheckitem',
                                text: 'All',
                            },
                            {
                                xtype: 'menucheckitem',
                                text: 'New',
                            }
                        ]
                    }
                }
          ]
      });

      var map = new Ext.KeyMap({
          target: document,
          // scope: me,
          binding:[{
            key: 'j',
            fn: function(){
              me.nextStory()
            }
          },{
            key: 'k',
            fn: function(){
              // console.log('prev')
              me.prevStory()
            }
          }
          ]
      });

      Ext.Ajax.request({
          url: 'get_feeds',
          success: function(response){
              var text = response.responseText;
              var obj = Ext.decode(text);
              feedStore.loadRawData(obj, false)
          }
      });

        me.callParent(arguments);
    }

});