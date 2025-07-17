export function isValidEmail(email) {
    // Expresión regular simple para validar emails
    const re = /^[^@]+@[^@]+\.[^@]+$/;
    if (!email || typeof email !== 'string' || !re.test(email)) {
        throw new Error('El mail es inválido');
    }
    return true;
}