/**
 * @param {string} url
 * @return {string}
 */
function removeHashFromUrl(url) {
  var match = url.match(/(^.*)?(#.*$)/);
  return match ? match["1"] : url;
}

/**
 * @param {string} url
 * @return {boolean}
 */
function urlHasGetParams(url) {
  return url.indexOf("?") > -1;
}

/**
 * Render CT Frame
 *
 * @param {{
 *    baseUrl: string,
 *    layout: string,
 *    exchangeEventName: string,
 *    wrapperId: string,
 * } ||* } config
 * @param {string} ctUrl
 * @return {CtFrame}
 * @constructor
 */
function CtFrame(config, ctUrl) {
  if (!config) {
    throw new Error("Configuration object must be provided.");
  }

  var _this = this,
    baseUrl = config.baseUrl,
    wrapperId = config.wrapperId,
    layout = config.layout,
    exchangeEventName = config.exchangeEventName;

  if (!layout || !exchangeEventName || !baseUrl || !wrapperId) {
    throw new Error("All config params are mandatory. Config: { baseUrl, layout, exchangeEventName, wrapperId}");
  }

  if (!ctUrl) {
    throw new Error("CorporateTube Instance url must be provided.");
  }

  ctUrl = removeHashFromUrl(ctUrl);

  function getCtFramePath() {
    var re = new RegExp("(^.*" + baseUrl + ")(.*$)", "g"),
      parsed = re.exec(window.location.href);

    if (parsed === null) {
      console.error("baseUrl config param isn't correct.");
    }
    if ("2" in parsed) {
      return parsed["2"] === "/" ? "" : parsed["2"];
    } else {
      return "";
    }
  }


  this.getIFrame = function (isoLang) {
    var iFramePath = removeHashFromUrl(getCtFramePath()),
      construct = urlHasGetParams(iFramePath) ? "&" : "?",
      frameUrl = ctUrl + iFramePath + construct +
        "layout=" + layout +
        "&exchangeEventName=" + exchangeEventName +
        "&baseUrl=" + baseUrl +
        "&lang=" + isoLang || "en";

    return "<iframe src=\"" + frameUrl + "\" allow=\"fullscreen\" allowfullscreen />";
  };

  this.render = function (isoLang) {
    document.querySelector("#" + wrapperId).innerHTML = _this.getIFrame(isoLang);
  };

  return this;
}

/**
 *
 * @param {{
 *    baseUrl: string,
 *    layout: string,
 *    exchangeEventName: string,
 *    wrapperId: string,
 * }} configOverwrite
 * @param {string} ctUrl - Companies CorporateTube Instance url
 * @default {baseUrl: "/", layout: "regular", exchangeEventName: "on-ct-frame-exchange", wrapperId: "ct-frame-wrapper",}
 * @return {CtEmbedded}
 * @constructor
 */
function CtEmbedded(configOverwrite, ctUrl) {
  var observers = [];

  function notifyObservers(event) {
    var data = event.data;

    if (data.event === CONFIG.exchangeEventName) {
      observers.map(function (observer) {
        return observer(data.payload);
      });
    }
  }

  if (!ctUrl) {
    throw new Error("CorporateTube Instance url must be provided.");
  }
  var CONFIG = {
    baseUrl: configOverwrite.baseUrl || window.location.protocol + "//" + window.location.host,
    layout: configOverwrite.layout || "iframe",
    exchangeEventName: configOverwrite.exchangeEventName || "on-ct-frame-exchange",
    wrapperId: configOverwrite.wrapperId || "ct-frame-wrapper"
  };
  var ctFrame = new CtFrame(CONFIG, ctUrl);

  if (!("guessLanguage" in window)) {
    throw new Error("Missing dependency: https://richtr.github.io/guessLanguage.js");
  }

  guessLanguage.detect(
    document.body.innerText,
    function (isoLang) {
      ctFrame.render(isoLang);
    }
  );
  window.removeEventListener("message", notifyObservers);
  window.addEventListener("message", notifyObservers);

  /**
   * Register observer method to be notified
   *
   * @param {Function} observer
   */
  this.subscribe = function (observer) {
    observers.push(observer);
  };

  /**
   * Removes all subscribed observers
   */
  this.unsubscribe = function () {
    observers = [];
  };

  return this;
}

try {
  global["isNodeJs"] = true;
  module.exports = {
    CtEmbedded: CtEmbedded,
    CtFrame: CtFrame,
    removeHashFromUrl: removeHashFromUrl,
    urlHasGetParams: urlHasGetParams,
  };
} catch (e) {/* it is browser*/
}
