const Module = require("./../models/module.model");
const Course = require("./../models/course.model");
const Lesson = require("./../models/lesson.model");
const User = require("./../models/user.model");
const CustomError = require("./../utils/custom-error");

class CourseService {

  async getAllCourses(data) {
    const course = await Course.find({}, { __v: 0 });
    return course.tutor_id
  }


  async getAllLessons(data) {
    const lesson = await Lesson.find({course_id:data}, { __v: 0 })
    return lesson
  }

  async getAllModules(data) {
    return await Module.find({course_id:data}, { cloudinary: 0, __v: 0 });
  }

 
}

module.exports = new CourseService();