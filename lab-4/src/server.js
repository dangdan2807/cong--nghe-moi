const express = require('express');
const dotenv = require('dotenv');

const app = express();
dotenv.config();
const POST = process.env.PORT || 3000;

// template
app.use(express.json({ extended: true }));
app.use(express.static('./src/resource/views'));
app.set('view engine', 'ejs');
app.set('views', './src/resource/views');

app.get('/', (req, res) => {
    const data = [
        {
            monHoc: 'Cơ sở dữ liệu',
            loaiMH: 'Cơ sở',
            hocKy: 'HK1-2020-2021',
            khoa: 'k.CNTT',
        },
        {
            monHoc: 'Cấu trúc dữ liệu',
            loaiMH: 'Cơ sở',
            hocKy: 'HK1-2020-2021',
            khoa: 'k.CNTT',
        },
        {
            monHoc: 'Công nghệ phần mềm',
            loaiMH: 'Cơ sở ngành',
            hocKy: 'HK1-2020-2021',
            khoa: 'k.CNTT',
        },
        {
            monHoc: 'Công nghệ mới',
            loaiMH: 'chuyên ngành',
            hocKy: 'HK1-2020-2021',
            khoa: 'k.CNTT',
        },
        {
            monHoc: 'Đồ án môn học',
            loaiMH: 'chuyên ngành',
            hocKy: 'HK1-2020-2021',
            khoa: 'k.CNTT',
        },
    ];

    res.render('home', {
        data,
    });
});

app.listen(POST, () => {
    console.log(`running http://localhost:${POST}`);
});
