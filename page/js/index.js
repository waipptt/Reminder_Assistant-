let choosedUser;//点击选中的用户
let userInfo=[] //存放当前所有登录的千牛用户
let serverHasReturnDate=false;

document.onmousedown = function(e){
    if ( e.buttons == 2 ){// 鼠标右键
        return false;
    }
    if( e.buttons==4 ){// 鼠标滚轮
        return false;
    }
}
document.oncontextmenu = function(e){ return false;}
document.onselectstart = function(){ return false;}
$(function(){
    let usersss=[]
    let map={
        '1':{
            buttonClassName:'iconfont icon-cancel',
            buttonText:'关闭自动催付',
            stateText:'自动催付已开启',
            templateClass:'con-state-ison',
            func:function(){//添加callback
                AY_SetUserState(choosedUser,false);
            }
        },
        '2':{
            buttonClassName:'iconfont icon-control100',
            buttonText:'打开催付设置',
            stateText:'自动催付已开启',
            templateClass:'con-state-ison',
            func:function(){//添加callback
                AY_openMessageSetting(choosedUser);
            }
        },
        '3':{
            buttonClassName:'iconfont icon-qiehuan',
            buttonText:'切换催付账号',
            stateText:'自动催付已关闭',
            templateClass:'con-state-isoff',
            func:function(){//添加callback
                AY_SetUserState(choosedUser,true);
            }
        },
        '4':{
            buttonClassName:'iconfont icon-guanji',
            buttonText:'开启自动催付',
            stateText:'自动催付已关闭',
            templateClass:'con-state-isoff',
            func:function(){//添加callback
                AY_SetUserState(choosedUser,true);
            }
        },
        '5':{
            buttonClassName:'iconfont icon-mianfei',
            buttonText:'免费订购爱用交易',
            stateText:'未订购爱用交易',
            templateClass:'con-state-isNotOrder',
            func:function(){//添加callback
                if(choosedUser.indexOf(':')==-1){
                    let url='https://fuwu.taobao.com/ser/assembleParam.htm?spm=a1z13.2196529.0.0.1b1f519fmbgMhQ&tracelog=search&activityCode=&promIds=&subParams=itemCode:FW_GOODS-1827490-1,cycleNum:12,cycleUnit:2';
                    AY_openURLinQN(choosedUser,url)
                }else{
                    openWW(choosedUser,'亲，使用催单助手需要主账号先免费订购爱用交易哦，\\\\n'+
                        'https://fuwu.taobao.com/ser/assembleParam.htm?spm=a1z13.2196529.0.0.1b1f519fmbgMhQ&tracelog'+
                        '=search&activityCode=&promIds=&subParams=itemCode:FW_GOODS-1827490-1,cycleNum:12,cycleUnit:2')
                }
            }
        }
    }

    //首次加载时关闭蒙层
    closeMask();

    // //页面加载时，先判断当前是否有千牛用户已经登陆
     let isQNRunning=AY_IsQNRunning()
     if(isQNRunning){
         templateLoading(); //有用户登陆，显示加载蒙层
     }else{
         hasNotLogin();//没有用户登录，打开登陆连接页面
     }

    //当前PC未登录千牛
    function hasNotLogin(){
        clearTemplateBlank();
        templateBlank('您还没有登录千牛','请在登陆后使用旺旺自动催付','立即登录',AY_StartUpQN,'hasNotLogin')
    }

    //当前PC未下载千牛
    function hasNotInstallQNUI(){
        clearTemplateBlank();
        templateBlank('检测到当前电脑未安装千牛','请在下载安装后使用旺旺自动催付','立即下载',AY_OpenURL,'hasNotInstallQNUI')
    }

    //点击按钮触发状态刷新
    function  changeState(){
        $.each(userInfo,function(i,user){
            getUsersState(user)
        })
    }

    //获取目前PC已经登录的用户，存储进入userInfo数组，并显示在页面上
    function getUserInfo(newUser){
        let index=-1;
        $.each(userInfo,function(i,user){
            if(newUser.nick==user.nick){
                index=i;
                userInfo[i]['state']=newUser.state;
            }
        })
        if(index!=-1){
            clearUserList();
            changeState();
            if(newUser.warn=='其他账号切换'){
                hasAnotherAccountLogin();
                return
            }
            if (newUser.state == 'expoauth') {
                grantFailed(newUser.nick)
                return
            }
        }else{
            let obj={};
            obj['nick']=newUser.nick;
            obj['state']=newUser.state;
            userInfo.push(obj);
            getUsersState(newUser); 
            if(userInfo.length==0){
                templateLoading();
            }else{
                clearTemplateBlank();
                clearTemplateLoading();
            }
        }
    }

    function getUsersState(users){
        let template=$($('#template').html())
        template.attr('id',users.nick);
        if(users.state){
            if(users.state=='running'){
                templateButton(template,users,map[1])
                templateButton(template,users,map[2])
            }else if(users.state=='occupied'){
                templateButton(template,users,map[3])
            }else if(users.state=='normal'){
                templateButton(template,users,map[4])
            }else{
                templateButton(template,users,map[5])
            }
        }else{
            template.find('#nick').html(users.nick);
            $('#container').append(template);
        }
    }

    function closeMask(){
        $('#background').css('display','none');
    }

    function openMask(){
        $('#background').css('display','block');
    }

    //状态切换时的加载蒙层
    function showOpacityFunc(){
        clearOpacityFunc();
        let cImageSrc='images/whiteLoading.gif';
        let loading=$($('#template-loading').html());
        loading.find('#loaderImage')[0].style.backgroundImage='url('+cImageSrc+')';
        loading.find('#loadingText').html('<span class="textToWhite">环境配置中，请勿做任何操作</span>');
        $('#showSth').append(loading);
        openMask();
    }

    function clearOpacityFunc(){
        $('#showSth').children().remove();
        closeMask();
    }

    //检测账户、刷新时的加载蒙层
    function templateLoading(){
        $('#templateBlank').children().remove();
        userInfo=[];
        let cImageSrc='images/blueLoading.gif';
        let template=$($('#template-loading').html())
        template.find('#loaderImage')[0].style.backgroundImage='url('+cImageSrc+')';
        $('#initLoading').append(template);
        $('#initLoading').show();
    }

    function clearTemplateLoading(){
        $('#initLoading').children().remove();
        $('#initLoading').hide();
    }

    //清除用户
    function clearUserList(){
        $('#container').children().remove();
    }

    //右侧按钮模板
    function templateButton(template,users,state){
        let button=$($('#template-btn').html());
        template.find('#nick').html(users.nick);
        button.find('i').addClass(state.buttonClassName);
        button.find('#button-text').html(state.buttonText);
        button.addClass('inline-block');
        button.click(function(){
            choosedUser=users.nick;
            state.func();
            button.css('disabled',true);
            setTimeout(()=>{
                button.css('disabled',false);
            },500)
        });
        template.find('#state').html(state.stateText);
        template.find('#state').addClass(state.templateClass);
        template.find('#button').append(button)
        $('#container').append(template);

    }

    //空白页面模板
    function templateBlank(textUp,textDown,buttonBlank,func,from){
        let template=$($('#template-blank').html())
        template.find('#text-up').html(textUp);
        template.find('#text-down').html(textDown);
        template.find('#button-blank').html(buttonBlank);
        template.find('#button-blank').click(function(){
            if(from=='hasNotLogin'){
                let res=func();
                if(res==-1){
                    hasNotInstallQNUI() //目前PC未安装千牛，显示千牛下载链接页面
                }
            }else if(from='hasNotInstallQNUI'){
                func('http://cts.alibaba.com//product/qianniu/download-pc?spm=a2114k.8709398.0.0'); //跳转浏览器下载地址
            }else if(from=''){

            }
        })
        $('#templateBlank').append(template);
    }

    function clearTemplateBlank(){
        $('#templateBlank').children().remove();
    }


    //有其他子账号已开启自动催付
    function hasAnotherAccountLogin(usernic,content){
        layer.open({
            title: usernic
            ,content: content
            ,shade:0.3
            ,btn:['我知道了']
            ,yes:function(index,layero){
                closeMask();
                clearUserList();
                changeState();
                layer.close(index);
            }
          }); 
    }

    //爱用交易授权失败
    function grantFailed(expUserNick) {
        layer.confirm('爱用交易授权已失效，需要主账号重新授权', { title: choosedUser, shade: 0.3 }, function(index) {
            //do something
            //choosedUser = 'yang会清:1111'
            var curUser = choosedUser;
            if (expUserNick != undefined && expUserNick != null) 
            { curUser = expUserNick;}

            if (curUser.indexOf(':') == -1) {
                AY_openTaobaoOauth(expUserNick);
            } else {
                showQRCode(expUserNick);
            }
            layer.close(index);
        },function(index){
            closeMask();
            layer.close(index)
        });
    }

    //子账号打开旺旺聊天窗口与主账号联系
    function openWW(usernick,content){
        userArr=usernick.split(':');
        AY_wangwangMessage(usernick,userArr[0],content)
    }

    //千牛账号授权失败，子账号展示二维码扫码页面
    function showQRCode(expUserNick){
        let QRCode=$($('#template-showQRCode').html())
        QRCode.find('.QR-nick').text(expUserNick)
        grantResult=false;
        AY_CheckUserOauth(expUserNick,true)
        QRCode.find('.QR-Code').attr('src','images/qrcode.png')
        QRCode.find('.QR-btn').click(function(){
        openWW(expUserNick,'亲，您的爱用交易授权已失效，需要主账号重新授权\\\\n授权方法：打开爱用交易-点击右上角设置-系统设置-点击重新授权')
        })
        QRCode.find('.icon-guanbi').click(function(){
            $(this).parent().parent().remove();
            AY_CheckUserOauth(expUserNick,false)
            closeMask();
        })
        $('#showSth').append(QRCode);
        openMask();
        $('#background').attr('background','white');
    }

    function closeShowSth(){
        $('#background').children().remove();
        $('#background').css('display','none')
    }

    //扫描二维码授权成功页面
    function grantSuccess(expUserNick){
        let QRCode=$($('#template-showQRCode').html())
        QRCode.find('.QR-nick').text(expUserNick)
        let grantSuccessTem=$($('#template-grantSuccess').html())
        QRCode.find('.QR-body').children().remove();
        QRCode.find('.icon-guanbi').click(function(){
            $(this).parent().parent().remove();
            closeMask();
        })
        QRCode.find('.QR-body').append(grantSuccessTem);
        $('#showSth').append(QRCode);
        openMask();
        $('#background').attr('background','white');
    }

    //删除用户
    function removeUser(nick){
        let index=-1;
        $.each(userInfo,function(i,user){
            if(user.nick==nick){
                index=i;
                $(`#${nick.replace(":","\\:")}`).remove();
            }
        })
        if(index!=-1){
            userInfo.splice(index,1);
        }
        if(userInfo.length==0){
            clearUserList();
            hasNotLogin();
        }else{
            clearTemplateBlank();
        }
    }

    //将所有running状态下的用户转变成normal状态
    function turnStateTONormal(){
        $.each(userInfo,function(i,user){
            user.state='normal'
        })
        // console.log(userInfo)
    }

    function setGrant(nick){
        
    }

    window.getUserInfo=getUserInfo;
    window.templateLoading=templateLoading;
    window.clearUserList=clearUserList;
    window.removeUser = removeUser;
    window.showOpacityFunc = showOpacityFunc;
    window.clearOpacityFunc = clearOpacityFunc;
    window.hasAnotherAccountLogin = hasAnotherAccountLogin;
    window.showQRCode=showQRCode;
    window.setGrant=setGrant;
    window.hasNotLogin=hasNotLogin;
    window.hasNotInstallQNUI=hasNotInstallQNUI;
    window.grantFailed=grantFailed;
    window.turnStateTONormal = turnStateTONormal;
    window.clearTemplateBlank=clearTemplateBlank;
    window.grantSuccess=grantSuccess;
});