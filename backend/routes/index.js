const express = require('express');
const router  = express.Router();
const auth    = require('../middleware/auth');

const authCtrl     = require('../controllers/authController');
const profileCtrl  = require('../controllers/profileController');
const mealCtrl     = require('../controllers/mealController');
const routineCtrl  = require('../controllers/routineController');
const progressCtrl = require('../controllers/progressController');

// Auth
router.post('/auth/register', authCtrl.register);
router.post('/auth/login',    authCtrl.login);
router.get ('/auth/me',       auth, authCtrl.me);

// Profile
router.get ('/profile',         auth, profileCtrl.getProfile);
router.post('/profile',         auth, profileCtrl.createProfile);
router.get ('/profile/metrics', auth, profileCtrl.getMetrics);

// Meals
router.get ('/meals/plan',      auth, mealCtrl.getCurrentPlan);
router.post('/meals/generate',  auth, mealCtrl.generatePlan);
router.get ('/meals/foods',     auth, mealCtrl.getFoods);

// Routines
router.get ('/routines/current',  auth, routineCtrl.getCurrentRoutine);
router.post('/routines/generate', auth, routineCtrl.generateRoutine);
router.post('/routines/log',      auth, routineCtrl.logExercise);

// Progress
router.get ('/progress',         auth, progressCtrl.getProgress);
router.post('/progress',         auth, progressCtrl.logDay);
router.get ('/progress/summary', auth, progressCtrl.getWeeklySummary);

module.exports = router;
