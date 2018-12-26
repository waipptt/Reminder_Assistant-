;
if (window.LoveSeller == undefined || window.LoveSeller == null) {
    window.LoveSeller = navigator.LoveSeller = {};
    (function(LoveSeller) {
        var socketURL = 'ws://localhost:1234';
        var curUserNick = localStorage.getItem("usernick");
        var inportQNHeads = ['https://g.alicdn.com/sj/lib/jquery/dist/jquery.min.js?qntag=11',
            'https://g.alicdn.com/sj/qn/jssdk.js?qntag=3',
            'https://g.alicdn.com/secdev/entry/index.js?t=213757" id="aplus-sufei',
            'https://g.alicdn.com/alilog/oneplus/entry.js?t=213757'
        ];
        let interval;

        function initPushMessage() {
            for (var i = inportQNHeads.length - 1; i >= 0; i--) {
                var jquery = document.createElement('script');
                jquery.src = inportQNHeads[i];
                document.getElementsByTagName('head')[0].appendChild(jquery);
            }
            WSConnect.startWebSocket();
        };

        function CircleTime(){
            window.clearInterval(interval)
            interval=setInterval(function(){
                WSConnect.startWebSocket();
            },5000)
        }

        function changeCurrentState(currentState){
            switch (currentState){
                case 1:CircleTime();break;
                case 2:window.clearInterval(interval);break;
            }
        }


        var WSConnect = {
            ws: null,
            startWebSocket: function() {
                ws = new WebSocket(socketURL);
                changeCurrentState(1);
                ws.onopen = function() {
                    changeCurrentState(2);
                    ws.send(JSON.stringify({ "act": "connect", 'usernick': curUserNick }));
                };
                ws.onmessage = function(evt) {
                    var received_msg = evt.data;
                    Invoke.procressMessage(received_msg)
                };
                ws.onclose = function() {
                    changeCurrentState(1);
                    ws = null;
                };
            },
            sendMessage: function(message) {
                ws.send(message);
            },
            disconnect: function() {
                changeCurrentState(2);
                ws.send("{req:0}");
                ws.close();
            }
        };
        var Invoke = {
            procressMessage: function(message) {
                var messageObj = JSON.parse(message);
                if (messageObj != null && messageObj != undefined) {
                    var cmd = messageObj["cmd"];
                    if (cmd === "oauth" || cmd === "setting") {
                        this.openMessageSetting();
                    } else if (cmd === "openFreeJiaoyi") {
                        var url = 'https://fuwu.taobao.com/ser/assembleParam.htm?spm=a1z13.2196529.0.0.1b1f519fmbgMhQ&tracelog=search&activityCode=&promIds=&subParams=itemCode:FW_GOODS-1827490-1,cycleNum:12,cycleUnit:2';
                        this.openURLinQianNiu(url);
                    } else if (cmd === "msg") {
                        this.qnSendMessage(messageObj);
                    } else if (cmd === "openPluginMarket") {
                        this.openPluginMarket("FW_GOODS-1827490");
                    }else if(cmd==='disconnect'){
                        WSConnect.disconnect();
                    }
                }
            },
            sendMsgToNick: function(buyerNick, sendType, content) {
                var argus = { "type": 0 };
                if (sendType === "insertText2Inputbox") {
                    argus["uid"] = "cntaobao" + buyerNick;
                    argus["text"] = content;
                } else if (sendType === "sendMsg") {
                    argus["targetID"] = "cntaobao" + buyerNick;
                    argus["msgContent"] = content;
                }
                QN.wangwang.invoke({ cmd: sendType, param: argus });
            },
            qnSendMessage: function(messageObj) {
                var msgType = messageObj["type"];
                var msgNode = messageObj["msgnode"];
                var msgid = messageObj["msgid"];
                var ifClick = messageObj["autosend"];
                var invokeArgus = {};
                invokeArgus['cmd'] = msgType;
                invokeArgus['param'] = msgNode;
                invokeArgus["success"] = function() {
                    var exact = null;
                    if (msgType === "insertText2Inputbox") {
                        if (ifClick) {
                            exact = "click";
                        } else {
                            exact = "open";
                        }
                    }
                    WSConnect.sendMessage(JSON.stringify(this.__makeSendMsgResult__(msgid, true, exact)));
                };
                invokeArgus["error"] = function(msg) {
                    WSConnect.sendMessage(this.__makeSendMsgResult__(msgid, false, null, msg));
                }
                QN.wangwang.invoke(invokeArgus);
            },
            openURLinQianNiu: function(openURL) {
                QN.application.invoke({
                    cmd: 'browserUrl',
                    param: {
                        url: openURL
                    }
                });
            },
            openPluginMarket: function(serCode) {
                QN.application.invoke({
                    cmd: 'fwDetail',
                    param: {
                        serviceCode: serCode
                    }
                });
            },
            openMessageSetting: function() {
                var argus = {
                    appkey: '21085840',
                    event: 'customEvent',
                    param: '{\'setting\':\'pushMessage\'}',
                    directUrl: 'http://www.taobao.com'
                };
                __OpenPlugin__(argus);
            },
            openQNOauth: function() {
                var argus = {
                    appkey: '21085840',
                    event: 'customEvent',
                    directUrl: 'http://www.taobao.com'
                };
                __OpenPlugin__(argus);
            },
            __OpenPlugin__: function(argus) {
                QN.application.invoke({
                    cmd: 'openPlugin',
                    param: argus
                });
            },
            __makeSendMsgResult__: function(msgid, state, exact, extraMsg) {
                var reqObj = { "act": "result", "usernick": curUserNick };

                var msgState = {};
                msgState["timestamp"] = (new Date()).valueOf();
                msgState["msgid"] = msgid;
                msgState["state"] = state;
                if (extraMsg != null && extraMsg != undefined) {
                    msgState["extra"] = extraMsg;
                }

                if (exact != null && exact != undefined) {
                    reqObj["exact"] = exact;
                }

                reqObj["result"] = { "msgstate": msgState };
                return JSON.stringify(reqObj);
            }
        };
        window.LoveSeller.init = initPushMessage;
        window.LoveSeller.Socket = WSConnect;
        window.LoveSeller.Invoke = Invoke;
    })(window.LoveSeller);
    window.LoveSeller.init();
}else{
    window.LoveSeller.init();
}