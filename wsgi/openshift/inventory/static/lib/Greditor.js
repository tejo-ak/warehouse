/**
 * Created by PyCharm.
 * User: User
 * Date: 6/16/12
 * Time: 6:21 AM
 * To change this template use File | Settings | File Templates.
 */
require([
    "dojo",
    "dojo/_base/declare",
    "dojo/parser",
    "dojo/ready",
    "dijit/_WidgetBase" ,
    "dojo/dom-construct",
    "dijit/_Templated" ,
    "lib/dojote",
    "dijit/form/Button" ,
    "dojox/grid/DataGrid",
    "dijit/_FocusMixin",
    'dojo/data/ObjectStore',
    'dojo/store/Memory'

], function (dojo, declare, parser, ready, _WidgetBase, domConstruct, _Templated, dojote) {

        declare("lib.Greditor", [_WidgetBase, _Templated, dijit._FocusMixin], {
            templateString:"<div><div class='greditorPanelContainer'><a>panel/pagination</a></div><div class='gridPan'></div></div>",
            widgetsInTemplate:true,
            structure:[],
            postCreate:function () {
                this.inherited('postCreate', arguments);
                this.gridPanel = dojo.query('.greditorPanelContainer', this.domNode)[0];
                this.gridPan = dojo.query('.gridPan', this.domNode)[0];
                //prepare grid
                var id = 'grid_' + dojote.getUuid().substr(0, 6).toLowerCase();
                var dvGrid = dojo.doc.createElement('div');
                dvGrid.id = id;
                dojo.style(dvGrid, 'height', '100%');
                this.gridPan.appendChild(dvGrid);
                console.log(this.structure)
                this.grid = new dojox.grid.DataGrid({structure:this.structure,
                        store:new dojo.data.ObjectStore({objectStore:new dojo.store.Memory({data:[]})})}
                    , id);
                this.grid.startup();


            },
            setStore:function (store) {
                if (dojote.cekWidget(this.grid)) {
                    this.grid.setStore(store)
                }
            },
            setJStore:function (jstore) {
                if (dojote.cekWidget(this.grid)) {
                    this.grid.setStore(new dojo.data.ObjectStore({objectStore:new dojo.store.Memory({data:jstore})}))
                }

            }
        })
    }
)
