const express = require('express');
const dotenv = require('dotenv');
const AWS = require('aws-sdk');

const app = express();
dotenv.config();

// aws config
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY_ID,
    region: process.env.AWS_REGION,
});

// template engine
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', 'src/views/');

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// dynamodb config
const TableName = 'SanPhams';
const docClient = new AWS.DynamoDB.DocumentClient();

// routes
app.get('/add', async (req, res) => {
    return res.render('add');
});

app.post('/add', async (req, res) => {
    const { ten_sp, so_luong, image } = req.body;

    // kiểm tra các biến có bị thiếu không
    if (!ten_sp || !so_luong || !image) {
        return res.redirect('/add');
    }

    // tạo params
    const params = {
        TableName,
        Item: {
            ma_sp: Date.now() + '',
            ten_sp,
            so_luong,
            image,
        },
    };

    try {
        // thêm sản phẩm vào db
        const data = docClient.put(params).promise();
        return res.redirect('/');
    } catch (err) {
        console.log(err);
    }
    return res.redirect('/');
});

app.get('/update/:ma_sp', async (req, res) => {
    const { ma_sp } = req.params;

    // kiểm tra mã sản phẩm có tồn tại không
    if (!ma_sp) {
        return res.redirect('/');
    }

    const params = {
        TableName,
        Key: {
            ma_sp,
        },
    };

    try {
        // lấy sản phẩm từ db
        const { Item } = await docClient.get(params).promise();
        if (Item) {
            // nếu sản phẩm tồn tại thì render ra view update
            return res.render('update', {
                sanPham: Item,
            });
        }
    } catch (err) {
        console.log(err);
    }
    return res.redirect('/');
});

app.post('/update', async (req, res) => {
    const { ma_sp, ten_sp, so_luong, image } = req.body;

    // kiểm tra các biến có bị thiếu không
    if (!ma_sp || !ten_sp || !so_luong || !image) {
        return res.redirect('/update/' + ma_sp);
    }

    // tạo params
    const params = {
        TableName,
        Item: {
            ma_sp,
            ten_sp,
            so_luong,
            image,
        },
    };

    try {
        // cập nhật sản phẩm vào db
        const data = docClient.put(params).promise();
        return res.redirect('/');
    } catch (err) {
        console.log(err);
    }
    return res.redirect('/');
});

app.post('/delete', async (req, res) => {
    const { ma_sp } = req.body;

    // kiểm tra mã sản phẩm có tồn tại không
    if (!ma_sp) {
        return res.redirect('/');
    }

    // tạo params
    const params = {
        TableName,
        Key: {
            ma_sp,
        },
    };
    
    try {
        // Kiểm tra sản phẩm có tồn tại không
        const { Item } = await docClient.get(params).promise();
        
        if (Item) {
            // nếu sản phẩm tồn tại thì xóa sản phẩm
            await docClient.delete(params).promise();
            return res.redirect('/?deleteStatus=true');
        }
    } catch (err) {
        console.log(err);
    }
    return res.redirect('/?deleteStatus=false');
});

app.get('/', async (req, res) => {
    const { deleteStatus } = req.query;

    // tạo params
    const params = {
        TableName,
    };

    try {
        // lấy danh sách sản phẩm từ db
        const { Items } = await docClient.scan(params).promise();
        
        if (Items.length > 0) {
            return res.render('home', {
                sanPhams: Items,
                deleteStatus,
            });
        }
    } catch (err) {
        console.log(err);
    }

    return res.render('home', {
        sanPhams: [],
        deleteStatus,
    });
});
