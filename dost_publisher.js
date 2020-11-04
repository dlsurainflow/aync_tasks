const moment = require("moment");
const fetch = require("node-fetch");
const mqtt = require("mqtt");
const base64 = require("base-64");
const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const dost_base_uri =
  "http://philsensors.asti.dost.gov.ph/index.php?r=site/get-data&stationid=";

// API Credentials
const AppID = "2a898b";
const AppToken = "61b41991fb93aa542acb0baa5b4b9119";

const arg = [
  {
    id: 821,
    device_id: 36,
    deviceID: "481e1cf51cd1b9d8312b2ee5fdeac9c5a99f",
    username: "481e1cf51cd1b9d8312b2ee5fdeac9c5a99f",
    password: "be5b239a3310b86ab8903e23bf101a5253f7",
    stream_id: "ARG_Data",
  },
  {
    id: 1611,
    device_id: 37,
    deviceID: "f5b21e2bb29311ede21b5a1a1fe8bec1261d",
    username: "f5b21e2bb29311ede21b5a1a1fe8bec1261d",
    password: "be5b239a3310b86ab8903e23bf101a5253f7",
    stream_id: "ARG_Data",
  },
  {
    id: 1846,
    device_id: 38,
    deviceID: "aae4b22e19444b23e2e991b641999949339b",
    username: "aae4b22e19444b23e2e991b641999949339b",
    password: "2ebffeaf91a29b6b113e39b1faa17159542f",
    stream_id: "ARG_Data",
  },
  {
    id: 962,
    device_id: 39,
    deviceID: "9279bc4eb21e91a984751ee5521eb4bfe2fe",
    username: "9279bc4eb21e91a984751ee5521eb4bfe2fe",
    password: "2ebffeaf91a29b6b113e39b1faa17159542f",
    stream_id: "ARG_Data",
  },
];

const wlms = [
  {
    id: 322,
    deviceID: "19982a1c115c15fc9b2caae192524a9c1639",
    username: "19982a1c115c15fc9b2caae192524a9c1639",
    password: "be5b239a3310b86ab8903e23bf101a5253f7",
    device_id: 40,
    stream_id: "WLMS_Data",
  },
  {
    id: 209,
    deviceID: "412b0e11492411598c69b9ea2b02ac1df162",
    username: "412b0e11492411598c69b9ea2b02ac1df162",
    password: "2ebffeaf91a29b6b113e39b1faa17159542f",
    device_id: 41,
    stream_id: "WLMS_Data",
  },
  {
    id: 2413,
    deviceID: "accb93c84acce8c8b5515d6985b4dffc8a02",
    username: "accb93c84acce8c8b5515d6985b4dffc8a02",
    password: "8fb21280d91f0daeffb8b958496a09a94595",
    device_id: 42,
    stream_id: "WLMS_Data",
  },
  {
    id: 2013,
    deviceID: "6842813e9b286cd4bbd98b924d95202d2269",
    username: "6842813e9b286cd4bbd98b924d95202d2269",
    password: "8fb21280d91f0daeffb8b958496a09a94595",
    device_id: 43,
    stream_id: "WLMS_Data",
  },
  {
    id: 2015,
    deviceID: "29e698811d3819fb91954a751fab59117174",
    username: "29e698811d3819fb91954a751fab59117174",
    password: "8fb21280d91f0daeffb8b958496a09a94595",
    device_id: 44,
    stream_id: "WLMS_Data",
  },
  {
    id: 975,
    deviceID: "9bcc90e4006035d3ba911fd921489e19929b",
    username: "9bcc90e4006035d3ba911fd921489e19929b",
    password: "2ebffeaf91a29b6b113e39b1faa17159542f",
    device_id: 45,
    stream_id: "WLMS_Data",
  },
  {
    id: 1184,
    deviceID: "3e114133c42628bb3e6f8c6e7bf9bd9f626a",
    username: "3e114133c42628bb3e6f8c6e7bf9bd9f626a",
    password: "be5b239a3310b86ab8903e23bf101a5253f7",
    device_id: 47,
    stream_id: "WLMS_Data",
  },
  {
    id: 2177,
    deviceID: "d1fdb94687bb4e41cbbe45b3115b2b64ba11",
    username: "d1fdb94687bb4e41cbbe45b3115b2b64ba11",
    password: "8fb21280d91f0daeffb8b958496a09a94595",
    device_id: 48,
    stream_id: "WLMS_Data",
  },
  {
    id: 2115,
    deviceID: "0a1ce112532ce3eb02531ddbb9bebfba1189",
    username: "0a1ce112532ce3eb02531ddbb9bebfba1189",
    password: "be5b239a3310b86ab8903e23bf101a5253f7",
    device_id: 49,
    stream_id: "WLMS_Data",
  },
  {
    id: 1151,
    deviceID: "952256106e2c5e2565f1d66518555944f5a5",
    username: "952256106e2c5e2565f1d66518555944f5a5",
    password: "2ebffeaf91a29b6b113e39b1faa17159542f",
    device_id: 50,
    stream_id: "WLMS_Data",
  },
];

