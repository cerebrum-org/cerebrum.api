const CustomError = require("./../utils/custom-error");
const Course = require ("./../models/course.model") 
const Module= require ("./../models/module.model") 
const Lesson = require ("./../models/lesson.model") 
const User = require ("./../models/user.model") 
const _ = require('lodash');


class TutorService {

  async courseCreate(data, image) {

    //check user
    const user = await User.findOne({_id:data.tutor_id})
    if(_.isEmpty(user) )throw new CustomError('this user is not a Registered',401)

    if(user.role !== 'tutor') throw new CustomError("This User is not a tutor!")
    data.image_url = image.secure_url
    let newPrice = {
      lifeTime: data.price,
      subscription: (parseInt(data.price))*0.02
    }
    data.price = newPrice
    console.log(data)
    return await new Course(data).save();
  }

  async moduleCreate(course_id, data){
    return await new Module(course_id, data).save();
  }

  async lessonCreate(data,video) {
    data.video_url = video.secure_url
    data.cloudinary = video
    return await new Lesson(data).save();
  }

  async moduleCreate(data) {
    return await new Module(data).save();
  }

//for the tutor to find his own courses
  async getAllCourse(data) {
    const tutor_id = data
    return await Course.find({tutor_id:tutor_id})
  }

// to find one of the tutors courses
  async getOne(courseId) {
    
    const course = await Course.findOne({ _id: courseId });
    if (!course) throw new CustomError("Course does not exists")
  }
  
// for tutor to update his courses
  async updateCourses(courseId, data) {
    const course = await Course.findByIdAndUpdate(
      { _id: courseId },
      { $set: data },
      { new: true }
    );

    if (!course) throw new CustomError("Course dosen't exist", 404);

    return course;
  }
//for tutor to delete his courses
  async deleteCourses(courseId) {
    const course = await Course.findByIdAndDelete({ _id: courseId });
    course.remove();
    return course;
  }
}

module.exports = new TutorService();