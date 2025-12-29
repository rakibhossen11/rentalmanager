export function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

export function validatePassword(password) {
    return password.length >= 8;
}

export function validatePhone(phone) {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    return re.test(phone);
}

export function sanitizeInput(input) {
    if (typeof input === 'string') {
        return input.trim();
    }
    if (Array.isArray(input)) {
        return input.map(item => sanitizeInput(item));
    }
    if (typeof input === 'object' && input !== null) {
        const sanitized = {};
        for (const key in input) {
            if (Object.prototype.hasOwnProperty.call(input, key)) {
                sanitized[key] = sanitizeInput(input[key]);
            }
        }
        return sanitized;
    }
    return input;
}

export function validateTenantData(data) {
    const errors = [];
    
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters');
    }
    
    if (data.email && !validateEmail(data.email)) {
        errors.push('Invalid email format');
    }
    
    if (data.phone && !validatePhone(data.phone)) {
        errors.push('Invalid phone number');
    }
    
    if (data.rentAmount && (isNaN(data.rentAmount) || data.rentAmount < 0)) {
        errors.push('Rent amount must be a positive number');
    }
    
    if (data.rentDueDay && (data.rentDueDay < 1 || data.rentDueDay > 31)) {
        errors.push('Rent due day must be between 1 and 31');
    }
    
    return errors;
}