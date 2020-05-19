"use strict";
const aws = require("aws-sdk");
const cwl = new aws.CloudWatchLogs({ apiVersion: "2014-03-28", region: "us-east-1" });
const ses = new aws.SES({ region: "us-east-1" });

let generateEmailContent = (data, message) => {
  let events = data.events;
  console.log("Events are:", events);
  let logData = "<br/><h2><u>Application Logs</u></h2>";
  for (let i in events) {
    let parsedEvent = JSON.parse(events[i]['message'].split('INFO')[1].trim());
    logData += `<p style='color: red; font-size: 16px;'><b>Status:</b>${parsedEvent.type}</p>`;
    logData += `<p style='font-size: 14px;'><b>Log Stream:</b>${JSON.stringify(events[i]['logStreamName'])}</p>`;
    logData += `<p style='font-size: 14px;'><b>App Name:</b>${parsedEvent.app_name}</p>`;
    logData += `<p style='font-size: 14px;'><b>Service:</b>${parsedEvent.service_name}</p>`;
    logData += `<p style='font-size: 14px;'><b>Stage:</b>${parsedEvent.app_stage}</p>`;
    logData += `<p style='font-size: 14px;'><b>Message:</b>${parsedEvent.message}</p>`;
    logData += `<p style='font-size: 14px;'><b>Callstack:</b>${parsedEvent.callstack || 'N/A'}</p>`;
    logData +=
      `<p style='font-size: 14px;'><b>Payload:</b> <code>${JSON.stringify(parsedEvent.payload)}</code></p><br/>`;
  }

  let date = new Date(message.StateChangeTime);
  let text = `Alarm Name:<b>${
    message.AlarmName
  }</b><br/>Details: <a href="https://my.example.com">Production URL</a><br/>Account ID:${
    message.AWSAccountId
  }<br/>Region:${message.Region}<br/>Alarm Time:${date.toString()}<br/>${logData}`;
  let subject = `Details for Alarm - ${message.AlarmName} [URGENT]`;

  let emailContent = {
    Destination: {
      ToAddresses: ["manojf.uom@gmail.com"]
    },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: text
        },
        Text: {
          Charset: "UTF-8",
          Data: text
        }
      },
      Subject: {
        Charset: "UTF-8",
        Data: subject
      }
    },
    Source: "manojf.uom@gmail.com",
    SourceArn: "arn:aws:ses:us-east-1:885121665536:identity/manojf.uom@gmail.com",
    Tags: [
      {
        Name: "sender",
        Value: "Manoj"
      }
    ]
  };

  return emailContent;
};

let getLogsAndSendEmail = (message, metricFilterData) => {
  const timestamp = Date.parse(message.StateChangeTime);
  const offset = message.Trigger.Period * message.Trigger.EvaluationPeriods * 1000;
  const metricFilter = metricFilterData.metricFilters[0];
  const parameters = {
    logGroupName: metricFilter.logGroupName,
    filterPattern: metricFilter.filterPattern ? metricFilter.filterPattern : "",
    startTime: timestamp - offset,
    endTime: timestamp
  };

  cwl.filterLogEvents(parameters, (err, data) => {
    if (err) {
      console.log("Filtering failure:", err);
    } else {
      ses.sendEmail(generateEmailContent(data, message), (err, data) => {
        if (err) console.log(err);
        else console.log(data);
      });
    }
  });
};

module.exports.dispatchErrors = (event, context, cb) => {
  context.callbackWaitsForEmptyEventLoop = false;
  const message = JSON.parse(event.Records[0].Sns.Message);
  const requestParams = {
    metricName: message.Trigger.MetricName,
    metricNamespace: message.Trigger.Namespace
  };
  cwl.describeMetricFilters(requestParams, (err, data) => {
    if (err) {
      console.log("Error occured:", err);
    } else {
      getLogsAndSendEmail(message, data);
    }
  });
};
