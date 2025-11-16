/**
 * 增加数据
 * @param objName
 * @param objValue
 */
function addStorageData(objName, objValue) {
    // console.log("addStorageData", objName, objValue)
    localStorage.removeItem(objName);
    localStorage.setItem(objName, objValue);
}
/**
 * 获取数据
 * @param objName
 * @returns
 */
function getStorageVal(objName) {
    // console.log("getStorageVal", objName)
    return localStorage.getItem(objName);
}
/**
 * 去除重复元素
 * @param arr
 * @returns {Array}
 */
function unique(arr) {
    var result = [], hash = {};
    for (var i = 0, elem; (elem = arr[i]) != null; i++) {
        if (!hash[elem]) {
            result.push(elem);
            hash[elem] = true;
        }
    }
    return result;
}
/**
 * 删除数据
 * @param name
 */
function delStorageVal(name) {
    localStorage.removeItem(name);
}

module.exports = { addStorageData, getStorageVal, delStorageVal, unique }