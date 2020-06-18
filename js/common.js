//获取当前登录角色
var userInfo = JSON.parse(localStorage.getItem('userInfo'))|| null;
//获取当前项目下 -- 当前任务信息
var curTaskInfo = JSON.parse(localStorage.getItem('curTaskInfo')) ||{};

//获取页面参数
function GetQueryString(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg);
    if(r != null) return unescape(r[2]);
    return null;
}

//获取随机数 范围 m-n
function sum (m,n){
    return  Math.floor(Math.random()*(m - n) + n);
}

//任务中的题目 点赞
function addCommentForTask(e) {
    console.log(e.toElement.id)
    console.log(e.toElement.value)
    var type = '';
    //根据id末尾四位数 是否是like 来判断是点赞还是点差
    if (e.toElement.id.substring(e.toElement.id.length-4) === 'like' ) {
        type = 'LIKE';
    } else {
        type = 'UN_LIKE';
    }
    var questionInfo = {
        itemid: e.toElement.value,
        taskid: JSON.parse(localStorage.getItem('curTaskInfo')).taskid,
        comment: type,
        access_token : localStorage.getItem('access_token')
    }
    var questionData = {
        clazz: 'com.lattice.action.proxy.thirdparty.rest.api.TaskItemCommentProxy',
        service: 'addCommentForTaskItem',
        args: JSON.stringify(questionInfo)
    };
    $.ajax({
        type: 'POST',
        url: 'http://www.dweipsy.com/lattice/CommonActionThirdPartyProxy',
        data: questionData,
        dataType: 'json',
        success: function (data) {
            //点完赞之后 disabled;避免多次点击按钮
            $("#"+e.toElement.id).attr('disabled',"true");
            //点赞、点差成功之后 查询点赞个数
            getCommentCountForTask(e.toElement.value);
        }
    });
}


//获取任务中的题目点赞、点差数量
function getCommentCountForTask(itemid) {
    var taskInfo = {
        taskid: JSON.parse(localStorage.getItem('curTaskInfo')).taskid,
        itemid: itemid,
        access_token : localStorage.getItem('access_token')
    }
    var taskData = {
        clazz: 'com.lattice.action.proxy.thirdparty.rest.api.TaskItemCommentProxy',
        service: 'getCommentCountForTaskItem',
        args: JSON.stringify(taskInfo)
    };
    $.ajax({
        type: 'POST',
        url: 'http://www.dweipsy.com/lattice/CommonActionThirdPartyProxy',
        data: taskData,
        dataType: 'json',
        success: function (data) {
            $("#"+itemid+"like span").html('('+data.results.like+')');
            $("#"+itemid+" span").html('('+data.results.unLike+')');
        }
    });
}

//返回上一页
function goNext(url) {
    clickMusic.play();
    setTimeout(function(){
        mui.openWindow({
            url: url,
            createNew: true,
            styles: {
                cachemode:"noCache", //返回上一页 清除缓存
            }
        });
    }, 100);
};

//退出登录
mui(document.body).on('tap', '#logout', function() {
    mui.confirm('确认要退出多维心理APP？','',['退出','取消'],function(e){
        if(e.index == 0) {
            plus.runtime.quit();
            //清理本地缓存数据
            // localStorage.removeItem('userInfo')
            localStorage.removeItem('access_token')
            localStorage.removeItem('uid')
            localStorage.removeItem('curTaskInfo')
            // localStorage.clear()
        }
    })
});

//表单数据转化
function getFormData(eId) {
    var inData={};
    $("#" + eId).find("input").each(function() {
        if ($(this).attr("real-value") != null) {
            inData[$(this).attr("name")] = $(this).attr("real-value").trim();
        } else {
            inData[$(this).attr("name")] = $(this).val().trim();
        }
    });
    $("#" + eId).find("select").each(function() {
        inData[$(this).attr("name")] = $(this).val();
    });
    $("#" + eId).find("textarea").each(function() {
        inData[$(this).attr("name")] = $(this).val().trim();
    });
    return inData;
}

//ajax -- post  认知能力测评(当前状态) 统一接口--数据提交*************
function postFormInputData() {
    //展示正式任务结束页面
    $('.formalResult').removeClass('active'); //隐藏 打印结果form表单
    document.getElementById("button_pq").style.display = "none"; //隐藏 左右button
    var formData = getFormData('result');
    //本地测试账号-对应孙老师
    /* formData.userName = '18210119894001';
     formData.password = 'password';*/
    //正式环境
    formData.userName = '105988';
    formData.password = '123456';
    formData.type = 'formal';
    $.ajax({
        type: 'POST',
        url: 'http://www.dweipsy.com/lattice/CommonActionProxy', //正式环境 -- 不带token
        // url: 'http://192.168.43.175/lattice/CommonActionProxy', //本地测试
        data: {
            clazz: 'com.lattice.action.OPES.OPESResultProxy',
            service: 'postResults',
            args: JSON.stringify(formData)
        },
        dataType: 'json',
        success: function (data) {
            //数据提交成功
            if(data.flag === 'success') {
                mui.openWindow({
                    url: '../../../task_1/task_list.html',
                    createNew: true,
                    styles: {
                        cachemode:"noCache",
                    }
                });
            } else {
                mui.toast('后端服务异常，请联系管理员!',{ duration:'long', type:'div' })
            }
        }
    });
}

