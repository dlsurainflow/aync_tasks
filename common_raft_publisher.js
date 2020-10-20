//CONVERT TIME
//POLYID
//PM2 START <javascript_file_name> when uploaded sa sevrver para continuus run https://pm2.keymetrics.io/docs/usage/quick-start/

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const Sequelize = require("sequelize")

const {Pool, Client } = require('pg')
// pools will use environment variables


const client = new Client({
	user: 'tammy',
	host:'RainFLOW.live',
	database:'actorcloud',
	password:'Inmediasres8!',
	port: 5432,
	
})

const client1 = new Client({
	user: 'tammy',
	host:'RainFLOW.live',
	database:'rainflow',
	password:'Inmediasres8!',
	port: 5432,
	
})


client1
	.connect()
    .then(() => console.log('Successfully connected to RAINFLOW.'))
    .catch(err => console.error('Connection error', err.stack))

client
    .connect()
    .then(() => console.log('Successfully connected to ACTORCLOUD.'))
    .catch(err => console.error('Connection error', err.stack))

client.query('LISTEN new_testevent');

client.on('notification', async(data)=>{
    const payload = JSON.parse(data.payload);
   
	console.log('NEW DATA!', payload);
	//console.log("Data to be inserted into database: ", payload.data.TMP1.value);
	console.log('Device ID is ', payload.deviceID);
	
	
	var devID = payload.deviceID;
	
	//var timeData = payload.msgTime;
	var latData = payload.data.LAT1.value;
	var longData = payload.data.LNG1.value;
	var altData = payload.data.ALT1.value;
	var floodData = payload.data.FD1.value;
	var rainRateData = payload.data.RR1.value;
	var rainAmtData = payload.data.RA1.value;
	var tempData = payload.data.TMP1.value;
	var humData = payload.data.HU1.value;
	var pressureData = payload.data.PR1.value;
	var idData;
	
	//check if meron lat, long, rainfallamount, and flood depth
	if(latData != null && longData != null && rainAmtData != null && floodData != null){
			var sql = 'SELECT * FROM devices where "deviceID" = $1::text';
	
			client.query(sql, [devID], (err, res)=>{
				if(err) throw err;

		//console.log("showOnMap =", res.rows[0].showOnMap);
			
			if(res.rows[0].showOnMap == 1){
				idData = res.rows[0].id;
				publishData(idData, latData, longData, altData, floodData, rainRateData, rainAmtData, tempData, humData, pressureData, devID);

		}
	})
	}

})

function publishData(id, lat, lng, alt, flood, rr, ramt, temp1, hum, pressure, deviceID){
	const query = {
		name: 'publish-data',
		text: 'INSERT INTO common_raft (time, id, latitude, longitude, altitude, flooddepth, rainfallrate, rainfallamount, temperature, pressure, humidity, deviceid, polyid) VALUES (now(), $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11::text, 1) ON CONFLICT (deviceid) WHERE (deviceid = $11::text) DO UPDATE SET time = now(), flooddepth = $5 , rainfallrate= $6, rainfallamount=$7, temperature = $8, pressure=$9 , humidity=$10',
		values: [id, lat, lng, alt, flood, rr, ramt, temp1, pressure, hum, deviceID]
	}
	//console.log(query);
	
	client1.query(query, (err, res)=>{
	if(err) throw err;
		console.log("Common RAFT table updated!");
	})
	
	
		
}
