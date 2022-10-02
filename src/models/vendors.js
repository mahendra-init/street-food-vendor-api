const mongoose = require('mongoose')
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken')
const validator = require('validator')

const vendorSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        trim: true
    },
    contactNo: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowerCase: true,
        validate(value) {
            if(!validator.isMobilePhone(value)){
                throw new Error('Please enter valid contact number !')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if(value.toLowerCase().includes('password')){
                throw new Error('Password should not include "password" !')
            }
        }
    },
    documents: {
        fssaiLicense: {
            type: Buffer,
            default: undefined
        },
        hawkerLicense: {
            type: Buffer,
            default: undefined
        },
        addressProof: {
            type: Buffer,
            default: undefined
        }        
    },
    address: {
        addressName: {
            type: String,
            required: true,
            trim: true,
            lowerCase: true
        },
        lat : {
            type: String,
            default: "0"
        },
        long : {
            type: String,
            default: "0"
        }
    },
    openOrClosedstatus: {
        type: Boolean,
        default: false
    },
    takeAwayOrderstatus: {
        type: Boolean,
        default: false
    },
    menuItem: [{
        foodName: {
            type: String,
            required: true
        },
        price: {
            type: Number,
            required: true
        },
        foodImage: {
            type: Buffer,
            default: undefined
        },
    }],
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }]
},{
    timestamps: true
})

vendorSchema.virtual('orders', {
    ref: 'Orders',
    localField: '_id',
    foreignField: 'vendorName'
})

// vendor defined fnc of instance of a model
vendorSchema.methods.generateAuthToken = async function() {
    const vendor = this
    const token = jwt.sign({_id: vendor._id.toString()}, process.env.JWT_SECRET)

    vendor.tokens = vendor.tokens.concat({ token})
    await vendor.save()

    return token
}

// return vendor without vendor's password and tokens
vendorSchema.methods.toJSON = function() {
    const vendor = this
    const vendorObject = vendor.toObject()

    delete vendorObject.password
    delete vendorObject.tokens

    return vendorObject
}

// vendor defined fnc of a model to verify credentials
vendorSchema.statics.findByCredentials = async (contactNo, password) => {
    const vendor = await Vendor.findOne({contactNo})
    if(!vendor){
        throw new Error('Unable to login!')
    }
    
    const isMatch = await bcryptjs.compare(password, vendor.password)
    if(!isMatch){
        throw new Error('Unable to login!')
    }

    return vendor
}

//Hashing a password befor saving 
vendorSchema.pre('save', async function(next) {
    const vendor = this
    
    if(vendor.isModified('password')) {
        vendor.password = await bcryptjs.hash(vendor.password, 8)
    }

    // Here we also have to modify address to its latitude and longitude


    next()
})

const Vendor = mongoose.model('Vendor', vendorSchema)

module.exports = Vendor