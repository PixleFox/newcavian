"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validatePhoneNumber = validatePhoneNumber;
exports.validateEmail = validateEmail;
function validatePhoneNumber(phone) {
    var regex = /^\+98[0-9]{10}$/;
    if (!regex.test(phone)) {
        throw new Error('Phone number must be in format +989123456789');
    }
}
function validateEmail(email) {
    if (!email)
        return;
    var regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!regex.test(email)) {
        throw new Error('Invalid email format');
    }
}
