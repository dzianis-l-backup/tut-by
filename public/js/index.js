var an = angular.module("an",[]);

an.controller('anCtrl',function($scope){
    $scope.news = [];
    $scope.comments = [];
    $scope.getComments = getComments;
    $scope.getNews = getNews;
    $scope.getNews(function(data){
        var news = JSON.parse(data);
        $scope.news = news;
        $scope.$digest();
    });
    $scope.expand = function(n){

        getComments(function(data){
            var comments = JSON.parse(data);
            $scope.comments = comments;

            var flag = sessionStorage.getItem("flag");

            $scope.currentNews = n;

            if(flag=="isAdmin"){
                $scope.isAuth =false;
                $scope.isUser =false;
                $scope.isReviewer =false;
                $scope.isAdmin =true;

                $scope.$digest();
                return;

            }

            if(flag=="isReviewer"){
                $scope.isAuth =false;
                $scope.isUser =false;

                $scope.isAdmin =false;
                $scope.isReviewer =true;

                $scope.$digest();
                return;
            }
            $scope.isAuth =false;
            $scope.isAdmin = false;
            $scope.isReviewer = false;
            $scope.isUser = true;
            $scope.$digest();


        },n);

    };

    $scope.ban = function(c){
        var user = c.user;
        blockUser(function (message) {
            log(message);
            $scope.expand($scope.currentNews);
            $scope.$digest();
        },user,1);

    };



    $scope.unban = function(c){
        var user = c.user;
        blockUser(function (message) {
            log(message);
            $scope.expand($scope.currentNews);
            $scope.$digest();
        },user,0);

    };

    $scope.delete = function(c){
        var user = c.user;
        deleteUser(function (message) {
            log(message);
            $scope.expand($scope.currentNews);
            $scope.$digest();
        },user);

    };


    $scope.postComment = function(cA){

        var news = $scope.currentNews.id;
        var message = cA;
        postCommentUser(function (message) {
            log(message);
            $scope.expand($scope.currentNews);
            $scope.$digest();
        },news,message);

    };

    $scope.addNews = function(link,title,description){


        addNewsUser(function (message) {
            log(message);
            $scope.getNews(function(data){
                var news = JSON.parse(data);
                $scope.news = news;
                $scope.$digest();
            });
        },link,title,description);

    };

    $scope.deleteComment = function(n){


        deleteCommentUser(function (message) {
            log(message);
            $scope.expand($scope.currentNews);
            $scope.$digest();
        },n.id);

    };


    $scope.signIn = signIn;

    $scope.signUp = signUp;

});


an.directive("auth",function(){
    return {
        restrict: "E",
        template:
        '<div class="container" ng-show="isAuth">\
        <div class="inputData">\
        <label for="login">login</label><br>\
        <input id="login">\
        </div>\
        <br>\
        <div class="inputData">\
        <label for="password">password</label><br>\
        <input id="password">\
        </div>\
        <br>\
        <div class="inputData">\
        <label for="in">in</label><br>\
    <input type="submit" value="in" id="in" ng-click="signIn(this)">\
        </div>\
        <br>\
        <div class="inputData">\
        <label for="up">up</label><br>\
        <input type="submit" value="up "id="up" ng-click="signUp(this)">\
        </div>\
        <br>\
        </div>',
        link:function(scope,elem,attrs){
            scope.isAuth = true;
        }
    }
});

an.directive("user",function(){
    return {
        restrict: "E",
        template:'<div ng-show="isUser">User \
        <div ng-repeat="c in comments" style="font-weight:lighter;font-size: 13px;background-color:rgba(240,240,240,1);margin:5px;">\
        <span>{{c.user}}</span><br>\
        <span>{{c.message}}</span>\
        </div>\
        <span>Comment here</span><br>\
        <textarea ng-model="commentArea"></textarea><br>\
        <span ng-click="postComment(commentArea)" style="font-weight:lighter;font-size: 13px;font-weight:bold;cursor: pointer;">SUBMIT</span><br>\
        </div>',
        link:function(scope,elem,attrs){
            scope.isUser = false;
        }
    }
});

