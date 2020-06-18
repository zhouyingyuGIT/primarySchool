$(function () {
    var taskid = curTaskInfo.taskid;
    $("#rank").remove();
    $("body").append(
        '<div class="pm" id="rank" style="position: fixed;top: 230px;right: 10px;width: 128px;padding: 8px;">\n' +
        '        <div >\n' +
        '            <div style="height: 42px;line-height: 42px;background: #2e6da4;color: #fff;text-align: center;font-size: 14px;font-weight: 900;">平均分排名</div>\n' +
        '            <div style="height: 32px;line-height: 32px;background: #fff;color: #000;font-size: 14px;text-align: center;font-weight: 900;" id="average_rank"></div>\n' +
        '        </div>\n' +
        '        <div >\n' +
        '            <div style="height: 42px;line-height: 42px;background: #2e6da4;color: #fff;text-align: center;font-size: 14px;font-weight: 900;">总分排名</div>\n' +
        '            <div style="height: 32px;line-height: 32px;background: #fff;color: #000;font-size: 14px;text-align: center;font-weight: 900;" id="total_score_rank"></div>\n' +
        '        </div>\n' +
        '    </div>'
    );

    $("#respectfully").text("你好：");
    $("#xst").text("倒计时");
    $("#xsn").text("正确个数");
    $("#xsq").text("正确率");
    $("#bTime").text("不限时长");
    $("#captionTitle").text("做题情况");
    $("#th1").text("已做题目");
    $("#th2").text("正确答案");
    $("#th3").text("你的答案");
    $("#th4").text("每题用时");
    $("#th5").text("分析");
    $("#th6").text("评价");
    $("#th6").css({
        "width":"80px"
    })
    $("#out").text("返回");
    $("#knowledge").text("");
    testonly_toget_rank(taskid); //平均分排名
    testonly_total_rank(taskid); //总分排名
    getIntroduceByTaskid(taskid); //根据任务获取介绍语
    function testonly_toget_rank(taskid) {
        //获取任务常模的平均排名接口（一个任务的做的历史结果的常模的平均
        var argsdata = {
            uid: parseInt(localStorage.getItem('uid')),
            taskid: taskid,
            access_token: localStorage.getItem('access_token'),
        };
        var rankData = {
            clazz: 'com.lattice.action.proxy.common.NormRecordProjectAndTaskAnalysisProxy',
            service: 'getNormRecordScoreAverageForOneTask',
            args: JSON.stringify(argsdata)
        };
        $.ajax({
            type: 'POST',
            url: 'http://www.dweipsy.com/lattice/CommonActionThirdPartyProxy',
            data: rankData,
            dataType: 'json',
            success: function (data) {
                // 校验token过期
                if (data.message) {
                    mui.toast('访问时间已经过期,3秒后自动跳转到登录页面!', {duration: 'long', type: 'div'});
                    setTimeout(function () {
                        mui.openWindow({
                            url: '../../../login.html',
                            createNew: true,
                            styles: {
                                cachemode: "noCache",
                            }
                        });
                    }, 3000);
                } else {
                    $("#average_rank").text('第' + data.NormRecordScoreAverageForOneTask + '名');
                }
            }
        });
    }

    function testonly_total_rank(taskid) {
        //获取任务常模总和排名接口-（一个任务的做的历史结果的常模的求和--虽然每次的做的常模分数低，但是如果做的次数多，所以总和高）
        var argsdata = {
            uid: parseInt(localStorage.getItem('uid')),
            taskid: taskid,
            access_token: localStorage.getItem('access_token'),
        };
        var rankData = {
            clazz: 'com.lattice.action.proxy.common.NormRecordProjectAndTaskAnalysisProxy',
            service: 'getNormRecordScoreSumRankForOneTask',
            args: JSON.stringify(argsdata)
        };
        $.ajax({
            type: 'POST',
            url: 'http://www.dweipsy.com/lattice/CommonActionThirdPartyProxy',
            data: rankData,
            dataType: 'json',
            success: function (data) {
                // 校验token过期
                if (data.message) {
                    mui.toast('访问时间已经过期,3秒后自动跳转到登录页面!', {duration: 'long', type: 'div'});
                    setTimeout(function () {
                        mui.openWindow({
                            url: '../../../login.html',
                            createNew: true,
                            styles: {
                                cachemode: "noCache",
                            }
                        });
                    }, 3000);
                } else {
                    $("#total_score_rank").text('第' + data.NormRecordScoreSumRankForOneTask + '名');
                }
            }
        });
    }

    function getIntroduceByTaskid(taskid) {
        var argsdata = {
            taskid: taskid,
            access_token: localStorage.getItem('access_token'),
        };
        var data = {
            clazz: 'com.lattice.action.proxy.thirdparty.task.ThirdPartyTaskProxy',
            service: 'getOneTask',
            args: JSON.stringify(argsdata)
        };
        var success = function (data) {
            // 校验token过期
            if (data.message) {
                mui.toast('访问时间已经过期,3秒后自动跳转到登录页面!', {duration: 'long', type: 'div'});
                setTimeout(function () {
                    mui.openWindow({
                        url: '../../../login.html',
                        createNew: true,
                        styles: {
                            cachemode: "noCache",
                        }
                    });
                }, 3000);
            } else {
                $("#name").text(localStorage.getItem('realName'));
                $("#introduce").text(data.results.instruction);
            }
        };
        invoke_proxy(data, success);
    }

    function getUrlParam(name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
});

/****************** 错题、新题、随机三种模式 --start  ************************/
function getAllTasksAndAverageResultForOneProjectFun(arr1, arr2) {
    var arrData;
    var token = localStorage.getItem('access_token');
    var taskid = JSON.parse(localStorage.getItem('curTaskInfo')).taskid;
    var getAllTasksAndAverageResultForOneProject = {
        access_token: token,
        taskid: taskid
    }
    let getAllTasksAndAverageResultForOneProjectData = {
        clazz: 'com.lattice.action.proxy.itemtask.ItemTaskProxy',
        service: 'getItemTaskStatisticsForOneUser',
        args: JSON.stringify(getAllTasksAndAverageResultForOneProject)
    };
    $.ajax({
        type: 'POST',
        url: 'http://www.dweipsy.com/lattice/CommonActionThirdPartyProxy',
        data: getAllTasksAndAverageResultForOneProjectData,
        dataType: 'json',
        async: false,
        success: function (data) {
            if (data.results == undefined) {
                alert(data.message)
                arrData = -1;
            } else {
                if (data.results.length == 0) {
                    arrData = 0;
                } else {
                    if (arr2) {
                        arrData = NewTopicFun(arr1, data.results)
                    } else {
                        arrData = errorTopicFun(arr1, data.results)
                    }

                }
            }

        }
    });
    return arrData
}

function NewTopicFun(data1,arr1) {
    var arrData=JSON.parse(JSON.stringify(data1))
    if(arrData[0].ID !== undefined){
        for(var k=0;k<arr1.length;k++){
            for (var i=0;i<arrData.length;i++){
                if(arrData[i].ID == arr1[k].itemid){
                    arrData.splice(i,1)
                    continue;
                }
            }
        }
    }else {
        for(var k=0;k<arr1.length;k++){
            for (var i=0;i<arrData.length;i++){
                if(arrData[i].iid == arr1[k].itemid){
                    arrData.splice(i,1)
                    continue;
                }
            }
        }
    }

    return arrData
}

function errorTopicFun(data1,arr1) {
    var arrData1=[];
    if(data1[0].ID !== undefined){
        for(var k=0;k<arr1.length;k++){
            if(arr1[k].correctCount != arr1[k].totalCount){
                for (var j=0;j<data1.length;j++){
                    if(arr1[k].itemid == data1[j].ID){
                        arrData1.push(data1[j]);
                    }
                }
            }
        }
    }else {
        for(var k=0;k<arr1.length;k++){
            if(arr1[k].correctCount != arr1[k].totalCount){
                for (var j=0;j<data1.length;j++){
                    if(arr1[k].itemid == data1[j].iid){
                        arrData1.push(data1[j]);
                    }
                }
            }
        }
    }

    return arrData1
}

function getCookie(name) {
    var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if (arr = document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}
/******************  end   ************************/