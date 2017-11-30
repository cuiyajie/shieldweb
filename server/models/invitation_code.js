import mongoose from 'mongoose'

const EXPIRES = 1000 * 60 * 60 * 24 * 90

const InvitationCode = new mongoose.Schema({
  code: { type: String },
  count: { type: Number, default: 100 },
  type: { type: Number, default: 1 },
  devices: { type: Array, default: [] },
  expires: { type: Date, default: Date.now() + EXPIRES },
  last_auth_time: { type: Date, default: Date.now() },
  last_auth_device: { type: String }
})

InvitationCode.statics.createCode = async function (newCode) {
  return await this.create(newCode)
}

InvitationCode.statics.findOneByCode = async function (code) {
  return await this.findOne({ $where: `this.code == '${code}'` })
}

InvitationCode.statics.deleteCode = async function (condition) {
  return await this.deleteOne(condition)
}

InvitationCode.statics.updateCodeCount = async function (devices, count = -1) {
  return await this.findOneAndUpdate({ 
    devices: { $in: [devices, '$devices']},
    count: { $gt: 0 } }, { $inc: { count } 
  })
}

InvitationCode.statics.addDevice = async function (code, devices) {
  return await this.update(
    { code },
    { 
      $addToSet: { devices },
      last_auth_time: new Date().getTime(),
      last_auth_device: devices
    })
}

InvitationCode.statics.findDevice = async function (devices) {
  return await this.findOne({ devices: { $in: [devices, '$devices']} })
}

export default mongoose.model('invitation_code', InvitationCode)
