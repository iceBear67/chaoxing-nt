let checkBox = null;

//----------------------------------业务-------------------------------------------
window.RendererHelper.on("pageLoadFinish", data => {
  console.log("data", data);
  if (data.isShowCheckBox == true) {
    checkBox = document.getElementById('checkBox');
    checkBox.style.display = 'block';
    checkBox.addEventListener('click', function () {
      if (hasClass(checkBox, 'checked')) {
        checkBox?.classList.remove('checked');
      } else {
        checkBox?.classList.add('checked');
      }
    })
  }
  // 背景颜色
  if (data.backgroundColor && data.backgroundColor !== '') {
    const pop_overs = document.querySelector('.pop_overs');
    const p = document.querySelector('#show_title');
    const show_content = document.querySelector('#show_content');
    const btn_cancel = document.querySelector('#btn_cancel');
    pop_overs.style.background = data.backgroundColor;
    pop_overs.style.border = '1px solid #e2e2e2';
    p.style.color = '#474C59';
    show_content.style.color = '#474C59';
    btn_cancel.style.color = '#333';
    btn_cancel?.classList.add('white');
  }
  let title = data.title || window.i18nAPI.t("prompt")
  document.getElementById("show_title").innerHTML = title
  document.getElementById("show_title").style.fontWeight = 600
  document.getElementById("show_content").innerHTML = data.content
  if (data.titleStyle) {
    document.getElementById("show_title").style = data.titleStyle;
  }
  if (data.contentStyle) {
    document.getElementById("show_content").style = data.contentStyle;
  }

  // 通用弹窗多按钮支持， 并兼容之前版本
  if (data.okBtns) {
    data.okBtns.forEach(function (okBtn, index) {
      createButton(okBtn.text, data.id, okBtn);
    });
  } else {
    let okBtnEle = createButton(data.okBtn || window.i18nAPI.t("confirm"), data.id, undefined);
    if (data.okBtnStyle) {
      okBtnEle.style = data.okBtnStyle;
    }
  }

  if (data.type == "alert") {
    document.getElementById("btn_cancel").style.display = "none"
  } else {
    document.getElementById("btn_cancel").innerHTML = data.cancelBtn || window.i18nAPI.t("cancel")
    if (data.cancelBtnStyle) {
      document.getElementById("btn_cancel").style = data.cancelBtnStyle;
    }
    if (data.isShowCancelBtn === false) {
      document.getElementById("btn_cancel").style.display = 'none'
    }

    document.getElementById("btn_cancel").onclick = () => {
      let signal = "_openCommonDialog_" + data.id;
      // window.RendererHelper.sendToOtherWindow(signal, null, "cancel")
      window.RendererHelper.sendToMainProcess(signal, "cancel")
      window.close()
    }
  }

})

//----------------------------------视图-------------------------------------------
function hasClass(element, cls) {
  // 判断dom是否拥有某个class
  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}

function createButton(text, id, okBtn) {
  let buttonElement = document.createElement("a");
  buttonElement.href = "javascript:;";
  buttonElement.innerHTML = text;
  buttonElement.className = "ok assisOvers";
  if (okBtn?.style) {
    buttonElement.style = okBtn.style;
  }
  buttonElement.onclick = function () {
    let isChecked = null;
    if (checkBox !== null) {
      isChecked = hasClass(checkBox, 'checked');
    }
    let signal = "_openCommonDialog_" + id;
    if (okBtn) {
      window.RendererHelper.sendToMainProcess(signal, { '_ok': true, 'isChecked': isChecked, okBtn: okBtn });
    } else {
      window.RendererHelper.sendToMainProcess(signal, { '_ok': true, 'isChecked': isChecked });
    }
    window.close();
  };

  // 将按钮添加到按钮容器中
  document.querySelector(".buttonsArr").appendChild(buttonElement);
  return buttonElement;
}
