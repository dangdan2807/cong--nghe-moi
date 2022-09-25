const dotenv = require('dotenv');
const AWS = require('aws-sdk');

dotenv.config();

AWS.config.update({
    region: process.env.AWS_DEFAULT_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const docClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = 'SanPhams';

class SiteController {
    // [get] /
    home = async (req, res) => {
        const params = {
            TableName: TABLE_NAME,
        };

        try {
            const { Items } = await docClient.scan(params).promise();
            console.log('data: ' + JSON.stringify(Items));
            return res.render('home', { sanPhams: Items });
        } catch (err) {
            console.log('get - lỗi:', err);
        }
        return res.render('home', { sanPhams: [] });
    };

    // [get] /:ma_sp
    getById = (req, res) => {
        console.log('get /:map_sp - match');
        const ma_sp = req.params.ma_sp;

        if (ma_sp == undefined || ma_sp == null || ma_sp == '') {
            return res.redirect('/');
        }

        const params = {
            TableName: TABLE_NAME,
            KeyConditionExpression: 'ma_sp = :v_ma_sp',
            ExpressionAttributeValues: {
                ':v_ma_sp': ma_sp,
            },
            Limit: 1,
        };

        try {
            const { Items } = await(docClient.query(params).promise()).Items;
            console.log('data: ' + JSON.stringify(Items));
            if (Items.length == 0) {
                return res.redirect('/');
            }
            return res.render('update', {
                sanPhams: Items[0],
                maSP: Items[0] ? Items[0].ma_sp : 0,
            });
        } catch (err) {
            console.log('get - lỗi:', err);
        }
        return res.redirect('/');
    };

    // [POST] /:ma_sp
    updateById = (req, res) => {
        const masp = req.params.ma_sp;
        const { ma_sp, ten_sp, so_luong } = req.body;
        if (masp == undefined || masp == null || masp == '') {
            return res.redirect(`/`);
        }

        if (ma_sp == undefined || ma_sp == null || ma_sp == '') {
            return res.redirect(`/`);
        }

        if (ma_sp != masp) {
            return res.redirect(`/:${ma_sp}`);
        }

        const params = {
            TableName: TABLE_NAME,
            Item: {
                ma_sp,
                ten_sp,
                so_luong,
            },
        };

        docClient.put(params, (err, data) => {
            if (err) {
                console.log('post - add - lỗi 500');
                console.log(err);
            }
            return res.redirect('/');
        });
    };

    // [POST] /
    save = (req, res) => {
        const { ma_sp, ten_sp, so_luong } = req.body;
        const params = {
            TableName: TABLE_NAME,
            Item: {
                ma_sp,
                ten_sp,
                so_luong,
            },
        };

        docClient.put(params, (err, data) => {
            if (err) {
                console.log('post - add - lỗi 500');
                console.log(err);
            }
            return res.redirect('/');
        });
    };

    // [POST] /delete
    deleteById = (req, res) => {
        const { ma_sp } = req.body;
        const params = {
            TableName: TABLE_NAME,
            Key: { ma_sp },
        };

        docClient.delete(params, (err, data) => {
            if (err) {
                console.log('post - delete - lỗi 500');
                console.log(err);
            }
            return res.redirect('/');
        });
    };
}

module.exports = new SiteController();
