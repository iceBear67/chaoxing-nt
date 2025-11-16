(function () {
    // 入参 
    /* 
    {
        container 容器id
        name 发送人的名字
        drag 是否开启拖拽
        getValue 回调函数 用来获取发送的内容 入参value,send 第一个是发送的内容，第二个回调触发后会渲染到屏幕上
    }
    */
    this.commentBox = function (obj) {
        this.container = obj.container;
        this.name = obj.name;
        this.getValue = obj.getValue;
        this.getChecked = obj.getChecked;
        this.drag = obj.drag || false;
        this.isShowPip = obj.isShowPip;
        this.pipChecked = obj.pipChecked;
        this.language = "zh_CN"
        // 用户是否点击过该组件
        this.isClicked = false;
        this.englishMap = {
            "画中画": "Picture in Picture",
            "发送弹幕...": "Post bullet screen...",
            "全员禁言中": "Silenced"
        }
        this.template = `<div id="list-box-content" class="list-box-content">
          <ul>
            
          </ul>
          <div class="comment-input">
            <div id="commentPip" class="comment-pip">
              <input type="checkbox" id="checkBoxPip">
              <label class="checkbox" for="checkBoxPip"></label>
              <span id="picture-in-picture">画中画</span>
              <div class="cut-one"></div>
            </div>
            <input id="comment-input" type="text" placeholder="发送弹幕...">
            <div class="cut"></div>
            <i id="hideBtn" class="hide-list-box"></i>
          </div>
        </div>
        <div id="list-box-hide" class="list-box-hide left-hide">
          <i></i>
        </div>`;
        // 确定正确的前缀(浏览器私有前缀)
        this.transitionEnd = transitionSelect();
        this.hideBtn = null; // 隐藏按钮
        this.hideBtn = null; // 隐藏按钮
        this.commentInput = null; // 输入框
        this.commentInputValue = null; // 上次发送的内容
        this.listBoxContent = null;// 评论文本域
        this.listBoxHide = null;// 取消隐藏按钮
        this.commentUl = null; // ul
        buildOut.call(this);
        initializeEvents.call(this);
    }
    // 隐藏发送栏的方法
    commentBox.prototype.hide = function () {
        this.listBoxContent?.classList.add('left-hide');
        this.listBoxContent.addEventListener(this.transitionEnd, removeAnimate(this.listBoxHide, 'left-hide'));
        this.listBoxContent.removeEventListener(this.transitionEnd, removeAnimate(this.listBoxHide, 'left-hide'));
    }
    // 展开发送栏的方法
    commentBox.prototype.show = function () {
        this.listBoxHide?.classList.add('left-hide');
        this.listBoxHide.addEventListener(this.transitionEnd, removeAnimate(this.listBoxContent, 'left-hide'));
        this.listBoxHide.removeEventListener(this.transitionEnd, removeAnimate(this.listBoxContent, 'left-hide'));
    }
    commentBox.prototype.send = function () {
        var inputVal = this.commentInput.value;
        if (!inputVal || inputVal.trim() == '') {
            return;
        }
        var that = this;
        this.getValue(inputVal, function () {
            RendererProcessHelper.sendToOtherPage("send_meeting_chat_message", { msg: inputVal }, "meetWindow");
            that.render(that.name, inputVal);
            that.commentInput.value = "";
        })
    }
    // 渲染评论
    commentBox.prototype.render = function (name, inputVal) {
        var li = createElement('li');
        li.innerHTML = `<span class="grey line-3"><span class="person_name">${name}：</span>${inputVal}</span>`
        setTimeout(() => {
            li.remove();
        }, 10000);
        this.commentUl.insertBefore(li, this.commentUl.children[0]);
    }
    // 是否显示画中画
    commentBox.prototype.switchPip = function (bool) {
        if (bool) {
            this.commentPip.style.display = 'flex';
            this.commentInput.addEventListener('focus', () => {
                this.commentInput.style.width = "189px";
            });
           
        } else {
            this.commentPip.style.display = 'none';
            this.commentInput.addEventListener('focus', () => {
                this.commentInput.style.width = "237px";
            });
        }
        this.commentInput.addEventListener('blur', () => {
            const width = this.language === "en_US" ? "130px" : "68px";
            this.commentInput.style.width = width;
        });
    }
    // 切换画中画选中框的选中状态
    commentBox.prototype.switchChecked = function (bool) {
        this.checkBoxPip.checked = bool;
    }
    // 是否是禁言状态
    commentBox.prototype.changeInputDes = function (state) {
        let leader = RendererProcessHelper.getUrlQueryString(window.location.href, "leader") || "0";
        console.log('changeInputDes', state, leader);
        // 只有学生才会显示禁言状态
        if (state == 'true' && leader == 0) {
            const placeholder = this.language === "en_US" ? this.englishMap["全员禁言中"] : "全员禁言中";
            this.commentInput.placeholder = placeholder;
            this.commentInput.style.width = "70px";
              // 禁用输入框
            this.commentInput.disabled = true;
             // 设置鼠标样式为禁用状态
            this.commentInput.style.cursor = "not-allowed";
         } else {
            const placeholder = this.language === "en_US" ? this.englishMap["发送弹幕..."] : "发送弹幕...";
            const width = this.language === "en_US" ? "130px" : "68px";
            this.commentInput.placeholder = placeholder;
            this.commentInput.style.width = width;
             // 启用输入框
            this.commentInput.disabled = false;
             // 恢复鼠标样式
            this.commentInput.style.cursor = "auto";
         }
    }
    commentBox.prototype.getIsClicked = function () {
        return this.isClicked;
    }
    commentBox.prototype.setIsClicked = function (bool) {
        this.isClicked = bool;
    }
    // 初始化组件
    var buildOut = async function () {
        const container = document.getElementById(this.container);
        container.addEventListener("mousedown", () => {
            this.isClicked = true;
        });
        var contentHolder;
        contentHolder = createElement('div', null, this.template);
        document.getElementById(this.container).appendChild(contentHolder);
        // 获取dom对象
        this.hideBtn = document.getElementById('hideBtn'); // 隐藏按钮
        this.commentInput = document.getElementById('comment-input'); // 输入框
        this.listBoxContent = document.getElementById('list-box-content');// 评论文本域
        this.listBoxHide = document.getElementById('list-box-hide');// 取消隐藏按钮
        this.commentPip = document.getElementById('commentPip');// 隐藏画中画
        this.checkBoxPip = document.getElementById('checkBoxPip');// 画中画的选择框
        this.switchChecked(this.pipChecked); // 画中画选择框选中状态
        if (!this.isShowPip) {
            this.switchPip(false);
        }
        this.commentUl = this.listBoxContent.children[0]; // ul
        // 获取初始化时是否禁言
        RendererProcessHelper.sendToOtherPage("getIsProhibition", null, "meetWindow")
        let language = RendererProcessHelper.getUrlQueryString(window.location.href, "language");
        if (language !== null && language !== undefined) {
            language = formatLanguage(language);
        } else {
            language = await MainWindowHelper.getLanguage()
        }
        this.language = language;
        if (this.language == "en_US") {
            let el = document.getElementById("picture-in-picture")
            if (el) {
                el.innerHTML = this.englishMap("画中画");
            }
            el = document.getElementById("comment-input");
            if (el) {
                el.setAttribute("placeholder", this.englishMap("发送弹幕..."));
            }            
        }
    }
    // 初始化事件
    var initializeEvents = function () {
        var that = this;
        // 隐藏按钮
        this.hideBtn.addEventListener('click', function () {
            return that.hide();
        });
        this.listBoxHide.addEventListener('click', function () {
            return that.show();
        });
        this.commentInput.addEventListener('keydown', function (e) {
            return keyup_submit.call(that);
        })
        this.checkBoxPip.addEventListener('click', function () {
            return that.getChecked(that.checkBoxPip.checked);
        });
        // 拖拽
        if (this.drag) {
            var isdragbox = false;
            var offsetx = 0, offsety = 0;
            var drag = this.listBoxContent;
            drag.onmousedown = function (event) {
                console.log(event)
                if (event.target != that.commentInput) {
                    var event = event || window.event;  //兼容IE浏览器
                    //    鼠标点击物体那一刻相对于物体左侧边框的距离=点击时的位置相对于浏览器最左边的距离-物体左边框相对于浏览器最左边的距离
                    var diffX = event.clientX - drag.offsetLeft;
                    var diffY = event.clientY - drag.offsetTop;
                    if (typeof drag.setCapture !== 'undefined') {
                        drag.setCapture();
                    }
                    document.onmousemove = function (event) {
                        var event = event || window.event;
                        var moveX = event.clientX - diffX;
                        var moveY = event.clientY - diffY;
                        if (moveX < 0) {
                            moveX = 0
                        } else if (moveX > window.innerWidth - drag.offsetWidth) {
                            moveX = window.innerWidth - drag.offsetWidth
                        }
                        if (moveY < 0) {
                            moveY = 0
                        } else if (moveY > window.innerHeight - drag.offsetHeight) {
                            moveY = window.innerHeight - drag.offsetHeight
                        }
                        drag.style.left = moveX + 'px';
                        drag.style.top = moveY + 'px'
                    }
                    document.onmouseup = function (event) {
                        this.onmousemove = null;
                        this.onmouseup = null;
                        //修复低版本ie bug  
                        if (typeof drag.releaseCapture != 'undefined') {
                            drag.releaseCapture();
                        }
                    }
                }
            }
        }
    }
    // 监听键盘事件
    var keyup_submit = function () {
        var evt = window.event || e;
        if (evt.keyCode == 13) {
            //回车事件
            return this.send();
        }
    }
    // 获取不同浏览器的transitionEnd事件
    var transitionSelect = function () {
        var el = document.createElement('div');
        var transitions = {
            'WebkitTransition': 'webkitTransitionEnd',
            'MozTransition': 'transitionend',
            'MSTransition': 'msTransitionEnd',
            'OTransition': 'oTransitionEnd',
            'transition': 'transitionEnd'
        }
        for (var i in transitions) {
            if (el.style[i] !== undefined) {
                return transitions[i];
            }
        }
    };
    var removeAnimate = function (domobj, classStr) {
        domobj?.classList.remove(classStr)
    }
    // 创建元素
    var createElement = function (tag, classList, content) {
        document.createDocumentFragment()
        var el = document.createElement(tag);
        if (classList) {
            el.className = classList;
        }
        if (content) {
            el.innerHTML = content;
        }
        return el;
    }
    var formatLanguage = function(lang) {
        if (lang === "1") {
            return "en_US"
        }
        return "zh_CN"
    }
})()