const _ = require ("lodash")
const Course= require("../models/course.model");
const user = require("../models/user.model");
const CustomError = require("./../utils/custom-error");


exports.search = async (req, res) => {
  const Query = req.query.q.trim();
  const query = new RegExp(Query, "gi");

  const courses= await Course
  .find({ name: query }).select(["_id","name","category","description","price", "image_url" ]);

  const users = await user.find({ $text: { $search: query } }).select([
    "_id",
    "firstName",
    "lastName",
    "image_url",
    "email"


    ]);
   
    if (_.isEmpty (users) && _.isEmpty(courses)) throw new CustomError("Does not exist")
    
 
   const results = {
    courses,
    users,
  };

  res.status(200).send({ success: true, data: results });
};