const wlms_arg = [
  {
    id: 1528,
    deviceID: "4bc5321b9d214251d9d4db25b9cc23bc94db",
    username: "4bc5321b9d214251d9d4db25b9cc23bc94db",
    password: "be5b239a3310b86ab8903e23bf101a5253f7",
    device_id: 51,
    stream_id: "WLMSARG_Data",
  },
  {
    id: 2169,
    deviceID: "b89b8fb118cb13eab1f34da64a7cc1bbb422",
    username: "b89b8fb118cb13eab1f34da64a7cc1bbb422",
    password: "2ebffeaf91a29b6b113e39b1faa17159542f",
    device_id: 52,
    stream_id: "WLMSARG_Data",
  },
];

var data = {};

setInterval(retrieveWLMS_ARG, 600000);
setInterval(retrieveARG, 600000);
setInterval(retrieveWLMS, 600000);
retrieveWLMS_ARG();
retrieveARG();
retrieveWLMS();

async function retrieveARG() {
  for (var i = 0; i < arg.length; i++) {
    data = {};
    //   var res = axios.get(dost_base_uri + arg[i].id);
    var response = await fetch(dost_base_uri + arg[i].id, {
      method: "get",
    });
    var res = await response.json();
    var timestamp = new moment(
      res.Data[res.Data.length - 1]["Datetime Read"],
      "YYYY-MM-DD HH:mm:ss"
    );
    var previous = new moment(
      res.Data[res.Data.length - 2]["Datetime Read"],
      "YYYY-MM-DD HH:mm:ss"
    );

    var duration = moment.duration(timestamp.diff(previous));
    var minutes = parseInt(duration.asMinutes()) % 60;

    if (res.Data[res.Data.length - 1]["Air Pressure"] !== undefined) {
      //   console.log(
      //     "RR1: ",
      //     (parseFloat(res.Data[res.Data.length - 1]["Rainfall Amount"]) * 60) /
      //       minutes
      //   );
      //   console.log(parseFloat(res.Data[res.Data.length - 1]["Rainfall Amount"]));
      //   console.log(minutes);
      data = {
        LAT1: {
          time: timestamp.unix(),
          value: parseFloat(res["0"].latitude),
        },
        LNG1: {
          time: timestamp.unix(),
          value: parseFloat(res["0"].longitude),
        },
        FD1: {
          time: timestamp.unix(),
          value: 0,
        },
        RA1: {
          time: timestamp.unix(),
          value: parseFloat(res.Data[res.Data.length - 1]["Rain Cumulative"]),
        },
        RR1: {
          time: timestamp.unix(),
          value:
            (parseFloat(res.Data[res.Data.length - 1]["Rainfall Amount"]) *
              60) /
            minutes,
        },
        PR1: {
          time: timestamp.unix(),
          value: parseFloat(res.Data[res.Data.length - 1]["Air Pressure"]),
        },
      };

      var _response = await fetch(
        `https://dashboard.rainflow.live/api/v1/devices/${arg[i].device_id}/last_data_charts`,
        {
          method: "GET",
          headers: {
            Authorization: "Basic " + base64.encode(AppID + ":" + AppToken),
          },
        }
      );
      var _res = await _response.json();
      if (_res[1].chartData !== null) {
        // console.log(_res[0].chartData.time);

        var currentEventTime = new moment(
          _res[1].chartData.time,
          "YYYY-MM-DD HH:mm:ss"
        );

        if (timestamp.isAfter(currentEventTime))
          await dataPublisher(
            arg[i].deviceID,
            arg[i].username,
            arg[i].password,
            arg[i].stream_id,
            data
          );
      } else {
        await dataPublisher(
          arg[i].deviceID,
          arg[i].username,
          arg[i].password,
          arg[i].stream_id,
          data
        );
      }
    } else {
      data = {
        LAT1: {
          time: timestamp.unix(),
          value: parseFloat(res["0"].latitude),
        },
        LNG1: {
          time: timestamp.unix(),
          value: parseFloat(res["0"].longitude),
        },
        FD1: {
          time: timestamp.unix(),
          value: 0,
        },
        RA1: {
          time: timestamp.unix(),
          value: parseFloat(res.Data[res.Data.length - 1]["Rain Cumulative"]),
        },
        RR1: {
          time: timestamp.unix(),
          value:
            (parseFloat(res.Data[res.Data.length - 1]["Rainfall Amount"]) *
              60) /
            minutes,
        },
      };

      var _response = await fetch(
        `https://dashboard.rainflow.live/api/v1/devices/${arg[i].device_id}/last_data_charts`,
        {
          method: "GET",
          headers: {
            Authorization: "Basic " + base64.encode(AppID + ":" + AppToken),
          },
        }
      );
      var _res = await _response.json();
      //   console.log(_res[1]);
      if (_res[1].chartData !== null) {
        // console.log(_res[0].chartData.time);

        var currentEventTime = new moment(
          _res[1].chartData.time,
          "YYYY-MM-DD HH:mm:ss"
        );

        // console.log(currentEventTime);
        // console.log(timestamp);
        if (timestamp.isAfter(currentEventTime))
          await dataPublisher(
            arg[i].deviceID,
            arg[i].username,
            arg[i].password,
            arg[i].stream_id,
            data
          );
      } else {
        await dataPublisher(
          arg[i].deviceID,
          arg[i].username,
          arg[i].password,
          arg[i].stream_id,
          data
        );
      }
    }
    await delay(2500);
  }
}

