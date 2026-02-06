const Event = require('../models/Event');

exports.getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch events' });
    }
};

exports.getEventsByCohort = async (req, res) => {
    try {
        const { cohortId } = req.params;
        const events = await Event.find({ cohortId }).sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch cohort events' });
    }
};

exports.createEvent = async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ error: error.message || 'Failed to create event' });
    }
};
