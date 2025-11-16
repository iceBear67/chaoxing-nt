Vue.use(VueViewer.default);
Viewer.setDefaults({
    "inline": false, //启动inline模式
    "button": false, //显示右上角关闭按钮
    "navbar": false, //显示缩略图导航
    "title": false, //显示图片的标题
    "toolbar": false, //显示工具栏
    "tooltip": true, //显示缩放比例
    "movable": true, //图片是否可移动
    "zoomable": true, //图片是否可缩放
    "rotatable": true, //图片是否可旋转
    "scalable": true, //图片是否可以翻转
    "transition": false, //使用css3过度
    "fullscreen": true, //播放时是否全屏
    "keyboard": true, //是否支持全屏
    //回调函数 将要影藏时
    hide(e) {
        // document.getElementsByClassName('worksviewBtnWrap')[0].style.display = 'none'

    }
})
let app = new Vue({
    el: '#app',
    data() {
        return {
            viewer: null,
            prevDom: null,
            nextDom: null
        }
    },
    created() {
        // this.setImgUrl(['https://t7.baidu.com/it/u=334080491,3307726294&fm=193&f=GIF',
        // 'https://t7.baidu.com/it/u=4162611394,4275913936&fm=193&f=GIF',
        // 'https://t7.baidu.com/it/u=2405382010,1555992666&fm=193&f=GIF'])
    },
    mounted() {
        this.prevDom = document.querySelector('.prev > .prevNextIcon');
        this.nextDom = document.querySelector('.next > .prevNextIcon');
    },
    methods: {
        urlToBlob(url) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("GET", url, true);
                xhr.responseType = "blob";
                xhr.onload = function () {
                    if (xhr.status === 200) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error("Failed to load URL"));
                    }
                };
                xhr.send();
            });
        },
        setImgUrl(imgUrl) {
            this.imgUrl = imgUrl;
            if (this.viewer !== null) {
                this.viewer.destroy();
                this.viewer = null;
            }
            this.viewer = this.$viewerApi({
                images: imgUrl
            });
        },
        goto(index) {
            this.viewer.view(index);
        },
        hidePrevNextIcon() {
            console.log('hideprevNextIcon', this.viewer.index, this.viewer, this.prevDom, this.nextDom);
            if (this.viewer.index === 0) {
                this.prevDom.style.display = "none";
            } else {
                this.prevDom.style.display = "flex";
            }
            if (this.viewer.index === this.viewer.length - 1) {
                this.nextDom.style.display = "none";
            } else {
                this.nextDom.style.display = "flex";
            }
        },
        //放大
        viewZoomIn() {
            this.viewer.zoom(0.1);
        },
        //缩小
        viewZoomOut() {
            this.viewer.zoom(-0.1);
        },
        //逆时针旋转
        viewFlip() {
            this.viewer.rotate(-90);
        },
        // 下载
        async viewDownload(index) {
            // window.location.href = this.imgUrl[index];
            const a = document.createElement('a') // 创建一个a标签
            let imageSrc = this.imgUrl[this.viewer.index];
            a.download = 'cx_img_' + new Date().getTime() + '.png';
            a.target = "_blank";
            if (imageSrc.startsWith('cximg://') || imageSrc.startsWith('headerimg://')) {
                a.href = imageSrc;
            } else {
                // await：必须要等到转化为blob对象之后才进行点击事件
                await this.urlToBlob(imageSrc).then((blob) => {
                    let binaryData = [];
                    binaryData.push(blob);
                    a.href = window.URL.createObjectURL(new Blob(binaryData));
                }).catch((error) => {
                    console.error(error);
                });
            }
            document.body.appendChild(a) // 添加a标签到body下
            a.click() // 触发a标签点击事件
            document.body.removeChild(a) //  完成后删除a标签
        },
        recover() {
            this.viewer.reset();
        },
        // 上一张
        prev() {
            this.viewer.prev();
            this.$nextTick(() => {
                this.hidePrevNextIcon();
            });
        },
        // 下一张
        next() {
            this.viewer.next();
            this.$nextTick(() => {
                this.hidePrevNextIcon();
            });
        }
    },
})