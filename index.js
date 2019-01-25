const express = require('express');
const IotAgent = require('@dojot/iotagent-nodejs')
const { check, validationResult } = require('express-validator/check');

const boduParser = require('body-parser');
const port = process.env.PORT || 3005;

const iot = new IotAgent.IoTAgent()
const app = express();
app.use(boduParser())
const devices = [];

iot.init()
    .then(() => {
        iot.on('iotagent.device', 'device.create', (tenant, event) => {
            console.log(`Got device creation message. Tenant is ${tenant}.`);
            console.log(`Data is: ${event}`);
            console.log('Got configure event from Device Manager', event)
            // This is just to get one valid device ID to be used in
            // updateAttr sample.
            deviceId = event.data.id;
            devices.push(deviceId)
        });

        iot.on('iotagent.device', 'device.remove', (tenant, event) => {
            console.log(`Got device removal message. Tenant is ${tenant}.`);
            console.log(`Data is: ${event}`);
            console.log('Got configure event from Device Manager', event)
            deviceId = event.data.id;
            devices.pop(deviceId)
        });

        app.post('/sendData',[
            check('deviceId').exists(),
            check('deviceId').isString(),
            check('msg').exists(),
            check('msg').isString(),
        ], (req, res) => {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
              return res.status(422).json({ errors: errors.array() });
            }
          
            if (devices.indexOf(req.body.deviceId) !== -1) {
                iot.updateAttrs(req.body.deviceId, 'admin', req.body.msg, {});
                return res.status(204).send()
            }
            return res.status(400).send()
        });

        app.listen(port, () => {
            console.log(`Server running on ${port}`);
        })

        iot.generateDeviceCreateEventForActiveDevices();
    })
    .catch((err) => {
        console.log(err);
    })