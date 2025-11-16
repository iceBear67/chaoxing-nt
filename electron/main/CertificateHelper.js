"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isUrlSafe = void 0;
const electron_1 = require("electron");
const m_IgnoreUnsafeDomain = [];
function isUrlSafe(url) {
    if (!url) {
        return false;
    }
    if (url.startsWith("file://")) {
        return true;
    }
    let _url = new URL(url);
    if (_url.host.endsWith("chaoxing.com") ||
        _url.host.endsWith("xuexi365.com") ||
        _url.host.endsWith("easemob.com") ||
        _url.host.endsWith("agora.io")) {
        return true;
    }
    if (m_IgnoreUnsafeDomain.includes(_url.host)) {
        return true;
    }
    return false;
}
exports.isUrlSafe = isUrlSafe;
electron_1.app.on("certificate-error", (event, webContents, url, error, certificate, callback, isMainFrame) => {
    console.log("certificate-error:", url, error, webContents.getURL());
    event.preventDefault();
    if (!isMainFrame) {
        let pageUrl = webContents.getURL();
        if (isUrlSafe(pageUrl)) {
            callback(true);
            return;
        }
    }
    if (isUrlSafe(url)) {
        callback(true);
        return;
    }
    let _url = new URL(url);
    let host = _url.host;
    let subjectName = certificate?.subjectName;
    if (!subjectName) {
        subjectName = "未知";
    }
    console.log("certificate-error2:", host, subjectName);
    webContents
        .executeJavaScript(`document.body.innerHTML = \` <div class="risk_link_content">
    <div class="header">
        <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAACXBIWXMAABYlAAAWJQFJUiTwAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAOESURBVHgB7ZrvddMwEMBPaj62EDbIBqQT1J2g7QS47QDQCZpOACzQuhMQJsBMQNggnYBA+Abxcec45uLI9R+dSXivv/f8YsuOdSed7qSTAZ7YLgYU+BaG/T2AwFp7hAADRBzSi/uwPJgZHVP+NcZMkiT5vACIX0TRDDzxUmAehgEYc02nQ/grbIPazRiT5P5ZFI2hJa0U+BGGp9aYt9zaoAAJMU0Qb0iRCBrSSAEylUHPmDs6DaADSJjJL8QzMq1p3f/Yug/+vLx8TcJ/gY6EZ6hHh1zH9zB8U/c/tXpgfnFxDYgj+JcYMzq4vb2pfKzqga0Iv6KGEo8qsFXhV1QoUaoA2zy5uHewA5CHunoeRU5ZnApk3oYHbHPf3g2z34iHLu/Ucz1Nwn8Af+FjMr+vfILGnBi/mNHP3Pdx8cZGD1CQCs3y4fZQUDqIopEsoqg9yqK2x2vxrBi1N+KA9a2EompReCYri8EDjv4bZfKCpwi+0wNqpY9l95LMpFq/m2RL51+CNQWMta9g1ylYSK4AT4mp+U7BE+rml2X39ow5An+Gqayr+vKX681xAlmBBJfTbl/6UlYrXh6AEj2HoEXb9QFdCjzW9U1JHAokOq2fImOKFYVqUZe6eKMxeLkJSsjGliY0AC2MCTaKEAegBIrGlm5UrQe4MeRA5nNUNCEoUUAVOZB7usKvIRXwTnFI5KBN9JehuaxyDKgqYKSrs1bNw2VMVyf5dJoTTqA40Oh9R7nvV4jwBfLGzhWgbNkDuSdQpE9afIIOkJNCGQdi+E+QsuYKLJaFquOAmEAHDbNwKZAlWiegAGZr2IO7Oz6OKYgdglLj8HpDJoVt4W5lIqkOFnFMleSNsU/nZLf3oEO0Vpe8oGVfjMJFtYW62LXymoInLFvlmph64Qo8IW92UqesMQ4LcfrN+fk5u78APKA4EJFvfp9OvKw9ocprJ2xLiHk8FQudeSEagOe+iS0abCFpEWYX4AM7hQXJ5LrnnMxxBixRGtAakFO4KdszKJ2NprnIXVCCZNgvyYsy1el1hYxaaxwZviL1Nji2oUQN4Znaszfe9snSjp1mrHnA2gqzkbTZ5OPMdVcrrJg9YJNNvrbbrOwir41eImCCy23WxvvFXgsATgan+dQWCxY2Fd5WzWw9hpaofmqQLiOXORvOQgxWuaZsuZp+ZkDR+YGuY61PDZ7YNn8Applszfc45WEAAAAASUVORK5CYII="
            alt="">
        <div>您的链接不是私密链接</div>
    </div>
    <div class="content">
        攻击者可能会试图从${host}窃取您的信息（例如: 密码、消息、信用卡信息）。
    </div>
    <div class="footer">
        <div class="botton_one" id="botton_details">详情</div>
        <div class="botton_two" id="botton_back">返回安全链接</div>
    </div>
    <div class="tip" id="risk_tip">
        此服务器无法证明它是${host}；其安全证书来自${subjectName}。出现此问题的原因可能是配置有误或您的链接被拦截了。
    </div>
    <div class="continue_go" id="continue_link">
        继续前往${host}（不安全）
    </div>
  </div>\``)
        .then(() => {
        webContents.insertCSS(` * {
            box-sizing: border-box;
            letter-spacing: 0.04em;
            user-select: none;
            font-family: PingFang SC;
        }
        
        html,
        body {
            height: 100%;
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
        }
        
        .risk_link_content {
            width: 570px;
            min-height: 134px;
            margin-top: 100px;
        }
        
        .risk_link_content .header {
            height: 28px;
            display: flex;
            justify-content: flex-start;
            align-items: center;
            margin-bottom: 14px;
        }
        
        .risk_link_content .header>img {
            width: 24px;
            height: 24px;
            margin-right: 10px;
        }
        
        .risk_link_content .header>div {
            font-size: 20px;
            font-weight: 500;
            line-height: 28px;
            text-align: left;
            color: #131B26;
            ;
        }
        
        .risk_link_content .content {
            min-height: 20px;
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
            text-align: left;
            color: #8A8B99;
            margin-bottom: 40px;
        }
        
        .risk_link_content .footer {
            width: 100%;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px;
        }
        
        .risk_link_content .footer .botton_one {
            min-width: 60px;
            height: 32px;
            border-radius: 99px;
            padding: 0px 16px;
            border: 1px solid #E1E3E5;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #8A8B99;
            font-size: 14px;
            cursor: pointer;
        }
        
        .risk_link_content .footer .botton_two {
            min-width: 116px;
            height: 32px;
            border-radius: 99px;
            padding: 0px 16px;
            background: linear-gradient(322.22deg, #5A33FF -34.58%, #6CC7FF 132%);
            box-shadow: 0px 2px 9px 0px #67A1FF80;
            display: flex;
            justify-content: center;
            align-items: center;
            color: #FFFFFF;
            font-size: 14px;
            cursor: pointer;
        }
        
        .risk_link_content .tip {
            min-height: 40px;
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
            text-align: left;
            color: #8A8B99;
            margin-bottom: 24px;
        }
        
        .risk_link_content .continue_go {
            width: 250px;
            font-size: 14px;
            font-weight: 400;
            line-height: 20px;
            text-align: left;
            color: #8A8B99;
            border-bottom: 1px solid #8A8B99;
            cursor: pointer;
        }`);
        webContents.executeJavaScript(`document.title="${url}";
        let buttonOne = document.getElementById('botton_details');
        let buttonTwo = document.getElementById('botton_back');
        let riskTip = document.getElementById('risk_tip')
        let continueLink = document.getElementById('continue_link')

        let isDetailsVisible = true;
        riskTip.style.display = 'none';
        continueLink.style.display = 'none';
        buttonOne.addEventListener('click', function () {
            if (isDetailsVisible) {
                buttonOne.textContent = '隐藏详情';
                riskTip.style.display = 'block';
                continueLink.style.display = 'block';
            } else {
                buttonOne.textContent = '详情';
                riskTip.style.display = 'none';
                continueLink.style.display = 'none';
            }
            isDetailsVisible = !isDetailsVisible;
        });
        buttonTwo.addEventListener('click', function () {
            if (window.history.length > 1) {
                window.history.back();
              } else {
                window.close();
              }
        });
        continueLink.addEventListener('click', function () {
            jsBridge_Common_Oper.continueToUnsafeLink();
        });`);
        webContents.ipc.once("_continueToUnsafeLink", () => {
            if (!m_IgnoreUnsafeDomain.includes(host)) {
                m_IgnoreUnsafeDomain.push(host);
            }
            webContents.reload();
        });
    });
    callback(false);
});
//# sourceMappingURL=CertificateHelper.js.map