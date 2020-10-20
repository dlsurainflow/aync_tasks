const { User, RAFT, Report, ReportHistory, Vote } = require("./models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { Pool, Client } = require("pg");
const moment = require("moment");
const report = require("./models/report");

const client = new Client({
  user: "tammy",
  host: "RainFLOW.live",
  database: "actorcloud",
  password: "Inmediasres8!",
  port: 5432,
});

client
  .connect()
  .then(() => console.log("Successfully connected to ActorCloud."))
  .catch((err) => console.error("Connection error", err.stack));

client.query("LISTEN new_testevent"); // New Device Event
client.query("LISTEN device_deleted_id"); // Device deleted/Shown On Map
client.query("LISTEN device_updated"); // Device Updated
client.query("LISTEN user_update"); // User Updated/Created

client.on("notification", async (data) => {
  // console.log("Channel: " + data.channel);
  const payload = JSON.parse(data.payload);
  // console.log(payload);
  if (data.channel === "user_update") updateUser(payload);
  else if (data.channel === "new_testevent") deviceEvent(payload);
  else if (data.channel === "device_deleted_id") deleteDevice(payload);
  else if (data.channel === "device_updated") updateDevice(payload);
});

async function updateUser(payload) {
  //   console.log(payload);
  var user = await User.findOne({ where: { email: payload.email } });
  if (user === null) {
    User.create({
      username: payload.username,
      email: payload.email,
      password: payload.password,
      roleIntID: payload.roleIntID,
      tenantID: payload.tenantID,
    })
      .then((res) =>
        console.log("[ASYNC_TASK] User " + payload.username + " created!")
      )
      .catch((err) => console.error(err));
  } else {
    User.update(
      {
        username: payload.username,
        password: payload.password,
        roleIntID: payload.roleIntID,
        tenantID: payload.tenantID,
      },
      {
        where: {
          email: payload.email,
        },
      }
    )
      .then((res) =>
        console.log("[ASYNC_TASK] User " + payload.username + " updated!")
      )
      .catch((err) => console.error(err));
  }
}

async function deviceEvent(payload) {
  var raft = await RAFT.findOne({ where: { deviceID: payload.deviceID } });
  var user = await User.findOne({ where: { tenantID: payload.tenantID } });

  var sql = `SELECT * FROM devices where "deviceID" = '${payload.deviceID}' AND "showOnMap" = 1`;

  await client.query(sql, (err, res) => {
    if (err) throw err;

    //console.log("showOnMap =", res.rows[0].showOnMap);
    // console.log(res.rows[0]);
    var isShowOnMap = res.rows[0];

    if (isShowOnMap !== undefined) {
      //   console.log("not undefined");
      if (
        payload.data.LAT1 !== undefined &&
        payload.data.LNG1 !== undefined &&
        payload.data.FD1 !== undefined &&
        payload.data.RA1 !== undefined &&
        payload.data.RR1 !== undefined
      ) {
        if (raft === null) {
          var temperature, pressure, humidity, altitude;
          if (payload.data.TMP1 !== undefined)
            temperature = payload.data.TMP1.value;
          else temperature = null;
          if (payload.data.PR1 !== undefined) pressure = payload.data.PR1.value;
          else pressure = null;
          if (payload.data.HU1 !== undefined) humidity = payload.data.HU1.value;
          else humidity = null;
          if (payload.data.ALT1 !== undefined)
            altitude = payload.data.ALT1.value;
          else altitude = null;

          let point = {
            type: "Point",
            coordinates: [ayload.data.LNG1.value, payload.data.LAT1.value],
            crs: { type: "name", properties: { name: "EPSG:4326" } },
          };

          RAFT.create({
            latitude: payload.data.LAT1.value,
            longitude: payload.data.LNG1.value,
            flood_depth: payload.data.FD1.value,
            rainfall_amount: payload.data.RA1.value,
            rainfall_rate: payload.data.RR1.value,
            altitude: altitude,
            temperature: temperature,
            pressure: pressure,
            humidity: humidity,
            deviceID: payload.deviceID,
            tenantID: payload.tenantID,
            username: user.username,
            position: point,
          })
            .then((res) =>
              console.log(
                "[ASYNC_TASK] Device " + payload.deviceID + " created!"
              )
            )
            .catch((err) => console.error(err));
        } else {
          var temperature, pressure, humidity, altitude;
          if (payload.data.TMP1 !== undefined)
            temperature = payload.data.TMP1.value;
          else temperature = null;
          if (payload.data.PR1 !== undefined) pressure = payload.data.PR1.value;
          else pressure = null;
          if (payload.data.HU1 !== undefined) humidity = payload.data.HU1.value;
          else humidity = null;
          if (payload.data.ALT1 !== undefined)
            altitude = payload.data.ALT1.value;
          else altitude = null;

          let point = {
            type: "Point",
            coordinates: [payload.data.LNG1.value, payload.data.LAT1.value],
            crs: { type: "name", properties: { name: "EPSG:4326" } },
          };

          RAFT.update(
            {
              latitude: payload.data.LAT1.value,
              longitude: payload.data.LNG1.value,
              altitude: altitude,
              flood_depth: payload.data.FD1.value,
              rainfall_amount: payload.data.RA1.value,
              rainfall_rate: payload.data.RR1.value,
              temperature: temperature,
              pressure: pressure,
              humidity: humidity,
              position: point,
            },
            {
              where: { id: raft.id },
            }
          )
            .then((res) =>
              console.log(
                "[ASYNC_TASK] Device " + payload.deviceID + " updated!"
              )
            )
            .catch((err) => console.error(err));
        }
      }
    } else {
      console.log("is Undefined");
    }
  });
}

async function deleteDevice(payload) {
  var raft = await RAFT.findOne({ where: { deviceID: payload.deviceID } });
  if (raft !== null) {
    RAFT.destroy({ where: { deviceID: payload.deviceID } })
      .then((res) => console.log("Removed device " + payload.deviceID))
      .catch((err) => console.err(err));
  }
}

async function updateDevice(payload) {
  var raft = await RAFT.findOne({ where: { deviceID: payload.deviceID } });
  if (payload.showOnMap === 0) {
    if (raft !== null) {
      RAFT.destroy({ where: { deviceID: payload.deviceID } });
      console.log("[ASYNC_TASK] Device " + payload.deviceID + " deleted.");
    }
  } else {
    var sql = `SELECT * FROM device_events WHERE "deviceID" = '${payload.deviceID}' ORDER BY "msgTime" DESC`;

    client.query(sql, async (err, res) => {
      if (err) console.err(err);
      if (res !== undefined) {
        if (
          res.rows[0].data.LAT1 !== undefined &&
          res.rows[0].data.LNG1 !== undefined &&
          res.rows[0].data.FD1 !== undefined &&
          res.rows[0].data.RA1 !== undefined &&
          res.rows[0].data.RR1 !== undefined
        ) {
          var temperature, pressure, humidity, altitude;
          if (res.rows[0].data.TMP1 !== undefined)
            temperature = res.rows[0].data.TMP1.value;
          else temperature = null;
          if (res.rows[0].data.PR1 !== undefined)
            pressure = res.rows[0].data.PR1.value;
          else pressure = null;
          if (res.rows[0].data.HU1 !== undefined)
            humidity = res.rows[0].data.HU1.value;
          else humidity = null;
          if (res.rows[0].data.ALT1 !== undefined)
            altitude = res.rows[0].data.ALT1.value;
          else altitude = null;

          let point = {
            type: "Point",
            coordinates: [
              res.rows[0].data.LNG1.value,
              res.rows[0].data.LAT1.value,
            ],
            crs: { type: "name", properties: { name: "EPSG:4326" } },
          };

          var raft = await RAFT.findOne({
            where: { deviceID: payload.deviceID },
          });

          if (raft !== null) {
            RAFT.update(
              {
                latitude: res.rows[0].data.LAT1.value,
                longitude: res.rows[0].data.LNG1.value,
                altitude: altitude,
                flood_depth: res.rows[0].data.FD1.value,
                rainfall_amount: res.rows[0].data.RA1.value,
                rainfall_rate: res.rows[0].data.RR1.value,
                temperature: temperature,
                pressure: pressure,
                humidity: humidity,
                position: point,
              },
              {
                where: { id: raft.id },
              }
            )
              .then((res) =>
                console.log(
                  "[ASYNC_TASK] Device " + payload.deviceID + " updated!"
                )
              )
              .catch((err) => console.error(err));
          } else {
            let user = await User.findOne({
              where: { tenantID: res.rows[0].tenantID },
            });
            RAFT.create({
              latitude: res.rows[0].data.LAT1.value,
              longitude: res.rows[0].data.LNG1.value,
              altitude: altitude,
              flood_depth: res.rows[0].data.FD1.value,
              rainfall_amount: res.rows[0].data.RA1.value,
              rainfall_rate: res.rows[0].data.RR1.value,
              temperature: temperature,
              pressure: pressure,
              humidity: humidity,
              position: point,
              deviceID: res.rows[0].deviceID,
              tenantID: res.rows[0].tenantID,
              username: user.username,
            })
              .then((res) =>
                console.log(
                  "[ASYNC_TASK] Device " + payload.deviceID + " created!"
                )
              )
              .catch((err) => console.error(err));
          }
        }
      }
    });
  }
}
