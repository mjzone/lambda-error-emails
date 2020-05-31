"use strict";
let log = require("./lib/logger");

const response = (statusCode, message) => {
  return {
    statusCode,
    body: JSON.stringify(message)
  };
};

module.exports.createNotes = async event => {
  let data = JSON.parse(event.body);
  try {
    // create note database call
    log({
      type: "INFO",
      payload: data
    });
    return response(201, data);
    
  } catch (e) {
    log({
      type: "CRITICAL",
      message: e.message,
      callstack: e.stack,
      payload: data
    });
    return response(500, e);
  }
};

module.exports.getNotesById = async event => {
  const noteId = event.pathParameters.id;

  // get notes database call
  const queryTime = 500;
  if (queryTime > 100) {
    log({
      type: "WARNING",
      message: `Query time ${queryTime} is longer than accepted 100ms`,
      payload: `Note Id: ${noteId}`
    });
  }
  return response(200, ["note1", "note2", "note3"]);
};
