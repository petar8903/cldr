"use strict";

/**
 * cldrForumParticipation: encapsulate Survey Tool Forum Participation code.
 * This is the non-dojo version. For dojo, see CldrDojoForumParticipation.js
 *
 * Use an IIFE pattern to create a namespace for the public functions,
 * and to hide everything else, minimizing global scope pollution.
 */
const cldrForumParticipation = (function () {
  const tableId = "participationTable";
  const fileName = "participation.csv";
  const onclick =
    "cldrCsvFromTable.download(" +
    '"' +
    tableId +
    '"' +
    ", " +
    '"' +
    fileName +
    '"' +
    ")";

  /**
   * Fetch the Forum Participation data from the server, and "load" it
   *
   * Called as special.load
   */
  function load() {
    cldrInfo.showMessage(cldrText.get("forum_participationGuidance"));

    const url = getForumParticipationUrl();
    const xhrArgs = {
      url: url,
      handleAs: "json",
      load: loadHandler,
      error: errorHandler,
    };
    cldrAjax.sendXhr(xhrArgs);
  }

  function loadHandler(json) {
    if (json.err) {
      cldrRetry.handleDisconnect(
        json.err,
        json,
        "",
        "Loading forum participation data"
      );
      return;
    }
    const html = makeHtmlFromJson(json);
    const ourDiv = document.createElement("div");
    ourDiv.innerHTML = html;
    cldrSurvey.hideLoader();
    cldrLoad.flipToOtherDiv(ourDiv);
  }

  function errorHandler(err) {
    cldrRetry.handleDisconnect(
      err,
      json,
      "",
      "Loading forum participation data"
    );
  }

  /**
   * Get the URL to use for loading the Forum Participation page
   */
  function getForumParticipationUrl() {
    const sessionId = cldrStatus.getSessionId();
    if (!sessionId) {
      console.log("Error: sessionId falsy in getForumParticipationUrl");
      return "";
    }
    return "SurveyAjax?what=forum_participation&s=" + sessionId;
  }

  /**
   * Make the html, given the json for Forum Participation
   *
   * @param json
   * @return the html
   */
  function makeHtmlFromJson(json) {
    let html = "<div>\n";
    if (json.org) {
      html += "<h4>Organization: " + json.org + "</h4>\n";
    }
    if (json.rows && json.rows.header && json.rows.data) {
      const myheaders = [
        "LOC", // headers in order
        "FORUM_TOTAL",
        "FORUM_ORG",
        "FORUM_REQUEST",
        "FORUM_DISCUSS",
        "FORUM_ACT",
      ];
      html += "<h4><a onclick='" + onclick + "'>Download CSV</a></h4>\n";
      html += "<table border='1' id='" + tableId + "'>\n";
      html += "<tr>\n";
      for (let header of [
        // same order as above
        cldrText.get("recentLoc"),
        cldrText.get("forum_participation_TOTAL"),
        cldrText.get("forum_participation_ORG"),
        cldrText.get("forum_participation_REQUEST"),
        cldrText.get("forum_participation_DISCUSS"),
        cldrText.get("forum_participation_ACT"),
      ]) {
        html += "<th>" + header + "</th>\n";
      }
      html += "</tr>\n";
      for (let row of json.rows.data) {
        html += "<tr>\n";
        for (let header of myheaders) {
          html += "<td>" + row[json.rows.header[header]] + "</td>\n";
        }
        html += "</tr>\n";
      }
      html += "</table>\n";
    }
    html += "</div>";
    return html;
  }

  /*
   * Make only these functions accessible from other files
   */
  return {
    load,
    /*
     * The following are meant to be accessible for unit testing only:
     */
    test: {
      makeHtmlFromJson,
    },
  };
})();