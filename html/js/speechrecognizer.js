function SpeechRecognizer(params) {
	this.appid = params.appid || '';
	this.appkey = params.appkey || '';
	this.dev_pid = params.dev_pid || 15372;
	this.cuid = params.cuid || this.uuid();
	this.socket = null;
	this.isSentenceBegin = false; // 是否一句话开始
	this.isRecognizeComplete = false; // 当前是否识别结束
	this.isRun=false;
	// 会关闭连接的错误码
	this.closeNoArray = [-3004, -3006, -3008, -3014];
	this.uuid = function () {
		let s = [];
		let hexDigits = "0123456789abcdef";
		for (let i = 0; i < 36; i++) {
			s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
		}
		s[14] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
		s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
		s[8] = s[13] = s[18] = s[23] = "-";

		let uuid = s.join("");
		return uuid;
	}
	this.URL = "ws://vop.baidu.com/realtime_asr" + "?sn=" + this.uuid();
	this.childParams = {
		"appid": this.appid,
		"appkey": this.appkey,
		"dev_pid": this.dev_pid,
		"cuid": this.cuid,
		"format": "pcm",
		"sample": 16000
	};

	this.initParams = {
		"type": "START",
		"data": this.childParams
	}

	this.endParams = {
		"type": "FINISH"
	}
	// 暂停识别，关闭连接
	this.stop = function () {
		if (this.socket && this.socket.readyState === 1) {
			this.socket.send(JSON.stringify(this.endParams));
		} else {
			this.OnError('连接未建立或连接已关闭');
			if (this.socket && this.socket.readyState === 1) {
				this.socket.close();
			}
		}
	}

	// 建立websocket链接 data 为用户收集的音频数据
	this.start = async function () {
		const self = this;
		if ('WebSocket' in window) {
			this.socket = new WebSocket(`${this.URL}`, 'websocket');
		} else {
			this.OnError('浏览器不支持WebSocket')
			return
		}
		this.socket.onopen = (e) => { // 连接建立时触发
			this.socket.send(JSON.stringify(this.initParams));
			this.OnRecognitionStart();
		};
		this.socket.onmessage = (e) => { // 连接建立时触发
			const response = JSON.parse(e.data);
			console.log(response)
			if (this.closeNoArray.indexOf(response.err_no) !== -1) {
				// 关闭连接的错误码
				this.OnError(response.err_msg);
				self.socket.close();
				return;
			} else if (response.err_no !== 0) {
				// 可忽略的错误码
				return;
			} else {
				if (!this.isSignSuccess) {
					this.OnRecognitionStart(response);
					this.isSignSuccess = true;
				}
				if (response.final === 1) {
					this.isRecognizeComplete = true;
					this.OnRecognitionComplete(response);
					return;
				}
				if (response.result) {
					const res = {
						...response.result,
						voice_id: response.voice_id
					}
					if (response.result.slice_type === 0) {
						this.OnSentenceBegin(res);
						this.isSentenceBegin = true;
					} else if (response.result.slice_type === 2) {
						if (!this.isSentenceBegin) {
							this.OnSentenceBegin(res);
						}
						this.OnSentenceEnd(res);
					} else {
						this.OnRecognitionResultChange(res);
					}
				}
			}
		};
		this.socket.onerror = (e) => { // 通信发生错误时触发
			this.socket.close();
			this.OnError(e);
		}
		this.socket.onclose = (event) => {
			if (!this.isRecognizeComplete) {
				this.OnError(event);
			}
		}
	}
	// 发送数据
	this.write = function (data) {
		if (!this.socket || this.socket.readyState !== 1) {
			//this.OnError('连接未建立，请稍后发送数据！')
			console.error('连接未建立，请稍后发送数据！')
			return
		}
		this.socket.send(data);
	}
	// 开始识别的时候
	this.OnRecognitionStart = function () {

	}
	// 一句话开始的时候
	this.OnSentenceBegin = function (res) {

	}
	// 识别结果发生变化的时候
	this.OnRecognitionResultChange = function () {

	}
	// 一句话结束的时候
	this.OnSentenceEnd = function () {

	}
	// 识别结束的时候
	this.OnRecognitionComplete = function () {

	}
	// 识别失败
	this.OnError = function (res) {

	}
}

module.exports = SpeechRecognizer;
