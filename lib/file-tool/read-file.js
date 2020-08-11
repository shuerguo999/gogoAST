const fs = require('fs')

//遍历文件夹，获取所有文件夹里面的文件信息
/*
 * @param path 路径
 *
 */

//遍历读取文件

module.exports = function geFileTree(path) {
    const root = [{
        name: path, 
        fullPath: path,
        children: [],
        parentPath: null
    }]
    const fileMap = {
        [path]: root[0]
    };
    readFile({ path, fileList: root[0].children, fileMap, targetObj: root[0], originPath: path });
    return { fileNameList: root, fileMap };
}
function readFile({ path, fileList, fileMap, targetObj, originPath }) {
    files = fs.readdirSync(path);//需要用到同步读取
    files.forEach(file => {
        states = fs.statSync(path + '/' + file);
        if (states.isDirectory()) {
            let item;
            if (targetObj["children"]) {
                item = { 
                    name: file, 
                    fullPath: path + '/' + file,
                    path: path.replace(originPath, '') + file ,
                    children: [],
                    parentPath: targetObj.fullPath
                };
                targetObj["children"].push(item);
            }
            else {
                item = { 
                    name: file, 
                    fullPath: path + '/' + file,
                    children: [],
                    path: path.replace(originPath, '') + file,
                    parentPath: targetObj.fullPath
                };
                fileList.push(item);
            }
            fileMap[item.fullPath] = item;
            readFile({ path: path + '/' + file, fileList,fileMap, targetObj: item, originPath});
        }
        else {
            //创建一个对象保存信息
            let item = {};
            // obj.size = states.size;//文件大小，以字节为单位
            item.name = file;//文件名
            item.fullPath = path + '/' + file; // 绝对路径
            item.path = path.replace(originPath + '/', '') + '/' + file; //文件相对路径
            item.parentPath = targetObj.fullPath;
            fileMap[item.fullPath] = item;
            if (targetObj["children"]) {
                targetObj["children"].push(item);
            }
            else {
                fileList.push(item);
            }
        }
    });
}