async function retrieveWLMS() {
  for (var i = 0; i < wlms.length; i++) {
    console.log(wlms[i].id);
    data = {};
    //   var res = axios.get(dost_base_uri + wlms[i].id);
    var response = await fetch(dost_base_uri + wlms[i].id, {
      method: "get",
    });
    var res = await response.json();
    var timestamp = new moment(
      res.Data[res.Data.length - 1]["Datetime Read"],
      "YYYY-MM-DD HH:mm:ss"
    );
    var previous = new moment(
      res.Data[res.Data.length - 2]["Datetime Read"],
      "YYYY-MM-DD HH:mm:ss"
    );

    var duration = moment.duration(timestamp.diff(previous));
    var minutes = parseInt(duration.asMinutes()) % 60;

    if (res.Data[res.Data.length - 1]["Air Pressure"] !== undefined) {
      data = {
        LAT1: {
          time: timestamp.unix(),
          value: parseFloat(res["0"].latitude),
        },
        LNG1: {
          time: timestamp.unix(),
          value: parseFloat(res["0"].longitude),
        },
        WL1: {
          time: timestamp.unix(),
          value: parseFloat(res.Data[res.Data.length - 1]["Waterlevel"]),
        },
        RA1: {
          time: timestamp.unix(),
          value: 0,
        },
        RR1: {
          time: timestamp.unix(),
          value: 0,
        },
        PR1: {
          time: timestamp.unix(),
          value: parseFloat(res.Data[res.Data.length - 1]["Air Pressure"]),
        },
      };

      var _response = await fetch(
        `https://dashboard.rainflow.live/api/v1/devices/${wlms[i].device_id}/last_data_charts`,
        {
          method: "GET",
          headers: {
            Authorization: "Basic " + base64.encode(AppID + ":" + AppToken),
          },
        }
      );
      var _res = await _response.json();
      if ((_res[1].chartData !== undefined && _res[1].chartData) !== null) {
        // console.log(_res[0].chartData.time);

        var currentEventTime = new moment(
          _res[1].chartData.time,
          "YYYY-MM-DD HH:mm:ss"
        );

        if (timestamp.isAfter(currentEventTime))
          await dataPublisher(
            wlms[i].deviceID,
            wlms[i].username,
            wlms[i].password,
            wlms[i].stream_id,
            data
          );
      } else {
        await dataPublisher(
          wlms[i].deviceID,
          wlms[i].username,
          wlms[i].password,
          wlms[i].stream_id,
          data
        );
      }
    } else {
      data = {
        LAT1: {
          time: timestamp.unix(),
          value: parseFloat(res["0"].latitude),
        },
        LNG1: {
          time: timestamp.unix(),
          value: parseFloat(res["0"].longitude),
        },
        RA1: {
          time: timestamp.unix(),
          value: 0,
        },
        RR1: {
          time: timestamp.unix(),
          value: 0,
        },
        WL1: {
          time: timestamp.unix(),
          value: parseFloat(res.Data[res.Data.length - 1]["Waterlevel"]),
        },
      };

      var _response = await fetch(
        `https://dashboard.rainflow.live/api/v1/devices/${wlms[i].device_id}/last_data_charts`,
        {
          method: "GET",
          headers: {
            Authorization: "Basic " + base64.encode(AppID + ":" + AppToken),
          },
        }
      );
      var _res = await _response.json();
      //   console.log(_res);
      //   console.log(_res[1]);
      if ((_res[1].chartData !== undefined && _res[1].chartData) !== null) {
        // console.log(_res[0].chartData.time);

        var currentEventTime = new moment(
          _res[1].chartData.time,
          "YYYY-MM-DD HH:mm:ss"
        );

        // console.log(currentEventTime);
        // console.log(timestamp);
        if (timestamp.isAfter(currentEventTime))
          await dataPublisher(
            wlms[i].deviceID,
            wlms[i].username,
            wlms[i].password,
            wlms[i].stream_id,
            data
          );
      } else {
        await dataPublisher(
          wlms[i].deviceID,
          wlms[i].username,
          wlms[i].password,
          wlms[i].stream_id,
          data
        );
      }
    }
    await delay(2500);
  }
}