//ajax -- post  数学认知能力训练 统一接口--数据提交*************
function postWebMathData(opes_result_data) {
    //本地测试账号-对应孙老师
    /* formData.userName = '18210119894001';
     formData.password = 'password';*/
    //正式环境
    opes_result_data.userName = userInfo.userName;
    opes_result_data.password =  userInfo.password;
    opes_result_data.access_token =  localStorage.getItem('access_token');
    opes_result_data.type = 'formal';
    $.ajax({
        type: 'POST',
        url: 'http://www.dweipsy.com/lattice/CommonActionThirdPartyProxy', //正式环境 第三方 带token
        // url: 'http://192.168.43.175/lattice/CommonActionProxy', //本地测试
        data: {
            clazz: 'com.lattice.action.OPES.OPESResultProxy',
            service: 'postResults',
            args: JSON.stringify(opes_result_data)
        },
        dataType: 'json',
        success: function (data) {
            if (data.flag === 'success') {
                //数据提交成功 先跳转到进步曲线页面--然后返回任务列表
                mui.openWindow({
                    url: '../../resultTips.html?pid='+opes_result_data.projectid,
                    createNew: true,
                    styles: {
                        cachemode:"noCache",
                    }
                });
            } else {
                mui.toast('网络异常，请稍后再试！',{ duration:'long', type:'div' });
            }
        }
    });
}

/***********任务图片本地缓存机制 -- start **********************************************/
function localCache(curData, imgUrl, taskId, imgId) {
    var loadUrl = "http://www.dweipsy.com/lattice/IndependentWebPage/1081/"+ taskId +"/" + curData[imgUrl];
    mui.init(); //mui初始化
    mui.plusReady(function() {
        setImg(curData, imgUrl, loadUrl, taskId, imgId);
    });
}
/*<img>设置图片
     *1.从本地获取,如果本地存在,则直接设置图片
     *2.如果本地不存在则联网下载,缓存到本地,再设置图片
     * */
function setImg(curData, imgUrl, loadUrl, taskId, imgId) {
    if (curData == null || loadUrl == null) return;
    //图片下载成功 默认保存在本地相对路径的"_downloads"文件夹里面, 如"_downloads/logo.jpg"
    var filename = loadUrl.substring(loadUrl.lastIndexOf("/") + 1, loadUrl.length);
    var relativePath = "_downloads/"+ taskId +"/" + filename;
    //检查图片是否已存在
    plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
        console.log("图片存在,直接设置=" + relativePath);
        //如果文件存在,则直接设置本地图片
        setImgFromLocal(curData, imgUrl, relativePath, imgId);
    }, function(e) {
        console.log("图片不存在,联网下载=" + relativePath);
        //如果文件不存在,联网下载图片
        setImgFromNet (curData,imgUrl,loadUrl,relativePath,taskId,imgId);
    });
}
/*
 * relativePath 本地相对路径 例如:"_downloads/logo.jpg"
 */
function setImgFromLocal(curData, imgUrl, relativePath,imgId) {
    //本地相对路径("_downloads/logo.jpg")转成SD卡绝对路径("/storage/emulated/0/Android/data/io.dcloud.HBuilder/.HBuilder/downloads/logo.jpg");
    var sd_path = plus.io.convertLocalFileSystemURL(relativePath);
    //改变data 中图片的路径为下载转化wi绝对路径
    curData[imgUrl] = sd_path
    $(imgId).attr("src", sd_path);
}
/*联网下载图片,并设置给<img>*/
function setImgFromNet (curData,imgUrl,loadUrl,relativePath,taskId,imgId) {
    //先设置下载中的默认图片 --暂时不需要
    //创建下载任务
    var dtask = plus.downloader.createDownload(loadUrl, {filename:"_downloads/"+ taskId +"/"}, function(d, status) {
        if (status === 200) {
            //下载成功
            console.log("d.filename=" + d.filename + "taskId是" + taskId);
            //d.filename 为下载文件保存的地址
            setImgFromLocal(curData,imgUrl,d.filename,imgId);
        } else {
            //下载失败,需删除本地临时文件,否则下次进来时会检查到图片已存在
            alert("网络出现问题，请退出APP，检查网络!" + status+"=="+relativePath);
            //dtask.abort();//文档描述:取消下载,删除临时文件;(但经测试临时文件没有删除,故使用delFile()方法删除);
            if (relativePath!=null)
                delFile(relativePath);
        }
    });
    //启动下载任务
    dtask.start();
}
/*删除指定文件*/
function delFile(relativePath) {
    plus.io.resolveLocalFileSystemURL(relativePath, function(entry) {
        entry.remove(function(entry) {
            console.log("文件删除成功==" + relativePath);
        }, function(e) {
            console.log("文件删除失败=" + relativePath);
        });
    });
}
/**********************    end  ************************/
