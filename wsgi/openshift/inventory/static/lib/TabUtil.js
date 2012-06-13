/**
 * Created by PyCharm.
 * User: jote
 * Date: 5/10/12
 * Time: 11:51 PM
 * To change this template use File | Settings | File Templates.
 */

define(['dojo',
    'dojo/parser',
    'dijit',
    'lib/dojote',
    'lib/AccordUtil',
    'dojox/widget/Standby'
], function (dojo, parser, dijit, dojote, accordUtil) {

    var singleton = {
        init:function () {
            this.startup();
        },
        startup:function () {
            this.mainTabtainer = dijit.byId('tabber');
        },
        clearAll:function () {
            var i = 0;
            dojo.query('.dijitTabPane').forEach(dojo.hitch(this, function (tab) {
                this.closeLastTab();
            }))
        },
        closeAfterTab:function (tab) {
            var max = this.mainTabtainer.getChildren().length;
            for (var i = 0; i < max; i++) {
                if (this.cekLastTab(tab)) {
                    break;
                }
                this.closeLastTab()
            }
        },
        closeLastTab:function (n) {
            //TODO belum di tes kalo tab berisi widget, misalnya form, apakah widget tersebut ikut di destroy apa nggak.
            var x = 1;
            if (n) {
                x = n;
            }
            var c = dojo.query('.dijitTabPane', this.mainTabtainer.id).length;
            var curpaneidx = 0;
            var closeTabMsg;
            for (var i = 0; i < c; i++) {
                if (i < x) {
                    curpaneidx = c - i - 1
                    var cpane = this.mainTabtainer.getChildren()[curpaneidx];
                    if (cpane) {
                        if (cpane.closeTabMsg) {
                            closeTabMsg = cpane.closeTabMsg;
                        }
                        var disabler = cpane.get('disabler');
                        if (dojote.cekWidget(disabler)) {
                            disabler.destroy();
                        }
                        dojote.killWidgetDescendant(cpane)
                        this.mainTabtainer.removeChild(cpane);
                        cpane.destroy();
                    }
                }
            }
            if (curpaneidx > 0) {
                var lastTab = this.mainTabtainer.getChildren()[curpaneidx - 1];
                if (lastTab) {
                    this.selectTab(lastTab);
                    this.enableTab(lastTab, true);
                    lastTab.set('closable', true);
                    if (lastTab.get('onAfterLayered')) {
                        lastTab.onAfterLayered(closeTabMsg);
                    }
                }
            }
        },
        putinFirstTab:function (judul, isi) {
            this.clearAll();
            return this.putinTab(judul, isi);
        },
        putinTab:function (judul, isi, openMsg) {
            var c = this.mainTabtainer.getChildren().length;
            if (c > 0) {
                var oldTab = this.mainTabtainer.getChildren()[c - 1];
                if (oldTab) {
                    this.enableTab(oldTab, false);
                    oldTab.set('closable', false);
                }
                var newPane = this.putinNewTab(judul, isi, true);
                if (newPane) {
                    if (newPane.onOpened) {
                        newPane.onOpened(openMsg);
                    }
                    if (newPane.onClose) {
                        newPane.set('__bufferOnClose', newPane.onClose);
                        newPane.set('onClose', dojo.hitch(this, function () {
                            if (this.cekLastTab(newPane)) {
                                dojote.killWidgetDescendant(newPane)
                                this.closeLastTab();
                            }
                        }))
                    }
                    this.selectTab(newPane);
                }
                return newPane
            } else {
                return this.putinNewTab(judul, isi, false)
            }
        },
        putinNewTab:function (judul, isi, closable) {
            dojote.clearSideMainPane();
            //create default sider
            dojote.preparePortlet('System Info', 2, 'Enhance window layout to help user-application ' +
                ' interaction made easy', 'defaultSider');
            //reset accordion
            accordUtil.openMenu();
            var cp = new dijit.layout.ContentPane({
                title:judul,
                closable:closable,
                content:isi
            });
            cp.set('buffonclick', cp.onClick);
            this.mainTabtainer.addChild(cp);
            return cp;
        },
        enableTab:function (tab, enable) {
            var tombol = dijit.byId(this.mainTabtainer.id + "_tablist_" + tab.id);
            //recheck onClick Buffer
            if (!tab.get('buffonclick')) {
                tab.set('buffonclick', tombol.onClick);
            }
            var lbl = dojo.query(' .tabLabel', tombol.id)[0];
            var disabler = tab.get('disabler');

            if (enable) {
                dojo.removeClass(lbl, 'tabLabelDisable');
                //tombol.set('onClick', tab.get('buffonclick'));
                //new implementation of disabler
                if (dojote.cekWidget(disabler)) {
                    disabler.destroy();
                }
            } else {
                dojo.addClass(lbl, 'tabLabelDisable');
//            tombol.set('onClick', function () {
//                dojote.notify('Tab ini dalam status disable', 'warning')
//            })
                if (dojote.cekWidget(disabler)) {
                    disabler.show();
                } else {
                    var disabler = new dojox.widget.Standby({color:'white', image:'../site_media/img/spacer_crud.gif'});
                    document.body.appendChild(disabler.domNode);
                    disabler.set('target', tab.domNode);
                    tab.set('disabler', disabler)
                    disabler.startup();
                    disabler.show();
                }
            }
        },
        cekTab:function (tab) {
            if (tab && tab.id && dijit.byId(tab.id)) {
                return true;
            }
            return false;
        }, cekLastTab:function (tab) {
            if (this.cekTab(tab)) {
                var c = this.mainTabtainer.getChildren().length;
                if (this.mainTabtainer.getChildren()[c - 1] == tab) {
                    return true;
                }
            }
            return false;
        },
        selectTab:function (tab) {
            if (this.cekTab(tab)) {
                accordUtil.openMenu();
                this.mainTabtainer.selectChild(tab);
            }
        }
    };
    singleton.init();
    return singleton;
})