async function retrieveWLMS_ARG() {
  for (var i = 0; i < wlms_arg.length; i++) {
    // console.log(wlms_arg[i]);
    data = {};
    //   var res = axios.get(dost_base_uri + wlms_arg[i].id);
    var response = await fetch(dost_base_uri + wlms_arg[i].id, {
      method: "get",
    });
    var res = await response.json();
    var timestamp = new moment(
      res.Data[res.Data.length - 1]["Datetime Read"],
      "YYYY-MM-DD HH:mm:ss"
    );
    var previous = new moment(
      res.Data[res.Data.length - 2]["Datetime Read"],
      "YYYY-MM-DD HH:mm:ss"
    );

    var duration = moment.duration(timestamp.diff(previous));
    var minutes = parseInt(duration.asMinutes()) % 60;
    // console.log(res.Data[res.Data.length - 1]);
    if (res.Data[res.Data.length - 1]["Air Pressure"] !== undefined) {
      data = {
        LAT1: {
          time: timestamp.unix(),
          value: parseFloat(res["0"].latitude),
        },
        LNG1: {
          time: timestamp.unix(),
          value: parseFloat(res["0"].longitude),
        },
        FD1: {
          time: timestamp.unix(),
          value: 0,
        },
        RA1: {
          time: timestamp.unix(),
          value: parseFloat(res.Data[res.Data.length - 1]["Rain Cumulative"]),
        },
        RR1: {
          time: timestamp.unix(),
          value:
            (parseFloat(res.Data[res.Data.length - 1]["Rainfall Amount"]) *
              60) /
            minutes,
        },
        WL1: {
          time: timestamp.unix(),
          value: parseFloat(res.Data[res.Data.length - 1].Waterlevel),
        },
        PR1: {
          time: timestamp.unix(),
          value: parseFloat(res.Data[res.Data.length - 1]["Air Pressure"]),
        },
      };

      var _response = await fetch(
        `https://dashboard.rainflow.live/api/v1/devices/${wlms_arg[i].device_id}/last_data_charts`,
        {
          method: "GET",
          headers: {
            Authorization: "Basic " + base64.encode(AppID + ":" + AppToken),
          },
        }
      );
      var _res = await _response.json();
      if (_res[1].chartData !== null) {
        // console.log(_res[0].chartData.time);

        var currentEventTime = new moment(
          _res[1].chartData.time,
          "YYYY-MM-DD HH:mm:ss"
        );

        if (timestamp.isAfter(currentEventTime))
          await dataPublisher(
            wlms_arg[i].deviceID,
            wlms_arg[i].username,
            wlms_arg[i].password,
            wlms_arg[i].stream_id,
            data
          );
      } else {
        await dataPublisher(
          wlms_arg[i].deviceID,
          wlms_arg[i].username,
          wlms_arg[i].password,
          wlms_arg[i].stream_id,
          data
        );
      }
    } else {
      data = {
        LAT1: {
          time: timestamp.unix(),
          value: parseFloat(res["0"].latitude),
        },
        LNG1: {
          time: timestamp.unix(),
          value: parseFloat(res["0"].longitude),
        },
        FD1: {
          time: timestamp.unix(),
          value: 0,
        },
        RA1: {
          time: timestamp.unix(),
          value: parseFloat(res.Data[res.Data.length - 1]["Rain Cumulative"]),
        },
        RR1: {
          time: timestamp.unix(),
          value:
            (parseFloat(res.Data[res.Data.length - 1]["Rainfall Amount"]) *
              60) /
            minutes,
        },
        WL1: {
          time: timestamp.unix(),
          value: parseFloat(res.Data[res.Data.length - 1]["Waterlevel"]),
        },
      };

      var _response = await fetch(
        `https://dashboard.rainflow.live/api/v1/devices/${wlms_arg[i].device_id}/last_data_charts`,
        {
          method: "GET",
          headers: {
            Authorization: "Basic " + base64.encode(AppID + ":" + AppToken),
          },
        }
      );
      var _res = await _response.json();
      //   console.log(_res[1]);
      if (_res[1].chartData !== null) {
        // console.log(_res[0].chartData.time);

        var currentEventTime = new moment(
          _res[1].chartData.time,
          "YYYY-MM-DD HH:mm:ss"
        );

        // console.log(currentEventTime);
        // console.log(timestamp);
        if (timestamp.isAfter(currentEventTime))
          await dataPublisher(
            wlms_arg[i].deviceID,
            wlms_arg[i].username,
            wlms_arg[i].password,
            wlms_arg[i].stream_id,
            data
          );
      } else {
        await dataPublisher(
          wlms_arg[i].deviceID,
          wlms_arg[i].username,
          wlms_arg[i].password,
          wlms_arg[i].stream_id,
          data
        );
      }
    }
    await delay(2500);
  }
}

async function dataPublisher(deviceID, username, password, stream_id, data) {
  var options = {
    clientId: deviceID,
    username: username,
    password: password,
  };

  var payload = {
    data_type: "event",
    stream_id: stream_id,
    data: data,
  };
  console.log("[UPDATED] ", deviceID);
  console.log(payload);

  var client = mqtt.connect("mqtt://rainflow.live", options);
  client.on("connect", async function () {
    console.log("Connected!");
    client.publish(stream_id, JSON.stringify(payload));
    client.end();
    await delay(2500);
  });
}
