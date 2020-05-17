const app_name = process.env.APP_NAME;
const app_stage = process.env.APP_STAGE;
const service_name = process.env.SERVICE_NAME;

const log = (payload) => {
    payload = {app_name, app_stage, service_name, ...payload}
    console.log(JSON.stringify(payload));
}

module.exports = log;

/*
{
    "app_name": "My Notes App",
    "app_stage": "dev",
    "service_name": "Notes Service",
    "type": "CRITICAL",
    "message": "Too many connections to database",
    "callstack": "Error: Too many connections to database\n    at Runtime.module.exports.createNotes [as handler] (/var/task/handler.js:15:11)\n    at Runtime.handleOnce (/var/runtime/Runtime.js:66:25)",
    "payload": {
        "id": 3,
        "title": "Evening Rituals"
    }
}
*/