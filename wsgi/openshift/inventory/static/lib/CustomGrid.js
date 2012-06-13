/**
 * Created by PyCharm.
 * User: jote
 * Date: 6/13/12
 * Time: 9:10 AM
 * To change this template use File | Settings | File Templates.
 */
require(['dojo',
    'dojo/_base/declare',
    'dijit/registry',
    'lib/dojote',
    'dojox/grid/DataGrid',
    'dojo/data/ObjectStore',
    'dojo/store/Memory'
],
    function (dojo, declare, dijit, dojote, DataGrid) {
        declare('lib.CustomGrid', DataGrid, {
            postCreate:function () {
                this.inherited('postCreate', arguments);
            }
        })
    })
