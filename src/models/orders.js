const mongoose = require('mongoose')
const validator = require('validator')

const orderschema = new mongoose.Schema({
    foodname: {
        type: String,
        trim: true,
        required: true
    },
    quantity: {
        type: Number,
        default: 1,
        required: true
    },
    price: {
        type: Number,
        required: true,
        default: 0
    },
    orderStatus: {
        type: Boolean,
        default: false
    },
    userName: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    vendorName: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'Order'
    }
}, {
    timestamps: true
})

const Order = mongoose.model('Orders', orderschema)

module.exports = Order