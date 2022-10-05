const multer = require('multer')

const upload = multer({
    filter: {
        limits: {
            fileSize: 1000000
        }
    },
    fileFilter(req, file, cb) {
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Image should be in jpg, jpeg or png!'))
        }
        cb(undefined, true)
    }
})

const multipleUploads = upload.fields([{ name: 'fssaiLicense' }, { name: 'hawkerLicense'}, { name: 'addressProof'}])

module.exports = multipleUploads