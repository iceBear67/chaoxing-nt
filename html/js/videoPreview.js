const video = document.querySelector('video');
video.volume = .3;
function closeVideoBox() { // 关闭预览
    document.querySelector('.previewHandle').style.display = 'none';
}
function minimize(e) {
    //   e.stopPropagation();
    window.RendererProcessHelper.minBtnForWindowFunction()

}
function maximize(e) {
    // e.stopPropagation();
    window.RendererProcessHelper.maxBtnForWindowFunction();
    document.querySelector(".maximize").style.display = 'none';
    document.querySelector(".maximize-recover").style.display = 'inline-block';
}
function closeWindow(e) {
    // e.stopPropagation();
    window.RendererProcessHelper.closeBtnForWindowFunction();
}

function maximizeRecover(e) {
    window.RendererProcessHelper.unMaxBtnForWindowFunction();
    document.querySelector(".maximize-recover").style.display = 'none';
    document.querySelector(".maximize").style.display = 'inline-block';
}
