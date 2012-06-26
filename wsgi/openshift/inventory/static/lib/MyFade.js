/**
 * Created by PyCharm.
 * User: User
 * Date: 6/25/12
 * Time: 4:10 PM
 * To change this template use File | Settings | File Templates.
 */
define(["dijit", "dojo", "dojox", "dojo/require!dojo/fx"], function (dijit, dojo, dojox) {
    dojo.provide("dojox.widget.rotator.MyFade");
    dojo.require("dojo.fx");
    (function (d) {
        function fadeIt(theElement, serial) {
            var neksNode = theElement.next.node;
            d.style(neksNode, {display:"", opacity:0});
            theElement.node = theElement.current.node;

            return d.fx[serial]([d.fadeOut(theElement), d.fadeIn(d.mixin(theElement, {node:neksNode}))]);
        }

        ;
        function slideIt(theElement, serial) {
            var neksNode = theElement.next.node;
            d.style(neksNode, {display:"block", opacity:1});
            theElement.node = theElement.current.node;
            var lbr = d.marginBox(theElement.node).w;
            var atas = d.marginBox(theElement.node).t;
            d.setMarginBox(neksNode, {l:lbr});
            var saEl = {
                node:theElement.node,
                top:0,
                left:(0 - lbr)
            }
            var saNext = {
                node:neksNode,
                top:0,
                left:0
            }

            return d.fx.combine([d.fx.slideTo(d.mixin(theElement, saEl)), d.fx.slideTo(d.mixin(theElement, saNext))]);
        }

        ;


        d.mixin(dojox.widget.rotator, {
            fadeIt:function (myElement) {
                return fadeIt(myElement, "chain");
            }, slidIt:function (myElement) {
                return slideIt(myElement, 'chain');
            } });
    })(dojo);
}); 

