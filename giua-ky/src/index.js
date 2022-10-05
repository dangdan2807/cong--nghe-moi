const express = require('express');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');

// base config
const app = express();
dotenv.config();
const PORT = process.env.PORT || 3000;

// aws config
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
    region: process.env.AWS_REGION,
});

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
    region: process.env.AWS_REGION,
});

// multer config
var imageUrl = '';
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        if (
            file.mimetype === 'image/jpg' ||
            file.mimetype === 'image/jpeg' ||
            file.mimetype === 'image/png'
        ) {
            cb(null, './public/images');
        } else {
            cb(new Error('không phải hình ảnh'), false);
        }
    },
    filename: function (req, file, cb) {
        imageUrl = Date.now() + file.originalname;
        cb(null, imageUrl);
    },
});

const upload = multer({ storage: storage });

const uploadFile = (file) => {
    const fileStream = fs.createReadStream(file.path);
    const uploadParams = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Body: fileStream,
        Key: file.filename,
    };

    return s3.upload(uploadParams).promise();
};

// temple engine
app.set('view engine', 'ejs');
app.set('views', './src/resource/views');
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.use(bodyParser.urlencoded({ extended: true }));

const TableName = 'SanPhams';
const docClient = new AWS.DynamoDB.DocumentClient();

// route
app.get('/add', async (req, res) => {
    return res.render('add', {
        alertMessage: '',
    });
});

app.post('/update', upload.single('image'), async (req, res) => {
    const { ma_sp, ten_sp, so_luong } = req.body;
    const image = req.file;
    if (!image) {
        const error = new Error('Please upload a file');
        return next(error);
    }

    let params = {
        TableName,
        KeyConditionExpression: 'ma_sp = :v_ma_sp',
        ExpressionAttributeValues: {
            ':v_ma_sp': ma_sp,
        },
        Limit: 1,
    };

    try {
        // check if product exists
        const { Items } = await docClient.query(params).promise();
        if (Items.length == 0) {
            return res.render('update', {
                alertMessage: 'san pham khong ton tai',
            });
        }

        const resultUploadImage = await uploadFile(image);

        params = {
            TableName,
            Item: {
                ma_sp,
                ten_sp,
                so_luong,
                image: resultUploadImage.Location,
            },
        };

        await docClient.put(params).promise();

        return res.redirect('/');
    } catch (error) {
        console.log(error);
    }
    return res.redirect('/add');
});

app.post('/delete', async (req, res) => {
    const { ma_sp } = req.body;
    let params = {
        TableName,
        KeyConditionExpression: 'ma_sp = :v_ma_sp',
        ExpressionAttributeValues: {
            ':v_ma_sp': ma_sp,
        },
        Limit: 1,
    };

    try {
        const { Items } = await docClient.query(params).promise();
        console.log(Items);
        if (Items.length == 0) {
            return res.redirect('/');
        }

        params = {
            TableName,
            Key: {
                ma_sp,
            },
        };

        await docClient.delete(params).promise();

        return res.redirect('/');
    } catch (error) {
        console.log(error);
    }
    return res.redirect('/');
});

app.get('/:ma_sp', async (req, res) => {
    const ma_sp = req.params.ma_sp;

    let params = {
        TableName,
        KeyConditionExpression: 'ma_sp = :v_ma_sp',
        ExpressionAttributeValues: {
            ':v_ma_sp': ma_sp,
        },
        Limit: 1,
    };

    try {
        const { Items } = await docClient.query(params).promise();
        if (Items.length == 0) {
            return res.redirect('/');
        }

        return res.render('update', {
            sanPham: Items[0],
            alertMessage: '',
        });
    } catch (error) {
        console.log(error);
    }

    return res.redirect('/');
});

// add
app.post('/add', upload.single('image'), async (req, res) => {
    const { ma_sp, ten_sp, so_luong } = req.body;
    const image = req.file;
    if (!image) {
        return res.render('add', {
            alertMessage: 'san pham phai co hinh anh',
        });
    }

    let params = {
        TableName,
        KeyConditionExpression: 'ma_sp = :v_ma_sp',
        ExpressionAttributeValues: {
            ':v_ma_sp': ma_sp,
        },
        Limit: 1,
    };

    try {
        const { Items } = await docClient.query(params).promise();
        console.log(Items);
        if (Items.length > 0) {
            return res.render('add', {
                alertMessage: 'san pham da ton tai',
            });
        }

        // upload anh
        const resultUploadImage = await uploadFile(image);

        params = {
            TableName,
            Item: {
                ma_sp,
                ten_sp,
                so_luong,
                image: resultUploadImage.Location,
            },
        };

        const data = await docClient.put(params).promise();

        return res.redirect('/');
    } catch (error) {
        console.log(error);
    }
    return res.redirect('/add');
});

app.get('/', async (req, res) => {
    const params = {
        TableName,
    };

    try {
        const { Items } = await docClient.scan(params).promise();
        if (Items.length >= 0) {
            return res.render('index', { data: Items });
        }
    } catch (error) {
        console.log(error);
    }
    return res.render('index', { data: [] });
});

app.listen(PORT, () => {
    console.log(`server is running on http://localhost:${PORT}`);
});
