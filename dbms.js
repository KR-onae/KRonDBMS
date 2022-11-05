// Require
const fs = require("fs");

// DB 라는 새로운 타입
module.exports.DB = function() {
    return {
        "data": null
    }
};
module.exports.DB.prototype = Object.prototype;
module.exports.DB.prototype.open = function($DB_Path, encoding) {
    if(encoding == undefined) {
        var encoding = module.exports.settings.encoding;
    }
    if(fs.existsSync($DB_Path)) {
        try {
            var file = fs.readFileSync($DB_Path, encoding).toString(); // 파일을 읽음
        } catch(error) {
            console.error(error);
            throw Error("DBMS: DB.prototype.open(DB_Path): Can't read the database file.");
        }
        try {
            var decoded = decodeURIComponent(Buffer.from(file, "base64").toString()); // 암호화를 품
        } catch(error) {
            console.error(error);
            throw Error("DBMS: DB.prototype.open(DB_Path): Can't decode the database file.");
        }
        try {
            var data = JSON.parse(decoded); // JSON 파싱을 함
        } catch(error) {
            console.error(error);
            throw Error("DBMS: DB.prototype.open(DB_Path): Can't JSON parse the database file.");
        }
        this.path = $DB_Path;
        this.data = data;
        this.encoding = encoding;
        return this;
    } else {
        throw Error("DBMS: DB.prototype.open(DB_Path): Can't find the database file.");
    }
};
module.exports.DB.prototype.createDB = function($DB_Name) {
    return this.data[$DB_Name] = {};
}
module.exports.DB.prototype.readDB = function($DB_Name) {
    return this.data[$DB_Name];
}
module.exports.DB.prototype.createCollection = function($DB_Name, $Col_Name) {
    return this.data[$DB_Name][$Col_Name] = [];
}
module.exports.DB.prototype.readCollection = function($DB_Name, $Col_Name) {
    return this.data[$DB_Name][$Col_Name];
}
module.exports.DB.prototype.writeData = function($DB_Name, $Col_Name, $data) {
    return this.data[$DB_Name][$Col_Name].push($data);
}
module.exports.DB.prototype.writeDataAt = function($DB_Name, $Col_Name, $Nth, $data) {
    return this.data[$DB_Name][$Col_Name][$Nth] = $data;
}
module.exports.DB.prototype.readData = function($DB_Name, $Col_Name, $Nth) {
    return this.data[$DB_Name][$Col_Name][$Nth];
}

module.exports.DB.prototype.find = async function($condition, callback) {
    var out = [];
    var DBs = this.data
    for(var i = 0; i < Object.keys(DBs).length; i++) {
        var COLs = this.data[Object.keys(this.data)[i]];
        for(var ii = 0; ii < Object.keys(COLs).length; ii++) {
            var datas = COLs[Object.keys(COLs)[ii]];
            for(var iii = 0; iii < datas.length; iii++) {
                var data = datas[iii];
                var config = {
                    "db": Object.keys(DBs)[i],
                    "collection": Object.keys(COLs)[ii],
                    "nth": iii,
                    "data": data
                };
                if($condition(this, config, out)) {
                    out.push(config);
                }
            }
        }
    }
}
module.exports.DB.prototype.save = async function(callback) {
    fs.writeFileSync(this.path, Buffer.from(encodeURIComponent(JSON.stringify(this.data)), "binary").toString("base64"), this.encoding);
    if(typeof(callback) == "function") {
        callback(this);
    }
    return this;
}

// 설정
module.exports.settings = {
    "path": "./database.KronDB",
    "encoding": "utf-8"
};
module.exports.setting = function($key, value) {
    if(key == undefined) {
        throw Error("DBMS: DBMS.setting(key, value): Please write key arg.");
    } else {
        if(value == undefined) {
            return module.exports.settings[$key];
        } else {
            return module.exports.settings[$key] = value;
        }
    }
};

// 데이터베이스 열기
module.exports.open = function(DB_Path, encoding) {
    var db = new module.exports.DB();
    if(DB_Path == undefined) {
        db.open(module.exports.settings.path, encoding);
    } else {
        db.open(DB_Path, encoding);
    }
    return db;
};
module.exports.write = function(DB_Path, encoding) {
    fs.writeFileSync(DB_Path == undefined ? module.exports.settings.path : DB_Path, "JTdCJTdE", encoding == undefined ? module.exports.settings.encoding : encoding);
    return function() {
        return module.exports.open(DB_Path, encoding);
    };
}
