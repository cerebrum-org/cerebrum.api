const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: [true, "User ID is required "],
        ref: "user",
    },
    
    course_id: {
    type: Schema.Types.ObjectId,
    required: [true, "Course ID is required "],
    ref: "course"
    },

    paymentType: {
    type: String,
    required: [true, "Payment Type  is required "]
    },
    
    email: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    reference: {
        type: String,
        // required: true
    },
    sub_date: {
        type: String,
        required: [true, "Subscription date is required"]
      },

    exp_date: {
    type: String,
    required: [true, "expiry Date is required"]
    
    },
    status: {
        type: Boolean,
        required : [true, "payment status is required"]
    }
},
    {
        timestamps: true,
    }
);


paymentSchema.pre(/^find/, async function (next) {
    if(! this.populate({ 
      path: "course_id", 
      select: "_id name description price category image_url tutor_id" }
      )); return next()
   })

module.exports = mongoose.model("payment", paymentSchema)
