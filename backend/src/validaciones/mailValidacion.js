export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(email)) {
        return res.status(StatusCodes.BAD_REQUEST).json({
            success: false,
            message: 'El mail es inválido'
        });
    }
};


