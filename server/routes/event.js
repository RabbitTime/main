const express = require('express');
const eventController = require('../controllers/eventController')

const router = express.Router();

// TODO: GET request routes

router.post('/', eventController.createEvent, (req, res) => {
  return res.status(200).json(res.locals.newEvent);
});

router.get('/', eventController.getEvent, (req, res) => {
  return res.status(200).json(res.locals.event);
})

module.exports = router;