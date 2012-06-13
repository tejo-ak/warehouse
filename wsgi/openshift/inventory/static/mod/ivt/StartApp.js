/**
 * Created by PyCharm.
 * User: jote
 * Date: 6/7/12
 * Time: 5:04 PM
 * To change this template use File | Settings | File Templates.
 */
define(['dojo',
    'dojo/parser',
    'lib/TabUtil',
    'lib/dojote'
], function (dojo, parser, tabUtil, dojote) {

    var singleton = {

        _init:function () {
            this.startup();
        },
        startup:function () {
            this.prepareHome();
            dojo.subscribe('onMenuHome', dojo.hitch(this, 'prepareHome'));
        },

        prepareHome:function (arg) {
            var arg = (arg) ? arg : {};
            if (!tabUtil.cekTab(this.formHome)) {
                this.formHome = tabUtil.putinTab('Home', 'Loading home ...');
                dojote.callXhrPost('/inventory/', {c:'home'}, dojo.hitch(this, function (e) {
                    if (tabUtil.cekTab(this.formHome)) {
                        this.formHome.set('content', e)
                    }
                }))

            } else {
            }
        }
    };
    singleton._init();
    return singleton;

})
