const app_name = process.env.APP_NAME;
const app_stage = process.env.APP_STAGE;
const service_name = process.env.SERVICE_NAME;

const log = (payload) => {
    payload = {app_name, app_stage, service_name, ...payload}
    console.log(JSON.stringify(payload));
}

module.exports = log;