an.directive("admin",function(){
    return {
        restrict: "E",
        template:'<div ng-show="isAdmin">Admin \
        <div ng-repeat="c in comments" style="font-weight:lighter;font-size: 13px;background-color:rgba(240,240,240,1);margin:5px;">\
        <span>{{c.user}}</span><br>\
        <span>{{c.message}}</span><br>\
        <span ng-click="ban(c)" style="font-weight:lighter;cursor: pointer;text-decoration: underline">Ban</span><br>\
        <span ng-click="unban(c)" style="font-weight:lighter;cursor: pointer;text-decoration: underline">Unban</span><br>\
        <span ng-click="delete(c)" style="font-weight:lighter;cursor: pointer;text-decoration: underline">Ban forever</span><br>\
        </div>\
        <br><input ng-model="link">link<br>\
        <input ng-model="title">title<br>\
        <input ng-model="description">description<br>\
        <span ng-click="addNews(link,title,description)" style="font-weight:lighter;font-size: 13px;font-weight:bold;cursor: pointer;">ADD</span><br>\
        </div>',
        link:function(scope,elem,attrs){
            scope.isAdmin = false;
        }
    }
});


an.directive("reviewer",function(){
    return {
        restrict: "E",
        template:'<div ng-show="isReviewer">Reviewer \
        <div ng-repeat="c in comments" style="font-weight:lighter;font-size: 13px;background-color:rgba(240,240,240,1);margin:5px;">\
        <span>{{c.user}}</span><br>\
        <span>{{c.message}}</span><br>\
        <span ng-click="deleteComment(c)" style="font-weight:bold;font-size: 13px;cursor: pointer;">delete</span>\
        </div>\
        </div>',
        link:function(scope,elem,attrs){
            scope.isReviewer = false;
        }
    }
});










function dataCollect(){
    var login = document.getElementById('login').value;
    var password = document.getElementById('password').value;
    var salt = Math.random().toString().substring(0,5);
    log(login,password,salt,password+salt);
    log(Sha1.hash(password+salt));
    return {
        login:login,
        password:password,
        salt:salt
    }
}

function signIn(scope){
    request("signin",scope);
};

function signUp(scope){
    request("signup",scope);
};

function request(url,scope){

    var xhr = new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/api/"+url ,true);
    xhr.onreadystatechange=function(){
        if(xhr.readyState == 4){
            if(xhr.status==200) {
                log(xhr.responseText);
                var token = JSON.parse(xhr.responseText).token;
                var flag = JSON.parse(xhr.responseText).flag;
                if(token!=undefined){
                    sessionStorage.setItem("token",token);
                    scope.isAuth = false;
                    if(flag=="isAdmin"){
                        scope.isAdmin =true;
                        sessionStorage.setItem("flag","isAdmin");
                        scope.$digest();
                        return;

                    }

                    if(flag=="isReviewer"){
                        scope.isReviewer = true;
                        sessionStorage.setItem("flag","isReviewer");
                        scope.$digest();
                        return;
                    }
                    sessionStorage.setItem("flag","isUser");
                    scope.isUser = true;
                    scope.$digest();


                }


            }
            else{
                log("error");
            }
        }
    };

    xhr.timeout = 30000;
    xhr.ontimeout = function(){
        log("timeout error");
    };

    var request = dataCollect();
    var token = sessionStorage.token;
    if(token != undefined)
        request.token = token;

    xhr.setRequestHeader("Content-Type","application/json");
    var serialized = JSON.stringify(request);
    xhr.send(serialized);
}

/*function redirect(url,scope){
    var xhr = new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/"+url ,true);
    xhr.onreadystatechange=function(){
        if(xhr.readyState == 4){
            if(xhr.status==200) {
                document.getElementsByClassName("mainContainer")[0].innerHTML = xhr.responseText;
                //if(scope)   scope.$digest();
            }
            else{

            }
        }
    };

    xhr.timeout = 30000;
    xhr.ontimeout = function(){
        log("timeout error");
    };

    var request = {};
    var token = sessionStorage.token;
    if(token != undefined)
        request.token = token;

    xhr.setRequestHeader("Content-Type","application/json");
    var serialized = JSON.stringify(request);
    xhr.send(serialized);
}*/

function getNews(callback){
    var xhr = new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/api/"+"news" ,true);
    xhr.onreadystatechange=function(){
        if(xhr.readyState == 4){
            if(xhr.status==200) {
                callback(xhr.responseText);
            }
            else{

            }
        }
    };

    xhr.timeout = 30000;
    xhr.ontimeout = function(){
        log("timeout error");
    };

    var request = {};
    var token = sessionStorage.token;
    if(token != undefined)
        request.token = token;

    xhr.setRequestHeader("Content-Type","application/json");
    var serialized = JSON.stringify(request);
    xhr.send(serialized);
}

