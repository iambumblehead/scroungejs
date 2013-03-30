var PkTime = module.exports = (function () {

    if (typeof Date.now === 'undefined') {
        Date.now = function () {
            return (new Date()).getTime();
        };
    }

    return {
    
    };
}
