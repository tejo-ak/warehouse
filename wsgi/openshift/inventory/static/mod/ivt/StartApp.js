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
            dojo.subscribe('onMenuPabean', dojo.hitch(this, 'preparePabean'));
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
        },

        preparePabean:function (arg) {
            var arg = (arg) ? arg : {};
            if (!tabUtil.cekTab(this.formPabean)) {
                this.formPabean = tabUtil.putinTab('Home', 'Loading home ...');
                dojote.callXhrPost('/inventory/', {c:'pabean'}, dojo.hitch(this, function (e) {
                    if (tabUtil.cekTab(this.formPabean)) {
                        this.formPabean.set('content', e)
                        this.buildPabean();
                    }
                }))

            } else {
            }
        },
        buildPabean:function () {
            if (dojote.cekWidget(this.formPabean)) {
                var dives = dojo.query('div', this.formPabean.domNode);
                for (var i = 0; i < dives.length; i++) {
                    var cn = dives[i].className;
                    if (cn.indexOf('BC') != -1) {
                        var dv = dives[i]
                        dojo.style(dv, 'cursor', 'pointer');
                        var img = dojo.query('img', dv)[0];
                        if (!this.formPabean['omov' + dv.className])
                            this.formPabean['omov' + dv.className] = dojo.connect(dv, 'onmouseover', dojo.hitch(this, function (e, dv) {
                                var img = e;
                                console.log(img);
                                console.log(e);
                                var imgsrc = img.src;
                                if (imgsrc.indexOf('/images/') != -1) {
                                    var newimgsrc = imgsrc.replace('/images/', '/images_glow/');
                                    img.src = newimgsrc;
                                }
                            }, img))
                        if (!this.formPabean['omou' + dv.className])
                            this.formPabean['omov' + dv.className] = dojo.connect(dv, 'onmouseout', dojo.hitch(this, function (e, dv) {
                                var img = e;
                                console.log(img);
                                console.log(e);
                                var imgsrc = img.src;
                                if (imgsrc.indexOf('/images_glow/') != -1) {
                                    var newimgsrc = imgsrc.replace('/images_glow/', '/images/');
                                    img.src = newimgsrc;
                                }
                            }, img))

                    }
                }

            }
        }
    };
    singleton._init();
    return singleton;

})
