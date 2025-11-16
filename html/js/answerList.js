// 初始化配置
function extendDefaults(source, properties) {
    var property;
    for (property in properties) {
        if (properties.hasOwnProperty(property)) {
            source[property] = properties[property];
        }
    }
    return source;
};
// 获取不同浏览器的transitionEnd事件
function transitionSelect() {
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
// 创建一个dom元素 入参为 标签名，class名，内容
function createDomElement(tag, classList, content) {
    var el = document.createElement(tag);
    if (classList) {
        el.className = classList;
    }
    if (content) {
        el.innerHTML = content;
    }
    return el;
};
// 将某个节点插入到父节点首位
function appendBefore(parent, newNode) {
    var firstChild = parent.firstChild;
    parent.insertBefore(newNode, firstChild);
};

//列表-------------------------------------------------------------
var ProxyCreateALObj = (function () {
    var instance = null;
    return function (params) {
        if (instance) {
            return instance;
        }
        return instance = new answerListObj(params);
    }
})();
var answerListObj = function (params) {
    this.max = Number(params.max); // 最大渲染数
    this.queue = []; // 渲染队列
    this.checkAllHandle = params.checkAllHandle;
    this.refuseAllHandle = params.refuseAllHandle;
    this.container = document.getElementById(params.id); //通过容器id获取容器
    this.listContainer = createDomElement('div');
    this.hcount = null; // 查看全部的人数
    this.slock = true; // 标志是否渲染“查看全部”那栏的锁,保证只渲染一次
    this.transitionEnd = transitionSelect(); // 获取浏览器动画结束事件
    this.container.appendChild(this.listContainer);
};
answerListObj.prototype.render = function (args, isFront) {
    // args 是需要渲染到页面上的内容
    // {
    //     puid,
    //     imgUrl,
    //     pname,
    //     time,
    //     fn1,
    //     fn2
    // }
    // isFront 是否从前插入
    if (this.queue.length >= this.max) {
        var el;
        if (isFront) {
            el = this.queue.shift();
        } else {
            el = this.queue.pop();
        }
        el.remove();
    }
    // 渲染举手发言列表
    var item = createDomElement('div', 'answer-list-item fade-modal');
    item.setAttribute('puid', args.puid);
    var pn = createDomElement('span', 'name', args.pname);
    var txt = createDomElement('span', '', '举手发言');
    var op = createDomElement('span', 'operation');
    var op1 = createDomElement('span', 'red-font', '拒绝');
    op1.addEventListener('click', function () {
        return args.fn1(args.puid);
    })
    var cut = createDomElement('span', 'cut');
    var op2 = createDomElement('span', '', '同意');
    op2.addEventListener('click', function () {
        return args.fn2(args.puid);
    })
    op.appendChild(op1);
    op.appendChild(cut);
    op.appendChild(op2);
    item.appendChild(pn);
    item.appendChild(txt);
    item.appendChild(op);
    if (isFront) {
        this.queue.push(item); // 收集被渲染的item元素
        appendBefore(this.listContainer, item);
    } else {
        this.queue.unshift(item); // 收集被渲染的item元素
        this.listContainer.appendChild(item);
    }
    // 挂载动画
    // window.getComputedStyle(this.container).height;
    item.className = item.className + ' fade-open';

    // 查看全部
    if (this.queue.length >= this.max && this.slock) {
        this.slock = false;
        this.aitem = createDomElement('div', 'answer-list-item');
        var check = createDomElement('span', 'check', '查看全部');
        check.addEventListener('click', this.checkAllHandle);
        this.hcount = createDomElement('span', 'headcount', '（3人)');
        check.appendChild(this.hcount);
        var cutl = createDomElement('span', 'cut');
        var refuse = createDomElement('span', 'refuse', '全部拒绝');
        refuse.addEventListener('click', this.refuseAllHandle);
        this.aitem.appendChild(check);
        this.aitem.appendChild(cutl);
        this.aitem.appendChild(refuse);
        this.container.appendChild(this.aitem);
        window.getComputedStyle(this.container).height;
        this.aitem.className = this.aitem.className + ' fade-open';
    }
    return item;
};
answerListObj.prototype.showCheckAll = function (num) {
    // 查看全部
    if (this.slock) {
        this.slock = false;
        this.aitem = createDomElement('div', 'answer-list-item fade-modal');
        var check = createDomElement('span', 'check', '查看全部');
        check.addEventListener('click', this.checkAllHandle);
        this.hcount = createDomElement('span', 'headcount', '（3人)');
        check.appendChild(this.hcount);
        var cutl = createDomElement('span', 'cut');
        var refuse = createDomElement('span', 'refuse', '全部拒绝');
        refuse.addEventListener('click', this.refuseAllHandle);
        this.aitem.appendChild(check);
        this.aitem.appendChild(cutl);
        this.aitem.appendChild(refuse);
        this.container.appendChild(this.aitem);
        window.getComputedStyle(this.container).height;
        this.aitem.className = this.aitem.className + ' fade-open';
    }
    this.changeCount(num);
}
answerListObj.prototype.changeCount = function (num) {
    var tit = '（' + num + '人' + ')';
    if (this.hcount) {
        this.hcount.innerHTML = tit;
    }
};
answerListObj.prototype.deleteItem = function (puid) {
    for (var i = 0; i < this.listContainer.children.length; i++) {
        if (puid == this.listContainer.children[i].getAttribute('puid')) {
            this.listContainer.children[i].remove();
        }
    }
    for (var i = 0; i < this.queue.length; i++) {
        if (puid == this.queue[i].getAttribute('puid')) {
            this.queue.splice(i, 1);
        }
    }
};
answerListObj.prototype.desCheckAll = function () {
    if (!this.slock) {
        this.slock = true;
        this.aitem.remove();
    }
};
answerListObj.prototype.clear = function () {
    var child = this.listContainer.firstElementChild;
    while (child) {
        child.remove();
        child = this.listContainer.firstElementChild;
    };
    this.desCheckAll();
    this._init();
};
answerListObj.prototype._init = function () {
    this.queue = []; // 渲染队列
    this.hcount = null; // 查看全部的人数
    this.slock = true; // 标志是否渲染“查看全部”那栏的锁,保证只渲染一次
};

//弹窗（全部举手）-------------------------------------------------------------
var ProxyCreateALWindow = (function () {
    var instance = null;
    return function (params) {
        if (instance) {
            return instance;
        }
        return instance = new anwserListWindow(params);
    }
})();
var anwserListWindow = function () {
    this.closeButton = null; // 关闭按钮
    this.modal = null; // 模态弹出框
    this.overlay = null; // 模态弹出框蒙层
    this.contentHolder = createDomElement('ul', 'modal-content'); // 内容区
    this.header = createDomElement('div', 'modal-header');
    this.title = createDomElement('div', 'modal-title');
    // 确定正确的前缀(浏览器私有前缀)
    this.transitionEnd = transitionSelect();
    // 默认选项 都可以作为参数传入
    var defaults = {
        className: 'fade-and-drop', // 动画效果
        footerTxt: ['取消', '确认'], // 按钮文本
        title: '',              // 模态框的标题
        number: -1,          // 标题需要显示的计数
        width: 280,          // 最小宽度
        contentHeight: 354,     // 内容区最大高度
        overlay: true,          // 是否需要一个蒙层
        cancelHandle: null,     // 点取消之后的处理
        confirmHandle: null,    // 点确定之后的处理
        background: '#fff',     // 背景颜色
    }

    if (arguments[0] && typeof arguments[0] === 'object') { // 获取自定义的配置，并且修改配置项
        this.options = extendDefaults(defaults, arguments[0]);
    }
};
// 公用方法
anwserListWindow.prototype.open = function () {
    // 创建modal
    this._buildOut();

    // 初始化事件监听器
    this._initializeEvents();

    //向DOM中添加元素之后，使用getComputedStyle强制浏览器重新计算并识别刚刚添加的元素，这样CSS动画就有了一个起点著作权归作者所有。
    window.getComputedStyle(this.modal).height;

    this.modal.className = this.modal.className + (this.modal.offsetHeight > window.innerHeight ? ' modal-open modal-anchored' : ' modal-open');
    if (this.overlay) {
        this.overlay.className = this.overlay.className + ' modal-open';
    }
};
anwserListWindow.prototype.close = function () {
    var that = this;

    this.modal.className = this.modal.className.replace('modal-open', '');
    if (this.overlay) {
        this.overlay.className = this.overlay.className.replace('modal-open', '');
    }
    this.modal.addEventListener(this.transitionEnd, function () {
        that.modal.parentNode.removeChild(that.modal);
    });
    if (this.overlay) {
        this.overlay.addEventListener(this.transitionEnd, function () {
            if (that.overlay.parentNode) {
                that.overlay.parentNode.removeChild(that.overlay);
            }
        });
    }
};
anwserListWindow.prototype.render = function (args) {
    // args 是需要渲染到页面上的内容
    // {
    //     puid,
    //     imgUrl,
    //     pname,
    //     time,
    //     fn1,
    //     fn2
    // }
    var li = createDomElement('li');
    li.setAttribute('puid', args.puid);
    var pic = createDomElement('div', 'head-pic');
    var img = createDomElement('img');
    img.setAttribute('src', args.imgUrl);
    pic.appendChild(img);
    li.appendChild(pic);

    var info = createDomElement('div', 'user-info');
    var pname = createDomElement('span', '', args.pname);
    var span = createDomElement('span', 'greyf', '举手发言');
    var time = createDomElement('p', '', args.time);
    info.appendChild(pname);
    info.appendChild(span);
    info.appendChild(time);
    li.appendChild(info);

    var operation = createDomElement('div', 'operation');
    var refuse = createDomElement('span', '', '拒绝');
    refuse.addEventListener('click', function () {
        return args.fn1(args.puid);
    });
    var cut = createDomElement('span', 'cut');
    var confirm = createDomElement('span', '', '同意');
    confirm.addEventListener('click', function () {
        return args.fn2(args.puid);
    });
    operation.appendChild(refuse);
    operation.appendChild(cut);
    operation.appendChild(confirm);
    li.appendChild(operation);
    appendBefore(this.contentHolder, li);
    return li;
};
anwserListWindow.prototype.changeCount = function (num) {
    var tit = this.options.title;
    tit += '（' + num + ')';
    this.title.innerHTML = tit;
    this.header.appendChild(this.title);
};
anwserListWindow.prototype.deleteItem = function (puid) {
    for (var i = 0; i < this.contentHolder.children.length; i++) {
        if (puid == this.contentHolder.children[i].getAttribute('puid')) {
            this.contentHolder.children[i].remove();
        }
    }
};
anwserListWindow.prototype.clear = function () {
    var child = this.contentHolder.firstElementChild;
    while (child) {
        child.remove();
        child = this.contentHolder.firstElementChild;
    };
};
// 私有方法
anwserListWindow.prototype._buildOut = function () {
    var docFrag;

    // 创建一个content的容器
    docFrag = document.createDocumentFragment();

    // 创建modal元素
    this.modal = createDomElement('div', 'modal ' + this.options.className);
    // 设置尺寸
    this.modal.style.width = this.options.width + 'px';
    // 背景颜色
    this.modal.style.background = this.options.background;

    // 添加蒙层
    if (this.options.overlay === true) {
        this.overlay = createDomElement('div', 'modal-overlay ' + this.options.className);
        docFrag.appendChild(this.overlay);
    }

    // 添加头部
    // 标题
    if (this.options.number !== -1) {
        this.changeCount(this.options.number);
    } else {
        this.title = createDomElement('div', 'modal-title', this.options.title);
        this.header.appendChild(this.title);
    }
    // 如果options中的closeButton为true，则添加关闭按钮
    this.closeButton = createDomElement('button', 'modal-close close-button');
    this.header.appendChild(this.closeButton);
    this.modal.appendChild(this.header);

    // 添加内容 创建模态框的内容区域，并插入到模态框中
    this.contentHolder.style.height = this.options.contentHeight + 'px';
    this.modal.appendChild(this.contentHolder);
    // 添加底部
    this.footer = createDomElement('div', 'modal-footer clearfloat');
    // 添加底部按钮
    // 取消按钮
    this.cancel = createDomElement('button', 'cancel', this.options.footerTxt[0]);
    this.cancel.addEventListener('click', this.options.cancelHandle);
    this.footer.appendChild(this.cancel);
    // 确定按钮
    this.confirm = createDomElement('button', 'confirm', this.options.footerTxt[1]);
    this.confirm.addEventListener('click', this.options.confirmHandle);
    this.footer.appendChild(this.confirm);
    this.modal.appendChild(this.footer);

    // 把模态框插入到DocumentFragment容器中
    docFrag.appendChild(this.modal);
    // 把DocumentFragment插入到body中
    document.body.appendChild(docFrag);
};
// 初始化事件
anwserListWindow.prototype._initializeEvents = function () {
    if (this.closeButton) {
        this.closeButton.addEventListener('click', this.close.bind(this));
    }
};
