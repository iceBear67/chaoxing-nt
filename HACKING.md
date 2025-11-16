你可以使用 decrypt.js 解出超星客户端 electron 对 javascript 的加密（aes-128-ecb + 空 IV, 密钥通过文件名计算）。

如果必须要运行 jscx，请在运行之前使用 `calculate_verify.js` 计算出新的 verify_data 以防止超星拒绝启动。

本仓库包含对客户端的部分修改，自己看 commits.

Sandboxie 里面跑不起来请使用 `--disable-gpu-sandbox`. 运行之前先在 `dist` 目录下启动 HTTP 服务器否则没有 UI
