const crypto = require('crypto');

class User {
    constructor(id, name, surname, email, type, password) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.type = type;
        this.password = password;
    }

    static storePassword(password) {
        let salt = crypto.randomBytes(16).toString('hex');
        let hashPassword = crypto.createHash("sha256").update(password, "utf8").update(salt, 'utf8').digest('hex');
        return `${salt}:${hashPassword}`;
    }

    verifyPassword(password) {
        let psw = this.password.split(':');
        let hashPassword = crypto.createHash("sha256").update(password, "utf8").update(psw[0], 'utf8').digest('hex');
        return hashPassword == psw[1];
    }
}


class UserTypes {
    static ADMINISTRATOR = 'administrator';
    static MANAGER = 'manager';
    static CLERK = 'clerk';
    static DELIVERY_EMPLOYEE = "deliveryEmployee";
    static QUALITY_CHECK_EMPLOYEE = "qualityEmployee";
    static INTERNAL_CUSTOMER = "customer";
    static SUPPLIER = "supplier";

    static isUserTypes = (userType) => {
        return userType == UserTypes.ADMINISTRATOR || userType == UserTypes.MANAGER ||
            userType == UserTypes.CLERK || userType == UserTypes.DELIVERY_EMPLOYEE ||
            userType == UserTypes.QUALITY_CHECK_EMPLOYEE || userType == UserTypes.INTERNAL_CUSTOMER ||
            userType == UserTypes.SUPPLIER;
    }
}

module.exports = { User, UserTypes };