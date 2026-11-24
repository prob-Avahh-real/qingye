(() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __esm = (fn, res) => function __init() {
    return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };

  // node_modules/@capacitor/core/dist/index.js
  var dist_exports = {};
  __export(dist_exports, {
    Capacitor: () => Capacitor,
    CapacitorCookies: () => CapacitorCookies,
    CapacitorException: () => CapacitorException,
    CapacitorHttp: () => CapacitorHttp,
    CapacitorPlatforms: () => CapacitorPlatforms,
    ExceptionCode: () => ExceptionCode,
    Plugins: () => Plugins,
    WebPlugin: () => WebPlugin,
    WebView: () => WebView,
    addPlatform: () => addPlatform,
    buildRequestInit: () => buildRequestInit,
    registerPlugin: () => registerPlugin,
    registerWebPlugin: () => registerWebPlugin,
    setPlatform: () => setPlatform
  });
  var createCapacitorPlatforms, initPlatforms, CapacitorPlatforms, addPlatform, setPlatform, legacyRegisterWebPlugin, ExceptionCode, CapacitorException, getPlatformId, createCapacitor, initCapacitorGlobal, Capacitor, registerPlugin, Plugins, registerWebPlugin, WebPlugin, WebView, encode, decode, CapacitorCookiesPluginWeb, CapacitorCookies, readBlobAsBase64, normalizeHttpHeaders, buildUrlParams, buildRequestInit, CapacitorHttpPluginWeb, CapacitorHttp;
  var init_dist = __esm({
    "node_modules/@capacitor/core/dist/index.js"() {
      createCapacitorPlatforms = (win) => {
        const defaultPlatformMap = /* @__PURE__ */ new Map();
        defaultPlatformMap.set("web", { name: "web" });
        const capPlatforms = win.CapacitorPlatforms || {
          currentPlatform: { name: "web" },
          platforms: defaultPlatformMap
        };
        const addPlatform2 = (name, platform) => {
          capPlatforms.platforms.set(name, platform);
        };
        const setPlatform2 = (name) => {
          if (capPlatforms.platforms.has(name)) {
            capPlatforms.currentPlatform = capPlatforms.platforms.get(name);
          }
        };
        capPlatforms.addPlatform = addPlatform2;
        capPlatforms.setPlatform = setPlatform2;
        return capPlatforms;
      };
      initPlatforms = (win) => win.CapacitorPlatforms = createCapacitorPlatforms(win);
      CapacitorPlatforms = /* @__PURE__ */ initPlatforms(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      addPlatform = CapacitorPlatforms.addPlatform;
      setPlatform = CapacitorPlatforms.setPlatform;
      legacyRegisterWebPlugin = (cap, webPlugin) => {
        var _a;
        const config = webPlugin.config;
        const Plugins2 = cap.Plugins;
        if (!(config === null || config === void 0 ? void 0 : config.name)) {
          throw new Error(`Capacitor WebPlugin is using the deprecated "registerWebPlugin()" function, but without the config. Please use "registerPlugin()" instead to register this web plugin."`);
        }
        console.warn(`Capacitor plugin "${config.name}" is using the deprecated "registerWebPlugin()" function`);
        if (!Plugins2[config.name] || ((_a = config === null || config === void 0 ? void 0 : config.platforms) === null || _a === void 0 ? void 0 : _a.includes(cap.getPlatform()))) {
          Plugins2[config.name] = webPlugin;
        }
      };
      (function(ExceptionCode2) {
        ExceptionCode2["Unimplemented"] = "UNIMPLEMENTED";
        ExceptionCode2["Unavailable"] = "UNAVAILABLE";
      })(ExceptionCode || (ExceptionCode = {}));
      CapacitorException = class extends Error {
        constructor(message, code, data) {
          super(message);
          this.message = message;
          this.code = code;
          this.data = data;
        }
      };
      getPlatformId = (win) => {
        var _a, _b;
        if (win === null || win === void 0 ? void 0 : win.androidBridge) {
          return "android";
        } else if ((_b = (_a = win === null || win === void 0 ? void 0 : win.webkit) === null || _a === void 0 ? void 0 : _a.messageHandlers) === null || _b === void 0 ? void 0 : _b.bridge) {
          return "ios";
        } else {
          return "web";
        }
      };
      createCapacitor = (win) => {
        var _a, _b, _c, _d, _e;
        const capCustomPlatform = win.CapacitorCustomPlatform || null;
        const cap = win.Capacitor || {};
        const Plugins2 = cap.Plugins = cap.Plugins || {};
        const capPlatforms = win.CapacitorPlatforms;
        const defaultGetPlatform = () => {
          return capCustomPlatform !== null ? capCustomPlatform.name : getPlatformId(win);
        };
        const getPlatform = ((_a = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _a === void 0 ? void 0 : _a.getPlatform) || defaultGetPlatform;
        const defaultIsNativePlatform = () => getPlatform() !== "web";
        const isNativePlatform = ((_b = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _b === void 0 ? void 0 : _b.isNativePlatform) || defaultIsNativePlatform;
        const defaultIsPluginAvailable = (pluginName) => {
          const plugin = registeredPlugins.get(pluginName);
          if (plugin === null || plugin === void 0 ? void 0 : plugin.platforms.has(getPlatform())) {
            return true;
          }
          if (getPluginHeader(pluginName)) {
            return true;
          }
          return false;
        };
        const isPluginAvailable = ((_c = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _c === void 0 ? void 0 : _c.isPluginAvailable) || defaultIsPluginAvailable;
        const defaultGetPluginHeader = (pluginName) => {
          var _a2;
          return (_a2 = cap.PluginHeaders) === null || _a2 === void 0 ? void 0 : _a2.find((h) => h.name === pluginName);
        };
        const getPluginHeader = ((_d = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _d === void 0 ? void 0 : _d.getPluginHeader) || defaultGetPluginHeader;
        const handleError = (err) => win.console.error(err);
        const pluginMethodNoop = (_target, prop, pluginName) => {
          return Promise.reject(`${pluginName} does not have an implementation of "${prop}".`);
        };
        const registeredPlugins = /* @__PURE__ */ new Map();
        const defaultRegisterPlugin = (pluginName, jsImplementations = {}) => {
          const registeredPlugin = registeredPlugins.get(pluginName);
          if (registeredPlugin) {
            console.warn(`Capacitor plugin "${pluginName}" already registered. Cannot register plugins twice.`);
            return registeredPlugin.proxy;
          }
          const platform = getPlatform();
          const pluginHeader = getPluginHeader(pluginName);
          let jsImplementation;
          const loadPluginImplementation = async () => {
            if (!jsImplementation && platform in jsImplementations) {
              jsImplementation = typeof jsImplementations[platform] === "function" ? jsImplementation = await jsImplementations[platform]() : jsImplementation = jsImplementations[platform];
            } else if (capCustomPlatform !== null && !jsImplementation && "web" in jsImplementations) {
              jsImplementation = typeof jsImplementations["web"] === "function" ? jsImplementation = await jsImplementations["web"]() : jsImplementation = jsImplementations["web"];
            }
            return jsImplementation;
          };
          const createPluginMethod = (impl, prop) => {
            var _a2, _b2;
            if (pluginHeader) {
              const methodHeader = pluginHeader === null || pluginHeader === void 0 ? void 0 : pluginHeader.methods.find((m) => prop === m.name);
              if (methodHeader) {
                if (methodHeader.rtype === "promise") {
                  return (options) => cap.nativePromise(pluginName, prop.toString(), options);
                } else {
                  return (options, callback) => cap.nativeCallback(pluginName, prop.toString(), options, callback);
                }
              } else if (impl) {
                return (_a2 = impl[prop]) === null || _a2 === void 0 ? void 0 : _a2.bind(impl);
              }
            } else if (impl) {
              return (_b2 = impl[prop]) === null || _b2 === void 0 ? void 0 : _b2.bind(impl);
            } else {
              throw new CapacitorException(`"${pluginName}" plugin is not implemented on ${platform}`, ExceptionCode.Unimplemented);
            }
          };
          const createPluginMethodWrapper = (prop) => {
            let remove;
            const wrapper = (...args) => {
              const p = loadPluginImplementation().then((impl) => {
                const fn = createPluginMethod(impl, prop);
                if (fn) {
                  const p2 = fn(...args);
                  remove = p2 === null || p2 === void 0 ? void 0 : p2.remove;
                  return p2;
                } else {
                  throw new CapacitorException(`"${pluginName}.${prop}()" is not implemented on ${platform}`, ExceptionCode.Unimplemented);
                }
              });
              if (prop === "addListener") {
                p.remove = async () => remove();
              }
              return p;
            };
            wrapper.toString = () => `${prop.toString()}() { [capacitor code] }`;
            Object.defineProperty(wrapper, "name", {
              value: prop,
              writable: false,
              configurable: false
            });
            return wrapper;
          };
          const addListener = createPluginMethodWrapper("addListener");
          const removeListener = createPluginMethodWrapper("removeListener");
          const addListenerNative = (eventName, callback) => {
            const call = addListener({ eventName }, callback);
            const remove = async () => {
              const callbackId = await call;
              removeListener({
                eventName,
                callbackId
              }, callback);
            };
            const p = new Promise((resolve) => call.then(() => resolve({ remove })));
            p.remove = async () => {
              console.warn(`Using addListener() without 'await' is deprecated.`);
              await remove();
            };
            return p;
          };
          const proxy = new Proxy({}, {
            get(_, prop) {
              switch (prop) {
                // https://github.com/facebook/react/issues/20030
                case "$$typeof":
                  return void 0;
                case "toJSON":
                  return () => ({});
                case "addListener":
                  return pluginHeader ? addListenerNative : addListener;
                case "removeListener":
                  return removeListener;
                default:
                  return createPluginMethodWrapper(prop);
              }
            }
          });
          Plugins2[pluginName] = proxy;
          registeredPlugins.set(pluginName, {
            name: pluginName,
            proxy,
            platforms: /* @__PURE__ */ new Set([
              ...Object.keys(jsImplementations),
              ...pluginHeader ? [platform] : []
            ])
          });
          return proxy;
        };
        const registerPlugin2 = ((_e = capPlatforms === null || capPlatforms === void 0 ? void 0 : capPlatforms.currentPlatform) === null || _e === void 0 ? void 0 : _e.registerPlugin) || defaultRegisterPlugin;
        if (!cap.convertFileSrc) {
          cap.convertFileSrc = (filePath) => filePath;
        }
        cap.getPlatform = getPlatform;
        cap.handleError = handleError;
        cap.isNativePlatform = isNativePlatform;
        cap.isPluginAvailable = isPluginAvailable;
        cap.pluginMethodNoop = pluginMethodNoop;
        cap.registerPlugin = registerPlugin2;
        cap.Exception = CapacitorException;
        cap.DEBUG = !!cap.DEBUG;
        cap.isLoggingEnabled = !!cap.isLoggingEnabled;
        cap.platform = cap.getPlatform();
        cap.isNative = cap.isNativePlatform();
        return cap;
      };
      initCapacitorGlobal = (win) => win.Capacitor = createCapacitor(win);
      Capacitor = /* @__PURE__ */ initCapacitorGlobal(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : {});
      registerPlugin = Capacitor.registerPlugin;
      Plugins = Capacitor.Plugins;
      registerWebPlugin = (plugin) => legacyRegisterWebPlugin(Capacitor, plugin);
      WebPlugin = class {
        constructor(config) {
          this.listeners = {};
          this.retainedEventArguments = {};
          this.windowListeners = {};
          if (config) {
            console.warn(`Capacitor WebPlugin "${config.name}" config object was deprecated in v3 and will be removed in v4.`);
            this.config = config;
          }
        }
        addListener(eventName, listenerFunc) {
          let firstListener = false;
          const listeners = this.listeners[eventName];
          if (!listeners) {
            this.listeners[eventName] = [];
            firstListener = true;
          }
          this.listeners[eventName].push(listenerFunc);
          const windowListener = this.windowListeners[eventName];
          if (windowListener && !windowListener.registered) {
            this.addWindowListener(windowListener);
          }
          if (firstListener) {
            this.sendRetainedArgumentsForEvent(eventName);
          }
          const remove = async () => this.removeListener(eventName, listenerFunc);
          const p = Promise.resolve({ remove });
          return p;
        }
        async removeAllListeners() {
          this.listeners = {};
          for (const listener in this.windowListeners) {
            this.removeWindowListener(this.windowListeners[listener]);
          }
          this.windowListeners = {};
        }
        notifyListeners(eventName, data, retainUntilConsumed) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            if (retainUntilConsumed) {
              let args = this.retainedEventArguments[eventName];
              if (!args) {
                args = [];
              }
              args.push(data);
              this.retainedEventArguments[eventName] = args;
            }
            return;
          }
          listeners.forEach((listener) => listener(data));
        }
        hasListeners(eventName) {
          return !!this.listeners[eventName].length;
        }
        registerWindowListener(windowEventName, pluginEventName) {
          this.windowListeners[pluginEventName] = {
            registered: false,
            windowEventName,
            pluginEventName,
            handler: (event) => {
              this.notifyListeners(pluginEventName, event);
            }
          };
        }
        unimplemented(msg = "not implemented") {
          return new Capacitor.Exception(msg, ExceptionCode.Unimplemented);
        }
        unavailable(msg = "not available") {
          return new Capacitor.Exception(msg, ExceptionCode.Unavailable);
        }
        async removeListener(eventName, listenerFunc) {
          const listeners = this.listeners[eventName];
          if (!listeners) {
            return;
          }
          const index = listeners.indexOf(listenerFunc);
          this.listeners[eventName].splice(index, 1);
          if (!this.listeners[eventName].length) {
            this.removeWindowListener(this.windowListeners[eventName]);
          }
        }
        addWindowListener(handle) {
          window.addEventListener(handle.windowEventName, handle.handler);
          handle.registered = true;
        }
        removeWindowListener(handle) {
          if (!handle) {
            return;
          }
          window.removeEventListener(handle.windowEventName, handle.handler);
          handle.registered = false;
        }
        sendRetainedArgumentsForEvent(eventName) {
          const args = this.retainedEventArguments[eventName];
          if (!args) {
            return;
          }
          delete this.retainedEventArguments[eventName];
          args.forEach((arg) => {
            this.notifyListeners(eventName, arg);
          });
        }
      };
      WebView = /* @__PURE__ */ registerPlugin("WebView");
      encode = (str) => encodeURIComponent(str).replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent).replace(/[()]/g, escape);
      decode = (str) => str.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
      CapacitorCookiesPluginWeb = class extends WebPlugin {
        async getCookies() {
          const cookies = document.cookie;
          const cookieMap = {};
          cookies.split(";").forEach((cookie) => {
            if (cookie.length <= 0)
              return;
            let [key, value] = cookie.replace(/=/, "CAP_COOKIE").split("CAP_COOKIE");
            key = decode(key).trim();
            value = decode(value).trim();
            cookieMap[key] = value;
          });
          return cookieMap;
        }
        async setCookie(options) {
          try {
            const encodedKey = encode(options.key);
            const encodedValue = encode(options.value);
            const expires = `; expires=${(options.expires || "").replace("expires=", "")}`;
            const path = (options.path || "/").replace("path=", "");
            const domain = options.url != null && options.url.length > 0 ? `domain=${options.url}` : "";
            document.cookie = `${encodedKey}=${encodedValue || ""}${expires}; path=${path}; ${domain};`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async deleteCookie(options) {
          try {
            document.cookie = `${options.key}=; Max-Age=0`;
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearCookies() {
          try {
            const cookies = document.cookie.split(";") || [];
            for (const cookie of cookies) {
              document.cookie = cookie.replace(/^ +/, "").replace(/=.*/, `=;expires=${(/* @__PURE__ */ new Date()).toUTCString()};path=/`);
            }
          } catch (error) {
            return Promise.reject(error);
          }
        }
        async clearAllCookies() {
          try {
            await this.clearCookies();
          } catch (error) {
            return Promise.reject(error);
          }
        }
      };
      CapacitorCookies = registerPlugin("CapacitorCookies", {
        web: () => new CapacitorCookiesPluginWeb()
      });
      readBlobAsBase64 = async (blob) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result;
          resolve(base64String.indexOf(",") >= 0 ? base64String.split(",")[1] : base64String);
        };
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(blob);
      });
      normalizeHttpHeaders = (headers = {}) => {
        const originalKeys = Object.keys(headers);
        const loweredKeys = Object.keys(headers).map((k) => k.toLocaleLowerCase());
        const normalized = loweredKeys.reduce((acc, key, index) => {
          acc[key] = headers[originalKeys[index]];
          return acc;
        }, {});
        return normalized;
      };
      buildUrlParams = (params, shouldEncode = true) => {
        if (!params)
          return null;
        const output = Object.entries(params).reduce((accumulator, entry) => {
          const [key, value] = entry;
          let encodedValue;
          let item;
          if (Array.isArray(value)) {
            item = "";
            value.forEach((str) => {
              encodedValue = shouldEncode ? encodeURIComponent(str) : str;
              item += `${key}=${encodedValue}&`;
            });
            item.slice(0, -1);
          } else {
            encodedValue = shouldEncode ? encodeURIComponent(value) : value;
            item = `${key}=${encodedValue}`;
          }
          return `${accumulator}&${item}`;
        }, "");
        return output.substr(1);
      };
      buildRequestInit = (options, extra = {}) => {
        const output = Object.assign({ method: options.method || "GET", headers: options.headers }, extra);
        const headers = normalizeHttpHeaders(options.headers);
        const type = headers["content-type"] || "";
        if (typeof options.data === "string") {
          output.body = options.data;
        } else if (type.includes("application/x-www-form-urlencoded")) {
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(options.data || {})) {
            params.set(key, value);
          }
          output.body = params.toString();
        } else if (type.includes("multipart/form-data") || options.data instanceof FormData) {
          const form = new FormData();
          if (options.data instanceof FormData) {
            options.data.forEach((value, key) => {
              form.append(key, value);
            });
          } else {
            for (const key of Object.keys(options.data)) {
              form.append(key, options.data[key]);
            }
          }
          output.body = form;
          const headers2 = new Headers(output.headers);
          headers2.delete("content-type");
          output.headers = headers2;
        } else if (type.includes("application/json") || typeof options.data === "object") {
          output.body = JSON.stringify(options.data);
        }
        return output;
      };
      CapacitorHttpPluginWeb = class extends WebPlugin {
        /**
         * Perform an Http request given a set of options
         * @param options Options to build the HTTP request
         */
        async request(options) {
          const requestInit = buildRequestInit(options, options.webFetchExtra);
          const urlParams = buildUrlParams(options.params, options.shouldEncodeUrlParams);
          const url = urlParams ? `${options.url}?${urlParams}` : options.url;
          const response = await fetch(url, requestInit);
          const contentType = response.headers.get("content-type") || "";
          let { responseType = "text" } = response.ok ? options : {};
          if (contentType.includes("application/json")) {
            responseType = "json";
          }
          let data;
          let blob;
          switch (responseType) {
            case "arraybuffer":
            case "blob":
              blob = await response.blob();
              data = await readBlobAsBase64(blob);
              break;
            case "json":
              data = await response.json();
              break;
            case "document":
            case "text":
            default:
              data = await response.text();
          }
          const headers = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          return {
            data,
            headers,
            status: response.status,
            url: response.url
          };
        }
        /**
         * Perform an Http GET request given a set of options
         * @param options Options to build the HTTP request
         */
        async get(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "GET" }));
        }
        /**
         * Perform an Http POST request given a set of options
         * @param options Options to build the HTTP request
         */
        async post(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "POST" }));
        }
        /**
         * Perform an Http PUT request given a set of options
         * @param options Options to build the HTTP request
         */
        async put(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PUT" }));
        }
        /**
         * Perform an Http PATCH request given a set of options
         * @param options Options to build the HTTP request
         */
        async patch(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "PATCH" }));
        }
        /**
         * Perform an Http DELETE request given a set of options
         * @param options Options to build the HTTP request
         */
        async delete(options) {
          return this.request(Object.assign(Object.assign({}, options), { method: "DELETE" }));
        }
      };
      CapacitorHttp = registerPlugin("CapacitorHttp", {
        web: () => new CapacitorHttpPluginWeb()
      });
    }
  });

  // node_modules/@capacitor/haptics/dist/esm/definitions.js
  var ImpactStyle, NotificationType, HapticsNotificationType, HapticsImpactStyle;
  var init_definitions = __esm({
    "node_modules/@capacitor/haptics/dist/esm/definitions.js"() {
      (function(ImpactStyle2) {
        ImpactStyle2["Heavy"] = "HEAVY";
        ImpactStyle2["Medium"] = "MEDIUM";
        ImpactStyle2["Light"] = "LIGHT";
      })(ImpactStyle || (ImpactStyle = {}));
      (function(NotificationType2) {
        NotificationType2["Success"] = "SUCCESS";
        NotificationType2["Warning"] = "WARNING";
        NotificationType2["Error"] = "ERROR";
      })(NotificationType || (NotificationType = {}));
      HapticsNotificationType = NotificationType;
      HapticsImpactStyle = ImpactStyle;
    }
  });

  // node_modules/@capacitor/haptics/dist/esm/web.js
  var web_exports = {};
  __export(web_exports, {
    HapticsWeb: () => HapticsWeb
  });
  var HapticsWeb;
  var init_web = __esm({
    "node_modules/@capacitor/haptics/dist/esm/web.js"() {
      init_dist();
      init_definitions();
      HapticsWeb = class extends WebPlugin {
        constructor() {
          super(...arguments);
          this.selectionStarted = false;
        }
        async impact(options) {
          const pattern = this.patternForImpact(options === null || options === void 0 ? void 0 : options.style);
          this.vibrateWithPattern(pattern);
        }
        async notification(options) {
          const pattern = this.patternForNotification(options === null || options === void 0 ? void 0 : options.type);
          this.vibrateWithPattern(pattern);
        }
        async vibrate(options) {
          const duration = (options === null || options === void 0 ? void 0 : options.duration) || 300;
          this.vibrateWithPattern([duration]);
        }
        async selectionStart() {
          this.selectionStarted = true;
        }
        async selectionChanged() {
          if (this.selectionStarted) {
            this.vibrateWithPattern([70]);
          }
        }
        async selectionEnd() {
          this.selectionStarted = false;
        }
        patternForImpact(style = ImpactStyle.Heavy) {
          if (style === ImpactStyle.Medium) {
            return [43];
          } else if (style === ImpactStyle.Light) {
            return [20];
          }
          return [61];
        }
        patternForNotification(type = NotificationType.Success) {
          if (type === NotificationType.Warning) {
            return [30, 40, 30, 50, 60];
          } else if (type === NotificationType.Error) {
            return [27, 45, 50];
          }
          return [35, 65, 21];
        }
        vibrateWithPattern(pattern) {
          if (navigator.vibrate) {
            navigator.vibrate(pattern);
          } else {
            throw this.unavailable("Browser does not support the vibrate API");
          }
        }
      };
    }
  });

  // node_modules/@capacitor/haptics/dist/esm/index.js
  var esm_exports = {};
  __export(esm_exports, {
    Haptics: () => Haptics,
    HapticsImpactStyle: () => HapticsImpactStyle,
    HapticsNotificationType: () => HapticsNotificationType,
    ImpactStyle: () => ImpactStyle,
    NotificationType: () => NotificationType
  });
  var Haptics;
  var init_esm = __esm({
    "node_modules/@capacitor/haptics/dist/esm/index.js"() {
      init_dist();
      init_definitions();
      Haptics = registerPlugin("Haptics", {
        web: () => Promise.resolve().then(() => (init_web(), web_exports)).then((m) => new m.HapticsWeb())
      });
    }
  });

  // node_modules/@capacitor/share/dist/esm/definitions.js
  var init_definitions2 = __esm({
    "node_modules/@capacitor/share/dist/esm/definitions.js"() {
    }
  });

  // node_modules/@capacitor/share/dist/esm/web.js
  var web_exports2 = {};
  __export(web_exports2, {
    ShareWeb: () => ShareWeb
  });
  var ShareWeb;
  var init_web2 = __esm({
    "node_modules/@capacitor/share/dist/esm/web.js"() {
      init_dist();
      ShareWeb = class extends WebPlugin {
        async canShare() {
          if (typeof navigator === "undefined" || !navigator.share) {
            return { value: false };
          } else {
            return { value: true };
          }
        }
        async share(options) {
          if (typeof navigator === "undefined" || !navigator.share) {
            throw this.unavailable("Share API not available in this browser");
          }
          await navigator.share({
            title: options.title,
            text: options.text,
            url: options.url
          });
          return {};
        }
      };
    }
  });

  // node_modules/@capacitor/share/dist/esm/index.js
  var esm_exports2 = {};
  __export(esm_exports2, {
    Share: () => Share
  });
  var Share;
  var init_esm2 = __esm({
    "node_modules/@capacitor/share/dist/esm/index.js"() {
      init_dist();
      init_definitions2();
      Share = registerPlugin("Share", {
        web: () => Promise.resolve().then(() => (init_web2(), web_exports2)).then((m) => new m.ShareWeb())
      });
    }
  });

  // src/fetch-page.js
  var capacitorHttp = null;
  async function getCapacitorHttp() {
    if (capacitorHttp !== null) return capacitorHttp;
    try {
      const core = await Promise.resolve().then(() => (init_dist(), dist_exports));
      if (core.Capacitor?.isNativePlatform?.() && core.CapacitorHttp) {
        capacitorHttp = core.CapacitorHttp;
        return capacitorHttp;
      }
    } catch {
    }
    capacitorHttp = false;
    return false;
  }
  function normalizeUrl(input) {
    let u = String(input || "").trim();
    if (!u) throw new Error("\u8BF7\u8F93\u5165\u7F51\u5740");
    if (!/^https?:\/\//i.test(u)) u = `https://${u}`;
    const parsed = new URL(u);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error("\u4EC5\u652F\u6301 http/https \u94FE\u63A5");
    }
    return parsed.href;
  }
  async function fetchPage(urlInput) {
    const url = normalizeUrl(urlInput);
    const headers = {
      "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "Accept-Language": "zh-CN,zh;q=0.9,en;q=0.8"
    };
    const Http = await getCapacitorHttp();
    if (Http) {
      const res = await Http.request({
        url,
        method: "GET",
        headers,
        responseType: "text"
      });
      if (res.status < 200 || res.status >= 300) {
        throw new Error(`HTTP ${res.status}`);
      }
      const html = typeof res.data === "string" ? res.data : String(res.data ?? "");
      if (!html.trim()) throw new Error("\u9875\u9762\u5185\u5BB9\u4E3A\u7A7A");
      return { url, html, via: "native" };
    }
    try {
      const res = await fetch(url, { headers, mode: "cors", redirect: "follow" });
      if (res.ok) {
        const html = await res.text();
        if (html.trim()) return { url: res.url || url, html, via: "fetch" };
      }
    } catch {
    }
    const proxies = [
      (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
      (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`
    ];
    let lastErr = null;
    for (const make of proxies) {
      try {
        const res = await fetch(make(url), { redirect: "follow" });
        if (!res.ok) {
          lastErr = new Error(`\u4EE3\u7406 HTTP ${res.status}`);
          continue;
        }
        const html = await res.text();
        if (html.trim()) return { url, html, via: "proxy" };
      } catch (e) {
        lastErr = e;
      }
    }
    throw new Error(
      lastErr?.message ? `\u65E0\u6CD5\u6293\u53D6\u9875\u9762\uFF08${lastErr.message}\uFF09\u3002\u53EF\u6539\u7528\u300C\u7C98\u8D34 HTML\u300D` : "\u65E0\u6CD5\u6293\u53D6\u9875\u9762\u3002\u53EF\u6539\u7528\u300C\u7C98\u8D34 HTML\u300D"
    );
  }

  // src/image-filter.js
  var TRACKER_HOST = /(?:googleads|doubleclick|googlesyndication|facebook\.com\/tr|analytics|pixel|beacon|tracking|scorecard|adservice|adnxs|adsrvr|moatads|taboola|outbrain|amazon-adsystem|baidu\.com\/hm|cnzz|umeng|hotjar|mixpanel)/i;
  var SPACER_NAME = /(?:spacer|pixel|blank|transparent|1x1|clear\.gif|dot\.gif|tracking)/i;
  var DATA_TINY = /^data:image\/[^;]+;base64,(.{0,200})$/i;
  function isInvalidImage(img) {
    if (!img || img.tagName !== "IMG") {
      return { invalid: true, reason: "not-img" };
    }
    const src = (img.getAttribute("src") || img.getAttribute("data-src") || "").trim();
    const srcset = (img.getAttribute("srcset") || "").trim();
    if (!src && !srcset) return { invalid: true, reason: "empty-src" };
    if (/^javascript:/i.test(src)) return { invalid: true, reason: "javascript-src" };
    if (/^about:blank/i.test(src)) return { invalid: true, reason: "about-blank" };
    if (DATA_TINY.test(src)) return { invalid: true, reason: "tiny-data-uri" };
    const w = parseDim(img.getAttribute("width") ?? img.width);
    const h = parseDim(img.getAttribute("height") ?? img.height);
    if (w != null && h != null && w <= 2 && h <= 2) {
      return { invalid: true, reason: "1x1" };
    }
    if (w != null && w <= 2 || h != null && h <= 2) {
      return { invalid: true, reason: "tiny-dim" };
    }
    const style = (img.getAttribute("style") || "").toLowerCase();
    if (/display\s*:\s*none|visibility\s*:\s*hidden|opacity\s*:\s*0/.test(style)) {
      return { invalid: true, reason: "hidden" };
    }
    if (/width\s*:\s*[012](\.\d+)?px|height\s*:\s*[012](\.\d+)?px/.test(style)) {
      return { invalid: true, reason: "css-tiny" };
    }
    if (SPACER_NAME.test(src) || SPACER_NAME.test(img.getAttribute("alt") || "")) {
      return { invalid: true, reason: "spacer" };
    }
    try {
      const host = src.startsWith("data:") ? "" : new URL(src, "https://example.com").hostname;
      if (host && TRACKER_HOST.test(host + src)) {
        return { invalid: true, reason: "tracker" };
      }
    } catch {
    }
    if (TRACKER_HOST.test(src)) return { invalid: true, reason: "tracker-path" };
    const cls = `${img.className || ""} ${img.id || ""}`.toLowerCase();
    if (/\b(icon|avatar|emoji|logo-sm|sprite|badge|qrcode|qr-code|wechat|wx-qr)\b/.test(cls)) {
      if (w != null && w < 80 || h != null && h < 80) {
        return { invalid: true, reason: "chrome-icon" };
      }
    }
    const alt = (img.getAttribute("alt") || "").trim();
    if (!alt && w != null && w < 48 && h != null && h < 48) {
      return { invalid: true, reason: "tiny-no-alt" };
    }
    return { invalid: false };
  }
  function parseDim(v) {
    if (v == null || v === "") return null;
    const n = parseInt(String(v), 10);
    return Number.isFinite(n) ? n : null;
  }
  function stripInvalidImages(root) {
    let removed = 0;
    const imgs = [...root.querySelectorAll("img")];
    for (const img of imgs) {
      const { invalid } = isInvalidImage(img);
      if (invalid) {
        img.remove();
        removed++;
      }
    }
    for (const fig of [...root.querySelectorAll("figure")]) {
      if (!fig.querySelector("img, picture, svg, video") && !(fig.textContent || "").trim()) {
        fig.remove();
      }
    }
    for (const pic of [...root.querySelectorAll("picture")]) {
      if (!pic.querySelector("img")) pic.remove();
    }
    return removed;
  }
  function absolutizeImages(root, baseUrl) {
    if (!baseUrl) return;
    for (const img of root.querySelectorAll("img")) {
      const src = img.getAttribute("src") || img.getAttribute("data-src");
      if (!src || src.startsWith("data:")) continue;
      try {
        img.setAttribute("src", new URL(src, baseUrl).href);
        img.removeAttribute("data-src");
      } catch {
      }
    }
  }

  // src/text-clean.js
  var ZERO_WIDTH = /[\u200B-\u200D\u2060\uFEFF\u00AD\u180E\u034F\u061C\u115F\u1160\u17B4\u17B5\u3164\uFFA0]/g;
  var CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g;
  var PRIVATE_USE = /[\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]/gu;
  var REPLACEMENT = /\uFFFD+/g;
  var SYMBOL_RUN = /[\u2500-\u257F\u2580-\u259F\u25A0-\u25FF\u2600-\u26FF\u2700-\u27BF]{3,}/g;
  var PUNCT_SPAM = /([·•▪▫◦‣⁃※★☆◆◇■□▲△▼▽●○◎⊙])\1{2,}/g;
  var MULTI_SPACE = /[^\S\n]{2,}/g;
  var MULTI_NL = /\n{3,}/g;
  var SPACE_BEFORE_NL = /[^\S\n]+\n/g;
  var SPACE_AFTER_NL = /\n[^\S\n]+/g;
  var JUNK_LINE = /^(分享到|分享至|点击查看|点击阅读|阅读原文|关注我们|扫码关注|广告|推广|相关推荐|猜你喜欢|热门评论|打开APP|打开App|下载APP|下载App|展开全部|收起|查看更多|更多精彩|版权声明|免责声明|原文链接|转载请注明|未经授权|责任编辑|来源：|作者：\s*$|标签：|关键词：|上一篇|下一篇|返回首页|首页\s*[>|›]|评论\s*\d*\s*$|点赞\s*\d*\s*$|收藏\s*\d*\s*$|举报|Subscribe|Share this|Follow us|Advertisement|Sponsored|Read more|Sign up|Newsletter|Cookie\s*Policy|Accept\s*cookies)$/i;
  function cleanText(input) {
    const stats = { zeroWidth: 0, control: 0, junkLines: 0 };
    if (!input) return { text: "", removed: stats };
    let s = String(input);
    const zw = s.match(ZERO_WIDTH);
    stats.zeroWidth = zw ? zw.length : 0;
    s = s.replace(ZERO_WIDTH, "");
    const ctl = s.match(CONTROL);
    stats.control = ctl ? ctl.length : 0;
    s = s.replace(CONTROL, "");
    s = s.replace(PRIVATE_USE, "");
    s = s.replace(REPLACEMENT, "");
    s = s.replace(SYMBOL_RUN, "");
    s = s.replace(PUNCT_SPAM, "$1");
    s = s.replace(/[\u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/g, " ");
    const lines = s.split(/\r\n|\r|\n/);
    const kept = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        kept.push("");
        continue;
      }
      if (JUNK_LINE.test(trimmed)) {
        stats.junkLines++;
        continue;
      }
      const letters = trimmed.replace(/[\s\d\p{P}\p{S}]/gu, "");
      if (trimmed.length >= 4 && letters.length / trimmed.length < 0.15) {
        stats.junkLines++;
        continue;
      }
      kept.push(trimmed);
    }
    s = kept.join("\n");
    s = s.replace(SPACE_BEFORE_NL, "\n");
    s = s.replace(SPACE_AFTER_NL, "\n");
    s = s.replace(MULTI_SPACE, " ");
    s = s.replace(MULTI_NL, "\n\n");
    s = s.trim();
    return { text: s, removed: stats };
  }
  function cleanMarkdown(md) {
    const { text, removed } = cleanText(md);
    let s = text.replace(/!\[[^\]]*]\(\s*\)/g, "").replace(/\[[^\]]*]\(\s*\)/g, "").replace(/\n{3,}/g, "\n\n").trim();
    return { text: s, removed };
  }

  // src/extract.js
  var REMOVE_TAGS = /* @__PURE__ */ new Set([
    "SCRIPT",
    "STYLE",
    "NOSCRIPT",
    "IFRAME",
    "OBJECT",
    "EMBED",
    "APPLET",
    "SVG",
    "CANVAS",
    "VIDEO",
    "AUDIO",
    "SOURCE",
    "TRACK",
    "TEMPLATE",
    "FORM",
    "BUTTON",
    "INPUT",
    "SELECT",
    "TEXTAREA",
    "LABEL",
    "NAV",
    "FOOTER",
    "ASIDE",
    "HEADER",
    "MENU",
    "DIALOG"
  ]);
  var NOISE_ATTR = /\b(ad|ads|advert|banner|sidebar|comment|comments|related|recommend|share|social|cookie|popup|modal|newsletter|subscribe|promo|sponsor|widget|toolbar|breadcrumb|pagination|tag-list|toc|nav|menu|footer|header|aside|login|signup|paywall|reward|hot-list|hotlist|guess|like-box)\b/i;
  var CONTENT_HINT = /\b(article|post|entry|content|markdown-body|article-body|post-content|entry-content|article-content|main-content|rich-text|news-content|detail|story|read|body-text)\b/i;
  function extractArticle(html, opts = {}) {
    const doc = opts.document || parseHtml(html);
    const url = opts.url || "";
    const title = pickTitle(doc);
    const byline = pickByline(doc);
    stripChrome(doc);
    const candidate = pickContentRoot(doc);
    if (!candidate) {
      const { text } = cleanText(doc.body?.textContent || "");
      return {
        title,
        byline,
        url,
        html: "",
        markdown: title ? `# ${title}

${text}` : text,
        text,
        stats: { imagesRemoved: 0, nodesRemoved: 0, junkLines: 0 }
      };
    }
    let nodesRemoved = 0;
    nodesRemoved += pruneNoise(candidate);
    const imagesRemoved = stripInvalidImages(candidate);
    absolutizeImages(candidate, url);
    unwrapKeep(candidate);
    const cleanHtml = serializeInner(candidate);
    let markdown = htmlToMarkdown(candidate);
    if (title && !markdown.startsWith("#")) {
      markdown = `# ${title}

${markdown}`;
    }
    if (byline) {
      markdown = markdown.replace(/^(# .+)\n\n/, `$1

*${byline}*

`);
    }
    if (url) {
      markdown += `

---
\u6765\u6E90\uFF1A${url}
`;
    }
    const mdClean = cleanMarkdown(markdown);
    const textClean = cleanText(candidate.textContent || "");
    return {
      title,
      byline,
      url,
      html: cleanHtml,
      markdown: mdClean.text,
      text: textClean.text,
      stats: {
        imagesRemoved,
        nodesRemoved,
        junkLines: mdClean.removed.junkLines + textClean.removed.junkLines,
        zeroWidth: mdClean.removed.zeroWidth,
        control: mdClean.removed.control
      }
    };
  }
  function parseHtml(html) {
    if (typeof DOMParser !== "undefined") {
      return new DOMParser().parseFromString(html, "text/html");
    }
    throw new Error("DOMParser unavailable \u2014 pass opts.document (jsdom)");
  }
  function pickTitle(doc) {
    const og = doc.querySelector('meta[property="og:title"]')?.getAttribute("content");
    if (og?.trim()) return cleanText(og).text;
    const h1 = doc.querySelector("h1")?.textContent;
    if (h1?.trim()) return cleanText(h1).text;
    return cleanText(doc.title || "").text;
  }
  function pickByline(doc) {
    const selectors = [
      'meta[name="author"]',
      'meta[property="article:author"]',
      '[rel="author"]',
      ".author",
      ".byline",
      ".article-author"
    ];
    for (const sel of selectors) {
      const el = doc.querySelector(sel);
      if (!el) continue;
      const v = el.getAttribute?.("content") || el.textContent;
      if (v?.trim()) return cleanText(v).text.slice(0, 120);
    }
    return "";
  }
  function stripChrome(doc) {
    for (const tag of REMOVE_TAGS) {
      for (const el of [...doc.querySelectorAll(tag)]) {
        if (tag === "HEADER" && el.querySelector("h1") && el.closest("article")) continue;
        el.remove();
      }
    }
    for (const el of [...doc.querySelectorAll('[hidden], [aria-hidden="true"]')]) {
      el.remove();
    }
  }
  function pickContentRoot(doc) {
    const preferred = [
      "article",
      '[role="main"] article',
      "main article",
      ".post-content",
      ".entry-content",
      ".article-content",
      ".article-body",
      ".markdown-body",
      "#content",
      "main",
      '[role="main"]'
    ];
    for (const sel of preferred) {
      const el = doc.querySelector(sel);
      if (el && scoreNode(el) > 40) return el.cloneNode(true);
    }
    const blocks = [...doc.querySelectorAll("div, section, article, main")];
    let best = null;
    let bestScore = 0;
    for (const el of blocks) {
      const s = scoreNode(el);
      if (s > bestScore) {
        bestScore = s;
        best = el;
      }
    }
    if (best && bestScore >= 25) return best.cloneNode(true);
    return doc.body ? doc.body.cloneNode(true) : null;
  }
  function scoreNode(el) {
    const text = (el.textContent || "").replace(/\s+/g, " ").trim();
    if (text.length < 80) return 0;
    let score = Math.min(text.length / 40, 80);
    const pCount = el.querySelectorAll("p").length;
    score += pCount * 8;
    const idClass = `${el.id || ""} ${el.className || ""}`;
    if (CONTENT_HINT.test(idClass)) score += 40;
    if (NOISE_ATTR.test(idClass)) score -= 50;
    if (el.tagName === "ARTICLE") score += 30;
    if (el.tagName === "MAIN") score += 20;
    const links = [...el.querySelectorAll("a")];
    const linkLen = links.reduce((n, a) => n + (a.textContent || "").length, 0);
    const density = linkLen / Math.max(text.length, 1);
    if (density > 0.45) score -= 40;
    if (density > 0.65) score -= 40;
    if (el.querySelectorAll("li a").length > 8 && pCount < 3) score -= 30;
    return score;
  }
  function pruneNoise(root) {
    let removed = 0;
    const all = [...root.querySelectorAll("*")];
    for (const el of all) {
      if (!el.parentNode) continue;
      const idClass = `${el.id || ""} ${typeof el.className === "string" ? el.className : ""}`;
      if (NOISE_ATTR.test(idClass) && !CONTENT_HINT.test(idClass)) {
        const parentText = (root.textContent || "").length;
        const elText = (el.textContent || "").length;
        if (elText < parentText * 0.55) {
          el.remove();
          removed++;
          continue;
        }
      }
      if (REMOVE_TAGS.has(el.tagName) && el.tagName !== "HEADER") {
        el.remove();
        removed++;
      }
    }
    return removed;
  }
  function unwrapKeep(root) {
    for (const el of [...root.querySelectorAll("div, span, p, section")]) {
      if (!el.parentNode) continue;
      if (!(el.textContent || "").trim() && !el.querySelector("img, picture, br, hr")) {
        el.remove();
      }
    }
  }
  function serializeInner(el) {
    return el.innerHTML || "";
  }
  function htmlToMarkdown(root) {
    const parts = [];
    function walk(node) {
      if (node.nodeType === 3) {
        const t = node.textContent || "";
        if (t) parts.push(t);
        return;
      }
      if (node.nodeType !== 1) return;
      const tag = node.tagName;
      const block = isBlock(tag);
      if (tag === "BR") {
        parts.push("\n");
        return;
      }
      if (tag === "HR") {
        parts.push("\n\n---\n\n");
        return;
      }
      if (tag === "IMG") {
        const src = node.getAttribute("src") || "";
        const alt = (node.getAttribute("alt") || "").trim() || "image";
        if (src) parts.push(`

![${alt}](${src})

`);
        return;
      }
      if (tag === "A") {
        const href = node.getAttribute("href") || "";
        const before = parts.length;
        for (const c of node.childNodes) walk(c);
        const inner = parts.splice(before).join("").trim();
        if (!inner) return;
        if (href && !href.startsWith("javascript:") && !href.startsWith("#")) {
          parts.push(`[${inner}](${href})`);
        } else {
          parts.push(inner);
        }
        return;
      }
      if (/^H[1-6]$/.test(tag)) {
        const level = Number(tag[1]);
        parts.push(`

${"#".repeat(level)} `);
        for (const c of node.childNodes) walk(c);
        parts.push("\n\n");
        return;
      }
      if (tag === "LI") {
        parts.push("\n- ");
        for (const c of node.childNodes) walk(c);
        return;
      }
      if (tag === "BLOCKQUOTE") {
        parts.push("\n\n");
        const before = parts.length;
        for (const c of node.childNodes) walk(c);
        const inner = parts.splice(before).join("").trim().split("\n").map((l) => `> ${l}`).join("\n");
        parts.push(inner + "\n\n");
        return;
      }
      if (tag === "PRE" || tag === "CODE") {
        const code = (node.textContent || "").replace(/\n$/, "");
        if (tag === "PRE" || node.parentElement && node.parentElement.tagName === "PRE") {
          if (tag === "PRE") parts.push(`

\`\`\`
${code}
\`\`\`

`);
          else parts.push(code);
        } else {
          parts.push(`\`${code}\``);
        }
        return;
      }
      if (tag === "STRONG" || tag === "B") {
        parts.push("**");
        for (const c of node.childNodes) walk(c);
        parts.push("**");
        return;
      }
      if (tag === "EM" || tag === "I") {
        parts.push("*");
        for (const c of node.childNodes) walk(c);
        parts.push("*");
        return;
      }
      if (block) parts.push("\n\n");
      for (const c of node.childNodes) walk(c);
      if (block) parts.push("\n\n");
    }
    walk(root);
    return parts.join("").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }
  function isBlock(tag) {
    return /^(P|DIV|SECTION|ARTICLE|MAIN|UL|OL|TABLE|TR|FIGURE|FIGCAPTION|H[1-6]|BLOCKQUOTE|PRE)$/.test(tag);
  }

  // src/store.js
  var KEY = "qingye.docs.v1";
  function loadDocs() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return [];
      const list = JSON.parse(raw);
      return Array.isArray(list) ? list : [];
    } catch {
      return [];
    }
  }
  function saveDocs(docs2) {
    localStorage.setItem(KEY, JSON.stringify(docs2.slice(0, 200)));
    return docs2;
  }
  function createDoc(data) {
    return {
      id: data.id || `d_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`,
      title: data.title || "\u672A\u547D\u540D\u6587\u6863",
      url: data.url || "",
      byline: data.byline || "",
      markdown: data.markdown || "",
      text: data.text || "",
      html: data.html || "",
      createdAt: Date.now(),
      stats: data.stats || {}
    };
  }
  function upsertDoc(docs2, doc) {
    const i = docs2.findIndex((d) => d.id === doc.id);
    if (i >= 0) {
      const next = [...docs2];
      next[i] = doc;
      return next;
    }
    return [doc, ...docs2];
  }
  function removeDoc(docs2, id) {
    return docs2.filter((d) => d.id !== id);
  }

  // src/wearable-input.js
  var WEARABLE_DEFAULTS = {
    RING_TILT: 5,
    RING_SHAKE: 20,
    CANE_TAP: 8,
    CANE_SWING: 3,
    RING_THROTTLE: 8,
    CANE_THROTTLE: 6
  };
  function createWearableInput(handlers = {}) {
    const {
      RING_TILT,
      RING_SHAKE,
      CANE_TAP,
      CANE_SWING,
      RING_THROTTLE,
      CANE_THROTTLE
    } = WEARABLE_DEFAULTS;
    const throttleMs = handlers.throttleMs ?? 600;
    let ringFrames = 0;
    let caneFrames = 0;
    let lastBeta = 0;
    let lastGamma = 0;
    let listening = false;
    let orientationHandler = null;
    let motionHandler = null;
    let lastAction = 0;
    function throttleAction(fn, ms = throttleMs) {
      const now = Date.now();
      if (now - lastAction < ms) return;
      lastAction = now;
      fn?.();
    }
    function onRing(e) {
      ringFrames++;
      if (ringFrames % RING_THROTTLE !== 0) return;
      const beta = e.beta ?? 0;
      const gamma = e.gamma ?? 0;
      const dBeta = Math.abs(beta - lastBeta);
      const dGamma = Math.abs(gamma - lastGamma);
      lastBeta = beta;
      lastGamma = gamma;
      if (dBeta > RING_SHAKE || dGamma > RING_SHAKE) {
        throttleAction(() => handlers.onRingShake?.());
        return;
      }
      if (beta > RING_TILT) handlers.onRingTiltDown?.();
      else if (beta < -RING_TILT) handlers.onRingTiltUp?.();
      if (gamma > RING_TILT) handlers.onRingTiltRight?.();
      else if (gamma < -RING_TILT) handlers.onRingTiltLeft?.();
    }
    function onCane(e) {
      caneFrames++;
      if (caneFrames % CANE_THROTTLE !== 0) return;
      const a = e.accelerationIncludingGravity || e.acceleration;
      if (!a) return;
      const mag = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2);
      const spike = Math.abs(mag - 9.8);
      if (spike > CANE_TAP) {
        throttleAction(() => handlers.onCaneTap?.());
        return;
      }
      if (Math.abs(a.x || 0) > CANE_SWING) {
        const dir = (a.x || 0) > 0 ? "right" : "left";
        throttleAction(() => {
          handlers.onCaneSwing?.(dir);
          if (dir === "right") handlers.onCaneSwingRight?.();
          else handlers.onCaneSwingLeft?.();
        }, 800);
      }
    }
    async function requestPermission() {
      let ok = true;
      if (typeof DeviceOrientationEvent !== "undefined" && typeof DeviceOrientationEvent.requestPermission === "function") {
        try {
          ok = await DeviceOrientationEvent.requestPermission() === "granted";
        } catch {
          ok = false;
        }
      }
      if (typeof DeviceMotionEvent !== "undefined" && typeof DeviceMotionEvent.requestPermission === "function") {
        try {
          ok = ok && await DeviceMotionEvent.requestPermission() === "granted";
        } catch {
          ok = false;
        }
      }
      return ok;
    }
    function start() {
      if (listening || typeof window === "undefined") return;
      listening = true;
      orientationHandler = onRing;
      motionHandler = onCane;
      window.addEventListener("deviceorientation", orientationHandler);
      window.addEventListener("devicemotion", motionHandler);
    }
    function stop() {
      if (!listening) return;
      listening = false;
      if (typeof window !== "undefined") {
        if (orientationHandler) window.removeEventListener("deviceorientation", orientationHandler);
        if (motionHandler) window.removeEventListener("devicemotion", motionHandler);
      }
      orientationHandler = null;
      motionHandler = null;
    }
    return {
      start,
      stop,
      requestPermission,
      isListening: () => listening,
      get listening() {
        return listening;
      }
    };
  }
  var WearableInput = class {
    /**
     * @param {{
     *   onGesture?: (gesture: string, detail?: object) => void,
     *   onAction?: (action: string) => void,
     *   onBadge?: (kind: string, text: string, active: boolean) => void,
     *   profile?: 'generic'|'aim-draw'|'steer'|'relay',
     *   ringBadgeId?: string,
     *   caneBadgeId?: string,
     * }} opts
     */
    constructor(opts = {}) {
      this.onGesture = opts.onGesture ?? (() => {
      });
      this.onAction = opts.onAction;
      this.onBadge = opts.onBadge ?? (() => {
      });
      this.profile = opts.profile || "generic";
      this.ringBadgeId = opts.ringBadgeId || "ring-badge";
      this.caneBadgeId = opts.caneBadgeId || "cane-badge";
      this.ringActive = false;
      this.caneActive = false;
      this.ringFrame = 0;
      this.caneFrame = 0;
      this.ringPrevBeta = null;
      this.ringPrevGamma = null;
      this.caneLastAccel = { x: 0, y: 0, z: 0 };
      this.canePrevGamma = null;
      this.lastHitAt = 0;
      this.neutralBeta = null;
    }
    setupRing() {
      if (typeof DeviceOrientationEvent === "undefined") return;
      this.onBadge("ring", "\u6212\u6307 \xB7 \u70B9\u51FB\u542F\u7528", false);
      const enable = async () => {
        try {
          if (typeof DeviceOrientationEvent.requestPermission === "function") {
            const perm = await DeviceOrientationEvent.requestPermission();
            if (perm !== "granted") return;
          }
          this.ringActive = true;
          this.neutralBeta = null;
          this.onBadge("ring", "\u6212\u6307 \xB7 \u5DF2\u8FDE\u63A5", true);
          window.addEventListener("deviceorientation", (e) => this.handleRing(e));
        } catch {
          this.onBadge("ring", "\u6212\u6307 \xB7 \u4E0D\u652F\u6301", false);
        }
      };
      document.getElementById(this.ringBadgeId)?.addEventListener("click", enable, { once: true });
      if (typeof DeviceOrientationEvent.requestPermission !== "function") enable();
    }
    setupCane() {
      if (typeof DeviceMotionEvent === "undefined") return;
      this.onBadge("cane", "\u624B\u6756 \xB7 \u70B9\u51FB\u542F\u7528", false);
      const enable = async () => {
        try {
          if (typeof DeviceMotionEvent.requestPermission === "function") {
            const perm = await DeviceMotionEvent.requestPermission();
            if (perm !== "granted") return;
          }
          this.caneActive = true;
          this.onBadge("cane", "\u624B\u6756 \xB7 \u5DF2\u8FDE\u63A5", true);
          window.addEventListener("devicemotion", (e) => this.handleCane(e));
        } catch {
          this.onBadge("cane", "\u624B\u6756 \xB7 \u4E0D\u652F\u6301", false);
        }
      };
      document.getElementById(this.caneBadgeId)?.addEventListener("click", enable, { once: true });
      if (typeof DeviceMotionEvent.requestPermission !== "function") enable();
    }
    handleRing(e) {
      if (!this.ringActive) return;
      this.ringFrame++;
      const beta = e.beta || 0;
      const gamma = e.gamma || 0;
      const { RING_TILT, RING_SHAKE, RING_THROTTLE } = WEARABLE_DEFAULTS;
      if (this.profile === "aim-draw") {
        if (this.ringFrame % 2 === 0) {
          const x = Math.max(-1, Math.min(1, gamma / 45));
          const y = Math.max(-1, Math.min(1, beta / 45));
          this.onGesture("aim", { x, y });
        }
        if (this.ringFrame % RING_THROTTLE !== 0) return;
        if (this.ringPrevBeta === null) {
          this.ringPrevBeta = beta;
          this.ringPrevGamma = gamma;
          return;
        }
        const dBeta2 = beta - this.ringPrevBeta;
        const dGamma2 = gamma - this.ringPrevGamma;
        this.ringPrevBeta = beta;
        this.ringPrevGamma = gamma;
        if (Math.abs(dBeta2) > RING_SHAKE || Math.abs(dGamma2) > RING_SHAKE) {
          this.onGesture("cancel_draw");
        }
        return;
      }
      if (this.profile === "steer") {
        if (this.ringFrame % 2 === 0) {
          const x = Math.max(-1, Math.min(1, gamma / 35));
          const y = Math.max(-1, Math.min(1, (beta - 45) / 35));
          this.onGesture("steer", { x, y });
        }
        return;
      }
      if (this.profile === "relay") {
        if (this.ringFrame % RING_THROTTLE !== 0) return;
        if (this.ringPrevBeta === null) {
          this.ringPrevBeta = beta;
          this.ringPrevGamma = gamma;
          return;
        }
        const dBeta2 = Math.abs(beta - this.ringPrevBeta);
        const dGamma2 = Math.abs(gamma - this.ringPrevGamma);
        this.ringPrevBeta = beta;
        this.ringPrevGamma = gamma;
        if (dBeta2 > RING_SHAKE || dGamma2 > RING_SHAKE) {
          this.onAction?.("relayToggle");
          return;
        }
        if (dBeta2 > RING_TILT || dGamma2 > RING_TILT) {
          if (beta > 0) this.onAction?.("relayOn");
          else this.onAction?.("relayOff");
        }
        return;
      }
      if (this.ringFrame % RING_THROTTLE !== 0) return;
      if (this.ringPrevBeta === null) {
        this.ringPrevBeta = beta;
        this.ringPrevGamma = gamma;
        return;
      }
      const dBeta = Math.abs(beta - this.ringPrevBeta);
      const dGamma = Math.abs(gamma - this.ringPrevGamma);
      this.ringPrevBeta = beta;
      this.ringPrevGamma = gamma;
      if (dBeta > RING_SHAKE || dGamma > RING_SHAKE) {
        this.onGesture("shake", { dBeta, dGamma });
        return;
      }
      if (gamma > RING_TILT) this.onGesture("tilt", { dir: "right", gamma });
      else if (gamma < -RING_TILT) this.onGesture("tilt", { dir: "left", gamma });
      else if (beta > RING_TILT) this.onGesture("tilt", { dir: "up", beta });
      else if (beta < -RING_TILT) this.onGesture("tilt", { dir: "down", beta });
    }
    handleCane(e) {
      if (!this.caneActive) return;
      this.caneFrame++;
      const { CANE_TAP, CANE_SWING, CANE_THROTTLE } = WEARABLE_DEFAULTS;
      if (this.caneFrame % CANE_THROTTLE !== 0) return;
      const a = e.accelerationIncludingGravity || e.acceleration || { x: 0, y: 0, z: 0 };
      const dax = Math.abs((a.x || 0) - this.caneLastAccel.x);
      const day = Math.abs((a.y || 0) - this.caneLastAccel.y);
      const daz = Math.abs((a.z || 0) - this.caneLastAccel.z);
      this.caneLastAccel = { x: a.x || 0, y: a.y || 0, z: a.z || 0 };
      if (this.profile === "aim-draw") {
        if (dax > CANE_TAP || day > CANE_TAP || daz > CANE_TAP) {
          const now = Date.now();
          if (now - this.lastHitAt < 160) return;
          this.lastHitAt = now;
          const velocity = Math.min(1.25, Math.max(dax, day, daz) / 14);
          this.onGesture("release", { velocity });
          return;
        }
        const rot = e.rotationRate || { gamma: 0 };
        const rg = rot.gamma || 0;
        if (this.canePrevGamma !== null && Math.abs(rg - this.canePrevGamma) > CANE_SWING) {
          const now = Date.now();
          if (now - this.lastHitAt >= 100) {
            this.lastHitAt = now;
            const velocity = Math.min(1.2, Math.abs(rg - this.canePrevGamma) / 12);
            this.onGesture("draw", { velocity });
          }
        }
        this.canePrevGamma = rg;
        return;
      }
      if (this.profile === "relay") {
        if (dax > CANE_TAP || day > CANE_TAP || daz > CANE_TAP) this.onAction?.("relayToggle");
        return;
      }
      if (dax > CANE_TAP || day > CANE_TAP || daz > CANE_TAP) {
        const mag = Math.sqrt((a.x || 0) ** 2 + (a.y || 0) ** 2 + (a.z || 0) ** 2);
        this.onGesture("tap", { spike: Math.max(dax, day, daz), mag });
        if (this.profile === "steer") this.onGesture("chirp", {});
        return;
      }
      if (Math.abs(a.x || 0) > CANE_SWING) {
        const dir = (a.x || 0) > 0 ? "right" : "left";
        this.onGesture("swing", { dir });
      }
    }
  };
  function attachWearableEnableButton(buttonId = "wearable-enable") {
    if (typeof document === "undefined") return;
    const btn = document.getElementById(buttonId);
    if (!btn) return;
    const input = createWearableInput({
      onRingShake: () => window.onWearableGesture?.("shake", {}),
      onRingTiltUp: () => window.onWearableGesture?.("tilt", { dir: "up" }),
      onRingTiltDown: () => window.onWearableGesture?.("tilt", { dir: "down" }),
      onRingTiltLeft: () => window.onWearableGesture?.("tilt", { dir: "left" }),
      onRingTiltRight: () => window.onWearableGesture?.("tilt", { dir: "right" }),
      onCaneTap: () => window.onWearableGesture?.("tap", {}),
      onCaneSwing: (dir) => window.onWearableGesture?.("swing", { dir })
    });
    btn.addEventListener("click", async () => {
      const ok = await input.requestPermission().catch(() => false);
      if (!ok) return;
      input.start();
      btn.textContent = "\u6212\u6307/\u624B\u6756\u5DF2\u542F\u7528";
    });
  }
  if (typeof window !== "undefined" && typeof document !== "undefined") {
    window.WearableInput = WearableInput;
    window.createWearableInput = createWearableInput;
    window.WEARABLE_DEFAULTS = WEARABLE_DEFAULTS;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => attachWearableEnableButton());
    } else {
      attachWearableEnableButton();
    }
  }

  // src/studio/brief.js
  function buildBrief(doc) {
    const title = (doc.title || "\u672A\u547D\u540D").trim();
    const sentences = splitSentences(doc.text || "");
    const scored = rankSentences(sentences);
    const top = scored.slice(0, 8).map((s) => s.text);
    const bullets = scored.slice(0, 5).map((s) => trimLen(s.text, 90));
    const summary = buildSummary(title, top);
    const faq = buildFaq(title, scored);
    const dialogue = buildDialogue(title, bullets, top);
    const slides = buildSlides(title, bullets, summary);
    return { summary, bullets, faq, dialogue, slides };
  }
  function splitSentences(text) {
    const raw = String(text || "").replace(/\s+/g, " ").trim();
    if (!raw) return [];
    return raw.split(/(?<=[。！？.!?;；])\s*/).map((s) => s.trim()).filter((s) => s.length >= 8 && s.length <= 220);
  }
  function rankSentences(sentences) {
    if (!sentences.length) return [];
    const freq = /* @__PURE__ */ new Map();
    for (const s of sentences) {
      for (const t of tokens(s)) freq.set(t, (freq.get(t) || 0) + 1);
    }
    return sentences.map((text, i) => {
      const toks = tokens(text);
      let score = 0;
      for (const t of toks) score += freq.get(t) || 0;
      score = score / Math.max(1, Math.sqrt(toks.length));
      score *= 1 + Math.max(0, 1 - i / Math.max(1, sentences.length)) * 0.15;
      if (/[：:]/.test(text)) score *= 1.05;
      return { text, score };
    }).sort((a, b) => b.score - a.score);
  }
  function tokens(s) {
    const out = [];
    const latin = s.toLowerCase().match(/[a-z0-9]{2,}/g) || [];
    out.push(...latin);
    const cjk = s.replace(/[^\u4e00-\u9fff]/g, "");
    for (let i = 0; i < cjk.length - 1; i++) out.push(cjk.slice(i, i + 2));
    return out;
  }
  function buildSummary(title, top) {
    if (!top.length) return `\u300A${title}\u300B\u6682\u65E0\u8DB3\u591F\u6B63\u6587\u53EF\u751F\u6210\u7B80\u62A5\u3002`;
    const lead = top.slice(0, 3).join("");
    return `\u5173\u4E8E\u300C${title}\u300D\uFF1A${trimLen(lead, 280)}`;
  }
  function buildFaq(title, scored) {
    const picks = scored.slice(0, 4);
    if (!picks.length) {
      return [{ q: `\u8FD9\u7BC7\u6587\u7AE0\u5728\u8BB2\u4EC0\u4E48\uFF1F`, a: `\u300A${title}\u300B\u6B63\u6587\u8FC7\u77ED\uFF0C\u65E0\u6CD5\u63D0\u70BC\u95EE\u7B54\u3002` }];
    }
    const faq = [
      {
        q: `\u300A${title}\u300B\u7684\u6838\u5FC3\u89C2\u70B9\u662F\u4EC0\u4E48\uFF1F`,
        a: trimLen(picks[0].text, 160)
      }
    ];
    if (picks[1]) {
      faq.push({
        q: "\u6709\u54EA\u4E9B\u503C\u5F97\u8BB0\u4F4F\u7684\u7EC6\u8282\uFF1F",
        a: trimLen(picks.slice(1, 3).map((p) => p.text).join(" "), 180)
      });
    }
    if (picks[3]) {
      faq.push({
        q: "\u5982\u679C\u53EA\u770B\u4E00\u53E5\u8BDD\uFF0C\u8BE5\u5E26\u8D70\u4EC0\u4E48\uFF1F",
        a: trimLen(picks[3].text, 120)
      });
    }
    faq.push({
      q: "\u9002\u5408\u4EC0\u4E48\u573A\u666F\u9605\u8BFB\uFF1F",
      a: `\u5F53\u4F60\u9700\u8981\u5FEB\u901F\u7406\u89E3\u300C${title}\u300D\u7684\u8981\u70B9\u3001\u5E76\u8F6C\u6210\u97F3\u9891\u6216\u89C6\u9891\u6982\u89C8\u65F6\u3002`
    });
    return faq;
  }
  function buildDialogue(title, bullets, top) {
    const points = bullets.length ? bullets : top.slice(0, 4).map((t) => trimLen(t, 80));
    const lines = [
      { speaker: "A", text: `\u55E8\uFF0C\u4ECA\u5929\u6211\u4EEC\u6765\u804A\u4E00\u7BC7\u7F51\u9875\uFF1A\u300A${title}\u300B\u3002` },
      { speaker: "B", text: "\u597D\u554A\u3002\u4F60\u5148\u7ED9\u4E2A\u5168\u666F\uFF0C\u8FD9\u7BC7\u6587\u7AE0\u5927\u6982\u5728\u8BB2\u4EC0\u4E48\uFF1F" },
      {
        speaker: "A",
        text: points[0] ? `\u5F00\u7BC7\u6700\u91CD\u8981\u7684\u4E00\u70B9\u662F\uFF1A${ensurePeriod(points[0])}` : `\u5B83\u56F4\u7ED5\u300C${title}\u300D\u5C55\u5F00\uFF0C\u4FE1\u606F\u91CF\u4E0D\u7B97\u5C11\u3002`
      }
    ];
    for (let i = 1; i < Math.min(points.length, 4); i++) {
      if (i % 2 === 1) {
        lines.push({ speaker: "B", text: `\u7B49\u7B49\uFF0C\u6240\u4EE5\u4E5F\u5C31\u662F\u8BF4\u2014\u2014${ensurePeriod(points[i])}` });
        lines.push({ speaker: "A", text: "\u5BF9\uFF0C\u4F60\u53EF\u4EE5\u8FD9\u4E48\u7406\u89E3\u3002\u8FD8\u6709\u4E0B\u4E00\u5C42\u3002" });
      } else {
        lines.push({ speaker: "A", text: `\u53E6\u5916\u4E00\u70B9\uFF1A${ensurePeriod(points[i])}` });
        lines.push({ speaker: "B", text: "\u660E\u767D\u4E86\uFF0C\u8FD9\u4E2A\u7EC6\u8282\u633A\u5173\u952E\u3002" });
      }
    }
    lines.push({
      speaker: "B",
      text: "\u5982\u679C\u542C\u4F17\u53EA\u8BB0\u4F4F\u4E00\u4EF6\u4E8B\uFF0C\u4F60\u5E0C\u671B\u662F\u4EC0\u4E48\uFF1F"
    });
    lines.push({
      speaker: "A",
      text: points[0] ? `\u8BB0\u4F4F\u8FD9\u4E2A\uFF1A${ensurePeriod(points[0])} \u5176\u4F59\u90FD\u662F\u5C55\u5F00\u3002` : `\u8BB0\u4F4F\u6807\u9898\u672C\u8EAB\uFF1A\u300A${title}\u300B\uFF0C\u7136\u540E\u6309\u9700\u56DE\u770B\u539F\u6587\u3002`
    });
    lines.push({ speaker: "B", text: "\u5F88\u597D\u3002\u4ECA\u5929\u7684\u97F3\u9891\u6982\u89C8\u5C31\u5230\u8FD9\u91CC\uFF0C\u53BB\u6E05\u9875\u6587\u5E93\u91CC\u8FD8\u80FD\u751F\u6210\u89C6\u9891\u7248\u3002" });
    lines.push({ speaker: "A", text: "\u4E0B\u671F\u89C1\u3002" });
    return lines;
  }
  function buildSlides(title, bullets, summary) {
    const slides = [
      { title: "\u6E05\u9875 \xB7 \u89C6\u9891\u6982\u89C8", body: title },
      { title: "\u4E00\u53E5\u8BDD\u7B80\u62A5", body: trimLen(summary.replace(/^关于「[^」]+」：/, ""), 140) }
    ];
    bullets.slice(0, 4).forEach((b, i) => {
      slides.push({ title: `\u8981\u70B9 ${i + 1}`, body: b });
    });
    slides.push({ title: "\u5E26\u8D70\u4E00\u53E5", body: bullets[0] || title });
    return slides;
  }
  function trimLen(s, n) {
    const t = String(s || "").trim();
    return t.length <= n ? t : `${t.slice(0, n - 1)}\u2026`;
  }
  function ensurePeriod(s) {
    const t = String(s || "").trim();
    if (!t) return t;
    return /[。！？.!?]$/.test(t) ? t : `${t}\u3002`;
  }
  function answerQuestion(question, doc) {
    const q = String(question || "").trim();
    if (!q) return "\u5148\u95EE\u4E00\u4E2A\u95EE\u9898\u3002";
    const sentences = splitSentences(doc.text || "");
    if (!sentences.length) return "\u5F53\u524D\u6765\u6E90\u6CA1\u6709\u8DB3\u591F\u6B63\u6587\u3002";
    const qTokens = new Set(tokens(q));
    let best = sentences[0];
    let bestScore = -1;
    for (const s of sentences) {
      const st = tokens(s);
      let score = 0;
      for (const t of st) if (qTokens.has(t)) score++;
      if (score > bestScore) {
        bestScore = score;
        best = s;
      }
    }
    if (bestScore <= 0) {
      return `\u6211\u5728\u300A${doc.title || "\u6765\u6E90"}\u300B\u91CC\u6CA1\u627E\u5230\u76F4\u63A5\u5BF9\u5E94\u53E5\u3002\u4F60\u53EF\u4EE5\u6362\u4E2A\u95EE\u6CD5\uFF0C\u6216\u5148\u770B Studio \u7B80\u62A5\u3002`;
    }
    return best;
  }

  // src/studio/tts.js
  function listVoices() {
    if (!("speechSynthesis" in window)) return [];
    return window.speechSynthesis.getVoices();
  }
  function pickVoices() {
    const voices = listVoices();
    const zh = voices.filter((v) => /zh|chinese|中文|普通话|国语/i.test(`${v.lang} ${v.name}`));
    const pool = zh.length >= 2 ? zh : voices;
    const a = pool[0] || null;
    let b = pool.find((v) => v !== a) || pool[1] || a;
    if (pool.length > 2) {
      const alt = pool.find((v) => v !== a && /female|male|婷|晓|云|楠|宇/i.test(v.name));
      if (alt) b = alt;
    }
    return { voiceA: a, voiceB: b };
  }
  function speakLine(text, opts = {}) {
    return new Promise((resolve, reject) => {
      if (!("speechSynthesis" in window)) {
        reject(new Error("\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301\u8BED\u97F3\u5408\u6210"));
        return;
      }
      const u = new SpeechSynthesisUtterance(text);
      u.rate = opts.rate ?? 1.02;
      u.pitch = opts.pitch ?? 1;
      u.lang = opts.lang ?? "zh-CN";
      if (opts.voice) u.voice = opts.voice;
      u.onend = () => resolve();
      u.onerror = (e) => {
        if (e.error === "interrupted" || e.error === "canceled") resolve();
        else reject(new Error(e.error || "\u6717\u8BFB\u5931\u8D25"));
      };
      window.speechSynthesis.speak(u);
    });
  }
  function stopSpeech() {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }
  async function playDialogue(dialogue, opts = {}) {
    stopSpeech();
    await waitVoices();
    const { voiceA, voiceB } = pickVoices();
    for (let i = 0; i < dialogue.length; i++) {
      if (opts.shouldStop?.()) break;
      const line = dialogue[i];
      opts.onLine?.(i, line);
      const isA = line.speaker === "A";
      await speakLine(line.text, {
        voice: isA ? voiceA : voiceB,
        pitch: isA ? 1.05 : 0.92,
        rate: isA ? 1.05 : 1
      });
      await sleep(180);
    }
  }
  function waitVoices() {
    return new Promise((resolve) => {
      const ready = listVoices();
      if (ready.length) {
        resolve();
        return;
      }
      if (!("speechSynthesis" in window)) {
        resolve();
        return;
      }
      const t = setTimeout(() => resolve(), 800);
      window.speechSynthesis.onvoiceschanged = () => {
        clearTimeout(t);
        resolve();
      };
    });
  }
  function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
  }
  function estimateDialogueSeconds(dialogue) {
    const chars = dialogue.reduce((n, l) => n + (l.text || "").replace(/\s+/g, "").length, 0);
    return Math.max(8, Math.round(chars / 4.2));
  }

  // src/http.js
  var capacitorHttp2 = null;
  async function getCapacitorHttp2() {
    if (capacitorHttp2 !== null) return capacitorHttp2;
    try {
      const core = await Promise.resolve().then(() => (init_dist(), dist_exports));
      if (core.Capacitor?.isNativePlatform?.() && core.CapacitorHttp) {
        capacitorHttp2 = core.CapacitorHttp;
        return capacitorHttp2;
      }
    } catch {
    }
    capacitorHttp2 = false;
    return false;
  }
  async function httpRequest(opts) {
    const {
      url,
      method = "GET",
      headers = {},
      body,
      responseType = "json"
    } = opts;
    const Http = await getCapacitorHttp2();
    if (Http) {
      const options = {
        url,
        method,
        headers,
        data: body,
        responseType: responseType === "arraybuffer" ? "arraybuffer" : responseType
      };
      if (typeof body === "string") options.data = body;
      const res2 = await Http.request(options);
      if (res2.status < 200 || res2.status >= 300) {
        const msg = typeof res2.data === "string" ? res2.data : JSON.stringify(res2.data);
        throw new Error(parseApiError(msg, res2.status));
      }
      if (responseType === "arraybuffer") {
        return toArrayBuffer(res2.data);
      }
      return res2.data;
    }
    const init2 = { method, headers };
    if (body !== void 0 && body !== null) {
      init2.body = typeof body === "string" ? body : JSON.stringify(body);
    }
    const res = await fetch(url, init2);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(parseApiError(text, res.status));
    }
    if (responseType === "arraybuffer") return res.arrayBuffer();
    if (responseType === "text") return res.text();
    if (res.status === 204) return null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json();
    return res.text();
  }
  function toArrayBuffer(data) {
    if (data instanceof ArrayBuffer) return data;
    if (ArrayBuffer.isView(data)) {
      return data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
    }
    if (typeof data === "string") {
      const bin = atob(data);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      return bytes.buffer;
    }
    throw new Error("\u65E0\u6CD5\u89E3\u6790\u97F3\u9891\u4E8C\u8FDB\u5236\u54CD\u5E94");
  }
  function parseApiError(raw, status) {
    try {
      const j = JSON.parse(raw);
      const msg = j?.error?.message || j?.detail?.message || j?.message || j?.detail;
      if (msg) return String(msg).slice(0, 240);
    } catch {
    }
    const t = String(raw || "").slice(0, 180);
    if (status === 401) return "API Key \u65E0\u6548\u6216\u672A\u6388\u6743";
    if (status === 429) return "\u8BF7\u6C42\u8FC7\u4E8E\u9891\u7E41\u6216\u989D\u5EA6\u4E0D\u8DB3";
    return t || `HTTP ${status}`;
  }

  // src/settings.js
  var KEY2 = "qingye.settings.v1";
  var OPENAI_VOICES = [
    "alloy",
    "ash",
    "ballad",
    "coral",
    "echo",
    "fable",
    "nova",
    "onyx",
    "sage",
    "shimmer"
  ];
  var DEFAULTS = {
    ttsProvider: "device",
    openaiApiKey: "",
    openaiBaseUrl: "https://api.openai.com/v1",
    openaiModel: "tts-1-hd",
    openaiVoiceA: "nova",
    openaiVoiceB: "onyx",
    elevenApiKey: "",
    elevenBaseUrl: "https://api.elevenlabs.io/v1",
    elevenModel: "eleven_multilingual_v2",
    /** Default public multilingual-ish voices; override in settings */
    elevenVoiceA: "EXAVITQu4vr4xnSDxMaL",
    // Sarah
    elevenVoiceB: "JBFqnCBsd6RMkjVDRZzb"
    // George
  };
  function loadSettings() {
    try {
      const raw = localStorage.getItem(KEY2);
      if (!raw) return { ...DEFAULTS };
      return { ...DEFAULTS, ...JSON.parse(raw) };
    } catch {
      return { ...DEFAULTS };
    }
  }
  function saveSettings(partial) {
    const next = { ...loadSettings(), ...partial };
    localStorage.setItem(KEY2, JSON.stringify(next));
    return next;
  }
  function cloudTtsReady(settings2 = loadSettings()) {
    const p = settings2.ttsProvider || "device";
    if (p === "openai") return Boolean(settings2.openaiApiKey?.trim());
    if (p === "elevenlabs") return Boolean(settings2.elevenApiKey?.trim());
    return false;
  }
  function resolveTtsProvider(settings2 = loadSettings()) {
    const p = settings2.ttsProvider || "device";
    if (p !== "device" && cloudTtsReady(settings2)) return p;
    return "device";
  }
  function maskSecret(s) {
    if (!s) return "";
    if (s.length <= 8) return "\u2022\u2022\u2022\u2022";
    return `${s.slice(0, 4)}\u2026${s.slice(-4)}`;
  }

  // src/studio/cloud-tts.js
  async function synthesizeLine(text, speaker, settings2 = loadSettings()) {
    const provider = resolveTtsProvider(settings2);
    if (provider === "openai") return openaiSpeech(text, speaker, settings2);
    if (provider === "elevenlabs") return elevenSpeech(text, speaker, settings2);
    throw new Error("\u672A\u914D\u7F6E\u4E91\u7AEF TTS\uFF0C\u8BF7\u5728\u8BBE\u7F6E\u4E2D\u586B\u5199 API Key");
  }
  async function openaiSpeech(text, speaker, settings2) {
    const base = (settings2.openaiBaseUrl || "https://api.openai.com/v1").replace(/\/$/, "");
    const voice = speaker === "B" ? settings2.openaiVoiceB || "onyx" : settings2.openaiVoiceA || "nova";
    const key = settings2.openaiApiKey.trim();
    if (!key) throw new Error("\u8BF7\u586B\u5199 OpenAI API Key");
    const buf = await httpRequest({
      url: `${base}/audio/speech`,
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json"
      },
      body: {
        model: settings2.openaiModel || "tts-1-hd",
        input: String(text).slice(0, 4096),
        voice,
        response_format: "mp3"
      },
      responseType: "arraybuffer"
    });
    return buf;
  }
  async function elevenSpeech(text, speaker, settings2) {
    const base = (settings2.elevenBaseUrl || "https://api.elevenlabs.io/v1").replace(/\/$/, "");
    const voiceId = speaker === "B" ? (settings2.elevenVoiceB || "").trim() : (settings2.elevenVoiceA || "").trim();
    const key = settings2.elevenApiKey.trim();
    if (!key) throw new Error("\u8BF7\u586B\u5199 ElevenLabs API Key");
    if (!voiceId) throw new Error("\u8BF7\u586B\u5199 ElevenLabs Voice ID");
    const buf = await httpRequest({
      url: `${base}/text-to-speech/${encodeURIComponent(voiceId)}?output_format=mp3_44100_128`,
      method: "POST",
      headers: {
        "xi-api-key": key,
        "Content-Type": "application/json",
        Accept: "audio/mpeg"
      },
      body: {
        text: String(text).slice(0, 5e3),
        model_id: settings2.elevenModel || "eleven_multilingual_v2",
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.8,
          style: 0.35,
          use_speaker_boost: true
        }
      },
      responseType: "arraybuffer"
    });
    return buf;
  }
  async function synthesizePodcast(dialogue, opts = {}) {
    const settings2 = opts.settings || loadSettings();
    const provider = resolveTtsProvider(settings2);
    if (provider === "device") {
      throw new Error("\u8BF7\u5148\u5728\u8BBE\u7F6E\u4E2D\u9009\u62E9 OpenAI \u6216 ElevenLabs \u5E76\u586B\u5199 Key");
    }
    const parts = [];
    const total = dialogue.length;
    for (let i = 0; i < total; i++) {
      if (opts.shouldStop?.()) throw new DOMException("Aborted", "AbortError");
      const line = dialogue[i];
      opts.onProgress?.(i / total, `\u5408\u6210 ${i + 1}/${total} \xB7 ${line.speaker}`);
      const buf = await synthesizeLine(line.text, line.speaker, settings2);
      parts.push(buf);
    }
    opts.onProgress?.(1, "\u5408\u5E76\u97F3\u8F68");
    const blob = concatMp3(parts);
    return { blob, mime: "audio/mpeg", buffers: parts };
  }
  function concatMp3(buffers) {
    const arrays = buffers.map((b) => new Uint8Array(b));
    const len = arrays.reduce((n, a) => n + a.length, 0);
    const out = new Uint8Array(len);
    let offset = 0;
    for (const a of arrays) {
      out.set(a, offset);
      offset += a.length;
    }
    return new Blob([out], { type: "audio/mpeg" });
  }

  // src/studio/video.js
  async function renderVideoOverview(opts) {
    const slides = opts.slides?.length ? opts.slides : [{ title: "\u6E05\u9875", body: opts.title || "\u7A7A\u6765\u6E90" }];
    const sec = opts.secondsPerSlide ?? 3.2;
    const w = 1280;
    const h = 720;
    const fps = 30;
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const audioCtx = AudioCtx ? new AudioCtx() : null;
    if (audioCtx?.state === "suspended") await audioCtx.resume();
    const dest = audioCtx?.createMediaStreamDestination?.() ?? null;
    const canvasStream = canvas.captureStream(fps);
    const tracks = [...canvasStream.getVideoTracks()];
    if (dest) tracks.push(...dest.stream.getAudioTracks());
    const combined = new MediaStream(tracks);
    const mime = pickMime();
    if (typeof MediaRecorder === "undefined") {
      throw new Error("\u5F53\u524D\u73AF\u5883\u4E0D\u652F\u6301\u5F55\u5236\u89C6\u9891");
    }
    const recorder = new MediaRecorder(
      combined,
      mime ? { mimeType: mime, videoBitsPerSecond: 35e5 } : { videoBitsPerSecond: 35e5 }
    );
    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data?.size) chunks.push(e.data);
    };
    const done = new Promise((resolve, reject) => {
      recorder.onstop = () => resolve(new Blob(chunks, { type: recorder.mimeType || mime || "video/webm" }));
      recorder.onerror = () => reject(new Error("\u5F55\u5236\u5931\u8D25"));
    });
    recorder.start(200);
    const totalMs = slides.length * sec * 1e3;
    const start = performance.now();
    let slideIndex = 0;
    const ding = () => {
      if (!audioCtx || !dest) return;
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "sine";
      o.frequency.value = 523.25;
      g.gain.value = 0.04;
      o.connect(g);
      g.connect(dest);
      g.connect(audioCtx.destination);
      o.start();
      g.gain.exponentialRampToValueAtTime(1e-4, audioCtx.currentTime + 0.25);
      o.stop(audioCtx.currentTime + 0.28);
    };
    ding();
    await new Promise((resolve, reject) => {
      const tick = () => {
        if (opts.signal?.aborted) {
          try {
            recorder.stop();
          } catch {
          }
          reject(new DOMException("Aborted", "AbortError"));
          return;
        }
        const elapsed = performance.now() - start;
        slideIndex = Math.min(slides.length - 1, Math.floor(elapsed / (sec * 1e3)));
        const localT = elapsed % (sec * 1e3) / (sec * 1e3);
        paintSlide(ctx, w, h, slides[slideIndex], slideIndex, slides.length, localT);
        opts.onProgress?.(Math.min(1, elapsed / totalMs), `\u5E7B\u706F ${slideIndex + 1}/${slides.length}`);
        const nextIdx = Math.min(slides.length - 1, Math.floor(elapsed / (sec * 1e3)));
        if (nextIdx !== tick._last && nextIdx > 0) {
          tick._last = nextIdx;
          ding();
        }
        tick._last = tick._last ?? 0;
        if (elapsed >= totalMs) {
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    if (recorder.state !== "inactive") recorder.stop();
    const blob = await done;
    try {
      await audioCtx?.close?.();
    } catch {
    }
    opts.onProgress?.(1, "\u5B8C\u6210");
    return { blob, mime: blob.type || mime || "video/webm" };
  }
  function paintSlide(ctx, w, h, slide, index, total, t) {
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#0f2a2a");
    g.addColorStop(0.55, "#163d3d");
    g.addColorStop(1, "#1a4a3a");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
    const orb = ctx.createRadialGradient(w * 0.8, h * 0.2, 20, w * 0.8, h * 0.2, w * 0.45);
    orb.addColorStop(0, "rgba(196, 120, 42, 0.22)");
    orb.addColorStop(1, "transparent");
    ctx.fillStyle = orb;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "rgba(255,255,255,0.12)";
    ctx.fillRect(64, h - 48, w - 128, 6);
    ctx.fillStyle = "#3ecfbf";
    ctx.fillRect(64, h - 48, (w - 128) * ((index + t) / total), 6);
    ctx.fillStyle = "rgba(255,255,255,0.45)";
    ctx.font = "600 28px Syne, sans-serif";
    ctx.fillText("\u6E05\u9875 \xB7 Studio", 72, 72);
    const fade = Math.min(1, t * 3);
    ctx.globalAlpha = fade;
    ctx.fillStyle = "#f4fbfa";
    ctx.font = "700 64px Syne, sans-serif";
    wrapText(ctx, slide.title || "", 72, 200, w - 144, 72);
    ctx.fillStyle = "rgba(244, 251, 250, 0.9)";
    ctx.font = "500 40px Literata, Songti SC, serif";
    wrapText(ctx, slide.body || "", 72, 320, w - 144, 56);
    ctx.globalAlpha = 1;
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.font = "600 22px Syne, sans-serif";
    ctx.fillText(`${index + 1} / ${total}`, w - 140, h - 64);
  }
  function wrapText(ctx, text, x, y, maxW, lineH) {
    const chars = String(text);
    let line = "";
    let yy = y;
    for (const ch of chars) {
      const test = line + ch;
      if (ctx.measureText(test).width > maxW && line) {
        ctx.fillText(line, x, yy);
        line = ch;
        yy += lineH;
        if (yy > y + lineH * 5) {
          ctx.fillText(`${line}\u2026`, x, yy);
          return;
        }
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x, yy);
  }
  function pickMime() {
    const candidates = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm",
      "video/mp4"
    ];
    for (const m of candidates) {
      if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(m)) return m;
    }
    return "";
  }
  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 4e3);
  }
  function extForMime(mime) {
    if (/mp4/i.test(mime || "")) return "mp4";
    return "webm";
  }

  // src/app.js
  var $ = (sel, root = document) => root.querySelector(sel);
  var docs = [];
  var current = null;
  var focusIndex = -1;
  var busy = false;
  var brief = null;
  var audioPlaying = false;
  var stopAudio = false;
  var lastMedia = null;
  var settings = loadSettings();
  var els = {};
  async function haptic(style = "Light") {
    try {
      const { Haptics: Haptics2, ImpactStyle: ImpactStyle2 } = await Promise.resolve().then(() => (init_esm(), esm_exports));
      await Haptics2.impact({ style: ImpactStyle2[style] || ImpactStyle2.Light });
    } catch {
    }
  }
  function toast(msg) {
    const t = els.toast;
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => t.classList.remove("show"), 2200);
  }
  function persist() {
    docs = saveDocs(docs);
    renderList();
  }
  function ensureBrief() {
    if (!current) return null;
    if (!brief || brief._docId !== current.id) {
      brief = { ...buildBrief(current), _docId: current.id };
    }
    return brief;
  }
  function setStudioEnabled(on) {
    for (const btn of [els.btnAudio, els.btnVideo, els.btnBrief, els.btnFaq]) {
      if (btn) btn.disabled = !on;
    }
    els.studioSourceLabel.textContent = on ? (current.title || "\u5F53\u524D\u6765\u6E90").slice(0, 28) : "\u672A\u9009\u6765\u6E90";
  }
  function switchTab(name) {
    for (const tab of document.querySelectorAll(".tab")) {
      tab.classList.toggle("active", tab.dataset.tab === name);
    }
    for (const panel of document.querySelectorAll(".panel")) {
      panel.classList.toggle("active", panel.id === `panel-${name}`);
    }
  }
  function bind() {
    els.url = $("#url");
    els.clipBtn = $("#clip-btn");
    els.pasteBtn = $("#paste-btn");
    els.pasteArea = $("#paste-area");
    els.pastePanel = $("#paste-panel");
    els.pasteClip = $("#paste-clip");
    els.quickAudio = $("#quick-audio");
    els.quickVideo = $("#quick-video");
    els.sourceCard = $("#source-card");
    els.previewMeta = $("#preview-meta");
    els.previewBody = $("#preview-body");
    els.saveBtn = $("#save-btn");
    els.shareBtn = $("#share-btn");
    els.copyBtn = $("#copy-btn");
    els.format = $("#format");
    els.list = $("#doc-list");
    els.empty = $("#empty");
    els.count = $("#count");
    els.toast = $("#toast");
    els.wearBtn = $("#wear-btn");
    els.settingsBtn = $("#settings-btn");
    els.settingsPanel = $("#settings-panel");
    els.settingsSave = $("#settings-save");
    els.settingsClose = $("#settings-close");
    els.settingsStatus = $("#settings-status");
    els.setProvider = $("#set-provider");
    els.setOpenai = $("#set-openai");
    els.setEleven = $("#set-eleven");
    els.statsLine = $("#stats-line");
    els.studioSourceLabel = $("#studio-source-label");
    els.btnAudio = $("#btn-audio");
    els.btnVideo = $("#btn-video");
    els.btnBrief = $("#btn-brief");
    els.btnFaq = $("#btn-faq");
    els.studioOut = $("#studio-out");
    els.studioOutTitle = $("#studio-out-title");
    els.studioOutBody = $("#studio-out-body");
    els.studioCloud = $("#studio-cloud");
    els.studioPlay = $("#studio-play");
    els.studioStop = $("#studio-stop");
    els.studioCopy = $("#studio-copy");
    els.studioDownload = $("#studio-download");
    els.audioPreview = $("#audio-preview");
    els.videoPreview = $("#video-preview");
    els.genProgress = $("#gen-progress");
    els.askInput = $("#ask-input");
    els.askBtn = $("#ask-btn");
    els.askAnswer = $("#ask-answer");
    fillVoiceSelects();
    loadSettingsIntoForm();
    els.clipBtn.addEventListener("click", () => clipFromUrl());
    els.pasteBtn.addEventListener("click", () => els.pastePanel.classList.toggle("open"));
    els.pasteClip.addEventListener("click", () => clipFromPaste());
    els.quickAudio.addEventListener("click", () => quickMedia("audio"));
    els.quickVideo.addEventListener("click", () => quickMedia("video"));
    els.saveBtn.addEventListener("click", () => saveCurrent());
    els.copyBtn.addEventListener("click", () => copyCurrent());
    els.shareBtn.addEventListener("click", () => shareCurrent());
    els.format.addEventListener("change", () => renderPreview());
    els.url.addEventListener("keydown", (e) => {
      if (e.key === "Enter") clipFromUrl();
    });
    document.querySelectorAll(".tab").forEach((tab) => {
      tab.addEventListener("click", () => switchTab(tab.dataset.tab));
    });
    els.settingsBtn.addEventListener("click", () => {
      els.settingsPanel.hidden = !els.settingsPanel.hidden;
      if (!els.settingsPanel.hidden) loadSettingsIntoForm();
    });
    els.settingsClose.addEventListener("click", () => {
      els.settingsPanel.hidden = true;
    });
    els.settingsSave.addEventListener("click", () => saveSettingsFromForm());
    els.setProvider.addEventListener("change", () => toggleProviderFields());
    els.btnAudio.addEventListener("click", () => showAudioOverview());
    els.btnVideo.addEventListener("click", () => generateVideo());
    els.btnBrief.addEventListener("click", () => showBrief());
    els.btnFaq.addEventListener("click", () => showFaq());
    els.studioCloud.addEventListener("click", () => generateCloudPodcast());
    els.studioPlay.addEventListener("click", () => playAudioOverview());
    els.studioStop.addEventListener("click", () => {
      stopAudio = true;
      stopSpeech();
      try {
        els.audioPreview.pause();
      } catch {
      }
      audioPlaying = false;
      toast("\u5DF2\u505C\u6B62");
    });
    els.studioCopy.addEventListener("click", () => copyStudioOut());
    els.studioDownload.addEventListener("click", () => {
      if (!lastMedia) return;
      const ext = lastMedia.kind === "audio" ? "mp3" : extForMime(lastMedia.mime);
      const name = `${(current?.title || "qingye").slice(0, 40)}-${lastMedia.kind}.${ext}`;
      downloadBlob(lastMedia.blob, name.replace(/[\\/:*?"<>|]/g, "_"));
      toast("\u5DF2\u5F00\u59CB\u4E0B\u8F7D");
    });
    els.askBtn.addEventListener("click", () => doAsk());
    els.askInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doAsk();
    });
    els.wearBtn.addEventListener("click", async () => {
      const ok = await wear.requestPermission();
      if (ok === false) {
        toast("\u4F20\u611F\u5668\u6743\u9650\u672A\u6388\u4E88");
        return;
      }
      wear.start();
      els.wearBtn.classList.add("on");
      toast("\u7A7F\u6234\u624B\u52BF\u5DF2\u5F00\u542F");
    });
  }
  async function ensureSourceFromUrl() {
    if (current?.text) return true;
    const url = els.url.value.trim();
    if (!url) {
      toast("\u5148\u7C98\u8D34\u7F51\u5740\u6216\u9009\u62E9\u6765\u6E90");
      return false;
    }
    await clipFromUrl();
    return Boolean(current?.text);
  }
  async function quickMedia(kind) {
    const ok = await ensureSourceFromUrl();
    if (!ok) return;
    if (!docs.find((d) => d.id === current.id)) {
      docs = upsertDoc(docs, current);
      persist();
    }
    switchTab("studio");
    if (kind === "audio") await showAudioOverview(true);
    else await generateVideo();
  }
  async function clipFromUrl() {
    if (busy) return;
    const url = els.url.value.trim();
    if (!url) {
      toast("\u5148\u7C98\u8D34\u7F51\u5740");
      els.url.focus();
      return;
    }
    busy = true;
    els.clipBtn.disabled = true;
    els.clipBtn.textContent = "\u6E05\u6D17\u4E2D\u2026";
    try {
      const { url: finalUrl, html, via } = await fetchPage(url);
      const article = extractArticle(html, { url: finalUrl });
      current = createDoc({
        title: article.title,
        url: article.url,
        byline: article.byline,
        markdown: article.markdown,
        text: article.text,
        html: article.html,
        stats: { ...article.stats, via }
      });
      brief = null;
      lastMedia = null;
      renderPreview();
      setStudioEnabled(true);
      await haptic("Medium");
      const s = article.stats;
      toast(`\u5DF2\u51C0\uFF1A\u53BB\u56FE ${s.imagesRemoved} \xB7 \u53BB\u566A ${s.nodesRemoved + s.junkLines}`);
    } catch (e) {
      toast(e.message || "\u8F6C\u5B58\u5931\u8D25");
    } finally {
      busy = false;
      els.clipBtn.disabled = false;
      els.clipBtn.textContent = "\u6DFB\u52A0\u6765\u6E90";
    }
  }
  function clipFromPaste() {
    const html = els.pasteArea.value.trim();
    if (!html) {
      toast("\u7C98\u8D34\u7F51\u9875 HTML \u6216\u6B63\u6587");
      return;
    }
    const wrapped = /<html[\s>]/i.test(html) || /<body[\s>]/i.test(html) ? html : `<!DOCTYPE html><html><body>${html}</body></html>`;
    const article = extractArticle(wrapped, { url: els.url.value.trim() || "" });
    current = createDoc({
      title: article.title || "\u7C98\u8D34\u6587\u6863",
      url: article.url,
      byline: article.byline,
      markdown: article.markdown,
      text: article.text,
      html: article.html,
      stats: article.stats
    });
    brief = null;
    lastMedia = null;
    els.pastePanel.classList.remove("open");
    renderPreview();
    setStudioEnabled(true);
    haptic("Medium");
    toast("\u5DF2\u4ECE\u7C98\u8D34\u5185\u5BB9\u6E05\u6D17");
  }
  function contentForFormat() {
    if (!current) return "";
    const fmt = els.format.value;
    if (fmt === "text") return current.text;
    if (fmt === "html") {
      return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>${escapeHtml(current.title)}</title></head>
<body>
<article>
<h1>${escapeHtml(current.title)}</h1>
${current.byline ? `<p>${escapeHtml(current.byline)}</p>` : ""}
${current.html}
</article>
</body>
</html>`;
    }
    return current.markdown;
  }
  function escapeHtml(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function renderPreview() {
    if (!current) {
      els.sourceCard.classList.add("hidden");
      setStudioEnabled(false);
      return;
    }
    els.sourceCard.classList.remove("hidden");
    els.previewMeta.textContent = [
      current.title,
      current.byline,
      current.url ? shortUrl(current.url) : ""
    ].filter(Boolean).join(" \xB7 ");
    const body = contentForFormat();
    els.previewBody.textContent = body.slice(0, 12e3) + (body.length > 12e3 ? "\n\n\u2026" : "");
    const s = current.stats || {};
    els.statsLine.textContent = [
      s.imagesRemoved != null ? `\u65E0\u6548\u56FE ${s.imagesRemoved}` : "",
      s.nodesRemoved != null ? `\u65E0\u6548\u5757 ${s.nodesRemoved}` : "",
      s.junkLines != null ? `\u65E0\u6548\u884C ${s.junkLines}` : "",
      s.via ? `via ${s.via}` : ""
    ].filter(Boolean).join(" \xB7 ");
    setStudioEnabled(true);
  }
  function shortUrl(u) {
    try {
      const x = new URL(u);
      return x.hostname + (x.pathname.length > 24 ? `${x.pathname.slice(0, 24)}\u2026` : x.pathname);
    } catch {
      return u.slice(0, 40);
    }
  }
  function saveCurrent() {
    if (!current) {
      toast("\u5148\u6DFB\u52A0\u6765\u6E90");
      return;
    }
    docs = upsertDoc(docs, current);
    persist();
    haptic("Light");
    toast("\u5DF2\u6536\u5165\u6765\u6E90\u5E93");
    focusIndex = 0;
    highlightFocus();
  }
  async function copyCurrent() {
    if (!current) return;
    try {
      await navigator.clipboard.writeText(contentForFormat());
      toast("\u5DF2\u590D\u5236");
      await haptic("Light");
    } catch {
      toast("\u590D\u5236\u5931\u8D25");
    }
  }
  async function shareCurrent() {
    if (!current) return;
    const text = contentForFormat();
    try {
      const { Share: Share2 } = await Promise.resolve().then(() => (init_esm2(), esm_exports2));
      await Share2.share({ title: current.title, text, dialogTitle: "\u5206\u4EAB\u51C0\u6587\u6863" });
    } catch {
      try {
        if (navigator.share) await navigator.share({ title: current.title, text });
        else await copyCurrent();
      } catch {
      }
    }
  }
  function showStudioShell(title, { play = false, download = false, cloud = false } = {}) {
    els.studioOut.hidden = false;
    els.studioOutTitle.textContent = title;
    els.studioPlay.hidden = !play;
    els.studioStop.hidden = !play;
    els.studioCloud.hidden = !cloud;
    els.studioDownload.hidden = !download;
    if (!download || lastMedia?.kind !== "video") {
      els.videoPreview.removeAttribute("src");
      els.videoPreview.load?.();
    }
    if (!download || lastMedia?.kind !== "audio") {
      els.audioPreview.removeAttribute("src");
      els.audioPreview.style.display = "none";
    }
  }
  function fillVoiceSelects() {
    for (const sel of [$("#set-openai-voice-a"), $("#set-openai-voice-b")]) {
      if (!sel) continue;
      sel.innerHTML = OPENAI_VOICES.map((v) => `<option value="${v}">${v}</option>`).join("");
    }
  }
  function toggleProviderFields() {
    const p = els.setProvider.value;
    els.setOpenai.hidden = p !== "openai";
    els.setEleven.hidden = p !== "elevenlabs";
  }
  function loadSettingsIntoForm() {
    settings = loadSettings();
    els.setProvider.value = settings.ttsProvider || "device";
    $("#set-openai-key").value = settings.openaiApiKey || "";
    $("#set-openai-base").value = settings.openaiBaseUrl || "";
    $("#set-openai-model").value = settings.openaiModel || "tts-1-hd";
    $("#set-openai-voice-a").value = settings.openaiVoiceA || "nova";
    $("#set-openai-voice-b").value = settings.openaiVoiceB || "onyx";
    $("#set-eleven-key").value = settings.elevenApiKey || "";
    $("#set-eleven-base").value = settings.elevenBaseUrl || "";
    $("#set-eleven-model").value = settings.elevenModel || "eleven_multilingual_v2";
    $("#set-eleven-voice-a").value = settings.elevenVoiceA || "";
    $("#set-eleven-voice-b").value = settings.elevenVoiceB || "";
    toggleProviderFields();
    updateSettingsStatus();
  }
  function saveSettingsFromForm() {
    settings = saveSettings({
      ttsProvider: els.setProvider.value,
      openaiApiKey: $("#set-openai-key").value.trim(),
      openaiBaseUrl: $("#set-openai-base").value.trim() || "https://api.openai.com/v1",
      openaiModel: $("#set-openai-model").value,
      openaiVoiceA: $("#set-openai-voice-a").value,
      openaiVoiceB: $("#set-openai-voice-b").value,
      elevenApiKey: $("#set-eleven-key").value.trim(),
      elevenBaseUrl: $("#set-eleven-base").value.trim() || "https://api.elevenlabs.io/v1",
      elevenModel: $("#set-eleven-model").value,
      elevenVoiceA: $("#set-eleven-voice-a").value.trim(),
      elevenVoiceB: $("#set-eleven-voice-b").value.trim()
    });
    updateSettingsStatus();
    toast("TTS \u8BBE\u7F6E\u5DF2\u4FDD\u5B58");
    haptic("Light");
  }
  function updateSettingsStatus() {
    const p = resolveTtsProvider(settings);
    if (p === "openai") {
      els.settingsStatus.textContent = `OpenAI \xB7 ${maskSecret(settings.openaiApiKey)} \xB7 ${settings.openaiModel}`;
    } else if (p === "elevenlabs") {
      els.settingsStatus.textContent = `ElevenLabs \xB7 ${maskSecret(settings.elevenApiKey)}`;
    } else if (settings.ttsProvider !== "device" && !cloudTtsReady(settings)) {
      els.settingsStatus.textContent = "\u5DF2\u9009\u4E91\u7AEF\u4F46\u7F3A\u5C11 API Key";
    } else {
      els.settingsStatus.textContent = "\u5F53\u524D\uFF1A\u8BBE\u5907\u6717\u8BFB";
    }
    els.settingsBtn.textContent = p === "device" ? "TTS \u8BBE\u7F6E" : `TTS \xB7 ${p === "openai" ? "OpenAI" : "11Labs"}`;
  }
  function showBrief() {
    const b = ensureBrief();
    if (!b) return;
    showStudioShell("\u7B80\u62A5");
    const md = [`${b.summary}`, "", "\u8981\u70B9\uFF1A", ...b.bullets.map((x, i) => `${i + 1}. ${x}`)].join("\n");
    els.studioOutBody.textContent = md;
    els.studioOutBody.dataset.copy = md;
    switchTab("studio");
    haptic("Light");
  }
  function showFaq() {
    const b = ensureBrief();
    if (!b) return;
    showStudioShell("\u5E38\u89C1\u95EE\u9898");
    const md = b.faq.map((f) => `Q: ${f.q}
A: ${f.a}`).join("\n\n");
    els.studioOutBody.textContent = md;
    els.studioOutBody.dataset.copy = md;
    switchTab("studio");
    haptic("Light");
  }
  async function showAudioOverview(autoPlay = false) {
    const b = ensureBrief();
    if (!b) return;
    settings = loadSettings();
    const provider = resolveTtsProvider(settings);
    const cloud = provider !== "device";
    showStudioShell("\u97F3\u9891\u6982\u89C8", { play: true, cloud: true, download: Boolean(lastMedia?.kind === "audio") });
    const sec = estimateDialogueSeconds(b.dialogue);
    els.studioOutBody.innerHTML = "";
    const transcript = b.dialogue.map((l) => `${l.speaker === "A" ? "\u4E3B\u6301A" : "\u4E3B\u6301B"}\uFF1A${l.text}`).join("\n\n");
    els.studioOutBody.dataset.copy = transcript;
    b.dialogue.forEach((line, i) => {
      const div = document.createElement("div");
      div.className = "dialogue-line";
      div.dataset.i = String(i);
      div.innerHTML = `<div class="who">${line.speaker === "A" ? "HOST A" : "HOST B"}</div><div class="say"></div>`;
      div.querySelector(".say").textContent = line.text;
      els.studioOutBody.appendChild(div);
    });
    const note = document.createElement("p");
    note.style.cssText = "margin-top:12px;font-size:0.72rem;color:var(--ink-soft);font-family:var(--font-ui)";
    note.id = "audio-mode-note";
    note.textContent = cloud ? `\u7EA6 ${sec} \u79D2\u811A\u672C \xB7 \u5DF2\u914D\u7F6E ${provider === "openai" ? "OpenAI tts-1-hd" : "ElevenLabs"}\uFF0C\u70B9\u300C\u751F\u6210\u4E91\u7AEF\u64AD\u5BA2\u300D\u5408\u6210\u53EF\u4E0B\u8F7D MP3` : `\u7EA6 ${sec} \u79D2 \xB7 \u5F53\u524D\u4E3A\u8BBE\u5907\u6717\u8BFB\u3002\u6253\u5F00\u300CTTS \u8BBE\u7F6E\u300D\u53EF\u5207\u6362 OpenAI / ElevenLabs \u9AD8\u97F3\u8D28`;
    els.studioOutBody.appendChild(note);
    switchTab("studio");
    await haptic("Medium");
    toast(cloud ? "\u811A\u672C\u5DF2\u5C31\u7EEA\uFF0C\u53EF\u751F\u6210\u4E91\u7AEF\u64AD\u5BA2" : "\u97F3\u9891\u6982\u89C8\u5DF2\u751F\u6210");
    if (autoPlay) {
      if (cloud) await generateCloudPodcast();
      else playAudioOverview();
    }
  }
  async function generateCloudPodcast() {
    const b = ensureBrief();
    if (!b || busy) return;
    settings = loadSettings();
    if (resolveTtsProvider(settings) === "device") {
      els.settingsPanel.hidden = false;
      loadSettingsIntoForm();
      toast("\u8BF7\u5148\u914D\u7F6E\u4E91\u7AEF TTS API Key");
      return;
    }
    busy = true;
    stopAudio = false;
    els.studioCloud.disabled = true;
    els.genProgress.classList.add("show");
    const bar = els.genProgress.querySelector("i");
    const note = $("#audio-mode-note");
    if (note) note.textContent = "\u6B63\u5728\u8C03\u7528\u4E91\u7AEF TTS \u5408\u6210\u53CC\u4EBA\u64AD\u5BA2\u2026";
    try {
      const { blob, mime } = await synthesizePodcast(b.dialogue, {
        settings,
        shouldStop: () => stopAudio,
        onProgress: (r, label) => {
          bar.style.width = `${Math.round(r * 100)}%`;
          if (note) note.textContent = `${label} \xB7 ${Math.round(r * 100)}%`;
        }
      });
      lastMedia = { kind: "audio", blob, mime };
      const url = URL.createObjectURL(blob);
      els.audioPreview.src = url;
      els.audioPreview.style.display = "block";
      els.studioDownload.hidden = false;
      if (note) {
        note.textContent = `\u4E91\u7AEF\u64AD\u5BA2\u5DF2\u5408\u6210\uFF08${(blob.size / 1024).toFixed(0)} KB MP3\uFF09\xB7 \u53EF\u64AD\u653E\u6216\u4E0B\u8F7D`;
      }
      toast("\u4E91\u7AEF\u64AD\u5BA2\u5DF2\u5C31\u7EEA");
      await haptic("Medium");
      await els.audioPreview.play().catch(() => {
      });
    } catch (e) {
      if (e.name !== "AbortError") toast(e.message || "\u4E91\u7AEF\u5408\u6210\u5931\u8D25");
    } finally {
      busy = false;
      els.studioCloud.disabled = false;
      els.genProgress.classList.remove("show");
      bar.style.width = "0%";
    }
  }
  async function playAudioOverview() {
    const b = ensureBrief();
    if (!b || audioPlaying) return;
    audioPlaying = true;
    stopAudio = false;
    try {
      if (lastMedia?.kind === "audio") {
        toast("\u64AD\u653E\u4E91\u7AEF\u64AD\u5BA2\u2026");
        els.audioPreview.style.display = "block";
        if (!els.audioPreview.src) {
          els.audioPreview.src = URL.createObjectURL(lastMedia.blob);
        }
        await new Promise((resolve, reject) => {
          const a = els.audioPreview;
          const onEnd = () => {
            cleanup();
            resolve();
          };
          const onErr = () => {
            cleanup();
            reject(new Error("\u97F3\u9891\u64AD\u653E\u5931\u8D25"));
          };
          const watch = setInterval(() => {
            if (stopAudio) {
              a.pause();
              cleanup();
              resolve();
            }
          }, 200);
          const cleanup = () => {
            clearInterval(watch);
            a.removeEventListener("ended", onEnd);
            a.removeEventListener("error", onErr);
          };
          a.addEventListener("ended", onEnd);
          a.addEventListener("error", onErr);
          a.currentTime = 0;
          a.play().catch((e) => {
            cleanup();
            reject(e);
          });
        });
      } else {
        toast("\u8BBE\u5907\u6717\u8BFB\u4E2D\u2026\uFF08\u53EF\u5728\u8BBE\u7F6E\u5207\u6362\u4E91\u7AEF\u9AD8\u97F3\u8D28\uFF09");
        await playDialogue(b.dialogue, {
          shouldStop: () => stopAudio,
          onLine: (i) => {
            els.studioOutBody.querySelectorAll(".dialogue-line").forEach((el) => {
              el.classList.toggle("active", el.dataset.i === String(i));
            });
          }
        });
      }
      if (!stopAudio) toast("\u64AD\u653E\u5B8C\u6BD5");
    } catch (e) {
      toast(e.message || "\u64AD\u653E\u5931\u8D25");
    } finally {
      audioPlaying = false;
    }
  }
  async function generateVideo() {
    const b = ensureBrief();
    if (!b || busy) return;
    busy = true;
    showStudioShell("\u89C6\u9891\u6982\u89C8", { download: true });
    els.studioOutBody.textContent = "\u6B63\u5728\u6E32\u67D3\u5E7B\u706F\u7247\u89C6\u9891\u2026";
    els.studioOutBody.dataset.copy = b.slides.map((s) => `${s.title}
${s.body}`).join("\n\n");
    els.genProgress.classList.add("show");
    const bar = els.genProgress.querySelector("i");
    switchTab("studio");
    try {
      const { blob, mime } = await renderVideoOverview({
        slides: b.slides,
        title: current.title,
        secondsPerSlide: 3,
        onProgress: (r, label) => {
          bar.style.width = `${Math.round(r * 100)}%`;
          els.studioOutBody.textContent = `\u6E32\u67D3\u4E2D ${Math.round(r * 100)}% \xB7 ${label}`;
        }
      });
      lastMedia = { kind: "video", blob, mime };
      const url = URL.createObjectURL(blob);
      els.videoPreview.src = url;
      els.videoPreview.style.display = "block";
      els.studioOutBody.textContent = `\u89C6\u9891\u5DF2\u751F\u6210\uFF08${(blob.size / 1024).toFixed(0)} KB\uFF09\u3002\u53EF\u9884\u89C8\u6216\u4E0B\u8F7D\u5206\u4EAB\u3002`;
      els.studioDownload.hidden = false;
      toast("\u89C6\u9891\u6982\u89C8\u5DF2\u5C31\u7EEA");
      await haptic("Medium");
    } catch (e) {
      if (e.name !== "AbortError") toast(e.message || "\u89C6\u9891\u751F\u6210\u5931\u8D25");
    } finally {
      busy = false;
      els.genProgress.classList.remove("show");
      bar.style.width = "0%";
    }
  }
  async function copyStudioOut() {
    const text = els.studioOutBody.dataset.copy || els.studioOutBody.textContent || "";
    try {
      await navigator.clipboard.writeText(text);
      toast("\u5DF2\u590D\u5236 Studio \u8F93\u51FA");
    } catch {
      toast("\u590D\u5236\u5931\u8D25");
    }
  }
  function doAsk() {
    if (!current) {
      toast("\u5148\u6DFB\u52A0\u6216\u9009\u62E9\u6765\u6E90");
      return;
    }
    const q = els.askInput.value.trim();
    const a = answerQuestion(q, current);
    els.askAnswer.textContent = a;
  }
  function renderList() {
    els.count.textContent = String(docs.length);
    els.list.innerHTML = "";
    if (!docs.length) {
      els.empty.hidden = false;
      return;
    }
    els.empty.hidden = true;
    docs.forEach((d, i) => {
      const li = document.createElement("li");
      li.className = "doc-item";
      li.innerHTML = `
      <button type="button" class="doc-open">
        <span class="doc-title"></span>
        <span class="doc-sub"></span>
      </button>
      <button type="button" class="doc-del" aria-label="\u5220\u9664">\xD7</button>
    `;
      li.querySelector(".doc-title").textContent = d.title || "\u672A\u547D\u540D";
      li.querySelector(".doc-sub").textContent = [
        d.url ? shortUrl(d.url) : "\u672C\u5730\u7C98\u8D34",
        new Date(d.createdAt).toLocaleString("zh-CN", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })
      ].join(" \xB7 ");
      li.querySelector(".doc-open").addEventListener("click", () => {
        current = d;
        brief = null;
        lastMedia = null;
        if (d.url) els.url.value = d.url;
        focusIndex = i;
        renderPreview();
        highlightFocus();
        switchTab("sources");
      });
      li.querySelector(".doc-del").addEventListener("click", (e) => {
        e.stopPropagation();
        docs = removeDoc(docs, d.id);
        if (current?.id === d.id) {
          current = null;
          brief = null;
          renderPreview();
        }
        persist();
        toast("\u5DF2\u5220\u9664");
      });
      els.list.appendChild(li);
    });
    highlightFocus();
  }
  function highlightFocus() {
    [...els.list.children].forEach((li, i) => {
      li.classList.toggle("focus", i === focusIndex);
    });
  }
  function moveFocus(delta) {
    if (!docs.length) return;
    focusIndex = (focusIndex + delta + docs.length) % docs.length;
    highlightFocus();
    const d = docs[focusIndex];
    if (d) {
      current = d;
      brief = null;
      if (d.url) els.url.value = d.url;
      renderPreview();
    }
  }
  var wear = createWearableInput({
    onRingShake: () => quickMedia("audio"),
    onCaneTap: () => quickMedia("video"),
    onRingTiltUp: () => moveFocus(-1),
    onRingTiltDown: () => moveFocus(1),
    onCaneSwingLeft: () => moveFocus(-1),
    onCaneSwingRight: () => moveFocus(1)
  });
  function init() {
    bind();
    docs = loadDocs();
    renderList();
    renderPreview();
    requestAnimationFrame(() => document.body.classList.add("ready"));
    try {
      const q = new URLSearchParams(location.search).get("url");
      if (q) {
        els.url.value = q;
        clipFromUrl();
      }
    } catch {
    }
  }
  init();
})();
/*! Bundled license information:

@capacitor/core/dist/index.js:
  (*! Capacitor: https://capacitorjs.com/ - MIT License *)
*/
//# sourceMappingURL=app.js.map
