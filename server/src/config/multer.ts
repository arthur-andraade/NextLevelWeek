import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

// Config to system of upload the images 
export default {
    storage: multer.diskStorage({
        destination: path.resolve(__dirname, '..', '..', 'uploads'),
        filename(request, file, callback){
            const hash = crypto.randomBytes(6).toString('hex');
            const fileName = `${hash}-${file.originalname}`;
            callback(null, fileName);
        }
    })
}