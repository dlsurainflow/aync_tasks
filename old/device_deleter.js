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

client.query('LISTEN device_deleted_id');

client.on('notification', async(data)=>{
    const payload = JSON.parse(data.payload);
   
	console.log('DEVICE DELETED FROM ACTORCLOUD', payload);
	console.log('Device ID is ', payload.deviceID);
	var devID = payload.deviceID;
	var idData = payload.id;
	
	deleteNode(devID);

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

