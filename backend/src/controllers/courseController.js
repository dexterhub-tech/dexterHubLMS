const Course = require('../models/Course');
const Module = require('../models/Module');
const Lesson = require('../models/Lesson');

// --- Course Operations ---

// Create a new Course
exports.createCourse = async (req, res) => {
    try {
        const course = new Course({
            ...req.body,
            instructorId: req.user.id
        });
        await course.save();
        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const query = {};
        if (req.user.role === 'instructor') {
            query.instructorId = req.user.id;
        }

        const courses = await Course.find(query).populate('modules');

        const enhancedCourses = courses.map(c => {
            const courseObj = c.toObject();
            return {
                ...courseObj,
                registrarsCount: c.registrars ? c.registrars.length : 0
            };
        });

        res.json(enhancedCourses);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- Module (Class) Operations ---

// Create a Module and add to Course
exports.createModule = async (req, res) => {
    try {
        const { courseId, name, description, duration } = req.body;

        const module = new Module({
            courseId,
            name,
            description,
            duration
        });
        await module.save();

        // Add to Course
        await Course.findByIdAndUpdate(courseId, { $push: { modules: module._id } });

        res.status(201).json(module);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// --- Lesson (Session) Operations ---

// Create a Lesson and add to Module
exports.createLesson = async (req, res) => {
    try {
        const { moduleId, name, content, videoUrl, duration, assignment } = req.body;

        const lesson = new Lesson({
            moduleId,
            name,
            content,
            videoUrl,
            duration,
            assignment // Optional assignment object
        });
        await lesson.save();

        // Add to Module
        await Module.findByIdAndUpdate(moduleId, { $push: { lessons: lesson._id } });

        res.status(201).json(lesson);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Full Course Structure (Deep Populate)
exports.getCourseDetails = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id)
            .populate({
                path: 'modules',
                populate: {
                    path: 'lessons',
                    model: 'Lesson'
                }
            });

        if (!course) return res.status(404).json({ error: 'Course not found' });
        res.json(course);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
