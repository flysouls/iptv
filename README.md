# iptv 资源整合（陕西移动）

## 资源来源
[iptv](https://github.com/iptv-org/iptv.git)https://github.com/iptv-org/iptv.git

## 目录介绍
m3u 存放手动复制过来的 m3u 资源
pure-m3u 存放剔除过不可用资源的 m3u
all 存放所有 m3u 资源汇总

## 脚本介绍
目前有俩个脚本
- index.js 负责检测 m3u 目录下的资源，过滤掉不可联通的资源(仅作网络联通性检测，需要的话可以在自己的网络下跑一下 即可过滤出适合自己网络的资源)
- merge.js 负责将所有可用的 m3u 资源整合，目前仅有合并功能，并未做 去重或者排序等功能
