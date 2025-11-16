window.addEventListener("load", () => {
    let initData = RendererHelper.getInitData()
    document.getElementById("main_content").innerText = initData.content
    document.getElementById("alert_title").innerText = window.i18nAPI.t("prompt")
    document.getElementById("alert_confirm").innerText = window.i18nAPI.t("confirm")
})
