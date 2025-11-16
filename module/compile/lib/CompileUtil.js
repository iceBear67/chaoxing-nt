// DB key generation disabled — return empty key to avoid encryption usage
function getDbKey(dbname) {
    return "";
}

module.exports = { getDbKey }