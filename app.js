const { User, RAFT, Report, ReportHistory, Vote } = require("./models");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const { Client, Pool } = require("pg");
// const moment = require("moment");
// const report = require("./models/report");
const NodeGeocoder = require("node-geocoder");

const options = {
  provider: "openstreetmap",
};

const geocoder = NodeGeocoder(options);

const client = new Client({
  user: "tammy",
  host: "RainFLOW.live",
  database: "actorcloud",
  password: "Inmediasres8!",
  port: 5432,
});

const pool = new Pool({
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
  console.log(payload);
  var raft = await RAFT.findOne({ where: { deviceID: payload.deviceID } });
  var user = await User.findOne({ where: { tenantID: payload.tenantID } });

  var sql = `SELECT * FROM devices where "deviceID" = '${payload.deviceID}' AND "showOnMap" = 1`;

  await pool.query(sql, async (err, res) => {
    if (err) throw err;

    //console.log("showOnMap =", res.rows[0].showOnMap);
    // console.log(res.rows[0]);
    var isShowOnMap = res.rows[0];
    // console.log(isShowOnMap);
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
          var temperature, pressure, humidity, altitude, water_level;
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
          if (payload.data.WL1 !== undefined)
            water_level = payload.data.WL1.value;
          else water_level = null;

          let point = {
            type: "Point",
            coordinates: [payload.data.LNG1.value, payload.data.LAT1.value],
            crs: { type: "name", properties: { name: "EPSG:4326" } },
          };

          try {
            const address = await geocoder.reverse({
              lat: payload.data.LAT1.value,
              lon: payload.data.LNG1.value,
            });
            // console.log("Address: ", address[0]
            var _address = address[0].formattedAddress;
          } catch (err) {
            var _address = null;
          }

          console.log("Address: ", address[0].formattedAddress);

          // Filtering Algorithm
          var sql_FD1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${payload.deviceID}' and data.key = 'FD1' and "msgTime" > current_date - interval '6' hour;`;
          var FD1_Past = await pool.query(sql_FD1);
          var window_size = 1;
          var sma_vec = ComputeSMA(FD1_Past.rows, window_size);
          let sma = sma_vec.map(function (val) {
            return val["avg"];
          });

          var certainty;

          if (sma[sma.length - 2] < 1 && payload.data.FD1.value <= 5) {
            certainty = 1;
          } else if (sma[sma.length - 2] < 1 && payload.data.FD1.value > 5) {
            certainty = 0;
          } else {
            var difference =
              ((payload.data.FD1.value - sma[sma.length - 2]) /
                sma[sma.length - 2]) *
              100;
            console.log(difference);
            if (difference > 100) certainty = 0;
            else certainty = 1;
          }

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
            address: _address,
            water_level: water_level,
            createdAt: res.rows[0].createAt,
            certainty: certainty,
          })
            .then((res) =>
              console.log(
                "[ASYNC_TASK] Device " + payload.deviceID + " created!"
              )
            )
            .catch((err) => console.error(err));
        } else {
          var temperature, pressure, humidity, altitude, water_level;
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
          if (payload.data.WL1 !== undefined)
            water_level = payload.data.WL1.value;
          else water_level = null;

          let point = {
            type: "Point",
            coordinates: [payload.data.LNG1.value, payload.data.LAT1.value],
            crs: { type: "name", properties: { name: "EPSG:4326" } },
          };

          // Filtering Algorithm
          var sql_FD1 = `select data.value->'time' as time, data.value->'value' as value from "device_events", jsonb_each(device_events.data) AS data  where "deviceID" = '${payload.deviceID}' and data.key = 'FD1' and "msgTime" > current_date - interval '6' hour;`;
          var FD1_Past = await pool.query(sql_FD1);
          var window_size = 1;
          var sma_vec = ComputeSMA(FD1_Past.rows, window_size);
          let sma = sma_vec.map(function (val) {
            return val["avg"];
          });
          var certainty;

          if (sma[sma.length - 2] < 1 && payload.data.FD1.value <= 5) {
            certainty = 1;
          } else if (sma[sma.length - 2] < 1 && payload.data.FD1.value > 5) {
            certainty = 0;
          } else {
            var difference =
              ((payload.data.FD1.value - sma[sma.length - 2]) /
                sma[sma.length - 2]) *
              100;
            console.log(difference);
            if (difference > 100) certainty = 0;
            else certainty = 1;
          }

          // console.log(certainty);

          // const address = await geocoder.reverse({
          //   lat: payload.data.LAT1.value,
          //   lon: payload.data.LNG1.value,
          // });

          // console.log("Address: ", address);
          // console.log("Address: ", address[0].formattedAddress);

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
              water_level: water_level,
              createdAt: res.rows[0].createAt,
              certainty: certainty,
              // address: address[0].formattedAddress,
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
          var temperature, pressure, humidity, altitude, water_level;
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
          if (res.rows[0].data.WL1 !== undefined)
            water_level = res.rows[0].data.WL1.value;
          else water_level = null;

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

          // const address = await geocoder.reverse({
          //   lat: res.rows[0].data.LAT1.value,
          //   lon: res.rows[0].data.LNG1.value,
          // });
          // console.log("Address: ", address);
          // console.log("Address: ", address[0].formattedAddress);

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
                water_level: water_level,
                // address: address[0].formattedAddress,
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
            try {
              const address = await geocoder.reverse({
                lat: res.rows[0].data.LAT1.value,
                lon: res.rows[0].data.LNG1.value,
              });
              _address = address[0].formattedAddress;
            } catch (err) {
              _address = null;
            }
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
              water_level: water_level,
              deviceID: res.rows[0].deviceID,
              tenantID: res.rows[0].tenantID,
              username: user.username,
              address: _address,
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

function ComputeSMA(data, window_size) {
  let r_avgs = [],
    avg_prev = 0;
  for (let i = 0; i <= data.length - window_size; i++) {
    let curr_avg = 0.0,
      t = i + window_size;
    for (let k = i; k < t && k <= data.length; k++) {
      curr_avg += data[k]["value"] / window_size;
    }
    r_avgs.push({ set: data.slice(i, i + window_size), avg: curr_avg });
    avg_prev = curr_avg;
  }
  return r_avgs;
}