function getComments(callback,news){
    var news = news.id;
    var xhr = new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/"+"comments" ,true);
    xhr.onreadystatechange=function(){
        if(xhr.readyState == 4){
            if(xhr.status==200) {
                callback(xhr.responseText);
            }
            else{

            }
        }
    };

    xhr.timeout = 30000;
    xhr.ontimeout = function(){
        log("timeout error");
    };

    var request = {};
    var token = sessionStorage.token;
    if(token != undefined)
        request.token = token;

    request.news = news;

    xhr.setRequestHeader("Content-Type","application/json");
    var serialized = JSON.stringify(request);
    xhr.send(serialized);
}

function changeLayout(callback){

}

function blockUser(callback,id,block){

    var xhr = new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/"+"block" ,true);
    xhr.onreadystatechange=function(){
        if(xhr.readyState == 4){
            if(xhr.status==200) {
                callback(xhr.responseText);
            }
            else{

            }
        }
    };

    xhr.timeout = 30000;
    xhr.ontimeout = function(){
        log("timeout error");
    };

    var request = {};
    var token = sessionStorage.token;
    if(token != undefined)
        request.token = token;

    request.id = id;
    request.block = block;


    xhr.setRequestHeader("Content-Type","application/json");
    var serialized = JSON.stringify(request);
    xhr.send(serialized);
}

function deleteUser(callback,id,block){

    var xhr = new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/"+"delete" ,true);
    xhr.onreadystatechange=function(){
        if(xhr.readyState == 4){
            if(xhr.status==200) {
                callback(xhr.responseText);
            }
            else{

            }
        }
    };

    xhr.timeout = 30000;
    xhr.ontimeout = function(){
        log("timeout error");
    };

    var request = {};
    var token = sessionStorage.token;
    if(token != undefined)
        request.token = token;

    request.id = id;
    request.block = block;


    xhr.setRequestHeader("Content-Type","application/json");
    var serialized = JSON.stringify(request);
    xhr.send(serialized);
}

function postCommentUser(callback,id,message){

    var xhr = new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/"+"postComment" ,true);
    xhr.onreadystatechange=function(){
        if(xhr.readyState == 4){
            if(xhr.status==200) {
                callback(xhr.responseText);
            }
            else{

            }
        }
    };

    xhr.timeout = 30000;
    xhr.ontimeout = function(){
        log("timeout error");
    };

    var request = {};
    var token = sessionStorage.token;
    if(token != undefined)
        request.token = token;

    request.news = id;
    request.message = message;


    xhr.setRequestHeader("Content-Type","application/json");
    var serialized = JSON.stringify(request);
    xhr.send(serialized);
}

function addNewsUser(callback,link,title,description){

    var xhr = new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/"+"addNews" ,true);
    xhr.onreadystatechange=function(){
        if(xhr.readyState == 4){
            if(xhr.status==200) {
                callback(xhr.responseText);
            }
            else{

            }
        }
    };

    xhr.timeout = 30000;
    xhr.ontimeout = function(){
        log("timeout error");
    };

    var request = {};
    var token = sessionStorage.token;
    if(token != undefined)
        request.token = token;

    request.link = link;
    request.title = title;
    request.description = description;


    xhr.setRequestHeader("Content-Type","application/json");
    var serialized = JSON.stringify(request);
    xhr.send(serialized);
}

function deleteCommentUser(callback,id){

    var xhr = new XMLHttpRequest();
    xhr.open("POST","http://localhost:3000/"+"deleteComments" ,true);
    xhr.onreadystatechange=function(){
        if(xhr.readyState == 4){
            if(xhr.status==200) {
                callback(xhr.responseText);
            }
            else{

            }
        }
    };

    xhr.timeout = 30000;
    xhr.ontimeout = function(){
        log("timeout error");
    };

    var request = {};
    var token = sessionStorage.token;
    if(token != undefined)
        request.token = token;

    request.id = id;


    xhr.setRequestHeader("Content-Type","application/json");
    var serialized = JSON.stringify(request);
    xhr.send(serialized);
}
