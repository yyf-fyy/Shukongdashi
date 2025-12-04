/**
 * APICloud to Web API 适配层
 * 将 APICloud 移动端 API 转换为标准 Web API
 */

(function(window) {
    'use strict';

    // 全局 api 对象，模拟 APICloud 的 api 对象
    var api = {
        // 窗口信息
        winWidth: window.innerWidth || document.documentElement.clientWidth || 375,
        winHeight: window.innerHeight || document.documentElement.clientHeight || 667,
        frameWidth: window.innerWidth || 375,
        frameHeight: window.innerHeight || 667,
        winName: 'main',
        frameName: '',
        
        // 设备信息
        deviceId: 'web-' + Math.random().toString(36).substr(2, 9),
        deviceModel: navigator.userAgent,
        deviceName: navigator.userAgent,
        systemType: /iPhone|iPad|iPod/i.test(navigator.userAgent) ? 'ios' : 'android',
        systemVersion: navigator.platform,
        version: '1.0.0',
        
        // 网络状态
        connectionType: navigator.onLine ? 'wifi' : 'none',
        
        // 应用 ID
        appId: 'A6003205398472',
        
        // 安全区域（Web 环境不需要，返回 0）
        safeArea: {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0
        },
        
        // 页面参数存储
        _pageParams: {},
        _currentPage: null,
        
        /**
         * 打开新窗口（转换为页面跳转）
         */
        openWin: function(options) {
            var url = options.url || '';
            var name = options.name || '';
            var pageParam = options.pageParam || {};
            
            // 存储页面参数
            if (Object.keys(pageParam).length > 0) {
                api._pageParams[name] = pageParam;
                sessionStorage.setItem('pageParam_' + name, JSON.stringify(pageParam));
            }
            
            // 如果是相对路径，转换为绝对路径
            if (url && !url.startsWith('http') && !url.startsWith('/')) {
                var currentPath = window.location.pathname;
                var currentDir = currentPath.substring(0, currentPath.lastIndexOf('/'));
                
                // 处理相对路径
                if (url.startsWith('./')) {
                    url = currentDir + url.substring(1);
                } else {
                    url = currentDir + '/' + url;
                }
            }
            
            // 执行页面跳转
            if (url) {
                window.location.href = url;
            }
        },
        
        /**
         * 关闭窗口（转换为返回上一页）
         */
        closeWin: function(options) {
            if (window.history.length > 1) {
                window.history.back();
            } else {
                // 如果没有历史记录，返回首页
                window.location.href = '../index.html';
            }
        },
        
        /**
         * 打开 Frame Group（Web 环境简化为切换显示）
         */
        openFrameGroup: function(options, callback) {
            var frames = options.frames || [];
            var index = options.index || 0;
            var name = options.name || 'group';
            
            // 存储 frame group 信息
            api._frameGroups = api._frameGroups || {};
            api._frameGroups[name] = {
                frames: frames,
                index: index,
                rect: options.rect || {}
            };
            
            // 执行回调
            if (callback && typeof callback === 'function') {
                callback({ status: true });
            }
        },
        
        /**
         * 设置 Frame Group 索引（Web 环境切换显示）
         */
        setFrameGroupIndex: function(options) {
            var name = options.name || 'group';
            var index = options.index || 0;
            
            if (api._frameGroups && api._frameGroups[name]) {
                api._frameGroups[name].index = index;
                
                // 触发自定义事件
                var event = new CustomEvent('frameGroupChange', {
                    detail: { name: name, index: index }
                });
                window.dispatchEvent(event);
            }
        },
        
        /**
         * AJAX 请求（使用 fetch API）
         */
        ajax: function(options, callback) {
            var url = options.url || '';
            var method = (options.method || 'GET').toUpperCase();
            var data = options.data || {};
            var dataType = options.dataType || 'json';
            var headers = options.headers || {
                'Content-Type': 'application/json'
            };
            
            var fetchOptions = {
                method: method,
                headers: headers
            };
            
            // 处理 POST 数据
            if (method === 'POST' && data) {
                if (headers['Content-Type'] && headers['Content-Type'].includes('application/json')) {
                    fetchOptions.body = JSON.stringify(data);
                } else {
                    fetchOptions.body = new URLSearchParams(data);
                    fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded';
                }
            } else if (method === 'GET' && data) {
                // GET 请求将参数拼接到 URL
                var params = new URLSearchParams(data);
                url += (url.includes('?') ? '&' : '?') + params.toString();
            }
            
            fetch(url, fetchOptions)
                .then(function(response) {
                    if (dataType === 'json') {
                        return response.json();
                    } else {
                        return response.text();
                    }
                })
                .then(function(result) {
                    if (callback && typeof callback === 'function') {
                        callback(result, null);
                    }
                })
                .catch(function(error) {
                    if (callback && typeof callback === 'function') {
                        callback(null, { msg: error.message });
                    }
                });
        },
        
        /**
         * Toast 提示（使用原生 alert 或自定义实现）
         */
        toast: function(options) {
            var msg = typeof options === 'string' ? options : (options.msg || '');
            var duration = options.duration || 2000;
            var location = options.location || 'bottom';
            
            // 创建 toast 元素
            var toast = document.createElement('div');
            toast.style.cssText = 'position:fixed;' +
                (location === 'middle' ? 'top:50%;transform:translateY(-50%);' : 
                 location === 'top' ? 'top:20px;' : 'bottom:50px;') +
                'left:50%;transform:translateX(-50%);' +
                'background:rgba(0,0,0,0.7);color:#fff;' +
                'padding:10px 20px;border-radius:5px;' +
                'z-index:9999;font-size:14px;';
            toast.textContent = msg;
            
            document.body.appendChild(toast);
            
            setTimeout(function() {
                document.body.removeChild(toast);
            }, duration);
        },
        
        /**
         * Alert 弹窗
         */
        alert: function(options) {
            var title = options.title || '提示';
            var msg = options.msg || '';
            alert(title + '\n\n' + msg);
        },
        
        /**
         * 设置状态栏样式（Web 环境不需要）
         */
        setStatusBarStyle: function(options) {
            // Web 环境不处理状态栏
            console.log('setStatusBarStyle called (ignored in web)');
        },
        
        /**
         * 移除启动页（Web 环境不需要）
         */
        removeLaunchView: function() {
            // Web 环境不处理启动页
            console.log('removeLaunchView called (ignored in web)');
        },
        
        /**
         * 关闭应用（Web 环境关闭页面）
         */
        closeWidget: function(options) {
            window.close();
        },
        
        /**
         * 显示进度条
         */
        showProgress: function(options) {
            // 创建进度条遮罩
            var mask = document.createElement('div');
            mask.id = 'api-progress-mask';
            mask.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;' +
                'background:rgba(0,0,0,0.3);z-index:9998;';
            
            var progress = document.createElement('div');
            progress.style.cssText = 'position:fixed;top:50%;left:50%;' +
                'transform:translate(-50%,-50%);' +
                'background:#fff;padding:20px;border-radius:5px;z-index:9999;';
            
            if (options.title) {
                var title = document.createElement('div');
                title.textContent = options.title;
                title.style.cssText = 'margin-bottom:10px;font-size:16px;';
                progress.appendChild(title);
            }
            
            if (options.text) {
                var text = document.createElement('div');
                text.textContent = options.text;
                text.style.cssText = 'font-size:14px;color:#666;';
                progress.appendChild(text);
            }
            
            mask.appendChild(progress);
            document.body.appendChild(mask);
        },
        
        /**
         * 隐藏进度条
         */
        hideProgress: function() {
            var mask = document.getElementById('api-progress-mask');
            if (mask) {
                document.body.removeChild(mask);
            }
        },
        
        /**
         * 获取页面参数
         */
        getPageParam: function(key) {
            var currentPage = api._currentPage || 
                (window.location.pathname.split('/').pop().replace('.html', ''));
            
            var params = api._pageParams[currentPage];
            if (params && key) {
                return params[key];
            }
            return params || null;
        },
        
        /**
         * 监听事件（转换为标准事件监听）
         */
        addEventListener: function(options, callback) {
            var name = options.name || '';
            
            if (name === 'keyback') {
                // 监听浏览器返回键（popstate 事件）
                window.addEventListener('popstate', function(event) {
                    if (callback && typeof callback === 'function') {
                        callback({}, null);
                    }
                });
            } else {
                // 其他事件转换为标准 DOM 事件
                window.addEventListener(name, callback);
            }
        },
        
        /**
         * 移除事件监听
         */
        removeEventListener: function(name, callback) {
            window.removeEventListener(name, callback);
        },
        
        /**
         * 请求原生模块（Web 环境不支持）
         */
        require: function(moduleName) {
            console.warn('api.require(' + moduleName + ') is not supported in web environment');
            return {
                record: function(options, callback) {
                    console.warn('Speech recognition is not supported in web environment');
                    if (callback) {
                        callback({ status: false, msg: 'Not supported in web' }, null);
                    }
                },
                stopRecord: function() {
                    console.warn('Stop record is not supported in web environment');
                }
            };
        }
    };
    
    // 暴露全局 api 对象
    window.api = api;
    
    // apiready 模拟：DOMContentLoaded 后自动执行
    window.apiready = function(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            // DOM 已经加载完成，立即执行
            setTimeout(callback, 0);
        }
    };
    
    // 自动触发 apiready（如果已经定义了函数）
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            if (typeof window.apiready === 'function') {
                window.apiready();
            }
        });
    }
    
    // 监听窗口大小变化
    window.addEventListener('resize', function() {
        api.winWidth = window.innerWidth || document.documentElement.clientWidth || 375;
        api.winHeight = window.innerHeight || document.documentElement.clientHeight || 667;
        api.frameWidth = api.winWidth;
        api.frameHeight = api.winHeight;
    });
    
    // 监听网络状态变化
    window.addEventListener('online', function() {
        api.connectionType = 'wifi';
    });
    
    window.addEventListener('offline', function() {
        api.connectionType = 'none';
    });
    
})(window);



