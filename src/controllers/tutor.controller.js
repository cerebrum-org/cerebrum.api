const { uploads, cloudUpload } = require("../services/cloudinary.service");
const TutorServ = require("./../services/tutor.service");
const response = require("./../utils/response");
const uploadStream = require("../utils/uploadStream");
const cloudinary = require("../services/cloudinary2.service");
const multerStorage = require ("../utils/memoryStorage");


class TutorContoller {
  async courseCreate(req, res) {
    const result = await uploadStream(req.file.buffer);
    const body = {...req.body, img: result.secure_url}
    const response = await TutorServ.create(body);
    res.status(201).send(response("course created", response));
  }

  async moduleCreate(req, res) {
    const result = await TutorServ.moduleCreate(req.body);
    res.status(201).send(response("Module created", result));
  }

  async lessonCreate(req, res) {
   const cloudResponse = await cloudUpload(req.file.path,(err, result)=>{
     if(err) throw new CustomError(err)
   })

    const result = await TutorServ.lessonCreate(req.body,cloudResponse);
    res.status(201).send(response("Lesson successfully created", result));

  }

  async getAll(req, res) {
    const result = await TutorServ.getAll();
    res.status(200).send(response("All tutor courses", result));
  }

  async getOne(req, res) {
    const result = await TutorServ.getOne(req.params.tutorId);
    res.status(200).send(response("tutor data", result));
  }

  async update(req, res) {
    const result = await TutorServ.update(req.params.tutorId, req.body);
    res.status(200).send(response("tutor updated", result));
  }

  async delete(req, res) {
    const result = await TutorServ.delete(req.params.tutorId);
    res.status(200).send(response("tutor deleted", result));
  }
}

module.exports = new TutorContoller();
