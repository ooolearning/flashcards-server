"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
var basicAuth = require("express-basic-auth");
var bodyParser = require("body-parser");
var cors = require("cors");
var dotenv = require("dotenv");
var express = require("express");
var jwt = require("jsonwebtoken");
var mysql = require("mysql");
// const mysql = require('mysql')
// require('dotenv').config()
// const express = require('express')
// const bodyParser = require('body-parser')
// const jwt = require('jsonwebtoken')
// const basicAuth = require('express-basic-auth')
// const cors = require('cors')
dotenv.config();
var app = express();
var log = console.log;
var connection = function () {
    var temp = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: +process.env.DB_PORT
    });
    temp.connect();
    temp.on('error', log);
    return temp;
};
var query = function (_query, _arr) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                    var con = connection();
                    con.query(_query, _arr, function (error, results, fields) {
                        log(results);
                        error ? reject(error) : resolve(true);
                    });
                    con.end();
                })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var queryOne = function (_query, _arr) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                    var con = connection();
                    con.query(_query, _arr, function (error, results, fields) {
                        log(results[0]);
                        error ? reject(error) : resolve(results[0]);
                    });
                    con.end();
                })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
var queryAll = function (_query, _arr) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, new Promise(function (resolve, reject) {
                    var con = connection();
                    con.query(_query, _arr, function (error, results, fields) {
                        log(results);
                        error ? reject(error) : resolve(results);
                    });
                    con.end();
                })];
            case 1: return [2 /*return*/, _a.sent()];
        }
    });
}); };
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(basicAuth({
    users: { 'ooolearning': '1234' },
    unauthorizedResponse: { message: 'Unauthorized' }
}));
var verifyJWT = function (req, res, next) {
    var token = req.headers['token'].toString();
    if (!token)
        return res.status(401).json({ message: 'No token provided' });
    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err)
            return res.status(403).json({ message: 'Failed to authenticate token' });
        req.user = decoded;
        next();
    });
};
app.use('/', function (req, res, next) {
    log('/');
    res.contentType('application/json');
    next();
});
// user
// @ts-ignore
app.post('/user/login', function (req, res) {
    log('/user/login');
    var _a = Object(req.body), email = _a.email, password = _a.password;
    try {
        if (!email)
            throw 'Invalid email';
        if (!password)
            throw 'Invalid password';
        queryOne('select * from user where email = ? and password = sha1(?)', [email, password])
            .then(function (d) {
            if (d === undefined)
                throw 'Wrong email or password';
            var token = jwt.sign(__assign({}, d), process.env.SECRET, { expiresIn: 300 });
            res.status(200).json({ token: token });
        })["catch"](function (e) {
            log(e);
            res.status(400).json({ message: e });
        });
    }
    catch (e) {
        log(e);
        res.status(400).json({ message: e });
    }
});
// @ts-ignore
app.post('/user/create', function (req, res) {
    log('/user/create');
    var _a = Object(req.body), name = _a.name, email = _a.email, password = _a.password;
    try {
        if (!name)
            throw 'Invalid name';
        if (!email)
            throw 'Invalid email';
        if (!password)
            throw 'Invalid password';
        query('insert into user (name, email, password) values (?, ?, sha1(?))', [name, email, password])
            .then(function (d) {
            if (!d)
                throw 'Error';
            res.status(201).json({ message: 'User created' });
        })["catch"](function (e) {
            log(e);
            res.status(400).json({ message: e });
        });
    }
    catch (e) {
        log(e);
        res.status(400).json({ message: e });
    }
});
// todo
// @ts-ignore
app.post('/todo/all', verifyJWT, function (req, res) {
    log('/todo/all');
    var user_id = req.user.id;
    queryAll('select * from todo where user_id = ? order by favorite asc', [user_id])
        .then(function (d) { return res.status(200).json({ todos: d }); })["catch"](function (e) {
        log(e);
        res.status(400).json({ message: e });
    });
});
// @ts-ignore
app.post('/todo/favorite', verifyJWT, function (req, res) {
    log('/todo/favorite');
    var user_id = req.user.id;
    var id = Object(req.body).id;
    query('update todo set favorite = \'true\' where user_id = ? and id = ?', [user_id, id])
        .then(function (d) { return res.status(200).json({ message: 'Todo favorited' }); })["catch"](function (e) {
        log(e);
        res.status(400).json({ message: e });
    });
});
// @ts-ignore
app.post('/todo/unfavorite', verifyJWT, function (req, res) {
    log('/todo/unfavorite');
    var user_id = req.user.id;
    var id = Object(req.body).id;
    query('update todo set favorite = \'false\' where user_id = ? and id = ?', [user_id, id])
        .then(function (d) { return res.status(200).json({ message: 'Todo unfavorited' }); })["catch"](function (e) {
        log(e);
        res.status(400).json({ message: e });
    });
});
// @ts-ignore
app.post('/todo/delete', verifyJWT, function (req, res) {
    log('/todo/delete');
    var user_id = req.user.id;
    var id = Object(req.body).id;
    query('delete from todo where user_id = ? and id = ?', [user_id, id])
        .then(function (d) { return res.status(200).json({ message: 'Todo deleted' }); })["catch"](function (e) {
        log(e);
        res.status(400).json({ message: e });
    });
});
// @ts-ignore
app.post('/todo/create', verifyJWT, function (req, res) {
    log('/todo/create');
    var user_id = req.user.id;
    var _a = Object(req.body), title = _a.title, text = _a.text;
    query('insert into todo (title, text, user_id) values (?, ?, ?)', [title, text, user_id])
        .then(function (d) { return res.status(201).json({ message: 'Todo created' }); })["catch"](function (e) {
        log(e);
        res.status(400).json({ message: e });
    });
});
app.listen(process.env.PORT, function () { return log("Listening on port " + process.env.PORT); });
