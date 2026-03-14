const express = require("express");
const router = express.Router();
const { getTasks, getTask, createTask, updateTask, deleteTask } = require("../controllers/tasks");
const { taskValidation, taskUpdateValidation } = require("../middleware/validate");
const { protect } = require("../middleware/auth");

router.use(protect);

router.route("/").get(getTasks).post(taskValidation, createTask);
router.route("/:id").get(getTask).put(taskUpdateValidation, updateTask).delete(deleteTask);

module.exports = router;
