let appLoading = true;
let appLoadingText = 'Carregando GestaON...';
window.setAppLoadingText = function(text){
    appLoadingText = text;
    document.getElementById("app-loading-text").innerHTML = text;
};
window.showAppLoading = function(){
    appLoading = true;
    fadeIn(document.getElementById('app-loading'), 1);
};
window.removeAppLoading = function(){
    appLoading = false;
    fadeOut(document.getElementById('app-loading'), 1);
};
window.isAppLoading = function(){
    return appLoading;
};
window.setAppLoadingText(appLoadingText);
function fadeIn(element,time){
    executeFading(element,time,0,100);
}
function fadeOut(element,time){
    executeFading(element,time,100,0);
}
function executeFading(element,time,initial,end){
    let increment;
    if(initial === 0){
        increment = 2;
        element.style.display = "flex";
    } else {
        increment = -2;
    }
    let opc = initial;
    let interval = setInterval(function(){
        if((opc === end)){
            if(end === 0){
                element.style.display = "none";
            }
            clearInterval(interval);
        } else {
            opc += increment;
            element.style.opacity = opc/100;
            element.style.filter = "alpha(opacity="+opc+")";
        }
    }, time * 10);
}