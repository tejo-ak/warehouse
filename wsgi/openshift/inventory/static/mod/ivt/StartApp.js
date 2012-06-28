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
    'lib/dojote',
    'dijit/Tooltip',
    'lib/dojote',
    'lib/MyFade',
    'dojox/widget/rotator/Slide',
    'dojo/fx',
    'dojox/widget/AutoRotator'
], function (dojo, parser, tabUtil, dojote) {

    var singleton = {

        _init:function () {
            this.startup();
        },
        startup:function () {
            this.prepareHome();
            dojo.subscribe('onMenuHome', dojo.hitch(this, 'prepareHome'));
            dojo.subscribe('onMenuPabean', dojo.hitch(this, 'preparePabean'));
            this.buildLogo();
        },

        prepareHome:function (arg) {
            var arg = (arg) ? arg : {};
            if (!tabUtil.cekTab(this.formHome)) {
                this.formHome = tabUtil.putinFirstTab('Home', 'Loading home ...');
                dojote.callXhrPost('/inventory/', {c:'home'}, dojo.hitch(this, function (e) {
                    if (tabUtil.cekTab(this.formHome)) {
                        this.formHome.set('content', e)
                    }
                }))

            } else {
                tabUtil.closeAfterTab(this.formHome)
            }
        },

        buildLogo:function () {
            var s = 'header_application';
            var dvLogo = dojo.query('.' + s)[0];
            var dives = dojo.query('div', dvLogo);
            for (var i = 0; i < dives.length; i++) {
                var cn = dives[i].className;
                if (cn.indexOf('HDR-') != -1) {
                    var dv = dives[i]
                    dv.id = dojote.getUuid().substr(0, 6);
                    dojo.style(dv, 'cursor', 'pointer');
                    var img = dojo.query('img', dv)[0];
                    if (!this['omov' + dv.className])
                        this['omov' + dv.className] = dojo.connect(dv, 'onmouseover', dojo.hitch(this, function (e, dv) {
                            var img = e;
                            var imgsrc = img.src;
                            if (imgsrc.indexOf('/img_hdr/') != -1) {
                                var newimgsrc = imgsrc.replace('/img_hdr/', '/img_hdr_light/');
                                img.src = newimgsrc;
                            }
                        }, img))
                    if (!this['omou' + dv.className])
                        this['omov' + dv.className] = dojo.connect(dv, 'onmouseout', dojo.hitch(this, function (e, dv) {
                            var img = e;
                            var imgsrc = img.src;
                            if (imgsrc.indexOf('/img_hdr_light/') != -1) {
                                var newimgsrc = imgsrc.replace('/img_hdr_light/', '/img_hdr/');
                                img.src = newimgsrc;
                            }
                        }, img))

                }
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
                tabUtil.closeAfterTab(this.formPabean)
            }
        },
        buildPabean:function () {
            if (dojote.cekWidget(this.formPabean)) {
                var dives = dojo.query('div', this.formPabean.domNode);
                for (var i = 0; i < dives.length; i++) {
                    var cn = dives[i].className;
                    if (cn.indexOf('BC') != -1) {
                        var dv = dives[i]
                        dv.id = dojote.getUuid().substr(0, 6);
                        dojo.style(dv, 'cursor', 'pointer');
                        var img = dojo.query('img', dv)[0];
                        if (!this.formPabean['omov' + dv.className])
                            this.formPabean['omov' + dv.className] = dojo.connect(dv, 'onmouseover', dojo.hitch(this, function (e, dv) {
                                var img = e;
                                var imgsrc = img.src;
                                if (imgsrc.indexOf('/images/') != -1) {
                                    var newimgsrc = imgsrc.replace('/images/', '/images_glow/');
                                    img.src = newimgsrc;
                                }
                            }, img))
                        if (!this.formPabean['omou' + dv.className])
                            this.formPabean['omov' + dv.className] = dojo.connect(dv, 'onmouseout', dojo.hitch(this, function (e, dv) {
                                var img = e;
                                var imgsrc = img.src;
                                if (imgsrc.indexOf('/images_glow/') != -1) {
                                    var newimgsrc = imgsrc.replace('/images_glow/', '/images/');
                                    img.src = newimgsrc;
                                }
                            }, img))

                    }
                }

            }
            var tt30 = dojo.query('.BC30-dokumen-css', this.formPabean.domNode)[0];
            var tt27in = dojo.query('.BC27IN-dokumen-css', this.formPabean.domNode)[0];
            var tt27 = dojo.query('.BC27-dokumen-css', this.formPabean.domNode)[0];
            var tt = new dijit.Tooltip({connectId:tt30.id, label:'<span class="siderLabel">' +
                'Export declaration<br/>' +
                'Dokumen deklarasi pabean untuk ekspor barang<br/>' +
                'ke luar daerah pabean Indonesia</span>'})
            var tt27in = new dijit.Tooltip({connectId:tt27in.id, label:'<span class="siderLabel">' +
                'Movement Control<br/>' +
                'Dokumen pelindung perpindahan barang antar TPB<br/>' +
                ' </span>'})
            var tt27 = new dijit.Tooltip({connectId:tt27.id, label:'<span class="siderLabel">' +
                'Movement Control<br/>' +
                'Dokumen pelindung perpindahan barang antar TPB<br/>' +
                ' </span>'})
            if (!this.formPabean.tt30Handler)
                this.formPabean.tt30Handler = dojo.connect(tt30, 'onclick', dojo.hitch(this, function () {
                    //TO DO here

                }))
        }

    };
    singleton._init();
    return singleton;

})
