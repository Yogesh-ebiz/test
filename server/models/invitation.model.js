const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const InvitationSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  createdDate: {
    type: Number,
    required:false
  },
  acceptedDate: {
    type: Number,
    required:false
  },
  createdBy: {
    type: Number,
    required:false
  },
  status: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required:true
  },
  imageUrl: {
    type: String,
    required:false
  },
  role: {
    type: String,
    required:false
  }
}, {
  versionKey: false
});


module.exports = mongoose.model('Invitation', InvitationSchema);
