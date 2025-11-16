(function () {
  // 获取 #ktboard_partCommentBtn 的引用
  const divElement = document.getElementById("ktboard_partCommentBtn");
  const controlBtnElement = document.getElementById("ktboard_control_btn");
  const ktBoardMark = {
    applier: null, // rangy applier
    selectContent: '',  // 选中的内容
    audioPlayer: null,  // 播放器实例
    audioQueue: [], // 播放队列
    isPlaying: false, //是否有正在播放的
    cachedAudioElements: [], //缓存的音频队列
    isPlayEnd: true, // 是否结束播放
    playingID: null,  // 当前播放实例id
    // 初始化
    init: function () {
      rangy.init();
      this.applier = rangy.createClassApplier("ktboard_mark")
    },
    // 回调方法，接收音频播放地址
    handleAudioCallback: function (url) {
      // 创建新的audio元素
      const audio = new Audio(url);
      audio.onended = this.handleAudioEnd;
      if (this.isPlaying) {
        // 如果当前正在播放，则将新的音频添加到队列中
        this.audioQueue.push(audio);
      } else {
        // 如果当前没有播放，则直接播放音频
        this.playAudio(audio);
      }
    },
    // 播放音频
    playAudio: function (audio) {
      this.isPlaying = true;
      this.audioPlayer = audio;
      // 播放音频
      this.audioPlayer.play();
      this.cachedAudioElements.push(audio)
    },
    // 处理音频播放结束事件
    handleAudioEnd: function () {
      this.audioPlayer = null;
      this.isPlaying = false;
      if (this.audioQueue.length > 0) {
        // 如果队列中还有音频，则播放下一个音频
        const nextAudio = this.audioQueue.shift();
        this.playAudio(nextAudio);
      } else {
        divElement.style.display = "inline-flex";
        controlBtnElement.style.display = "none";
        // 队列中没有音频了，所有音频已经播放完毕
        console.log('所有音频已经播放完毕');
      }
    },
    //  控制暂停播放
    controlAudio: function () {
      if (this.audioPlayer) {
        if (this.audioPlayer.paused) {
          // 如果当前音频已经暂停，则继续播放
          this.audioPlayer.play();
        } else {
          // 如果当前音频正在播放，则暂停
          this.audioPlayer.pause();
        }
      } else if (this.audioQueue.length > 0) {
        // 如果队列中有音频，则播放下一个音频
        const nextAudio = this.audioQueue.shift();
        this.playAudio(nextAudio);
      }
    },
    // 清除tag标记
    clearMarkTag: function () {
      const ktboardMarks = document.querySelectorAll(".ktboard_mark");
      ktboardMarks.forEach(function (ktboardMark) {
        const text = ktboardMark.textContent;
        const textNode = document.createTextNode(text);
        ktboardMark.parentNode.replaceChild(textNode, ktboardMark);
      });
    }

  }
  ktBoardMark.init()
  document.addEventListener("mouseup", function (event) {
    const selection = window.getSelection();
    if (selection.type === "Range") {
      ktBoardMark.clearMarkTag()
      // 完成选中操作在这里执行相应的逻辑
      const selection = window.getSelection();
      ktBoardMark.applier.applyToSelection();
      if (selection && !selection.isCollapsed) {
        const range = selection.getRangeAt(0);
        const rects = range.getClientRects();
        if (rects.length > 0) {
          const rect = rects[rects.length - 1];
          const buttonTop = rect.bottom + window.pageYOffset + 'px';
          const buttonLeft = rect.right + window.pageXOffset + 'px';
          divElement.style.display = "inline-flex";
          divElement.style.zIndex = 99999999999;
          divElement.style.top = buttonTop;
          divElement.style.left = buttonLeft;
          controlBtnElement.style.top = buttonTop;
          controlBtnElement.style.left = buttonLeft;
        }
        ktBoardMark.selectContent = selection.toString()
        console.log(selection.toString())
        selection.removeAllRanges()
      }
    }
  });
  // 添加点击事件监听器到 document 上 ,用来取消标记状态
  document.addEventListener("mousedown", function (event) {
    ktBoardMark.clearMarkTag()
    controlBtnElement.style.display = "none";
    document.querySelector('#ktboard_control_btn .playing').classList.remove("kt_show");
    document.querySelector('#ktboard_control_btn .pause').classList.remove("kt_show");
    // 如果当前音频正在播放，则暂停
    ktBoardMark.audioPlayer?.pause();
    ktBoardMark.audioPlayer = null;
    ktBoardMark.audioQueue = [];
    ktBoardMark.isPlaying = false;
    ktBoardMark.cachedAudioElements = [];
    ktBoardMark.isPlayEnd = true
    // 检查点击的元素是否是 #ktboard_partCommentBtn 或其子元素
    const isClickedInsideDiv = divElement.contains(event.target);
    // 如果点击的不是 #ktboard_partCommentBtn 或其子元素，则隐藏该 div
    if (!isClickedInsideDiv) {
      divElement.style.display = "none";
    }
  });
  //点击开始朗读 
  divElement.addEventListener("mousedown", function (e) {
    console.log("按钮被点击了！");
    ktBoardMark.isPlayEnd = false
    divElement.style.display = "none";
    controlBtnElement.style.display = "flex";
    document.querySelector('#ktboard_control_btn .playing').classList.add("kt_show");
    if (ktBoardMark.cachedAudioElements.length) {
      ktBoardMark.audioQueue = ktBoardMark.cachedAudioElements.slice()
      ktBoardMark.cachedAudioElements = []
      ktBoardMark.playAudio(ktBoardMark.audioQueue[0])
    } else {
      ktBoardMark.playingID = new Date().getTime()
      jsBridge.postNotification('CLIENT_PC_READ_ALOUD_TEXT', { text: ktBoardMark.selectContent, id: ktBoardMark.playingID })
    }
    e.preventDefault()
    e.stopPropagation()
  });
  // 获取结果状态
  jsBridge.bind('CLIENT_PC_READ_ALOUD_TEXT', data => {
    console.log('结束了', data)
  });
  // 获取回调结果
  jsBridge.bind('CLIENT_PC_READ_ALOUD_TEXT_PROGRESS', data => {
    if (ktBoardMark.isPlayEnd || data.id != ktBoardMark.playingID) return
    ktBoardMark.handleAudioCallback(data.audioUrl)
  });
  // 点击正在播放按钮暂停
  document.querySelector('#ktboard_control_btn .playing').addEventListener('mousedown', e => {
    e.preventDefault()
    e.stopPropagation()
    document.querySelector('#ktboard_control_btn .playing').classList.remove("kt_show");
    document.querySelector('#ktboard_control_btn .pause').classList.add("kt_show");
    ktBoardMark.controlAudio()
  });
  //点击暂停按钮重新播放
  document.querySelector('#ktboard_control_btn .pause').addEventListener('mousedown', e => {
    e.preventDefault()
    e.stopPropagation()
    document.querySelector('#ktboard_control_btn .pause').classList.remove("kt_show");
    document.querySelector('#ktboard_control_btn .playing').classList.add("kt_show");
    ktBoardMark.controlAudio()
  });
  //阻止事件冒泡
  controlBtnElement.addEventListener('mousedown', e => {
    e.preventDefault()
    e.stopPropagation()
  });



})();

