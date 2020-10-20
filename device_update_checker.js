const express = require('express')
const bodyParser = require('body-parser')


const {Client} = require('pg')
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

client.query('LISTEN device_updated');

client.on('notification', async(data)=>{
    const payload = JSON.parse(data.payload);
   
	console.log('DEVICE UPDATED', payload);
	console.log('Device ID is ', payload.deviceID);
	console.log('showOnMap is', payload.showOnMap);
	var devID = payload.deviceID;
	var idData = payload.id;
	

	
	if(payload.showOnMap == 0){
		deleteNode(devID);
	}else showNode(devID, idData);

})

function deleteNode(deviceID){
	const query = {
		name: 'delete-data',
		text: 'DELETE FROM common_raft WHERE deviceid =$1',
		values: [deviceID]
	}

	
	client1.query(query, (err, res)=>{
	if(err) throw err;
	console.log("Common RAFT table updated!");
	})
	
		
}

function showNode(deviceID, idNum){
	const query = {
		name: 'check-data-validity',
		text: 'SELECT * FROM device_events WHERE "deviceID" =$1 AND "msgTime" = current_date ORDER BY "msgTime" DESC',
		values: [deviceID]
	}

	
	client.query(query, (err, res)=>{
	if(err) throw err;
	
	if(res.rows[0] != undefined){
		console.log("Found events of device: ", res.rows);
	var date = new Date();
	var currentTime = date.getTime() / 1000;
	//console.log("date today: ", date)
	//console.log("current time: ", parseInt(currentTime));
	
	var hourdiff = (parseInt(currentTime) - parseInt(res.rows[0].data.BV1.time)) / 3600;
	console.log("hours passed since last transmission:", hourdiff)
	
	
	if(hourdiff < 6) {
		var lastPub = res.rows[0].msgTime;
		var latData = res.rows[0].data.LAT1.value;
		var longData = res.rows[0].data.LNG1.value;
		var altData = res.rows[0].data.ALT1.value;
		var floodData = res.rows[0].data.FD1.value;
		var rainRateData = res.rows[0].data.RR1.value;
		var rainAmtData = res.rows[0].data.RA1.value;
		var tempData = res.rows[0].data.TMP1.value;
		var humData = res.rows[0].data.HU1.value;
		var pressureData = res.rows[0].data.PR1.value;


		const query = {
			name: 'publish-data',
			text: 'INSERT INTO common_raft (time, id, latitude, longitude, altitude, flooddepth, rainfallrate, rainfallamount, temperature, pressure, humidity, deviceid, polyid) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::text, 1) ON CONFLICT (deviceid) WHERE (deviceid = $12::text) AND (time = $1) DO NOTHING',
			values: [lastPub, idNum, latData, longData, altData, floodData, rainRateData, rainAmtData, tempData, pressureData,humData, deviceID]
		}

		client1.query(query, (err, res)=>{
			if(err) throw err;
				console.log("Common RAFT table updated!");
			})
	}
	} else {console.log("no data published for today!");}
	
	
	
	
	})
	
		
}
