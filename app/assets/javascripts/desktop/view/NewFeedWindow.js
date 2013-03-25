/*
 * File: app/view/NewFeed.js
 *
 * This file was generated by Sencha Architect version 2.1.0.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Ext JS 4.1.x library, under independent license.
 * License of Sencha Architect does not include license for Ext JS 4.1.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('BSBExt.view.NewFeedWindow', {
    extend: 'Ext.window.Window',

    height: 83,
    width: 438,
    title: 'New Feed',

    initComponent: function() {
        var me = this;

        Ext.applyIf(me, {
            items: [
                {
                    xtype: 'textfield',
                    id: 'feedUrl',
                    width: 425,
                    fieldLabel: 'Feed URL'
                },
                {
                    xtype: 'button',
                    width: 58,
                    text: 'Add',
                    handler: function(){
                      Ext.Ajax.request({
                          url: 'add_feed',
                          method: 'GET',
                          params: {
                            feedurl: Ext.getCmp('feedUrl').getValue()
                          },
                          success: function(response){
                              // var text = response.responseText;
                              // var obj = Ext.decode(text);
                              // Ext.Msg.alert(text)
                              // var msg = [
                              //   {
                              //   name: "bla"
                              //   }
                              // ]
                              // me.storeObj.loadRawData(obj, false)
                              // process server response here
                          }
                      });
                      this.ownerCt.close();
                    }
                }
            ]
        });

        me.callParent(arguments);
    }

});