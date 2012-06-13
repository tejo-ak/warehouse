/**
 * Created by PyCharm.
 * User: jote
 * Date: 5/10/12
 * Time: 11:51 PM
 * To change this template use File | Settings | File Templates.
 */

define(['dojo',
    'dojo/parser',
    'dijit/registry',
    'lib/dojote',
    'lib/LookupParam',
//    'lib/LookupTextbox',
    'lib/DetailView'
], function (dojo, parser, dijit, dojote) {

    var singleton = {
        init:function () {
            this.startup();
        },
        startup:function () {
            this.accordion = dijit.byId('accordion');

        },
        openLookup:function (params, onLookup, initialParam) {
            var y = this.accordion.getChildren()[1];
            this.accordion.selectChild(y);
            if (params && params.length) {
                dojote.killWidgetDescendant(y);
                var par = {structure:params};
                if (initialParam) {
                    par.initialParam = initialParam
                }
                var param = new lib.LookupParam(par);
                dojo.connect(param, 'onLookup', onLookup);
                y.set('content', param);
                if (param.firstFocusObject) {
                    param.firstFocusObject.focus();
                }
                this.param = param;
                return param;
            } else {
                this.openMenu();
            }


        }, openMenu:function () {
            var x = dijit.byId('accordion');
            var members = x.getChildren();
            for (var i = 1; i < members.length; i++) {
                var z = x.getChildren()[i];
                dojote.killWidgetDescendant(z);
            }
            var y = x.getChildren()[0];
            x.selectChild(y);
        }
    }
    singleton.init();
    return singleton;
})